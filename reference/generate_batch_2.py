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

# Register Fonts
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
    """Flattens a PDF into scanned images without text layer to test OCR."""
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
# BATCH 2 CANDIDATE PROFILES (Candidates 6 to 10)
# ==============================================================================
CANDIDATES_BATCH_2 = [
    # --------------------------------------------------------------------------
    # 6. Lorenzo Miguel Santiago (Scanned / Image-Only PDFs - OCR Benchmark)
    # --------------------------------------------------------------------------
    {
        "name": "Lorenzo Miguel Santiago",
        "prefix": "Lorenzo_Miguel_Santiago",
        "folder_name": "Lorenzo Miguel Santiago - Hospitality Resume and Documents",
        "is_scanned_pdf": True,
        "target_position": "Executive Pastry Chef & Bakery Operations Head",
        "phone": "+63 917 482 9153",
        "email": "lorenzo.santiago.pastry@outlook.ph",
        "address": "28 McKinley Parkway, BGC, 1634 Taguig City, Philippines",
        "linkedin": "linkedin.com/in/lorenzo-santiago-pastry",
        "summary": (
            "Artistic, commercially astute Executive Pastry Chef with over 8 years of luxury hotel bakery operations, "
            "signature dessert menu development, and high-volume banquet production leadership. Skilled in classical French "
            "viennoiserie, large-scale artisan bread baking, sugar artistry, and strict HACCP kitchen sanitation protocols. "
            "Adept in managing brigade teams of up to 18 pastry cooks while reducing food wastage and maintaining high profit margins."
        ),
        "skills": [
            "Classical French Pastry, Viennoiserie & Artisan Bread Baking",
            "Banquet Dessert Staging & High-Volume Event Buffets (up to 800 covers)",
            "Recipe Standardisation, Food Cost Control & Pastry Yield Optimization",
            "Chocolate Tempering, Showpiece Construction & Sugar Artistry",
            "Pastry Brigade Rostering, Station Supervision & Culinary Mentorship",
            "Food Safety, Sanitation Auditing & HACCP Kitchen Standards",
            "Allergen Management, Gluten-Free & Vegan Dessert Formulation",
            "Bakery Requisition, Par Stock Inventory & Premium Ingredient Sourcing"
        ],
        "experience": [
            {
                "company": "Grand Hyatt Manila",
                "location": "BGC, Taguig City",
                "position": "Executive Pastry Chef",
                "duration": "October 2021 – Present",
                "bullets": [
                    "Lead pastry and bakery production across 5 hotel restaurants, executive lounge, and grand ballroom banquets.",
                    "Manage daily operations of an 18-member pastry kitchen brigade with zero cross-contamination incidents.",
                    "Introduced a seasonal afternoon tea pastry program generating PHP 1.4M quarterly incremental revenue.",
                    "Decreased monthly kitchen ingredient spoilage by 16% through real-time batch baking schedules."
                ]
            },
            {
                "company": "City of Dreams Manila",
                "location": "Para?aque City, Metro Manila",
                "position": "Pastry Sous Chef",
                "duration": "January 2018 – September 2021",
                "bullets": [
                    "Supervised daily dessert production for 6 signature integrated resort dining venues.",
                    "Formulated standard operational procedure manuals for artisan bread baking and chocolate pralines.",
                    "Conducted temperature logging and daily hygiene audits in compliance with five-star hotel guidelines."
                ]
            },
            {
                "company": "Spiral Manila — Sofitel",
                "location": "Pasay City, Metro Manila",
                "position": "Chef de Partie Pastry",
                "duration": "June 2015 – December 2017",
                "bullets": [
                    "Oversaw the French pastry and chocolate atelier atelier station serving up to 600 buffet guests daily.",
                    "Maintained consistent production quotas for plated wedding cakes and VIP corporate amenities."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Hospitality and Culinary Arts Management",
            "institution": "San Beda University — Mendiola, Manila",
            "year": "2015"
        },
        "certifications": [
            {
                "title": "Certified Executive Pastry Chef (CEPC)",
                "issuer": "World Association of Chefs Societies (WACS)",
                "date": "November 2020"
            },
            {
                "title": "Advanced HACCP & Commercial Kitchen Sanitation",
                "issuer": "Food Safety Council of the Philippines",
                "date": "August 2022"
            },
            {
                "title": "Artisanal Bread & Viennoiserie Mastery",
                "issuer": "French Culinary Institute Manila",
                "date": "March 2019"
            }
        ],
        "theme": {
            "p_dark": "#3D1E06",     # Rich Chocolate Dark
            "p_accent": "#D97706",   # Warm Caramel Gold
            "p_light": "#FFFBEB",    # Warm Cream
            "p_sub": "#78350F",      # Deep Amber Brown
            "p_gray": "#374151"
        },
        "discrepancy_coe_dates": "June 1, 2018 – September 15, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from June 2018 to September 2021, whereas resume claims start date of January 2018 (5-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Basic Sugar Art and Commercial Cake Decorating",
        "discrepancy_cert_reason": "Resume claims 'Artisanal Bread & Viennoiserie Mastery', but certificate certifies 'Foundations of Basic Sugar Art and Commercial Cake Decorating'.",
        "incomplete_cert_name": "Certified Executive Pastry Chef (CEPC)",
        "incomplete_reason": "Recipient name area is torn and missing from document scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 7. Bianca Louise Garcia (Standard Digital Vector PDFs)
    # --------------------------------------------------------------------------
    {
        "name": "Bianca Louise Garcia",
        "prefix": "Bianca_Louise_Garcia",
        "folder_name": "Bianca Louise Garcia - Hospitality Resume and Documents",
        "is_scanned_pdf": False,
        "target_position": "Restaurant Quality Assurance & Food Safety Officer",
        "phone": "+63 918 554 3912",
        "email": "bianca.garcia.qa@outlook.ph",
        "address": "16 Alabang-Zapote Road, 1780 Muntinlupa City, Philippines",
        "linkedin": "linkedin.com/in/bianca-garcia-qa",
        "summary": (
            "Meticulous, standards-driven Restaurant Quality Assurance & Food Safety Officer with over 6 years of "
            "comprehensive experience in luxury resort compliance, ISO 22000 hygiene auditing, and restaurant HACCP "
            "enforcement. Demonstrated success in conducting 200+ kitchen and vendor audits annually, reducing food safety "
            "non-conformances by 35%, and training over 300 hospitality team members on sanitation and cross-contamination prevention."
        ),
        "skills": [
            "ISO 22000 & HACCP Food Safety Management System Auditing",
            "Microbiological Swab Testing, Water Testing & Laboratory Verification",
            "Cold Chain Temperature Verification & Critical Control Point (CCP) Audits",
            "Supplier Quality Audits, Receiving Inspection & Raw Material Compliance",
            "Corrective Action Plan (CAPA) Tracking & Defect Root-Cause Analysis",
            "Food Allergen Segregation & Chemical Storage Safety Protocols",
            "Culinary & Service Staff Sanitation Briefings & Regulatory Training",
            "Kitchen Pest Control Monitoring & Health Authority Audit Liaison"
        ],
        "experience": [
            {
                "company": "Newport World Resorts",
                "location": "Pasay City, Metro Manila",
                "position": "Restaurant Quality Assurance & Food Safety Officer",
                "duration": "March 2022 – Present",
                "bullets": [
                    "Direct food safety, hygiene, and QA compliance across 14 fine dining restaurants, bars, and staff dining facilities.",
                    "Perform unannounced weekly hygiene inspections and monthly microbiological surface testing.",
                    "Decreased restaurant hygiene audit defects by 35% through standardized daily kitchen sanitation logs.",
                    "Liaise with local government health inspectors, achieving 100% sanitary permit compliance ratings."
                ]
            },
            {
                "company": "Shangri-La Boracay Resort & Spa",
                "location": "Boracay Island, Aklan",
                "position": "Food Safety & Hygiene Supervisor",
                "duration": "July 2019 – February 2022",
                "bullets": [
                    "Audited receiving bays, cold storage units, and beachside restaurants for compliance with luxury brand food safety standards.",
                    "Led training workshops for 120 culinary and stewarding employees on personal hygiene and chemical handling.",
                    "Managed food temperature monitoring and implemented rapid cooling logs in the central commissary."
                ]
            },
            {
                "company": "Max's Group Inc.",
                "location": "Makati City, Metro Manila",
                "position": "Kitchen Quality Auditor",
                "duration": "May 2017 – June 2019",
                "bullets": [
                    "Conducted operational quality checks on food preparation, cooking temperatures, and packaging standards.",
                    "Logged customer feedback regarding product quality and prepared monthly QA summaries for management."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Hotel, Restaurant, and Institution Management",
            "institution": "University of the Philippines Diliman (UPD) — Quezon City",
            "year": "2017"
        },
        "certifications": [
            {
                "title": "ISO 22000 Lead Food Safety Auditor",
                "issuer": "International Register of Certificated Auditors (IRCA)",
                "date": "November 2021"
            },
            {
                "title": "HACCP System Implementation & Verification",
                "issuer": "Hospitality Training Council of the Philippines",
                "date": "June 2022"
            },
            {
                "title": "Environmental Sanitation & Pest Control in Food Service",
                "issuer": "Philippine Safety & Hygiene Council",
                "date": "October 2019"
            }
        ],
        "theme": {
            "p_dark": "#0E4A56",     # Deep Ocean Teal
            "p_accent": "#0891B2",   # Crisp Cyan
            "p_light": "#F0FDFA",    # Ice Mint Tint
            "p_sub": "#0D9488",      # Teal Accent
            "p_gray": "#334155"
        },
        "discrepancy_coe_dates": "October 1, 2019 – February 20, 2022",
        "discrepancy_coe_reason": "Official COE certifies employment from October 2019 to February 2022, whereas resume claims start date of July 2019 (3-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Basic Chemical Handling & Kitchen Warewashing",
        "discrepancy_cert_reason": "Resume claims 'Environmental Sanitation & Pest Control in Food Service', but certificate certifies 'Foundations of Basic Chemical Handling & Kitchen Warewashing'.",
        "incomplete_cert_name": "ISO 22000 Lead Food Safety Auditor",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 8. Adrian Luis Navarro (Standard Digital Vector PDFs)
    # --------------------------------------------------------------------------
    {
        "name": "Adrian Luis Navarro",
        "prefix": "Adrian_Luis_Navarro",
        "folder_name": "Adrian Luis Navarro - Hospitality Resume and Documents",
        "is_scanned_pdf": False,
        "target_position": "Chief Concierge & Head of Guest Experience",
        "phone": "+63 917 392 8419",
        "email": "adrian.navarro.concierge@outlook.ph",
        "address": "402 Greenbelt Residences, Legazpi Village, 1229 Makati City, Philippines",
        "linkedin": "linkedin.com/in/adrian-navarro-concierge",
        "summary": (
            "Distinguished, service-obsessed Chief Concierge and Les Clefs d'Or international keyholder with over 7 years "
            "of luxury hotel experience curating bespoke guest journeys for global leaders, celebrities, and corporate VIPs. "
            "Renowned for an unparalleled network of high-end cultural, culinary, and logistical partnerships across Southeast Asia. "
            "Adept in leading concierge, bell, and valet teams while maintaining Forbes 5-Star guest experience standards."
        ),
        "skills": [
            "Les Clefs d'Or International Concierge Service Standards & Etiquette",
            "High-Net-Worth VIP Guest Itinerary Curation & Exclusive Access Logistics",
            "Concierge Desk Operations, Clefs d'Or Network Liaison & Errand Tracking",
            "Emergency Medical, Consular & Diplomatic Protocol Assistance",
            "Lobby Team Leadership: Mentoring Bell Captains, Concierges & Drivers (up to 24 staff)",
            "Luxury Transport, Private Jet Handling & Yacht Charter Coordination",
            "Guest History Profiles, Preference Tracking & Personalized Surprises",
            "Concierge System CRM Administration (GoConcierge / Alice Platform)"
        ],
        "experience": [
            {
                "company": "Raffles Makati",
                "location": "Makati City, Metro Manila",
                "position": "Chief Concierge",
                "duration": "January 2022 – Present",
                "bullets": [
                    "Direct concierge desk operations, bell services, and VIP chauffeur logistics for an ultra-luxury boutique hotel.",
                    "Manage a team of 14 concierges and bell staff, upholding strict Forbes Five-Star mystery inspection benchmarks.",
                    "Secured exclusive dining and event partnerships, generating over PHP 3.2M in concierge affiliate revenue in 2023.",
                    "Maintained a 99.1% positive guest satisfaction rating across all post-stay experience questionnaires."
                ]
            },
            {
                "company": "The Peninsula Manila",
                "location": "Makati City, Metro Manila",
                "position": "Assistant Head Concierge",
                "duration": "April 2018 – December 2021",
                "bullets": [
                    "Supervised daily concierge inquiries, theater bookings, private aviation transfers, and diplomatic security convoys.",
                    "Mentored junior concierge attendants on luxury city navigation and conversational etiquette.",
                    "Awarded employee of the year in 2020 for resolving an emergency foreign consular visa crisis for stranded VIP guests."
                ]
            },
            {
                "company": "Discovery Suites Ortigas",
                "location": "Pasig City, Metro Manila",
                "position": "Concierge Supervisor",
                "duration": "June 2016 – March 2018",
                "bullets": [
                    "Coordinated guest airport transfers, courier deliveries, and local sightseeing excursions for corporate long-stay guests.",
                    "Maintained accurate guest logbooks and handled concierge desk cash advances with zero discrepancy."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Arts in Interdisciplinary Studies (Hospitality Management Track)",
            "institution": "Ateneo de Manila University — Loyola Heights, Quezon City",
            "year": "2016"
        },
        "certifications": [
            {
                "title": "Les Clefs d'Or International Member Certification",
                "issuer": "Union Internationale des Concierges d'Hotels (UICH)",
                "date": "October 2020"
            },
            {
                "title": "Luxury Destination Itinerary Planning & VIP Protocol",
                "issuer": "Philippine Hospitality Development Center",
                "date": "July 2021"
            },
            {
                "title": "High-Net-Worth Guest Privacy & Security Protocols",
                "issuer": "International Hospitality Security Academy",
                "date": "March 2019"
            }
        ],
        "theme": {
            "p_dark": "#18181B",     # Onyx Black
            "p_accent": "#CA8A04",   # Luxury Gold
            "p_light": "#FEFCE8",    # Gold Tint White
            "p_sub": "#713F12",      # Deep Gold Ochre
            "p_gray": "#27272A"
        },
        "discrepancy_coe_dates": "August 1, 2018 – December 20, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from August 2018 to December 2021, whereas resume claims start date of April 2018 (4-month discrepancy).",
        "discrepancy_cert_course": "Foundations of City Tour Guiding and Landmark Navigation",
        "discrepancy_cert_reason": "Resume claims 'High-Net-Worth Guest Privacy & Security Protocols', but certificate certifies 'Foundations of City Tour Guiding and Landmark Navigation'.",
        "incomplete_cert_name": "Les Clefs d'Or International Member Certification",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 9. Patricia Elaine Ramos (Scanned / Image-Only PDFs - OCR Benchmark)
    # --------------------------------------------------------------------------
    {
        "name": "Patricia Elaine Ramos",
        "prefix": "Patricia_Elaine_Ramos",
        "folder_name": "Patricia Elaine Ramos - Hospitality Resume and Documents",
        "is_scanned_pdf": True,
        "target_position": "Hotel Purchasing & Procurement Supervisor",
        "phone": "+63 919 621 8045",
        "email": "patricia.ramos.purchasing@outlook.ph",
        "address": "55 Ortigas Avenue, 1605 Pasig City, Metro Manila, Philippines",
        "linkedin": "linkedin.com/in/patricia-ramos-purchasing",
        "summary": (
            "Strategic, cost-conscious Hotel Purchasing & Procurement Supervisor with over 6 years of experience "
            "directing supply chain operations, supplier bidding, and inventory control for luxury hotels and integrated "
            "resorts. Proven expertise in SAP MM ERP systems, perishable food par levels, luxury OS&E sourcing, and vendor "
            "contract renegotiation. Successfully slashed departmental procurement expenditure by PHP 4.5M annually while "
            "securing on-time delivery across 100+ accredited culinary and operational suppliers."
        ),
        "skills": [
            "Hotel Supply Chain Management & Strategic Sourcing (F&B and OS&E)",
            "SAP Materials Management (MM) & Oracle NetSuite Procurement Administration",
            "Vendor Contract Bidding, Pricing Negotiation & Supplier SLA Enforcement",
            "Perishable Cold Chain Auditing, Receiving Bay QA & Par Level Calculations",
            "Purchase Order (PO) Lifecycle Management, Three-Way Matching & Cost Auditing",
            "Hospitality Importation Logistics, Customs Clearance & Freight Tracking",
            "Cross-Departmental Requisition Fulfillment with Kitchens & Housekeeping",
            "Quarterly Inventory Stocktakes, Shrinkage Audits & Variance Reconciliation"
        ],
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
        "education": {
            "degree": "Bachelor of Science in Business Management (Hospitality Logistics)",
            "institution": "De La Salle University (DLSU) — Taft Avenue, Manila",
            "year": "2017"
        },
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
                "issuer": "Techlogix Enterprise Academy",
                "date": "January 2020"
            }
        ],
        "theme": {
            "p_dark": "#1E293B",     # Deep Slate
            "p_accent": "#EA580C",   # Burnt Orange
            "p_light": "#FFF7ED",    # Orange Cream White
            "p_sub": "#C2410C",      # Darker Orange
            "p_gray": "#334155"
        },
        "discrepancy_coe_dates": "June 1, 2019 – July 20, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from June 2019 to July 2021, whereas resume claims start date of March 2019 (3-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Warehouse Goods Receiving and Pallet Counting",
        "discrepancy_cert_reason": "Resume claims 'SAP ERP Materials Management in Hospitality', but certificate certifies 'Foundations of Warehouse Goods Receiving and Pallet Counting'.",
        "incomplete_cert_name": "Certified Hospitality Purchasing Executive (CHPE)",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 10. Jerome Vincent Alonzo (Standard Digital Vector PDFs)
    # --------------------------------------------------------------------------
    {
        "name": "Jerome Vincent Alonzo",
        "prefix": "Jerome_Vincent_Alonzo",
        "folder_name": "Jerome Vincent Alonzo - Hospitality Resume and Documents",
        "is_scanned_pdf": False,
        "target_position": "Hotel Transportation & Guest Mobility Supervisor",
        "phone": "+63 918 734 5092",
        "email": "jerome.alonzo.transport@outlook.ph",
        "address": "22 Roxas Boulevard, 1300 Pasay City, Metro Manila, Philippines",
        "linkedin": "linkedin.com/in/jerome-alonzo-transport",
        "summary": (
            "Energetic, safety-certified Hotel Transportation & Guest Mobility Supervisor with over 6 years of frontline "
            "and leadership experience managing executive fleets, airport arrival lounges, and valet operations for five-star "
            "integrated resorts. Proven track record in orchestrating 150+ daily VIP airport transfers, maintaining a zero-accident "
            "fleet record, reducing guest vehicle retrieval wait times to under 4 minutes, and directing team brigades of up to 25 "
            "chauffeurs and valet captains."
        ),
        "skills": [
            "Executive Chauffeur Fleet Management & Daily Vehicle Allocation",
            "VIP Airport Arrival Staging, Flight Tracking & Baggage Custody Handling",
            "Valet Parking Logistics, Key Management & Vehicle Retrieval Flow",
            "Defensive Driving, Road Safety Protocols & Emergency Fleet Response",
            "Chauffeur Team Rostering, Grooming Inspections & Service Etiquette Training",
            "Fleet Maintenance Scheduling, Fuel Mileage Audits & Telematics Monitoring",
            "Cross-Departmental Coordination with Front Desk, Concierge & Security",
            "Guest Transportation Billing, Mileage Logging & Folio Settlement"
        ],
        "experience": [
            {
                "company": "City of Dreams Manila",
                "location": "Para?aque City, Metro Manila",
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
        "education": {
            "degree": "Bachelor of Science in Hospitality Management",
            "institution": "Polytechnic University of the Philippines (PUP) — Sta. Mesa, Manila",
            "year": "2018"
        },
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
        ],
        "theme": {
            "p_dark": "#0B192C",     # Midnight Navy
            "p_accent": "#DC2626",   # Signal Red
            "p_light": "#F8FAFC",    # Pure White Tint
            "p_sub": "#1E3E62",      # Steel Blue
            "p_gray": "#334155"
        },
        "discrepancy_coe_dates": "September 1, 2019 – October 25, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from September 2019 to October 2021, whereas resume claims start date of June 2019 (3-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Basic Vehicle Inspection & Fluid Checking",
        "discrepancy_cert_reason": "Resume claims 'Airport Runway & Terminal Dispatch Coordination', but certificate certifies 'Foundations of Basic Vehicle Inspection & Fluid Checking'.",
        "incomplete_cert_name": "Professional Chauffeur & VIP Mobility Services Executive",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    }
]


# ==============================================================================
# IMPORT GENERATOR FUNCTIONS FROM generate_all_candidates
# ==============================================================================
# We can re-use the exact generation functions from the earlier module or run them
from reference.generate_all_candidates import (
    build_candidate_resume1_pdf,
    build_candidate_resume2_docx,
    build_candidate_resume3_png,
    build_candidate_resume4_jpg,
    build_candidate_resume5_blurred_png,
    build_candidate_resume6_blurred_jpg,
    build_candidate_doc1_coe_curr,
    build_candidate_doc2_coe_prev,
    build_candidate_doc3_diploma,
    build_candidate_doc4_cert1,
    build_candidate_doc5_cert2,
    build_candidate_doc6_incomplete,
    build_candidate_ground_truth
)

def main():
    print(f"Generating BATCH 2 (Candidates 6 to 10) into: {TARGET_BASE}")
    total_files_generated = 0

    for idx, cand in enumerate(CANDIDATES_BATCH_2, 6):
        cand_dir = os.path.join(TARGET_BASE, cand["folder_name"])
        os.makedirs(cand_dir, exist_ok=True)
        prefix = cand["prefix"]
        print(f"\n[{idx}/10] Processing: {cand['name']} ({cand['target_position']})")
        print(f"       Mode: {'Scanned Image PDF (No Text Layer)' if cand['is_scanned_pdf'] else 'Digital Vector Text PDF'}")

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
        print(f"       Verified {len(files)} files generated in '{cand['folder_name']}'.")
        total_files_generated += len(files)

    print(f"\n=======================================================")
    print(f"COMPLETED: Generated {total_files_generated} total files for Batch 2.")
    print(f"=======================================================")


if __name__ == "__main__":
    main()
