import os
import sys
import math
import random
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageFont
import pymupdf
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# -------------------------------------------------------------
# Font Registration
# -------------------------------------------------------------
font_map = {
    'Arial': 'C:\\Windows\\Fonts\\arial.ttf',
    'Arial-Bold': 'C:\\Windows\\Fonts\\arialbd.ttf',
    'Arial-Italic': 'C:\\Windows\\Fonts\\ariali.ttf',
    'Calibri': 'C:\\Windows\\Fonts\\calibri.ttf',
    'Calibri-Bold': 'C:\\Windows\\Fonts\\calibrib.ttf',
    'Calibri-Italic': 'C:\\Windows\\Fonts\\calibrii.ttf',
    'Georgia': 'C:\\Windows\\Fonts\\georgia.ttf',
    'Georgia-Bold': 'C:\\Windows\\Fonts\\georgiab.ttf',
    'Georgia-Italic': 'C:\\Windows\\Fonts\\georgiai.ttf',
    'SegoeUI': 'C:\\Windows\\Fonts\\segoeui.ttf',
    'SegoeUI-Bold': 'C:\\Windows\\Fonts\\segoeuib.ttf',
    'SegoeUI-Italic': 'C:\\Windows\\Fonts\\segoeuii.ttf',
    'Times': 'C:\\Windows\\Fonts\\times.ttf',
    'Times-Bold': 'C:\\Windows\\Fonts\\timesbd.ttf',
    'Times-Italic': 'C:\\Windows\\Fonts\\timesi.ttf'
}

for fname, fpath in font_map.items():
    if os.path.exists(fpath):
        try:
            pdfmetrics.registerFont(TTFont(fname, fpath))
        except Exception:
            pass

F_SANS = 'SegoeUI' if 'SegoeUI' in pdfmetrics.getRegisteredFontNames() else ('Arial' if 'Arial' in pdfmetrics.getRegisteredFontNames() else 'Helvetica')
F_SANS_BOLD = 'SegoeUI-Bold' if 'SegoeUI-Bold' in pdfmetrics.getRegisteredFontNames() else ('Arial-Bold' if 'Arial-Bold' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold')
F_SANS_ITALIC = 'SegoeUI-Italic' if 'SegoeUI-Italic' in pdfmetrics.getRegisteredFontNames() else ('Arial-Italic' if 'Arial-Italic' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Oblique')

F_SERIF = 'Georgia' if 'Georgia' in pdfmetrics.getRegisteredFontNames() else ('Times' if 'Times' in pdfmetrics.getRegisteredFontNames() else 'Times-Roman')
F_SERIF_BOLD = 'Georgia-Bold' if 'Georgia-Bold' in pdfmetrics.getRegisteredFontNames() else ('Times-Bold' if 'Times-Bold' in pdfmetrics.getRegisteredFontNames() else 'Times-Bold')
F_SERIF_ITALIC = 'Georgia-Italic' if 'Georgia-Italic' in pdfmetrics.getRegisteredFontNames() else ('Times-Italic' if 'Times-Italic' in pdfmetrics.getRegisteredFontNames() else 'Times-Italic')

F_CALIBRI = 'Calibri' if 'Calibri' in pdfmetrics.getRegisteredFontNames() else F_SANS
F_CALIBRI_BOLD = 'Calibri-Bold' if 'Calibri-Bold' in pdfmetrics.getRegisteredFontNames() else F_SANS_BOLD

F_ARIAL = 'Arial' if 'Arial' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
F_ARIAL_BOLD = 'Arial-Bold' if 'Arial-Bold' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold'

# -------------------------------------------------------------
# Candidate Master Profile
# -------------------------------------------------------------
CANDIDATE = {
    "name": "Marcus Elijah Navarro",
    "target_position": "Banquet Operations Supervisor",
    "phone": "+63 917 552 8491",
    "email": "marcus.navarro.hospitality@outlook.ph",
    "address": "Domestic Road, Pasay City, 1301 Metro Manila, Philippines",
    "linkedin": "linkedin.com/in/marcus-navarro-hospitality",
    "summary": (
        "Dedicated, results-driven Banquet Operations Supervisor with over 5 years of progressive "
        "hospitality leadership experience in luxury hotel convention centers and high-volume event venues. "
        "Proven expertise in Banquet Event Order (BEO) execution, floor logistics, VIP service protocols, "
        "team scheduling, and HACCP food safety standards. Adept at coordinating functions of up to 600 guests "
        "while ensuring seamless service delivery, minimal equipment breakage, and exceptional guest satisfaction."
    ),
    "skills": [
        "Banquet Event Order (BEO) Floor Planning & Execution",
        "Function Room Turnover & Service Floor Logistics",
        "Staff Scheduling, Pre-Shift Briefings & Crew Leadership (up to 25 staff)",
        "Formal Plated Service, Buffet Management & Banquet Bar Protocols",
        "VIP Guest Relations & Protocol Handling",
        "Breakage Mitigation & Chinaware/Glassware/Silverware (CGS) Par Levels",
        "Food Safety, Sanitation, and HACCP Compliance",
        "Banquet Billing, Beverage Requisition & Cost Control"
    ],
    "experience": [
        {
            "company": "Grand Crest Hotel & Suites",
            "location": "Pasay City, Metro Manila",
            "position": "Banquet Operations Supervisor",
            "duration": "June 2022 – Present",
            "bullets": [
                "Supervise banquet operations for 3 grand ballrooms and 5 multi-function rooms catering up to 600 attendees per event.",
                "Direct pre-shift briefings and manage a team of 18 full-time banquet servers, captains, and on-call catering staff.",
                "Coordinate directly with culinary and sales teams to review BEO specifications, ensuring 99% on-time food rollout.",
                "Reduced banquet equipment loss and chinaware breakage by 18% through standardized end-of-shift inventory protocols."
            ]
        },
        {
            "company": "Harborview Hotel & Convention Center",
            "location": "Manila Bay, Manila",
            "position": "Banquet Team Leader / Captain",
            "duration": "January 2020 – May 2022",
            "bullets": [
                "Led floor teams of 12 banquet attendants during corporate conventions, diplomatic receptions, and wedding galas.",
                "Oversaw banquet table layouts, buffet staging, and silver service standards in compliance with luxury hotel guidelines.",
                "Conducted daily equipment inspections and enforced food temperature logs in coordination with kitchen quality control."
            ]
        },
        {
            "company": "Bayfront Pavilion & Catering Services",
            "location": "Parañaque City, Metro Manila",
            "position": "Banquet Server / Function Attendant",
            "duration": "July 2018 – December 2019",
            "bullets": [
                "Delivered plated dinner service, replenished buffet lines, and executed room turnarounds for corporate and private events.",
                "Maintained high standards of table grooming, glassware polishing, and rapid function hall clearing."
            ]
        }
    ],
    "education": {
        "degree": "Bachelor of Science in Hospitality Management",
        "institution": "Pamantasan ng Lungsod ng Maynila (PLM) — Intramuros, Manila",
        "year": "2018"
    },
    "certifications": [
        {
            "title": "Certified Hospitality Supervisor (CHS)",
            "issuer": "Hospitality Operations Institute / FHCB",
            "date": "November 2021"
        },
        {
            "title": "Food Safety & Sanitation Standards (HACCP Level 2)",
            "issuer": "Hospitality Training Council of the Philippines",
            "date": "August 2022"
        },
        {
            "title": "Customer Service Excellence in Banquets and Events",
            "issuer": "Philippine Hospitality Development Center",
            "date": "March 2020"
        }
    ]
}

OUTPUT_DIR = os.path.join(
    r"c:\Users\PC\Downloads\Ferdi\4TH_YR\DEV\v11.1\2nd-repo-for-hrms-backend-",
    "Hotel_Restaurant_Hospitality_Verification_Dataset_Single",
    "Marcus Elijah Navarro - Hospitality Resume and Documents"
)
os.makedirs(OUTPUT_DIR, exist_ok=True)


# =============================================================
# 1. RESUME TEMPLATE 1: Modern Executive Two-Column Layout (PDF)
# =============================================================
def build_resume_template1(output_pdf):
    c = canvas.Canvas(output_pdf, pagesize=letter)
    width, height = letter # 612 x 792

    # Draw Navy Left Sidebar
    sidebar_w = 205
    c.setFillColor(colors.HexColor("#1A2B4C"))
    c.rect(0, 0, sidebar_w, height, stroke=0, fill=1)

    # Accent decorative bar
    c.setFillColor(colors.HexColor("#38BDF8"))
    c.rect(sidebar_w - 4, 0, 4, height, stroke=0, fill=1)

    # Left Column Content
    # Header in sidebar
    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 15)
    c.drawString(20, height - 50, "MARCUS ELIJAH")
    c.drawString(20, height - 68, "NAVARRO")

    c.setFillColor(colors.HexColor("#38BDF8"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(20, height - 88, "BANQUET OPERATIONS SUPERVISOR")

    # Divider in sidebar
    c.setStrokeColor(colors.HexColor("#2C426E"))
    c.setLineWidth(1)
    c.line(20, height - 100, sidebar_w - 20, height - 100)

    # Contact Section
    curr_y = height - 120
    c.setFillColor(colors.HexColor("#93C5FD"))
    c.setFont(F_SANS_BOLD, 9)
    c.drawString(20, curr_y, "CONTACT DETAILS")
    curr_y -= 8
    c.setStrokeColor(colors.HexColor("#38BDF8"))
    c.line(20, curr_y, 70, curr_y)
    curr_y -= 14

    contact_items = [
        ("PHONE", CANDIDATE["phone"]),
        ("EMAIL", CANDIDATE["email"]),
        ("LOCATION", "Domestic Road, Pasay City,"),
        ("", "1301 Metro Manila, Philippines"),
        ("LINKEDIN", CANDIDATE["linkedin"])
    ]

    for label, val in contact_items:
        if label:
            c.setFont(F_SANS_BOLD, 7)
            c.setFillColor(colors.HexColor("#60A5FA"))
            c.drawString(20, curr_y, label)
            curr_y -= 10
        c.setFont(F_SANS, 7.5)
        c.setFillColor(colors.white)
        c.drawString(20, curr_y, val)
        curr_y -= 12

    curr_y -= 10
    # Education Section
    c.setFillColor(colors.HexColor("#93C5FD"))
    c.setFont(F_SANS_BOLD, 9)
    c.drawString(20, curr_y, "EDUCATION")
    curr_y -= 8
    c.setStrokeColor(colors.HexColor("#38BDF8"))
    c.line(20, curr_y, 70, curr_y)
    curr_y -= 14

    c.setFont(F_SANS_BOLD, 8)
    c.setFillColor(colors.white)
    c.drawString(20, curr_y, "Bachelor of Science in")
    curr_y -= 10
    c.drawString(20, curr_y, "Hospitality Management")
    curr_y -= 12

    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawString(20, curr_y, "Pamantasan ng Lungsod ng Maynila")
    curr_y -= 10
    c.drawString(20, curr_y, "(PLM) — Intramuros, Manila")
    curr_y -= 10
    c.setFont(F_SANS_BOLD, 7.5)
    c.setFillColor(colors.HexColor("#38BDF8"))
    c.drawString(20, curr_y, "Graduated: 2018")
    curr_y -= 22

    # Certifications Section
    c.setFillColor(colors.HexColor("#93C5FD"))
    c.setFont(F_SANS_BOLD, 9)
    c.drawString(20, curr_y, "CERTIFICATIONS")
    curr_y -= 8
    c.setStrokeColor(colors.HexColor("#38BDF8"))
    c.line(20, curr_y, 70, curr_y)
    curr_y -= 14

    for cert in CANDIDATE["certifications"]:
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.white)
        # Wrap title if long
        title = cert["title"]
        if len(title) > 28:
            parts = title.split("(")
            c.drawString(20, curr_y, parts[0].strip())
            curr_y -= 9
            if len(parts) > 1:
                c.drawString(20, curr_y, "(" + parts[1])
                curr_y -= 9
        else:
            c.drawString(20, curr_y, title)
            curr_y -= 9
        c.setFont(F_SANS, 7)
        c.setFillColor(colors.HexColor("#CBD5E1"))
        issuer_str = cert["issuer"]
        if len(issuer_str) > 28:
            c.drawString(20, curr_y, issuer_str[:28])
            curr_y -= 9
            c.drawString(20, curr_y, issuer_str[28:].strip())
            curr_y -= 9
        else:
            c.drawString(20, curr_y, issuer_str)
            curr_y -= 9
        c.setFont(F_SANS_ITALIC, 7)
        c.setFillColor(colors.HexColor("#38BDF8"))
        c.drawString(20, curr_y, cert["date"])
        curr_y -= 13

    # Right Column Content
    right_x = 225
    right_w = width - right_x - 25 # 362 pt
    r_y = height - 50

    # Section Helper
    def draw_heading(title, y_pos):
        c.setFillColor(colors.HexColor("#1A2B4C"))
        c.setFont(F_SANS_BOLD, 10.5)
        c.drawString(right_x, y_pos, title)
        c.setStrokeColor(colors.HexColor("#CBD5E1"))
        c.setLineWidth(0.8)
        c.line(right_x, y_pos - 4, width - 25, y_pos - 4)
        c.setStrokeColor(colors.HexColor("#1A2B4C"))
        c.setLineWidth(2)
        c.line(right_x, y_pos - 4, right_x + 40, y_pos - 4)
        return y_pos - 18

    # Professional Summary
    r_y = draw_heading("PROFESSIONAL SUMMARY", r_y)
    
    # Text wrapping helper
    def draw_wrapped(text, x, y, max_w, font_n, font_s, color_v, line_h):
        c.setFont(font_n, font_s)
        c.setFillColor(color_v)
        words = text.split(' ')
        line = ""
        for word in words:
            test = line + " " + word if line else word
            if c.stringWidth(test, font_n, font_s) < max_w:
                line = test
            else:
                c.drawString(x, y, line)
                y -= line_h
                line = word
        if line:
            c.drawString(x, y, line)
            y -= line_h
        return y

    r_y = draw_wrapped(CANDIDATE["summary"], right_x, r_y, right_w, F_SANS, 8, colors.HexColor("#334155"), 11.5)
    r_y -= 6

    # Core Competencies & Skills
    r_y = draw_heading("CORE COMPETENCIES & SKILLS", r_y)
    half_w = (right_w - 10) / 2
    skills = CANDIDATE["skills"]
    col1 = skills[:4]
    col2 = skills[4:]

    start_skill_y = r_y
    for item in col1:
        c.setFillColor(colors.HexColor("#2563EB"))
        c.circle(right_x + 4, r_y - 3, 2, stroke=0, fill=1)
        r_y = draw_wrapped(item, right_x + 12, r_y, half_w - 15, F_SANS, 7.5, colors.HexColor("#1E293B"), 10)
        r_y -= 2
    bot1 = r_y

    r_y2 = start_skill_y
    for item in col2:
        c.setFillColor(colors.HexColor("#2563EB"))
        c.circle(right_x + half_w + 4, r_y2 - 3, 2, stroke=0, fill=1)
        r_y2 = draw_wrapped(item, right_x + half_w + 12, r_y2, half_w - 15, F_SANS, 7.5, colors.HexColor("#1E293B"), 10)
        r_y2 -= 2
    bot2 = r_y2

    r_y = min(bot1, bot2) - 8

    # Professional Experience
    r_y = draw_heading("WORK EXPERIENCE", r_y)

    for exp in CANDIDATE["experience"]:
        # Company & Dates
        c.setFont(F_SANS_BOLD, 9)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(right_x, r_y, exp["company"])

        c.setFont(F_SANS_BOLD, 8)
        c.setFillColor(colors.HexColor("#2563EB"))
        d_w = c.stringWidth(exp["duration"], F_SANS_BOLD, 8)
        c.drawString(width - 25 - d_w, r_y, exp["duration"])
        r_y -= 11

        # Position & Location
        c.setFont(F_SANS_BOLD, 8)
        c.setFillColor(colors.HexColor("#334155"))
        c.drawString(right_x, r_y, exp["position"])

        c.setFont(F_SANS_ITALIC, 7.5)
        c.setFillColor(colors.HexColor("#64748B"))
        loc_w = c.stringWidth(exp["location"], F_SANS_ITALIC, 7.5)
        c.drawString(width - 25 - loc_w, r_y, exp["location"])
        r_y -= 11

        # Bullets
        for b in exp["bullets"]:
            c.setFillColor(colors.HexColor("#64748B"))
            c.circle(right_x + 5, r_y - 2.5, 1.5, stroke=0, fill=1)
            r_y = draw_wrapped(b, right_x + 13, r_y, right_w - 15, F_SANS, 7.5, colors.HexColor("#334155"), 10)
            r_y -= 2
        r_y -= 6

    c.save()
    print(f"Generated: {output_pdf}")


# =============================================================
# 2. RESUME TEMPLATE 2: Corporate Single-Column Traditional (DOCX)
# =============================================================
def build_resume_template2(output_docx):
    doc = docx.Document()

    # Margins: 0.65 inch
    for sec in doc.sections:
        sec.top_margin = Inches(0.65)
        sec.bottom_margin = Inches(0.65)
        sec.left_margin = Inches(0.75)
        sec.right_margin = Inches(0.75)

    # Style definitions
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Georgia'
    normal_style.font.size = Pt(9.5)
    normal_style.font.color.rgb = RGBColor(0x22, 0x22, 0x22)

    # Header - Centered
    p_name = doc.add_paragraph()
    p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_name.paragraph_format.space_after = Pt(2)
    p_name.paragraph_format.space_before = Pt(0)
    run_name = p_name.add_run(CANDIDATE["name"].upper())
    run_name.font.name = 'Georgia'
    run_name.font.size = Pt(17)
    run_name.font.bold = True
    run_name.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)

    p_pos = doc.add_paragraph()
    p_pos.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_pos.paragraph_format.space_after = Pt(4)
    run_pos = p_pos.add_run(CANDIDATE["target_position"])
    run_pos.font.name = 'Georgia'
    run_pos.font.size = Pt(11)
    run_pos.font.bold = True
    run_pos.font.italic = True
    run_pos.font.color.rgb = RGBColor(0x4A, 0x55, 0x68)

    p_contact = doc.add_paragraph()
    p_contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_contact.paragraph_format.space_after = Pt(8)
    run_c = p_contact.add_run(
        f"{CANDIDATE['address']}  •  {CANDIDATE['phone']}\n"
        f"{CANDIDATE['email']}  •  {CANDIDATE['linkedin']}"
    )
    run_c.font.name = 'Georgia'
    run_c.font.size = Pt(8.5)
    run_c.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

    # Helper for Section Dividers
    def add_section_header(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(title.upper())
        run.font.name = 'Georgia'
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)

        # Bottom border for paragraph in XML
        pPr = p._p.get_or_add_pPr()
        pBdr = parse_xml(r'<w:pBdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
                         r'<w:bottom w:val="single" w:sz="8" w:space="2" w:color="1B365D"/>'
                         r'</w:pBdr>')
        pPr.append(pBdr)

    # 1. Professional Summary
    add_section_header("Professional Summary")
    p_sum = doc.add_paragraph()
    p_sum.paragraph_format.space_after = Pt(6)
    p_sum.paragraph_format.line_spacing = 1.15
    run_s = p_sum.add_run(CANDIDATE["summary"])
    run_s.font.name = 'Georgia'
    run_s.font.size = Pt(9)

    # 2. Core Competencies & Skills
    add_section_header("Core Competencies & Skills")
    table = doc.add_table(rows=4, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # set col widths
    for row in table.rows:
        row.cells[0].width = Inches(3.5)
        row.cells[1].width = Inches(3.5)

    skills = CANDIDATE["skills"]
    for idx in range(4):
        # Left
        cell_l = table.rows[idx].cells[0]
        p_l = cell_l.paragraphs[0]
        p_l.paragraph_format.space_after = Pt(2)
        p_l.paragraph_format.space_before = Pt(0)
        r_l = p_l.add_run(f"•  {skills[idx]}")
        r_l.font.name = 'Georgia'
        r_l.font.size = Pt(8.5)

        # Right
        cell_r = table.rows[idx].cells[1]
        p_r = cell_r.paragraphs[0]
        p_r.paragraph_format.space_after = Pt(2)
        p_r.paragraph_format.space_before = Pt(0)
        r_r = p_r.add_run(f"•  {skills[idx+4]}")
        r_r.font.name = 'Georgia'
        r_r.font.size = Pt(8.5)

    # 3. Professional Experience
    add_section_header("Work Experience")
    for exp in CANDIDATE["experience"]:
        # Company, Location, Position, Dates in a 1-row 2-col borderless table
        t_exp = doc.add_table(rows=2, cols=2)
        t_exp.alignment = WD_TABLE_ALIGNMENT.CENTER
        t_exp.rows[0].cells[0].width = Inches(4.8)
        t_exp.rows[0].cells[1].width = Inches(2.2)
        t_exp.rows[1].cells[0].width = Inches(4.8)
        t_exp.rows[1].cells[1].width = Inches(2.2)

        p_co = t_exp.rows[0].cells[0].paragraphs[0]
        p_co.paragraph_format.space_after = Pt(0)
        p_co.paragraph_format.space_before = Pt(4)
        r_co = p_co.add_run(exp["company"])
        r_co.font.name = 'Georgia'
        r_co.font.size = Pt(9.5)
        r_co.font.bold = True
        r_co.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)

        p_dur = t_exp.rows[0].cells[1].paragraphs[0]
        p_dur.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_dur.paragraph_format.space_after = Pt(0)
        p_dur.paragraph_format.space_before = Pt(4)
        r_dur = p_dur.add_run(exp["duration"])
        r_dur.font.name = 'Georgia'
        r_dur.font.size = Pt(9)
        r_dur.font.bold = True
        r_dur.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)

        p_ro = t_exp.rows[1].cells[0].paragraphs[0]
        p_ro.paragraph_format.space_after = Pt(2)
        p_ro.paragraph_format.space_before = Pt(0)
        r_ro = p_ro.add_run(exp["position"])
        r_ro.font.name = 'Georgia'
        r_ro.font.size = Pt(9)
        r_ro.font.italic = True
        r_ro.font.color.rgb = RGBColor(0x33, 0x33, 0x33)

        p_lo = t_exp.rows[1].cells[1].paragraphs[0]
        p_lo.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_lo.paragraph_format.space_after = Pt(2)
        p_lo.paragraph_format.space_before = Pt(0)
        r_lo = p_lo.add_run(exp["location"])
        r_lo.font.name = 'Georgia'
        r_lo.font.size = Pt(8.5)
        r_lo.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

        # Bullets
        for b in exp["bullets"]:
            p_b = doc.add_paragraph(style='List Bullet')
            p_b.paragraph_format.space_before = Pt(0)
            p_b.paragraph_format.space_after = Pt(1.5)
            p_b.paragraph_format.line_spacing = 1.1
            r_b = p_b.add_run(b)
            r_b.font.name = 'Georgia'
            r_b.font.size = Pt(8.5)

    # 4. Education
    add_section_header("Education")
    t_edu = doc.add_table(rows=1, cols=2)
    t_edu.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_edu.rows[0].cells[0].width = Inches(5.5)
    t_edu.rows[0].cells[1].width = Inches(1.5)

    p_ed1 = t_edu.rows[0].cells[0].paragraphs[0]
    p_ed1.paragraph_format.space_after = Pt(2)
    p_ed1.paragraph_format.space_before = Pt(2)
    r_deg = p_ed1.add_run(f"{CANDIDATE['education']['degree']}\n")
    r_deg.font.name = 'Georgia'
    r_deg.font.size = Pt(9)
    r_deg.font.bold = True
    r_inst = p_ed1.add_run(CANDIDATE['education']['institution'])
    r_inst.font.name = 'Georgia'
    r_inst.font.size = Pt(8.5)
    r_inst.font.color.rgb = RGBColor(0x44, 0x44, 0x44)

    p_ed2 = t_edu.rows[0].cells[1].paragraphs[0]
    p_ed2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_ed2.paragraph_format.space_after = Pt(2)
    p_ed2.paragraph_format.space_before = Pt(2)
    r_yr = p_ed2.add_run(f"Year: {CANDIDATE['education']['year']}")
    r_yr.font.name = 'Georgia'
    r_yr.font.size = Pt(9)
    r_yr.font.bold = True
    r_yr.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)

    # 5. Training & Certifications
    add_section_header("Training & Certifications")
    for cert in CANDIDATE["certifications"]:
        p_c = doc.add_paragraph(style='List Bullet')
        p_c.paragraph_format.space_before = Pt(0)
        p_c.paragraph_format.space_after = Pt(2)
        r_ct = p_c.add_run(f"{cert['title']} ")
        r_ct.font.name = 'Georgia'
        r_ct.font.size = Pt(8.5)
        r_ct.font.bold = True
        
        r_ci = p_c.add_run(f"— {cert['issuer']} ({cert['date']})")
        r_ci.font.name = 'Georgia'
        r_ci.font.size = Pt(8.5)
        r_ci.font.color.rgb = RGBColor(0x44, 0x44, 0x44)

    doc.save(output_docx)
    print(f"Generated: {output_docx}")


# =============================================================
# 3. RESUME TEMPLATE 3: Contemporary Split-Grid Layout (PNG)
# =============================================================
def build_resume_template3(output_png):
    temp_pdf = output_png.replace(".png", "_temp.pdf")
    c = canvas.Canvas(temp_pdf, pagesize=letter)
    width, height = letter # 612 x 792

    # Top Slate Teal Header Box
    c.setFillColor(colors.HexColor("#0F766E")) # Deep Slate Teal
    c.rect(0, height - 100, width, 100, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont(F_ARIAL_BOLD, 18)
    c.drawString(30, height - 42, CANDIDATE["name"])

    # Target position pill
    c.setFillColor(colors.HexColor("#CCFBF1"))
    c.roundRect(30, height - 68, 230, 20, 4, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#0F766E"))
    c.setFont(F_ARIAL_BOLD, 9)
    c.drawString(38, height - 62, "BANQUET OPERATIONS SUPERVISOR")

    # Header Contact Grid (Right side of header)
    c.setFillColor(colors.white)
    c.setFont(F_ARIAL, 7.5)
    c.drawString(320, height - 38, f"Phone: {CANDIDATE['phone']}")
    c.drawString(320, height - 52, f"Email: {CANDIDATE['email']}")
    c.drawString(320, height - 66, f"Address: {CANDIDATE['address']}")
    c.drawString(320, height - 80, f"LinkedIn: {CANDIDATE['linkedin']}")

    # Split Grid: Left Column = 220pt, Right Column = 340pt
    curr_y = height - 118

    # Professional Summary (Across top of body)
    c.setFillColor(colors.HexColor("#0F766E"))
    c.setFont(F_ARIAL_BOLD, 9.5)
    c.drawString(30, curr_y, "EXECUTIVE SUMMARY")
    c.setStrokeColor(colors.HexColor("#0F766E"))
    c.setLineWidth(1)
    c.line(30, curr_y - 3, width - 30, curr_y - 3)
    curr_y -= 14

    def draw_wrapped_arial(text, x, y, max_w, font_s, color_h, line_h):
        c.setFont(F_ARIAL, font_s)
        c.setFillColor(colors.HexColor(color_h))
        words = text.split(' ')
        line = ""
        for word in words:
            test = line + " " + word if line else word
            if c.stringWidth(test, F_ARIAL, font_s) < max_w:
                line = test
            else:
                c.drawString(x, y, line)
                y -= line_h
                line = word
        if line:
            c.drawString(x, y, line)
            y -= line_h
        return y

    curr_y = draw_wrapped_arial(CANDIDATE["summary"], 30, curr_y, width - 60, 7.8, "#334155", 11)
    curr_y -= 8

    split_top_y = curr_y

    # LEFT COLUMN: Core Competencies (Badge style tags) & Education & Certifications
    left_x = 30
    left_w = 200
    ly = split_top_y

    c.setFillColor(colors.HexColor("#0F766E"))
    c.setFont(F_ARIAL_BOLD, 9)
    c.drawString(left_x, ly, "SKILLS & COMPETENCIES")
    c.setStrokeColor(colors.HexColor("#14B8A6"))
    c.setLineWidth(1)
    c.line(left_x, ly - 3, left_x + left_w, ly - 3)
    ly -= 14

    for sk in CANDIDATE["skills"]:
        # Badge background
        # Calculate badge height
        words = sk.split(' ')
        lines = []
        cur_l = ""
        for w in words:
            t = cur_l + " " + w if cur_l else w
            if c.stringWidth(t, F_ARIAL_BOLD, 6.8) < (left_w - 14):
                cur_l = t
            else:
                lines.append(cur_l)
                cur_l = w
        if cur_l:
            lines.append(cur_l)
        
        b_h = len(lines) * 9 + 6
        c.setFillColor(colors.HexColor("#F0FDFA")) # Ice teal
        c.setStrokeColor(colors.HexColor("#99F6E4"))
        c.roundRect(left_x, ly - b_h + 8, left_w, b_h, 3, stroke=1, fill=1)
        
        t_y = ly + 1
        for l in lines:
            c.setFillColor(colors.HexColor("#0F766E"))
            c.setFont(F_ARIAL_BOLD, 6.8)
            c.drawString(left_x + 6, t_y, l)
            t_y -= 9
        ly -= (b_h + 3)

    ly -= 6
    # Education in Left Column
    c.setFillColor(colors.HexColor("#0F766E"))
    c.setFont(F_ARIAL_BOLD, 9)
    c.drawString(left_x, ly, "EDUCATION")
    c.setStrokeColor(colors.HexColor("#14B8A6"))
    c.line(left_x, ly - 3, left_x + left_w, ly - 3)
    ly -= 13

    c.setFont(F_ARIAL_BOLD, 7.8)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(left_x, ly, "BS in Hospitality Management")
    ly -= 10
    c.setFont(F_ARIAL, 7.2)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(left_x, ly, "Pamantasan ng Lungsod ng Maynila")
    ly -= 9
    c.drawString(left_x, ly, "(PLM) — Intramuros, Manila")
    ly -= 9
    c.setFont(F_ARIAL_BOLD, 7.2)
    c.setFillColor(colors.HexColor("#0D9488"))
    c.drawString(left_x, ly, "Class of 2018")
    ly -= 15

    # Certifications in Left Column
    c.setFillColor(colors.HexColor("#0F766E"))
    c.setFont(F_ARIAL_BOLD, 9)
    c.drawString(left_x, ly, "TRAINING & CERTIFICATIONS")
    c.setStrokeColor(colors.HexColor("#14B8A6"))
    c.line(left_x, ly - 3, left_x + left_w, ly - 3)
    ly -= 13

    for cert in CANDIDATE["certifications"]:
        c.setFont(F_ARIAL_BOLD, 7.2)
        c.setFillColor(colors.HexColor("#0F172A"))
        t_str = cert["title"]
        if len(t_str) > 28:
            pts = t_str.split("(")
            c.drawString(left_x, ly, pts[0].strip())
            ly -= 9
            if len(pts) > 1:
                c.drawString(left_x, ly, "(" + pts[1])
                ly -= 9
        else:
            c.drawString(left_x, ly, t_str)
            ly -= 9

        c.setFont(F_ARIAL, 6.8)
        c.setFillColor(colors.HexColor("#475569"))
        iss = cert["issuer"]
        if len(iss) > 30:
            c.drawString(left_x, ly, iss[:30])
            ly -= 8
            c.drawString(left_x, ly, iss[30:].strip())
            ly -= 8
        else:
            c.drawString(left_x, ly, iss)
            ly -= 8
        c.setFont(F_ARIAL_BOLD, 6.8)
        c.setFillColor(colors.HexColor("#0D9488"))
        c.drawString(left_x, ly, cert["date"])
        ly -= 11

    # RIGHT COLUMN: Experience with Timeline Markers
    right_x = 250
    right_w = width - right_x - 30
    ry = split_top_y

    c.setFillColor(colors.HexColor("#0F766E"))
    c.setFont(F_ARIAL_BOLD, 9.5)
    c.drawString(right_x, ry, "PROFESSIONAL EXPERIENCE")
    c.setStrokeColor(colors.HexColor("#0F766E"))
    c.line(right_x, ry - 3, width - 30, ry - 3)
    ry -= 16

    timeline_x = right_x + 6
    exp_text_x = right_x + 22
    exp_w = right_w - 22

    # Draw vertical timeline connector line
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setLineWidth(1.5)
    c.line(timeline_x, ry, timeline_x, 60)

    for exp in CANDIDATE["experience"]:
        # Timeline Node
        c.setFillColor(colors.HexColor("#0D9488"))
        c.setStrokeColor(colors.white)
        c.circle(timeline_x, ry - 2, 4.5, stroke=1, fill=1)

        c.setFont(F_ARIAL_BOLD, 8.8)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(exp_text_x, ry, exp["company"])

        c.setFont(F_ARIAL_BOLD, 7.8)
        c.setFillColor(colors.HexColor("#0F766E"))
        d_len = c.stringWidth(exp["duration"], F_ARIAL_BOLD, 7.8)
        c.drawString(width - 30 - d_len, ry, exp["duration"])
        ry -= 11

        c.setFont(F_ARIAL_BOLD, 7.8)
        c.setFillColor(colors.HexColor("#334155"))
        c.drawString(exp_text_x, ry, exp["position"])

        c.setFont(F_ARIAL, 7.2)
        c.setFillColor(colors.HexColor("#64748B"))
        loc_len = c.stringWidth(exp["location"], F_ARIAL, 7.2)
        c.drawString(width - 30 - loc_len, ry, exp["location"])
        ry -= 11

        for b in exp["bullets"]:
            c.setFillColor(colors.HexColor("#0D9488"))
            c.circle(exp_text_x + 4, ry - 2.5, 1.5, stroke=0, fill=1)
            ry = draw_wrapped_arial(b, exp_text_x + 11, ry, exp_w - 11, 7.3, "#334155", 9.8)
            ry -= 2
        ry -= 6

    c.save()

    # Convert to High-Res PNG via PyMuPDF
    doc_fitz = pymupdf.open(temp_pdf)
    pix = doc_fitz[0].get_pixmap(dpi=200)
    pix.save(output_png)
    doc_fitz.close()
    if os.path.exists(temp_pdf):
        os.remove(temp_pdf)
    print(f"Generated: {output_png}")


# =============================================================
# 4. RESUME TEMPLATE 4: Hospitality Clean Minimalist (JPG)
# =============================================================
def build_resume_template4(output_jpg):
    temp_pdf = output_jpg.replace(".jpg", "_temp.pdf")
    c = canvas.Canvas(temp_pdf, pagesize=letter)
    width, height = letter # 612 x 792

    # Warm Bronze / Burgundy Accent Top Header
    c.setFillColor(colors.HexColor("#800020")) # Burgundy
    c.rect(0, height - 8, width, 8, stroke=0, fill=1)

    c.setFillColor(colors.HexColor("#B45309")) # Bronze trim
    c.rect(0, height - 12, width, 4, stroke=0, fill=1)

    curr_y = height - 45

    # Candidate Name (Left aligned, modern serif/sans elegance)
    c.setFillColor(colors.HexColor("#800020"))
    c.setFont(F_SERIF_BOLD, 20)
    c.drawString(36, curr_y, CANDIDATE["name"])

    # Target Position
    c.setFillColor(colors.HexColor("#B45309"))
    c.setFont(F_CALIBRI_BOLD, 10.5)
    c.drawString(36, curr_y - 15, CANDIDATE["target_position"].upper())

    # Contact line
    c.setFillColor(colors.HexColor("#4B5563"))
    c.setFont(F_CALIBRI, 8)
    contact_line = f"{CANDIDATE['address']}  |  {CANDIDATE['phone']}  |  {CANDIDATE['email']}  |  {CANDIDATE['linkedin']}"
    c.drawString(36, curr_y - 28, contact_line)

    c.setStrokeColor(colors.HexColor("#E5E7EB"))
    c.setLineWidth(1)
    c.line(36, curr_y - 36, width - 36, curr_y - 36)
    curr_y -= 52

    def draw_wrapped_calibri(text, x, y, max_w, font_n, font_s, color_h, line_h):
        c.setFont(font_n, font_s)
        c.setFillColor(colors.HexColor(color_h))
        words = text.split(' ')
        line = ""
        for word in words:
            test = line + " " + word if line else word
            if c.stringWidth(test, font_n, font_s) < max_w:
                line = test
            else:
                c.drawString(x, y, line)
                y -= line_h
                line = word
        if line:
            c.drawString(x, y, line)
            y -= line_h
        return y

    # Summary
    c.setFillColor(colors.HexColor("#800020"))
    c.setFont(F_CALIBRI_BOLD, 10)
    c.drawString(36, curr_y, "HOSPITALITY PROFILE & SUMMARY")
    curr_y -= 12
    curr_y = draw_wrapped_calibri(CANDIDATE["summary"], 36, curr_y, width - 72, F_CALIBRI, 8.2, "#374151", 11.5)
    curr_y -= 8

    # Core Competencies & Skills (4x2 grid with minimalist bronze check bullets)
    c.setFillColor(colors.HexColor("#800020"))
    c.setFont(F_CALIBRI_BOLD, 10)
    c.drawString(36, curr_y, "CORE EXPERTISE & COMPETENCIES")
    curr_y -= 12

    col_w = (width - 72 - 20) / 2
    skills = CANDIDATE["skills"]
    s_y = curr_y
    for i in range(4):
        # Left
        c.setFillColor(colors.HexColor("#B45309"))
        c.setFont(F_CALIBRI_BOLD, 8)
        c.drawString(36, s_y, "♦")
        draw_wrapped_calibri(skills[i], 46, s_y, col_w - 15, F_CALIBRI, 7.8, "#1F2937", 10)

        # Right
        c.setFillColor(colors.HexColor("#B45309"))
        c.drawString(36 + col_w + 20, s_y, "♦")
        draw_wrapped_calibri(skills[i+4], 46 + col_w + 20, s_y, col_w - 15, F_CALIBRI, 7.8, "#1F2937", 10)

        s_y -= 12
    curr_y = s_y - 6

    # Work Experience - Bordered Experience Cards
    c.setFillColor(colors.HexColor("#800020"))
    c.setFont(F_CALIBRI_BOLD, 10)
    c.drawString(36, curr_y, "PROFESSIONAL EXPERIENCE")
    curr_y -= 12

    for exp in CANDIDATE["experience"]:
        # Card height calculation
        b_count = len(exp["bullets"])
        card_h = 24 + b_count * 18 + 4
        if exp["company"] == "Grand Crest Hotel & Suites":
            card_h = 92
        elif exp["company"] == "Harborview Hotel & Convention Center":
            card_h = 75
        else:
            card_h = 58

        # Draw card border & fill
        c.setFillColor(colors.HexColor("#FAFAFA"))
        c.setStrokeColor(colors.HexColor("#E5E7EB"))
        c.roundRect(36, curr_y - card_h + 8, width - 72, card_h, 4, stroke=1, fill=1)

        # Inner Card Accent strip on left
        c.setFillColor(colors.HexColor("#800020"))
        c.roundRect(36, curr_y - card_h + 8, 4, card_h, 2, stroke=0, fill=1)

        inner_y = curr_y - 2
        # Title & Duration
        c.setFont(F_CALIBRI_BOLD, 9)
        c.setFillColor(colors.HexColor("#111827"))
        c.drawString(48, inner_y, exp["company"])

        c.setFont(F_CALIBRI_BOLD, 8)
        c.setFillColor(colors.HexColor("#B45309"))
        dur_w = c.stringWidth(exp["duration"], F_CALIBRI_BOLD, 8)
        c.drawString(width - 48 - dur_w, inner_y, exp["duration"])
        inner_y -= 11

        c.setFont(F_CALIBRI_BOLD, 8)
        c.setFillColor(colors.HexColor("#4B5563"))
        c.drawString(48, inner_y, exp["position"])

        c.setFont(F_CALIBRI, 7.5)
        c.setFillColor(colors.HexColor("#6B7280"))
        loc_w = c.stringWidth(exp["location"], F_CALIBRI, 7.5)
        c.drawString(width - 48 - loc_w, inner_y, exp["location"])
        inner_y -= 11

        for b in exp["bullets"]:
            c.setFillColor(colors.HexColor("#9CA3AF"))
            c.circle(53, inner_y - 2.5, 1.5, stroke=0, fill=1)
            inner_y = draw_wrapped_calibri(b, 60, inner_y, width - 115, F_CALIBRI, 7.5, "#374151", 10)
            inner_y -= 2

        curr_y -= (card_h + 6)

    # Bottom 2 columns: Education & Certifications
    b_col_w = (width - 72 - 20) / 2
    ey = curr_y

    # Education
    c.setFillColor(colors.HexColor("#800020"))
    c.setFont(F_CALIBRI_BOLD, 9.5)
    c.drawString(36, ey, "EDUCATION")
    c.setStrokeColor(colors.HexColor("#E5E7EB"))
    c.line(36, ey - 3, 36 + b_col_w, ey - 3)
    ey -= 13

    c.setFont(F_CALIBRI_BOLD, 8)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawString(36, ey, CANDIDATE["education"]["degree"])
    ey -= 10
    c.setFont(F_CALIBRI, 7.5)
    c.setFillColor(colors.HexColor("#4B5563"))
    c.drawString(36, ey, CANDIDATE["education"]["institution"])
    ey -= 10
    c.setFont(F_CALIBRI_BOLD, 7.5)
    c.setFillColor(colors.HexColor("#B45309"))
    c.drawString(36, ey, f"Graduated: {CANDIDATE['education']['year']}")

    # Certifications
    cy = curr_y
    c_x = 36 + b_col_w + 20
    c.setFillColor(colors.HexColor("#800020"))
    c.setFont(F_CALIBRI_BOLD, 9.5)
    c.drawString(c_x, cy, "TRAINING & CERTIFICATIONS")
    c.setStrokeColor(colors.HexColor("#E5E7EB"))
    c.line(c_x, cy - 3, width - 36, cy - 3)
    cy -= 13

    for cert in CANDIDATE["certifications"]:
        c.setFont(F_CALIBRI_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#1F2937"))
        c.drawString(c_x, cy, cert["title"])
        cy -= 9
        c.setFont(F_CALIBRI, 7)
        c.setFillColor(colors.HexColor("#6B7280"))
        c.drawString(c_x, cy, f"{cert['issuer']} — {cert['date']}")
        cy -= 11

    c.save()

    # Convert to High-Res JPG via PyMuPDF
    doc_fitz = pymupdf.open(temp_pdf)
    pix = doc_fitz[0].get_pixmap(dpi=200)
    # Save as JPG with quality 95
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    img.save(output_jpg, "JPEG", quality=95)
    doc_fitz.close()
    if os.path.exists(temp_pdf):
        os.remove(temp_pdf)
    print(f"Generated: {output_jpg}")


# =============================================================
# 5. RESUME TEMPLATE 5: Infographic / Accent-Bar Layout (Degraded PNG)
# =============================================================
def build_resume_template5(output_png):
    temp_clean_png = output_png.replace(".png", "_clean.png")
    temp_pdf = output_png.replace(".png", "_temp.pdf")
    c = canvas.Canvas(temp_pdf, pagesize=letter)
    width, height = letter # 612 x 792

    # Left Sidebar - Slate Charcoal
    sidebar_w = 210
    c.setFillColor(colors.HexColor("#1E293B"))
    c.rect(0, 0, sidebar_w, height, stroke=0, fill=1)

    # Infographic Header in sidebar
    c.setFillColor(colors.HexColor("#38BDF8")) # Sky blue badge
    c.roundRect(16, height - 42, sidebar_w - 32, 22, 4, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(22, height - 33, "CANDIDATE DOSSIER")

    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 14.5)
    c.drawString(16, height - 64, CANDIDATE["name"].upper())

    c.setFillColor(colors.HexColor("#38BDF8"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(16, height - 80, CANDIDATE["target_position"])

    # Contact Block with Infographic Boxes
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setLineWidth(1)
    c.line(16, height - 92, sidebar_w - 16, height - 92)

    sy = height - 106
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(16, sy, "CONTACT CHANNELS")
    sy -= 14

    c_boxes = [
        ("PHONE", CANDIDATE["phone"]),
        ("EMAIL", CANDIDATE["email"]),
        ("RESIDENCE", "Domestic Road, Pasay City, 1301"),
        ("", "Metro Manila, Philippines"),
        ("NETWORKING", CANDIDATE["linkedin"])
    ]

    for label, val in c_boxes:
        if label:
            c.setFont(F_SANS_BOLD, 6.8)
            c.setFillColor(colors.HexColor("#38BDF8"))
            c.drawString(16, sy, label)
            sy -= 9
        c.setFont(F_SANS, 7.2)
        c.setFillColor(colors.white)
        c.drawString(16, sy, val)
        sy -= 11

    sy -= 10
    # Infographic Competency Progress Blocks
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(16, sy, "KEY COMPETENCIES & RATINGS")
    sy -= 12

    progress_skills = [
        ("BEO Floor Planning & Execution", 95),
        ("Function Room Turnover", 90),
        ("Staff Scheduling & Briefings", 92),
        ("Formal Plated & Buffet Protocols", 88),
        ("VIP Guest Relations & Handling", 94),
        ("CGS Breakage Mitigation", 86),
        ("Food Safety & HACCP Compliance", 95),
        ("Banquet Billing & Cost Control", 85)
    ]

    for sk_title, pct in progress_skills:
        c.setFont(F_SANS, 6.8)
        c.setFillColor(colors.white)
        c.drawString(16, sy, sk_title)
        sy -= 8

        # Progress bar background
        bar_w = sidebar_w - 32
        c.setFillColor(colors.HexColor("#334155"))
        c.roundRect(16, sy, bar_w, 4, 2, stroke=0, fill=1)

        # Progress bar fill
        c.setFillColor(colors.HexColor("#38BDF8"))
        c.roundRect(16, sy, bar_w * (pct / 100.0), 4, 2, stroke=0, fill=1)
        sy -= 10

    sy -= 10
    # Education in Sidebar
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(16, sy, "ACADEMIC BACKGROUND")
    sy -= 12
    c.setFont(F_SANS_BOLD, 7.5)
    c.setFillColor(colors.white)
    c.drawString(16, sy, CANDIDATE["education"]["degree"])
    sy -= 10
    c.setFont(F_SANS, 7)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawString(16, sy, CANDIDATE["education"]["institution"])
    sy -= 9
    c.setFont(F_SANS_BOLD, 7)
    c.setFillColor(colors.HexColor("#38BDF8"))
    c.drawString(16, sy, f"Conferred: {CANDIDATE['education']['year']}")
    sy -= 18

    # Certifications in Sidebar
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(16, sy, "CREDENTIALS & TRAININGS")
    sy -= 12

    for cert in CANDIDATE["certifications"]:
        c.setFont(F_SANS_BOLD, 7.2)
        c.setFillColor(colors.white)
        t = cert["title"]
        if len(t) > 28:
            pts = t.split("(")
            c.drawString(16, sy, pts[0].strip())
            sy -= 8
            if len(pts) > 1:
                c.drawString(16, sy, "(" + pts[1])
                sy -= 8
        else:
            c.drawString(16, sy, t)
            sy -= 8

        c.setFont(F_SANS, 6.8)
        c.setFillColor(colors.HexColor("#94A3B8"))
        c.drawString(16, sy, f"{cert['issuer']} ({cert['date']})")
        sy -= 10

    # Right Column
    rx = 230
    rw = width - rx - 20
    my = height - 42

    def draw_w(text, x, y, max_w, font_n, font_s, color_h, line_h):
        c.setFont(font_n, font_s)
        c.setFillColor(colors.HexColor(color_h))
        words = text.split(' ')
        line = ""
        for word in words:
            test = line + " " + word if line else word
            if c.stringWidth(test, font_n, font_s) < max_w:
                line = test
            else:
                c.drawString(x, y, line)
                y -= line_h
                line = word
        if line:
            c.drawString(x, y, line)
            y -= line_h
        return y

    # Summary
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, my, "EXECUTIVE PROFILE")
    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.setLineWidth(1.5)
    c.line(rx, my - 3, rx + 45, my - 3)
    my -= 14
    my = draw_w(CANDIDATE["summary"], rx, my, rw, F_SANS, 7.8, "#334155", 11)
    my -= 10

    # Core Competencies List Header (Ensuring exact wording for NLP consistency)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, my, "CORE COMPETENCIES & VERIFIED SKILLS")
    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.line(rx, my - 3, rx + 45, my - 3)
    my -= 14

    # 2 columns of skills
    half = (rw - 10) / 2
    sk_y1 = my
    for sk in CANDIDATE["skills"][:4]:
        c.setFillColor(colors.HexColor("#0284C7"))
        c.rect(rx, sk_y1 - 1, 3, 3, stroke=0, fill=1)
        sk_y1 = draw_w(sk, rx + 8, sk_y1, half - 10, F_SANS, 7.2, "#1E293B", 9.5)
        sk_y1 -= 2

    sk_y2 = my
    for sk in CANDIDATE["skills"][4:]:
        c.setFillColor(colors.HexColor("#0284C7"))
        c.rect(rx + half, sk_y2 - 1, 3, 3, stroke=0, fill=1)
        sk_y2 = draw_w(sk, rx + half + 8, sk_y2, half - 10, F_SANS, 7.2, "#1E293B", 9.5)
        sk_y2 -= 2

    my = min(sk_y1, sk_y2) - 8

    # Work Experience
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, my, "PROFESSIONAL CAREER HISTORY")
    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.line(rx, my - 3, rx + 45, my - 3)
    my -= 14

    for exp in CANDIDATE["experience"]:
        c.setFont(F_SANS_BOLD, 8.8)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(rx, my, exp["company"])

        c.setFont(F_SANS_BOLD, 8)
        c.setFillColor(colors.HexColor("#0284C7"))
        dw = c.stringWidth(exp["duration"], F_SANS_BOLD, 8)
        c.drawString(width - 20 - dw, my, exp["duration"])
        my -= 10

        c.setFont(F_SANS_BOLD, 7.8)
        c.setFillColor(colors.HexColor("#475569"))
        c.drawString(rx, my, exp["position"])

        c.setFont(F_SANS_ITALIC, 7.2)
        c.setFillColor(colors.HexColor("#64748B"))
        lw = c.stringWidth(exp["location"], F_SANS_ITALIC, 7.2)
        c.drawString(width - 20 - lw, my, exp["location"])
        my -= 10

        for b in exp["bullets"]:
            c.setFillColor(colors.HexColor("#94A3B8"))
            c.circle(rx + 4, my - 2.5, 1.5, stroke=0, fill=1)
            my = draw_w(b, rx + 11, my, rw - 11, F_SANS, 7.3, "#334155", 9.8)
            my -= 2
        my -= 5

    c.save()

    # Convert to High-Res Clean Image first
    doc_fitz = pymupdf.open(temp_pdf)
    pix = doc_fitz[0].get_pixmap(dpi=200)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    doc_fitz.close()
    if os.path.exists(temp_pdf):
        os.remove(temp_pdf)

    # Apply MILD, UNIFORM FULL-PAGE DEGRADATION:
    # 1. Uniform Gaussian Blur (radius = 1.3)
    degraded = img.filter(ImageFilter.GaussianBlur(radius=1.3))

    # 2. Slight uniform contrast softening (0.94)
    enhancer = ImageEnhance.Contrast(degraded)
    degraded = enhancer.enhance(0.94)

    # 3. Add subtle uniform scanner grain
    draw = ImageDraw.Draw(degraded)
    random.seed(42) # Deterministic
    w, h = degraded.size
    # Add subtle uniform pixel noise
    noise_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    n_draw = ImageDraw.Draw(noise_img)
    for _ in range(3500):
        nx = random.randint(0, w - 1)
        ny = random.randint(0, h - 1)
        val = random.randint(180, 240)
        n_draw.point((nx, ny), fill=(val, val, val, 30))
    degraded.paste(noise_img, (0, 0), noise_img)

    degraded.save(output_png, "PNG")
    print(f"Generated (Degraded PNG): {output_png}")


# =============================================================
# 6. RESUME TEMPLATE 6: Elegant Hotelier Formal Layout (Degraded JPG)
# =============================================================
def build_resume_template6(output_jpg):
    temp_pdf = output_jpg.replace(".jpg", "_temp.pdf")
    c = canvas.Canvas(temp_pdf, pagesize=letter)
    width, height = letter # 612 x 792

    # Double Border: Outer Gold, Inner Navy
    c.setStrokeColor(colors.HexColor("#C5A059")) # Hotel Gold
    c.setLineWidth(2)
    c.rect(18, 18, width - 36, height - 36)

    c.setStrokeColor(colors.HexColor("#0A192F")) # Navy
    c.setLineWidth(0.8)
    c.rect(22, 22, width - 44, height - 44)

    # Header Crest Styling
    c.setFillColor(colors.HexColor("#0A192F"))
    c.rect(22, height - 78, width - 44, 56, stroke=0, fill=1)

    # Gold header divider
    c.setFillColor(colors.HexColor("#C5A059"))
    c.rect(22, height - 80, width - 44, 2.5, stroke=0, fill=1)

    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.setFont(F_SERIF_BOLD, 17)
    c.drawCentredString(width / 2.0, height - 44, CANDIDATE["name"].upper())

    c.setFillColor(colors.HexColor("#C5A059"))
    c.setFont(F_SERIF_BOLD, 9)
    c.drawCentredString(width / 2.0, height - 60, f"♦  {CANDIDATE['target_position'].upper()}  ♦")

    c.setFillColor(colors.HexColor("#E2E8F0"))
    c.setFont(F_SERIF, 7.5)
    c_line = f"{CANDIDATE['address']}   •   {CANDIDATE['phone']}   •   {CANDIDATE['email']}   •   {CANDIDATE['linkedin']}"
    c.drawCentredString(width / 2.0, height - 73, c_line)

    curr_y = height - 96

    def draw_serif_w(text, x, y, max_w, font_n, font_s, color_h, line_h):
        c.setFont(font_n, font_s)
        c.setFillColor(colors.HexColor(color_h))
        words = text.split(' ')
        line = ""
        for word in words:
            test = line + " " + word if line else word
            if c.stringWidth(test, font_n, font_s) < max_w:
                line = test
            else:
                c.drawString(x, y, line)
                y -= line_h
                line = word
        if line:
            c.drawString(x, y, line)
            y -= line_h
        return y

    def section_header_hotel(title, y_pos):
        c.setFillColor(colors.HexColor("#0A192F"))
        c.setFont(F_SERIF_BOLD, 9.5)
        c.drawString(36, y_pos, title)
        c.setStrokeColor(colors.HexColor("#C5A059"))
        c.setLineWidth(1)
        c.line(36, y_pos - 3, width - 36, y_pos - 3)
        return y_pos - 14

    # Summary
    curr_y = section_header_hotel("HOTEL & BANQUET LEADERSHIP PROFILE", curr_y)
    curr_y = draw_serif_w(CANDIDATE["summary"], 36, curr_y, width - 72, F_SERIF, 8, "#1F2937", 11.2)
    curr_y -= 8

    # Core Competencies & Skills
    curr_y = section_header_hotel("CORE OPERATIONAL COMPETENCIES", curr_y)
    half_w = (width - 72 - 20) / 2
    sy1 = curr_y
    for sk in CANDIDATE["skills"][:4]:
        c.setFillColor(colors.HexColor("#C5A059"))
        c.drawString(36, sy1, "▪")
        sy1 = draw_serif_w(sk, 46, sy1, half_w - 12, F_SERIF, 7.5, "#1F2937", 9.8)
        sy1 -= 2

    sy2 = curr_y
    for sk in CANDIDATE["skills"][4:]:
        c.setFillColor(colors.HexColor("#C5A059"))
        c.drawString(36 + half_w + 20, sy2, "▪")
        sy2 = draw_serif_w(sk, 46 + half_w + 20, sy2, half_w - 12, F_SERIF, 7.5, "#1F2937", 9.8)
        sy2 -= 2

    curr_y = min(sy1, sy2) - 8

    # Work Experience
    curr_y = section_header_hotel("CHRONOLOGICAL EMPLOYMENT HISTORY", curr_y)
    for exp in CANDIDATE["experience"]:
        c.setFont(F_SERIF_BOLD, 8.8)
        c.setFillColor(colors.HexColor("#0A192F"))
        c.drawString(36, curr_y, exp["company"])

        c.setFont(F_SERIF_BOLD, 8)
        c.setFillColor(colors.HexColor("#C5A059"))
        dw = c.stringWidth(exp["duration"], F_SERIF_BOLD, 8)
        c.drawString(width - 36 - dw, curr_y, exp["duration"])
        curr_y -= 10

        c.setFont(F_SERIF_BOLD, 7.8)
        c.setFillColor(colors.HexColor("#334155"))
        c.drawString(36, curr_y, exp["position"])

        c.setFont(F_SERIF_ITALIC, 7.2)
        c.setFillColor(colors.HexColor("#64748B"))
        lw = c.stringWidth(exp["location"], F_SERIF_ITALIC, 7.2)
        c.drawString(width - 36 - lw, curr_y, exp["location"])
        curr_y -= 10

        for b in exp["bullets"]:
            c.setFillColor(colors.HexColor("#C5A059"))
            c.circle(41, curr_y - 2.5, 1.5, stroke=0, fill=1)
            curr_y = draw_serif_w(b, 48, curr_y, width - 84, F_SERIF, 7.3, "#334155", 9.8)
            curr_y -= 2
        curr_y -= 5

    # Education & Certifications
    col_w = (width - 72 - 20) / 2
    ey = curr_y

    # Education
    c.setFillColor(colors.HexColor("#0A192F"))
    c.setFont(F_SERIF_BOLD, 9)
    c.drawString(36, ey, "ACADEMIC QUALIFICATIONS")
    c.setStrokeColor(colors.HexColor("#C5A059"))
    c.line(36, ey - 3, 36 + col_w, ey - 3)
    ey -= 12

    c.setFont(F_SERIF_BOLD, 7.8)
    c.setFillColor(colors.HexColor("#111827"))
    c.drawString(36, ey, CANDIDATE["education"]["degree"])
    ey -= 9
    c.setFont(F_SERIF, 7.2)
    c.setFillColor(colors.HexColor("#4B5563"))
    c.drawString(36, ey, CANDIDATE["education"]["institution"])
    ey -= 9
    c.setFont(F_SERIF_BOLD, 7.2)
    c.setFillColor(colors.HexColor("#C5A059"))
    c.drawString(36, ey, f"Year of Conformance: {CANDIDATE['education']['year']}")

    # Certifications
    cy = curr_y
    cx = 36 + col_w + 20
    c.setFillColor(colors.HexColor("#0A192F"))
    c.setFont(F_SERIF_BOLD, 9)
    c.drawString(cx, cy, "PROFESSIONAL CERTIFICATIONS")
    c.setStrokeColor(colors.HexColor("#C5A059"))
    c.line(cx, cy - 3, width - 36, cy - 3)
    cy -= 12

    for cert in CANDIDATE["certifications"]:
        c.setFont(F_SERIF_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#111827"))
        c.drawString(cx, cy, cert["title"])
        cy -= 9
        c.setFont(F_SERIF, 7)
        c.setFillColor(colors.HexColor("#4B5563"))
        c.drawString(cx, cy, f"{cert['issuer']} ({cert['date']})")
        cy -= 10

    c.save()

    # Convert to High-Res Clean Image first
    doc_fitz = pymupdf.open(temp_pdf)
    pix = doc_fitz[0].get_pixmap(dpi=200)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    doc_fitz.close()
    if os.path.exists(temp_pdf):
        os.remove(temp_pdf)

    # Uniform scan degradation:
    # 1. Subtle scanner softening (radius = 0.9)
    degraded = img.filter(ImageFilter.GaussianBlur(radius=0.9))

    # 2. Add subtle scanner background warmth/grain
    draw = ImageDraw.Draw(degraded)
    random.seed(99)
    w, h = degraded.size
    noise_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    n_draw = ImageDraw.Draw(noise_img)
    for _ in range(2500):
        nx = random.randint(0, w - 1)
        ny = random.randint(0, h - 1)
        val = random.randint(150, 220)
        n_draw.point((nx, ny), fill=(val, val, val - 20, 25))
    degraded.paste(noise_img, (0, 0), noise_img)

    # 3. Moderate JPEG recompression (quality = 40)
    degraded.save(output_jpg, "JPEG", quality=40)
    print(f"Generated (Degraded JPG): {output_jpg}")


# =============================================================
# 7. SUPPORTING DOC 1: COE Current Employer (PDF) - VERIFIED
# =============================================================
def build_supporting_doc1_coe_current(output_pdf):
    c = canvas.Canvas(output_pdf, pagesize=letter)
    width, height = letter # 612 x 792

    # Elegant Letterhead Header
    c.setFillColor(colors.HexColor("#1A2B4C")) # Grand Crest Navy
    c.rect(0, height - 90, width, 90, stroke=0, fill=1)

    c.setFillColor(colors.HexColor("#D4AF37")) # Gold bar
    c.rect(0, height - 94, width, 4, stroke=0, fill=1)

    # Hotel Crest / Logo
    c.setFillColor(colors.HexColor("#D4AF37"))
    c.circle(60, height - 45, 24, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#1A2B4C"))
    c.circle(60, height - 45, 20, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#D4AF37"))
    c.setFont(F_SERIF_BOLD, 16)
    c.drawCentredString(60, height - 51, "GC")

    # Hotel Name & Subtitle
    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 17)
    c.drawString(95, height - 40, "GRAND CREST HOTEL & SUITES")
    c.setFont(F_SANS, 8)
    c.setFillColor(colors.HexColor("#93C5FD"))
    c.drawString(95, height - 54, "Seaside Boulevard, Mall of Asia Complex, Pasay City, Metro Manila, Philippines")
    c.drawString(95, height - 66, "Tel: (+63 2) 8888-7700  •  Web: www.grandcresthotel.com.ph  •  Email: hr@grandcresthotel.com.ph")

    # Document Body
    curr_y = height - 140

    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SANS, 9)
    c.drawString(54, curr_y, "Ref No.: GCH-HRD-2024-0914")
    c.drawRightString(width - 54, curr_y, "Date: September 14, 2024")
    curr_y -= 40

    # Title
    c.setFillColor(colors.HexColor("#1A2B4C"))
    c.setFont(F_SERIF_BOLD, 15)
    c.drawCentredString(width / 2.0, curr_y, "CERTIFICATE OF EMPLOYMENT")
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(1.5)
    c.line(width / 2.0 - 100, curr_y - 4, width / 2.0 + 100, curr_y - 4)
    curr_y -= 45

    # Addressee
    c.setFont(F_SANS_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawString(54, curr_y, "TO WHOM IT MAY CONCERN:")
    curr_y -= 25

    def draw_p(text, y):
        c.setFont(F_SERIF, 9.5)
        c.setFillColor(colors.HexColor("#1E293B"))
        words = text.split(' ')
        line = ""
        for word in words:
            test = line + " " + word if line else word
            if c.stringWidth(test, F_SERIF, 9.5) < (width - 108):
                line = test
            else:
                c.drawString(54, y, line)
                y -= 14
                line = word
        if line:
            c.drawString(54, y, line)
            y -= 14
        return y

    p1 = (
        "This is to certify that MR. MARCUS ELIJAH NAVARRO has been employed with Grand Crest Hotel & Suites "
        "since June 2022 and continues to be an active, regular employee up to the present date."
    )
    curr_y = draw_p(p1, curr_y)
    curr_y -= 10

    p2 = (
        "He currently holds the official designation of BANQUET OPERATIONS SUPERVISOR under the Food and Beverage "
        "Department – Banquet Operations Division. In this capacity, he is responsible for supervising floor operations "
        "across our 3 grand ballrooms and 5 multi-function rooms, overseeing pre-shift briefings, directing service captains, "
        "and ensuring rigorous compliance with luxury hospitality protocols and HACCP food safety standards."
    )
    curr_y = draw_p(p2, curr_y)
    curr_y -= 10

    p3 = (
        "During his tenure, Mr. Navarro has consistently exhibited exceptional operational diligence, leadership "
        "integrity, and commitment to service excellence. His performance evaluations have maintained an exemplary rating."
    )
    curr_y = draw_p(p3, curr_y)
    curr_y -= 10

    p4 = (
        "This certification is being issued upon the request of Mr. Navarro for employment verification, professional "
        "credentialing, or whatever legal purpose it may serve."
    )
    curr_y = draw_p(p4, curr_y)
    curr_y -= 35

    # Signatory Block
    c.setFont(F_SANS, 9)
    c.drawString(54, curr_y, "Certified true and correct by:")
    curr_y -= 30

    # Signature script representation
    c.setFont(F_SERIF_ITALIC, 14)
    c.setFillColor(colors.HexColor("#1A365D"))
    c.drawString(54, curr_y, "Maria Cristina Santos")
    curr_y -= 15

    c.setFont(F_SANS_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawString(54, curr_y, "MARIA CRISTINA SANTOS, CHRP")
    curr_y -= 12
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(54, curr_y, "Vice President – Human Resources Management")
    c.drawString(54, curr_y - 11, "Grand Crest Hotel & Suites")

    # Corporate Seal Graphic
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setFillColor(colors.HexColor("#FFFBEB"))
    c.setLineWidth(1.5)
    c.circle(width - 120, curr_y + 10, 36, stroke=1, fill=1)
    c.setLineWidth(0.8)
    c.circle(width - 120, curr_y + 10, 31, stroke=1, fill=0)
    c.setFont(F_SERIF_BOLD, 6.5)
    c.setFillColor(colors.HexColor("#B45309"))
    c.drawCentredString(width - 120, curr_y + 20, "GRAND CREST HOTEL")
    c.drawCentredString(width - 120, curr_y + 10, "OFFICIAL HR SEAL")
    c.drawCentredString(width - 120, curr_y, "PASAY CITY, PH")

    # Footer
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setLineWidth(0.8)
    c.line(54, 40, width - 54, 40)
    c.setFont(F_SANS, 7)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawCentredString(width / 2.0, 28, "Grand Crest Hotel & Suites  •  Human Resources Division  •  Official Certificate of Employment")

    c.save()
    print(f"Generated: {output_pdf}")


# =============================================================
# 8. SUPPORTING DOC 2: COE Previous Employer (PDF) - DISCREPANCY
# =============================================================
def build_supporting_doc2_coe_previous(output_pdf):
    c = canvas.Canvas(output_pdf, pagesize=letter)
    width, height = letter # 612 x 792

    # Formal Corporate Letterhead
    c.setFillColor(colors.HexColor("#0C4A6E")) # Deep Ocean Slate
    c.rect(0, height - 85, width, 85, stroke=0, fill=1)

    c.setFillColor(colors.HexColor("#0284C7")) # Blue accent
    c.rect(0, height - 88, width, 3, stroke=0, fill=1)

    # Hotel Emblem
    c.setFillColor(colors.white)
    c.circle(60, height - 42, 22, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#0C4A6E"))
    c.circle(60, height - 42, 18, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 14)
    c.drawCentredString(60, height - 47, "HH")

    # Letterhead Text
    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 15)
    c.drawString(95, height - 38, "HARBORVIEW HOTEL & CONVENTION CENTER")
    c.setFont(F_SANS, 7.8)
    c.setFillColor(colors.HexColor("#BAE6FD"))
    c.drawString(95, height - 52, "Manila Bay Promenade, Roxas Boulevard, Manila 1000, Philippines")
    c.drawString(95, height - 64, "PABX: (+63 2) 8527-0011  •  Email: humanresources@harborviewhotel.com.ph")

    curr_y = height - 130

    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SANS, 8.5)
    c.drawString(54, curr_y, "Reference No.: HHCC-HR-2022-0518")
    c.drawRightString(width - 54, curr_y, "Date of Issuance: May 30, 2022")
    curr_y -= 35

    # Document Title
    c.setFillColor(colors.HexColor("#0C4A6E"))
    c.setFont(F_SERIF_BOLD, 14.5)
    c.drawCentredString(width / 2.0, curr_y, "CERTIFICATE OF EMPLOYMENT AND CLEARANCE")
    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.setLineWidth(1.2)
    c.line(width / 2.0 - 130, curr_y - 4, width / 2.0 + 130, curr_y - 4)
    curr_y -= 40

    c.setFont(F_SANS_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawString(54, curr_y, "TO WHOM IT MAY CONCERN:")
    curr_y -= 25

    def draw_p(text, y):
        c.setFont(F_SERIF, 9.5)
        c.setFillColor(colors.HexColor("#1E293B"))
        words = text.split(' ')
        line = ""
        for word in words:
            test = line + " " + word if line else word
            if c.stringWidth(test, F_SERIF, 9.5) < (width - 108):
                line = test
            else:
                c.drawString(54, y, line)
                y -= 14
                line = word
        if line:
            c.drawString(54, y, line)
            y -= 14
        return y

    # CONTROLLED DISCREPANCY: June 1, 2020 to May 25, 2022 (Resume claims January 2020)
    p1 = (
        "This is to certify that MR. MARCUS ELIJAH NAVARRO was employed by Harborview Hotel & Convention Center "
        "as a regular full-time team member from June 1, 2020 to May 25, 2022."
    )
    curr_y = draw_p(p1, curr_y)
    curr_y -= 10

    p2 = (
        "During his employment tenure with the company, he served with dedication as BANQUET TEAM LEADER / CAPTAIN "
        "under the Event Operations Department. His official duties encompassed directing floor attendants during corporate "
        "conventions, diplomatic banquets, and high-profile wedding receptions, overseeing table layouts, and enforcing "
        "luxury banquet silver service standards."
    )
    curr_y = draw_p(p2, curr_y)
    curr_y -= 10

    p3 = (
        "Records confirm that Mr. Navarro has completed the standard employee clearance process and has been fully "
        "cleared of all property, operational, and financial liabilities with Harborview Hotel & Convention Center."
    )
    curr_y = draw_p(p3, curr_y)
    curr_y -= 10

    p4 = (
        "This certificate is issued upon the request of Mr. Navarro for employment verification purposes."
    )
    curr_y = draw_p(p4, curr_y)
    curr_y -= 35

    c.setFont(F_SANS, 9)
    c.drawString(54, curr_y, "Certified and cleared by:")
    curr_y -= 30

    # Signature script
    c.setFont(F_SERIF_ITALIC, 14)
    c.setFillColor(colors.HexColor("#0369A1"))
    c.drawString(54, curr_y, "Rolando G. Alvarez")
    curr_y -= 15

    c.setFont(F_SANS_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawString(54, curr_y, "ROLANDO G. ALVAREZ, MHRM")
    curr_y -= 12
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(54, curr_y, "Director of Human Capital")
    c.drawString(54, curr_y - 11, "Harborview Hotel & Convention Center")

    # Corporate Seal Graphic
    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.setFillColor(colors.HexColor("#F0F9FF"))
    c.setLineWidth(1.5)
    c.circle(width - 120, curr_y + 10, 36, stroke=1, fill=1)
    c.setLineWidth(0.8)
    c.circle(width - 120, curr_y + 10, 31, stroke=1, fill=0)
    c.setFont(F_SERIF_BOLD, 6.5)
    c.setFillColor(colors.HexColor("#0369A1"))
    c.drawCentredString(width - 120, curr_y + 20, "HARBORVIEW HOTEL")
    c.drawCentredString(width - 120, curr_y + 10, "HR CLEARANCE SEAL")
    c.drawCentredString(width - 120, curr_y, "MANILA, PH")

    # Footer
    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.setLineWidth(0.8)
    c.line(54, 40, width - 54, 40)
    c.setFont(F_SANS, 7)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawCentredString(width / 2.0, 28, "Harborview Hotel & Convention Center  •  Human Capital Department  •  Manila Bay, Philippines")

    c.save()
    print(f"Generated: {output_pdf}")


# =============================================================
# 9. SUPPORTING DOC 3: Diploma (PDF) - VERIFIED
# =============================================================
def build_supporting_doc3_diploma(output_pdf):
    c = canvas.Canvas(output_pdf, pagesize=landscape(letter))
    width, height = landscape(letter) # 792 x 612

    # Ornate Double Border
    c.setStrokeColor(colors.HexColor("#1E3A8A")) # Deep Blue
    c.setLineWidth(4)
    c.rect(24, 24, width - 48, height - 48)

    c.setStrokeColor(colors.HexColor("#D4AF37")) # Gold
    c.setLineWidth(1.5)
    c.rect(30, 30, width - 60, height - 60)

    # University Seal Medallion at Top Center
    seal_y = height - 85
    c.setFillColor(colors.HexColor("#D4AF37"))
    c.circle(width / 2.0, seal_y, 30, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.circle(width / 2.0, seal_y, 27, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 9)
    c.drawCentredString(width / 2.0, seal_y - 3, "PLM • 1965")

    curr_y = height - 130
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.setFont(F_SERIF_BOLD, 12)
    c.drawCentredString(width / 2.0, curr_y, "REPUBLIKA NG PILIPINAS")
    curr_y -= 18

    c.setFont(F_SERIF_BOLD, 20)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(width / 2.0, curr_y, "PAMANTASAN NG LUNGSOD NG MAYNILA")
    curr_y -= 14

    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(width / 2.0, curr_y, "(University of the City of Manila)")
    curr_y -= 12

    c.setFont(F_SERIF, 9)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(width / 2.0, curr_y, "Intramuros, Maynila, Pilipinas")
    curr_y -= 25

    c.setFont(F_SERIF, 10.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(width / 2.0, curr_y, "Ipinababatid ng Lupon ng mga Rehente na si")
    curr_y -= 30

    # Graduate Name
    c.setFont(F_SERIF_BOLD, 22)
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.drawCentredString(width / 2.0, curr_y, "MARCUS ELIJAH NAVARRO")
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(1.5)
    c.line(width / 2.0 - 150, curr_y - 5, width / 2.0 + 150, curr_y - 5)
    curr_y -= 28

    c.setFont(F_SERIF, 10.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(width / 2.0, curr_y, "ay maluwalhating nakatapos ng kurso at pinagkalooban ng titulong")
    curr_y -= 24

    # Degree Title
    c.setFont(F_SERIF_BOLD, 17)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(width / 2.0, curr_y, "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT")
    curr_y -= 18

    c.setFont(F_SERIF_ITALIC, 9.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(width / 2.0, curr_y, "kalakip ang lahat ng mga karapatan, kapangyarihan at pribilehiyong nauukol dito.")
    curr_y -= 22

    c.setFont(F_SERIF, 9.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(width / 2.0, curr_y, "Ipinagkaloob sa Intramuros, Lungsod ng Maynila, Pilipinas, ngayong ika-18 ng Abril, 2018.")

    # Signatures at bottom
    sig_y = 75
    # Registrar (Left)
    c.setStrokeColor(colors.HexColor("#64748B"))
    c.setLineWidth(0.8)
    c.line(100, sig_y + 18, 280, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.drawCentredString(190, sig_y + 24, "Atty. Corazon M. Bautista")
    c.setFont(F_SERIF_BOLD, 9)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(190, sig_y + 6, "ATTY. CORAZON M. BAUTISTA")
    c.setFont(F_SERIF, 8)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(190, sig_y - 4, "University Registrar")

    # President (Right)
    c.line(width - 280, sig_y + 18, width - 100, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.drawCentredString(width - 190, sig_y + 24, "Dr. Manuel V. Fernandez")
    c.setFont(F_SERIF_BOLD, 9)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(width - 190, sig_y + 6, "DR. MANUEL V. FERNANDEZ, CESO I")
    c.setFont(F_SERIF, 8)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(width - 190, sig_y - 4, "University President")

    # Embossed Gold Seal Medallion (Center Bottom)
    c.setFillColor(colors.HexColor("#D4AF37"))
    c.circle(width / 2.0, sig_y + 10, 26, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#FFFBEB"))
    c.circle(width / 2.0, sig_y + 10, 23, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#B45309"))
    c.setFont(F_SERIF_BOLD, 6)
    c.drawCentredString(width / 2.0, sig_y + 16, "PAMANTASAN NG")
    c.drawCentredString(width / 2.0, sig_y + 10, "LUNGSOD NG MAYNILA")
    c.drawCentredString(width / 2.0, sig_y + 4, "SEAL OF CONFERMENT")

    c.save()
    print(f"Generated: {output_pdf}")


# =============================================================
# 10. SUPPORTING DOC 4: Training Certificate Food Safety (PDF) - VERIFIED
# =============================================================
def build_supporting_doc4_cert_foodsafety(output_pdf):
    c = canvas.Canvas(output_pdf, pagesize=landscape(letter))
    width, height = landscape(letter) # 792 x 612

    # Decorative Border
    c.setStrokeColor(colors.HexColor("#065F46")) # Emerald Green
    c.setLineWidth(3)
    c.rect(26, 26, width - 52, height - 52)

    c.setStrokeColor(colors.HexColor("#D97706")) # Amber gold
    c.setLineWidth(1)
    c.rect(32, 32, width - 64, height - 64)

    curr_y = height - 80

    # Header Council
    c.setFillColor(colors.HexColor("#065F46"))
    c.setFont(F_SANS_BOLD, 15)
    c.drawCentredString(width / 2.0, curr_y, "HOSPITALITY TRAINING COUNCIL OF THE PHILIPPINES")
    curr_y -= 16

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#4B5563"))
    c.drawCentredString(width / 2.0, curr_y, "National Accreditation Board for Food Hygiene & Hospitality Safety")
    curr_y -= 12

    c.setFont(F_SANS_BOLD, 7.5)
    c.setFillColor(colors.HexColor("#D97706"))
    c.drawCentredString(width / 2.0, curr_y, "ACCREDITATION CODE: HTCP-FS-2022-NCR")
    curr_y -= 30

    # Certificate Title
    c.setFillColor(colors.HexColor("#065F46"))
    c.setFont(F_SERIF_BOLD, 22)
    c.drawCentredString(width / 2.0, curr_y, "CERTIFICATE OF COMPLETION & COMPETENCY")
    c.setStrokeColor(colors.HexColor("#D97706"))
    c.setLineWidth(1.5)
    c.line(width / 2.0 - 180, curr_y - 4, width / 2.0 + 180, curr_y - 4)
    curr_y -= 35

    c.setFont(F_SANS, 10)
    c.setFillColor(colors.HexColor("#374151"))
    c.drawCentredString(width / 2.0, curr_y, "This is to officially certify that")
    curr_y -= 30

    # Recipient
    c.setFont(F_SERIF_BOLD, 22)
    c.setFillColor(colors.HexColor("#111827"))
    c.drawCentredString(width / 2.0, curr_y, "MARCUS ELIJAH NAVARRO")
    c.setStrokeColor(colors.HexColor("#065F46"))
    c.setLineWidth(1)
    c.line(width / 2.0 - 140, curr_y - 4, width / 2.0 + 140, curr_y - 4)
    curr_y -= 28

    c.setFont(F_SANS, 10)
    c.setFillColor(colors.HexColor("#374151"))
    c.drawCentredString(width / 2.0, curr_y, "has satisfactorily completed the prescribed training modules and passed the evaluation for")
    curr_y -= 24

    # Training Course
    c.setFont(F_SERIF_BOLD, 16)
    c.setFillColor(colors.HexColor("#065F46"))
    c.drawCentredString(width / 2.0, curr_y, "FOOD SAFETY & SANITATION STANDARDS (HACCP LEVEL 2)")
    curr_y -= 18

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#4B5563"))
    c.drawCentredString(width / 2.0, curr_y, "Covering Hazard Analysis Critical Control Point Principles, CCP Monitoring Protocols,")
    curr_y -= 11
    c.drawCentredString(width / 2.0, curr_y, "Luxury Banquet Sanitation Procedures, and Cross-Contamination Prevention.")
    curr_y -= 24

    c.setFont(F_SANS_BOLD, 9)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(width / 2.0, curr_y, "Given this 18th day of August, 2022.")
    curr_y -= 12
    c.setFont(F_SANS, 8)
    c.setFillColor(colors.HexColor("#D97706"))
    c.drawCentredString(width / 2.0, curr_y, "Certificate Serial Number: HTCP-HACCP2-2022-8841")

    # Signatures
    sig_y = 80
    c.setStrokeColor(colors.HexColor("#9CA3AF"))
    c.setLineWidth(0.8)

    # Left Trainer
    c.line(100, sig_y + 18, 270, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor("#065F46"))
    c.drawCentredString(185, sig_y + 24, "Chef Gabriel Mendoza")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(185, sig_y + 7, "CHEF GABRIEL MENDOZA, PCFS")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(185, sig_y - 4, "HACCP Master Trainer & Lead Auditor")

    # Right Director
    c.line(width - 270, sig_y + 18, width - 100, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor("#065F46"))
    c.drawCentredString(width - 185, sig_y + 24, "Dr. Patricia Cruz")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(width - 185, sig_y + 7, "DR. PATRICIA CRUZ, DPA")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(width - 185, sig_y - 4, "Executive Director, HTCP")

    # Center Gold Ribbon Rosette
    c.setFillColor(colors.HexColor("#D97706"))
    c.circle(width / 2.0, sig_y + 12, 24, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#FEF3C7"))
    c.circle(width / 2.0, sig_y + 12, 20, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#92400E"))
    c.setFont(F_SANS_BOLD, 6.5)
    c.drawCentredString(width / 2.0, sig_y + 15, "VERIFIED")
    c.drawCentredString(width / 2.0, sig_y + 7, "COMPETENCY")

    c.save()
    print(f"Generated: {output_pdf}")


# =============================================================
# 11. SUPPORTING DOC 5: Training Certificate Service (PDF) - DISCREPANCY
# =============================================================
def build_supporting_doc5_cert_service(output_pdf):
    c = canvas.Canvas(output_pdf, pagesize=landscape(letter))
    width, height = landscape(letter) # 792 x 612

    # Modern Certificate Border
    c.setStrokeColor(colors.HexColor("#4F46E5")) # Indigo
    c.setLineWidth(2)
    c.rect(28, 28, width - 56, height - 56)

    c.setStrokeColor(colors.HexColor("#818CF8"))
    c.setLineWidth(0.8)
    c.rect(32, 32, width - 64, height - 64)

    curr_y = height - 80

    # Header
    c.setFillColor(colors.HexColor("#4F46E5"))
    c.setFont(F_SANS_BOLD, 15)
    c.drawCentredString(width / 2.0, curr_y, "PHILIPPINE HOSPITALITY DEVELOPMENT CENTER")
    curr_y -= 16

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(width / 2.0, curr_y, "Center for Advanced Skills Training in Tourism & Restaurant Operations")
    curr_y -= 12

    c.setFont(F_SANS_BOLD, 8)
    c.setFillColor(colors.HexColor("#4F46E5"))
    c.drawCentredString(width / 2.0, curr_y, "REGISTRATION NO.: PHDC-REG-2020-089")
    curr_y -= 32

    # Title
    c.setFillColor(colors.HexColor("#1E1B4B"))
    c.setFont(F_SERIF_BOLD, 21)
    c.drawCentredString(width / 2.0, curr_y, "CERTIFICATE OF TRAINING COMPLETION")
    c.setStrokeColor(colors.HexColor("#4F46E5"))
    c.setLineWidth(1.5)
    c.line(width / 2.0 - 160, curr_y - 4, width / 2.0 + 160, curr_y - 4)
    curr_y -= 35

    c.setFont(F_SANS, 10)
    c.setFillColor(colors.HexColor("#374151"))
    c.drawCentredString(width / 2.0, curr_y, "This certificate is proudly awarded to")
    curr_y -= 30

    # Recipient
    c.setFont(F_SERIF_BOLD, 22)
    c.setFillColor(colors.HexColor("#1E1B4B"))
    c.drawCentredString(width / 2.0, curr_y, "MARCUS ELIJAH NAVARRO")
    c.setStrokeColor(colors.HexColor("#818CF8"))
    c.setLineWidth(1)
    c.line(width / 2.0 - 140, curr_y - 4, width / 2.0 + 140, curr_y - 4)
    curr_y -= 28

    c.setFont(F_SANS, 10)
    c.setFillColor(colors.HexColor("#374151"))
    c.drawCentredString(width / 2.0, curr_y, "for active participation and successful completion of the workshop on")
    curr_y -= 24

    # CONTROLLED DISCREPANCY: "Foundations of Restaurant Food & Beverage Service"
    # (Resume claimed "Customer Service Excellence in Banquets and Events")
    c.setFont(F_SERIF_BOLD, 16)
    c.setFillColor(colors.HexColor("#4F46E5"))
    c.drawCentredString(width / 2.0, curr_y, "FOUNDATIONS OF RESTAURANT FOOD & BEVERAGE SERVICE")
    curr_y -= 18

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(width / 2.0, curr_y, "Covering Tabletop Mise-en-Place, Sequence of Dining Service, Order Taking,")
    curr_y -= 11
    c.drawCentredString(width / 2.0, curr_y, "and Standard Restaurant Hospitality Etiquette.")
    curr_y -= 24

    c.setFont(F_SANS_BOLD, 9)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(width / 2.0, curr_y, "Conducted on March 14–15, 2020 at Makati City, Philippines.")
    curr_y -= 12

    c.setFont(F_SANS_BOLD, 8)
    c.setFillColor(colors.HexColor("#4F46E5"))
    c.drawCentredString(width / 2.0, curr_y, "Certificate Registration ID: PHDC-WS-2020-03-492")

    # Signatures
    sig_y = 80
    c.setStrokeColor(colors.HexColor("#9CA3AF"))
    c.setLineWidth(0.8)

    # Left
    c.line(100, sig_y + 18, 270, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor("#4F46E5"))
    c.drawCentredString(185, sig_y + 24, "Eduardo R. Villanueva")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(185, sig_y + 7, "EDUARDO R. VILLANUEVA")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(185, sig_y - 4, "Program Director, PHDC")

    # Right
    c.line(width - 270, sig_y + 18, width - 100, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor("#4F46E5"))
    c.drawCentredString(width - 185, sig_y + 24, "Ma. Teresa Ramos")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(width - 185, sig_y + 7, "MA. TERESA RAMOS")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(width - 185, sig_y - 4, "Lead Workshop Facilitator")

    c.save()
    print(f"Generated: {output_pdf}")


# =============================================================
# 12. SUPPORTING DOC 6: Incomplete Certificate (PDF) - UNABLE TO VERIFY
# =============================================================
def build_supporting_doc6_incomplete_cert(output_pdf):
    temp_clean_pdf = output_pdf.replace(".pdf", "_clean.pdf")
    c = canvas.Canvas(temp_clean_pdf, pagesize=landscape(letter))
    width, height = landscape(letter) # 792 x 612

    # Border
    c.setStrokeColor(colors.HexColor("#854D0E")) # Dark Gold
    c.setLineWidth(2.5)
    c.rect(26, 26, width - 52, height - 52)

    c.setStrokeColor(colors.HexColor("#CA8A04"))
    c.setLineWidth(1)
    c.rect(30, 30, width - 60, height - 60)

    curr_y = height - 80

    # Header
    c.setFillColor(colors.HexColor("#854D0E"))
    c.setFont(F_SERIF_BOLD, 17)
    c.drawCentredString(width / 2.0, curr_y, "HOSPITALITY OPERATIONS INSTITUTE")
    curr_y -= 15

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#713F12"))
    c.drawCentredString(width / 2.0, curr_y, "In affiliation with the Federation of Hospitality Certification Boards (FHCB)")
    curr_y -= 30

    # Title
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SERIF_BOLD, 22)
    c.drawCentredString(width / 2.0, curr_y, "CERTIFIED HOSPITALITY SUPERVISOR (CHS)")
    c.setStrokeColor(colors.HexColor("#CA8A04"))
    c.setLineWidth(1.5)
    c.line(width / 2.0 - 170, curr_y - 4, width / 2.0 + 170, curr_y - 4)
    curr_y -= 35

    c.setFont(F_SERIF, 10)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(width / 2.0, curr_y, "The Certification Commission hereby certifies that")
    curr_y -= 28

    # RECIPIENT NAME AREA - INTENTIONALLY DAMAGED / TORN / MISSING
    # The text says [NAME DAMAGED / TORN CORNER]
    # In the clean PDF, we write a ragged line or truncated marker
    c.setFont(F_SERIF_BOLD, 12)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawCentredString(width / 2.0, curr_y, "[ DOCUMENT CLIP / TORN SCAN OCCURRED HERE ]")
    curr_y -= 25

    c.setFont(F_SERIF, 10)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(width / 2.0, curr_y, "having met all professional prerequisites, demonstrated operational leadership competencies,")
    curr_y -= 13
    c.drawCentredString(width / 2.0, curr_y, "and successfully completed the comprehensive certification board examination,")
    curr_y -= 13
    c.drawCentredString(width / 2.0, curr_y, "is officially conferred the professional designation of")
    curr_y -= 24

    c.setFont(F_SERIF_BOLD, 16)
    c.setFillColor(colors.HexColor("#854D0E"))
    c.drawCentredString(width / 2.0, curr_y, "CERTIFIED HOSPITALITY SUPERVISOR (CHS)")
    curr_y -= 25

    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(width / 2.0, curr_y, "Date of Issuance: November 24, 2021  •  Valid Through: November 2026")
    curr_y -= 12

    c.setFont(F_SANS, 8)
    c.setFillColor(colors.HexColor("#713F12"))
    c.drawCentredString(width / 2.0, curr_y, "Credential ID: CHS-PH-2021-0982")

    # Signatures
    sig_y = 75
    c.setStrokeColor(colors.HexColor("#94A3B8"))
    c.setLineWidth(0.8)

    c.line(120, sig_y + 18, 280, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor("#854D0E"))
    c.drawCentredString(200, sig_y + 24, "Arthur Sterling")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(200, sig_y + 7, "ARTHUR STERLING, CHA, CHS")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(200, sig_y - 4, "Chairman, Certification Commission")

    c.line(width - 280, sig_y + 18, width - 120, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor("#854D0E"))
    c.drawCentredString(width - 200, sig_y + 24, "Dr. Linda Ocampo")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(width - 200, sig_y + 7, "DR. LINDA OCAMPO, CHE")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(width - 200, sig_y - 4, "Registrar, FHCB")

    c.save()

    # Now render to image, apply authentic torn corner / clipped section, then save back to PDF!
    doc_fitz = pymupdf.open(temp_clean_pdf)
    pix = doc_fitz[0].get_pixmap(dpi=200)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    doc_fitz.close()
    if os.path.exists(temp_clean_pdf):
        os.remove(temp_clean_pdf)

    # Simulate realistic torn / clipped section over the recipient name
    draw = ImageDraw.Draw(img)
    w, h = img.size
    
    # Calculate coordinate of recipient area
    # In 200 DPI: width=792*200/72 = 2200 px, height=612*200/72 = 1700 px
    # Recipient y in pt was curr_y ~ 400 pt from bottom, which is (612 - 400)/612 * 1700 ~ 588 px from top
    # Let's create a torn paper cutout mask across the recipient area
    center_x = w // 2
    rec_y = int((height - (height - 80 - 15 - 30 - 35 - 28)) * (200 / 72))
    
    # Draw a realistic torn / ripped paper tear with jagged white edges and slight paper shadow
    rip_top = rec_y - 60
    rip_bottom = rec_y + 70
    rip_left = center_x - 450
    rip_right = center_x + 450

    # Draw irregular jagged polygon covering the name
    points = []
    # top edge
    random.seed(1234)
    step = 20
    for x in range(rip_left, rip_right + 1, step):
        y_jit = rip_top + random.randint(-8, 8)
        points.append((x, y_jit))
    # right edge
    for y in range(rip_top, rip_bottom + 1, step):
        x_jit = rip_right + random.randint(-8, 8)
        points.append((x_jit, y))
    # bottom edge
    for x in range(rip_right, rip_left - 1, -step):
        y_jit = rip_bottom + random.randint(-8, 8)
        points.append((x, y_jit))
    # left edge
    for y in range(rip_bottom, rip_top - 1, -step):
        x_jit = rip_left + random.randint(-8, 8)
        points.append((x_jit, y))

    # Fill torn area with missing scan background (white with slight paper burn/tear gray border)
    draw.polygon(points, fill=(255, 255, 255), outline=(210, 205, 195), width=3)
    
    # Draw "MISSING / DAMAGED DUE TO TORN DOCUMENT SCAN" text in the torn area
    # Using default font or simple text
    draw.text((center_x - 220, rec_y - 12), "[ RECIPIENT NAME CUT OFF / MISSING DUE TO TORN CORNER ]", fill=(160, 160, 160))

    # Save to PDF via PyMuPDF
    img_bytes = io_bytes = None
    import io
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    
    doc_out = pymupdf.open()
    rect = pymupdf.Rect(0, 0, width, height)
    page = doc_out.new_page(width=width, height=height)
    page.insert_image(rect, stream=buf.getvalue())
    doc_out.save(output_pdf)
    doc_out.close()
    print(f"Generated (Incomplete PDF): {output_pdf}")


# =============================================================
# 13. GROUND TRUTH TXT FILE
# =============================================================
def build_ground_truth_txt(output_txt):
    content = f"""================================================================================
HOSPITALITY RESUME & SUPPORTING DOCUMENT BENCHMARK DATASET (SINGLE PROFILE)
GROUND TRUTH & VERIFICATION REFERENCE
================================================================================

DOCUMENT IDENTIFIER: Actual Info in the Resume of Marcus Elijah Navarro.txt
TARGET CANDIDATE: Marcus Elijah Navarro
TARGET ROLE: Banquet Operations Supervisor
TOTAL DATASET FILES: 13 Files (6 Resumes, 6 Supporting Documents, 1 Ground Truth)
DATE GENERATED: 2026-09-18

================================================================================
PART 1 — CANDIDATE MASTER PROFILE (STANDARDIZED CANONICAL RECORD)
================================================================================

[PERSONAL & CONTACT INFORMATION]
Full Name:             {CANDIDATE['name']}
Target Position:       {CANDIDATE['target_position']}
Contact Phone Number:  {CANDIDATE['phone']}
Email Address:         {CANDIDATE['email']}
Residential Address:   {CANDIDATE['address']}
LinkedIn / Portfolio:  {CANDIDATE['linkedin']}

[PROFESSIONAL SUMMARY]
"{CANDIDATE['summary']}"

[CORE COMPETENCIES & SKILLS]
1. {CANDIDATE['skills'][0]}
2. {CANDIDATE['skills'][1]}
3. {CANDIDATE['skills'][2]}
4. {CANDIDATE['skills'][3]}
5. {CANDIDATE['skills'][4]}
6. {CANDIDATE['skills'][5]}
7. {CANDIDATE['skills'][6]}
8. {CANDIDATE['skills'][7]}

[CHRONOLOGICAL WORK EXPERIENCE]

1. Employer:     Grand Crest Hotel & Suites
   Location:     Pasay City, Metro Manila
   Job Title:    Banquet Operations Supervisor
   Duration:     June 2022 – Present
   Tenure Type:  Current Employment
   Responsibilities & Achievements:
   • Supervise banquet operations for 3 grand ballrooms and 5 multi-function rooms catering up to 600 attendees per event.
   • Direct pre-shift briefings and manage a team of 18 full-time banquet servers, captains, and on-call catering staff.
   • Coordinate directly with culinary and sales teams to review BEO specifications, ensuring 99% on-time food rollout.
   • Reduced banquet equipment loss and chinaware breakage by 18% through standardized end-of-shift inventory protocols.

2. Employer:     Harborview Hotel & Convention Center
   Location:     Manila Bay, Manila
   Job Title:    Banquet Team Leader / Captain
   Duration:     January 2020 – May 2022
   Tenure Type:  Previous Employment
   Responsibilities & Achievements:
   • Led floor teams of 12 banquet attendants during corporate conventions, diplomatic receptions, and wedding galas.
   • Oversaw banquet table layouts, buffet staging, and silver service standards in compliance with luxury hotel guidelines.
   • Conducted daily equipment inspections and enforced food temperature logs in coordination with kitchen quality control.

3. Employer:     Bayfront Pavilion & Catering Services
   Location:     Parañaque City, Metro Manila
   Job Title:    Banquet Server / Function Attendant
   Duration:     July 2018 – December 2019
   Tenure Type:  Historical Employment
   Responsibilities & Achievements:
   • Delivered plated dinner service, replenished buffet lines, and executed room turnarounds for corporate and private events.
   • Maintained high standards of table grooming, glassware polishing, and rapid function hall clearing.

[EDUCATION & ACADEMIC CREDENTIALS]
Degree:         {CANDIDATE['education']['degree']}
Institution:    {CANDIDATE['education']['institution']}
Graduation:     {CANDIDATE['education']['year']}

[TRAINING & PROFESSIONAL CERTIFICATIONS]
1. Title:   Certified Hospitality Supervisor (CHS)
   Issuer:  Hospitality Operations Institute / FHCB
   Date:    November 2021

2. Title:   Food Safety & Sanitation Standards (HACCP Level 2)
   Issuer:  Hospitality Training Council of the Philippines
   Date:    August 2022

3. Title:   Customer Service Excellence in Banquets and Events
   Issuer:  Philippine Hospitality Development Center
   Date:    March 2020


================================================================================
PART 2 — RESUME BENCHMARK & MULTI-TEMPLATE DETAILS
================================================================================

Across all six (6) resume files below, 100% identical underlying textual data is preserved.
Each format implements a distinctive visual design, layout architecture, and typographic hierarchy.

1. Marcus_Elijah_Navarro_Resume.pdf
   - File Format: Portable Document Format (.pdf)
   - Layout Template: Template 1 - Modern Executive Two-Column Layout
   - Color Palette: Deep Navy (#1A2B4C), Sky Blue (#38BDF8), Crisp White (#FFFFFF)
   - Typographic System: Segoe UI / Arial Sans-Serif Hierarchy
   - Layout Design: 205pt dark sidebar with contact channels, education, and certifications; 372pt main column with executive summary, 2-column competencies, and chronological experience.

2. Marcus_Elijah_Navarro_Resume.docx
   - File Format: Microsoft Word (.docx)
   - Layout Template: Template 2 - Corporate Single-Column Traditional
   - Color Palette: Classic Corporate Navy (#1B365D), Neutral Gray (#222222)
   - Typographic System: Georgia Serif Typography
   - Layout Design: Centered formal header, bottom paragraph borders for section dividers, 2-column borderless table for competencies, standard 0.75-inch margins.

3. Marcus_Elijah_Navarro_Resume.png
   - File Format: Portable Network Graphics (.png) (200 DPI High-Resolution)
   - Layout Template: Template 3 - Contemporary Split-Grid Layout
   - Color Palette: Charcoal (#222B38), Deep Slate Teal (#0F766E), Ice Teal (#F0FDFA)
   - Typographic System: Arial Modern Sans-Serif
   - Layout Design: Slate teal header box with candidate name and role badge, split grid with rounded badge skill tags and vertical timeline markers connecting experience nodes.

4. Marcus_Elijah_Navarro_Resume.jpg
   - File Format: Joint Photographic Experts Group (.jpg) (High Quality 95%)
   - Layout Template: Template 4 - Hospitality Clean Minimalist
   - Color Palette: Warm Burgundy (#800020), Bronze Accent (#B45309), Warm White (#FAFAFA)
   - Typographic System: Calibri / Georgia Hybrid Typography
   - Layout Design: Burgundy and bronze top bar, clean left-aligned typography, generous whitespace, rounded bordered experience cards with burgundy accent strips.

5. Marcus_Elijah_Navarro_Resume_Blurred.png
   - File Format: Portable Network Graphics (.png) (Degraded Image Benchmark)
   - Layout Template: Template 5 - Infographic / Accent-Bar Layout
   - Degradation Parameters: Full-page uniform Gaussian blur (radius = 1.3), uniform contrast reduction (0.94), subtle uniform scanner grain (3,500 jitter points).
   - Degradation Integrity: 100% UNIFORM across entire page. NO black censor bars, NO selective redaction boxes. OCR remains partially readable for benchmark resilience evaluation.

6. Marcus_Elijah_Navarro_Resume_Blurred.jpg
   - File Format: Joint Photographic Experts Group (.jpg) (Degraded Scan Benchmark)
   - Layout Template: Template 6 - Elegant Hotelier Formal Layout
   - Degradation Parameters: Full-page uniform scanner softening (radius = 0.9), moderate JPEG recompression (quality = 40), uniform paper noise texture.
   - Degradation Integrity: 100% UNIFORM across entire page. Preserves hotel crest and gold/navy borders while realistically challenging OCR text extractors.


================================================================================
PART 3 — SUPPORTING DOCUMENTS UNDERLYING TEXT & METADATA
================================================================================

1. Marcus_Elijah_Navarro_COE_Current_Employer.pdf
   - Document Type: Certificate of Employment (COE)
   - Issuing Entity: Grand Crest Hotel & Suites, Pasay City, Metro Manila
   - Recipient / Employee: Marcus Elijah Navarro
   - Certified Position: Banquet Operations Supervisor
   - Certified Period: June 2022 – Present
   - Reference Number: GCH-HRD-2024-0914
   - Signatory: Maria Cristina Santos, CHRP (VP – Human Resources Management)
   - Extractability: Crisp vector text, 100% OCR extractable.

2. Marcus_Elijah_Navarro_COE_Previous_Employer.pdf
   - Document Type: Certificate of Employment and Clearance
   - Issuing Entity: Harborview Hotel & Convention Center, Manila Bay, Manila
   - Recipient / Employee: Marcus Elijah Navarro
   - Certified Position: Banquet Team Leader / Captain
   - Certified Period: June 1, 2020 – May 25, 2022 (CONTROLLED DISCREPANCY)
   - Reference Number: HHCC-HR-2022-0518
   - Signatory: Rolando G. Alvarez, MHRM (Director of Human Capital)
   - Extractability: Crisp vector text, 100% OCR extractable.

3. Marcus_Elijah_Navarro_Diploma.pdf
   - Document Type: Academic University Diploma
   - Issuing Entity: Pamantasan ng Lungsod ng Maynila (PLM) — Intramuros, Manila
   - Conferred Graduate: Marcus Elijah Navarro
   - Degree Conferred: Bachelor of Science in Hospitality Management
   - Conformance Date: April 18, 2018
   - Signatories: Atty. Corazon M. Bautista (Registrar), Dr. Manuel V. Fernandez (President)
   - Extractability: Crisp vector text, 100% OCR extractable.

4. Marcus_Elijah_Navarro_Training_Certificate_FoodSafety.pdf
   - Document Type: Training & Competency Certificate
   - Issuing Entity: Hospitality Training Council of the Philippines (HTCP)
   - Recipient Name: Marcus Elijah Navarro
   - Training Title: Food Safety & Sanitation Standards (HACCP Level 2)
   - Award Date: August 18, 2022
   - Serial Number: HTCP-HACCP2-2022-8841
   - Signatories: Chef Gabriel Mendoza (Lead Auditor), Dr. Patricia Cruz (Executive Director)
   - Extractability: Crisp vector text, 100% OCR extractable.

5. Marcus_Elijah_Navarro_Training_Certificate_Service.pdf
   - Document Type: Training Completion Certificate
   - Issuing Entity: Philippine Hospitality Development Center (PHDC)
   - Recipient Name: Marcus Elijah Navarro
   - Certified Course: Foundations of Restaurant Food & Beverage Service (CONTROLLED DISCREPANCY)
   - Training Dates: March 14–15, 2020
   - Certificate Registration ID: PHDC-WS-2020-03-492
   - Signatories: Eduardo R. Villanueva (Program Director), Ma. Teresa Ramos (Lead Facilitator)
   - Extractability: Crisp vector text, 100% OCR extractable.

6. Marcus_Elijah_Navarro_Incomplete_Certificate.pdf
   - Document Type: Professional Credential Certificate
   - Issuing Entity: Hospitality Operations Institute / FHCB
   - Recipient Name: [MISSING / CUT OFF DUE TO TORN CORNER] (CONTROLLED DATA INADEQUACY)
   - Credential Conferred: Certified Hospitality Supervisor (CHS)
   - Issuance Date: November 24, 2021 (Valid through November 2026)
   - Credential Registration ID: CHS-PH-2021-0982
   - Extractability: Document body is extractable; recipient name token is physically severed/torn, simulating an incomplete document scan.


================================================================================
PART 4 — RESUME ↔ SUPPORTING DOCUMENT VERIFICATION MATRIX
================================================================================

--------------------------------------------------------------------------------
CASE 1: Current Employment Claim Verification
--------------------------------------------------------------------------------
• Resume Claim:
  - Employer: Grand Crest Hotel & Suites
  - Position: Banquet Operations Supervisor
  - Period: June 2022 – Present
• Evidence Document:
  - File: Marcus_Elijah_Navarro_COE_Current_Employer.pdf
  - Certifies: Marcus Elijah Navarro employed as Banquet Operations Supervisor since June 2022 to Present.
• Comparison Result: EXACT MATCH across candidate name, employer, role, and tenure dates.
• Verification Engine Outcome: VERIFIED

--------------------------------------------------------------------------------
CASE 2: Previous Employment Claim Verification
--------------------------------------------------------------------------------
• Resume Claim:
  - Employer: Harborview Hotel & Convention Center
  - Position: Banquet Team Leader / Captain
  - Period: January 2020 – May 2022
• Evidence Document:
  - File: Marcus_Elijah_Navarro_COE_Previous_Employer.pdf
  - Certifies: Marcus Elijah Navarro employed as Banquet Team Leader / Captain from June 1, 2020 to May 25, 2022.
• Comparison Result: DISCREPANCY DETECTED.
  - Certified start date is June 2020, whereas resume claims January 2020 (6-month discrepancy).
  - Position title and employer match; date range mismatch triggers verification flag for human HR review.
• Verification Engine Outcome: DISCREPANCY_FOUND

--------------------------------------------------------------------------------
CASE 3: Tertiary Education Claim Verification
--------------------------------------------------------------------------------
• Resume Claim:
  - Degree: Bachelor of Science in Hospitality Management
  - Institution: Pamantasan ng Lungsod ng Maynila (PLM) — Intramuros, Manila
  - Graduation Year: 2018
• Evidence Document:
  - File: Marcus_Elijah_Navarro_Diploma.pdf
  - Certifies: Conferred degree of Bachelor of Science in Hospitality Management to Marcus Elijah Navarro on April 18, 2018.
• Comparison Result: EXACT MATCH across candidate name, degree title, academic institution, and graduation year.
• Verification Engine Outcome: VERIFIED

--------------------------------------------------------------------------------
CASE 4: Food Safety & HACCP Training Claim Verification
--------------------------------------------------------------------------------
• Resume Claim:
  - Course: Food Safety & Sanitation Standards (HACCP Level 2)
  - Issuer: Hospitality Training Council of the Philippines
  - Date: August 2022
• Evidence Document:
  - File: Marcus_Elijah_Navarro_Training_Certificate_FoodSafety.pdf
  - Certifies: Marcus Elijah Navarro completed Food Safety & Sanitation Standards (HACCP Level 2) on August 18, 2022.
• Comparison Result: EXACT MATCH across course title, issuing council, recipient name, and issuance month/year.
• Verification Engine Outcome: VERIFIED

--------------------------------------------------------------------------------
CASE 5: Hospitality Service Training Claim Verification
--------------------------------------------------------------------------------
• Resume Claim:
  - Course: Customer Service Excellence in Banquets and Events
  - Issuer: Philippine Hospitality Development Center
  - Date: March 2020
• Evidence Document:
  - File: Marcus_Elijah_Navarro_Training_Certificate_Service.pdf
  - Certifies: Foundations of Restaurant Food & Beverage Service completed on March 14–15, 2020.
• Comparison Result: DISCREPANCY DETECTED.
  - Course title mismatch: Resume claims "Customer Service Excellence in Banquets and Events", but submitted official certificate certifies "Foundations of Restaurant Food & Beverage Service".
  - Recipient, issuer, and date match; course curriculum mismatch requires HR review.
• Verification Engine Outcome: DISCREPANCY_FOUND

--------------------------------------------------------------------------------
CASE 6: Professional Credential (CHS) Claim Verification
--------------------------------------------------------------------------------
• Resume Claim:
  - Credential: Certified Hospitality Supervisor (CHS)
  - Issuer: Hospitality Operations Institute / FHCB
  - Date: November 2021
• Evidence Document:
  - File: Marcus_Elijah_Navarro_Incomplete_Certificate.pdf
  - Certifies: Certified Hospitality Supervisor (CHS) issued November 24, 2021 by Hospitality Operations Institute / FHCB.
• Comparison Result: UNABLE TO ATTRIBUTE / INSUFFICIENT EVIDENCE.
  - The document certifies the CHS credential for November 2021, but the recipient name is physically severed/torn off in the uploaded scan.
  - The verification engine cannot deterministically bind the credential to Marcus Elijah Navarro without a legible name anchor.
• Verification Engine Outcome: UNABLE_TO_VERIFY

--------------------------------------------------------------------------------
CASE 7: Historical Employment Claim (Bayfront Pavilion) Verification
--------------------------------------------------------------------------------
• Resume Claim:
  - Employer: Bayfront Pavilion & Catering Services
  - Position: Banquet Server / Function Attendant
  - Period: July 2018 – December 2019
• Evidence Document:
  - [NO DOCUMENT SUBMITTED]
• Comparison Result: PENDING EVIDENCE SUBMISSION.
  - The candidate declared historical employment, but no supporting COE, contract, or clearance was submitted.
• Verification Engine Outcome: PENDING

================================================================================
END OF GROUND TRUTH FILE
================================================================================
"""
    with open(output_txt, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Generated: {output_txt}")


# =============================================================
# MAIN EXECUTION CONTROLLER
# =============================================================
def main():
    print(f"Starting dataset generation in: {OUTPUT_DIR}")

    # 1-6. Resumes
    r1_pdf = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_Resume.pdf")
    r2_docx = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_Resume.docx")
    r3_png = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_Resume.png")
    r4_jpg = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_Resume.jpg")
    r5_bl_png = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_Resume_Blurred.png")
    r6_bl_jpg = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_Resume_Blurred.jpg")

    build_resume_template1(r1_pdf)
    build_resume_template2(r2_docx)
    build_resume_template3(r3_png)
    build_resume_template4(r4_jpg)
    build_resume_template5(r5_bl_png)
    build_resume_template6(r6_bl_jpg)

    # 7-12. Supporting Documents
    d1_coe_curr = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_COE_Current_Employer.pdf")
    d2_coe_prev = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_COE_Previous_Employer.pdf")
    d3_diploma = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_Diploma.pdf")
    d4_safety = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_Training_Certificate_FoodSafety.pdf")
    d5_service = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_Training_Certificate_Service.pdf")
    d6_incomp = os.path.join(OUTPUT_DIR, "Marcus_Elijah_Navarro_Incomplete_Certificate.pdf")

    build_supporting_doc1_coe_current(d1_coe_curr)
    build_supporting_doc2_coe_previous(d2_coe_prev)
    build_supporting_doc3_diploma(d3_diploma)
    build_supporting_doc4_cert_foodsafety(d4_safety)
    build_supporting_doc5_cert_service(d5_service)
    build_supporting_doc6_incomplete_cert(d6_incomp)

    # 13. Ground Truth TXT
    gt_txt = os.path.join(OUTPUT_DIR, "Actual Info in the Resume of Marcus Elijah Navarro.txt")
    build_ground_truth_txt(gt_txt)

    # File count verification
    generated_files = os.listdir(OUTPUT_DIR)
    print(f"\nTotal files in '{OUTPUT_DIR}': {len(generated_files)}")
    for gf in sorted(generated_files):
        sz = os.path.getsize(os.path.join(OUTPUT_DIR, gf))
        print(f"  - {gf} ({sz:,} bytes)")

    if len(generated_files) == 13:
        print("\nAll 13 files successfully generated and verified!")
    else:
        print(f"\nWARNING: Expected 13 files, found {len(generated_files)}")


if __name__ == "__main__":
    main()
