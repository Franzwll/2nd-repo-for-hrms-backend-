import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# Directory for Onboarding files
output_dir = r"C:\Users\PC\Downloads\Ferdi\4TH_YR\DEV\v19\2nd-repo-for-hrms-backend-\other files\resume related\new\PERFECT FOR THE JOB\Camille Beatrice Fernandez-Restaurant Server\ONBOARDING"
os.makedirs(output_dir, exist_ok=True)

styles = getSampleStyleSheet()

# Custom styles
primary_color = colors.HexColor("#1A365D")   # Oxford Navy
secondary_color = colors.HexColor("#C59B27") # Hotel Gold
text_dark = colors.HexColor("#2D3748")
bg_light = colors.HexColor("#F7FAFC")
accent_green = colors.HexColor("#22543D")

title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=18,
    leading=22,
    textColor=primary_color,
    alignment=1
)

subtitle_style = ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=11,
    leading=14,
    textColor=secondary_color,
    alignment=1
)

header_right = ParagraphStyle(
    'HeaderRight',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9,
    leading=12,
    textColor=colors.HexColor("#718096"),
    alignment=2
)

body_style = ParagraphStyle(
    'Body',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=10,
    leading=14,
    textColor=text_dark
)

body_bold = ParagraphStyle(
    'BodyBold',
    parent=body_style,
    fontName='Helvetica-Bold'
)

section_heading = ParagraphStyle(
    'SectionHeading',
    parent=styles['Heading2'],
    fontName='Helvetica-Bold',
    fontSize=12,
    leading=16,
    textColor=primary_color,
    spaceBefore=8,
    spaceAfter=4
)

table_text = ParagraphStyle(
    'TableText',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9,
    leading=12,
    textColor=text_dark
)

table_bold = ParagraphStyle(
    'TableBold',
    parent=table_text,
    fontName='Helvetica-Bold'
)

def build_pdf_header(doc_title, sub_title="OXFORD SUITES MAKATI — HUMAN RESOURCE MANAGEMENT"):
    elements = []
    header_data = [
        [
            Paragraph("<b>OXFORD SUITES MAKATI</b><br/><font size='8' color='#718096'>7232 P. Burgos St., Poblacion, Makati City, Metro Manila<br/>Tel: (02) 8899-7888 | hr@oxfordsuites.com.ph</font>", body_style),
            Paragraph("<b>HR EXCELLENCE FORM</b><br/><font size='8' color='#718096'>ISO 9001:2015 Compliant<br/>Confidential Document</font>", header_right)
        ]
    ]
    t = Table(header_data, colWidths=[330, 190])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t)
    elements.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceBefore=4, spaceAfter=8))
    elements.append(Paragraph(doc_title.upper(), title_style))
    elements.append(Paragraph(sub_title, subtitle_style))
    elements.append(Spacer(1, 12))
    return elements

# ==============================================================================
# 1. SIGNED EMPLOYMENT CONTRACT
# ==============================================================================
def create_employment_contract():
    path = os.path.join(output_dir, "Camille_Beatrice_Fernandez_Signed_Employment_Contract.pdf")
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = build_pdf_header("PROBATIONARY EMPLOYMENT CONTRACT", "SUBSYSTEM: NEW HIRE PRE-ONBOARDING COMPLIANCE")

    intro_p = Paragraph(
        "<b>KNOW ALL MEN BY THESE PRESENTS:</b><br/><br/>"
        "This Employment Agreement is entered into by and between <b>OXFORD SUITES MAKATI</b> (hereinafter referred to as the <b>'EMPLOYER'</b>), "
        "and <b>CAMILLE BEATRICE FERNANDEZ</b>, of legal age, Filipino, residing at 42 Jupiter Street, Brgy. Bel-Air, Makati City (hereinafter referred to as the <b>'EMPLOYEE'</b>).",
        body_style
    )
    story.append(intro_p)
    story.append(Spacer(1, 8))

    details = [
        [Paragraph("<b>Job Position:</b>", table_bold), Paragraph("Restaurant Server", table_text), Paragraph("<b>Department:</b>", table_bold), Paragraph("Food & Beverage (DEP-FB)", table_text)],
        [Paragraph("<b>Employment Status:</b>", table_bold), Paragraph("Probationary (Six Months)", table_text), Paragraph("<b>Salary Grade:</b>", table_bold), Paragraph("Grade 3 (₱21,500.00 / mo)", table_text)],
        [Paragraph("<b>Effective Date:</b>", table_bold), Paragraph("November 03, 2026", table_text), Paragraph("<b>Probation End:</b>", table_bold), Paragraph("May 03, 2027", table_text)],
        [Paragraph("<b>Reporting Supervisor:</b>", table_bold), Paragraph("F&B Director / Dining Captain", table_text), Paragraph("<b>Work Shift:</b>", table_bold), Paragraph("Rotating (48 hrs / week)", table_text)],
    ]
    t = Table(details, colWidths=[110, 150, 110, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    clauses = [
        "<b>1. DUTIES & RESPONSIBILITIES:</b> The Employee agrees to perform duties of a Restaurant Server including guest greeting, fine dining silver service, order entry via POS terminals, food safety adherence, table turnover, and guest upselling.",
        "<b>2. COMPENSATION & BENEFITS:</b> Monthly base pay of ₱21,500.00, statutory benefits (SSS, PhilHealth, Pag-IBIG, 13th Month Pay), duty meal subsidy, uniform laundry allowance, and quarterly service charge sharing.",
        "<b>3. PERFORMANCE STANDARDS:</b> Regularization shall be contingent upon meeting performance benchmarks in punctuality (min 95%), guest satisfaction ratings, and satisfactory 3rd-month and 5th-month evaluation ratings.",
        "<b>4. COMPANY POLICIES & INTEGRITY:</b> The Employee pledges compliance with Hotel Code of Conduct, Sanitation Standards, and Philippine Republic Act No. 10173 (Data Privacy Act of 2012)."
    ]
    for c in clauses:
        story.append(Paragraph(c, body_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 14))
    sig_data = [
        [
            Paragraph("<b>EMPLOYEE CONFORME:</b><br/><br/><br/><b>CAMILLE BEATRICE FERNANDEZ</b><br/>Appointee Signature / Date: 10/28/2026", body_style),
            Paragraph("<b>FOR OXFORD SUITES MAKATI:</b><br/><br/><br/><b>JUAN DELA CRUZ</b><br/>Human Resources Director", body_style)
        ]
    ]
    st = Table(sig_data, colWidths=[260, 260])
    st.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINEBEFORE', (1,0), (1,0), 0.5, colors.HexColor("#CBD5E0")),
    ]))
    story.append(st)

    doc.build(story)
    print("  [Created] Camille_Beatrice_Fernandez_Signed_Employment_Contract.pdf")

# ==============================================================================
# 2. NBI CLEARANCE
# ==============================================================================
def create_nbi_clearance():
    path = os.path.join(output_dir, "Camille_Beatrice_Fernandez_NBI_Clearance.pdf")
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []

    # Republic of the Philippines header
    gov_header = [
        [
            Paragraph("<b>REPUBLIC OF THE PHILIPPINES</b><br/>DEPARTMENT OF JUSTICE<br/><b>NATIONAL BUREAU OF INVESTIGATION</b><br/>MANILA", ParagraphStyle('Gov', parent=styles['Normal'], alignment=1, fontSize=11, leading=14, fontName='Helvetica-Bold', textColor=colors.HexColor("#1A202C"))),
        ]
    ]
    gt = Table(gov_header, colWidths=[520])
    gt.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EDF2F7")), ('BOTTOMPADDING', (0,0), (-1,-1), 8)]))
    story.append(gt)
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2B6CB0"), spaceBefore=4, spaceAfter=10))

    story.append(Paragraph("<b>NBI CLEARANCE CERTIFICATE</b>", ParagraphStyle('NBITitle', parent=title_style, fontSize=16, textColor=colors.HexColor("#2B6CB0"))))
    story.append(Paragraph("VERIFIED OFFICIAL POLICE & RECORD CHECK", ParagraphStyle('NBIsub', parent=subtitle_style, textColor=colors.HexColor("#4A5568"))))
    story.append(Spacer(1, 14))

    nbi_data = [
        [Paragraph("<b>NBI ID NUMBER:</b>", table_bold), Paragraph("<b>NBI-2026-84913502-A</b>", table_bold), Paragraph("<b>DATE ISSUED:</b>", table_bold), Paragraph("October 12, 2026", table_text)],
        [Paragraph("<b>FULL NAME:</b>", table_bold), Paragraph("<b>FERNANDEZ, CAMILLE BEATRICE</b>", table_bold), Paragraph("<b>VALID UNTIL:</b>", table_bold), Paragraph("October 12, 2027", table_text)],
        [Paragraph("<b>RESIDENCE:</b>", table_bold), Paragraph("42 Jupiter St., Bel-Air, Makati City", table_text), Paragraph("<b>CITIZENSHIP:</b>", table_bold), Paragraph("FILIPINO", table_text)],
        [Paragraph("<b>CIVIL STATUS:</b>", table_bold), Paragraph("SINGLE", table_text), Paragraph("<b>DATE OF BIRTH:</b>", table_bold), Paragraph("MARCH 29, 2002", table_text)],
        [Paragraph("<b>PURPOSE:</b>", table_bold), Paragraph("PRE-EMPLOYMENT (OXFORD SUITES)", table_text), Paragraph("<b>REMARKS:</b>", table_bold), Paragraph("<font color='#22543D'><b>NO RECORD ON FILE (PASSED)</b></font>", table_text)],
    ]
    nt = Table(nbi_data, colWidths=[120, 160, 100, 140])
    nt.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#2B6CB0")),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F7FAFC")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(nt)
    story.append(Spacer(1, 18))

    story.append(Paragraph(
        "<b>CERTIFICATION:</b> This is to certify that the person named above has undergone record verification "
        "and fingerprint database query in the Central Records Division of the National Bureau of Investigation, "
        "and as of this date, has <b>NO CRIMINAL, DEROGATORY, OR ADVERSE RECORD ON FILE</b>.",
        body_style
    ))
    story.append(Spacer(1, 24))

    sig_nbi = [
        [
            Paragraph("<b>VERIFIED BY:</b><br/><br/><b>SPO4 RENATO C. BAUTISTA</b><br/>NBI Fingerprint Examiner III", body_style),
            Paragraph("<b>APPROVED BY:</b><br/><br/><b>ATTY. MEDARDO G. DE LEMOS</b><br/>Director, National Bureau of Investigation", body_style)
        ]
    ]
    st = Table(sig_nbi, colWidths=[260, 260])
    story.append(st)
    doc.build(story)
    print("  [Created] Camille_Beatrice_Fernandez_NBI_Clearance.pdf")

# ==============================================================================
# 3. MEDICAL EXAM / FIT TO WORK
# ==============================================================================
def create_medical_fit_to_work():
    path = os.path.join(output_dir, "Camille_Beatrice_Fernandez_Medical_Exam_Fit_To_Work.pdf")
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = build_pdf_header("PRE-EMPLOYMENT MEDICAL EXAMINATION", "CLINICAL EVALUATION & FIT-TO-WORK CLEARANCE")

    patient_info = [
        [Paragraph("<b>Employee Name:</b>", table_bold), Paragraph("Camille Beatrice Fernandez", table_text), Paragraph("<b>Age / Sex:</b>", table_bold), Paragraph("24 / Female", table_text)],
        [Paragraph("<b>Target Role:</b>", table_bold), Paragraph("Restaurant Server (Food Handler)", table_text), Paragraph("<b>Exam Date:</b>", table_bold), Paragraph("October 15, 2026", table_text)],
        [Paragraph("<b>Company Client:</b>", table_bold), Paragraph("Oxford Suites Makati Hotel", table_text), Paragraph("<b>Clinic Ref:</b>", table_bold), Paragraph("MMC-MED-2026-9921", table_text)],
    ]
    pt = Table(patient_info, colWidths=[110, 160, 100, 150])
    pt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(pt)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>LABORATORY & CLINICAL DIAGNOSTIC RESULTS</b>", section_heading))
    diag_data = [
        [Paragraph("<b>Test Component</b>", table_bold), Paragraph("<b>Standard / Normal Value</b>", table_bold), Paragraph("<b>Candidate Result</b>", table_bold), Paragraph("<b>Clinical Remark</b>", table_bold)],
        [Paragraph("Chest X-Ray (PA View)", table_text), Paragraph("Clear lung fields, normal heart size", table_text), Paragraph("Normal Lung Fields", table_text), Paragraph("<font color='#22543D'><b>Normal / Passed</b></font>", table_text)],
        [Paragraph("Complete Blood Count (CBC)", table_text), Paragraph("Within standard range", table_text), Paragraph("Hb 13.2 g/dL, WBC 6.8", table_text), Paragraph("<font color='#22543D'><b>Normal / Passed</b></font>", table_text)],
        [Paragraph("Fecalysis / Stool Examination", table_text), Paragraph("No ova or parasites found", table_text), Paragraph("Negative / No Parasites", table_text), Paragraph("<font color='#22543D'><b>Food Handler Pass</b></font>", table_text)],
        [Paragraph("Urinalysis", table_text), Paragraph("Normal pH, Albumin Neg, Sugar Neg", table_text), Paragraph("Clear, Normal", table_text), Paragraph("<font color='#22543D'><b>Normal / Passed</b></font>", table_text)],
        [Paragraph("Hepatitis B Surface Antigen (HBsAg)", table_text), Paragraph("Non-Reactive", table_text), Paragraph("Non-Reactive", table_text), Paragraph("<font color='#22543D'><b>Non-Infectious</b></font>", table_text)],
        [Paragraph("10-Panel Drug Screening", table_text), Paragraph("Negative (THC / Methamphetamine)", table_text), Paragraph("Negative", table_text), Paragraph("<font color='#22543D'><b>Clean / Passed</b></font>", table_text)],
    ]
    dt = Table(diag_data, colWidths=[150, 140, 120, 110])
    dt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(dt)
    story.append(Spacer(1, 10))

    verdict_box = [
        [
            Paragraph("<b>PHYSICIAN'S FINAL MEDICAL CERTIFICATION:</b><br/>"
                      "The candidate is physically, mentally, and medically evaluated as:<br/>"
                      "<b><font size='12' color='#22543D'>CLASSIFICATION: CLASS A — FIT FOR WORK (FOOD & BEVERAGE SERVICE)</font></b><br/>"
                      "Cleared for hotel dining room food handling, table service, and customer hospitality operations.", body_style)
        ]
    ]
    vt = Table(verdict_box, colWidths=[520])
    vt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FFF4")),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#38A169")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(vt)
    story.append(Spacer(1, 14))

    sig_med = [
        [
            Paragraph("<b>CLINICAL CLINICIAN:</b><br/><br/><b>DR. ROBERTO M. SANTOS, MD</b><br/>Occupational Health Physician<br/>PRC License No.: 0089421", body_style),
            Paragraph("<b>CLINIC SEAL & ACCREDITATION:</b><br/><br/><b>MAKATI MEDICAL DIAGNOSTIC CLINIC</b><br/>DOH Accreditation No.: 13-094-19-HC<br/>Valid until Dec 31, 2027", body_style)
        ]
    ]
    smt = Table(sig_med, colWidths=[260, 260])
    story.append(smt)
    doc.build(story)
    print("  [Created] Camille_Beatrice_Fernandez_Medical_Exam_Fit_To_Work.pdf")

# ==============================================================================
# 4. STATUTORY NUMBERS (SSS, PhilHealth, Pag-IBIG, TIN)
# ==============================================================================
def create_statutory_numbers():
    path = os.path.join(output_dir, "Camille_Beatrice_Fernandez_Statutory_Numbers_SSS_PhilHealth_PagIBIG_TIN.pdf")
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = build_pdf_header("STATUTORY GOVERNMENT IDENTIFIERS", "REPUBLIC ACT 10173 DATA PRIVACY REGISTERED RECORD")

    story.append(Paragraph(
        "This document certifies the consolidated statutory registration and government-mandated contribution "
        "identifiers for newly hired employee <b>CAMILLE BEATRICE FERNANDEZ</b> for payroll integration at Oxford Suites Makati.",
        body_style
    ))
    story.append(Spacer(1, 10))

    stat_data = [
        [Paragraph("<b>Statutory Agency</b>", table_bold), Paragraph("<b>Identifier Number</b>", table_bold), Paragraph("<b>Registration Status</b>", table_bold), Paragraph("<b>Monthly Contribution Status</b>", table_bold)],
        [
            Paragraph("<b>Social Security System (SSS)</b><br/><font size='8' color='#718096'>RA 11199 Social Security Act</font>", table_text),
            Paragraph("<b>04-8921475-3</b>", table_bold),
            Paragraph("Active / Verified Member", table_text),
            Paragraph("Mandatory Employee/Employer Share", table_text)
        ],
        [
            Paragraph("<b>PhilHealth (PHIC)</b><br/><font size='8' color='#718096'>Universal Health Care Act</font>", table_text),
            Paragraph("<b>12-054921873-1</b>", table_bold),
            Paragraph("Active / Formal Economy", table_text),
            Paragraph("Standard Statutory Premium", table_text)
        ],
        [
            Paragraph("<b>Pag-IBIG Fund (HDMF)</b><br/><font size='8' color='#718096'>Home Development Mutual Fund</font>", table_text),
            Paragraph("<b>1210-9482-1943</b>", table_bold),
            Paragraph("Active Member (Regular)", table_text),
            Paragraph("₱100/₱100 Regular Matching", table_text)
        ],
        [
            Paragraph("<b>Bureau of Internal Revenue (BIR)</b><br/><font size='8' color='#718096'>Tax Identification Number (TIN)</font>", table_text),
            Paragraph("<b>342-891-720-000</b>", table_bold),
            Paragraph("Registered (RDO 048 - Makati)", table_text),
            Paragraph("BIR Form 1902 / 2316 Attached", table_text)
        ],
    ]
    stt = Table(stat_data, colWidths=[150, 130, 110, 130])
    stt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(stt)
    story.append(Spacer(1, 14))

    notice = [
        [
            Paragraph("<b>DATA PRIVACY NOTICE (REPUBLIC ACT NO. 10173):</b><br/>"
                      "All statutory identifiers provided herein are treated as Sensitive Personal Information (SPI). "
                      "They are restricted exclusively to Oxford Suites Makati Payroll, Remittance Accounting, and HR Administration. "
                      "Unlawful disclosure or transmission without employee consent is prohibited under Philippine Law.", body_style)
        ]
    ]
    nt = Table(notice, colWidths=[520])
    nt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFFBEB")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D97706")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(nt)
    story.append(Spacer(1, 14))

    sig_stat = [
        [
            Paragraph("<b>EMPLOYEE CONFORME:</b><br/><br/><b>CAMILLE BEATRICE FERNANDEZ</b><br/>Date: October 28, 2026", body_style),
            Paragraph("<b>PAYROLL & HR VERIFICATION:</b><br/><br/><b>MARITES C. VILLANUEVA</b><br/>HR Payroll & Benefits Officer", body_style)
        ]
    ]
    story.append(Table(sig_stat, colWidths=[260, 260]))
    doc.build(story)
    print("  [Created] Camille_Beatrice_Fernandez_Statutory_Numbers_SSS_PhilHealth_PagIBIG_TIN.pdf")

# ==============================================================================
# 5. PSA BIRTH CERTIFICATE
# ==============================================================================
def create_psa_birth_certificate():
    path = os.path.join(output_dir, "Camille_Beatrice_Fernandez_PSA_Birth_Certificate.pdf")
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []

    psa_head = [
        [Paragraph("<b>REPUBLIC OF THE PHILIPPINES</b><br/>PHILIPPINE STATISTICS AUTHORITY<br/><b>CERTIFICATE OF LIVE BIRTH</b>", ParagraphStyle('PSA', parent=styles['Normal'], alignment=1, fontSize=12, leading=15, fontName='Helvetica-Bold', textColor=colors.HexColor("#1A202C")))]
    ]
    pt = Table(psa_head, colWidths=[520])
    pt.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")), ('BOTTOMPADDING', (0,0), (-1,-1), 8)]))
    story.append(pt)
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#D97706"), spaceBefore=4, spaceAfter=12))

    story.append(Paragraph("<b>OFFICE OF THE CIVIL REGISTRAR GENERAL — SECPA REGISTRY COPY</b>", ParagraphStyle('Sub', parent=subtitle_style, textColor=colors.HexColor("#78350F"))))
    story.append(Spacer(1, 10))

    birth_data = [
        [Paragraph("<b>Registry No.:</b>", table_bold), Paragraph("<b>2002-094182</b>", table_bold), Paragraph("<b>Province / City:</b>", table_bold), Paragraph("Metro Manila / Makati City", table_text)],
        [Paragraph("<b>Child Name:</b>", table_bold), Paragraph("<b>CAMILLE BEATRICE</b>", table_bold), Paragraph("<b>Last Name:</b>", table_bold), Paragraph("<b>FERNANDEZ</b>", table_bold)],
        [Paragraph("<b>Date of Birth:</b>", table_bold), Paragraph("March 29, 2002", table_text), Paragraph("<b>Sex:</b>", table_bold), Paragraph("FEMALE", table_text)],
        [Paragraph("<b>Place of Birth:</b>", table_bold), Paragraph("Makati Medical Center, Makati City", table_text), Paragraph("<b>Type of Birth:</b>", table_bold), Paragraph("Single", table_text)],
        [Paragraph("<b>Mother's Maiden Name:</b>", table_bold), Paragraph("Elena Beatrice Santos", table_text), Paragraph("<b>Citizenship:</b>", table_bold), Paragraph("Filipino", table_text)],
        [Paragraph("<b>Father's Full Name:</b>", table_bold), Paragraph("Manuel Fernandez", table_text), Paragraph("<b>Citizenship:</b>", table_bold), Paragraph("Filipino", table_text)],
        [Paragraph("<b>Date of Marriage:</b>", table_bold), Paragraph("June 14, 1999 (Makati City)", table_text), Paragraph("<b>Verification Barcode:</b>", table_bold), Paragraph("PSA-BC-20020329-84913", table_text)],
    ]
    bt = Table(birth_data, colWidths=[120, 160, 110, 130])
    bt.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D97706")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#FDE68A")),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFFDF5")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(bt)
    story.append(Spacer(1, 16))

    story.append(Paragraph(
        "<b>OFFICIAL ATTESTATION:</b> Issued in security paper (SECPA) pursuant to Commonwealth Act No. 3753 "
        "and Republic Act No. 10625. Certified true and correct extract from the Register of Live Births.",
        body_style
    ))
    story.append(Spacer(1, 20))

    sig_psa = [
        [
            Paragraph("<b>CIVIL REGISTRATION OFFICER:</b><br/><br/><b>MARILOU T. ENCARNACION</b><br/>City Civil Registrar, Makati", body_style),
            Paragraph("<b>CIVIL REGISTRAR GENERAL:</b><br/><br/><b>CLAIRE DENNIS S. MAPA, PhD</b><br/>Undersecretary, National Statistician", body_style)
        ]
    ]
    story.append(Table(sig_psa, colWidths=[260, 260]))
    doc.build(story)
    print("  [Created] Camille_Beatrice_Fernandez_PSA_Birth_Certificate.pdf")

# ==============================================================================
# 6. JOB DESCRIPTION ACKNOWLEDGMENT
# ==============================================================================
def create_job_description_ack():
    path = os.path.join(output_dir, "Camille_Beatrice_Fernandez_Job_Description_Acknowledgment.pdf")
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = build_pdf_header("JOB DESCRIPTION & OPERATIONAL STANDARDS ACKNOWLEDGMENT", "DEPARTMENT OF FOOD & BEVERAGE — RESTAURANT OPERATIONS")

    meta = [
        [Paragraph("<b>Employee Name:</b>", table_bold), Paragraph("Camille Beatrice Fernandez", table_text), Paragraph("<b>Employee Code:</b>", table_bold), Paragraph("EMP-2026-018", table_text)],
        [Paragraph("<b>Job Position:</b>", table_bold), Paragraph("Restaurant Server", table_text), Paragraph("<b>Division:</b>", table_bold), Paragraph("Food & Beverage (Dining Room)", table_text)],
    ]
    mt = Table(meta, colWidths=[110, 160, 100, 150])
    mt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(mt)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>KEY PERFORMANCE RESPONSIBILITIES & STANDARDS</b>", section_heading))
    duties = [
        "<b>1. Service Delivery & Sequence of Service:</b> Greet hotel guests within 30 seconds of seating; present food and beverage menus with polished silver service etiquette; ensure proper cutlery placement according to order courses.",
        "<b>2. MICROS POS Operations & Billing:</b> Accurately input dining orders into the Point of Sale system; process cash, room charge folios, and credit card transactions with zero cashiering variance.",
        "<b>3. Food Hygiene & Safety (HACCP):</b> Comply with strict food handling regulations; observe proper temperature controls for served dishes; report any food quality anomalies to the Sous Chef immediately.",
        "<b>4. Suggestive Selling & Upselling:</b> Proactively recommend premium wine pairings, chef's daily specials, and artisanal dessert selections to optimize dining check averages.",
        "<b>5. Station Mise en Place & Room Turnover:</b> Maintain pristine cleanliness of dining tables, side stations, condiment trays, and banquet function rooms."
    ]
    for d in duties:
        story.append(Paragraph(d, body_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 10))
    ack_text = Paragraph(
        "<b>EMPLOYEE DECLARATION:</b><br/>"
        "I hereby acknowledge that I have received, reviewed, and fully understand the duties, operational standards, "
        "and performance expectations for the position of <b>Restaurant Server</b> at Oxford Suites Makati. "
        "I pledge to perform my duties to the best of my ability and abide by the hotel's operating procedures.",
        body_style
    )
    story.append(ack_text)
    story.append(Spacer(1, 16))

    sig = [
        [
            Paragraph("<b>EMPLOYEE SIGNATURE:</b><br/><br/><b>CAMILLE BEATRICE FERNANDEZ</b><br/>Date Signed: November 03, 2026", body_style),
            Paragraph("<b>DEPARTMENT SUPERVISOR:</b><br/><br/><b>MARJUN DEVERA</b><br/>Food & Beverage Director", body_style)
        ]
    ]
    story.append(Table(sig, colWidths=[260, 260]))
    doc.build(story)
    print("  [Created] Camille_Beatrice_Fernandez_Job_Description_Acknowledgment.pdf")

# ==============================================================================
# 7. COMPANY ORIENTATION CERTIFICATE
# ==============================================================================
def create_orientation_certificate():
    path = os.path.join(output_dir, "Camille_Beatrice_Fernandez_Company_Orientation_Certificate.pdf")
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = build_pdf_header("CERTIFICATE OF ORIENTATION COMPLETION", "OXFORD SUITES MAKATI — HUMAN RESOURCES TRAINING ACADEMY")

    story.append(Spacer(1, 10))
    cert_text = Paragraph(
        "This is to officially certify that<br/><br/>"
        "<font size='16' color='#1A365D'><b>CAMILLE BEATRICE FERNANDEZ</b></font><br/><br/>"
        "has successfully attended, participated in, and completed the mandatory<br/>"
        "<b>NEW EMPLOYEE ORIENTATION & HOSPITALITY EXCELLENCE PROGRAM (NEOP)</b><br/>"
        "conducted on <b>November 04, 2026</b> at the Oxford Suites Makati Grand Ballroom.",
        ParagraphStyle('CertBody', parent=styles['Normal'], alignment=1, fontSize=11, leading=16, textColor=text_dark)
    )
    story.append(cert_text)
    story.append(Spacer(1, 14))

    topics = [
        [Paragraph("<b>Module Code</b>", table_bold), Paragraph("<b>Curriculum Topic</b>", table_bold), Paragraph("<b>Duration</b>", table_bold), Paragraph("<b>Facilitator</b>", table_bold)],
        [Paragraph("NEOP-101", table_text), Paragraph("Oxford Suites History, Vision, Mission & Core Values", table_text), Paragraph("2.0 Hours", table_text), Paragraph("HR Training Manager", table_text)],
        [Paragraph("NEOP-102", table_text), Paragraph("Hospitality Etiquette, Grooming & Service Standards", table_text), Paragraph("2.5 Hours", table_text), Paragraph("F&B Quality Lead", table_text)],
        [Paragraph("NEOP-103", table_text), Paragraph("Occupational Safety, Fire Evacuation & Hazard Controls", table_text), Paragraph("1.5 Hours", table_text), Paragraph("Safety & Security Officer", table_text)],
        [Paragraph("NEOP-104", table_text), Paragraph("Data Privacy Act of 2012 (RA 10173) & Guest Confidentiality", table_text), Paragraph("1.0 Hour", table_text), Paragraph("Compliance Officer", table_text)],
        [Paragraph("NEOP-105", table_text), Paragraph("Employee Self-Service (ESS) Portal Navigation & HR Policies", table_text), Paragraph("1.0 Hour", table_text), Paragraph("HR Systems Admin", table_text)],
    ]
    tt = Table(topics, colWidths=[90, 230, 80, 120])
    tt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(tt)
    story.append(Spacer(1, 18))

    sig_cert = [
        [
            Paragraph("<b>ANA RAMOS</b><br/>HR Training & Development Lead", body_style),
            Paragraph("<b>BULLSEUR SANTIAGO</b><br/>General Manager, Oxford Suites Makati", body_style)
        ]
    ]
    story.append(Table(sig_cert, colWidths=[260, 260]))
    doc.build(story)
    print("  [Created] Camille_Beatrice_Fernandez_Company_Orientation_Certificate.pdf")

# ==============================================================================
# 8. 1ST MONTH PERFORMANCE EVALUATION (30-DAY CHECK-IN)
# ==============================================================================
def create_1st_month_eval():
    path = os.path.join(output_dir, "Camille_Beatrice_Fernandez_1st_Month_Performance_Evaluation.pdf")
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = build_pdf_header("1ST MONTH PROBATIONARY PERFORMANCE EVALUATION", "MILESTONE: 30-DAY OPERATIONAL APPRAISAL (FOOD & BEVERAGE)")

    meta = [
        [Paragraph("<b>Employee Name:</b>", table_bold), Paragraph("Camille Beatrice Fernandez", table_text), Paragraph("<b>Employee Code:</b>", table_bold), Paragraph("EMP-2026-018", table_text)],
        [Paragraph("<b>Position / Dept:</b>", table_bold), Paragraph("Restaurant Server / F&B", table_text), Paragraph("<b>Review Period:</b>", table_bold), Paragraph("Nov 03, 2026 – Dec 03, 2026", table_text)],
    ]
    mt = Table(meta, colWidths=[110, 160, 100, 150])
    mt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(mt)
    story.append(Spacer(1, 10))

    eval_items = [
        [Paragraph("<b>Evaluation Criterion</b>", table_bold), Paragraph("<b>Target Standard</b>", table_bold), Paragraph("<b>Rating (1-5)</b>", table_bold), Paragraph("<b>Supervisor Assessment Comments</b>", table_bold)],
        [Paragraph("Punctuality & Attendance", table_text), Paragraph("Min 95% on-time DTR", table_text), Paragraph("<b>5.0 / 5.0</b>", table_bold), Paragraph("Zero tardiness; clocked in promptly for all breakfast shifts.", table_text)],
        [Paragraph("Menu Knowledge & Orders", table_text), Paragraph("Pass a la carte menu quiz", table_text), Paragraph("<b>4.8 / 5.0</b>", table_bold), Paragraph("Mastered appetizers, signature mains, and allergen specs.", table_text)],
        [Paragraph("MICROS POS Speed", table_text), Paragraph("Fast split-folio entry", table_text), Paragraph("<b>4.7 / 5.0</b>", table_bold), Paragraph("Smooth POS operations with zero cashiering variance.", table_text)],
        [Paragraph("Hygiene & Table Setup", table_text), Paragraph("100% sanitary compliance", table_text), Paragraph("<b>5.0 / 5.0</b>", table_bold), Paragraph("Flawless silver service mise en place; pristine grooming.", table_text)],
        [Paragraph("Teamwork & Floor Cohesion", table_text), Paragraph("Support bussers/runners", table_text), Paragraph("<b>4.8 / 5.0</b>", table_bold), Paragraph("Proactive; assists bar and kitchen expeditor during rush.", table_text)],
    ]
    et = Table(eval_items, colWidths=[130, 120, 70, 200])
    et.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(et)
    story.append(Spacer(1, 10))

    summary = [
        [
            Paragraph("<b>OVERALL COMPOSITE SCORE: <font color='#22543D'>4.86 / 5.0 (EXCEEDS EXPECTATIONS)</font></b><br/>"
                      "<b>SUPERVISOR SUMMARY:</b> Camille has exhibited exceptional dining room initiative and rapid integration into the all-day dining team. Her fine dining background from Shangri-La is evident in her polished silver service and guest engagement. Highly endorsed to continue probationary tenure.", body_style)
        ]
    ]
    st = Table(summary, colWidths=[520])
    st.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FFF4")),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#38A169")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(st)
    story.append(Spacer(1, 14))

    sig = [
        [
            Paragraph("<b>EVALUATED BY:</b><br/><br/><b>MARJUN DEVERA</b><br/>Dining Room Captain / F&B Director", body_style),
            Paragraph("<b>EMPLOYEE ACKNOWLEDGMENT:</b><br/><br/><b>CAMILLE BEATRICE FERNANDEZ</b><br/>Date: December 04, 2026", body_style)
        ]
    ]
    story.append(Table(sig, colWidths=[260, 260]))
    doc.build(story)
    print("  [Created] Camille_Beatrice_Fernandez_1st_Month_Performance_Evaluation.pdf")

# ==============================================================================
# 9. 3RD MONTH PERFORMANCE EVALUATION (90-DAY REVIEW)
# ==============================================================================
def create_3rd_month_eval():
    path = os.path.join(output_dir, "Camille_Beatrice_Fernandez_3rd_Month_Performance_Evaluation.pdf")
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = build_pdf_header("3RD MONTH MID-PROBATIONARY PERFORMANCE APPRAISAL", "MILESTONE: 90-DAY MID-TERM REGULARIZATION CHECKPOINT")

    meta = [
        [Paragraph("<b>Employee Name:</b>", table_bold), Paragraph("Camille Beatrice Fernandez", table_text), Paragraph("<b>Employee Code:</b>", table_bold), Paragraph("EMP-2026-018", table_text)],
        [Paragraph("<b>Position / Dept:</b>", table_bold), Paragraph("Restaurant Server / F&B", table_text), Paragraph("<b>Review Period:</b>", table_bold), Paragraph("Nov 03, 2026 – Feb 03, 2027", table_text)],
    ]
    mt = Table(meta, colWidths=[110, 160, 100, 150])
    mt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(mt)
    story.append(Spacer(1, 10))

    eval_items = [
        [Paragraph("<b>Key Competency</b>", table_bold), Paragraph("<b>Benchmark Requirement</b>", table_bold), Paragraph("<b>Score (1-5)</b>", table_bold), Paragraph("<b>Observed Accomplishments & Metrics</b>", table_bold)],
        [Paragraph("Guest Check Upselling", table_text), Paragraph("₱15,000+ monthly upsell", table_text), Paragraph("<b>5.0 / 5.0</b>", table_bold), Paragraph("Generated ₱28,400 in premium wine & dessert upsells.", table_text)],
        [Paragraph("Guest Satisfaction (CSAT)", table_text), Paragraph("90%+ positive TripAdvisor", table_text), Paragraph("<b>5.0 / 5.0</b>", table_bold), Paragraph("Named positively in 6 guest commendation cards.", table_text)],
        [Paragraph("Banquet & Event Service", table_text), Paragraph("Flawless banquet execution", table_text), Paragraph("<b>4.8 / 5.0</b>", table_bold), Paragraph("Led table section for 200-guest corporate gala dinner.", table_text)],
        [Paragraph("Food Safety & Waste Mgmt", table_text), Paragraph("Zero food handling violations", table_text), Paragraph("<b>5.0 / 5.0</b>", table_bold), Paragraph("100% compliance during internal hotel hygiene audit.", table_text)],
        [Paragraph("Leadership Potential", table_text), Paragraph("Mentor on-call banquet staff", table_text), Paragraph("<b>4.7 / 5.0</b>", table_bold), Paragraph("Demonstrated natural mentorship of new server apprentices.", table_text)],
    ]
    et = Table(eval_items, colWidths=[130, 120, 70, 200])
    et.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(et)
    story.append(Spacer(1, 10))

    summary = [
        [
            Paragraph("<b>MID-TERM STATUS: <font color='#22543D'>4.90 / 5.0 — ADVANCED ON-TRACK FOR REGULARIZATION</font></b><br/>"
                      "<b>F&B MANAGEMENT REMARKS:</b> Camille is performing at a Senior Server / Lead Captain caliber. Her guest rapport, revenue generation, and attendance reliability make her an indispensable asset to the hotel's dining operations.", body_style)
        ]
    ]
    st = Table(summary, colWidths=[520])
    st.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FFF4")),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#38A169")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(st)
    story.append(Spacer(1, 14))

    sig = [
        [
            Paragraph("<b>EVALUATED BY:</b><br/><br/><b>MARJUN DEVERA</b><br/>F&B Director", body_style),
            Paragraph("<b>NOTED BY:</b><br/><br/><b>JUAN DELA CRUZ</b><br/>Human Resources Director", body_style)
        ]
    ]
    story.append(Table(sig, colWidths=[260, 260]))
    doc.build(story)
    print("  [Created] Camille_Beatrice_Fernandez_3rd_Month_Performance_Evaluation.pdf")

# ==============================================================================
# 10. 5TH MONTH REGULARIZATION REVIEW (FINAL ENDORSEMENT)
# ==============================================================================
def create_5th_month_eval():
    path = os.path.join(output_dir, "Camille_Beatrice_Fernandez_5th_Month_Regularization_Review.pdf")
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = build_pdf_header("5TH MONTH FINAL REGULARIZATION APPRAISAL & ENDORSEMENT", "SUBSYSTEM: PROBATIONARY MILESTONE & PERMANENT APPOINTMENT")

    meta = [
        [Paragraph("<b>Employee Name:</b>", table_bold), Paragraph("Camille Beatrice Fernandez", table_text), Paragraph("<b>Employee Code:</b>", table_bold), Paragraph("EMP-2026-018", table_text)],
        [Paragraph("<b>Position:</b>", table_bold), Paragraph("Restaurant Server", table_text), Paragraph("<b>Department:</b>", table_bold), Paragraph("Food & Beverage (DEP-FB)", table_text)],
        [Paragraph("<b>Hiring Date:</b>", table_bold), Paragraph("November 03, 2026", table_text), Paragraph("<b>Regularization Date:</b>", table_bold), Paragraph("May 03, 2027", table_text)],
    ]
    mt = Table(meta, colWidths=[110, 160, 100, 150])
    mt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(mt)
    story.append(Spacer(1, 10))

    eval_items = [
        [Paragraph("<b>Evaluation Pillar (5-Month Cumulative)</b>", table_bold), Paragraph("<b>Weight</b>", table_bold), Paragraph("<b>Score (1-5)</b>", table_bold), Paragraph("<b>Cumulative Rating Notes</b>", table_bold)],
        [Paragraph("1. Technical Service Mastery & Table Etiquette", table_text), Paragraph("25%", table_text), Paragraph("<b>5.0 / 5.0</b>", table_bold), Paragraph("Zero guest complaints; pristine silver service standards.", table_text)],
        [Paragraph("2. Reliability, Punctuality & DTR Integrity", table_text), Paragraph("25%", table_text), Paragraph("<b>5.0 / 5.0</b>", table_bold), Paragraph("100% attendance, zero AWOL, zero late arrivals.", table_text)],
        [Paragraph("3. Sales Optimization & Suggestive Selling", table_text), Paragraph("20%", table_text), Paragraph("<b>4.8 / 5.0</b>", table_bold), Paragraph("Consistently in top 2 highest server check averages.", table_text)],
        [Paragraph("4. Food Safety, HACCP & Sanitation", table_text), Paragraph("15%", table_text), Paragraph("<b>5.0 / 5.0</b>", table_bold), Paragraph("Exemplary station cleanliness & waste management.", table_text)],
        [Paragraph("5. Interpersonal Teamwork & Cultural Fit", table_text), Paragraph("15%", table_text), Paragraph("<b>4.9 / 5.0</b>", table_bold), Paragraph("Received 12 peer recognitions on ESS Kudos board.", table_text)],
    ]
    et = Table(eval_items, colWidths=[160, 50, 70, 240])
    et.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(et)
    story.append(Spacer(1, 10))

    final_verdict = [
        [
            Paragraph("<b>FINAL REGULARIZATION VERDICT: <font size='11' color='#22543D'>CUMULATIVE SCORE: 4.95 / 5.0 (OUTSTANDING)</font></b><br/>"
                      "<b>MANAGEMENT ACTION: <font size='11' color='#1A365D'>RECOMMENDED FOR IMMEDIATE REGULAR STATUS</font></b><br/>"
                      "The candidate has successfully satisfied all statutory, probationary, and operational standards mandated by Oxford Suites Makati and Philippine Labor Law (Article 296). It is formally recommended that <b>CAMILLE BEATRICE FERNANDEZ</b> be granted <b>REGULAR FULL-TIME EMPLOYMENT STATUS</b> with immediate activation of standard HMO and leave entitlements.", body_style)
        ]
    ]
    fvt = Table(final_verdict, colWidths=[520])
    fvt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FFF4")),
        ('BOX', (0,0), (-1,-1), 2, colors.HexColor("#38A169")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(fvt)
    story.append(Spacer(1, 14))

    sig = [
        [
            Paragraph("<b>RECOMMENDING APPROVAL:</b><br/><br/><b>MARJUN DEVERA</b><br/>F&B Director", body_style),
            Paragraph("<b>CONCURRED BY HR:</b><br/><br/><b>JUAN DELA CRUZ</b><br/>Human Resources Director", body_style),
            Paragraph("<b>FINAL APPROVAL:</b><br/><br/><b>BULLSEUR SANTIAGO</b><br/>General Manager", body_style)
        ]
    ]
    story.append(Table(sig, colWidths=[173, 173, 174]))
    doc.build(story)
    print("  [Created] Camille_Beatrice_Fernandez_5th_Month_Regularization_Review.pdf")

def main():
    print("=" * 70)
    print("GENERATING CAMILLE BEATRICE FERNANDEZ ONBOARDING & PROBATIONARY FILES")
    print(f"Output Directory: {output_dir}")
    print("=" * 70)

    create_employment_contract()
    create_nbi_clearance()
    create_medical_fit_to_work()
    create_statutory_numbers()
    create_psa_birth_certificate()
    create_job_description_ack()
    create_orientation_certificate()
    create_1st_month_eval()
    create_3rd_month_eval()
    create_5th_month_eval()

    print("\n" + "=" * 70)
    print("ALL 10 ONBOARDING & PROBATIONARY FILES GENERATED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    main()
