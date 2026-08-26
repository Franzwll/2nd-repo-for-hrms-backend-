"""Batch experiment runner for the research SOPs (data-collection accelerator).

Runs every resume in a folder through the full spaCy screening pipeline
(model loads once) and produces:

1. per_resume/*.json          - full pipeline result per resume
2. sop1_summary.json          - SOP 1 tracking: totals per processing status,
                                overall + per-format success rate using the
                                documented success definition
3. ground_truth_template.csv  - one row per resume for expert annotation;
                                fill it in, then record each row via
                                POST /api/v1/applicants/{id}/ground-truth
                                (after the resumes are uploaded as applicants)
                                so SOP 2/3/5 metrics can be computed by the
                                /evaluation/* endpoints.

NOTHING is fabricated here: all figures are computed from the actual resume
files you provide. The tool never invents ground truth.

Usage:
    python tools/batch_evaluate.py --resumes-dir ../RESUME
    python tools/batch_evaluate.py --resumes-dir ./samples --jobs my_jobs.json

my_jobs.json maps resume filename (or "*") to a requirements object:
    {"*": {"title": "Bartender", "required_skills": ["Mixology"],
           "education_level": null, "experience_level": null,
           "required_certifications": [], "required_information":
           ["name", "email", "phone"]}}
"""
import argparse
import csv
import json
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import pipeline  # noqa: E402

RESUME_EXTENSIONS = {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"}
SUCCESS_STATUSES = {"PROCESSED", "PARTIALLY_PROCESSED"}

GROUND_TRUTH_COLUMNS = [
    "resume_file",
    "applicant_id_after_upload",
    "true_screening_result",
    "true_qualification_score",
    "true_missing_information",
    "true_unrecognized_skills",
    "notes",
]


def load_jobs(path: Path | None) -> dict:
    if not path:
        return {}
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if not isinstance(data, dict):
        raise SystemExit("--jobs must be a JSON object mapping filename-or-* to requirements")
    return data


def requirements_for(filename: str, jobs: dict) -> dict | None:
    if not jobs:
        return None
    if filename in jobs:
        return jobs[filename]
    return jobs.get("*")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--resumes-dir", required=True, help="Folder containing resume files")
    parser.add_argument("--jobs", help="Optional JSON mapping filename-or-* to role requirements")
    parser.add_argument(
        "--out",
        default="evaluation_output",
        help="Output directory (default: ./evaluation_output)",
    )
    args = parser.parse_args()

    resumes_dir = Path(args.resumes_dir)
    if not resumes_dir.is_dir():
        raise SystemExit(f"Resumes folder not found: {resumes_dir}")

    files = sorted(
        p for p in resumes_dir.iterdir()
        if p.is_file() and p.suffix.lower() in RESUME_EXTENSIONS
    )
    if not files:
        raise SystemExit(f"No resume files ({', '.join(sorted(RESUME_EXTENSIONS))}) in {resumes_dir}")

    out_dir = Path(args.out)
    per_resume_dir = out_dir / "per_resume"
    per_resume_dir.mkdir(parents=True, exist_ok=True)

    jobs = load_jobs(Path(args.jobs) if args.jobs else None)

    print(f"Processing {len(files)} resume(s) from {resumes_dir} ...")
    status_counter: Counter = Counter()
    by_format: dict = defaultdict(Counter)
    failures: list = []
    started = time.time()

    for path in files:
        reqs = requirements_for(path.name, jobs)
        result = pipeline.analyze_resume_file(path, path.name, reqs, [])
        status = result.get("processing_status", "FAILED")
        status_counter[status] += 1
        fmt = path.suffix.lower().lstrip(".")
        by_format[fmt][status] += 1
        if status == "FAILED":
            failures.append({"file": path.name, "error": result.get("error")})

        payload = {
            "resume_file": path.name,
            "requirements_applied": bool(reqs),
            "result": result,
        }
        (per_resume_dir / f"{path.stem}.json").write_text(
            json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        marker = "." if status != "FAILED" else "F"
        print(f"  [{marker}] {path.name} -> {status}"
              + (f" ({result.get('match_score')}% {result.get('screening_status')})" if reqs else ""))

    total = len(files)
    parsed_ok = sum(n for s, n in status_counter.items() if s in SUCCESS_STATUSES)

    summary = {
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "resumes_dir": str(resumes_dir),
        "role_requirements_applied": bool(jobs),
        "total_resumes": total,
        "processing_status_counts": dict(status_counter),
        "success_definition": (
            "A resume counts as successfully parsed and standardized when its "
            "processing status is PROCESSED or PARTIALLY_PROCESSED (text was "
            "extracted, no system failure occurred, and a standardized profile "
            "was generated). FAILED resumes are excluded."
        ),
        "sop1_success_rate_percent": round(parsed_ok / total * 100, 2) if total else 0,
        "successfully_parsed": parsed_ok,
        "by_format": {fmt: dict(counter) for fmt, counter in sorted(by_format.items())},
        "failures": failures,
        "elapsed_seconds": round(time.time() - started, 1),
    }
    (out_dir / "sop1_summary.json").write_text(
        json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    gt_path = out_dir / "ground_truth_template.csv"
    template_exists = gt_path.exists()
    with open(gt_path, "a", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        if not template_exists:
            writer.writerow(GROUND_TRUTH_COLUMNS)
        for path in files:
            writer.writerow([path.name] + [""] * (len(GROUND_TRUTH_COLUMNS) - 1))

    print("\n=== SOP 1 SUMMARY ===")
    print(json.dumps({k: v for k, v in summary.items() if k != "failures"}, indent=2))
    if failures:
        print("Failures:")
        for f in failures:
            print(f"  - {f['file']}: {f['error']}")

    print(f"\nPer-resume results : {per_resume_dir}")
    print(f"SOP 1 summary      : {out_dir / 'sop1_summary.json'}")
    print(f"Ground-truth sheet : {gt_path} (fill true_* columns for SOP 2/3/5)")
    print(
        "\nNext steps (see docs/FEATURE_DOCUMENTATION.md section 20):\n"
        "  1. Upload each resume as an applicant via the UI or POST /applicants.\n"
        "  2. Fill the template's true_screening_result / true_qualification_score /\n"
        "     true_missing_information / true_unrecognized_skills columns.\n"
        "  3. Record each row via POST /api/v1/applicants/{id}/ground-truth.\n"
        "  4. Read final figures from /evaluation/sop2-detection,\n"
        "     /evaluation/sop3-screening-metrics and /evaluation/sop5-score-alignment."
    )


if __name__ == "__main__":
    main()
