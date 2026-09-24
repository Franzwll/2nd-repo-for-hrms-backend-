import os
import sys
import io
import math
import random
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
import pymupdf
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml

from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.pdfgen import canvas
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

TARGET_BASE = r"c:\Users\PC\Downloads\Ferdi\4TH_YR\DEV\v11.1\2nd-repo-for-hrms-backend-\reference\resume + supporting document"
os.makedirs(TARGET_BASE, exist_ok=True)

def make_pdf_scanned(pdf_path):
    """Flattens a PDF into scanned images without digital text stream to force OCR testing."""
    doc = pymupdf.open(pdf_path)
    out_doc = pymupdf.open()
    for page in doc:
        pix = page.get_pixmap(dpi=200)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=88)
        new_page = out_doc.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(page.rect, stream=buf.getvalue())
    doc.close()
    tmp_path = pdf_path + ".tmp.pdf"
    out_doc.save(tmp_path)
    out_doc.close()
    if os.path.exists(pdf_path):
        os.remove(pdf_path)
    os.rename(tmp_path, pdf_path)

def draw_text_wrapped(c, text, x, y, max_w, font_n, font_s, color_obj, line_h):
    c.setFont(font_n, font_s)
    c.setFillColor(color_obj)
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


# ==============================================================================
# 5 DISTINCT CANDIDATE PROFILES
# ==============================================================================
CANDIDATES = [
    # --------------------------------------------------------------------------
    # 1. Samantha Nicole Dela Cruz (Standard Digital Vector PDFs)
    # --------------------------------------------------------------------------
    {
        "name": "Samantha Nicole Dela Cruz",
        "prefix": "Samantha_Nicole_Dela_Cruz",
        "folder_name": "Samantha Nicole Dela Cruz - Hospitality Resume and Documents",
        "is_scanned_pdf": False,
        "target_position": "Food & Beverage Service Supervisor",
        "phone": "+63 918 421 7732",
        "email": "samantha.delacruz.fb@outlook.ph",
        "address": "1442 Taft Avenue, Malate, 1004 Manila, Philippines",
        "linkedin": "linkedin.com/in/samantha-delacruz-fb",
        "summary": (
            "Passionate and detail-oriented Food & Beverage Service Supervisor with over 6 years of frontline "
            "and leadership experience in five-star hotel dining, signature restaurants, and high-volume banquet "
            "operations. Proven track record in menu engineering, wine service protocol, HACCP food hygiene "
            "compliance, and guest satisfaction enhancement. Skilled in leading multicultural service brigades of "
            "up to 20 personnel while driving beverage profitability and minimizing table turnaround delays."
        ),
        "skills": [
            "Fine Dining Table Grooming & French / Russian Service Protocols",
            "Wine Service, Beverage Pairing & Sommelier Support",
            "Pre-Shift Briefing, Station Allocation & Crew Leadership (up to 20 staff)",
            "Point of Sale (POS) Administration & Shift Reconciliations (Micros Simphony)",
            "Guest Complaint Resolution & VIP Table Management",
            "Beverage Cost Control, Stock Par Levels & Requisition Auditing",
            "Food Safety, HACCP Compliance & Kitchen-Floor Coordination",
            "Table Turnover Optimization & Floor Flow Logistics"
        ],
        "experience": [
            {
                "company": "Solaire Resort & Casino",
                "location": "Parañaque City, Metro Manila",
                "position": "Food & Beverage Service Supervisor",
                "duration": "July 2021 – Present",
                "bullets": [
                    "Supervise floor service operations for an upscale 220-seat signature restaurant generating PHP 1.8M monthly beverage revenue.",
                    "Lead pre-shift briefings and mentor 18 service captains, food runners, and bar attendants on fine dining standards.",
                    "Reduced guest table wait times by 14% through revised station zoning and real-time Micros POS coordination.",
                    "Maintained zero food safety infractions during quarterly health and luxury hotel hygiene audits."
                ]
            },
            {
                "company": "Sofitel Philippine Plaza",
                "location": "Pasay City, Metro Manila",
                "position": "Restaurant Captain",
                "duration": "February 2019 – June 2021",
                "bullets": [
                    "Directed table service for a high-volume buffet and poolside dining lounge accommodating up to 450 covers daily.",
                    "Enforced beverage inventory par levels and reduced wine bottle breakage by 12% across quarterly audits.",
                    "Trained 15 junior attendants in five-star sequence of service, silver polishing, and wine decanting protocols."
                ]
            },
            {
                "company": "The Bistro Group",
                "location": "Makati City, Metro Manila",
                "position": "Dining Service Attendant",
                "duration": "June 2017 – January 2019",
                "bullets": [
                    "Delivered plated dining service and upsold premium beverage selections across casual-dining venues.",
                    "Handled cash and credit card settlement with 100% register reconciliation accuracy."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Hotel and Restaurant Management",
            "institution": "University of Santo Tomas (UST) — España, Manila",
            "year": "2017"
        },
        "certifications": [
            {
                "title": "ServSafe Food Protection Manager",
                "issuer": "National Restaurant Association / FSPIC",
                "date": "October 2021"
            },
            {
                "title": "WSET Level 2 Award in Wines",
                "issuer": "Wine & Spirit Education Trust",
                "date": "September 2022"
            },
            {
                "title": "Hospitality Customer Service Excellence",
                "issuer": "Philippine Hospitality Development Center",
                "date": "August 2019"
            }
        ],
        "theme": {
            "p_dark": "#4A0E17",     # Deep Wine / Maroon
            "p_accent": "#C59B27",   # Warm Gold
            "p_light": "#FFF7ED",    # Cream White
            "p_sub": "#7C2D12",      # Rich Amber
            "p_gray": "#374151"
        },
        "discrepancy_coe_dates": "April 1, 2019 – June 20, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from April 2019 to June 2021, whereas resume claims start date of February 2019 (2-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Basic Bartending and Mixology Workshop",
        "discrepancy_cert_reason": "Resume claims 'Hospitality Customer Service Excellence', but submitted certificate indicates 'Foundations of Basic Bartending and Mixology Workshop'.",
        "incomplete_cert_name": "WSET Level 2 Award in Wines",
        "incomplete_reason": "Recipient name area is torn and missing from document scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 2. Carlo Dominic Reyes (Scanned / Image-Only PDFs - OCR Benchmark)
    # --------------------------------------------------------------------------
    {
        "name": "Carlo Dominic Reyes",
        "prefix": "Carlo_Dominic_Reyes",
        "folder_name": "Carlo Dominic Reyes - Hospitality Resume and Documents",
        "is_scanned_pdf": True,
        "target_position": "Front Office & Guest Services Supervisor",
        "phone": "+63 917 639 2145",
        "email": "carlo.reyes.frontoffice@outlook.ph",
        "address": "88 New Manila, Quezon City, 1112 Metro Manila, Philippines",
        "linkedin": "linkedin.com/in/carlo-reyes-frontoffice",
        "summary": (
            "Accomplished, guest-centric Front Office & Guest Services Supervisor with over 6 years of front-desk "
            "and rooms division leadership in five-star integrated resorts and luxury business hotels. Proficient in "
            "Opera PMS, Forbes luxury service standards, VIP arrival staging, and room inventory yield management. "
            "Recognized for maintaining over 94% guest satisfaction indices and resolving intricate guest concerns "
            "with diplomacy, tact, and speed."
        ),
        "skills": [
            "Opera PMS Cloud & Property Management Systems Administration",
            "Front Desk Check-in / Check-out Floor Supervision & Queue Mitigation",
            "VIP Guest Arrival Staging & High-Tier Loyalty Recognition",
            "Night Audit Reconciliations & Daily Rooms Division Balancing",
            "Upselling Programs, Late Check-out Monetization & Room Yield Support",
            "Emergency Response, Keycard Security & Guest Privacy Protocols",
            "Cross-Departmental Coordination with Housekeeping & Engineering",
            "Front Office Team Training, Rostering & Shift Handover Management"
        ],
        "experience": [
            {
                "company": "Okada Manila",
                "location": "Parañaque City, Metro Manila",
                "position": "Front Office Duty Supervisor",
                "duration": "August 2022 – Present",
                "bullets": [
                    "Supervise front office lobby operations, check-in desks, and guest services across a 993-room luxury integrated resort.",
                    "Train and lead 22 front desk agents, concierge associates, and bell captains in five-star service standards.",
                    "Generated PHP 850,000 in incremental revenue during Q1 2023 via front desk suite upselling and early check-in fees.",
                    "Maintained an average check-in processing duration of under 3 minutes during peak conference arrival windows."
                ]
            },
            {
                "company": "The Peninsula Manila",
                "location": "Makati City, Metro Manila",
                "position": "Guest Relations Officer / Shift Leader",
                "duration": "March 2020 – July 2022",
                "bullets": [
                    "Orchestrated personalized VIP arrival greetings, amenity placements, and private check-ins for suite guests.",
                    "Coordinated directly with Housekeeping to expedite room turnovers for early arrivals and diplomatic delegations.",
                    "Handled guest escalations calmly and achieved a 96% dispute resolution rate prior to guest departure."
                ]
            },
            {
                "company": "City Garden Grand Hotel",
                "location": "Makati City, Metro Manila",
                "position": "Front Desk Associate",
                "duration": "May 2018 – February 2020",
                "bullets": [
                    "Processed registration, key issuance, and currency exchange for international leisure and business travelers.",
                    "Performed cashiering duties and balanced shift folios with zero variance over 18 consecutive months."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Hotel, Restaurant, and Institution Management",
            "institution": "De La Salle-College of Saint Benilde (DLS-CSB) — Malate, Manila",
            "year": "2018"
        },
        "certifications": [
            {
                "title": "Certified Front Desk Representative (CFDR)",
                "issuer": "American Hotel & Lodging Educational Institute (AHLEI)",
                "date": "November 2020"
            },
            {
                "title": "Opera PMS Cloud Administration",
                "issuer": "Oracle Hospitality University",
                "date": "August 2022"
            },
            {
                "title": "Crisis Response & Guest Safety in Lodging",
                "issuer": "Philippine Hotel Security Association",
                "date": "March 2021"
            }
        ],
        "theme": {
            "p_dark": "#0F2942",     # Deep Ocean Navy
            "p_accent": "#0284C7",   # Aegean Blue
            "p_light": "#F0F9FF",    # Soft Ice Blue
            "p_sub": "#0369A1",      # Deep Sky Blue
            "p_gray": "#334155"
        },
        "discrepancy_coe_dates": "July 1, 2020 – July 15, 2022",
        "discrepancy_coe_reason": "Official COE certifies employment from July 2020 to July 2022, whereas resume claims start date of March 2020 (4-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Front Office Telephone Etiquette and Call Routing",
        "discrepancy_cert_reason": "Resume claims 'Crisis Response & Guest Safety in Lodging', but certificate certifies 'Foundations of Front Office Telephone Etiquette and Call Routing'.",
        "incomplete_cert_name": "Certified Front Desk Representative (CFDR)",
        "incomplete_reason": "Recipient name area is cut off due to torn corner scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 3. Alyssa Marie Valdez (Standard Digital Vector PDFs)
    # --------------------------------------------------------------------------
    {
        "name": "Alyssa Marie Valdez",
        "prefix": "Alyssa_Marie_Valdez",
        "folder_name": "Alyssa Marie Valdez - Hospitality Resume and Documents",
        "is_scanned_pdf": False,
        "target_position": "Executive Housekeeper / Floor Supervisor",
        "phone": "+63 919 782 4310",
        "email": "alyssa.valdez.hospitality@outlook.ph",
        "address": "45 Commonwealth Avenue, Diliman, 1101 Quezon City, Philippines",
        "linkedin": "linkedin.com/in/alyssa-valdez-hospitality",
        "summary": (
            "Proactive and meticulous Housekeeping Floor Supervisor with 5+ years of operational excellence in luxury "
            "hotel accommodations, public area cleanliness, and laundry management. Highly skilled in conducting 50+ "
            "daily room inspections, optimizing linen turnarounds, enforcing OSHA/HACCP chemical safety guidelines, "
            "and directing housekeeping attendant teams of up to 25 staff. Dedicated to maximizing room cleanliness "
            "audit scores and delivering pristine guest accommodations."
        ),
        "skills": [
            "Luxury Guestroom & Suite Inspection Standards (Forbes 5-Star Checklist)",
            "Housekeeping Crew Scheduling, Task Assignment & Productivity Tracking",
            "Linen Inventory Control, Par Stock Auditing & Laundry Turnaround Flow",
            "Chemical Safety, MSDS Protocols & Infection Control Compliance",
            "Lost & Found Logging, Security Reporting & Custody Chain Protocols",
            "Turndown Service Coordination & VIP Preference Staging",
            "Public Area Maintenance & Deep Cleaning Schedule Execution",
            "Defect Logging & Maintenance Dispatch (HotSOS / FCS Housekeeping)"
        ],
        "experience": [
            {
                "company": "Conrad Manila",
                "location": "Pasay City, Metro Manila",
                "position": "Housekeeping Floor Supervisor",
                "duration": "October 2022 – Present",
                "bullets": [
                    "Supervise daily housekeeping floor operations across 140 luxury guestrooms and executive suites.",
                    "Direct morning briefings, assign room sections, and monitor room status updates via HotSOS mobile terminals.",
                    "Raised guest cleanliness rating score from 91.2% to 96.8% within 9 months through stringent 40-point checklist reviews.",
                    "Coordinated linen replenishment with laundry plant, reducing linen deficit write-offs by 15%."
                ]
            },
            {
                "company": "Shangri-La at the Fort",
                "location": "Taguig City, Metro Manila",
                "position": "Housekeeping Team Leader",
                "duration": "January 2021 – September 2022",
                "bullets": [
                    "Led a crew of 14 room attendants and housemen maintaining guest floors and executive club lounges.",
                    "Conducted weekly chemical safety and dilution audits in accordance with environmental standards.",
                    "Managed evening turndown service and coordinated special guest bedding preference requests."
                ]
            },
            {
                "company": "Belmont Hotel Manila",
                "location": "Pasay City, Metro Manila",
                "position": "Housekeeping Attendant",
                "duration": "June 2019 – December 2020",
                "bullets": [
                    "Cleaned, serviced, and replenished 16 guestrooms per 8-hour shift maintaining company quality benchmarks.",
                    "Accurately inventoried room minibars and promptly reported guestroom maintenance deficiencies."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Hospitality and Tourism Management",
            "institution": "Far Eastern University (FEU) — Nicanor Reyes St., Manila",
            "year": "2019"
        },
        "certifications": [
            {
                "title": "Certified Hospitality Housekeeping Executive (CHHE)",
                "issuer": "Hospitality Operations Institute / FHCB",
                "date": "May 2022"
            },
            {
                "title": "Chemical Safety & Infection Control Standards",
                "issuer": "Philippine Safety & Hygiene Council",
                "date": "November 2021"
            },
            {
                "title": "Housekeeping Room Inspection Mastery",
                "issuer": "Philippine Hospitality Development Center",
                "date": "July 2020"
            }
        ],
        "theme": {
            "p_dark": "#064E3B",     # Deep Forest Emerald
            "p_accent": "#059669",   # Fresh Emerald Green
            "p_light": "#ECFDF5",    # Soft Mint White
            "p_sub": "#047857",      # Mid Emerald
            "p_gray": "#334155"
        },
        "discrepancy_coe_dates": "May 1, 2021 – September 15, 2022",
        "discrepancy_coe_reason": "Official COE certifies employment from May 2021 to September 2022, whereas resume claims start date of January 2021 (4-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Commercial Laundry & Dry Cleaning Operations",
        "discrepancy_cert_reason": "Resume claims 'Housekeeping Room Inspection Mastery', but certificate certifies 'Foundations of Commercial Laundry & Dry Cleaning Operations'.",
        "incomplete_cert_name": "Certified Hospitality Housekeeping Executive (CHHE)",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 4. Rafael Dominic Lim (Scanned / Image-Only PDFs - OCR Benchmark)
    # --------------------------------------------------------------------------
    {
        "name": "Rafael Dominic Lim",
        "prefix": "Rafael_Dominic_Lim",
        "folder_name": "Rafael Dominic Lim - Hospitality Resume and Documents",
        "is_scanned_pdf": True,
        "target_position": "Banquet & Catering Operations Manager",
        "phone": "+63 917 810 5923",
        "email": "rafael.lim.banquets@outlook.ph",
        "address": "72 Roxas Triangle, Salcedo Village, 1227 Makati City, Philippines",
        "linkedin": "linkedin.com/in/rafael-lim-banquets",
        "summary": (
            "Visionary, results-oriented Banquet & Catering Operations Manager with over 8 years of distinguished "
            "hospitality leadership overseeing luxury ballrooms, high-profile diplomatic summits, and grand wedding "
            "galas catering up to 1,200 guests. Expert in banquet budgeting, BEO translation, culinary staging "
            "synchronization, and beverage cost containment. Recognized for orchestrating flawless event rollouts while "
            "optimizing labor cost ratios and chinaware preservation."
        ),
        "skills": [
            "Mega-Scale Banquet Event Order (BEO) Planning & Execution (up to 1,200 covers)",
            "Event Logistics, Function Hall Turnarounds & Spatial Floor Layouts",
            "Departmental Labor Cost Control & On-Call Banquet Staff Management (up to 45 staff)",
            "VIP Diplomatic Protocol, Head Table Service & Security Liaison",
            "Chinaware, Glassware & Silverware (CGS) Par Levels & Breakage Mitigation",
            "Cross-Functional Kitchen Staging & Multi-Course Food Rollout Timers",
            "Banquet Beverage Requisition, Bar Packages & Revenue Reconciliations",
            "Crisis Mitigation, Crowd Flow Management & HACCP Safety Enforcement"
        ],
        "experience": [
            {
                "company": "Marriott Hotel Manila",
                "location": "Pasay City, Metro Manila",
                "position": "Banquet Operations Manager",
                "duration": "September 2021 – Present",
                "bullets": [
                    "Direct banquet and catering operations across the Grand Ballroom and 12 meeting salons accommodating up to 1,200 attendees.",
                    "Manage a core team of 28 full-time staff and up to 50 outsourced catering personnel per major event.",
                    "Successfully delivered over 180 corporate conventions, international summits, and luxury galas with 99.4% on-time rollout.",
                    "Decreased operational equipment damage by 21% through standardized crate packing and storage handling SOPs."
                ]
            },
            {
                "company": "Diamond Hotel Philippines",
                "location": "Manila Bay, Manila",
                "position": "Assistant Banquet Manager",
                "duration": "July 2018 – August 2021",
                "bullets": [
                    "Supervised ballroom service operations, buffet presentations, and VIP protocol dining.",
                    "Coordinated closely with executive culinary teams to ensure prompt delivery of multi-course banquets.",
                    "Conducted daily pre-shift grooming inspections and trained staff on French silver service techniques."
                ]
            },
            {
                "company": "Century Park Hotel",
                "location": "Malate, Manila",
                "position": "Banquet Captain",
                "duration": "May 2016 – June 2018",
                "bullets": [
                    "Led team of 10 banquet servers during corporate seminars, wedding breakfasts, and social dinners.",
                    "Managed table linen distribution and function room breakdown logistics."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in International Hospitality Management",
            "institution": "Centro Escolar University (CEU) — Mendiola, Manila",
            "year": "2016"
        },
        "certifications": [
            {
                "title": "Certified Food and Beverage Executive (CFBE)",
                "issuer": "American Hotel & Lodging Educational Institute (AHLEI)",
                "date": "October 2020"
            },
            {
                "title": "Advanced HACCP & Food Defense in Large Venues",
                "issuer": "Food Safety Council of the Philippines",
                "date": "April 2022"
            },
            {
                "title": "Event Logistics & Crowd Management",
                "issuer": "Philippine MICE Academy",
                "date": "November 2018"
            }
        ],
        "theme": {
            "p_dark": "#1E1B4B",     # Deep Royal Indigo
            "p_accent": "#D97706",   # Deep Amber Gold
            "p_light": "#EEF2FF",    # Pale Indigo Tint
            "p_sub": "#4338CA",      # Royal Purple Indigo
            "p_gray": "#1F2937"
        },
        "discrepancy_coe_dates": "November 1, 2018 – August 15, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from November 2018 to August 2021, whereas resume claims start date of July 2018 (4-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Banquet Beverage Dispensing & Bar Station Setup",
        "discrepancy_cert_reason": "Resume claims 'Event Logistics & Crowd Management', but certificate certifies 'Foundations of Banquet Beverage Dispensing & Bar Station Setup'.",
        "incomplete_cert_name": "Certified Food and Beverage Executive (CFBE)",
        "incomplete_reason": "Recipient name area is torn and missing from document scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 5. Camille Therese Aquino (Standard Digital Vector PDFs)
    # --------------------------------------------------------------------------
    {
        "name": "Camille Therese Aquino",
        "prefix": "Camille_Therese_Aquino",
        "folder_name": "Camille Therese Aquino - Hospitality Resume and Documents",
        "is_scanned_pdf": False,
        "target_position": "Hotel Sales & Events Coordinator",
        "phone": "+63 918 319 6654",
        "email": "camille.aquino.events@outlook.ph",
        "address": "12 Pioneer Street, Mandaluyong City, 1550 Metro Manila, Philippines",
        "linkedin": "linkedin.com/in/camille-aquino-events",
        "summary": (
            "Energetic, relationship-driven Hotel Sales & Events Coordinator with 5+ years of progressive success "
            "in luxury corporate event planning, wedding sales, and banquet space maximization. Adept in client "
            "prospecting, RFP contract drafting, Delphi.fd sales CRM systems, and end-to-end event execution. "
            "Consistently surpassed quarterly sales revenue targets by an average of 18% while sustaining a 98% client "
            "retention rate."
        ),
        "skills": [
            "Corporate Event & Wedding Sales Prospecting & Relationship Management",
            "Banquet Event Order (BEO) Drafting & Detailed Specification Mapping",
            "Delphi.fd / Opera Sales & Catering CRM Systems Administration",
            "Client Contract Negotiation, Deposit Tracking & Credit Approvals",
            "Site Inspections, Event Staging & Custom Client Showcases",
            "Cross-Departmental Coordination with Banquets, Kitchen & Audio-Visual",
            "Event Revenue Tracking, Room Block Yielding & Attrition Monitoring",
            "Post-Event Feedback Audits, Billing Reconciliations & Account Retention"
        ],
        "experience": [
            {
                "company": "Fairmont Makati & Raffles Residences",
                "location": "Makati City, Metro Manila",
                "position": "Senior Event Sales Coordinator",
                "duration": "November 2022 – Present",
                "bullets": [
                    "Manage end-to-end sales, contract negotiations, and planning for corporate conferences, social galas, and diplomatic dinners.",
                    "Generated over PHP 24M in banquet event revenues during 2023, exceeding annual sales quota by 22%.",
                    "Conduct detailed weekly BEO review meetings with banquet service, culinary, and engineering heads.",
                    "Maintained a client satisfaction index of 98.2% across post-event post-con surveys."
                ]
            },
            {
                "company": "Discovery Primea",
                "location": "Ayala Avenue, Makati City",
                "position": "Catering & Event Sales Executive",
                "duration": "August 2020 – October 2022",
                "bullets": [
                    "Handled boutique wedding sales, executive board meetings, and high-end cocktail receptions.",
                    "Prepared sales proposals, tailored catering menus, and conducted prospective client walk-throughs.",
                    "Reconciled event billing statements with finance to ensure prompt payment collection within 15 days."
                ]
            },
            {
                "company": "New World Makati Hotel",
                "location": "Makati City, Metro Manila",
                "position": "Events Assistant",
                "duration": "July 2019 – July 2020",
                "bullets": [
                    "Assisted senior sales managers with RFP inquiries, telephone client screening, and banquet file archiving.",
                    "Coordinated event signage, parking passes, and guest gift bags during large conventions."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Tourism and Events Management",
            "institution": "Miriam College — Katipunan Avenue, Quezon City",
            "year": "2019"
        },
        "certifications": [
            {
                "title": "Certified Meeting Professional (CMP)",
                "issuer": "Events Industry Council / PCMA",
                "date": "September 2022"
            },
            {
                "title": "Delphi.fd Hospitality Sales Specialist",
                "issuer": "Amadeus Hospitality University",
                "date": "June 2021"
            },
            {
                "title": "Contract Negotiation in Luxury Events",
                "issuer": "Philippine MICE Institute",
                "date": "January 2020"
            }
        ],
        "theme": {
            "p_dark": "#312E81",     # Indigo Night
            "p_accent": "#4F46E5",   # Violet Indigo
            "p_light": "#FAF5FF",    # Pale Lavender White
            "p_sub": "#6366F1",      # Light Indigo Accent
            "p_gray": "#334155"
        },
        "discrepancy_coe_dates": "December 1, 2020 – October 15, 2022",
        "discrepancy_coe_reason": "Official COE certifies employment from December 2020 to October 2022, whereas resume claims start date of August 2020 (4-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Social Media Marketing for Event Venues",
        "discrepancy_cert_reason": "Resume claims 'Contract Negotiation in Luxury Events', but certificate certifies 'Foundations of Social Media Marketing for Event Venues'.",
        "incomplete_cert_name": "Certified Meeting Professional (CMP)",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    }
]


# ==============================================================================
# GENERATOR FUNCTIONS PER CANDIDATE
# ==============================================================================

# 1. Resume Template 1 (PDF) - Two-Column Layout
def build_candidate_resume1_pdf(cand, out_path):
    c = canvas.Canvas(out_path, pagesize=letter)
    width, height = letter
    theme = cand["theme"]

    sidebar_w = 205
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.rect(0, 0, sidebar_w, height, stroke=0, fill=1)

    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.rect(sidebar_w - 4, 0, 4, height, stroke=0, fill=1)

    # Sidebar Header
    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 14)
    name_parts = cand["name"].split(" ")
    if len(name_parts) >= 3:
        c.drawString(20, height - 48, " ".join(name_parts[:2]).upper())
        c.drawString(20, height - 66, " ".join(name_parts[2:]).upper())
    else:
        c.drawString(20, height - 52, cand["name"].upper())

    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.setFont(F_SANS_BOLD, 8)
    # Wrap target position
    t_pos = cand["target_position"].upper()
    if len(t_pos) > 28:
        c.drawString(20, height - 82, t_pos[:26])
        c.drawString(20, height - 92, t_pos[26:].strip())
        cur_y = height - 104
    else:
        c.drawString(20, height - 82, t_pos)
        cur_y = height - 96

    c.setStrokeColor(colors.HexColor(theme["p_sub"]))
    c.setLineWidth(1)
    c.line(20, cur_y, sidebar_w - 20, cur_y)
    cur_y -= 16

    # Contact
    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(20, cur_y, "CONTACT CHANNELS")
    cur_y -= 12

    c_items = [
        ("PHONE", cand["phone"]),
        ("EMAIL", cand["email"]),
        ("ADDRESS", cand["address"]),
        ("LINKEDIN", cand["linkedin"])
    ]
    for lbl, val in c_items:
        c.setFont(F_SANS_BOLD, 7)
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        c.drawString(20, cur_y, lbl)
        cur_y -= 9
        c.setFont(F_SANS, 7.2)
        c.setFillColor(colors.white)
        cur_y = draw_text_wrapped(c, val, 20, cur_y, sidebar_w - 35, F_SANS, 7.2, colors.white, 9)
        cur_y -= 4

    cur_y -= 6
    # Education
    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(20, cur_y, "EDUCATION")
    cur_y -= 12

    c.setFont(F_SANS_BOLD, 7.8)
    c.setFillColor(colors.white)
    cur_y = draw_text_wrapped(c, cand["education"]["degree"], 20, cur_y, sidebar_w - 35, F_SANS_BOLD, 7.8, colors.white, 9.5)
    cur_y -= 2
    c.setFont(F_SANS, 7.2)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    cur_y = draw_text_wrapped(c, cand["education"]["institution"], 20, cur_y, sidebar_w - 35, F_SANS, 7.2, colors.HexColor("#CBD5E1"), 9)
    cur_y -= 2
    c.setFont(F_SANS_BOLD, 7.2)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.drawString(20, cur_y, f"Class of {cand['education']['year']}")
    cur_y -= 16

    # Certifications
    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 8.5)
    c.drawString(20, cur_y, "CERTIFICATIONS")
    cur_y -= 12

    for cert in cand["certifications"]:
        c.setFont(F_SANS_BOLD, 7.5)
        c.setFillColor(colors.white)
        cur_y = draw_text_wrapped(c, cert["title"], 20, cur_y, sidebar_w - 35, F_SANS_BOLD, 7.5, colors.white, 9)
        cur_y -= 2
        c.setFont(F_SANS, 7)
        c.setFillColor(colors.HexColor("#CBD5E1"))
        cur_y = draw_text_wrapped(c, f"{cert['issuer']} ({cert['date']})", 20, cur_y, sidebar_w - 35, F_SANS, 7, colors.HexColor("#CBD5E1"), 8.5)
        cur_y -= 6

    # Right Column Content
    right_x = 225
    right_w = width - right_x - 25
    ry = height - 48

    def draw_h(title, y_pos):
        c.setFillColor(colors.HexColor(theme["p_dark"]))
        c.setFont(F_SANS_BOLD, 10)
        c.drawString(right_x, y_pos, title)
        c.setStrokeColor(colors.HexColor("#CBD5E1"))
        c.setLineWidth(0.8)
        c.line(right_x, y_pos - 4, width - 25, y_pos - 4)
        c.setStrokeColor(colors.HexColor(theme["p_dark"]))
        c.setLineWidth(2)
        c.line(right_x, y_pos - 4, right_x + 40, y_pos - 4)
        return y_pos - 16

    ry = draw_h("PROFESSIONAL SUMMARY", ry)
    ry = draw_text_wrapped(c, cand["summary"], right_x, ry, right_w, F_SANS, 8, colors.HexColor(theme["p_gray"]), 11.2)
    ry -= 6

    ry = draw_h("CORE COMPETENCIES & SKILLS", ry)
    half_w = (right_w - 10) / 2
    sk1 = cand["skills"][:4]
    sk2 = cand["skills"][4:]
    s_top = ry
    for sk in sk1:
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        c.circle(right_x + 4, ry - 3, 2, stroke=0, fill=1)
        ry = draw_text_wrapped(c, sk, right_x + 11, ry, half_w - 15, F_SANS, 7.3, colors.HexColor("#1F2937"), 9.5)
        ry -= 2
    bot1 = ry

    ry2 = s_top
    for sk in sk2:
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        c.circle(right_x + half_w + 4, ry2 - 3, 2, stroke=0, fill=1)
        ry2 = draw_text_wrapped(c, sk, right_x + half_w + 11, ry2, half_w - 15, F_SANS, 7.3, colors.HexColor("#1F2937"), 9.5)
        ry2 -= 2
    bot2 = ry2
    ry = min(bot1, bot2) - 8

    ry = draw_h("WORK EXPERIENCE", ry)
    for exp in cand["experience"]:
        c.setFont(F_SANS_BOLD, 8.8)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(right_x, ry, exp["company"])

        c.setFont(F_SANS_BOLD, 8)
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        dw = c.stringWidth(exp["duration"], F_SANS_BOLD, 8)
        c.drawString(width - 25 - dw, ry, exp["duration"])
        ry -= 10

        c.setFont(F_SANS_BOLD, 7.8)
        c.setFillColor(colors.HexColor("#334155"))
        c.drawString(right_x, ry, exp["position"])

        c.setFont(F_SANS_ITALIC, 7.2)
        c.setFillColor(colors.HexColor("#64748B"))
        lw = c.stringWidth(exp["location"], F_SANS_ITALIC, 7.2)
        c.drawString(width - 25 - lw, ry, exp["location"])
        ry -= 10

        for b in exp["bullets"]:
            c.setFillColor(colors.HexColor("#94A3B8"))
            c.circle(right_x + 4, ry - 2.5, 1.5, stroke=0, fill=1)
            ry = draw_text_wrapped(c, b, right_x + 11, ry, right_w - 11, F_SANS, 7.3, colors.HexColor("#334155"), 9.8)
            ry -= 2
        ry -= 5

    c.save()

    if cand["is_scanned_pdf"]:
        make_pdf_scanned(out_path)
    print(f"Generated Resume PDF: {out_path} (Scanned={cand['is_scanned_pdf']})")


# 2. Resume Template 2 (DOCX) - Traditional Corporate Single-Column
def build_candidate_resume2_docx(cand, out_path):
    doc = docx.Document()
    for sec in doc.sections:
        sec.top_margin = Inches(0.65)
        sec.bottom_margin = Inches(0.65)
        sec.left_margin = Inches(0.75)
        sec.right_margin = Inches(0.75)

    p_name = doc.add_paragraph()
    p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_name.paragraph_format.space_after = Pt(2)
    r_n = p_name.add_run(cand["name"].upper())
    r_n.font.name = 'Georgia'
    r_n.font.size = Pt(17)
    r_n.font.bold = True
    r_n.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)

    p_pos = doc.add_paragraph()
    p_pos.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_pos.paragraph_format.space_after = Pt(4)
    r_p = p_pos.add_run(cand["target_position"])
    r_p.font.name = 'Georgia'
    r_p.font.size = Pt(11)
    r_p.font.bold = True
    r_p.font.italic = True
    r_p.font.color.rgb = RGBColor(0x4A, 0x55, 0x68)

    p_c = doc.add_paragraph()
    p_c.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_c.paragraph_format.space_after = Pt(8)
    r_c = p_c.add_run(f"{cand['address']}  •  {cand['phone']}\n{cand['email']}  •  {cand['linkedin']}")
    r_c.font.name = 'Georgia'
    r_c.font.size = Pt(8.5)
    r_c.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

    def add_h(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(title.upper())
        run.font.name = 'Georgia'
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)
        pPr = p._p.get_or_add_pPr()
        pBdr = parse_xml(r'<w:pBdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
                         r'<w:bottom w:val="single" w:sz="8" w:space="2" w:color="1B365D"/>'
                         r'</w:pBdr>')
        pPr.append(pBdr)

    # Summary
    add_h("Professional Summary")
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_after = Pt(6)
    r_s = p_s.add_run(cand["summary"])
    r_s.font.name = 'Georgia'
    r_s.font.size = Pt(9)

    # Skills Table
    add_h("Core Competencies & Skills")
    table = doc.add_table(rows=4, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    for row in table.rows:
        row.cells[0].width = Inches(3.5)
        row.cells[1].width = Inches(3.5)
    for idx in range(4):
        cL = table.rows[idx].cells[0].paragraphs[0]
        cL.paragraph_format.space_after = Pt(2)
        rL = cL.add_run(f"•  {cand['skills'][idx]}")
        rL.font.name = 'Georgia'
        rL.font.size = Pt(8.5)

        cR = table.rows[idx].cells[1].paragraphs[0]
        cR.paragraph_format.space_after = Pt(2)
        rR = cR.add_run(f"•  {cand['skills'][idx+4]}")
        rR.font.name = 'Georgia'
        rR.font.size = Pt(8.5)

    # Experience
    add_h("Work Experience")
    for exp in cand["experience"]:
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

        p_ro = t_exp.rows[1].cells[0].paragraphs[0]
        p_ro.paragraph_format.space_after = Pt(2)
        p_ro.paragraph_format.space_before = Pt(0)
        r_ro = p_ro.add_run(exp["position"])
        r_ro.font.name = 'Georgia'
        r_ro.font.size = Pt(9)
        r_ro.font.italic = True

        p_lo = t_exp.rows[1].cells[1].paragraphs[0]
        p_lo.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_lo.paragraph_format.space_after = Pt(2)
        p_lo.paragraph_format.space_before = Pt(0)
        r_lo = p_lo.add_run(exp["location"])
        r_lo.font.name = 'Georgia'
        r_lo.font.size = Pt(8.5)
        r_lo.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

        for b in exp["bullets"]:
            p_b = doc.add_paragraph(style='List Bullet')
            p_b.paragraph_format.space_before = Pt(0)
            p_b.paragraph_format.space_after = Pt(1.5)
            r_b = p_b.add_run(b)
            r_b.font.name = 'Georgia'
            r_b.font.size = Pt(8.5)

    # Education
    add_h("Education")
    t_ed = doc.add_table(rows=1, cols=2)
    t_ed.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_ed.rows[0].cells[0].width = Inches(5.5)
    t_ed.rows[0].cells[1].width = Inches(1.5)
    p_e1 = t_ed.rows[0].cells[0].paragraphs[0]
    p_e1.paragraph_format.space_after = Pt(2)
    r_deg = p_e1.add_run(f"{cand['education']['degree']}\n")
    r_deg.font.name = 'Georgia'
    r_deg.font.size = Pt(9)
    r_deg.font.bold = True
    r_ins = p_e1.add_run(cand['education']['institution'])
    r_ins.font.name = 'Georgia'
    r_ins.font.size = Pt(8.5)

    p_e2 = t_ed.rows[0].cells[1].paragraphs[0]
    p_e2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_yr = p_e2.add_run(f"Year: {cand['education']['year']}")
    r_yr.font.name = 'Georgia'
    r_yr.font.size = Pt(9)
    r_yr.font.bold = True

    # Certifications
    add_h("Training & Certifications")
    for cert in cand["certifications"]:
        p_ct = doc.add_paragraph(style='List Bullet')
        p_ct.paragraph_format.space_before = Pt(0)
        p_ct.paragraph_format.space_after = Pt(2)
        r_t = p_ct.add_run(f"{cert['title']} ")
        r_t.font.name = 'Georgia'
        r_t.font.size = Pt(8.5)
        r_t.font.bold = True
        r_i = p_ct.add_run(f"— {cert['issuer']} ({cert['date']})")
        r_i.font.name = 'Georgia'
        r_i.font.size = Pt(8.5)

    doc.save(out_path)
    print(f"Generated Resume DOCX: {out_path}")


# 3. Resume Template 3 (PNG) - Contemporary Split-Grid Layout
def build_candidate_resume3_png(cand, out_path):
    tmp_pdf = out_path + ".tmp.pdf"
    c = canvas.Canvas(tmp_pdf, pagesize=letter)
    width, height = letter
    theme = cand["theme"]

    # Header Box
    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.rect(0, height - 98, width, 98, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont(F_ARIAL_BOLD, 17)
    c.drawString(30, height - 40, cand["name"])

    # Target position pill
    c.setFillColor(colors.HexColor(theme["p_light"]))
    c.roundRect(30, height - 66, 240, 20, 4, stroke=0, fill=1)
    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.setFont(F_ARIAL_BOLD, 8.5)
    c.drawString(38, height - 60, cand["target_position"].upper())

    # Header Contact Grid
    c.setFillColor(colors.white)
    c.setFont(F_ARIAL, 7.5)
    c.drawString(320, height - 36, f"Phone: {cand['phone']}")
    c.drawString(320, height - 50, f"Email: {cand['email']}")
    c.drawString(320, height - 64, f"Address: {cand['address']}")
    c.drawString(320, height - 78, f"LinkedIn: {cand['linkedin']}")

    curr_y = height - 116
    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.setFont(F_ARIAL_BOLD, 9.5)
    c.drawString(30, curr_y, "EXECUTIVE SUMMARY")
    c.setStrokeColor(colors.HexColor(theme["p_sub"]))
    c.setLineWidth(1)
    c.line(30, curr_y - 3, width - 30, curr_y - 3)
    curr_y -= 14

    curr_y = draw_text_wrapped(c, cand["summary"], 30, curr_y, width - 60, F_ARIAL, 7.8, colors.HexColor("#334155"), 11)
    curr_y -= 8

    split_y = curr_y

    # Left Column: Skills Badges, Education, Certifications
    left_x = 30
    left_w = 200
    ly = split_y

    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.setFont(F_ARIAL_BOLD, 9)
    c.drawString(left_x, ly, "SKILLS & COMPETENCIES")
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(1)
    c.line(left_x, ly - 3, left_x + left_w, ly - 3)
    ly -= 14

    for sk in cand["skills"]:
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
        c.setFillColor(colors.HexColor(theme["p_light"]))
        c.setStrokeColor(colors.HexColor("#CBD5E1"))
        c.roundRect(left_x, ly - b_h + 8, left_w, b_h, 3, stroke=1, fill=1)
        t_y = ly + 1
        for l in lines:
            c.setFillColor(colors.HexColor(theme["p_sub"]))
            c.setFont(F_ARIAL_BOLD, 6.8)
            c.drawString(left_x + 6, t_y, l)
            t_y -= 9
        ly -= (b_h + 3)

    ly -= 6
    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.setFont(F_ARIAL_BOLD, 9)
    c.drawString(left_x, ly, "EDUCATION")
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.line(left_x, ly - 3, left_x + left_w, ly - 3)
    ly -= 13

    c.setFont(F_ARIAL_BOLD, 7.8)
    c.setFillColor(colors.HexColor("#1E293B"))
    ly = draw_text_wrapped(c, cand["education"]["degree"], left_x, ly, left_w, F_ARIAL_BOLD, 7.8, colors.HexColor("#1E293B"), 9.5)
    c.setFont(F_ARIAL, 7.2)
    ly = draw_text_wrapped(c, cand["education"]["institution"], left_x, ly, left_w, F_ARIAL, 7.2, colors.HexColor("#475569"), 9)
    c.setFont(F_ARIAL_BOLD, 7.2)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.drawString(left_x, ly, f"Class of {cand['education']['year']}")
    ly -= 15

    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.setFont(F_ARIAL_BOLD, 9)
    c.drawString(left_x, ly, "TRAINING & CERTIFICATIONS")
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.line(left_x, ly - 3, left_x + left_w, ly - 3)
    ly -= 13

    for cert in cand["certifications"]:
        c.setFont(F_ARIAL_BOLD, 7.2)
        ly = draw_text_wrapped(c, cert["title"], left_x, ly, left_w, F_ARIAL_BOLD, 7.2, colors.HexColor("#0F172A"), 8.8)
        c.setFont(F_ARIAL, 6.8)
        ly = draw_text_wrapped(c, f"{cert['issuer']} — {cert['date']}", left_x, ly, left_w, F_ARIAL, 6.8, colors.HexColor("#475569"), 8.2)
        ly -= 4

    # Right Column: Timeline Experience
    right_x = 250
    right_w = width - right_x - 30
    ry = split_y

    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.setFont(F_ARIAL_BOLD, 9.5)
    c.drawString(right_x, ry, "PROFESSIONAL EXPERIENCE")
    c.setStrokeColor(colors.HexColor(theme["p_sub"]))
    c.line(right_x, ry - 3, width - 30, ry - 3)
    ry -= 16

    timeline_x = right_x + 6
    exp_text_x = right_x + 22
    exp_w = right_w - 22

    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setLineWidth(1.5)
    c.line(timeline_x, ry, timeline_x, 60)

    for exp in cand["experience"]:
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        c.setStrokeColor(colors.white)
        c.circle(timeline_x, ry - 2, 4.5, stroke=1, fill=1)

        c.setFont(F_ARIAL_BOLD, 8.8)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(exp_text_x, ry, exp["company"])

        c.setFont(F_ARIAL_BOLD, 7.8)
        c.setFillColor(colors.HexColor(theme["p_sub"]))
        dw = c.stringWidth(exp["duration"], F_ARIAL_BOLD, 7.8)
        c.drawString(width - 30 - dw, ry, exp["duration"])
        ry -= 11

        c.setFont(F_ARIAL_BOLD, 7.8)
        c.setFillColor(colors.HexColor("#334155"))
        c.drawString(exp_text_x, ry, exp["position"])

        c.setFont(F_ARIAL, 7.2)
        c.setFillColor(colors.HexColor("#64748B"))
        lw = c.stringWidth(exp["location"], F_ARIAL, 7.2)
        c.drawString(width - 30 - lw, ry, exp["location"])
        ry -= 11

        for b in exp["bullets"]:
            c.setFillColor(colors.HexColor(theme["p_accent"]))
            c.circle(exp_text_x + 4, ry - 2.5, 1.5, stroke=0, fill=1)
            ry = draw_text_wrapped(c, b, exp_text_x + 11, ry, exp_w - 11, F_ARIAL, 7.3, colors.HexColor("#334155"), 9.8)
            ry -= 2
        ry -= 6

    c.save()
    doc_fitz = pymupdf.open(tmp_pdf)
    pix = doc_fitz[0].get_pixmap(dpi=200)
    pix.save(out_path)
    doc_fitz.close()
    if os.path.exists(tmp_pdf):
        os.remove(tmp_pdf)
    print(f"Generated Resume PNG: {out_path}")


# 4. Resume Template 4 (JPG) - Clean Minimalist
def build_candidate_resume4_jpg(cand, out_path):
    tmp_pdf = out_path + ".tmp.pdf"
    c = canvas.Canvas(tmp_pdf, pagesize=letter)
    width, height = letter
    theme = cand["theme"]

    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.rect(0, height - 8, width, 8, stroke=0, fill=1)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.rect(0, height - 12, width, 4, stroke=0, fill=1)

    curr_y = height - 45
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SERIF_BOLD, 20)
    c.drawString(36, curr_y, cand["name"])

    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.setFont(F_CALIBRI_BOLD, 10.5)
    c.drawString(36, curr_y - 15, cand["target_position"].upper())

    c.setFillColor(colors.HexColor("#4B5563"))
    c.setFont(F_CALIBRI, 8)
    c_line = f"{cand['address']}  |  {cand['phone']}  |  {cand['email']}  |  {cand['linkedin']}"
    c.drawString(36, curr_y - 28, c_line)

    c.setStrokeColor(colors.HexColor("#E5E7EB"))
    c.setLineWidth(1)
    c.line(36, curr_y - 36, width - 36, curr_y - 36)
    curr_y -= 52

    # Summary
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_CALIBRI_BOLD, 10)
    c.drawString(36, curr_y, "HOSPITALITY PROFILE & SUMMARY")
    curr_y -= 12
    curr_y = draw_text_wrapped(c, cand["summary"], 36, curr_y, width - 72, F_CALIBRI, 8.2, colors.HexColor("#374151"), 11.5)
    curr_y -= 8

    # Skills
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_CALIBRI_BOLD, 10)
    c.drawString(36, curr_y, "CORE EXPERTISE & COMPETENCIES")
    curr_y -= 12

    col_w = (width - 72 - 20) / 2
    s_y = curr_y
    for i in range(4):
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        c.drawString(36, s_y, "♦")
        draw_text_wrapped(c, cand["skills"][i], 46, s_y, col_w - 15, F_CALIBRI, 7.8, colors.HexColor("#1F2937"), 10)

        c.drawString(36 + col_w + 20, s_y, "♦")
        draw_text_wrapped(c, cand["skills"][i+4], 46 + col_w + 20, s_y, col_w - 15, F_CALIBRI, 7.8, colors.HexColor("#1F2937"), 10)
        s_y -= 12
    curr_y = s_y - 6

    # Work Experience Cards
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_CALIBRI_BOLD, 10)
    c.drawString(36, curr_y, "PROFESSIONAL EXPERIENCE")
    curr_y -= 12

    for exp in cand["experience"]:
        b_count = len(exp["bullets"])
        card_h = 24 + b_count * 18 + 4
        if b_count >= 4:
            card_h = 92
        elif b_count == 3:
            card_h = 75
        else:
            card_h = 58

        c.setFillColor(colors.HexColor("#FAFAFA"))
        c.setStrokeColor(colors.HexColor("#E5E7EB"))
        c.roundRect(36, curr_y - card_h + 8, width - 72, card_h, 4, stroke=1, fill=1)

        c.setFillColor(colors.HexColor(theme["p_dark"]))
        c.roundRect(36, curr_y - card_h + 8, 4, card_h, 2, stroke=0, fill=1)

        inner_y = curr_y - 2
        c.setFont(F_CALIBRI_BOLD, 9)
        c.setFillColor(colors.HexColor("#111827"))
        c.drawString(48, inner_y, exp["company"])

        c.setFont(F_CALIBRI_BOLD, 8)
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        dw = c.stringWidth(exp["duration"], F_CALIBRI_BOLD, 8)
        c.drawString(width - 48 - dw, inner_y, exp["duration"])
        inner_y -= 11

        c.setFont(F_CALIBRI_BOLD, 8)
        c.setFillColor(colors.HexColor("#4B5563"))
        c.drawString(48, inner_y, exp["position"])

        c.setFont(F_CALIBRI, 7.5)
        c.setFillColor(colors.HexColor("#6B7280"))
        lw = c.stringWidth(exp["location"], F_CALIBRI, 7.5)
        c.drawString(width - 48 - lw, inner_y, exp["location"])
        inner_y -= 11

        for b in exp["bullets"]:
            c.setFillColor(colors.HexColor("#9CA3AF"))
            c.circle(53, inner_y - 2.5, 1.5, stroke=0, fill=1)
            inner_y = draw_text_wrapped(c, b, 60, inner_y, width - 115, F_CALIBRI, 7.5, colors.HexColor("#374151"), 10)
            inner_y -= 2

        curr_y -= (card_h + 6)

    # Education & Certifications
    b_col_w = (width - 72 - 20) / 2
    ey = curr_y
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_CALIBRI_BOLD, 9.5)
    c.drawString(36, ey, "EDUCATION")
    c.setStrokeColor(colors.HexColor("#E5E7EB"))
    c.line(36, ey - 3, 36 + b_col_w, ey - 3)
    ey -= 13

    c.setFont(F_CALIBRI_BOLD, 8)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawString(36, ey, cand["education"]["degree"])
    ey -= 10
    c.setFont(F_CALIBRI, 7.5)
    c.setFillColor(colors.HexColor("#4B5563"))
    c.drawString(36, ey, cand["education"]["institution"])
    ey -= 10
    c.setFont(F_CALIBRI_BOLD, 7.5)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.drawString(36, ey, f"Graduated: {cand['education']['year']}")

    cy = curr_y
    cx = 36 + b_col_w + 20
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_CALIBRI_BOLD, 9.5)
    c.drawString(cx, cy, "TRAINING & CERTIFICATIONS")
    c.setStrokeColor(colors.HexColor("#E5E7EB"))
    c.line(cx, cy - 3, width - 36, cy - 3)
    cy -= 13

    for cert in cand["certifications"]:
        c.setFont(F_CALIBRI_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#1F2937"))
        c.drawString(cx, cy, cert["title"])
        cy -= 9
        c.setFont(F_CALIBRI, 7)
        c.setFillColor(colors.HexColor("#6B7280"))
        c.drawString(cx, cy, f"{cert['issuer']} — {cert['date']}")
        cy -= 11

    c.save()
    doc_fitz = pymupdf.open(tmp_pdf)
    pix = doc_fitz[0].get_pixmap(dpi=200)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    img.save(out_path, "JPEG", quality=95)
    doc_fitz.close()
    if os.path.exists(tmp_pdf):
        os.remove(tmp_pdf)
    print(f"Generated Resume JPG: {out_path}")


# 5. Resume Template 5 (Blurred PNG) - Infographic Degraded
def build_candidate_resume5_blurred_png(cand, out_path):
    tmp_pdf = out_path + ".tmp.pdf"
    c = canvas.Canvas(tmp_pdf, pagesize=letter)
    width, height = letter
    theme = cand["theme"]

    sidebar_w = 210
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.rect(0, 0, sidebar_w, height, stroke=0, fill=1)

    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.roundRect(16, height - 42, sidebar_w - 32, 22, 4, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(22, height - 33, "CANDIDATE DOSSIER")

    c.setFillColor(colors.white)
    c.setFont(F_SANS_BOLD, 14)
    name_parts = cand["name"].split(" ")
    if len(name_parts) >= 3:
        c.drawString(16, height - 62, " ".join(name_parts[:2]).upper())
        c.drawString(16, height - 76, " ".join(name_parts[2:]).upper())
        sy = height - 92
    else:
        c.drawString(16, height - 64, cand["name"].upper())
        sy = height - 80

    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(16, sy, cand["target_position"][:32])
    sy -= 14

    c.setStrokeColor(colors.HexColor("#334155"))
    c.setLineWidth(1)
    c.line(16, sy, sidebar_w - 16, sy)
    sy -= 14

    c_boxes = [
        ("PHONE", cand["phone"]),
        ("EMAIL", cand["email"]),
        ("RESIDENCE", cand["address"]),
        ("NETWORKING", cand["linkedin"])
    ]
    for lbl, val in c_boxes:
        c.setFont(F_SANS_BOLD, 6.8)
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        c.drawString(16, sy, lbl)
        sy -= 9
        c.setFont(F_SANS, 7.2)
        c.setFillColor(colors.white)
        sy = draw_text_wrapped(c, val, 16, sy, sidebar_w - 32, F_SANS, 7.2, colors.white, 9)
        sy -= 4

    sy -= 8
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(16, sy, "OPERATIONAL PROFICIENCY")
    sy -= 12

    p_scores = [95, 92, 88, 94, 90, 86, 92, 89]
    for i in range(len(cand["skills"])):
        sk_name = cand["skills"][i][:26]
        c.setFont(F_SANS, 6.8)
        c.setFillColor(colors.white)
        c.drawString(16, sy, sk_name)
        sy -= 8

        bar_w = sidebar_w - 32
        c.setFillColor(colors.HexColor("#334155"))
        c.roundRect(16, sy, bar_w, 4, 2, stroke=0, fill=1)
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        c.roundRect(16, sy, bar_w * (p_scores[i] / 100.0), 4, 2, stroke=0, fill=1)
        sy -= 10

    sy -= 8
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(16, sy, "ACADEMIC BACKGROUND")
    sy -= 12
    c.setFont(F_SANS_BOLD, 7.5)
    c.setFillColor(colors.white)
    sy = draw_text_wrapped(c, cand["education"]["degree"], 16, sy, sidebar_w - 32, F_SANS_BOLD, 7.5, colors.white, 9)
    c.setFont(F_SANS, 7)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    sy = draw_text_wrapped(c, cand["education"]["institution"], 16, sy, sidebar_w - 32, F_SANS, 7, colors.HexColor("#CBD5E1"), 8.5)
    c.setFont(F_SANS_BOLD, 7)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.drawString(16, sy, f"Conferred: {cand['education']['year']}")
    sy -= 16

    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont(F_SANS_BOLD, 8)
    c.drawString(16, sy, "CREDENTIALS & TRAININGS")
    sy -= 12
    for cert in cand["certifications"]:
        c.setFont(F_SANS_BOLD, 7.2)
        c.setFillColor(colors.white)
        sy = draw_text_wrapped(c, cert["title"], 16, sy, sidebar_w - 32, F_SANS_BOLD, 7.2, colors.white, 8.5)
        c.setFont(F_SANS, 6.8)
        c.setFillColor(colors.HexColor("#94A3B8"))
        sy = draw_text_wrapped(c, f"{cert['issuer']} ({cert['date']})", 16, sy, sidebar_w - 32, F_SANS, 6.8, colors.HexColor("#94A3B8"), 8)
        sy -= 4

    # Right Column
    rx = 230
    rw = width - rx - 20
    my = height - 42

    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, my, "EXECUTIVE PROFILE")
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(1.5)
    c.line(rx, my - 3, rx + 45, my - 3)
    my -= 14
    my = draw_text_wrapped(c, cand["summary"], rx, my, rw, F_SANS, 7.8, colors.HexColor("#334155"), 11)
    my -= 10

    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, my, "CORE COMPETENCIES & VERIFIED SKILLS")
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.line(rx, my - 3, rx + 45, my - 3)
    my -= 14

    half = (rw - 10) / 2
    sk_y1 = my
    for sk in cand["skills"][:4]:
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        c.rect(rx, sk_y1 - 1, 3, 3, stroke=0, fill=1)
        sk_y1 = draw_text_wrapped(c, sk, rx + 8, sk_y1, half - 10, F_SANS, 7.2, colors.HexColor("#1E293B"), 9.5)
        sk_y1 -= 2

    sk_y2 = my
    for sk in cand["skills"][4:]:
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        c.rect(rx + half, sk_y2 - 1, 3, 3, stroke=0, fill=1)
        sk_y2 = draw_text_wrapped(c, sk, rx + half + 8, sk_y2, half - 10, F_SANS, 7.2, colors.HexColor("#1E293B"), 9.5)
        sk_y2 -= 2

    my = min(sk_y1, sk_y2) - 8

    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SANS_BOLD, 10)
    c.drawString(rx, my, "PROFESSIONAL CAREER HISTORY")
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.line(rx, my - 3, rx + 45, my - 3)
    my -= 14

    for exp in cand["experience"]:
        c.setFont(F_SANS_BOLD, 8.8)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(rx, my, exp["company"])

        c.setFont(F_SANS_BOLD, 8)
        c.setFillColor(colors.HexColor(theme["p_accent"]))
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
            my = draw_text_wrapped(c, b, rx + 11, my, rw - 11, F_SANS, 7.3, colors.HexColor("#334155"), 9.8)
            my -= 2
        my -= 5

    c.save()
    doc_fitz = pymupdf.open(tmp_pdf)
    pix = doc_fitz[0].get_pixmap(dpi=200)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    doc_fitz.close()
    if os.path.exists(tmp_pdf):
        os.remove(tmp_pdf)

    # Apply uniform degradation
    degraded = img.filter(ImageFilter.GaussianBlur(radius=1.3))
    enhancer = ImageEnhance.Contrast(degraded)
    degraded = enhancer.enhance(0.94)

    w, h = degraded.size
    noise_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    n_draw = ImageDraw.Draw(noise_img)
    random.seed( cand["name"].__hash__() % 10000 )
    for _ in range(3500):
        nx = random.randint(0, w - 1)
        ny = random.randint(0, h - 1)
        val = random.randint(180, 240)
        n_draw.point((nx, ny), fill=(val, val, val, 30))
    degraded.paste(noise_img, (0, 0), noise_img)

    degraded.save(out_path, "PNG")
    print(f"Generated Resume Blurred PNG: {out_path}")


# 6. Resume Template 6 (Blurred JPG) - Elegant Hotelier Scan Degraded
def build_candidate_resume6_blurred_jpg(cand, out_path):
    tmp_pdf = out_path + ".tmp.pdf"
    c = canvas.Canvas(tmp_pdf, pagesize=letter)
    width, height = letter
    theme = cand["theme"]

    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(2)
    c.rect(18, 18, width - 36, height - 36)

    c.setStrokeColor(colors.HexColor(theme["p_dark"]))
    c.setLineWidth(0.8)
    c.rect(22, 22, width - 44, height - 44)

    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.rect(22, height - 78, width - 44, 56, stroke=0, fill=1)

    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.rect(22, height - 80, width - 44, 2.5, stroke=0, fill=1)

    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.setFont(F_SERIF_BOLD, 17)
    c.drawCentredString(width / 2.0, height - 44, cand["name"].upper())

    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.setFont(F_SERIF_BOLD, 9)
    c.drawCentredString(width / 2.0, height - 60, f"♦  {cand['target_position'].upper()}  ♦")

    c.setFillColor(colors.HexColor("#E2E8F0"))
    c.setFont(F_SERIF, 7.5)
    c_line = f"{cand['address']}   •   {cand['phone']}   •   {cand['email']}   •   {cand['linkedin']}"
    c.drawCentredString(width / 2.0, height - 73, c_line)

    curr_y = height - 96

    def section_h(title, y_pos):
        c.setFillColor(colors.HexColor(theme["p_dark"]))
        c.setFont(F_SERIF_BOLD, 9.5)
        c.drawString(36, y_pos, title)
        c.setStrokeColor(colors.HexColor(theme["p_accent"]))
        c.setLineWidth(1)
        c.line(36, y_pos - 3, width - 36, y_pos - 3)
        return y_pos - 14

    curr_y = section_h("HOTEL & HOSPITALITY LEADERSHIP PROFILE", curr_y)
    curr_y = draw_text_wrapped(c, cand["summary"], 36, curr_y, width - 72, F_SERIF, 8, colors.HexColor("#1F2937"), 11.2)
    curr_y -= 8

    curr_y = section_h("CORE OPERATIONAL COMPETENCIES", curr_y)
    half_w = (width - 72 - 20) / 2
    sy1 = curr_y
    for sk in cand["skills"][:4]:
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        c.drawString(36, sy1, "▪")
        sy1 = draw_text_wrapped(c, sk, 46, sy1, half_w - 12, F_SERIF, 7.5, colors.HexColor("#1F2937"), 9.8)
        sy1 -= 2

    sy2 = curr_y
    for sk in cand["skills"][4:]:
        c.setFillColor(colors.HexColor(theme["p_accent"]))
        c.drawString(36 + half_w + 20, sy2, "▪")
        sy2 = draw_text_wrapped(c, sk, 46 + half_w + 20, sy2, half_w - 12, F_SERIF, 7.5, colors.HexColor("#1F2937"), 9.8)
        sy2 -= 2

    curr_y = min(sy1, sy2) - 8

    curr_y = section_h("CHRONOLOGICAL EMPLOYMENT HISTORY", curr_y)
    for exp in cand["experience"]:
        c.setFont(F_SERIF_BOLD, 8.8)
        c.setFillColor(colors.HexColor(theme["p_dark"]))
        c.drawString(36, curr_y, exp["company"])

        c.setFont(F_SERIF_BOLD, 8)
        c.setFillColor(colors.HexColor(theme["p_accent"]))
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
            c.setFillColor(colors.HexColor(theme["p_accent"]))
            c.circle(41, curr_y - 2.5, 1.5, stroke=0, fill=1)
            curr_y = draw_text_wrapped(c, b, 48, curr_y, width - 84, F_SERIF, 7.3, colors.HexColor("#334155"), 9.8)
            curr_y -= 2
        curr_y -= 5

    col_w = (width - 72 - 20) / 2
    ey = curr_y

    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SERIF_BOLD, 9)
    c.drawString(36, ey, "ACADEMIC QUALIFICATIONS")
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.line(36, ey - 3, 36 + col_w, ey - 3)
    ey -= 12

    c.setFont(F_SERIF_BOLD, 7.8)
    c.setFillColor(colors.HexColor("#111827"))
    c.drawString(36, ey, cand["education"]["degree"])
    ey -= 9
    c.setFont(F_SERIF, 7.2)
    c.setFillColor(colors.HexColor("#4B5563"))
    c.drawString(36, ey, cand["education"]["institution"])
    ey -= 9
    c.setFont(F_SERIF_BOLD, 7.2)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.drawString(36, ey, f"Conferred: {cand['education']['year']}")

    cy = curr_y
    cx = 36 + col_w + 20
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SERIF_BOLD, 9)
    c.drawString(cx, cy, "PROFESSIONAL CERTIFICATIONS")
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.line(cx, cy - 3, width - 36, cy - 3)
    cy -= 12

    for cert in cand["certifications"]:
        c.setFont(F_SERIF_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#111827"))
        c.drawString(cx, cy, cert["title"])
        cy -= 9
        c.setFont(F_SERIF, 7)
        c.setFillColor(colors.HexColor("#4B5563"))
        c.drawString(cx, cy, f"{cert['issuer']} ({cert['date']})")
        cy -= 10

    c.save()
    doc_fitz = pymupdf.open(tmp_pdf)
    pix = doc_fitz[0].get_pixmap(dpi=200)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    doc_fitz.close()
    if os.path.exists(tmp_pdf):
        os.remove(tmp_pdf)

    # Scan degradation
    degraded = img.filter(ImageFilter.GaussianBlur(radius=0.9))
    w, h = degraded.size
    noise_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    n_draw = ImageDraw.Draw(noise_img)
    random.seed(cand["phone"].__hash__() % 10000)
    for _ in range(2500):
        nx = random.randint(0, w - 1)
        ny = random.randint(0, h - 1)
        val = random.randint(150, 220)
        n_draw.point((nx, ny), fill=(val, val, val - 20, 25))
    degraded.paste(noise_img, (0, 0), noise_img)

    degraded.save(out_path, "JPEG", quality=40)
    print(f"Generated Resume Blurred JPG: {out_path}")


# 7. Supporting Document 1: COE Current Employer (PDF) - VERIFIED
def build_candidate_doc1_coe_curr(cand, out_path):
    c = canvas.Canvas(out_path, pagesize=letter)
    width, height = letter
    theme = cand["theme"]
    curr_exp = cand["experience"][0]

    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.rect(0, height - 90, width, 90, stroke=0, fill=1)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.rect(0, height - 94, width, 4, stroke=0, fill=1)

    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.circle(60, height - 45, 24, stroke=0, fill=1)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.circle(60, height - 45, 20, stroke=0, fill=1)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.setFont(F_SERIF_BOLD, 15)
    c.drawCentredString(60, height - 51, "HR")

    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 16)
    c.drawString(95, height - 40, curr_exp["company"].upper())
    c.setFont(F_SANS, 8)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawString(95, height - 54, f"{curr_exp['location']}, Philippines  •  Official Human Resources Directorate")
    c.drawString(95, height - 66, "Tel: (+63 2) 8888-9000  •  Email: humanresources@luxuryhospitality.ph")

    curr_y = height - 140
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SANS, 9)
    c.drawString(54, curr_y, "Reference No.: HRD-COE-2024-0915")
    c.drawRightString(width - 54, curr_y, "Date: September 15, 2024")
    curr_y -= 40

    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SERIF_BOLD, 15)
    c.drawCentredString(width / 2.0, curr_y, "CERTIFICATE OF EMPLOYMENT")
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(1.5)
    c.line(width / 2.0 - 110, curr_y - 4, width / 2.0 + 110, curr_y - 4)
    curr_y -= 45

    c.setFont(F_SANS_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawString(54, curr_y, "TO WHOM IT MAY CONCERN:")
    curr_y -= 25

    p1 = (
        f"This is to certify that {cand['name'].upper()} has been employed with {curr_exp['company']} "
        f"since {curr_exp['duration'].split('–')[0].strip()} and is currently an active, regular employee."
    )
    curr_y = draw_text_wrapped(c, p1, 54, curr_y, width - 108, F_SERIF, 9.5, colors.HexColor("#1E293B"), 14)
    curr_y -= 10

    p2 = (
        f"The employee currently holds the position of {curr_exp['position'].upper()}. In this role, the employee "
        f"faithfully exercises leadership over operational floor duties, service standards compliance, and team supervision."
    )
    curr_y = draw_text_wrapped(c, p2, 54, curr_y, width - 108, F_SERIF, 9.5, colors.HexColor("#1E293B"), 14)
    curr_y -= 10

    p3 = (
        f"During tenure with {curr_exp['company']}, the employee has maintained an exemplary performance record "
        f"and exhibited high dedication to hospitality excellence."
    )
    curr_y = draw_text_wrapped(c, p3, 54, curr_y, width - 108, F_SERIF, 9.5, colors.HexColor("#1E293B"), 14)
    curr_y -= 10

    p4 = "This certification is issued upon the request of the employee for whatever legal and professional purpose it may serve."
    curr_y = draw_text_wrapped(c, p4, 54, curr_y, width - 108, F_SERIF, 9.5, colors.HexColor("#1E293B"), 14)
    curr_y -= 35

    c.setFont(F_SANS, 9)
    c.drawString(54, curr_y, "Certified true and correct:")
    curr_y -= 30

    c.setFont(F_SERIF_ITALIC, 14)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.drawString(54, curr_y, "Victoria M. Alcantara")
    curr_y -= 15

    c.setFont(F_SANS_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawString(54, curr_y, "VICTORIA M. ALCANTARA, CHRP")
    curr_y -= 12
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(54, curr_y, "Vice President – Human Capital Management")
    c.drawString(54, curr_y - 11, curr_exp["company"])

    # Seal
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setFillColor(colors.HexColor(theme["p_light"]))
    c.setLineWidth(1.5)
    c.circle(width - 120, curr_y + 10, 36, stroke=1, fill=1)
    c.setLineWidth(0.8)
    c.circle(width - 120, curr_y + 10, 31, stroke=1, fill=0)
    c.setFont(F_SERIF_BOLD, 6.5)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.drawCentredString(width - 120, curr_y + 18, "OFFICIAL SEAL")
    c.drawCentredString(width - 120, curr_y + 8, "HUMAN RESOURCES")
    c.drawCentredString(width - 120, curr_y - 2, "METRO MANILA")

    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setLineWidth(0.8)
    c.line(54, 40, width - 54, 40)
    c.setFont(F_SANS, 7)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawCentredString(width / 2.0, 28, f"{curr_exp['company']}  •  Human Capital Directorate  •  Official Certificate of Employment")

    c.save()
    if cand["is_scanned_pdf"]:
        make_pdf_scanned(out_path)
    print(f"Generated Doc 1 COE Current: {out_path}")


# 8. Supporting Document 2: COE Previous Employer (PDF) - DISCREPANCY
def build_candidate_doc2_coe_prev(cand, out_path):
    c = canvas.Canvas(out_path, pagesize=letter)
    width, height = letter
    theme = cand["theme"]
    prev_exp = cand["experience"][1]

    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.rect(0, height - 85, width, 85, stroke=0, fill=1)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.rect(0, height - 88, width, 3, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.circle(60, height - 42, 22, stroke=0, fill=1)
    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.circle(60, height - 42, 18, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 14)
    c.drawCentredString(60, height - 47, "HR")

    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 15)
    c.drawString(95, height - 38, prev_exp["company"].upper())
    c.setFont(F_SANS, 7.8)
    c.setFillColor(colors.HexColor("#E2E8F0"))
    c.drawString(95, height - 52, f"{prev_exp['location']}, Philippines")
    c.drawString(95, height - 64, "PABX: (+63 2) 8555-1234  •  Email: hr-clearance@hospitality.com.ph")

    curr_y = height - 130
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SANS, 8.5)
    c.drawString(54, curr_y, "Reference No.: HR-CLEAR-2022-0612")
    c.drawRightString(width - 54, curr_y, "Date: June 30, 2022")
    curr_y -= 35

    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.setFont(F_SERIF_BOLD, 14)
    c.drawCentredString(width / 2.0, curr_y, "CERTIFICATE OF EMPLOYMENT AND CLEARANCE")
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(1.2)
    c.line(width / 2.0 - 130, curr_y - 4, width / 2.0 + 130, curr_y - 4)
    curr_y -= 40

    c.setFont(F_SANS_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawString(54, curr_y, "TO WHOM IT MAY CONCERN:")
    curr_y -= 25

    # CONTROLLED DISCREPANCY IN DATES
    p1 = (
        f"This is to certify that {cand['name'].upper()} was employed with {prev_exp['company']} "
        f"from {cand['discrepancy_coe_dates']}."
    )
    curr_y = draw_text_wrapped(c, p1, 54, curr_y, width - 108, F_SERIF, 9.5, colors.HexColor("#1E293B"), 14)
    curr_y -= 10

    p2 = (
        f"At the time of separation, the employee held the position of {prev_exp['position'].upper()}. "
        f"Duties included managing shift schedules, supervising service quality, and team guidance."
    )
    curr_y = draw_text_wrapped(c, p2, 54, curr_y, width - 108, F_SERIF, 9.5, colors.HexColor("#1E293B"), 14)
    curr_y -= 10

    p3 = "The employee has undergone standard clearance procedures and has been cleared of all property and financial accountabilities."
    curr_y = draw_text_wrapped(c, p3, 54, curr_y, width - 108, F_SERIF, 9.5, colors.HexColor("#1E293B"), 14)
    curr_y -= 10

    p4 = "This certification is issued upon the request of the employee for employment reference purposes."
    curr_y = draw_text_wrapped(c, p4, 54, curr_y, width - 108, F_SERIF, 9.5, colors.HexColor("#1E293B"), 14)
    curr_y -= 35

    c.setFont(F_SANS, 9)
    c.drawString(54, curr_y, "Certified and cleared by:")
    curr_y -= 30

    c.setFont(F_SERIF_ITALIC, 14)
    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.drawString(54, curr_y, "Gerardo B. Mendoza")
    curr_y -= 15

    c.setFont(F_SANS_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawString(54, curr_y, "GERARDO B. MENDOZA, FHRM")
    curr_y -= 12
    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(54, curr_y, "Director of Human Resources & Employee Relations")
    c.drawString(54, curr_y - 11, prev_exp["company"])

    # Seal
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setFillColor(colors.HexColor(theme["p_light"]))
    c.setLineWidth(1.5)
    c.circle(width - 120, curr_y + 10, 36, stroke=1, fill=1)
    c.setLineWidth(0.8)
    c.circle(width - 120, curr_y + 10, 31, stroke=1, fill=0)
    c.setFont(F_SERIF_BOLD, 6.5)
    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.drawCentredString(width - 120, curr_y + 18, "EXIT CLEARANCE")
    c.drawCentredString(width - 120, curr_y + 8, "VERIFIED ARCHIVE")
    c.drawCentredString(width - 120, curr_y - 2, "METRO MANILA")

    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.setLineWidth(0.8)
    c.line(54, 40, width - 54, 40)
    c.setFont(F_SANS, 7)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawCentredString(width / 2.0, 28, f"{prev_exp['company']}  •  HR Clearance & Verification Registry")

    c.save()
    if cand["is_scanned_pdf"]:
        make_pdf_scanned(out_path)
    print(f"Generated Doc 2 COE Previous: {out_path}")


# 9. Supporting Document 3: Academic Diploma (PDF) - VERIFIED
def build_candidate_doc3_diploma(cand, out_path):
    c = canvas.Canvas(out_path, pagesize=landscape(letter))
    width, height = landscape(letter)
    theme = cand["theme"]

    c.setStrokeColor(colors.HexColor(theme["p_dark"]))
    c.setLineWidth(4)
    c.rect(24, 24, width - 48, height - 48)

    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(1.5)
    c.rect(30, 30, width - 60, height - 60)

    seal_y = height - 85
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.circle(width / 2.0, seal_y, 30, stroke=0, fill=1)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.circle(width / 2.0, seal_y, 27, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont(F_SERIF_BOLD, 8.5)
    c.drawCentredString(width / 2.0, seal_y - 3, "ACADEMIA")

    curr_y = height - 130
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SERIF_BOLD, 12)
    c.drawCentredString(width / 2.0, curr_y, "REPUBLIKA NG PILIPINAS")
    curr_y -= 18

    c.setFont(F_SERIF_BOLD, 19)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(width / 2.0, curr_y, cand["education"]["institution"].split("—")[0].strip().upper())
    curr_y -= 14

    c.setFont(F_SERIF_ITALIC, 10)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(width / 2.0, curr_y, "Lungsod ng Maynila, Republika ng Pilipinas")
    curr_y -= 25

    c.setFont(F_SERIF, 10.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(width / 2.0, curr_y, "Ipinababatid ng Tanggapan ng Pangulo at Lupon ng mga Katiwala na si")
    curr_y -= 30

    c.setFont(F_SERIF_BOLD, 22)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.drawCentredString(width / 2.0, curr_y, cand["name"].upper())
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(1.5)
    c.line(width / 2.0 - 150, curr_y - 5, width / 2.0 + 150, curr_y - 5)
    curr_y -= 28

    c.setFont(F_SERIF, 10.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(width / 2.0, curr_y, "ay matagumpay na nakatapos ng kurso at pinagkalooban ng titulong")
    curr_y -= 24

    c.setFont(F_SERIF_BOLD, 16)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(width / 2.0, curr_y, cand["education"]["degree"].upper())
    curr_y -= 18

    c.setFont(F_SERIF_ITALIC, 9.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(width / 2.0, curr_y, "kalakip ang lahat ng mga karapatan, kapangyarihan at pribilehiyong nauukol dito.")
    curr_y -= 22

    c.setFont(F_SERIF, 9.5)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(width / 2.0, curr_y, f"Ipinagkaloob ngayong ika-15 ng Mayo, {cand['education']['year']}.")

    sig_y = 75
    c.setStrokeColor(colors.HexColor("#64748B"))
    c.setLineWidth(0.8)
    c.line(100, sig_y + 18, 280, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.drawCentredString(190, sig_y + 24, "Atty. Renato P. Morales")
    c.setFont(F_SERIF_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(190, sig_y + 6, "ATTY. RENATO P. MORALES")
    c.setFont(F_SERIF, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(190, sig_y - 4, "University Registrar")

    c.line(width - 280, sig_y + 18, width - 100, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.drawCentredString(width - 190, sig_y + 24, "Dr. Felicitas C. Santos")
    c.setFont(F_SERIF_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.drawCentredString(width - 190, sig_y + 6, "DR. FELICITAS C. SANTOS, PhD")
    c.setFont(F_SERIF, 7.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(width - 190, sig_y - 4, "University President")

    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.circle(width / 2.0, sig_y + 10, 26, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#FFFBEB"))
    c.circle(width / 2.0, sig_y + 10, 23, stroke=0, fill=1)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SERIF_BOLD, 6)
    c.drawCentredString(width / 2.0, sig_y + 14, "ACADEMIC")
    c.drawCentredString(width / 2.0, sig_y + 6, "CONFERMENT")

    c.save()
    if cand["is_scanned_pdf"]:
        make_pdf_scanned(out_path)
    print(f"Generated Doc 3 Diploma: {out_path}")


# 10. Supporting Document 4: Training Certificate 1 (PDF) - VERIFIED
def build_candidate_doc4_cert1(cand, out_path):
    c = canvas.Canvas(out_path, pagesize=landscape(letter))
    width, height = landscape(letter)
    theme = cand["theme"]
    cert1 = cand["certifications"][0]

    c.setStrokeColor(colors.HexColor(theme["p_dark"]))
    c.setLineWidth(3)
    c.rect(26, 26, width - 52, height - 52)

    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(1)
    c.rect(32, 32, width - 64, height - 64)

    curr_y = height - 80
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SANS_BOLD, 15)
    c.drawCentredString(width / 2.0, curr_y, cert1["issuer"].upper())
    curr_y -= 16

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#4B5563"))
    c.drawCentredString(width / 2.0, curr_y, "Accredited Professional Hospitality Certification Board")
    curr_y -= 30

    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SERIF_BOLD, 22)
    c.drawCentredString(width / 2.0, curr_y, "CERTIFICATE OF COMPETENCY AND COMPLETION")
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(1.5)
    c.line(width / 2.0 - 180, curr_y - 4, width / 2.0 + 180, curr_y - 4)
    curr_y -= 35

    c.setFont(F_SANS, 10)
    c.setFillColor(colors.HexColor("#374151"))
    c.drawCentredString(width / 2.0, curr_y, "This is to officially certify that")
    curr_y -= 30

    c.setFont(F_SERIF_BOLD, 22)
    c.setFillColor(colors.HexColor("#111827"))
    c.drawCentredString(width / 2.0, curr_y, cand["name"].upper())
    c.setStrokeColor(colors.HexColor(theme["p_dark"]))
    c.setLineWidth(1)
    c.line(width / 2.0 - 140, curr_y - 4, width / 2.0 + 140, curr_y - 4)
    curr_y -= 28

    c.setFont(F_SANS, 10)
    c.setFillColor(colors.HexColor("#374151"))
    c.drawCentredString(width / 2.0, curr_y, "has satisfactorily completed all prescribed modules and passed evaluation for")
    curr_y -= 24

    c.setFont(F_SERIF_BOLD, 16)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.drawCentredString(width / 2.0, curr_y, cert1["title"].upper())
    curr_y -= 24

    c.setFont(F_SANS_BOLD, 9)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(width / 2.0, curr_y, f"Conferred on: {cert1['date']}")
    curr_y -= 12
    c.setFont(F_SANS, 8)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.drawCentredString(width / 2.0, curr_y, "Serial Registration Number: CERT-PRO-2021-9941")

    sig_y = 80
    c.setStrokeColor(colors.HexColor("#9CA3AF"))
    c.setLineWidth(0.8)

    c.line(100, sig_y + 18, 270, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.drawCentredString(185, sig_y + 24, "Enrico J. Salcedo")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(185, sig_y + 7, "ENRICO J. SALCEDO")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(185, sig_y - 4, "Lead Certified Trainer")

    c.line(width - 270, sig_y + 18, width - 100, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.drawCentredString(width - 185, sig_y + 24, "Dr. Corazon G. Reyes")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(width - 185, sig_y + 7, "DR. CORAZON G. REYES")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(width - 185, sig_y - 4, "Executive Board Chairperson")

    c.save()
    if cand["is_scanned_pdf"]:
        make_pdf_scanned(out_path)
    print(f"Generated Doc 4 Cert 1: {out_path}")


# 11. Supporting Document 5: Training Certificate 2 (PDF) - DISCREPANCY
def build_candidate_doc5_cert2(cand, out_path):
    c = canvas.Canvas(out_path, pagesize=landscape(letter))
    width, height = landscape(letter)
    theme = cand["theme"]
    cert2 = cand["certifications"][2]

    c.setStrokeColor(colors.HexColor(theme["p_sub"]))
    c.setLineWidth(2)
    c.rect(28, 28, width - 56, height - 56)

    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(0.8)
    c.rect(32, 32, width - 64, height - 64)

    curr_y = height - 80
    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.setFont(F_SANS_BOLD, 15)
    c.drawCentredString(width / 2.0, curr_y, cert2["issuer"].upper())
    curr_y -= 16

    c.setFont(F_SANS, 8.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(width / 2.0, curr_y, "National Institute for Hospitality Professional Development")
    curr_y -= 32

    c.setFillColor(colors.HexColor("#1E1B4B"))
    c.setFont(F_SERIF_BOLD, 21)
    c.drawCentredString(width / 2.0, curr_y, "CERTIFICATE OF TRAINING PARTICIPATION")
    c.setStrokeColor(colors.HexColor(theme["p_sub"]))
    c.setLineWidth(1.5)
    c.line(width / 2.0 - 160, curr_y - 4, width / 2.0 + 160, curr_y - 4)
    curr_y -= 35

    c.setFont(F_SANS, 10)
    c.setFillColor(colors.HexColor("#374151"))
    c.drawCentredString(width / 2.0, curr_y, "This certificate is proudly awarded to")
    curr_y -= 30

    c.setFont(F_SERIF_BOLD, 22)
    c.setFillColor(colors.HexColor("#1E1B4B"))
    c.drawCentredString(width / 2.0, curr_y, cand["name"].upper())
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(1)
    c.line(width / 2.0 - 140, curr_y - 4, width / 2.0 + 140, curr_y - 4)
    curr_y -= 28

    c.setFont(F_SANS, 10)
    c.setFillColor(colors.HexColor("#374151"))
    c.drawCentredString(width / 2.0, curr_y, "for active participation and completion of the workshop on")
    curr_y -= 24

    # CONTROLLED DISCREPANCY IN COURSE TITLE
    c.setFont(F_SERIF_BOLD, 15)
    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.drawCentredString(width / 2.0, curr_y, cand["discrepancy_cert_course"].upper())
    curr_y -= 24

    c.setFont(F_SANS_BOLD, 9)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(width / 2.0, curr_y, f"Conducted on {cert2['date']}.")
    curr_y -= 12

    c.setFont(F_SANS_BOLD, 8)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.drawCentredString(width / 2.0, curr_y, "Certificate Registration ID: WS-PH-2020-0419")

    sig_y = 80
    c.setStrokeColor(colors.HexColor("#9CA3AF"))
    c.setLineWidth(0.8)

    c.line(100, sig_y + 18, 270, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.drawCentredString(185, sig_y + 24, "Ramon F. Bautista")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(185, sig_y + 7, "RAMON F. BAUTISTA")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(185, sig_y - 4, "Managing Director")

    c.line(width - 270, sig_y + 18, width - 100, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor(theme["p_sub"]))
    c.drawCentredString(width - 185, sig_y + 24, "Lourdes M. Tan")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(width - 185, sig_y + 7, "LOURDES M. TAN")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(width - 185, sig_y - 4, "Lead Program Facilitator")

    c.save()
    if cand["is_scanned_pdf"]:
        make_pdf_scanned(out_path)
    print(f"Generated Doc 5 Cert 2: {out_path}")


# 12. Supporting Document 6: Incomplete Certificate (PDF) - UNABLE TO VERIFY
def build_candidate_doc6_incomplete(cand, out_path):
    tmp_clean = out_path + ".clean.pdf"
    c = canvas.Canvas(tmp_clean, pagesize=landscape(letter))
    width, height = landscape(letter)
    theme = cand["theme"]
    cert_inc = cand["certifications"][1]

    c.setStrokeColor(colors.HexColor(theme["p_dark"]))
    c.setLineWidth(2.5)
    c.rect(26, 26, width - 52, height - 52)

    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(1)
    c.rect(30, 30, width - 60, height - 60)

    curr_y = height - 80
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.setFont(F_SERIF_BOLD, 17)
    c.drawCentredString(width / 2.0, curr_y, cert_inc["issuer"].upper())
    curr_y -= 30

    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont(F_SERIF_BOLD, 22)
    c.drawCentredString(width / 2.0, curr_y, cand["incomplete_cert_name"].upper())
    c.setStrokeColor(colors.HexColor(theme["p_accent"]))
    c.setLineWidth(1.5)
    c.line(width / 2.0 - 170, curr_y - 4, width / 2.0 + 170, curr_y - 4)
    curr_y -= 35

    c.setFont(F_SERIF, 10)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(width / 2.0, curr_y, "The Examination and Certification Board hereby confers this designation upon")
    curr_y -= 28

    # Recipient area placeholder
    c.setFont(F_SERIF_BOLD, 12)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawCentredString(width / 2.0, curr_y, "[ RECIPIENT NAME AREA ]")
    curr_y -= 25

    c.setFont(F_SERIF, 10)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawCentredString(width / 2.0, curr_y, "having fulfilled all professional prerequisites and passed the board examination.")
    curr_y -= 25

    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawCentredString(width / 2.0, curr_y, f"Date of Issuance: {cert_inc['date']}  •  Validity: 5 Years")
    curr_y -= 12
    c.setFont(F_SANS, 8)
    c.setFillColor(colors.HexColor(theme["p_accent"]))
    c.drawCentredString(width / 2.0, curr_y, "Credential ID: CRED-REG-2021-0842")

    sig_y = 75
    c.setStrokeColor(colors.HexColor("#94A3B8"))
    c.setLineWidth(0.8)

    c.line(120, sig_y + 18, 280, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.drawCentredString(200, sig_y + 24, "Arthur Sterling")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(200, sig_y + 7, "ARTHUR STERLING")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(200, sig_y - 4, "Board Chairman")

    c.line(width - 280, sig_y + 18, width - 120, sig_y + 18)
    c.setFont(F_SERIF_ITALIC, 11)
    c.setFillColor(colors.HexColor(theme["p_dark"]))
    c.drawCentredString(width - 200, sig_y + 24, "Dr. Linda Ocampo")
    c.setFont(F_SANS_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawCentredString(width - 200, sig_y + 7, "DR. LINDA OCAMPO")
    c.setFont(F_SANS, 7.5)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawCentredString(width - 200, sig_y - 4, "Board Registrar")

    c.save()

    # Flatten and simulate torn paper over recipient name
    doc_fitz = pymupdf.open(tmp_clean)
    pix = doc_fitz[0].get_pixmap(dpi=200)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    doc_fitz.close()
    if os.path.exists(tmp_clean):
        os.remove(tmp_clean)

    draw = ImageDraw.Draw(img)
    w, h = img.size
    center_x = w // 2
    rec_y = int((height - (height - 80 - 30 - 35 - 28)) * (200 / 72))

    rip_top = rec_y - 60
    rip_bottom = rec_y + 70
    rip_left = center_x - 450
    rip_right = center_x + 450

    points = []
    random.seed(cand["name"].__hash__() % 5000)
    step = 20
    for x in range(rip_left, rip_right + 1, step):
        points.append((x, rip_top + random.randint(-8, 8)))
    for y in range(rip_top, rip_bottom + 1, step):
        points.append((rip_right + random.randint(-8, 8), y))
    for x in range(rip_right, rip_left - 1, -step):
        points.append((x, rip_bottom + random.randint(-8, 8)))
    for y in range(rip_bottom, rip_top - 1, -step):
        points.append((rip_left + random.randint(-8, 8), y))

    draw.polygon(points, fill=(255, 255, 255), outline=(210, 205, 195), width=3)
    draw.text((center_x - 220, rec_y - 12), "[ RECIPIENT NAME CUT OFF / MISSING DUE TO TORN SCAN ]", fill=(160, 160, 160))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=88)
    buf.seek(0)

    doc_out = pymupdf.open()
    page = doc_out.new_page(width=width, height=height)
    page.insert_image(pymupdf.Rect(0, 0, width, height), stream=buf.getvalue())
    doc_out.save(out_path)
    doc_out.close()
    print(f"Generated Doc 6 Incomplete: {out_path}")


# 13. Ground Truth TXT File
def build_candidate_ground_truth(cand, out_path):
    pdf_status_note = "SCANNED / IMAGE-ONLY (No digital text layer, forces OCR processing)" if cand["is_scanned_pdf"] else "DIGITAL VECTOR TEXT (Directly extractable without OCR)"
    content = f"""================================================================================
HOSPITALITY RESUME & SUPPORTING DOCUMENT BENCHMARK DATASET (SINGLE PROFILE)
GROUND TRUTH & VERIFICATION REFERENCE
================================================================================

DOCUMENT IDENTIFIER: Actual Info in the Resume of {cand['name']}.txt
TARGET CANDIDATE: {cand['name']}
TARGET ROLE: {cand['target_position']}
EXTRACTION MODE: {pdf_status_note}
TOTAL DATASET FILES: 13 Files (6 Resumes, 6 Supporting Documents, 1 Ground Truth)
DATE GENERATED: 2026-09-18

================================================================================
PART 1 — CANDIDATE MASTER PROFILE (STANDARDIZED CANONICAL RECORD)
================================================================================

[PERSONAL & CONTACT INFORMATION]
Full Name:             {cand['name']}
Target Position:       {cand['target_position']}
Contact Phone Number:  {cand['phone']}
Email Address:         {cand['email']}
Residential Address:   {cand['address']}
LinkedIn / Portfolio:  {cand['linkedin']}

[PROFESSIONAL SUMMARY]
"{cand['summary']}"

[CORE COMPETENCIES & SKILLS]
1. {cand['skills'][0]}
2. {cand['skills'][1]}
3. {cand['skills'][2]}
4. {cand['skills'][3]}
5. {cand['skills'][4]}
6. {cand['skills'][5]}
7. {cand['skills'][6]}
8. {cand['skills'][7]}

[CHRONOLOGICAL WORK EXPERIENCE]

1. Employer:     {cand['experience'][0]['company']}
   Location:     {cand['experience'][0]['location']}
   Job Title:    {cand['experience'][0]['position']}
   Duration:     {cand['experience'][0]['duration']}
   Tenure Type:  Current Employment
   Responsibilities & Achievements:
"""
    for b in cand['experience'][0]['bullets']:
        content += f"   • {b}\n"

    content += f"""
2. Employer:     {cand['experience'][1]['company']}
   Location:     {cand['experience'][1]['location']}
   Job Title:    {cand['experience'][1]['position']}
   Duration:     {cand['experience'][1]['duration']}
   Tenure Type:  Previous Employment
   Responsibilities & Achievements:
"""
    for b in cand['experience'][1]['bullets']:
        content += f"   • {b}\n"

    content += f"""
3. Employer:     {cand['experience'][2]['company']}
   Location:     {cand['experience'][2]['location']}
   Job Title:    {cand['experience'][2]['position']}
   Duration:     {cand['experience'][2]['duration']}
   Tenure Type:  Historical Employment
   Responsibilities & Achievements:
"""
    for b in cand['experience'][2]['bullets']:
        content += f"   • {b}\n"

    content += f"""
[EDUCATION & ACADEMIC CREDENTIALS]
Degree:         {cand['education']['degree']}
Institution:    {cand['education']['institution']}
Graduation:     {cand['education']['year']}

[TRAINING & PROFESSIONAL CERTIFICATIONS]
1. Title:   {cand['certifications'][0]['title']}
   Issuer:  {cand['certifications'][0]['issuer']}
   Date:    {cand['certifications'][0]['date']}

2. Title:   {cand['certifications'][1]['title']}
   Issuer:  {cand['certifications'][1]['issuer']}
   Date:    {cand['certifications'][1]['date']}

3. Title:   {cand['certifications'][2]['title']}
   Issuer:  {cand['certifications'][2]['issuer']}
   Date:    {cand['certifications'][2]['date']}


================================================================================
PART 2 — RESUME BENCHMARK & MULTI-TEMPLATE DETAILS
================================================================================

Across all six (6) resume files below, 100% identical underlying textual data is preserved.
Each format implements a distinctive visual design, layout architecture, and typographic hierarchy.

1. {cand['prefix']}_Resume.pdf
   - File Format: Portable Document Format (.pdf)
   - Layout Template: Template 1 - Modern Executive Two-Column Layout
   - PDF Stream Status: {pdf_status_note}
   - Layout Design: Sidebar with contact channels, education, and certifications; main column with executive summary, competencies, and experience.

2. {cand['prefix']}_Resume.docx
   - File Format: Microsoft Word (.docx)
   - Layout Template: Template 2 - Corporate Single-Column Traditional
   - Typographic System: Georgia Serif Typography
   - Layout Design: Centered formal header, accent paragraph divider rules, tabular competencies.

3. {cand['prefix']}_Resume.png
   - File Format: Portable Network Graphics (.png) (200 DPI High-Resolution)
   - Layout Template: Template 3 - Contemporary Split-Grid Layout
   - Typographic System: Modern Sans-Serif
   - Layout Design: Header box with candidate title pill, split grid with rounded badge skill tags and vertical timeline markers.

4. {cand['prefix']}_Resume.jpg
   - File Format: Joint Photographic Experts Group (.jpg) (High Quality 95%)
   - Layout Template: Template 4 - Hospitality Clean Minimalist
   - Layout Design: Clean left-aligned typography, generous whitespace, rounded bordered experience cards.

5. {cand['prefix']}_Resume_Blurred.png
   - File Format: Portable Network Graphics (.png) (Degraded Image Benchmark)
   - Layout Template: Template 5 - Infographic / Accent-Bar Layout
   - Degradation Parameters: Full-page uniform Gaussian blur (radius = 1.3), uniform contrast reduction, subtle scanner noise.
   - Degradation Integrity: 100% UNIFORM across entire page. NO black censor bars. OCR remains partially readable for benchmark resilience evaluation.

6. {cand['prefix']}_Resume_Blurred.jpg
   - File Format: Joint Photographic Experts Group (.jpg) (Degraded Scan Benchmark)
   - Layout Template: Template 6 - Elegant Hotelier Formal Layout
   - Degradation Parameters: Full-page uniform scanner softening, moderate JPEG recompression (quality = 40), uniform paper noise texture.
   - Degradation Integrity: 100% UNIFORM across entire page. Preserves formal styling while realistically challenging OCR text extractors.


================================================================================
PART 3 — SUPPORTING DOCUMENTS UNDERLYING TEXT & METADATA
================================================================================

1. {cand['prefix']}_COE_Current_Employer.pdf
   - Document Type: Certificate of Employment (COE)
   - Issuing Entity: {cand['experience'][0]['company']}
   - Recipient / Employee: {cand['name']}
   - Certified Position: {cand['experience'][0]['position']}
   - Certified Period: {cand['experience'][0]['duration']}
   - Extraction Mode: {pdf_status_note}

2. {cand['prefix']}_COE_Previous_Employer.pdf
   - Document Type: Certificate of Employment and Clearance
   - Issuing Entity: {cand['experience'][1]['company']}
   - Recipient / Employee: {cand['name']}
   - Certified Position: {cand['experience'][1]['position']}
   - Certified Period: {cand['discrepancy_coe_dates']} (CONTROLLED DISCREPANCY)
   - Extraction Mode: {pdf_status_note}

3. {cand['prefix']}_Diploma.pdf
   - Document Type: Academic University Diploma
   - Issuing Entity: {cand['education']['institution']}
   - Conferred Graduate: {cand['name']}
   - Degree Conferred: {cand['education']['degree']}
   - Graduation Year: {cand['education']['year']}
   - Extraction Mode: {pdf_status_note}

4. {cand['prefix']}_Training_Certificate_FoodSafety.pdf
   - Document Type: Training & Competency Certificate
   - Issuing Entity: {cand['certifications'][0]['issuer']}
   - Recipient Name: {cand['name']}
   - Training Title: {cand['certifications'][0]['title']}
   - Award Date: {cand['certifications'][0]['date']}
   - Extraction Mode: {pdf_status_note}

5. {cand['prefix']}_Training_Certificate_Service.pdf
   - Document Type: Training Completion Certificate
   - Issuing Entity: {cand['certifications'][2]['issuer']}
   - Recipient Name: {cand['name']}
   - Certified Course: {cand['discrepancy_cert_course']} (CONTROLLED DISCREPANCY)
   - Training Date: {cand['certifications'][2]['date']}
   - Extraction Mode: {pdf_status_note}

6. {cand['prefix']}_Incomplete_Certificate.pdf
   - Document Type: Professional Credential Certificate
   - Issuing Entity: {cand['certifications'][1]['issuer']}
   - Recipient Name: [MISSING / CUT OFF DUE TO TORN SCAN] (CONTROLLED DATA INADEQUACY)
   - Credential Conferred: {cand['incomplete_cert_name']}
   - Issuance Date: {cand['certifications'][1]['date']}
   - Extraction Mode: Scanned image with physically severed/torn name area.


================================================================================
PART 4 — RESUME ↔ SUPPORTING DOCUMENT VERIFICATION MATRIX
================================================================================

CASE 1: Current Employment Claim Verification
• Resume Claim: {cand['experience'][0]['company']} | {cand['experience'][0]['position']} | {cand['experience'][0]['duration']}
• Evidence: {cand['prefix']}_COE_Current_Employer.pdf
• Comparison Result: EXACT MATCH across candidate name, employer, role, and tenure.
• Verification Engine Outcome: VERIFIED

CASE 2: Previous Employment Claim Verification
• Resume Claim: {cand['experience'][1]['company']} | {cand['experience'][1]['position']} | {cand['experience'][1]['duration']}
• Evidence: {cand['prefix']}_COE_Previous_Employer.pdf ({cand['discrepancy_coe_dates']})
• Comparison Result: DISCREPANCY DETECTED. {cand['discrepancy_coe_reason']}
• Verification Engine Outcome: DISCREPANCY_FOUND

CASE 3: Tertiary Education Claim Verification
• Resume Claim: {cand['education']['degree']} | {cand['education']['institution']} | {cand['education']['year']}
• Evidence: {cand['prefix']}_Diploma.pdf
• Comparison Result: EXACT MATCH across candidate name, degree title, institution, and year.
• Verification Engine Outcome: VERIFIED

CASE 4: Role-Specific Training Cert 1 Verification
• Resume Claim: {cand['certifications'][0]['title']} | {cand['certifications'][0]['issuer']} | {cand['certifications'][0]['date']}
• Evidence: {cand['prefix']}_Training_Certificate_FoodSafety.pdf
• Comparison Result: EXACT MATCH across recipient name, certification title, and issuer.
• Verification Engine Outcome: VERIFIED

CASE 5: Hospitality Training Cert 2 Verification
• Resume Claim: {cand['certifications'][2]['title']} | {cand['certifications'][2]['issuer']} | {cand['certifications'][2]['date']}
• Evidence: {cand['prefix']}_Training_Certificate_Service.pdf ({cand['discrepancy_cert_course']})
• Comparison Result: DISCREPANCY DETECTED. {cand['discrepancy_cert_reason']}
• Verification Engine Outcome: DISCREPANCY_FOUND

CASE 6: Professional Credential Claim Verification
• Resume Claim: {cand['certifications'][1]['title']} | {cand['certifications'][1]['issuer']} | {cand['certifications'][1]['date']}
• Evidence: {cand['prefix']}_Incomplete_Certificate.pdf
• Comparison Result: UNABLE TO ATTRIBUTE. {cand['incomplete_reason']}
• Verification Engine Outcome: UNABLE_TO_VERIFY

CASE 7: Historical Employment Claim Verification
• Resume Claim: {cand['experience'][2]['company']} | {cand['experience'][2]['position']} | {cand['experience'][2]['duration']}
• Evidence: [NO DOCUMENT SUBMITTED]
• Comparison Result: PENDING EVIDENCE SUBMISSION. Expected verification record unfulfilled.
• Verification Engine Outcome: PENDING

================================================================================
END OF GROUND TRUTH FILE
================================================================================
"""
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Generated Ground Truth: {out_path}")


# ==============================================================================
# MAIN BATCH CONTROLLER
# ==============================================================================
def main():
    print(f"Generating 5 distinct candidate datasets into: {TARGET_BASE}")
    total_files_generated = 0

    for idx, cand in enumerate(CANDIDATES, 1):
        cand_dir = os.path.join(TARGET_BASE, cand["folder_name"])
        os.makedirs(cand_dir, exist_ok=True)
        prefix = cand["prefix"]
        print(f"\n[{idx}/5] Processing: {cand['name']} ({cand['target_position']})")
        print(f"      Mode: {'Scanned Image PDF (No Text Layer)' if cand['is_scanned_pdf'] else 'Digital Vector Text PDF'}")

        # 1-6. Resumes
        r1 = os.path.join(cand_dir, f"{prefix}_Resume.pdf")
        r2 = os.path.join(cand_dir, f"{prefix}_Resume.docx")
        r3 = os.path.join(cand_dir, f"{prefix}_Resume.png")
        r4 = os.path.join(cand_dir, f"{prefix}_Resume.jpg")
        r5 = os.path.join(cand_dir, f"{prefix}_Resume_Blurred.png")
        r6 = os.path.join(cand_dir, f"{prefix}_Resume_Blurred.jpg")

        build_candidate_resume1_pdf(cand, r1)
        build_candidate_resume2_docx(cand, r2)
        build_candidate_resume3_png(cand, r3)
        build_candidate_resume4_jpg(cand, r4)
        build_candidate_resume5_blurred_png(cand, r5)
        build_candidate_resume6_blurred_jpg(cand, r6)

        # 7-12. Supporting Documents
        d1 = os.path.join(cand_dir, f"{prefix}_COE_Current_Employer.pdf")
        d2 = os.path.join(cand_dir, f"{prefix}_COE_Previous_Employer.pdf")
        d3 = os.path.join(cand_dir, f"{prefix}_Diploma.pdf")
        d4 = os.path.join(cand_dir, f"{prefix}_Training_Certificate_FoodSafety.pdf")
        d5 = os.path.join(cand_dir, f"{prefix}_Training_Certificate_Service.pdf")
        d6 = os.path.join(cand_dir, f"{prefix}_Incomplete_Certificate.pdf")

        build_candidate_doc1_coe_curr(cand, d1)
        build_candidate_doc2_coe_prev(cand, d2)
        build_candidate_doc3_diploma(cand, d3)
        build_candidate_doc4_cert1(cand, d4)
        build_candidate_doc5_cert2(cand, d5)
        build_candidate_doc6_incomplete(cand, d6)

        # 13. Ground Truth TXT
        gt = os.path.join(cand_dir, f"Actual Info in the Resume of {cand['name']}.txt")
        build_candidate_ground_truth(cand, gt)

        files = os.listdir(cand_dir)
        print(f"      Verified {len(files)} files generated in '{cand['folder_name']}'.")
        total_files_generated += len(files)

    print(f"\n=======================================================")
    print(f"COMPLETED: Generated {total_files_generated} total files across {len(CANDIDATES)} candidate folders.")
    print(f"Target location: {TARGET_BASE}")
    print(f"=======================================================")


if __name__ == "__main__":
    main()
