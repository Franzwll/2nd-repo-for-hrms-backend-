"""Deep quality report: run the pipeline over every resume under a folder
(recursively) and print per-file extraction quality signals so regressions
and improvements are easy to see.

Usage:
    python tools/quality_report.py --resumes-dir ../RESUME --out quality_before.json
"""
import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import pipeline  # noqa: E402

RESUME_EXTENSIONS = {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"}


def collect(root: Path, exclude_blurred: bool = False):
    files = sorted(p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in RESUME_EXTENSIONS)
    if exclude_blurred:
        files = [p for p in files if "blurred" not in p.name.lower()]
    return files


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--resumes-dir", required=True)
    parser.add_argument("--out", default=None)
    parser.add_argument("--exclude-blurred", action="store_true",
                        help="Skip files whose name contains 'blurred' (names/contacts are redacted there).")
    args = parser.parse_args()

    files = collect(Path(args.resumes_dir), args.exclude_blurred)
    rows = []
    for path in files:
        rel = str(path.relative_to(args.resumes_dir))
        t0 = time.time()
        try:
            result = pipeline.analyze_resume_file(path, path.name, None, [])
        except Exception as exc:
            result = {"success": False, "processing_status": "FAILED", "error": str(exc)}
        elapsed = round(time.time() - t0, 1)

        profile = result.get("profile") or {}
        personal = profile.get("personal_information") or {}
        val = result.get("validation") or {}
        row = {
            "file": rel,
            "status": result.get("processing_status"),
            "seconds": elapsed,
            "name": personal.get("name"),
            "email": personal.get("email"),
            "phone": personal.get("phone"),
            "address": personal.get("address"),
            "education_n": len(profile.get("education") or []),
            "skills_recognized": len(profile.get("skills") or []),
            "skills_unrecognized": len(profile.get("unrecognized_skills") or []),
            "certs": len(profile.get("certifications") or []),
            "roles_recognized": len((profile.get("job_roles") or {}).get("recognized") or []),
            "roles_unrecognized": len((profile.get("job_roles") or {}).get("unrecognized") or []),
            "years": profile.get("estimated_years_experience"),
            "work_history": len(profile.get("work_experience") or []),
            "missing": val.get("missing_information"),
            "invalid_format": val.get("invalid_format"),
            "sections": result.get("sections_detected"),
            "extract_method": (result.get("text_extraction") or {}).get("method"),
            "char_count": (result.get("text_extraction") or {}).get("character_count"),
            "warnings": [w[:80] for w in ((result.get("text_extraction") or {}).get("warnings") or [])],
        }
        if result.get("success") is False:
            row["error"] = result.get("error")
        rows.append(row)
        name_ok = "Y" if row["name"] else "-"
        email_ok = "Y" if row["email"] else "-"
        phone_ok = "Y" if row["phone"] else "-"
        addr_ok = "Y" if row["address"] else "-"
        edu_ok = "Y" if row["education_n"] else "-"
        exp_ok = "Y" if row["years"] else "-"
        print(
            f"[{row['status'][:4]}] {rel[:58]:<58} n={name_ok} e={email_ok} p={phone_ok} "
            f"a={addr_ok} ed={edu_ok}( {row['education_n']}) sk={row['skills_recognized']}/"
            f"{row['skills_recognized']+row['skills_unrecognized']} yr={row['years']} wh={row['work_history']}"
            f" ({elapsed}s)"
        )

    total = len(rows)
    def pct(pred): return round(100.0 * sum(1 for r in rows if pred(r)) / total, 1) if total else 0
    summary = {
        "total_files": total,
        "name_pct": pct(lambda r: r["name"]),
        "email_pct": pct(lambda r: r["email"]),
        "phone_pct": pct(lambda r: r["phone"]),
        "address_pct": pct(lambda r: r["address"]),
        "education_pct": pct(lambda r: r["education_n"]),
        "experience_pct": pct(lambda r: bool(r["years"])),
        "work_history_pct": pct(lambda r: r["work_history"]),
        "avg_skills_recognized": round(sum(r["skills_recognized"] for r in rows) / total, 2) if total else 0,
        "avg_skills_unrecognized": round(sum(r["skills_unrecognized"] for r in rows) / total, 2) if total else 0,
        "failed": [r["file"] for r in rows if r["status"] == "FAILED"],
    }
    print("\n=== QUALITY SUMMARY ===")
    print(json.dumps(summary, indent=2))

    if args.out:
        Path(args.out).write_text(
            json.dumps({"summary": summary, "rows": rows}, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(f"\nSaved: {args.out}")


if __name__ == "__main__":
    main()
