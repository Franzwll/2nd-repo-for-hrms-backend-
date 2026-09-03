"""Generates real sample resume files (PDF, DOCX, TXT) for API testing."""
from pathlib import Path

OUT = Path(__file__).parent / "sample_resumes"
OUT.mkdir(exist_ok=True)

RESUME_TEXT = """MARIA SANTOS
Email: maria.santos@email.com | Phone: 0917 555 1234

PROFESSIONAL SUMMARY
Bartender with 4 years of lounge experience and TESDA certification.

WORK EXPERIENCE
Bartender - Sky Lounge BGC | Mar 2021 - Present
Prepare cocktails to standard, maintain bar inventory control.
Engage guests with responsible alcohol service.

SKILLS
Mixology, Inventory Control, Guest Relations, Cash Handling

EDUCATION
Vocational / TESDA Bartending Course, 2019

CERTIFICATIONS
TESDA Bartending NC II
"""

DOCX_TEXT = """CARLO REYES
Email: carlo.reyes@email.com | Phone: +63 918 222 3344

SUMMARY
Restaurant server with 2 years fine dining service.

WORK EXPERIENCE
Restaurant Server - Bistro Manila | Jan 2023 - Present
Table service, POS systems billing, upselling specials.

SKILLS
Table Service, POS Systems, Upselling, Communication

EDUCATION
HRM Vocational Course, 2021
"""


def make_pdf(path: Path):
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    c = canvas.Canvas(str(path), pagesize=letter)
    width, height = letter
    y = height - 50
    for line in RESUME_TEXT.split("\n"):
        c.drawString(50, y, line)
        y -= 16
    c.save()


def make_docx(path: Path):
    import docx

    d = docx.Document()
    for line in DOCX_TEXT.split("\n"):
        d.add_paragraph(line)
    d.save(str(path))


def make_txt(path: Path, text: str):
    path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    make_pdf(OUT / "bartender_resume.pdf")
    make_docx(OUT / "server_resume.docx")
    make_txt(OUT / "barista_resume.txt", """
LILY MENDOZA
lily.mendoza@email.com / 0908 777 6655

PROFILE
Barista with 2 years cafe experience.

WORK EXPERIENCE
Barista - Coffee Corner Cafe | Feb 2022 - Present
Coffee preparation, latte art, POS systems.

SKILLS
Customer Service, Coffee Preparation, POS Systems, Cash Handling

EDUCATION
High School Graduate, 2019
""")
    print("Samples written to", OUT)
