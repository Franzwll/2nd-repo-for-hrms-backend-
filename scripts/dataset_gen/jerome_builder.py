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
# JEROME VINCENT ALONZO MASTER DATA
# ----------------------------------------------------------------------
JEROME_PROFILE = {
    "name": "Jerome Vincent Alonzo",
    "phone": "+63 918 734 5092",
    "email": "jerome.alonzo.transport@outlook.ph",
    "address": "22 Roxas Boulevard, 1300 Pasay City, Metro Manila, Philippines",
    "linkedin": "linkedin.com/in/jerome-alonzo-transport",
    "education": {
        "degree": "Bachelor of Science in Hospitality Management",
        "institution": "Polytechnic University of the Philippines (PUP) – Sta. Mesa, Manila",
        "year": "2018"
    },
    "experience": [
        {
            "company": "City of Dreams Manila",
            "location": "Parañaque City, Metro Manila",
            "position": "Guest Transportation Supervisor",
            "duration": "November 2021 – Present",
            "bullets": [
                "Supervise daily operations of a 35-vehicle luxury fleet, 22 chauffeurs, and 12 valet parking attendants.",
                "Achieved 100% on-time airport pickup execution across 2,400+ VIP executive movements in 2023.",
                "Cut average valet car retrieval times from 7.5 minutes to 3.8 minutes by reorganizing parking zone staging.",
                "Maintained a zero-preventable-accident record across 450,000 cumulative fleet kilometers."
            ]
        },
        {
            "company": "Resorts World Manila (Newport World Resorts)",
            "location": "Pasay City, Metro Manila",
            "position": "Airport Transfer Captain",
            "duration": "June 2019 – October 2021",
            "bullets": [
                "Stationed at NAIA Terminals 1, 2, and 3 to welcome casino high-rollers and international hotel guests.",
                "Coordinated private luxury van transfers and expedited curbside departures with airport security.",
                "Conducted pre-shift vehicle cleanliness audits and verified driver GPS logs."
            ]
        },
        {
            "company": "Golden Phoenix Hotel Manila",
            "location": "Pasay City, Metro Manila",
            "position": "Fleet & Valet Dispatcher",
            "duration": "May 2018 – May 2019",
            "bullets": [
                "Assigned shuttle trips to drivers, answered guest transportation inquiries, and monitored valet ticket returns.",
                "Balanced daily valet cash collections and maintained accurate vehicle log sheets."
            ]
        }
    ],
    "certifications": [
        {
            "title": "Professional Chauffeur & VIP Mobility Services Executive",
            "issuer": "American Hotel & Lodging Educational Institute (AHLEI)",
            "date": "December 2020"
        },
        {
            "title": "Defensive Driving & Executive Fleet Safety",
            "issuer": "Automobile Association Philippines (AAP)",
            "date": "April 2022"
        },
        {
            "title": "Airport Runway & Terminal Dispatch Coordination",
            "issuer": "Manila Airport Authority Training Center",
            "date": "August 2019"
        }
    ]
}


# ======================================================================
# RESUME DESIGN M (PDF): Midnight Navy & Signal Red Dynamic Layout
# Target Role: Hotel Transportation Services Supervisor
# ======================================================================
def build_jerome_resume1_pdf(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=letter)
    w, h = letter

    sb_w = 205
    c.setFillColor(colors.HexColor("#0B192C"))
    c.rect(0, 0, sb_w, h, stroke=0, fill=1)

    c.setFillColor(colors.HexColor("#DC2626"))
    c.rect(sb_w - 4, 0, 4, h, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 15)
    c.drawString(18, h - 50, "JEROME VINCENT")
    c.drawString(18, h - 68, "ALONZO")

    c.setFillColor(colors.HexColor("#F87171"))
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(18, h - 86, "HOTEL TRANSPORTATION SUPERVISOR")

    curr_y = h - 118
    c.setFillColor(colors.HexColor("#FECACA"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(18, curr_y, "CONTACT INFORMATION")
    curr_y -= 6
    c.setStrokeColor(colors.HexColor("#DC2626"))
    c.line(18, curr_y, 75, curr_y)
    curr_y -= 12

    contacts = [
        ("PHONE", JEROME_PROFILE["phone"]),
        ("EMAIL", JEROME_PROFILE["email"]),
        ("LOCATION", "22 Roxas Boulevard"),
        ("", "Pasay City, Metro Manila"),
        ("LINKEDIN", JEROME_PROFILE["linkedin"])
    ]
    for lbl, val in contacts:
        if lbl:
            c.setFont(F_SANS_BOLD, 7)
            c.setFillColor(colors.HexColor("#EF4444"))
            c.drawString(18, curr_y, lbl)
            curr_y -= 9
        c.setFont(F_SANS, 7.5)
        c.setFillColor(colors.white)
        c.drawString(18, curr_y, val)
        curr_y -= 11

    curr_y -= 10
    c.setFillColor(colors.HexColor("#FECACA"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(18, curr_y, "EDUCATION")
    curr_y -= 6
    c.setStrokeColor(colors.HexColor("#DC2626"))
    c.line(18, curr_y, 75, curr_y)
    curr_y -= 12

    c.setFont(F_SANS_BOLD, 8)
    c.setFillColor(colors.white)
    c.drawString(18, curr_y, "BS in Hospitality Management")
    curr_y -= 10
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawString(18, curr_y, "Polytechnic University")
    curr_y -= 9
    c.drawString(18, curr_y, "of the Philippines (PUP)")
    curr_y -= 9
    c.setFont(F_SANS_BOLD, 7.5)
    c.setFillColor(colors.HexColor("#F87171"))
    c.drawString(18, curr_y, "Graduated: 2018")

    curr_y -= 20
    c.setFillColor(colors.HexColor("#FECACA"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(18, curr_y, "CERTIFICATIONS")
    curr_y -= 6
    c.setStrokeColor(colors.HexColor("#DC2626"))
    c.line(18, curr_y, 75, curr_y)
    curr_y -= 12

    for ct in JEROME_PROFILE["certifications"]:
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.white)
        c.drawString(18, curr_y, ct["title"])
        curr_y -= 9
        c.setFont(F_SANS, 7)
        c.setFillColor(colors.HexColor("#94A3B8"))
        c.drawString(18, curr_y, f"{ct['issuer']} ({ct['date']})")
        curr_y -= 12

    mx = sb_w + 18
    mw = w - mx - 20
    my = h - 45

    c.setFillColor(colors.HexColor("#0B192C"))
    c.setFont(F_SANS_BOLD, 10.5)
    c.drawString(mx, my, "EXECUTIVE MOBILITY PROFILE")
    my -= 4
    c.setStrokeColor(colors.HexColor("#0B192C"))
    c.setLineWidth(1)
    c.line(mx, my, mx + mw, my)
    my -= 13

    j_sum = (
        "Energetic, safety-certified Hotel Transportation Services Supervisor with over 6 years of frontline and "
        "leadership experience managing executive fleets, airport arrival lounges, and valet operations for five-star "
        "integrated resorts. Proven track record in orchestrating 150+ daily VIP airport transfers, maintaining a zero-accident "
        "fleet record, reducing guest vehicle retrieval wait times to under 4 minutes, and directing team brigades of up to 25 "
        "chauffeurs and valet captains."
    )
    my = draw_wrapped(c, j_sum, mx, my, mw, F_SANS, 8.5, colors.HexColor("#334155"), 11.5)

    my -= 10
    c.setFillColor(colors.HexColor("#0B192C"))
    c.setFont(F_SANS_BOLD, 10.5)
    c.drawString(mx, my, "FLEET MANAGEMENT & MOBILITY COMPETENCIES")
    my -= 4
    c.line(mx, my, mx + mw, my)
    my -= 12

    skills_j = [
        "• Executive Chauffeur Fleet Management", "• Airport Arrival Staging & Luggage Custody",
        "• Valet Parking Retrieval & Key Flow", "• Defensive Driving & Fleet Safety Protocols",
        "• Chauffeur Rostering & Grooming Audits", "• Fleet Telematics, GPS & Mileage Logs",
        "• Transport Billing & Front Desk Settlement", "• Emergency Roadside Incident Response"
    ]
    half_mw = mw / 2
    for i in range(0, len(skills_j), 2):
        c.setFont(F_SANS, 8)
        c.setFillColor(colors.HexColor("#1E293B"))
        c.drawString(mx, my, skills_j[i])
        c.drawString(mx + half_mw, my, skills_j[i + 1])
        my -= 11

    my -= 10
    c.setFillColor(colors.HexColor("#0B192C"))
    c.setFont(F_SANS_BOLD, 10.5)
    c.drawString(mx, my, "PROFESSIONAL TRANSPORTATION EXPERIENCE")
    my -= 4
    c.line(mx, my, mx + mw, my)
    my -= 13

    for exp in JEROME_PROFILE["experience"]:
        c.setFont(F_SANS_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(mx, my, exp["position"].upper())
        c.setFont(F_SANS_BOLD, 8)
        c.setFillColor(colors.HexColor("#DC2626"))
        c.drawRightString(mx + mw, my, exp["duration"])
        my -= 10

        c.setFont(F_SANS_ITALIC, 8)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawString(mx, my, f"{exp['company']} — {exp['location']}")
        my -= 10

        for b in exp["bullets"]:
            b_txt = f"•  {b}"
            my = draw_wrapped(c, b_txt, mx + 5, my, mw - 5, F_SANS, 8, colors.HexColor("#334155"), 10.5)
        my -= 6

    c.save()
    return output_pdf


# ======================================================================
# RESUME DESIGN N (DOCX): Dark Slate & Amber Gold Corporate Layout
# Target Role: Resort Guest Mobility Coordinator
# ======================================================================
def build_jerome_resume2_docx(output_docx):
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
        run.font.name = 'Segoe UI'
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
        pBorder = parse_xml(r'<w:pBdr {}><w:bottom w:val="single" w:sz="6" w:space="2" w:color="D97706"/></w:pBdr>'.format(nsdecls('w')))
        p._p.get_or_add_pPr().append(pBorder)

    p_name = doc.add_paragraph()
    p_name.paragraph_format.space_after = Pt(2)
    p_name.paragraph_format.space_before = Pt(0)
    r_n = p_name.add_run("JEROME VINCENT ALONZO")
    r_n.font.name = 'Segoe UI'
    r_n.font.size = Pt(17)
    r_n.font.bold = True
    r_n.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(4)
    r_sub = p_sub.add_run("RESORT GUEST MOBILITY COORDINATOR — FLEET & DISPATCH SERVICES")
    r_sub.font.name = 'Segoe UI'
    r_sub.font.size = Pt(10)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(0xD9, 0x77, 0x06)

    p_c = doc.add_paragraph()
    p_c.paragraph_format.space_after = Pt(8)
    r_c = p_c.add_run(f"Address: {JEROME_PROFILE['address']} | Contact: {JEROME_PROFILE['phone']} | Email: {JEROME_PROFILE['email']}")
    r_c.font.name = 'Segoe UI'
    r_c.font.size = Pt(8.5)
    r_c.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    add_sec("Guest Mobility Coordination Profile")
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_after = Pt(5)
    p_s.paragraph_format.line_spacing = 1.15
    r_s = p_s.add_run(
        "Proactive Resort Guest Mobility Coordinator specialized in directing golf cart fleets, inter-property shuttles, "
        "VIP guest transport, and accessible mobility services for sprawling luxury integrated resorts. Experienced in "
        "dispatch timing, flight tracking integration, curbside welcoming, and ensuring total passenger comfort and safety."
    )
    r_s.font.name = 'Calibri'
    r_s.font.size = Pt(9.5)

    add_sec("Mobility & Fleet Management Competencies")
    sk_rows = [
        ["Resort Buggy & Shuttle Fleet Dispatch", "NAIA Airport Curbside VIP Welcoming"],
        ["Real-Time Flight Tracking & Delay Adjustments", "Valet Staging Optimization & Traffic Control"],
        ["Defensive Driving & Chauffeur Road Safety", "Driver Pre-Shift Inspections & Telematics"],
        ["Inter-Property Shuttle Route Scheduling", "Luggage Custody & Baggage Claim Protocols"]
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

    add_sec("Professional Fleet & Mobility History")
    for exp in JEROME_PROFILE["experience"]:
        p_exp = doc.add_paragraph()
        p_exp.paragraph_format.space_before = Pt(6)
        p_exp.paragraph_format.space_after = Pt(1)
        r_title = p_exp.add_run(exp["position"])
        r_title.bold = True
        r_title.font.name = 'Segoe UI'
        r_title.font.size = Pt(10)
        r_title.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

        p_exp.add_run(" | ")
        r_cmp = p_exp.add_run(f"{exp['company']} — {exp['location']}")
        r_cmp.font.name = 'Calibri'
        r_cmp.font.size = Pt(9.5)

        r_dt = p_exp.add_run(f"  [{exp['duration']}]")
        r_dt.bold = True
        r_dt.font.name = 'Calibri'
        r_dt.font.size = Pt(9)
        r_dt.font.color.rgb = RGBColor(0xD9, 0x77, 0x06)

        for b in exp["bullets"]:
            p_b = doc.add_paragraph(style='List Bullet')
            p_b.paragraph_format.space_after = Pt(2)
            p_b.paragraph_format.space_before = Pt(0)
            p_b.paragraph_format.line_spacing = 1.1
            r_b = p_b.add_run(b)
            r_b.font.name = 'Calibri'
            r_b.font.size = Pt(9)

    add_sec("Education & Credentials")
    p_ed = doc.add_paragraph()
    p_ed.paragraph_format.space_after = Pt(2)
    p_ed.add_run(f"Degree: {JEROME_PROFILE['education']['degree']} ({JEROME_PROFILE['education']['year']})\n").bold = True
    p_ed.add_run(f"Institution: {JEROME_PROFILE['education']['institution']}")
    p_ed.runs[0].font.name = 'Calibri'
    p_ed.runs[0].font.size = Pt(9)
    p_ed.runs[1].font.name = 'Calibri'
    p_ed.runs[1].font.size = Pt(8.5)

    for ct in JEROME_PROFILE["certifications"]:
        p_ct = doc.add_paragraph(style='List Bullet')
        p_ct.paragraph_format.space_after = Pt(1)
        r_ct = p_ct.add_run(f"{ct['title']} — {ct['issuer']} ({ct['date']})")
        r_ct.font.name = 'Calibri'
        r_ct.font.size = Pt(8.5)

    doc.save(safe_path(output_docx))
    return output_docx


# ======================================================================
# RESUME DESIGN O (PNG): Deep Teal & Electric Blue Aviation/Transfer Theme
# Target Role: Hotel Airport Transfer Coordinator
# ======================================================================
def build_jerome_resume3_png(output_png):
    temp_pdf = output_png.replace(".png", "_temp.pdf")
    c = canvas.Canvas(safe_path(temp_pdf), pagesize=letter)
    w, h = letter

    c.setFillColor(colors.HexColor("#0D5C75"))
    c.rect(0, h - 85, w, 85, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#06B6D4"))
    c.rect(0, h - 88, w, 3, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 17)
    c.drawString(30, h - 40, "JEROME VINCENT ALONZO")
    c.setFillColor(colors.HexColor("#A5F3FC"))
    c.setFont(F_SANS_BOLD, 9.5)
    c.drawString(30, h - 58, "HOTEL AIRPORT TRANSFER COORDINATOR — TERMINAL & CHAUFFEUR DISPATCH")

    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.white)
    c.drawRightString(w - 30, h - 40, JEROME_PROFILE["phone"])
    c.drawRightString(w - 30, h - 52, JEROME_PROFILE["email"])
    c.drawRightString(w - 30, h - 64, "Roxas Boulevard, Pasay City, Metro Manila")

    lw = 345
    rx = 30 + lw + 20
    rw = w - rx - 30
    ly = h - 110
    ry = h - 110

    c.setFillColor(colors.HexColor("#0D5C75"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(30, ly, "AIRPORT TRANSFER COORDINATION PROFILE")
    ly -= 4
    c.setStrokeColor(colors.HexColor("#0D5C75"))
    c.setLineWidth(1)
    c.line(30, ly, 30 + lw, ly)
    ly -= 12

    apt_sum = (
        "Service-oriented Hotel Airport Transfer Coordinator with 6+ years of frontline expertise at NAIA Terminals 1, 2, "
        "and 3. Highly skilled in flight arrival synchronization, VIP meet-and-greet curbside staging, luggage custody transfer, "
        "chauffeur brigade dispatch, and premium limousine escort for five-star hotel guests and casino high-rollers."
    )
    ly = draw_wrapped(c, apt_sum, 30, ly, lw, F_SANS, 8, colors.HexColor("#334155"), 11)

    ly -= 10
    c.setFillColor(colors.HexColor("#0D5C75"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(30, ly, "AIRPORT & TRANSPORT EXPERIENCE")
    ly -= 4
    c.line(30, ly, 30 + lw, ly)
    ly -= 12

    for exp in JEROME_PROFILE["experience"]:
        c.setFont(F_SANS_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#0D5C75"))
        c.drawString(30, ly, exp["position"].upper())
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#0284C7"))
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

    c.setFillColor(colors.HexColor("#0D5C75"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, ry, "TRANSFER COMPETENCIES")
    ry -= 4
    c.setStrokeColor(colors.HexColor("#0D5C75"))
    c.line(rx, ry, rx + rw, ry)
    ry -= 12

    apt_sk = [
        "NAIA Curbside Meet & Greet", "Flight Delay Synchronization", "VIP Chauffeur Limousine Fleet",
        "Luggage Claim Tag Verification", "Airport Security Coordination", "Defensive Driving Standards",
        "GPS Fleet Telematics Audits", "Guest Transfer Billing Settlement"
    ]
    for sk in apt_sk:
        c.setFillColor(colors.HexColor("#ECFEFF"))
        c.rect(rx, ry - 2, rw, 14, stroke=0, fill=1)
        c.setFillColor(colors.HexColor("#0891B2"))
        c.setFont(F_SANS_BOLD, 7)
        c.drawString(rx + 5, ry + 2, f"✈  {sk}")
        ry -= 17

    ry -= 8
    c.setFillColor(colors.HexColor("#0D5C75"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, ry, "EDUCATION")
    ry -= 4
    c.line(rx, ry, rx + rw, ry)
    ry -= 12

    c.setFont(F_SANS_BOLD, 8)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(rx, ry, "BS Hospitality Management")
    ry -= 9
    c.setFont(F_SANS, 7)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(rx, ry, "Polytechnic Univ of the Philippines (2018)")

    ry -= 16
    c.setFillColor(colors.HexColor("#0D5C75"))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, ry, "CREDENTIALS")
    ry -= 4
    c.line(rx, ry, rx + rw, ry)
    ry -= 12

    for ct in JEROME_PROFILE["certifications"]:
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
# RESUME DESIGN P (JPG): Onyx & Silver Gray Sleek Modern Layout
# Target Role: Hospitality Shuttle Operations Officer
# ======================================================================
def build_jerome_resume4_jpg(output_jpg):
    temp_pdf = output_jpg.replace(".jpg", "_temp.pdf")
    c = canvas.Canvas(safe_path(temp_pdf), pagesize=letter)
    w, h = letter

    c.setFillColor(colors.HexColor("#18181B"))
    c.rect(0, h - 85, w, 85, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#71717A"))
    c.rect(0, h - 89, w, 4, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 18)
    c.drawString(35, h - 42, "JEROME VINCENT ALONZO")
    c.setFillColor(colors.HexColor("#D4D4D8"))
    c.setFont(F_SERIF_ITALIC, 10)
    c.drawString(35, h - 60, "HOSPITALITY SHUTTLE OPERATIONS OFFICER — FLEET SCHEDULES & LOGISTICS")

    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.white)
    c.drawRightString(w - 35, h - 42, JEROME_PROFILE["phone"])
    c.drawRightString(w - 35, h - 54, JEROME_PROFILE["email"])
    c.drawRightString(w - 35, h - 66, "Pasay City, Metro Manila")

    card_w = (w - 70 - 20) / 3
    card_y = h - 138
    stats = [
        ("35 VEHICLES", "Luxury Fleet Management"),
        ("0 PREVENTABLE ACCIDENTS", "450,000+ Cumulative Km"),
        ("3.8 MIN WAIT TIME", "Optimized Valet Retrieval")
    ]
    for i, (s_val, s_lbl) in enumerate(stats):
        cx = 35 + i * (card_w + 10)
        c.setFillColor(colors.HexColor("#F4F4F5"))
        c.rect(cx, card_y, card_w, 38, stroke=1, fill=1)
        c.setStrokeColor(colors.HexColor("#E4E4E7"))
        c.setFillColor(colors.HexColor("#18181B"))
        c.setFont(F_SANS_BOLD, 9.5)
        c.drawCentredString(cx + card_w / 2, card_y + 22, s_val)
        c.setFillColor(colors.HexColor("#52525B"))
        c.setFont(F_SANS, 7)
        c.drawCentredString(cx + card_w / 2, card_y + 10, s_lbl)

    curr_y = card_y - 20
    c.setFillColor(colors.HexColor("#18181B"))
    c.setFont(F_SERIF_BOLD, 10.5)
    c.drawString(35, curr_y, "SHUTTLE OPERATIONS & FLEET PROFILE")
    curr_y -= 4
    c.setStrokeColor(colors.HexColor("#18181B"))
    c.setLineWidth(1)
    c.line(35, curr_y, w - 35, curr_y)
    curr_y -= 12

    sh_sum = (
        "Dedicated Hospitality Shuttle Operations Officer experienced in managing fixed-route shuttles, hotel-to-casino "
        "transfers, shopping express vans, and airport loops. Adept at driver shift assignments, passenger load tracking, "
        "fuel consumption auditing, preventive vehicle maintenance, and ensuring consistent five-star guest courtesy."
    )
    curr_y = draw_wrapped(c, sh_sum, 35, curr_y, w - 70, F_SERIF, 8.5, colors.HexColor("#334155"), 11.5)

    curr_y -= 10
    c.setFillColor(colors.HexColor("#18181B"))
    c.setFont(F_SERIF_BOLD, 10.5)
    c.drawString(35, curr_y, "CHRONOLOGICAL FLEET & SHUTTLE EXPERIENCE")
    curr_y -= 4
    c.line(35, curr_y, w - 35, curr_y)
    curr_y -= 14

    for exp in JEROME_PROFILE["experience"]:
        c.setFont(F_SERIF_BOLD, 9)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(35, curr_y, exp["position"])
        c.setFont(F_SANS_BOLD, 8)
        c.setFillColor(colors.HexColor("#71717A"))
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
    c.setFillColor(colors.HexColor("#18181B"))
    c.setFont(F_SERIF_BOLD, 10)
    c.drawString(35, curr_y, "ACADEMIC & PROFESSIONAL CREDENTIALS")
    curr_y -= 4
    c.line(35, curr_y, w - 35, curr_y)
    curr_y -= 12

    c.setFont(F_SANS_BOLD, 8)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(35, curr_y, f"Degree: {JEROME_PROFILE['education']['degree']} | {JEROME_PROFILE['education']['institution']} ({JEROME_PROFILE['education']['year']})")
    curr_y -= 11

    certs_txt = " | ".join([f"{c_item['title']} ({c_item['issuer']})" for c_item in JEROME_PROFILE["certifications"]])
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(35, curr_y, f"Certifications: {certs_txt}")

    c.save()
    pdf_to_image(temp_pdf, output_jpg, scale=2, format="JPG", quality=92)
    if os.path.exists(safe_path(temp_pdf)):
        os.remove(safe_path(temp_pdf))
    return output_jpg


# ======================================================================
# RESUME DESIGN Q (Blurred PNG): Dark Sapphire & Cyan Split-Card Layout
# Target Role: Guest Transport Team Leader
# ======================================================================
def build_jerome_resume5_blurred_png(output_png):
    temp_clean_png = output_png.replace(".png", "_clean.png")
    temp_pdf = output_png.replace(".png", "_temp.pdf")
    c = canvas.Canvas(safe_path(temp_pdf), pagesize=letter)
    w, h = letter

    c.setFillColor(colors.HexColor("#1E3E62"))
    c.rect(0, h - 75, w, 75, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 16)
    c.drawString(30, h - 38, "JEROME VINCENT ALONZO")
    c.setFillColor(colors.HexColor("#7DD3FC"))
    c.setFont(F_SANS_BOLD, 9)
    c.drawString(30, h - 55, "GUEST TRANSPORT TEAM LEADER — TEAM BRIGADE LEADERSHIP")

    c.setFont(F_SANS, 7)
    c.setFillColor(colors.white)
    c.drawRightString(w - 30, h - 35, JEROME_PROFILE["phone"])
    c.drawRightString(w - 30, h - 47, JEROME_PROFILE["email"])
    c.drawRightString(w - 30, h - 59, "22 Roxas Blvd, Pasay City")

    curr_y = h - 95

    c.setFillColor(colors.HexColor("#F0F9FF"))
    c.rect(30, curr_y - 45, w - 60, 45, stroke=1, fill=1)
    c.setStrokeColor(colors.HexColor("#BAE6FD"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#0369A1"))
    c.drawString(38, curr_y - 12, "TRANSPORT TEAM LEADERSHIP PROFILE:")
    lead_sum = (
        "Committed Guest Transport Team Leader focused on coaching chauffeurs, enforcing personal grooming standards, "
        "overseeing safe driving practices, and maintaining zero-delay executive movements. Proven expertise in emergency "
        "contingency rerouting, VIP guest assistance, and cross-departmental coordination with concierge and security teams."
    )
    draw_wrapped(c, lead_sum, 38, curr_y - 23, w - 76, F_SANS, 7.5, colors.HexColor("#334155"), 9.5)

    curr_y -= 60

    c.setFont(F_SANS_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#1E3E62"))
    c.drawString(30, curr_y, "TRANSPORT TEAM LEADERSHIP COMPETENCIES")
    curr_y -= 4
    c.setStrokeColor(colors.HexColor("#1E3E62"))
    c.line(30, curr_y, w - 30, curr_y)
    curr_y -= 12

    sk_list = [
        "Chauffeur Brigade Briefings", "Defensive Driving Coaching", "Vehicle Cleanliness Audits",
        "Valet Ticket Audit Control", "Emergency Motorcade Response", "Guest Luggage Custody",
        "GPS Telematics Tracking", "Fuel Log Reconciliation", "VIP Protocol Standards"
    ]
    col_w = (w - 60) / 3
    for r in range(3):
        for col in range(3):
            idx = r * 3 + col
            c.setFont(F_SANS, 7.5)
            c.setFillColor(colors.HexColor("#1E293B"))
            c.drawString(30 + col * col_w, curr_y, f"▪  {sk_list[idx]}")
        curr_y -= 11

    curr_y -= 8
    c.setFont(F_SANS_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#1E3E62"))
    c.drawString(30, curr_y, "CHRONOLOGICAL TRANSPORTATION WORK EXPERIENCE")
    curr_y -= 4
    c.line(30, curr_y, w - 30, curr_y)
    curr_y -= 14

    for exp in JEROME_PROFILE["experience"]:
        c.setFillColor(colors.HexColor("#1E3E62"))
        c.setFont(F_SANS_BOLD, 8.5)
        c.drawString(30, curr_y, exp["position"].upper())
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#0284C7"))
        c.drawRightString(w - 30, curr_y, exp["duration"])
        curr_y -= 9

        c.setFont(F_SANS_ITALIC, 7.5)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawString(30, curr_y, f"{exp['company']} — {exp['location']}")
        curr_y -= 9

        for b in exp["bullets"]:
            b_txt = f"•  {b}"
            curr_y = draw_wrapped(c, b_txt, 36, curr_y, w - 66, F_SANS, 7.5, colors.HexColor("#334155"), 9.5)
        curr_y -= 5

    curr_y -= 6
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1E3E62"))
    c.drawString(30, curr_y, "ACADEMIC & PROFESSIONAL ACCREDITATIONS")
    curr_y -= 3
    c.line(30, curr_y, w - 30, curr_y)
    curr_y -= 10

    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(30, curr_y, f"Education: {JEROME_PROFILE['education']['degree']} | {JEROME_PROFILE['education']['institution']} ({JEROME_PROFILE['education']['year']})")
    curr_y -= 10
    c_str = ", ".join([c_item["title"] for c_item in JEROME_PROFILE["certifications"]])
    c.drawString(30, curr_y, f"Certifications: {c_str}")

    c.save()
    pdf_to_image(temp_pdf, temp_clean_png, scale=2, format="PNG")
    apply_uniform_blur(temp_clean_png, output_png, blur_radius=1.8, format="PNG")
    if os.path.exists(safe_path(temp_pdf)):
        os.remove(safe_path(temp_pdf))
    if os.path.exists(safe_path(temp_clean_png)):
        os.remove(safe_path(temp_clean_png))
    return output_png


# ======================================================================
# RESUME DESIGN R (Blurred JPG): Espresso & Warm Copper Executive Layout
# Target Role: Hotel Arrival Services Coordinator
# ======================================================================
def build_jerome_resume6_blurred_jpg(output_jpg):
    temp_clean_jpg = output_jpg.replace(".jpg", "_clean.jpg")
    temp_pdf = output_jpg.replace(".jpg", "_temp.pdf")
    c = canvas.Canvas(safe_path(temp_pdf), pagesize=letter)
    w, h = letter

    c.setStrokeColor(colors.HexColor("#3E2723"))
    c.setLineWidth(2)
    c.rect(20, 20, w - 40, h - 40)
    c.setStrokeColor(colors.HexColor("#D84315"))
    c.setLineWidth(1)
    c.rect(24, 24, w - 48, h - 48)

    c.setFillColor(colors.HexColor("#3E2723"))
    c.setFont(F_SERIF_BOLD, 17)
    c.drawCentredString(w / 2, h - 50, "JEROME VINCENT ALONZO")
    c.setFont(F_SERIF_ITALIC, 9.5)
    c.setFillColor(colors.HexColor("#D84315"))
    c.drawCentredString(w / 2, h - 65, "HOTEL ARRIVAL SERVICES COORDINATOR — CURBSIDE & VALET FLOW")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#555555"))
    c.drawCentredString(w / 2, h - 77, f"{JEROME_PROFILE['address']} • {JEROME_PROFILE['phone']} • {JEROME_PROFILE['email']}")

    curr_y = h - 96

    def sec_head(title):
        nonlocal curr_y
        c.setFillColor(colors.HexColor("#3E2723"))
        c.setFont(F_SERIF_BOLD, 9.5)
        c.drawString(35, curr_y, title.upper())
        curr_y -= 3
        c.setStrokeColor(colors.HexColor("#D84315"))
        c.setLineWidth(0.8)
        c.line(35, curr_y, w - 35, curr_y)
        curr_y -= 11

    sec_head("Hotel Arrival Services Summary")
    arr_sum = (
        "Refined Hotel Arrival Services Coordinator committed to delivering impeccable curbside first impressions for "
        "luxury hotel patrons. Proficient in valet parking staging, door staff coordination, baggage escort logistics, "
        "and front desk arrival synchronization. Dedicated to warmth, efficiency, and zero vehicle retrieval delays."
    )
    curr_y = draw_wrapped(c, arr_sum, 35, curr_y, w - 70, F_SERIF, 8, colors.HexColor("#333333"), 10.5)

    curr_y -= 8
    sec_head("Core Arrival & Curbside Competencies")
    skills = [
        "• Hotel Curbside Greeter Synchronization", "• Rapid Valet Vehicle Retrieval",
        "• Portecochere Traffic Flow Control", "• Front Desk Check-in Coordination",
        "• VIP Vehicle Escort & Chauffeur Staging", "• Valet Cash & Key Custody Auditing",
        "• Luggage Delivery Handover Standards", "• Guest Incident Resolution & Courtesy"
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
    for exp in JEROME_PROFILE["experience"]:
        c.setFont(F_SERIF_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#3E2723"))
        c.drawString(35, curr_y, exp["position"])
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#D84315"))
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
    c.drawString(35, curr_y, f"{JEROME_PROFILE['education']['degree']} — {JEROME_PROFILE['education']['institution']} ({JEROME_PROFILE['education']['year']})")
    curr_y -= 10

    for ct in JEROME_PROFILE["certifications"]:
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
# SUPPORTING DOCUMENTS FOR JEROME VINCENT ALONZO (6 Documents)
# ======================================================================

def build_jerome_doc1_coe_current(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=letter)
    w, h = letter

    c.setFillColor(colors.HexColor("#1A1A24"))
    c.rect(0, h - 85, w, 85, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#D4AF37"))
    c.setFont(F_SERIF_BOLD, 18)
    c.drawString(35, h - 42, "CITY OF DREAMS MANILA")
    c.setFont(F_SANS, 8)
    c.setFillColor(colors.HexColor("#E2E8F0"))
    c.drawString(35, h - 58, "Integrated Resort, Luxury Hotels & Executive Fleet Operations")
    c.drawRightString(w - 35, h - 42, "Asean Avenue, Entertainment City")
    c.drawRightString(w - 35, h - 54, "Parañaque City 1701, Metro Manila")
    c.drawRightString(w - 35, h - 66, "Tel: +63 2 8800 8080 | hr@cod-manila.com")

    curr_y = h - 120
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(35, curr_y, "DATE: October 3, 2026")
    curr_y -= 12
    c.drawString(35, curr_y, "HR REFERENCE: COD-HRD-COE-2026-0955")
    curr_y -= 25

    c.setFont(F_SERIF_BOLD, 13)
    c.setFillColor(colors.HexColor("#1A1A24"))
    c.drawCentredString(w / 2, curr_y, "CERTIFICATE OF EMPLOYMENT")
    curr_y -= 6
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(1)
    c.line(w / 2 - 120, curr_y, w / 2 + 120, curr_y)
    curr_y -= 25

    body = (
        "TO WHOM IT MAY CONCERN:\n\n"
        "This is to certify that MR. JEROME VINCENT ALONZO is currently employed with City of Dreams Manila "
        "as Guest Transportation Supervisor, commencing from November 2021 up to the present date.\n\n"
        "In his managerial role within Hotel Services & Fleet Operations, Mr. Alonzo is responsible for overseeing our 35-vehicle "
        "executive luxury fleet, managing daily shift rosters for 22 chauffeurs and 12 valet parking captains, directing airport "
        "arrival logistics at NAIA terminals, maintaining vehicle telematics tracking, and enforcing zero-defect safety protocols.\n\n"
        "Mr. Alonzo is an exemplary team leader with outstanding frontline hospitality and fleet management performance. "
        "He has maintained a spotless safety and employment record throughout his service.\n\n"
        "This certification is issued upon his request for credential verification and professional reference purposes."
    )
    for p in body.split('\n\n'):
        curr_y = draw_wrapped(c, p, 35, curr_y, w - 70, F_SERIF, 9.5, colors.HexColor("#1E293B"), 13.5)
        curr_y -= 10

    curr_y -= 20
    c.setFont(F_SERIF_BOLD, 9.5)
    c.drawString(35, curr_y, "MIGUEL ANTONIO DELA VEGA, CHA")
    curr_y -= 11
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(35, curr_y, "Vice President – Human Capital & Hospitality Operations")
    curr_y -= 10
    c.drawString(35, curr_y, "City of Dreams Manila")

    c.save()
    return output_pdf


def build_jerome_doc2_coe_previous(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=letter)
    w, h = letter

    c.setFillColor(colors.HexColor("#831843"))
    c.rect(0, h - 80, w, 80, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 17)
    c.drawString(35, h - 40, "NEWPORT WORLD RESORTS (RESORTS WORLD MANILA)")
    c.setFont(F_SANS, 8)
    c.drawString(35, h - 55, "Newport Boulevard, Newport City, Pasay City 1309, Metro Manila")
    c.drawRightString(w - 35, h - 45, "Human Resources Directorate")
    c.drawRightString(w - 35, h - 57, "Email: hr@newportworldresorts.com")

    curr_y = h - 115
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(35, curr_y, "DATE: October 28, 2021")
    curr_y -= 12
    c.drawString(35, curr_y, "RECORD ID: NWR-EMP-2021-1402")
    curr_y -= 25

    c.setFont(F_SERIF_BOLD, 12.5)
    c.setFillColor(colors.HexColor("#831843"))
    c.drawCentredString(w / 2, curr_y, "CERTIFICATE OF EMPLOYMENT AND CLEARANCE")
    curr_y -= 6
    c.setStrokeColor(colors.HexColor("#F43F5E"))
    c.setLineWidth(1)
    c.line(w / 2 - 140, curr_y, w / 2 + 140, curr_y)
    curr_y -= 25

    body = (
        "TO WHOM IT MAY CONCERN:\n\n"
        "This is to certify that MR. JEROME VINCENT ALONZO was an employee of Resorts World Manila (now Newport World Resorts) "
        "from September 1, 2019 to October 25, 2021.\n\n"
        "He held the position of Airport Transfer Captain under the Guest Services and Transportation Department. His duties "
        "encompassed supervising VIP guest arrivals at NAIA Terminals, coordinating chauffeur dispatch, ensuring vehicle cleanliness, "
        "and liaising with airport authorities for curbside staging.\n\n"
        "Mr. Alonzo has successfully settled all company property and financial clearance obligations.\n\n"
        "This certificate is issued upon his request for whatever legal purpose it may serve."
    )
    for p in body.split('\n\n'):
        curr_y = draw_wrapped(c, p, 35, curr_y, w - 70, F_SERIF, 9.5, colors.HexColor("#1E293B"), 13.5)
        curr_y -= 10

    curr_y -= 25
    c.setFont(F_SERIF_BOLD, 9.5)
    c.drawString(35, curr_y, "CORAZON P. BENITEZ, SHRM-SCP")
    curr_y -= 11
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(35, curr_y, "Director – Talent Operations & Employee Services")
    curr_y -= 10
    c.drawString(35, curr_y, "Newport World Resorts")

    c.save()
    return output_pdf


def build_jerome_doc3_diploma(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=landscape(letter))
    w, h = landscape(letter)

    c.setStrokeColor(colors.HexColor("#800000"))
    c.setLineWidth(4)
    c.rect(24, 24, w - 48, h - 48)
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(1.5)
    c.rect(30, 30, w - 60, h - 60)

    c.setFillColor(colors.HexColor("#800000"))
    c.setFont(F_SERIF_BOLD, 12)
    c.drawCentredString(w / 2, h - 70, "REPUBLIKA NG PILIPINAS")
    c.setFont(F_SERIF_BOLD, 18)
    c.drawCentredString(w / 2, h - 95, "POLYTECHNIC UNIVERSITY OF THE PHILIPPINES")
    c.setFont(F_SERIF_ITALIC, 10)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(w / 2, h - 110, "Sta. Mesa, Maynila, Pilipinas")

    c.setFont(F_SERIF, 10.5)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(w / 2, h - 150, "Ang Pangulo at Kaguruan ng Dalubhasaan ng Pamamahala sa Turismo, Pagtanggap at Paglilingkod")
    c.drawCentredString(w / 2, h - 168, "ay nagpapatunay na si")

    c.setFont(F_SERIF_BOLD, 22)
    c.setFillColor(colors.HexColor("#800000"))
    c.drawCentredString(w / 2, h - 210, "JEROME VINCENT ALONZO")
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.line(w / 2 - 180, h - 216, w / 2 + 180, h - 216)

    c.setFont(F_SERIF, 10.5)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(w / 2, h - 245, "ay nakatupad sa lahat ng mga kinakailangan para sa titulong")

    c.setFont(F_SERIF_BOLD, 15)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(w / 2, h - 275, "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT")

    c.setFont(F_SERIF, 10)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 310, "Ipinagkaloob sa Maynila, Pilipinas ngayong ika-24 ng Mayo, 2018.")

    c.setFont(F_SERIF_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 4, 90, "DR. MARLON A. FRANCISCO")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(w / 4, 76, "Dekano, Dalubhasaan ng Pagtanggap at Paglilingkod")

    c.setFont(F_SERIF_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString((3 * w) / 4, 90, "DR. MANUEL M. MUHI")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString((3 * w) / 4, 76, "Pangulo ng Pamantasan")

    c.save()
    return output_pdf


def build_jerome_doc4_cert_driving(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=landscape(letter))
    w, h = landscape(letter)

    c.setStrokeColor(colors.HexColor("#DC2626"))
    c.setLineWidth(3)
    c.rect(26, 26, w - 52, h - 52)
    c.setStrokeColor(colors.HexColor("#1E3A8A"))
    c.setLineWidth(1)
    c.rect(32, 32, w - 64, h - 64)

    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.setFont(F_SERIF_BOLD, 15)
    c.drawCentredString(w / 2, h - 70, "AUTOMOBILE ASSOCIATION PHILIPPINES (AAP)")
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(w / 2, h - 85, "AAP National Road Safety & Driver Training Center — Quezon City")

    c.setFont(F_SERIF_BOLD, 16)
    c.setFillColor(colors.HexColor("#DC2626"))
    c.drawCentredString(w / 2, h - 130, "CERTIFICATE OF PROFESSIONAL COMPETENCY")

    c.setFont(F_SERIF_ITALIC, 10.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 160, "This is to certify that")

    c.setFont(F_SERIF_BOLD, 20)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, h - 195, "JEROME VINCENT ALONZO")
    c.setStrokeColor(colors.HexColor("#DC2626"))
    c.line(w / 2 - 160, h - 200, w / 2 + 160, h - 200)

    c.setFont(F_SERIF, 10)
    c.drawCentredString(w / 2, h - 225, "has successfully passed and completed the advanced qualification course in")

    c.setFont(F_SERIF_BOLD, 13.5)
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.drawCentredString(w / 2, h - 250, "DEFENSIVE DRIVING & EXECUTIVE FLEET SAFETY")

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 280, "Covering VIP Limousine Handling, High-Speed Collision Avoidance, Road Hazards,")
    c.drawCentredString(w / 2, h - 295, "and Fleet Emergency Response Protocols (32 Hours Practical Training).")

    c.drawCentredString(w / 2, h - 330, "Awarded on April 22, 2022  |  License Registry No: AAP-DDS-2022-4221")

    c.setFont(F_SERIF_BOLD, 9)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, 85, "CAPT. ARMANDO L. VILLANUEVA")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(w / 2, 72, "Chief Driving Instructor & Safety Director, AAP")

    c.save()
    return output_pdf


def build_jerome_doc5_cert_dispatch(output_pdf):
    c = canvas.Canvas(safe_path(output_pdf), pagesize=landscape(letter))
    w, h = landscape(letter)

    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.setLineWidth(3)
    c.rect(28, 28, w - 56, h - 56)
    c.setStrokeColor(colors.HexColor("#BAE6FD"))
    c.setLineWidth(1)
    c.rect(34, 34, w - 68, h - 68)

    c.setFillColor(colors.HexColor("#0369A1"))
    c.setFont(F_SERIF_BOLD, 15)
    c.drawCentredString(w / 2, h - 70, "MANILA AIRPORT AUTHORITY TRAINING CENTER")
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(w / 2, h - 85, "Ground Support & Airport Ramp Logistics School — Pasay City")

    c.setFont(F_SERIF_BOLD, 16)
    c.setFillColor(colors.HexColor("#0369A1"))
    c.drawCentredString(w / 2, h - 130, "CERTIFICATE OF WORKSHOP ATTENDANCE")

    c.setFont(F_SERIF_ITALIC, 10.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 160, "This credential is presented to")

    c.setFont(F_SERIF_BOLD, 20)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, h - 195, "JEROME VINCENT ALONZO")
    c.setStrokeColor(colors.HexColor("#0284C7"))
    c.line(w / 2 - 160, h - 200, w / 2 + 160, h - 200)

    c.setFont(F_SERIF, 10)
    c.drawCentredString(w / 2, h - 225, "for completion of the practical technical session in")

    c.setFont(F_SERIF_BOLD, 13.5)
    c.setFillColor(colors.HexColor("#0369A1"))
    c.drawCentredString(w / 2, h - 250, "FOUNDATIONS OF BASIC VEHICLE INSPECTION & FLUID CHECKING")

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 280, "Hands-on instruction in motor vehicle engine oil checking, tire pressure, and brake inspection.")
    c.drawCentredString(w / 2, h - 305, "Date: August 16, 2019  |  Certificate Ref: MAATC-WKS-2019-816")

    c.setFont(F_SERIF_BOLD, 9)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, 85, "ROBERTO S. MAGNO")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(w / 2, 72, "Training Administrator, Manila Airport Authority Training Center")

    c.save()
    return output_pdf


def build_jerome_doc6_incomplete_cert(output_pdf):
    temp_clean_pdf = output_pdf.replace(".pdf", "_clean.pdf")
    c = canvas.Canvas(safe_path(temp_clean_pdf), pagesize=landscape(letter))
    w, h = landscape(letter)

    c.setStrokeColor(colors.HexColor("#0F172A"))
    c.setLineWidth(3)
    c.rect(26, 26, w - 52, h - 52)
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(1)
    c.rect(32, 32, w - 64, h - 64)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont(F_SERIF_BOLD, 16)
    c.drawCentredString(w / 2, h - 70, "AMERICAN HOTEL & LODGING EDUCATIONAL INSTITUTE")
    c.setFont(F_SANS, 8)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(w / 2, h - 85, "AHLEI Global Hospitality Professional Certification Commission")

    c.setFont(F_SERIF_BOLD, 17)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, h - 130, "EXECUTIVE PROFESSIONAL DESIGNATION")

    c.setFont(F_SERIF_ITALIC, 10.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(w / 2, h - 160, "Be it known that the Institute hereby recognizes")

    c.setFont(F_SERIF_BOLD, 20)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(w / 2, h - 195, "JEROME VINCENT ALONZO")

    c.setFont(F_SERIF, 10)
    c.drawCentredString(w / 2, h - 225, "as having satisfied all ethical, professional, and examination requirements for")

    c.setFont(F_SERIF_BOLD, 14.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(w / 2, h - 250, "PROFESSIONAL CHAUFFEUR & VIP MOBILITY SERVICES EXECUTIVE")

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(w / 2, h - 280, "Demonstrating superior competence in luxury fleet management, VIP transport, and safety.")
    c.drawCentredString(w / 2, h - 305, "Certificate ID: PCME-AHLEI-2020-7411  |  Conferred: December 15, 2020")

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
# GROUND TRUTH TXT FOR JEROME VINCENT ALONZO
# ======================================================================
def build_jerome_ground_truth_txt(output_txt):
    content = f"""================================================================================
HOSPITALITY RESUME & SUPPORTING DOCUMENT BENCHMARK DATASET
GROUND TRUTH & VERIFICATION REFERENCE
================================================================================

DOCUMENT IDENTIFIER: Actual Info in the Resume of Jerome Vincent Alonzo.txt
TARGET CANDIDATE: Jerome Vincent Alonzo
CAREER DOMAIN: Hotel transportation, resort mobility, airport transfers, shuttle operations, fleet management
TOTAL DATASET FILES: 13 Files (6 Resumes, 6 Supporting Documents, 1 Ground Truth)
DATE GENERATED: 2026-10-04

================================================================================
PART 1 — CANDIDATE MASTER PROFILE (STANDARDIZED CANONICAL RECORD)
================================================================================

[PERSONAL & CONTACT INFORMATION]
Full Name:             Jerome Vincent Alonzo
Target Position:       Hotel Transportation Services Supervisor
Contact Phone Number:  +63 918 734 5092
Email Address:         jerome.alonzo.transport@outlook.ph
Residential Address:   22 Roxas Boulevard, 1300 Pasay City, Metro Manila, Philippines
LinkedIn / Portfolio:  linkedin.com/in/jerome-alonzo-transport

[PROFESSIONAL SUMMARY]
"Energetic, safety-certified Hotel Transportation & Guest Mobility Supervisor with over 6 years of frontline and leadership experience managing executive fleets, airport arrival lounges, and valet operations for five-star integrated resorts. Proven track record in orchestrating 150+ daily VIP airport transfers, maintaining a zero-accident fleet record, reducing guest vehicle retrieval wait times to under 4 minutes, and directing team brigades of up to 25 chauffeurs and valet captains."

[CORE COMPETENCIES & SKILLS]
1. Executive Chauffeur Fleet Management & Daily Vehicle Allocation
2. VIP Airport Arrival Staging, Flight Tracking & Baggage Custody Handling
3. Valet Parking Logistics, Key Management & Vehicle Retrieval Flow
4. Defensive Driving, Road Safety Protocols & Emergency Fleet Response
5. Chauffeur Team Rostering, Grooming Inspections & Service Etiquette Training
6. Fleet Maintenance Scheduling, Fuel Mileage Audits & Telematics Monitoring
7. Cross-Departmental Coordination with Front Desk, Concierge & Security
8. Guest Transportation Billing, Mileage Logging & Folio Settlement

[CHRONOLOGICAL WORK EXPERIENCE]

1. Employer:     City of Dreams Manila
   Location:     Parañaque City, Metro Manila
   Job Title:    Guest Transportation Supervisor
   Duration:     November 2021 – Present
   Tenure Type:  Current Employment
   Responsibilities & Achievements:
   • Supervise daily operations of a 35-vehicle luxury fleet, 22 chauffeurs, and 12 valet parking attendants.
   • Achieved 100% on-time airport pickup execution across 2,400+ VIP executive movements in 2023.
   • Cut average valet car retrieval times from 7.5 minutes to 3.8 minutes by reorganizing parking zone staging.
   • Maintained a zero-preventable-accident record across 450,000 cumulative fleet kilometers.

2. Employer:     Resorts World Manila (Newport World Resorts)
   Location:     Pasay City, Metro Manila
   Job Title:    Airport Transfer Captain
   Duration:     June 2019 – October 2021
   Tenure Type:  Previous Employment
   Responsibilities & Achievements:
   • Stationed at NAIA Terminals 1, 2, and 3 to welcome casino high-rollers and international hotel guests.
   • Coordinated private luxury van transfers and expedited curbside departures with airport security.
   • Conducted pre-shift vehicle cleanliness audits and verified driver GPS logs.

3. Employer:     Golden Phoenix Hotel Manila
   Location:     Pasay City, Metro Manila
   Job Title:    Fleet & Valet Dispatcher
   Duration:     May 2018 – May 2019
   Tenure Type:  Historical Employment
   Responsibilities & Achievements:
   • Assigned shuttle trips to drivers, answered guest transportation inquiries, and monitored valet ticket returns.
   • Balanced daily valet cash collections and maintained accurate vehicle log sheets.

[EDUCATION & ACADEMIC CREDENTIALS]
Degree:         Bachelor of Science in Hospitality Management
Institution:    Polytechnic University of the Philippines (PUP) – Sta. Mesa, Manila
Graduation:     2018

[TRAINING & PROFESSIONAL CERTIFICATIONS]
1. Title:   Professional Chauffeur & VIP Mobility Services Executive
   Issuer:  American Hotel & Lodging Educational Institute (AHLEI)
   Date:    December 2020

2. Title:   Defensive Driving & Executive Fleet Safety
   Issuer:  Automobile Association Philippines (AAP)
   Date:    April 2022

3. Title:   Airport Runway & Terminal Dispatch Coordination
   Issuer:  Manila Airport Authority Training Center
   Date:    August 2019


================================================================================
PART 2 — SIX RESUME GROUND TRUTHS
================================================================================

1. Jerome_Vincent_Alonzo_Hotel_Transportation_Services_Supervisor.pdf
   - Format: PDF
   - Layout Design: Design M (Midnight Navy & Signal Red Dynamic Layout)
   - Target Position: Hotel Transportation Services Supervisor
   - Career Emphasis: Hotel transportation supervision, chauffeur brigade management, fleet maintenance.
   - Textual Content: Full Canonical Master Profile text preserved.

2. Jerome_Vincent_Alonzo_Resort_Guest_Mobility_Coordinator.docx
   - Format: DOCX
   - Layout Design: Design N (Dark Slate & Amber Gold Corporate Layout)
   - Target Position: Resort Guest Mobility Coordinator
   - Career Emphasis: Guest mobility logistics, resort buggy/shuttle fleet, golf cart/van dispatch.
   - Summary: Highlights inter-property mobility, flight tracking integration, and passenger comfort.

3. Jerome_Vincent_Alonzo_Hotel_Airport_Transfer_Coordinator.png
   - Format: PNG
   - Layout Design: Design O (Deep Teal & Electric Blue Aviation/Transfer Theme)
   - Target Position: Hotel Airport Transfer Coordinator
   - Career Emphasis: NAIA airport arrivals, flight delay tracking, meet-and-greet curbside staging.
   - Summary: Focuses on airport terminal logistics, curbside departures, and luggage custody transfer.

4. Jerome_Vincent_Alonzo_Hospitality_Shuttle_Operations_Officer.jpg
   - Format: JPG
   - Layout Design: Design P (Onyx & Silver Gray Sleek Modern Layout)
   - Target Position: Hospitality Shuttle Operations Officer
   - Career Emphasis: Fixed-route shuttle scheduling, passenger load management, GPS route optimization.
   - Summary: Emphasizes fleet telematics, fuel consumption auditing, and route efficiency.

5. Jerome_Vincent_Alonzo_Guest_Transport_Team_Leader_Blurred.png
   - Format: Blurred PNG (Uniform light blur applied for OCR testing)
   - Layout Design: Design Q (Dark Sapphire & Cyan Split-Card Layout)
   - Target Position: Guest Transport Team Leader
   - Career Emphasis: Chauffeur team leadership, grooming & defensive driving audits, shift rostering.
   - Text Degradation: Light uniform Gaussian blur across the entire image.

6. Jerome_Vincent_Alonzo_Hotel_Arrival_Services_Coordinator_Blurred.jpg
   - Format: Blurred JPG (Uniform light blur applied for OCR testing)
   - Layout Design: Design R (Espresso & Warm Copper Executive Layout)
   - Target Position: Hotel Arrival Services Coordinator
   - Career Emphasis: Curbside arrival experience, valet parking speed, luggage handover.
   - Text Degradation: Light uniform defocus and compression simulation across the entire page.


================================================================================
PART 3 — SUPPORTING DOCUMENTS UNDERLYING TEXT & METADATA
================================================================================

1. Jerome_Vincent_Alonzo_COE_01.pdf
   - Document Type: Certificate of Employment (COE)
   - Issuing Entity: City of Dreams Manila
   - Recipient / Employee: Jerome Vincent Alonzo
   - Certified Position: Guest Transportation Supervisor
   - Certified Period: November 2021 – Present
   - Extraction Mode: Digital Vector Text

2. Jerome_Vincent_Alonzo_COE_02.pdf
   - Document Type: Certificate of Employment and Clearance
   - Issuing Entity: Resorts World Manila (Newport World Resorts)
   - Recipient / Employee: Jerome Vincent Alonzo
   - Certified Position: Airport Transfer Captain
   - Certified Period: September 1, 2019 – October 25, 2021 (CONTROLLED DISCREPANCY)
   - Extraction Mode: Digital Vector Text

3. Jerome_Vincent_Alonzo_Diploma.pdf
   - Document Type: Academic University Diploma
   - Issuing Institution: Polytechnic University of the Philippines (PUP)
   - Graduate Name: Jerome Vincent Alonzo
   - Conferred Degree: Bachelor of Science in Hospitality Management
   - Graduation Year: 2018 (May 24, 2018)
   - Extraction Mode: Digital Vector Text

4. Jerome_Vincent_Alonzo_Training_Certificate_01.pdf
   - Document Type: Professional Training Certificate
   - Issuing Entity: Automobile Association Philippines (AAP)
   - Recipient Name: Jerome Vincent Alonzo
   - Certified Course: Defensive Driving & Executive Fleet Safety
   - Certification Date: April 22, 2022
   - Extraction Mode: Digital Vector Text

5. Jerome_Vincent_Alonzo_Training_Certificate_02.pdf
   - Document Type: Technical Workshop Certificate
   - Issuing Entity: Manila Airport Authority Training Center
   - Recipient Name: Jerome Vincent Alonzo
   - Certified Course: Foundations of Basic Vehicle Inspection & Fluid Checking (CONTROLLED DISCREPANCY)
   - Certification Date: August 16, 2019
   - Extraction Mode: Digital Vector Text

6. Jerome_Vincent_Alonzo_Professional_Certification.pdf
   - Document Type: Executive Professional Designation Certificate
   - Issuing Entity: American Hotel & Lodging Educational Institute (AHLEI)
   - Recipient Name: [UNREADABLE / TORN / MISSING RECIPIENT NAME] (CONTROLLED UNABLE TO VERIFY)
   - Certified Title: Professional Chauffeur & VIP Mobility Services Executive
   - Issue Date: December 15, 2020
   - Extraction Mode: OCR-Test Document with Simulated Severe Physical Tear


================================================================================
PART 4 — RESUME ↔ SUPPORTING DOCUMENT VERIFICATION MATRIX
================================================================================

DOCUMENT: Jerome_Vincent_Alonzo_COE_01.pdf
TYPE: Certificate of Employment
COMPARED RESUME CLAIM: City of Dreams Manila | Guest Transportation Supervisor | November 2021 – Present
EXPECTED RESULT: VERIFIED
FIELDS:
  Employer   = MATCH (City of Dreams Manila)
  Position   = MATCH (Guest Transportation Supervisor)
  Start Date = MATCH (November 2021)
  End Date   = MATCH (Present)
REASON: Exact match across candidate name, employer, role, and tenure.

--------------------------------------------------------------------------------

DOCUMENT: Jerome_Vincent_Alonzo_COE_02.pdf
TYPE: Certificate of Employment and Clearance
COMPARED RESUME CLAIM: Resorts World Manila (Newport World Resorts) | Airport Transfer Captain | June 2019 – October 2021
EXPECTED RESULT: DISCREPANCY_FOUND
FIELDS:
  Employer   = MATCH (Resorts World Manila / Newport World Resorts)
  Position   = MATCH (Airport Transfer Captain)
  Start Date = MISMATCH (Resume claims June 2019; COE certifies September 1, 2019)
  End Date   = MATCH (October 2021)
REASON: Official COE certifies employment starting September 2019, whereas resume claims start date of June 2019 (3-month discrepancy). Requires HR review.

--------------------------------------------------------------------------------

DOCUMENT: Jerome_Vincent_Alonzo_Diploma.pdf
TYPE: Academic University Diploma
COMPARED RESUME CLAIM: Bachelor of Science in Hospitality Management | Polytechnic University of the Philippines | 2018
EXPECTED RESULT: VERIFIED
FIELDS:
  Institution = MATCH (Polytechnic University of the Philippines)
  Degree      = MATCH (Bachelor of Science in Hospitality Management)
  Year        = MATCH (2018)
REASON: Exact match across candidate name, institution, degree title, and graduation year.

--------------------------------------------------------------------------------

DOCUMENT: Jerome_Vincent_Alonzo_Training_Certificate_01.pdf
TYPE: Professional Training Certificate
COMPARED RESUME CLAIM: Defensive Driving & Executive Fleet Safety | Automobile Association Philippines | April 2022
EXPECTED RESULT: VERIFIED
FIELDS:
  Course Title = MATCH (Defensive Driving & Executive Fleet Safety)
  Issuer       = MATCH (Automobile Association Philippines)
  Date         = MATCH (April 2022)
REASON: Exact match across candidate name, training title, issuer, and date.

--------------------------------------------------------------------------------

DOCUMENT: Jerome_Vincent_Alonzo_Training_Certificate_02.pdf
TYPE: Technical Workshop Certificate
COMPARED RESUME CLAIM: Airport Runway & Terminal Dispatch Coordination | Manila Airport Authority Training Center | August 2019
EXPECTED RESULT: DISCREPANCY_FOUND
FIELDS:
  Issuer       = MATCH (Manila Airport Authority Training Center)
  Date         = MATCH (August 2019)
  Course Title = MISMATCH (Resume claims 'Airport Runway & Terminal Dispatch Coordination'; Certificate certifies 'Foundations of Basic Vehicle Inspection & Fluid Checking')
REASON: Certificate course title does not match claimed training program. Requires HR review.

--------------------------------------------------------------------------------

DOCUMENT: Jerome_Vincent_Alonzo_Professional_Certification.pdf
TYPE: Professional Certification
COMPARED RESUME CLAIM: Professional Chauffeur & VIP Mobility Services Executive | AHLEI | December 2020
EXPECTED RESULT: UNABLE_TO_VERIFY
FIELDS:
  Recipient Name = UNREADABLE / MISSING (Severed due to torn scan artifact)
  Issuer         = MATCH (American Hotel & Lodging Educational Institute)
  Credential     = MATCH (Professional Chauffeur & VIP Mobility Services Executive)
REASON: Recipient identity cannot be verified because the name portion of the credential document is severed/torn off.

--------------------------------------------------------------------------------

DOCUMENT: [DOCUMENT NOT SUBMITTED]
TYPE: Certificate of Employment (Historical)
COMPARED RESUME CLAIM: Golden Phoenix Hotel Manila | Fleet & Valet Dispatcher | May 2018 – May 2019
EXPECTED RESULT: PENDING
FIELDS:
  Evidence Status = PENDING_SUBMISSION
REASON: Supporting certificate of employment has not been provided by applicant for historical employment.
================================================================================
"""
    with open(safe_path(output_txt), 'w', encoding='utf-8') as f:
        f.write(content)
    return output_txt
