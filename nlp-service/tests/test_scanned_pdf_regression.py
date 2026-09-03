"""Regression test: scanned PDF with styled header banner (Julian Rivera).

The header (name + white-on-green contact block) was invisible to full-page
OCR layout analysis. The extraction must now recover name, email and phone.
Run:  python tests/test_scanned_pdf_regression.py
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import text_extraction

RESUME_DIR = Path(__file__).resolve().parents[2] / "RESUME"
pdf_path = next(RESUME_DIR.glob("Julian*.pdf"), None)
if pdf_path is None:
    print("SKIP: Julian Rivera sample PDF not found in ../RESUME")
    sys.exit(0)

result = text_extraction.extract_pdf(pdf_path)
text = result["text"]

checks = {
    "method is pdf-ocr": result["method"].startswith("pdf-ocr"),
    "name recovered": bool(re.search(r"Julian\s+Rivera", text)),
    "email recovered": "julian.rivera@email.com" in text,
    "phone recovered": "342-8891" in text,
    "address recovered": "Brickell Ave" in text,
    "body text recovered": "Ritz-Carlton" in text,
}

failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(("PASS" if ok else "FAIL"), "-", name)

if failed:
    print("\nFAILED:", failed)
    sys.exit(1)
print("\nALL PASS")
