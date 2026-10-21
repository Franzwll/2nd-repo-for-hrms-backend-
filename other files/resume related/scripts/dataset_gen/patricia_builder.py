import os
import sys
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from scripts.dataset_gen.common import (
    F_SANS, F_SANS_BOLD, F_SANS_ITALIC,
    F_SERIF, F_SERIF_BOLD, F_SERIF_ITALIC,
    F_CALIBRI, F_CALIBRI_BOLD, F_CALIBRI_ITALIC,
    F_ARIAL, F_ARIAL_BOLD, F_ARIAL_ITALIC,
    F_TIMES, F_TIMES_BOLD, F_TIMES_ITALIC,
    draw_wrapped, pdf_to_image, apply_uniform_blur, apply_torn_scan_defect, safe_path
)

# ----------------------------------------------------------------------
# PATRICIA ELAINE RAMOS MASTER DATA
# ----------------------------------------------------------------------
PATRICIA_PROFILE = {
    "name": "Patricia Elaine Ramos",
    "phone": "+63 919 621 8045",
    "email": "patricia.ramos.purchasing@outlook.ph",
    "address": "55 Ortigas Avenue, 1605 Pasig City, Metro Manila, Philippines",
    "linkedin": "linkedin.com/in/patricia-ramos-purchasing",
    "education": {
        "degree": "Bachelor of Science in Business Management (Hospitality Logistics)",
        "institution": "De La Salle University (DLSU) – Taft Avenue, Manila",
        "year": "2017"
    },
    "experience": [
        {
            "company": "Sheraton Manila Hotel",
            "location": "Pasay City, Metro Manila",
            "position": "Hospitality Procurement Supervisor",
            "duration": "August 2021 – Present",
            "bullets": [
                "Direct purchasing and receiving operations for a 390-room luxury hotel, 4 dining outlets, and convention ballrooms.",
                "Manage a monthly purchasing expenditure budget of PHP 12M with 99.6% supplier invoice reconciliation accuracy.",
                "Renegotiated meat, seafood, and dairy supply agreements, delivering PHP 2.1M in annual food cost savings.",
                "Supervise receiving dock team of 8 staff, enforcing rigorous temperature logging and defect return procedures."
            ]
        },
        {
            "company": "Holiday Inn & Suites Makati",
            "location": "Makati City, Metro Manila",
            "position": "Purchasing Team Leader",
            "duration": "March 2019 – July 2021",
            "bullets": [
                "Issued and expedited over 450 monthly purchase orders covering engineering spares, guest amenities, and beverage stocks.",
                "Conducted quarterly vendor appraisals and audited supplier food handling certifications.",
                "Coordinated emergency ingredient replenishment during major holiday banquets with zero service disruptions."
            ]
        },
        {
            "company": "Megaworld Hotels & Resorts",
            "location": "Taguig City, Metro Manila",
            "position": "F&B Purchasing Assistant",
            "duration": "June 2017 – February 2019",
            "bullets": [
                "Encoded daily store requisitions, verified delivery receipts, and assisted in month-end stock inventory counts.",
                "Maintained organized vendor files and monitored trade credit expiration dates."
            ]
        }
    ],
    "certifications": [
        {
            "title": "Certified Hospitality Purchasing Executive (CHPE)",
            "issuer": "American Hotel & Lodging Educational Institute (AHLEI)",
            "date": "September 2021"
        },
        {
            "title": "Cold Chain Management & Vendor Audit Protocols",
            "issuer": "Philippine Supply Chain Institute",
            "date": "May 2022"
        },
        {
            "title": "SAP ERP Materials Management in Hospitality",
            "issuer": "Enterprise Logistics Academy Philippines",
            "date": "November 2020"
        }
    ]
}


# ======================================================================
# RESUME DESIGN G (PDF): Deep Amber & Burnt Orange Split Column Layout
# Target Role: Hotel Purchasing Supervisor
# ======================================================================
def build_patricia_resume1_pdf(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=letter)
    w, h = letter

    c.setFillColor(colors.HexColor("#C2410C"))
    c.rect(0, h - 85, w, 85, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#EA580C"))
    c.rect(0, h - 90, w, 5, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 18)
    c.drawString(35, h - 42, "PATRICIA ELAINE RAMOS")
    c.setFillColor(colors.HexColor("#FED7AA"))
    c.setFont(F_SANS_BOLD, 9.5)
    c.drawString(35, h - 60, "HOTEL PURCHASING SUPERVISOR — STRATEGIC SOURCING & PROCUREMENT")

    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.white)
    c.drawRightString(w - 35, h - 40, f"Phone: {PATRICIA_PROFILE['phone']}")
    c.drawRightString(w - 35, h - 52, f"Email: {PATRICIA_PROFILE['email']}")
    c.drawRightString(w - 35, h - 64, f"Location: 55 Ortigas Ave, Pasig City")

    lw = 350
    rx = 35 + lw + 20
    rw = w - rx - 35
    ly = h - 110
    ry = h - 110

    c.setFillColor(colors.HexColor("#C2410C"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(35, ly, "PROFESSIONAL PURCHASING PROFILE")
    ly -= 4
    c.setStrokeColor(colors.HexColor("#C2410C"))
    c.setLineWidth(1)
    c.line(35, ly, 35 + lw, ly)
    ly -= 12

    p_sum = (
        "Strategic, cost-conscious Hotel Purchasing Supervisor with over 6 years of progressive hospitality procurement "
        "and supply chain experience. Proven track record in managing PHP 12M monthly operating budgets, executing high-volume "
        "supplier contracts, optimizing cold chain receiving bay logistics, and implementing SAP MM ERP controls. Experienced "
        "in driving multimillion-peso food cost savings while safeguarding ingredient quality and five-star brand standards."
    )
    ly = draw_wrapped(c, p_sum, 35, ly, lw, F_SANS, 8, colors.HexColor("#334155"), 11)

    ly -= 10
    c.setFillColor(colors.HexColor("#C2410C"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(35, ly, "CHRONOLOGICAL PROCUREMENT EXPERIENCE")
    ly -= 4
    c.line(35, ly, 35 + lw, ly)
    ly -= 12

    for exp in PATRICIA_PROFILE["experience"]:
        c.setFont(F_SANS_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(35, ly, exp["position"].upper())
        c.setFont(F_SANS_BOLD, 8)
        c.setFillColor(colors.HexColor("#C2410C"))
        c.drawRightString(35 + lw, ly, exp["duration"])
        ly -= 10

        c.setFont(F_SANS_ITALIC, 8)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawString(35, ly, f"{exp['company']} — {exp['location']}")
        ly -= 10

        for b in exp["bullets"]:
            b_txt = f"•  {b}"
            ly = draw_wrapped(c, b_txt, 40, ly, lw - 5, F_SANS, 7.5, colors.HexColor("#334155"), 10)
        ly -= 6

    c.setFillColor(colors.HexColor("#FFF7ED"))
    c.rect(rx - 8, 35, rw + 16, h - 145, stroke=1, fill=1)
    c.setStrokeColor(colors.HexColor("#FFEDD5"))

    c.setFillColor(colors.HexColor("#C2410C"))
    c.setFont(F_SANS_BOLD, 9.5)
    c.drawString(rx, ry, "CORE COMPETENCIES")
    ry -= 4
    c.setStrokeColor(colors.HexColor("#EA580C"))
    c.line(rx, ry, rx + rw, ry)
    ry -= 12

    p_skills = [
        "Hotel Supply Chain Sourcing", "SAP MM & Oracle NetSuite", "Vendor Contract Bidding",
        "Cold Chain Receiving QA", "Three-Way PO Matching", "Importation & Customs Clearance",
        "Shrinkage & Variance Audits", "Perishable Par Calculations"
    ]
    for sk in p_skills:
        c.setFont(F_SANS, 7.5)
        c.setFillColor(colors.HexColor("#431407"))
        c.drawString(rx, ry, f"▪ {sk}")
        ry -= 12

    ry -= 10
    c.setFillColor(colors.HexColor("#C2410C"))
    c.setFont(F_SANS_BOLD, 9.5)
    c.drawString(rx, ry, "EDUCATION")
    ry -= 4
    c.line(rx, ry, rx + rw, ry)
    ry -= 12

    c.setFont(F_SANS_BOLD, 8)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(rx, ry, "BS in Business Management")
    ry -= 9
    c.drawString(rx, ry, "(Hospitality Logistics)")
    ry -= 10
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(rx, ry, "De La Salle University (DLSU)")
    ry -= 9
    c.drawString(rx, ry, "Taft Avenue, Manila (2017)")

    ry -= 18
    c.setFillColor(colors.HexColor("#C2410C"))
    c.setFont(F_SANS_BOLD, 9.5)
    c.drawString(rx, ry, "CERTIFICATIONS")
    ry -= 4
    c.line(rx, ry, rx + rw, ry)
    ry -= 12

    for ct in PATRICIA_PROFILE["certifications"]:
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(rx, ry, ct["title"])
        ry -= 9
        c.setFont(F_SANS, 7)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawString(rx, ry, f"{ct['issuer']} ({ct['date']})")
        ry -= 12

    c.save()
    return output_pdf


# ======================================================================
# RESUME DESIGN H (DOCX): Steel Blue & Graphite Executive Layout
# Target Role: Hospitality Procurement Coordinator
# ======================================================================
def build_patricia_resume2_docx(output_docx):
    doc = docx.Document()
    for sec in doc.sections:
        sec.top_margin = Inches(0.65)
        sec.bottom_margin = Inches(0.65)
        sec.left_margin = Inches(0.75)
        sec.right_margin = Inches(0.75)

    def add_sec(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(9)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(title.upper())
        run.font.name = 'Arial'
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x5F)
        pBorder = parse_xml(r'<w:pBdr {}><w:bottom w:val="single" w:sz="6" w:space="2" w:color="1E3A5F"/></w:pBdr>'.format(nsdecls('w')))
        p._p.get_or_add_pPr().append(pBorder)

    p_name = doc.add_paragraph()
    p_name.paragraph_format.space_after = Pt(2)
    p_name.paragraph_format.space_before = Pt(0)
    r_n = p_name.add_run("PATRICIA ELAINE RAMOS")
    r_n.font.name = 'Arial'
    r_n.font.size = Pt(17)
    r_n.font.bold = True
    r_n.font.color.rgb = RGBColor(0x1E, 0x3A, 0x5F)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(4)
    r_sub = p_sub.add_run("HOSPITALITY PROCUREMENT COORDINATOR — VENDOR RELATIONS & SUPPLY LOGISTICS")
    r_sub.font.name = 'Arial'
    r_sub.font.size = Pt(10)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    p_c = doc.add_paragraph()
    p_c.paragraph_format.space_after = Pt(8)
    r_c = p_c.add_run(f"Location: {PATRICIA_PROFILE['address']} | Phone: {PATRICIA_PROFILE['phone']} | Email: {PATRICIA_PROFILE['email']}")
    r_c.font.name = 'Arial'
    r_c.font.size = Pt(8.5)
    r_c.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    add_sec("Executive Procurement Profile")
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_after = Pt(5)
    p_s.paragraph_format.line_spacing = 1.15
    r_s = p_s.add_run(
        "Highly analytical Hospitality Procurement Coordinator with proven ability to evaluate vendor proposals, "
        "administer end-to-end purchase requisitions, and maintain seamless inventory par levels for five-star hotel "
        "operations. Adept at supplier negotiations, food safety cold chain verification, ERP data management, and "
        "enforcing strict SLA compliance across multidisciplinary hotel departments."
    )
    r_s.font.name = 'Calibri'
    r_s.font.size = Pt(9.5)

    add_sec("Technical Procurement & Sourcing Competencies")
    sk_rows = [
        ["Vendor Sourcing & Request for Quotation (RFQ)", "SAP MM Materials Management & PO Issuance"],
        ["Perishable Cold Chain Temperature Verification", "Supplier Bidding & Contract Price Negotiations"],
        ["Three-Way Matching & Receiving Discrepancy Audits", "Par Stock Level Calculations & Requisition Review"],
        ["Customs & Hospitality Import Logistics Clearance", "Month-End Stocktaking & Inventory Shrinkage Control"]
    ]
    tbl = doc.add_table(rows=0, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    for r in sk_rows:
        row = tbl.add_row()
        for idx, col_txt in enumerate(r):
            cell = row.cells[idx]
            cell.width = Inches(3.4)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            run = p.add_run(f"•  {col_txt}")
            run.font.name = 'Calibri'
            run.font.size = Pt(9)

    add_sec("Professional Procurement History")
    for exp in PATRICIA_PROFILE["experience"]:
        p_exp = doc.add_paragraph()
        p_exp.paragraph_format.space_before = Pt(6)
        p_exp.paragraph_format.space_after = Pt(1)
        r_title = p_exp.add_run(exp["position"])
        r_title.bold = True
        r_title.font.name = 'Arial'
        r_title.font.size = Pt(10)
        r_title.font.color.rgb = RGBColor(0x1E, 0x3A, 0x5F)

        p_exp.add_run(" | ")
        r_cmp = p_exp.add_run(f"{exp['company']} — {exp['location']}")
        r_cmp.font.name = 'Calibri'
        r_cmp.font.size = Pt(9.5)

        r_dt = p_exp.add_run(f"  [{exp['duration']}]")
        r_dt.bold = True
        r_dt.font.name = 'Calibri'
        r_dt.font.size = Pt(9)
        r_dt.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

        for b in exp["bullets"]:
            p_b = doc.add_paragraph(style='List Bullet')
            p_b.paragraph_format.space_after = Pt(2)
            p_b.paragraph_format.space_before = Pt(0)
            p_b.paragraph_format.line_spacing = 1.1
            r_b = p_b.add_run(b)
            r_b.font.name = 'Calibri'
            r_b.font.size = Pt(9)

    add_sec("Education & Certifications")
    p_ed = doc.add_paragraph()
    p_ed.paragraph_format.space_after = Pt(2)
    p_ed.add_run(f"Degree: {PATRICIA_PROFILE['education']['degree']} ({PATRICIA_PROFILE['education']['year']})\n").bold = True
    p_ed.add_run(f"Institution: {PATRICIA_PROFILE['education']['institution']}")
    p_ed.runs[0].font.name = 'Calibri'
    p_ed.runs[0].font.size = Pt(9)
    p_ed.runs[1].font.name = 'Calibri'
    p_ed.runs[1].font.size = Pt(8.5)

    for ct in PATRICIA_PROFILE["certifications"]:
        p_ct = doc.add_paragraph(style='List Bullet')
        p_ct.paragraph_format.space_after = Pt(1)
        r_ct = p_ct.add_run(f"{ct['title']} — {ct['issuer']} ({ct['date']})")
        r_ct.font.name = 'Calibri'
        r_ct.font.size = Pt(8.5)

    doc.save(safe_path(output_docx))
    return output_docx


# ======================================================================
# RESUME DESIGN I (PNG): Emerald Green & Sage Minimalist 4-Badge Banner
# Target Role: Food and Beverage Purchasing Officer
# ======================================================================
def build_patricia_resume3_png(output_png):
    temp_pdf = output_png.replace(".png", "_temp.pdf")
    c = canvas.Canvas(safe_path(temp_pdf), pagesize=letter)
    w, h = letter

    c.setFillColor(colors.HexColor("#064E3B"))
    c.rect(0, h - 85, w, 85, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#10B981"))
    c.rect(0, h - 88, w, 3, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 17)
    c.drawString(30, h - 40, "PATRICIA ELAINE RAMOS")
    c.setFillColor(colors.HexColor("#A7F3D0"))
    c.setFont(F_SANS_BOLD, 9.5)
    c.drawString(30, h - 58, "FOOD AND BEVERAGE PURCHASING OFFICER — F&B PROCUREMENT")

    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.white)
    c.drawRightString(w - 30, h - 40, PATRICIA_PROFILE["phone"])
    c.drawRightString(w - 30, h - 52, PATRICIA_PROFILE["email"])
    c.drawRightString(w - 30, h - 64, "Ortigas, Pasig City, Metro Manila")

    badge_w = (w - 60 - 30) / 4
    by = h - 128
    badges = [
        ("PHP 12M", "Monthly Budget"),
        ("100+ SUPPLIERS", "Accredited Network"),
        ("PHP 2.1M", "Food Cost Savings"),
        ("99.6% ACCURACY", "Invoice Reconciliation")
    ]
    for i, (b_val, b_lbl) in enumerate(badges):
        bx = 30 + i * (badge_w + 10)
        c.setFillColor(colors.HexColor("#ECFDF5"))
        c.rect(bx, by, badge_w, 34, stroke=1, fill=1)
        c.setStrokeColor(colors.HexColor("#A7F3D0"))
        c.setFillColor(colors.HexColor("#065F46"))
        c.setFont(F_SANS_BOLD, 9.5)
        c.drawCentredString(bx + badge_w / 2, by + 20, b_val)
        c.setFillColor(colors.HexColor("#047857"))
        c.setFont(F_SANS, 7)
        c.drawCentredString(bx + badge_w / 2, by + 8, b_lbl)

    lw = 345
    rx = 30 + lw + 20
    rw = w - rx - 30
    ly = by - 18
    ry = by - 18

    c.setFillColor(colors.HexColor("#064E3B"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(30, ly, "F&B PROCUREMENT SUMMARY")
    ly -= 4
    c.setStrokeColor(colors.HexColor("#064E3B"))
    c.setLineWidth(1)
    c.line(30, ly, 30 + lw, ly)
    ly -= 12

    fb_sum = (
        "Accomplished Food and Beverage Purchasing Officer adept in sourcing premium meats, seafood, fresh produce, "
        "and vintage wines for luxury dining venues. Specialized in perishable cold chain audits, dock temperature logs, "
        "supplier defect returns, and kitchen store par requisitions. Committed to sustainable farm-to-table sourcing and "
        "cost minimization."
    )
    ly = draw_wrapped(c, fb_sum, 30, ly, lw, F_SANS, 8, colors.HexColor("#334155"), 11)

    ly -= 10
    c.setFillColor(colors.HexColor("#064E3B"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(30, ly, "HOSPITALITY PURCHASING EXPERIENCE")
    ly -= 4
    c.line(30, ly, 30 + lw, ly)
    ly -= 12

    for exp in PATRICIA_PROFILE["experience"]:
        c.setFont(F_SANS_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#064E3B"))
        c.drawString(30, ly, exp["position"].upper())
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#059669"))
        c.drawRightString(30 + lw, ly, exp["duration"])
        ly -= 9

        c.setFont(F_SANS_ITALIC, 7.5)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawString(30, ly, f"{exp['company']} — {exp['location']}")
        ly -= 9

        for b in exp["bullets"]:
            b_txt = f"•  {b}"
            ly = draw_wrapped(c, b_txt, 35, ly, lw - 5, F_SANS, 7.5, colors.HexColor("#334155"), 10)
        ly -= 5

    c.setFillColor(colors.HexColor("#064E3B"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, ry, "F&B SOURCING SKILLS")
    ry -= 4
    c.setStrokeColor(colors.HexColor("#064E3B"))
    c.line(rx, ry, rx + rw, ry)
    ry -= 12

    fb_sk = [
        "Perishable Food Par Levels", "Seafood/Meat Cold Chain QA", "Dock Temperature Logging",
        "Beverage Requisition Audit", "Kitchen Chef Coordination", "Supplier HACCP Compliance",
        "SAP MM PO Generation", "Three-Way Invoice Match"
    ]
    for sk in fb_sk:
        c.setFillColor(colors.HexColor("#ECFDF5"))
        c.rect(rx, ry - 2, rw, 14, stroke=0, fill=1)
        c.setFillColor(colors.HexColor("#065F46"))
        c.setFont(F_SANS_BOLD, 7)
        c.drawString(rx + 5, ry + 2, f"✔  {sk}")
        ry -= 17

    ry -= 8
    c.setFillColor(colors.HexColor("#064E3B"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, ry, "EDUCATION")
    ry -= 4
    c.line(rx, ry, rx + rw, ry)
    ry -= 12

    c.setFont(F_SANS_BOLD, 8)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(rx, ry, "BS Business Management")
    ry -= 9
    c.setFont(F_SANS, 7)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(rx, ry, "De La Salle University (2017)")

    ry -= 16
    c.setFillColor(colors.HexColor("#064E3B"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, ry, "CREDENTIALS")
    ry -= 4
    c.line(rx, ry, rx + rw, ry)
    ry -= 12

    for ct in PATRICIA_PROFILE["certifications"]:
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(rx, ry, ct["title"])
        ry -= 9
        c.setFont(F_SANS, 7)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawString(rx, ry, f"{ct['issuer']} ({ct['date']})")
        ry -= 12

    c.save()
    pdf_to_image(temp_pdf, output_png, scale=2, format="PNG")
    if os.path.exists(safe_path(temp_pdf)):
        os.remove(safe_path(temp_pdf))
    return output_png


# ======================================================================
# RESUME DESIGN J (JPG): Crimson & Warm Sand Corporate Timeline Layout
# Target Role: Restaurant Supply Chain Coordinator
# ======================================================================
def build_patricia_resume4_jpg(output_jpg):
    temp_pdf = output_jpg.replace(".jpg", "_temp.pdf")
    c = canvas.Canvas(safe_path(temp_pdf), pagesize=letter)
    w, h = letter

    c.setFillColor(colors.HexColor("#991B1B"))
    c.rect(0, h - 85, w, 85, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#EF4444"))
    c.rect(0, h - 89, w, 4, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 18)
    c.drawString(35, h - 42, "PATRICIA ELAINE RAMOS")
    c.setFillColor(colors.HexColor("#FECACA"))
    c.setFont(F_SERIF_ITALIC, 10)
    c.drawString(35, h - 60, "RESTAURANT SUPPLY CHAIN COORDINATOR — SUPPLY MOVEMENT & DELIVERY")

    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.white)
    c.drawRightString(w - 35, h - 42, PATRICIA_PROFILE["phone"])
    c.drawRightString(w - 35, h - 54, PATRICIA_PROFILE["email"])
    c.drawRightString(w - 35, h - 66, "55 Ortigas Avenue, Pasig City")

    curr_y = h - 110

    c.setFillColor(colors.HexColor("#991B1B"))
    c.setFont(F_SERIF_BOLD, 10.5)
    c.drawString(35, curr_y, "SUPPLY CHAIN COORDINATION PROFILE")
    curr_y -= 4
    c.setStrokeColor(colors.HexColor("#991B1B"))
    c.setLineWidth(1)
    c.line(35, curr_y, w - 35, curr_y)
    curr_y -= 12

    sc_sum = (
        "Results-focused Restaurant Supply Chain Coordinator with hands-on expertise in coordinating supply movement, "
        "freight logistics, dock receiving schedules, and vendor performance appraisals. Highly skilled in expediting "
        "time-sensitive restaurant ingredient deliveries, monitoring distributor SLA compliance, and mitigating supply "
        "shortages across multi-outlet dining operations."
    )
    curr_y = draw_wrapped(c, sc_sum, 35, curr_y, w - 70, F_SERIF, 8.5, colors.HexColor("#334155"), 11.5)

    curr_y -= 10
    c.setFillColor(colors.HexColor("#991B1B"))
    c.setFont(F_SERIF_BOLD, 10.5)
    c.drawString(35, curr_y, "SUPPLY CHAIN & LOGISTICS EXPERIENCE")
    curr_y -= 4
    c.line(35, curr_y, w - 35, curr_y)
    curr_y -= 14

    for exp in PATRICIA_PROFILE["experience"]:
        c.setFont(F_SERIF_BOLD, 9)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(35, curr_y, exp["position"])
        c.setFont(F_SANS_BOLD, 8)
        c.setFillColor(colors.HexColor("#991B1B"))
        c.drawRightString(w - 35, curr_y, exp["duration"])
        curr_y -= 10

        c.setFont(F_SERIF_ITALIC, 8)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawString(35, curr_y, f"{exp['company']} — {exp['location']}")
        curr_y -= 10

        for b in exp["bullets"]:
            b_txt = f"•  {b}"
            curr_y = draw_wrapped(c, b_txt, 42, curr_y, w - 77, F_SANS, 8, colors.HexColor("#334155"), 10.5)
        curr_y -= 6

    curr_y -= 6
    c.setFillColor(colors.HexColor("#991B1B"))
    c.setFont(F_SERIF_BOLD, 10)
    c.drawString(35, curr_y, "EDUCATION & PROFESSIONAL QUALIFICATIONS")
    curr_y -= 4
    c.line(35, curr_y, w - 35, curr_y)
    curr_y -= 12

    c.setFont(F_SANS_BOLD, 8)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(35, curr_y, f"{PATRICIA_PROFILE['education']['degree']} | {PATRICIA_PROFILE['education']['institution']} ({PATRICIA_PROFILE['education']['year']})")
    curr_y -= 11

    certs_txt = " | ".join([f"{c_item['title']} ({c_item['issuer']})" for c_item in PATRICIA_PROFILE["certifications"]])
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(35, curr_y, f"Certifications: {certs_txt}")

    c.save()
    pdf_to_image(temp_pdf, output_jpg, scale=2, format="JPG", quality=92)
    if os.path.exists(safe_path(temp_pdf)):
        os.remove(safe_path(temp_pdf))
    return output_jpg


# ======================================================================
# RESUME DESIGN K (Blurred PNG): Indigo & Cobalt Right-Sidebar Layout
# Target Role: Hospitality Inventory and Procurement Team Leader
# ======================================================================
def build_patricia_resume5_blurred_png(output_png):
    temp_clean_png = output_png.replace(".png", "_clean.png")
    temp_pdf = output_png.replace(".png", "_temp.pdf")
    c = canvas.Canvas(safe_path(temp_pdf), pagesize=letter)
    w, h = letter

    sb_w = 200
    sb_x = w - sb_w
    c.setFillColor(colors.HexColor("#1E1B4B"))
    c.rect(sb_x, 0, sb_w, h, stroke=0, fill=1)

    c.setFillColor(colors.HexColor("#6366F1"))
    c.rect(sb_x, 0, 4, h, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 14)
    c.drawString(sb_x + 16, h - 50, "PATRICIA ELAINE")
    c.drawString(sb_x + 16, h - 68, "RAMOS")

    c.setFillColor(colors.HexColor("#A5B4FC"))
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(sb_x + 16, h - 86, "INVENTORY & PROCUREMENT LEADER")

    curr_ry = h - 118
    c.setFillColor(colors.HexColor("#C7D2FE"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(sb_x + 16, curr_ry, "CONTACT DETAILS")
    curr_ry -= 6
    c.setStrokeColor(colors.HexColor("#6366F1"))
    c.line(sb_x + 16, curr_ry, sb_x + 80, curr_ry)
    curr_ry -= 12

    contacts = [
        ("PHONE", PATRICIA_PROFILE["phone"]),
        ("EMAIL", PATRICIA_PROFILE["email"]),
        ("LOCATION", "55 Ortigas Ave, Pasig City"),
        ("LINKEDIN", PATRICIA_PROFILE["linkedin"])
    ]
    for lbl, val in contacts:
        c.setFont(F_SANS_BOLD, 7)
        c.setFillColor(colors.HexColor("#818CF8"))
        c.drawString(sb_x + 16, curr_ry, lbl)
        curr_ry -= 9
        c.setFont(F_SANS, 7.5)
        c.setFillColor(colors.white)
        c.drawString(sb_x + 16, curr_ry, val)
        curr_ry -= 12

    curr_ry -= 10
    c.setFillColor(colors.HexColor("#C7D2FE"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(sb_x + 16, curr_ry, "ACADEMIC BACKGROUND")
    curr_ry -= 6
    c.line(sb_x + 16, curr_ry, sb_x + 80, curr_ry)
    curr_ry -= 12

    c.setFont(F_SANS_BOLD, 7.5)
    c.setFillColor(colors.white)
    c.drawString(sb_x + 16, curr_ry, "BS Business Management")
    curr_ry -= 9
    c.drawString(sb_x + 16, curr_ry, "(Hospitality Logistics)")
    curr_ry -= 10
    c.setFont(F_SANS, 7)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawString(sb_x + 16, curr_ry, "De La Salle University (2017)")

    curr_ry -= 20
    c.setFillColor(colors.HexColor("#C7D2FE"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(sb_x + 16, curr_ry, "CERTIFICATIONS")
    curr_ry -= 6
    c.line(sb_x + 16, curr_ry, sb_x + 80, curr_ry)
    curr_ry -= 12

    for ct in PATRICIA_PROFILE["certifications"]:
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.white)
        c.drawString(sb_x + 16, curr_ry, ct["title"])
        curr_ry -= 9
        c.setFont(F_SANS, 7)
        c.setFillColor(colors.HexColor("#94A3B8"))
        c.drawString(sb_x + 16, curr_ry, f"{ct['issuer']} ({ct['date']})")
        curr_ry -= 12

    mw = sb_x - 45
    mx = 25
    curr_ly = h - 45

    c.setFillColor(colors.HexColor("#1E1B4B"))
    c.setFont(F_SANS_BOLD, 10.5)
    c.drawString(mx, curr_ly, "INVENTORY & PROCUREMENT LEADERSHIP SUMMARY")
    curr_ly -= 4
    c.setStrokeColor(colors.HexColor("#1E1B4B"))
    c.setLineWidth(1)
    c.line(mx, curr_ly, mx + mw, curr_ly)
    curr_ly -= 12

    inv_sum = (
        "Dynamic Hospitality Inventory & Procurement Team Leader with extensive experience leading storekeepers, "
        "receiving dock clerks, and purchasing coordinators. Expert in inventory cycle counts, shrinkage reduction, "
        "ERP goods receipts, and par stock optimization across luxury hotel food & beverage outlets and rooms division."
    )
    curr_ly = draw_wrapped(c, inv_sum, mx, curr_ly, mw, F_SANS, 8, colors.HexColor("#334155"), 11)

    curr_ly -= 10
    c.setFillColor(colors.HexColor("#1E1B4B"))
    c.setFont(F_SANS_BOLD, 10.5)
    c.drawString(mx, curr_ly, "CORE INVENTORY COMPETENCIES")
    curr_ly -= 4
    c.line(mx, curr_ly, mx + mw, curr_ly)
    curr_ly -= 12

    skills_inv = [
        "• Inventory Shrinkage & Loss Auditing", "• Month-End Physical Stocktakes",
        "• Store Requisition & Par Calculations", "• Receiving Dock Temperature QA",
        "• SAP MM Goods Receipt (MIGO)", "• Supplier Returns & Credit Tracking",
        "• OS&E and Linen Inventory Flow", "• Team Shift Briefings & Dock Safety"
    ]
    half_w = mw / 2
    for i in range(0, len(skills_inv), 2):
        c.setFont(F_SANS, 7.5)
        c.setFillColor(colors.HexColor("#1E293B"))
        c.drawString(mx, curr_ly, skills_inv[i])
        c.drawString(mx + half_w, curr_ly, skills_inv[i + 1])
        curr_ly -= 11

    curr_ly -= 10
    c.setFillColor(colors.HexColor("#1E1B4B"))
    c.setFont(F_SANS_BOLD, 10.5)
    c.drawString(mx, curr_ly, "PROFESSIONAL WORK EXPERIENCE")
    curr_ly -= 4
    c.line(mx, curr_ly, mx + mw, curr_ly)
    curr_ly -= 13

    for exp in PATRICIA_PROFILE["experience"]:
        c.setFont(F_SANS_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#1E1B4B"))
        c.drawString(mx, curr_ly, exp["position"].upper())
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#4F46E5"))
        c.drawRightString(mx + mw, curr_ly, exp["duration"])
        curr_ly -= 9

        c.setFont(F_SANS_ITALIC, 7.5)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawString(mx, curr_ly, f"{exp['company']} — {exp['location']}")
        curr_ly -= 9

        for b in exp["bullets"]:
            b_txt = f"•  {b}"
            curr_ly = draw_wrapped(c, b_txt, mx + 5, curr_ly, mw - 5, F_SANS, 7.5, colors.HexColor("#334155"), 10)
        curr_ly -= 5

    c.save()
    pdf_to_image(temp_pdf, temp_clean_png, scale=2, format="PNG")
    apply_uniform_blur(temp_clean_png, output_png, blur_radius=1.8, format="PNG")
    if os.path.exists(safe_path(temp_pdf)):
        os.remove(safe_path(temp_pdf))
    if os.path.exists(safe_path(temp_clean_png)):
        os.remove(safe_path(temp_clean_png))
    return output_png


# ======================================================================
# RESUME DESIGN L (Blurred JPG): Charcoal & Mustard Gold Traditional Elegance
# Target Role: Hotel Food Supply Operations Coordinator
# ======================================================================
def build_patricia_resume6_blurred_jpg(output_jpg):
    temp_clean_jpg = output_jpg.replace(".jpg", "_clean.jpg")
    temp_pdf = output_jpg.replace(".jpg", "_temp.pdf")
    c = canvas.Canvas(safe_path(temp_pdf), pagesize=letter)
    w, h = letter

    c.setStrokeColor(colors.HexColor("#262626"))
    c.setLineWidth(2)
    c.rect(20, 20, w - 40, h - 40)
    c.setStrokeColor(colors.HexColor("#CA8A04"))
    c.setLineWidth(1)
    c.rect(24, 24, w - 48, h - 48)

    c.setFillColor(colors.HexColor("#262626"))
    c.setFont(F_SERIF_BOLD, 17)
    c.drawCentredString(w / 2, h - 50, "PATRICIA ELAINE RAMOS")
    c.setFont(F_SERIF_ITALIC, 9.5)
    c.setFillColor(colors.HexColor("#A16207"))
    c.drawCentredString(w / 2, h - 65, "HOTEL FOOD SUPPLY OPERATIONS COORDINATOR")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#555555"))
    c.drawCentredString(w / 2, h - 77, f"{PATRICIA_PROFILE['address']} • {PATRICIA_PROFILE['phone']} • {PATRICIA_PROFILE['email']}")

    curr_y = h - 96

    def sec_head(title):
        nonlocal curr_y
        c.setFillColor(colors.HexColor("#262626"))
        c.setFont(F_SERIF_BOLD, 9.5)
        c.drawString(35, curr_y, title.upper())
        curr_y -= 3
        c.setStrokeColor(colors.HexColor("#CA8A04"))
        c.setLineWidth(0.8)
        c.line(35, curr_y, w - 35, curr_y)
        curr_y -= 11

    sec_head("Food Supply Operations Summary")
    fs_sum = (
        "Dedicated Hotel Food Supply Operations Coordinator with rigorous standards in culinary ingredient receiving, "
        "cold chain monitoring, and vendor compliance. Experienced in managing perishable food safety protocols, dock "
        "inspection routines, emergency food stock replenishment, and cross-departmental coordination with executive chefs."
    )
    curr_y = draw_wrapped(c, fs_sum, 35, curr_y, w - 70, F_SERIF, 8, colors.HexColor("#333333"), 10.5)

    curr_y -= 8
    sec_head("Key Food Supply Competencies")
    skills = [
        "• Perishable Receiving Bay QA", "• Cold Chain Temperature Controls",
        "• Supplier HACCP Cert Verification", "• Meat/Seafood Defect Rejections",
        "• Kitchen Requisition Fulfillment", "• Emergency Stock Replenishment",
        "• Three-Way Delivery Reconciliation", "• Vendor Quarterly Performance Audits"
    ]
    half_w = (w - 70) / 2
    for i in range(0, len(skills), 2):
        c.setFont(F_SANS, 7.5)
        c.setFillColor(colors.HexColor("#222222"))
        c.drawString(35, curr_y, skills[i])
        c.drawString(35 + half_w, curr_y, skills[i + 1])
        curr_y -= 10

    curr_y -= 8
    sec_head("Chronological Professional Experience")
    for exp in PATRICIA_PROFILE["experience"]:
        c.setFont(F_SERIF_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#262626"))
        c.drawString(35, curr_y, exp["position"])
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#A16207"))
        c.drawRightString(w - 35, curr_y, exp["duration"])
        curr_y -= 9

        c.setFont(F_SERIF_ITALIC, 7.5)
        c.setFillColor(colors.HexColor("#555555"))
        c.drawString(35, curr_y, f"{exp['company']} — {exp['location']}")
        curr_y -= 9

        for b in exp["bullets"]:
            b_txt = f"•  {b}"
            curr_y = draw_wrapped(c, b_txt, 42, curr_y, w - 77, F_SANS, 7.5, colors.HexColor("#333333"), 9.5)
        curr_y -= 4

    curr_y -= 6
    sec_head("Education & Professional Accreditations")
    c.setFont(F_SERIF_BOLD, 8)
    c.setFillColor(colors.HexColor("#222222"))
    c.drawString(35, curr_y, f"{PATRICIA_PROFILE['education']['degree']} — {PATRICIA_PROFILE['education']['institution']} ({PATRICIA_PROFILE['education']['year']})")
    curr_y -= 10

    for ct in PATRICIA_PROFILE["certifications"]:
        c.setFont(F_SANS, 7)
        c.setFillColor(colors.HexColor("#444444"))
        c.drawString(42, curr_y, f"•  {ct['title']} — {ct['issuer']} ({ct['date']})")
        curr_y -= 9

    c.save()
    pdf_to_image(temp_pdf, temp_clean_jpg, scale=2, format="JPG", quality=92)
    apply_uniform_blur(temp_clean_jpg, output_jpg, blur_radius=1.8, format="JPG", quality=85)
    if os.path.exists(safe_path(temp_pdf)):
        os.remove(safe_path(temp_pdf))
    if os.path.exists(safe_path(temp_clean_jpg)):
        os.remove(safe_path(temp_clean_jpg))
    return output_jpg


# ======================================================================
# SUPPORTING DOCUMENTS FOR PATRICIA ELAINE RAMOS (6 Documents)
# ======================================================================

def build_patricia_doc1_coe_current(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=letter)
    w, h = letter

    c.setFillColor(colors.HexColor("#0F172A"))
    c.rect(0, h - 85, w, 85, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#C2410C"))
    c.setFont(F_SERIF_BOLD, 18)
    c.drawString(35, h - 42, "SHERATON MANILA HOTEL")
    c.setFont(F_SANS, 8)
    c.setFillColor(colors.HexColor("#E2E8F0"))
    c.drawString(35, h - 58, "Materials Management & Procurement Department")
    c.drawRightString(w - 35, h - 42, "Andrews Avenue, Pasay City 1309")
    c.drawRightString(w - 35, h - 54, "Metro Manila, Philippines")
    c.drawRightString(w - 35, h - 66, "Tel: +63 2 7902 1800 | hr.manila@sheraton.com")

    curr_y = h - 120
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(35, curr_y, "DATE OF ISSUE: October 1, 2026")
    curr_y -= 12
    c.drawString(35, curr_y, "REFERENCE NUMBER: SMH-HR-COE-2026-1104")
    curr_y -= 25

    c.setFont(F_SERIF_BOLD, 13)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, curr_y, "CERTIFICATE OF EMPLOYMENT")
    curr_y -= 6
    c.setStrokeColor(colors.HexColor("#C2410C"))
    c.setLineWidth(1)
    c.line(w / 2 - 120, curr_y, w / 2 + 120, curr_y)
    curr_y -= 25

    body = (
        "TO WHOM IT MAY CONCERN:\n\n"
        "This is to certify that MS. PATRICIA ELAINE RAMOS has been employed with Sheraton Manila Hotel from "
        "August 2021 up to the present date.\n\n"
        "She currently serves as Hospitality Procurement Supervisor within the Materials Management Department. In this position, "
        "Ms. Ramos is responsible for managing hotel-wide procurement budgets of approximately PHP 12 Million monthly, evaluating "
        "supplier bids, negotiating contracts for food & beverage supplies and operating equipment, supervising receiving dock "
        "operations, and ensuring SAP MM ERP database integrity.\n\n"
        "Ms. Ramos has performed her duties with utmost professionalism, financial integrity, and dedication. "
        "She is an employee in good standing.\n\n"
        "This certification is issued upon the request of Ms. Ramos for verification of employment and career evaluation purposes."
    )
    for p in body.split('\n\n'):
        curr_y = draw_wrapped(c, p, 35, curr_y, w - 70, F_SERIF, 9.5, colors.HexColor("#1E293B"), 13.5)
        curr_y -= 10

    curr_y -= 20
    c.setFont(F_SERIF_BOLD, 9.5)
    c.drawString(35, curr_y, "GERARDO M. VALBUENA, CHRP")
    curr_y -= 11
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(35, curr_y, "Director of Human Resources")
    curr_y -= 10
    c.drawString(35, curr_y, "Sheraton Manila Hotel")

    c.save()
    return output_pdf


def build_patricia_doc2_coe_previous(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=letter)
    w, h = letter

    c.setFillColor(colors.HexColor("#065F46"))
    c.rect(0, h - 80, w, 80, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 17)
    c.drawString(35, h - 40, "HOLIDAY INN & SUITES MAKATI")
    c.setFont(F_SANS, 8)
    c.drawString(35, h - 55, "Glorietta Mall Complex, Palm Drive, Ayala Center, Makati City")
    c.drawRightString(w - 35, h - 45, "People & Culture Department")
    c.drawRightString(w - 35, h - 57, "Email: hr@holidayinnmakati.com")

    curr_y = h - 115
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(35, curr_y, "DATE: July 30, 2021")
    curr_y -= 12
    c.drawString(35, curr_y, "CERTIFICATE ID: HISM-HR-2021-075")
    curr_y -= 25

    c.setFont(F_SERIF_BOLD, 12.5)
    c.setFillColor(colors.HexColor("#065F46"))
    c.drawCentredString(w / 2, curr_y, "CERTIFICATE OF EMPLOYMENT AND CLEARANCE")
    curr_y -= 6
    c.setStrokeColor(colors.HexColor("#10B981"))
    c.setLineWidth(1)
    c.line(w / 2 - 140, curr_y, w / 2 + 140, curr_y)
    curr_y -= 25

    body = (
        "TO WHOM IT MAY CONCERN:\n\n"
        "This is to formally certify that MS. PATRICIA ELAINE RAMOS was employed with Holiday Inn & Suites Makati "
        "from June 1, 2019 to July 20, 2021.\n\n"
        "She held the position of Purchasing Team Leader within the Finance and Materials Department. During her employment, "
        "Ms. Ramos handled purchase order creation, vendor compliance evaluations, emergency F&B replenishment, and quarterly "
        "goods store inventory counts.\n\n"
        "Ms. Ramos has successfully completed all company clearance requirements and has fulfilled all accountabilities with the hotel.\n\n"
        "This certificate is issued upon her request for professional reference and legal employment verification."
    )
    for p in body.split('\n\n'):
        curr_y = draw_wrapped(c, p, 35, curr_y, w - 70, F_SERIF, 9.5, colors.HexColor("#1E293B"), 13.5)
        curr_y -= 10

    curr_y -= 25
    c.setFont(F_SERIF_BOLD, 9.5)
    c.drawString(35, curr_y, "MARILOU S. TANCHINGCO")
    curr_y -= 11
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(35, curr_y, "Human Resources Operations Manager")
    curr_y -= 10
    c.drawString(35, curr_y, "Holiday Inn & Suites Makati")

    c.save()
    return output_pdf


def build_patricia_doc3_diploma(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=landscape(letter))
    w, h = landscape(letter)

    c.setStrokeColor(colors.HexColor("#065F46"))
    c.setLineWidth(4)
    c.rect(24, 24, w - 48, h - 48)
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(1.5)
    c.rect(30, 30, w - 60, h - 60)

    c.setFillColor(colors.HexColor("#065F46"))
    c.setFont(F_SERIF_BOLD, 13)
    c.drawCentredString(w / 2, h - 70, "DE LA SALLE UNIVERSITY")
    c.setFont(F_SERIF_ITALIC, 10)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(w / 2, h - 86, "Manila, Philippines • Founded 1911")

    c.setFont(F_SERIF, 10.5)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(w / 2, h - 140, "The Board of Trustees and the Faculty of the Ramon V. del Rosario College of Business")
    c.drawCentredString(w / 2, h - 158, "hereby confer upon")

    c.setFont(F_SERIF_BOLD, 22)
    c.setFillColor(colors.HexColor("#065F46"))
    c.drawCentredString(w / 2, h - 200, "PATRICIA ELAINE RAMOS")
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.line(w / 2 - 180, h - 206, w / 2 + 180, h - 206)

    c.setFont(F_SERIF, 10.5)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(w / 2, h - 235, "who has completed the prescribed course of study, the degree of")

    c.setFont(F_SERIF_BOLD, 15)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(w / 2, h - 265, "BACHELOR OF SCIENCE IN BUSINESS MANAGEMENT")
    c.setFont(F_SERIF_BOLD, 12)
    c.setFillColor(colors.HexColor("#065F46"))
    c.drawCentredString(w / 2, h - 285, "Major in Hospitality Logistics & Supply Chain")

    c.setFont(F_SERIF, 10)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 320, "Given at Manila, Philippines this 14th day of October, 2017.")

    c.setFont(F_SERIF_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 4, 90, "DR. EMILIANO C. TANADA")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(w / 4, 76, "Dean, College of Business")

    c.setFont(F_SERIF_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString((3 * w) / 4, 90, "BR. BERNARD S. OCA, FSC")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString((3 * w) / 4, 76, "President, De La Salle University")

    c.save()
    return output_pdf


def build_patricia_doc4_cert_coldchain(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=landscape(letter))
    w, h = landscape(letter)

    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.setLineWidth(3)
    c.rect(26, 26, w - 52, h - 52)
    c.setStrokeColor(colors.HexColor("#BAE6FD"))
    c.setLineWidth(1)
    c.rect(32, 32, w - 64, h - 64)

    c.setFillColor(colors.HexColor("#0369A1"))
    c.setFont(F_SERIF_BOLD, 15)
    c.drawCentredString(w / 2, h - 70, "PHILIPPINE SUPPLY CHAIN INSTITUTE")
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(w / 2, h - 85, "Center for Professional Logistics & Cold Chain Excellence — Taguig City")

    c.setFont(F_SERIF_BOLD, 16)
    c.setFillColor(colors.HexColor("#0369A1"))
    c.drawCentredString(w / 2, h - 130, "CERTIFICATE OF EXECUTIVE TRAINING")

    c.setFont(F_SERIF_ITALIC, 10.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 160, "This is to certify that")

    c.setFont(F_SERIF_BOLD, 20)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, h - 195, "PATRICIA ELAINE RAMOS")
    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.line(w / 2 - 160, h - 200, w / 2 + 160, h - 200)

    c.setFont(F_SERIF, 10)
    c.drawCentredString(w / 2, h - 225, "has completed the executive masterclass and operational audit training in")

    c.setFont(F_SERIF_BOLD, 13.5)
    c.setFillColor(colors.HexColor("#0369A1"))
    c.drawCentredString(w / 2, h - 250, "COLD CHAIN MANAGEMENT & VENDOR AUDIT PROTOCOLS")

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 280, "Focused on HACCP Receiving Temperature Audits, Perishable Food Transport,")
    c.drawCentredString(w / 2, h - 295, "and Supplier SLA Quality Assurance (40 Hours Professional Training).")

    c.drawCentredString(w / 2, h - 330, "Issued on May 19, 2022  |  Accreditation ID: PSCI-CCM-2022-519")

    c.setFont(F_SERIF_BOLD, 9)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, 85, "ENGR. DOMINGO C. SALAZAR, CSCP")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(w / 2, 72, "Director of Training, Philippine Supply Chain Institute")

    c.save()
    return output_pdf


def build_patricia_doc5_cert_warehouse(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=landscape(letter))
    w, h = landscape(letter)

    c.setStrokeColor(colors.HexColor("#D97706"))
    c.setLineWidth(3)
    c.rect(28, 28, w - 56, h - 56)
    c.setStrokeColor(colors.HexColor("#FDE68A"))
    c.setLineWidth(1)
    c.rect(34, 34, w - 68, h - 68)

    c.setFillColor(colors.HexColor("#B45309"))
    c.setFont(F_SERIF_BOLD, 15)
    c.drawCentredString(w / 2, h - 70, "ENTERPRISE LOGISTICS ACADEMY PHILIPPINES")
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(w / 2, h - 85, "Continuing Education Division — Makati City, Philippines")

    c.setFont(F_SERIF_BOLD, 16)
    c.setFillColor(colors.HexColor("#B45309"))
    c.drawCentredString(w / 2, h - 130, "CERTIFICATE OF ATTENDANCE")

    c.setFont(F_SERIF_ITALIC, 10.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 160, "This is presented to")

    c.setFont(F_SERIF_BOLD, 20)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, h - 195, "PATRICIA ELAINE RAMOS")
    c.setStrokeColor(colors.HexColor("#D97706"))
    c.line(w / 2 - 160, h - 200, w / 2 + 160, h - 200)

    c.setFont(F_SERIF, 10)
    c.drawCentredString(w / 2, h - 225, "for completion of the practical workshop course in")

    c.setFont(F_SERIF_BOLD, 13.5)
    c.setFillColor(colors.HexColor("#B45309"))
    c.drawCentredString(w / 2, h - 250, "FOUNDATIONS OF WAREHOUSE GOODS RECEIVING AND PALLET COUNTING")

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 280, "Covering dock inspection, manual tally sheet recording, and pallet stacking protocols.")
    c.drawCentredString(w / 2, h - 305, "Awarded: November 25, 2020  |  Certificate No: ELAP-WHS-2020-1125")

    c.setFont(F_SERIF_BOLD, 9)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, 85, "LEONARDO M. CRISOSTOMO")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(w / 2, 72, "Academy Registrar, Enterprise Logistics Academy Philippines")

    c.save()
    return output_pdf


def build_patricia_doc6_incomplete_cert(output_pdf):
    temp_clean_pdf = output_pdf.replace(".pdf", "_clean.pdf")
    c = canvas.Canvas(safe_path(temp_clean_pdf), pagesize=landscape(letter))
    w, h = landscape(letter)

    c.setStrokeColor(colors.HexColor("#1E3A8A"))
    c.setLineWidth(3)
    c.rect(26, 26, w - 52, h - 52)
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(1)
    c.rect(32, 32, w - 64, h - 64)

    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.setFont(F_SERIF_BOLD, 16)
    c.drawCentredString(w / 2, h - 70, "AMERICAN HOTEL & LODGING EDUCATIONAL INSTITUTE")
    c.setFont(F_SANS, 8)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(w / 2, h - 85, "AHLEI Global Hospitality Professional Certification Commission")

    c.setFont(F_SERIF_BOLD, 17)
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.drawCentredString(w / 2, h - 130, "EXECUTIVE PROFESSIONAL DESIGNATION")

    c.setFont(F_SERIF_ITALIC, 10.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 160, "Be it known that the Institute hereby recognizes")

    c.setFont(F_SERIF_BOLD, 20)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(w / 2, h - 195, "PATRICIA ELAINE RAMOS")

    c.setFont(F_SERIF, 10)
    c.drawCentredString(w / 2, h - 225, "as having met all professional standards and rigorous examinations for")

    c.setFont(F_SERIF_BOLD, 15)
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.drawCentredString(w / 2, h - 250, "CERTIFIED HOSPITALITY PURCHASING EXECUTIVE (CHPE)")

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(w / 2, h - 280, "Demonstrating superior competence in hospitality procurement, negotiations, and ethics.")
    c.drawCentredString(w / 2, h - 305, "Certificate Code: CHPE-INTL-2021-9801  |  Conferred: September 22, 2021")

    c.setFont(F_SERIF_BOLD, 9)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, 85, "RICHARD E. STERLING, CHA")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(w / 2, 72, "President & CEO, AHLEI Certification Board")

    c.save()

    apply_torn_scan_defect(temp_clean_pdf, output_pdf, torn_box=(220, 175, 570, 215))
    if os.path.exists(safe_path(temp_clean_pdf)):
        os.remove(safe_path(temp_clean_pdf))
    return output_pdf


# ======================================================================
# GROUND TRUTH TXT FOR PATRICIA ELAINE RAMOS
# ======================================================================
def build_patricia_ground_truth_txt(output_txt):
    content = f"""================================================================================
HOSPITALITY RESUME & SUPPORTING DOCUMENT BENCHMARK DATASET
GROUND TRUTH & VERIFICATION REFERENCE
================================================================================

DOCUMENT IDENTIFIER: Actual Info in the Resume of Patricia Elaine Ramos.txt
TARGET CANDIDATE: Patricia Elaine Ramos
CAREER DOMAIN: Hotel purchasing, procurement, inventory, supplier coordination, hospitality supply chain
TOTAL DATASET FILES: 13 Files (6 Resumes, 6 Supporting Documents, 1 Ground Truth)
DATE GENERATED: 2026-10-04

================================================================================
PART 1 — CANDIDATE MASTER PROFILE (STANDARDIZED CANONICAL RECORD)
================================================================================

[PERSONAL & CONTACT INFORMATION]
Full Name:             Patricia Elaine Ramos
Target Position:       Hotel Purchasing Supervisor
Contact Phone Number:  +63 919 621 8045
Email Address:         patricia.ramos.purchasing@outlook.ph
Residential Address:   55 Ortigas Avenue, 1605 Pasig City, Metro Manila, Philippines
LinkedIn / Portfolio:  linkedin.com/in/patricia-ramos-purchasing

[PROFESSIONAL SUMMARY]
"Strategic, cost-conscious Hotel Purchasing & Procurement Supervisor with over 6 years of experience directing supply chain operations, supplier bidding, and inventory control for luxury hotels and integrated resorts. Proven expertise in SAP MM ERP systems, perishable food par levels, luxury OS&E sourcing, and vendor contract renegotiation. Successfully slashed departmental procurement expenditure by PHP 4.5M annually while securing on-time delivery across 100+ accredited culinary and operational suppliers."

[CORE COMPETENCIES & SKILLS]
1. Hotel Supply Chain Management & Strategic Sourcing (F&B and OS&E)
2. SAP Materials Management (MM) & Oracle NetSuite Procurement Administration
3. Vendor Contract Bidding, Pricing Negotiation & Supplier SLA Enforcement
4. Perishable Cold Chain Auditing, Receiving Bay QA & Par Level Calculations
5. Purchase Order (PO) Lifecycle Management, Three-Way Matching & Cost Auditing
6. Hospitality Importation Logistics, Customs Clearance & Freight Tracking
7. Cross-Departmental Requisition Fulfillment with Kitchens & Housekeeping
8. Quarterly Inventory Stocktakes, Shrinkage Audits & Variance Reconciliation

[CHRONOLOGICAL WORK EXPERIENCE]

1. Employer:     Sheraton Manila Hotel
   Location:     Pasay City, Metro Manila
   Job Title:    Hospitality Procurement Supervisor
   Duration:     August 2021 – Present
   Tenure Type:  Current Employment
   Responsibilities & Achievements:
   • Direct purchasing and receiving operations for a 390-room luxury hotel, 4 dining outlets, and convention ballrooms.
   • Manage a monthly purchasing expenditure budget of PHP 12M with 99.6% supplier invoice reconciliation accuracy.
   • Renegotiated meat, seafood, and dairy supply agreements, delivering PHP 2.1M in annual food cost savings.
   • Supervise receiving dock team of 8 staff, enforcing rigorous temperature logging and defect return procedures.

2. Employer:     Holiday Inn & Suites Makati
   Location:     Makati City, Metro Manila
   Job Title:    Purchasing Team Leader
   Duration:     March 2019 – July 2021
   Tenure Type:  Previous Employment
   Responsibilities & Achievements:
   • Issued and expedited over 450 monthly purchase orders covering engineering spares, guest amenities, and beverage stocks.
   • Conducted quarterly vendor appraisals and audited supplier food handling certifications.
   • Coordinated emergency ingredient replenishment during major holiday banquets with zero service disruptions.

3. Employer:     Megaworld Hotels & Resorts
   Location:     Taguig City, Metro Manila
   Job Title:    F&B Purchasing Assistant
   Duration:     June 2017 – February 2019
   Tenure Type:  Historical Employment
   Responsibilities & Achievements:
   • Encoded daily store requisitions, verified delivery receipts, and assisted in month-end stock inventory counts.
   • Maintained organized vendor files and monitored trade credit expiration dates.

[EDUCATION & ACADEMIC CREDENTIALS]
Degree:         Bachelor of Science in Business Management (Hospitality Logistics)
Institution:    De La Salle University (DLSU) – Taft Avenue, Manila
Graduation:     2017

[TRAINING & PROFESSIONAL CERTIFICATIONS]
1. Title:   Certified Hospitality Purchasing Executive (CHPE)
   Issuer:  American Hotel & Lodging Educational Institute (AHLEI)
   Date:    September 2021

2. Title:   Cold Chain Management & Vendor Audit Protocols
   Issuer:  Philippine Supply Chain Institute
   Date:    May 2022

3. Title:   SAP ERP Materials Management in Hospitality
   Issuer:  Enterprise Logistics Academy Philippines
   Date:    November 2020


================================================================================
PART 2 — SIX RESUME GROUND TRUTHS
================================================================================

1. Patricia_Elaine_Ramos_Hotel_Purchasing_Supervisor.pdf
   - Format: PDF
   - Layout Design: Design G (Deep Amber & Burnt Orange Split Column Layout)
   - Target Position: Hotel Purchasing Supervisor
   - Career Emphasis: Hotel purchasing operations, supplier negotiations, PO management, cost control.
   - Textual Content: Full Canonical Master Profile text preserved.

2. Patricia_Elaine_Ramos_Hospitality_Procurement_Coordinator.docx
   - Format: DOCX
   - Layout Design: Design H (Steel Blue & Graphite Executive Document Layout)
   - Target Position: Hospitality Procurement Coordinator
   - Career Emphasis: Procurement workflows, vendor accreditation, contract compliance, three-way matching.
   - Summary: Highlights vendor proposal evaluations, RFQ management, and department SLA compliance.

3. Patricia_Elaine_Ramos_Food_and_Beverage_Purchasing_Officer.png
   - Format: PNG
   - Layout Design: Design I (Emerald Green & Sage Minimalist 4-Badge Banner)
   - Target Position: Food and Beverage Purchasing Officer
   - Career Emphasis: F&B procurement, fresh produce, meat/seafood cold chain auditing, chef requisitions.
   - Summary: Focuses on farm-to-table sourcing, dock temperature logs, and food cost variance reduction.

4. Patricia_Elaine_Ramos_Restaurant_Supply_Chain_Coordinator.jpg
   - Format: JPG
   - Layout Design: Design J (Crimson & Warm Sand Corporate Timeline Layout)
   - Target Position: Restaurant Supply Chain Coordinator
   - Career Emphasis: Supply delivery timelines, receiving dock operations, freight & logistics.
   - Summary: Highlights multi-outlet restaurant supply movement, distributor SLA tracking, and delivery reliability.

5. Patricia_Elaine_Ramos_Hospitality_Inventory_and_Procurement_Team_Leader_Blurred.png
   - Format: Blurred PNG (Uniform light blur applied for OCR testing)
   - Layout Design: Design K (Indigo & Cobalt Right-Sidebar Layout)
   - Target Position: Hospitality Inventory and Procurement Team Leader
   - Career Emphasis: Team supervision, month-end stocktaking, inventory shrinkage prevention.
   - Text Degradation: Light uniform Gaussian blur across the entire image.

6. Patricia_Elaine_Ramos_Hotel_Food_Supply_Operations_Coordinator_Blurred.jpg
   - Format: Blurred JPG (Uniform light blur applied for OCR testing)
   - Layout Design: Design L (Charcoal & Mustard Gold Traditional Elegance)
   - Target Position: Hotel Food Supply Operations Coordinator
   - Career Emphasis: Culinary supply operations, dock QA, emergency replenishment, vendor reviews.
   - Text Degradation: Light uniform defocus and compression simulation across the entire page.


================================================================================
PART 3 — SUPPORTING DOCUMENTS UNDERLYING TEXT & METADATA
================================================================================

1. Patricia_Elaine_Ramos_COE_01.pdf
   - Document Type: Certificate of Employment (COE)
   - Issuing Entity: Sheraton Manila Hotel
   - Recipient / Employee: Patricia Elaine Ramos
   - Certified Position: Hospitality Procurement Supervisor
   - Certified Period: August 2021 – Present
   - Extraction Mode: Digital Vector Text

2. Patricia_Elaine_Ramos_COE_02.pdf
   - Document Type: Certificate of Employment and Clearance
   - Issuing Entity: Holiday Inn & Suites Makati
   - Recipient / Employee: Patricia Elaine Ramos
   - Certified Position: Purchasing Team Leader
   - Certified Period: June 1, 2019 – July 20, 2021 (CONTROLLED DISCREPANCY)
   - Extraction Mode: Digital Vector Text

3. Patricia_Elaine_Ramos_Diploma.pdf
   - Document Type: Academic University Diploma
   - Issuing Institution: De La Salle University (DLSU)
   - Graduate Name: Patricia Elaine Ramos
   - Conferred Degree: Bachelor of Science in Business Management (Major in Hospitality Logistics & Supply Chain)
   - Graduation Year: 2017 (October 14, 2017)
   - Extraction Mode: Digital Vector Text

4. Patricia_Elaine_Ramos_Training_Certificate_01.pdf
   - Document Type: Executive Training Certificate
   - Issuing Entity: Philippine Supply Chain Institute
   - Recipient Name: Patricia Elaine Ramos
   - Certified Course: Cold Chain Management & Vendor Audit Protocols
   - Certification Date: May 19, 2022
   - Extraction Mode: Digital Vector Text

5. Patricia_Elaine_Ramos_Training_Certificate_02.pdf
   - Document Type: Technical Workshop Certificate
   - Issuing Entity: Enterprise Logistics Academy Philippines
   - Recipient Name: Patricia Elaine Ramos
   - Certified Course: Foundations of Warehouse Goods Receiving and Pallet Counting (CONTROLLED DISCREPANCY)
   - Certification Date: November 25, 2020
   - Extraction Mode: Digital Vector Text

6. Patricia_Elaine_Ramos_Professional_Certification.pdf
   - Document Type: Executive Professional Designation Certificate
   - Issuing Entity: American Hotel & Lodging Educational Institute (AHLEI)
   - Recipient Name: [UNREADABLE / TORN / MISSING RECIPIENT NAME] (CONTROLLED UNABLE TO VERIFY)
   - Certified Title: Certified Hospitality Purchasing Executive (CHPE)
   - Issue Date: September 22, 2021
   - Extraction Mode: OCR-Test Document with Simulated Severe Physical Tear


================================================================================
PART 4 — RESUME ↔ SUPPORTING DOCUMENT VERIFICATION MATRIX
================================================================================

DOCUMENT: Patricia_Elaine_Ramos_COE_01.pdf
TYPE: Certificate of Employment
COMPARED RESUME CLAIM: Sheraton Manila Hotel | Hospitality Procurement Supervisor | August 2021 – Present
EXPECTED RESULT: VERIFIED
FIELDS:
  Employer   = MATCH (Sheraton Manila Hotel)
  Position   = MATCH (Hospitality Procurement Supervisor)
  Start Date = MATCH (August 2021)
  End Date   = MATCH (Present)
REASON: Exact match across candidate name, employer, role, and tenure.

--------------------------------------------------------------------------------

DOCUMENT: Patricia_Elaine_Ramos_COE_02.pdf
TYPE: Certificate of Employment and Clearance
COMPARED RESUME CLAIM: Holiday Inn & Suites Makati | Purchasing Team Leader | March 2019 – July 2021
EXPECTED RESULT: DISCREPANCY_FOUND
FIELDS:
  Employer   = MATCH (Holiday Inn & Suites Makati)
  Position   = MATCH (Purchasing Team Leader)
  Start Date = MISMATCH (Resume claims March 2019; COE certifies June 1, 2019)
  End Date   = MATCH (July 2021)
REASON: Official COE certifies employment starting June 2019, whereas resume claims start date of March 2019 (3-month discrepancy). Requires HR review.

--------------------------------------------------------------------------------

DOCUMENT: Patricia_Elaine_Ramos_Diploma.pdf
TYPE: Academic University Diploma
COMPARED RESUME CLAIM: Bachelor of Science in Business Management (Hospitality Logistics) | De La Salle University | 2017
EXPECTED RESULT: VERIFIED
FIELDS:
  Institution = MATCH (De La Salle University)
  Degree      = MATCH (Bachelor of Science in Business Management)
  Year        = MATCH (2017)
REASON: Exact match across candidate name, institution, degree title, and graduation year.

--------------------------------------------------------------------------------

DOCUMENT: Patricia_Elaine_Ramos_Training_Certificate_01.pdf
TYPE: Executive Training Certificate
COMPARED RESUME CLAIM: Cold Chain Management & Vendor Audit Protocols | Philippine Supply Chain Institute | May 2022
EXPECTED RESULT: VERIFIED
FIELDS:
  Course Title = MATCH (Cold Chain Management & Vendor Audit Protocols)
  Issuer       = MATCH (Philippine Supply Chain Institute)
  Date         = MATCH (May 2022)
REASON: Exact match across candidate name, training title, issuer, and date.

--------------------------------------------------------------------------------

DOCUMENT: Patricia_Elaine_Ramos_Training_Certificate_02.pdf
TYPE: Technical Workshop Certificate
COMPARED RESUME CLAIM: SAP ERP Materials Management in Hospitality | Enterprise Logistics Academy Philippines | November 2020
EXPECTED RESULT: DISCREPANCY_FOUND
FIELDS:
  Issuer       = MATCH (Enterprise Logistics Academy Philippines)
  Date         = MATCH (November 2020)
  Course Title = MISMATCH (Resume claims 'SAP ERP Materials Management in Hospitality'; Certificate certifies 'Foundations of Warehouse Goods Receiving and Pallet Counting')
REASON: Certificate course title does not match claimed training program. Requires HR review.

--------------------------------------------------------------------------------

DOCUMENT: Patricia_Elaine_Ramos_Professional_Certification.pdf
TYPE: Professional Certification
COMPARED RESUME CLAIM: Certified Hospitality Purchasing Executive (CHPE) | AHLEI | September 2021
EXPECTED RESULT: UNABLE_TO_VERIFY
FIELDS:
  Recipient Name = UNREADABLE / MISSING (Severed due to torn scan artifact)
  Issuer         = MATCH (American Hotel & Lodging Educational Institute)
  Credential     = MATCH (Certified Hospitality Purchasing Executive - CHPE)
REASON: Recipient identity cannot be verified because the name portion of the credential document is severed/torn off.

--------------------------------------------------------------------------------

DOCUMENT: [DOCUMENT NOT SUBMITTED]
TYPE: Certificate of Employment (Historical)
COMPARED RESUME CLAIM: Megaworld Hotels & Resorts | F&B Purchasing Assistant | June 2017 – February 2019
EXPECTED RESULT: PENDING
FIELDS:
  Evidence Status = PENDING_SUBMISSION
REASON: Supporting certificate of employment has not been provided by applicant for historical employment.
================================================================================
"""
    with open(safe_path(output_txt), 'w', encoding='utf-8') as f:
        f.write(content)
    return output_txt
