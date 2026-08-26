"""Comprehensive accuracy check comparing current pipeline extraction
against baseline for both PDF/DOCX structured files and all non-blurred files.
"""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import pipeline

RESUME_DIR = Path(__file__).resolve().parents[2] / "RESUME"


def evaluate_files(files):
    rows = []
    t0 = time.time()
    for idx, p in enumerate(files, 1):
        rel = str(p.relative_to(RESUME_DIR)) if RESUME_DIR in p.parents else p.name
        t_file = time.time()
        try:
            res = pipeline.analyze_resume_file(p, p.name, None, [])
            prof = res.get("profile", {})
            pi = prof.get("personal_information", {})
            val = res.get("validation", {})
            rows.append({
                "file": rel,
                "status": res.get("processing_status"),
                "name": pi.get("name"),
                "email": pi.get("email"),
                "phone": pi.get("phone"),
                "address": pi.get("address"),
                "education_n": len(prof.get("education", [])),
                "years": prof.get("estimated_years_experience"),
                "work_history": len(prof.get("work_experience", [])),
                "skills_rec": len(prof.get("skills", [])),
                "skills_unrec": len(prof.get("unrecognized_skills", [])),
                "missing": val.get("missing_information", []),
                "invalid": val.get("invalid_format", []),
                "method": (res.get("text_extraction") or {}).get("method"),
                "time": round(time.time() - t_file, 2),
            })
        except Exception as exc:
            rows.append({
                "file": rel,
                "status": "FAILED",
                "error": str(exc),
                "time": round(time.time() - t_file, 2),
            })
        sys.stdout.write(f"\r[{idx}/{len(files)}] Processed: {p.name[:40]:<40} ({rows[-1]['time']}s)")
        sys.stdout.flush()

    total_time = round(time.time() - t0, 1)
    print(f"\nCompleted in {total_time}s\n")
    return rows


def summarize(rows, label=""):
    total = len(rows)
    if not total:
        print(f"No rows for {label}")
        return {}

    def pct(field):
        ok = sum(1 for r in rows if r.get(field))
        return round(100.0 * ok / total, 1)

    res = {
        "total": total,
        "name": pct("name"),
        "email": pct("email"),
        "phone": pct("phone"),
        "address": pct("address"),
        "education": pct("education_n"),
        "years": pct("years"),
        "work_history": pct("work_history"),
        "avg_skills": round(sum(r.get("skills_rec", 0) for r in rows) / total, 2),
    }

    print(f"=== SUMMARY: {label} (N={total}) ===")
    print(f"{'Field':<16} {'Accuracy':<10}")
    print("-" * 28)
    print(f"{'Name':<16} {res['name']}%")
    print(f"{'Email':<16} {res['email']}%")
    print(f"{'Phone':<16} {res['phone']}%")
    print(f"{'Address':<16} {res['address']}%")
    print(f"{'Education':<16} {res['education']}%")
    print(f"{'Years Exp':<16} {res['years']}%")
    print(f"{'Work History':<16} {res['work_history']}%")
    print(f"{'Avg Rec Skills':<16} {res['avg_skills']}")
    print("-" * 28)
    return res


def main():
    exclude_images = "--no-images" in sys.argv
    all_files = sorted(
        p for p in RESUME_DIR.rglob("*")
        if p.is_file() and p.suffix.lower() in {".pdf", ".docx", ".png", ".jpg", ".jpeg"}
        and "blurred" not in p.name.lower()
    )
    if exclude_images:
        target_files = [p for p in all_files if p.suffix.lower() in {".pdf", ".docx"}]
        label = "PDF & DOCX Resumes (Non-blurred)"
    else:
        target_files = all_files
        label = "All Non-blurred Resumes (PDF, DOCX, JPG, PNG)"

    print(f"Target resumes: {len(target_files)} files from {RESUME_DIR}")
    rows = evaluate_files(target_files)
    summary = summarize(rows, label)

    out_file = Path("quality_after.json")
    out_file.write_text(json.dumps({"summary": summary, "rows": rows}, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved results to {out_file.resolve()}")


if __name__ == "__main__":
    main()
