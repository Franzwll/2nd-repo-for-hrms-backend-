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

TARGET_BASE = r"c:\Users\PC\Downloads\Ferdi\4TH_YR\DEV\v11.1\2nd-repo-for-hrms-backend-\reference\resume + supporting document"
os.makedirs(TARGET_BASE, exist_ok=True)

# Import generation functions from generate_all_candidates
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

# ==============================================================================
# BATCH 3 CANDIDATE PROFILES (Candidates 12 to 16)
# ==============================================================================
CANDIDATES_BATCH_3 = [
    # --------------------------------------------------------------------------
    # 12. Daniel Joseph Villanueva (Scanned / Image-Only PDFs - OCR Benchmark)
    # --------------------------------------------------------------------------
    {
        "name": "Daniel Joseph Villanueva",
        "prefix": "Daniel_Joseph_Villanueva",
        "folder_name": "Daniel Joseph Villanueva - Hospitality Resume and Documents",
        "is_scanned_pdf": True,
        "target_position": "Hotel Revenue & Distribution Operations Manager",
        "phone": "+63 917 554 9281",
        "email": "daniel.villanueva.revenue@outlook.ph",
        "address": "104 Legaspi Street, Legaspi Village, 1229 Makati City, Philippines",
        "linkedin": "linkedin.com/in/daniel-villanueva-revenue",
        "summary": (
            "Analytical, commercially driven Hotel Revenue & Distribution Operations Manager with over 8 years of luxury "
            "hotel yield management, automated pricing algorithmic modeling, and OTA channel optimization experience. "
            "Expert in IDeaS G3 RMS, Opera Cloud PMS, and multi-segment market demand forecasting. Successfully drove "
            "an average 14.8% RevPAR growth and 98.5% channel rate parity across five-star commercial lodging portfolios."
        ),
        "skills": [
            "IDeaS G3 RMS Dynamic Pricing Optimization & Machine Learning Yielding",
            "RevPAR, ADR & TrevPAR Maximization & Strategic Room Inventory Allocation",
            "OTA Channel Distribution & Global Distribution System (GDS) Parity",
            "Group Displacement Analysis & Corporate RFP Pricing Evaluation",
            "Competitive Rate Intelligence, Fair Market Share & STR Benchmarking",
            "Multi-Segment Demand Forecasting (Transient, Group, Corporate & MICE)",
            "Opera Cloud PMS Rate Code Architecture & Restriction Mapping",
            "Cross-Departmental Revenue Strategy Briefings with Sales, F&B & Marketing"
        ],
        "experience": [
            {
                "company": "The Manila Hotel",
                "location": "One Rizal Park, Manila",
                "position": "Revenue Operations Manager",
                "duration": "November 2021 – Present",
                "bullets": [
                    "Direct total hotel revenue strategy across 570 guestrooms, 8 restaurants, and historical convention facilities.",
                    "Optimized dynamic pricing rules in IDeaS G3 RMS, increasing annual room revenue by PHP 38M in 2023.",
                    "Maintained a STR RevPAR Yield Index of 114.2 against direct competitive set hotels in the Manila Bay area.",
                    "Led weekly commercial revenue meetings with Executive Committee heads, presenting demand pacing dashboards."
                ]
            },
            {
                "company": "Dusit Thani Manila",
                "location": "Makati City, Metro Manila",
                "position": "Revenue Analyst & Distribution Specialist",
                "duration": "January 2018 – October 2021",
                "bullets": [
                    "Monitored daily pick-up patterns, competitor rate shopping feeds, and OTA booking pace across 538 rooms.",
                    "Audited online distribution channels, eliminating rate parity discrepancies and saving PHP 1.2M in OTA penalties.",
                    "Configured seasonal room packages and promotional rate codes in Opera PMS and SynXis CRS."
                ]
            },
            {
                "company": "The Bellevue Manila",
                "location": "Alabang, Muntinlupa City",
                "position": "Reservations Supervisor",
                "duration": "June 2015 – December 2017",
                "bullets": [
                    "Supervised daily operations of the central reservations office and monitored telephone conversion rates.",
                    "Audited group booking rooming lists and resolved billing routing disputes with corporate travel agents."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Applied Economics and Hospitality Management",
            "institution": "De La Salle University (DLSU) — Taft Avenue, Manila",
            "year": "2015"
        },
        "certifications": [
            {
                "title": "Certified Revenue Management Executive (CRME)",
                "issuer": "Hospitality Sales and Marketing Association International (HSMAI)",
                "date": "October 2020"
            },
            {
                "title": "IDeaS G3 RMS Advanced Pricing & Forecasting",
                "issuer": "IDeaS Revenue Solutions Academy",
                "date": "July 2022"
            },
            {
                "title": "OTA Channel Management & Rate Parity Optimization",
                "issuer": "Asia Hospitality Distribution Council",
                "date": "March 2019"
            }
        ],
        "theme": {
            "p_dark": "#0F172A",     # Slate Navy
            "p_accent": "#EAB308",   # Warm Amber Gold
            "p_light": "#F8FAFC",    # Crisp Ice
            "p_sub": "#1E3A8A",      # Deep Royal Blue
            "p_gray": "#334155"
        },
        "discrepancy_coe_dates": "April 1, 2018 – October 15, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from April 2018 to October 2021, whereas resume claims start date of January 2018 (3-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Basic Hotel Reservations & Phone Bookings",
        "discrepancy_cert_reason": "Resume claims 'OTA Channel Management & Rate Parity Optimization', but certificate certifies 'Foundations of Basic Hotel Reservations & Phone Bookings'.",
        "incomplete_cert_name": "Certified Revenue Management Executive (CRME)",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 13. Maria Cristina Santos (Standard Digital Vector PDFs)
    # --------------------------------------------------------------------------
    {
        "name": "Maria Cristina Santos",
        "prefix": "Maria_Cristina_Santos",
        "folder_name": "Maria Cristina Santos - Hospitality Resume and Documents",
        "is_scanned_pdf": False,
        "target_position": "Director of Spa & Wellness Operations",
        "phone": "+63 918 642 1109",
        "email": "cristina.santos.spa@outlook.ph",
        "address": "88 5th Avenue, Bonifacio Global City, 1634 Taguig City, Philippines",
        "linkedin": "linkedin.com/in/cristina-santos-spa",
        "summary": (
            "Visionary, holistic-minded Director of Spa & Wellness Operations with over 9 years of luxury resort and "
            "five-star hotel spa leadership experience. Certified Spa Director (CSD) with deep expertise in signature treatment "
            "curation, hydrothermal facility compliance, therapist productivity engineering, and luxury retail revenue generation. "
            "Consistently elevated guest wellness satisfaction ratings to 97.4% while generating over PHP 36M in annual spa revenues."
        ),
        "skills": [
            "Luxury Spa Facility Management, Treatment Protocol Curation & SOP Design",
            "Therapist Roster Scheduling, Commission Structuring & Technical Training (up to 30 staff)",
            "Spa Retail Inventory Control, High-End Skincare Sourcing & Margin Yielding",
            "Hydrothermal, Sauna, Steam & Vitality Pool Hygiene Compliance",
            "Guest Wellness Consultations, Medical Contraindication Screening & Privacy",
            "Spa Booking Software Administration (Book4Time / ResortSuite)",
            "Cross-Marketing Wellness Packages with Hotel Rooms, Bridal & F&B Suites",
            "Strict Sanitation, Towel / Linen Cleanliness & Infection Control Standards"
        ],
        "experience": [
            {
                "company": "Shangri-La The Fort, Manila",
                "location": "BGC, Taguig City",
                "position": "Director of Spa & Wellness Operations",
                "duration": "August 2021 – Present",
                "bullets": [
                    "Direct end-to-end operations of an ultra-luxury 16-treatment-room wellness sanctuary, hydrotherapy zone, and salon.",
                    "Manage a team of 28 certified therapists, aestheticians, and reception concierges, surpassing annual budget by 19%.",
                    "Launched organic botanical facial therapies delivering PHP 4.8M in retail skincare product sales during 2023.",
                    "Achieved a 98.1% guest cleanliness and therapist professionalism audit score in Forbes hospitality reviews."
                ]
            },
            {
                "company": "Nobu Hotel Manila / City of Dreams",
                "location": "Para?aque City, Metro Manila",
                "position": "Spa Operations Manager",
                "duration": "March 2017 – July 2021",
                "bullets": [
                    "Oversaw daily operations, treatment room turnover, and inventory par levels for signature integrated resort spa.",
                    "Designed specialized pre-flight and jet-lag restorative treatments for international VIP casino guests.",
                    "Enforced rigid sanitization protocols and supervised linen laundering cycles with zero hygiene infractions."
                ]
            },
            {
                "company": "The Farm at San Benito",
                "location": "Lipa City, Batangas",
                "position": "Senior Holistic Therapist & Supervisor",
                "duration": "May 2014 – February 2017",
                "bullets": [
                    "Conducted personalized holistic wellness therapies, hydrotherapy sessions, and detox body scrubs.",
                    "Trained junior therapists on international Swedish, Shiatsu, and traditional Filipino Hilot techniques."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Physical Therapy (Hospitality Spa Administration)",
            "institution": "University of Santo Tomas (UST) — Espa?a, Manila",
            "year": "2014"
        },
        "certifications": [
            {
                "title": "Certified Spa Director (CSD)",
                "issuer": "International SPA Association (ISPA)",
                "date": "November 2019"
            },
            {
                "title": "Holistic Aromatherapy & Luxury Hydrotherapy Protocols",
                "issuer": "Asian Spa and Wellness Institute",
                "date": "August 2021"
            },
            {
                "title": "Spa Sanitation & OSHA Safety in Wellness Operations",
                "issuer": "Philippine Safety & Hygiene Council",
                "date": "February 2018"
            }
        ],
        "theme": {
            "p_dark": "#4A044E",     # Rich Royal Plum
            "p_accent": "#10B981",   # Refreshing Sage Emerald
            "p_light": "#FDF4FF",    # Pale Orchid Tint
            "p_sub": "#701A75",      # Deep Berry
            "p_gray": "#374151"
        },
        "discrepancy_coe_dates": "June 1, 2017 – July 20, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from June 2017 to July 2021, whereas resume claims start date of March 2017 (3-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Basic Swedish Massage and Towel Folding",
        "discrepancy_cert_reason": "Resume claims 'Spa Sanitation & OSHA Safety in Wellness Operations', but certificate certifies 'Foundations of Basic Swedish Massage and Towel Folding'.",
        "incomplete_cert_name": "Certified Spa Director (CSD)",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 14. Mark Anthony Dela Cruz (Scanned / Image-Only PDFs - OCR Benchmark)
    # --------------------------------------------------------------------------
    {
        "name": "Mark Anthony Dela Cruz",
        "prefix": "Mark_Anthony_Dela_Cruz",
        "folder_name": "Mark Anthony Dela Cruz - Hospitality Resume and Documents",
        "is_scanned_pdf": True,
        "target_position": "Hotel Facilities & Building Engineering Supervisor",
        "phone": "+63 917 830 4421",
        "email": "mark.delacruz.engineering@outlook.ph",
        "address": "42 Domestic Road, 1301 Pasay City, Metro Manila, Philippines",
        "linkedin": "linkedin.com/in/mark-delacruz-engineering",
        "summary": (
            "Results-focused, licensed Mechanical Engineer and Hotel Facilities Engineering Supervisor with over 8 years "
            "of leadership in luxury hotel central plant maintenance, commercial HVAC systems, building management systems (BMS), "
            "and life safety compliance. Proven ability to optimize energy consumption, reduce diesel generator operating costs by 18%, "
            "and lead rapid-response engineering teams of up to 22 technicians with zero hotel power interruptions."
        ),
        "skills": [
            "Central Chiller Plant Operations, Cooling Towers & HVAC Air Handling Units (AHU)",
            "Emergency Diesel Generator Paralleling, High-Voltage Switchgear & UPS Systems",
            "Building Management Systems (BMS) Automation (Schneider Electric / Honeywell)",
            "Hotel Fire Life Safety, NFPA Fire Alarm Loops & Wet Sprinkler System Maintenance",
            "Preventive Maintenance Scheduling (PM) via HotSOS & Maximo CMMS",
            "Kitchen Refrigeration, Walk-in Freezers & Commercial Laundry Equipment Repair",
            "Potable Water Filtration, Reverse Osmosis & Sewage Treatment Plant (STP) Audits",
            "Technical Team Shift Scheduling, Tool Custody & Contractor Safety Compliance"
        ],
        "experience": [
            {
                "company": "Newport World Resorts — Maxims Hotel",
                "location": "Pasay City, Metro Manila",
                "position": "Facilities Engineering Supervisor",
                "duration": "September 2021 – Present",
                "bullets": [
                    "Supervise building maintenance and MEP infrastructure for an ultra-luxury casino hotel and commercial complex.",
                    "Direct a team of 22 duty engineers, electricians, plumbers, and HVAC technicians on 24/7 rotational shifts.",
                    "Engineered chiller sequencing schedule reducing monthly facility electrical consumption by PHP 1.4M.",
                    "Maintained 100% compliance with Bureau of Fire Protection and local municipal building inspection standards."
                ]
            },
            {
                "company": "Sofitel Philippine Plaza",
                "location": "Pasay City, Metro Manila",
                "position": "Assistant Chief Engineer",
                "duration": "February 2018 – August 2021",
                "bullets": [
                    "Managed preventive maintenance programs for 609 luxury guestrooms, 2 central chillers, and 4 ballroom kitchens.",
                    "Responded to high-priority guestroom maintenance calls, achieving an average resolution time under 12 minutes.",
                    "Audited fuel storage and tested emergency diesel generators weekly in accordance with luxury brand protocols."
                ]
            },
            {
                "company": "Diamond Hotel Philippines",
                "location": "Manila Bay, Manila",
                "position": "Shift Duty Engineer",
                "duration": "May 2015 – January 2018",
                "bullets": [
                    "Conducted hourly mechanical room loggings, boiler water chemical testing, and pump vibration assessments.",
                    "Repaired commercial kitchen dishwashers, convection ovens, and guestroom air conditioning thermostats."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Mechanical Engineering (Building Services)",
            "institution": "Mapua University — Intramuros, Manila",
            "year": "2015"
        },
        "certifications": [
            {
                "title": "Certified Hospitality Facilities Executive (CHFE)",
                "issuer": "American Hotel & Lodging Educational Institute (AHLEI)",
                "date": "November 2020"
            },
            {
                "title": "HVAC Central Chiller Plant Efficiency & BMS Automation",
                "issuer": "ASHRAE Philippines Chapter",
                "date": "April 2022"
            },
            {
                "title": "Hotel Fire Life Safety & High-Rise Emergency Standards",
                "issuer": "Philippine Safety & Health Academy",
                "date": "September 2019"
            }
        ],
        "theme": {
            "p_dark": "#334155",     # Industrial Steel Slate
            "p_accent": "#F59E0B",   # Safety Amber Gold
            "p_light": "#F8FAFC",    # Bright Ice Tint
            "p_sub": "#1E293B",      # Deep Charcoal Slate
            "p_gray": "#1E293B"
        },
        "discrepancy_coe_dates": "May 1, 2018 – August 15, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from May 2018 to August 2021, whereas resume claims start date of February 2018 (3-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Basic Electrical Wiring & Water Pump Repair",
        "discrepancy_cert_reason": "Resume claims 'HVAC Central Chiller Plant Efficiency & BMS Automation', but certificate certifies 'Foundations of Basic Electrical Wiring & Water Pump Repair'.",
        "incomplete_cert_name": "Certified Hospitality Facilities Executive (CHFE)",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 15. Nicole Frances Herrera (Standard Digital Vector PDFs)
    # --------------------------------------------------------------------------
    {
        "name": "Nicole Frances Herrera",
        "prefix": "Nicole_Frances_Herrera",
        "folder_name": "Nicole Frances Herrera - Hospitality Resume and Documents",
        "is_scanned_pdf": False,
        "target_position": "Hotel Recreation & Guest Activities Coordinator",
        "phone": "+63 918 912 7703",
        "email": "nicole.herrera.recreation@outlook.ph",
        "address": "15 Airport Road, 1300 Pasay City, Metro Manila, Philippines",
        "linkedin": "linkedin.com/in/nicole-herrera-recreation",
        "summary": (
            "Enthusiastic, safety-oriented Hotel Recreation & Guest Activities Coordinator with over 5 years of progressive "
            "experience designing dynamic leisure programs, resort poolside experiences, water sports management, and family activity "
            "clubs for premier integrated resorts. Certified CPR/AED first responder with a track record of coordinating daily activities "
            "for 200+ resort guests, boosting recreation auxiliary revenue by 24%, and ensuring 100% pool safety compliance."
        ),
        "skills": [
            "Resort Recreation Programming, Theme Days & Daily Activity Scheduling",
            "Poolside Guest Hospitality, Cabana VIP Service & Towel Station Flow",
            "Water Sports Safety, Lifeguard Supervision & Watercraft Pre-Check Logs",
            "Children's Kids Club Curriculum Design, Child Care Protocols & Creative Workshops",
            "Recreation Equipment Inventory, Sports Gear Maintenance & Rental Logistics",
            "Lifeguard Emergency Rescue Protocols, First Aid & CPR / AED Certification",
            "Event Hosting, Holiday Festive Entertainment & Interactive Guest Games",
            "Recreation POS Charging, Cabana Monetization & Auxiliary Revenue Logging"
        ],
        "experience": [
            {
                "company": "Okada Manila",
                "location": "Para?aque City, Metro Manila",
                "position": "Senior Resort Recreation Supervisor",
                "duration": "October 2021 – Present",
                "bullets": [
                    "Direct daily guest recreation, pool club cabana operations, and children's indoor discovery center.",
                    "Supervise team of 16 recreation attendants, certified lifeguards, and kids club activity coordinators.",
                    "Increased pool cabana rental and activity package revenues by 24% through curated seasonal family bundles.",
                    "Maintained a flawless zero-drowning safety record across 250,000+ guest pool visits during tenure."
                ]
            },
            {
                "company": "Plantation Bay Resort & Spa",
                "location": "Mactan Island, Cebu",
                "position": "Recreation Team Leader",
                "duration": "April 2019 – September 2021",
                "bullets": [
                    "Coordinated kayak rentals, wall climbing, paddleboarding, and evening cultural dance entertainment for lagoon guests.",
                    "Inspected pool water chlorination logs and chemical balance reports twice daily with engineering.",
                    "Trained 12 summer activity interns in five-star children's safety and emergency poolside procedures."
                ]
            },
            {
                "company": "Crimson Resort & Spa",
                "location": "Lapu-Lapu City, Cebu",
                "position": "Pool & Water Sports Attendant",
                "duration": "May 2018 – March 2019",
                "bullets": [
                    "Welcomed guests to the beachfront infinity pool, distributed towels, and assisted with snorkeling gear fitment.",
                    "Reported broken loungers and maintained neat towel storage areas according to luxury resort SOPs."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Tourism and Resort Management",
            "institution": "University of San Carlos (USC) — Cebu City",
            "year": "2018"
        },
        "certifications": [
            {
                "title": "Certified Park and Recreation Professional (CPRP)",
                "issuer": "National Recreation and Park Association (NRPA)",
                "date": "November 2020"
            },
            {
                "title": "Lifeguard CPR / AED & Water Rescue First Responder",
                "issuer": "Philippine Red Cross National Headquarters",
                "date": "May 2022"
            },
            {
                "title": "Resort Kids Club & Family Activity Programming",
                "issuer": "Hospitality Leisure Development Council",
                "date": "July 2019"
            }
        ],
        "theme": {
            "p_dark": "#881337",     # Deep Rose Carmine
            "p_accent": "#0D9488",   # Warm Teal
            "p_light": "#FFF1F2",    # Rose Tint White
            "p_sub": "#BE123C",      # Vibrant Rose
            "p_gray": "#334155"
        },
        "discrepancy_coe_dates": "July 1, 2019 – September 20, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from July 2019 to September 2021, whereas resume claims start date of April 2019 (3-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Swimming Pool Sand Filtration and Backwashing",
        "discrepancy_cert_reason": "Resume claims 'Resort Kids Club & Family Activity Programming', but certificate certifies 'Foundations of Swimming Pool Sand Filtration and Backwashing'.",
        "incomplete_cert_name": "Certified Park and Recreation Professional (CPRP)",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 16. Vincent Paul Soriano (Scanned / Image-Only PDFs - OCR Benchmark)
    # --------------------------------------------------------------------------
    {
        "name": "Vincent Paul Soriano",
        "prefix": "Vincent_Paul_Soriano",
        "folder_name": "Vincent Paul Soriano - Hospitality Resume and Documents",
        "is_scanned_pdf": True,
        "target_position": "Hotel Night Auditor & Front Desk Operations Specialist",
        "phone": "+63 917 229 6504",
        "email": "vincent.soriano.nightaudit@outlook.ph",
        "address": "77 Padre Faura Street, Ermita, 1000 Manila, Philippines",
        "linkedin": "linkedin.com/in/vincent-soriano-nightaudit",
        "summary": (
            "Detail-obsessed, mathematically rigorous Hotel Night Auditor & Front Desk Operations Specialist with over 6 years "
            "of experience in overnight rooms division balancing, Opera PMS end-of-day rollover, credit card batch settlements, "
            "and late-night front desk duty management for luxury five-star hotels. Consistently maintained zero-discrepancy "
            "financial closures across 1,800+ audited shifts while ensuring nocturnal guest safety and resolving late-arrival folios."
        ),
        "skills": [
            "Opera Cloud PMS Night Audit Roll & End-of-Day (EOD) Batch Processing",
            "Daily Revenue Balancing: Room Charges, F&B Posting & City Ledger Accounts",
            "Credit Card Gateway Settlements, Pre-Authorization Audits & Chargeback Defense",
            "Room Rate Variance Auditing, House Use / Comp Reconciliation & Cashier Balancing",
            "Overnight Front Desk Management, Late Check-in Reception & Emergency Duty",
            "Daily Manager's Report (DMR) Generation & Executive Flash Financial Summaries",
            "Overnight Keycard Access Security, Lock System Auditing & Guest Privacy",
            "PCI-DSS Security Compliance, Cash Float Auditing & Safe Drop Verification"
        ],
        "experience": [
            {
                "company": "The Peninsula Manila",
                "location": "Makati City, Metro Manila",
                "position": "Lead Night Auditor & Duty Night Manager",
                "duration": "July 2021 – Present",
                "bullets": [
                    "Execute overnight financial audit and system rollover for a 469-room luxury hotel and 6 dining outlets.",
                    "Reconcile daily gross revenues averaging PHP 3.5M across rooms, banquets, and boutique outlets with zero variance.",
                    "Act as overnight manager-on-duty, resolving guest check-in inquiries and managing nocturnal property security.",
                    "Produce and distribute the Daily Manager's Operating Report to the General Manager and Finance Director by 5:30 AM."
                ]
            },
            {
                "company": "New World Manila Bay Hotel",
                "location": "Malate, Manila",
                "position": "Night Auditor & Rooms Cashier",
                "duration": "November 2018 – June 2021",
                "bullets": [
                    "Audited daily front office cashier envelopes, settled credit card batches, and verified room rate tax calculations.",
                    "Investigated rate override discrepancies and corrected billing folios prior to guest morning checkout rush.",
                    "Balanced casino cross-charging accounts and maintained accurate foreign currency exchange records."
                ]
            },
            {
                "company": "Manila Pavilion Hotel",
                "location": "Ermita, Manila",
                "position": "Front Desk Night Clerk",
                "duration": "June 2017 – October 2018",
                "bullets": [
                    "Processed late-night walk-ins, handled midnight guest requests, and delivered morning wake-up calls.",
                    "Balanced petty cash drawers and printed room occupancy forecasts for morning housekeeping teams."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Accountancy (Hospitality Financial Auditing)",
            "institution": "Pamantasan ng Lungsod ng Maynila (PLM) — Intramuros, Manila",
            "year": "2017"
        },
        "certifications": [
            {
                "title": "Certified Hospitality Accounting Executive (CHAE)",
                "issuer": "Hospitality Financial and Technology Professionals (HFTP)",
                "date": "October 2020"
            },
            {
                "title": "Opera PMS Night Audit End-of-Day Balancing Mastery",
                "issuer": "Oracle Hospitality Training Institute",
                "date": "August 2021"
            },
            {
                "title": "Hotel Fraud Detection & PCI-DSS Merchant Security",
                "issuer": "Philippine Hotel Financial Officers Council",
                "date": "April 2019"
            }
        ],
        "theme": {
            "p_dark": "#111827",     # Midnight Charcoal
            "p_accent": "#10B981",   # Terminal Emerald
            "p_light": "#F9FAFB",    # Clean Gray White
            "p_sub": "#1F2937",      # Slate Dark
            "p_gray": "#374151"
        },
        "discrepancy_coe_dates": "February 1, 2019 – June 20, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from February 2019 to June 2021, whereas resume claims start date of November 2018 (3-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Basic Paper Ledger Posting and Manual Journal Entry",
        "discrepancy_cert_reason": "Resume claims 'Hotel Fraud Detection & PCI-DSS Merchant Security', but certificate certifies 'Foundations of Basic Paper Ledger Posting and Manual Journal Entry'.",
        "incomplete_cert_name": "Certified Hospitality Accounting Executive (CHAE)",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    }
]

def main():
    print(f"Generating BATCH 3 (Candidates 12 to 16) into: {TARGET_BASE}")
    total_files = 0

    for idx, cand in enumerate(CANDIDATES_BATCH_3, 12):
        cand_dir = os.path.join(TARGET_BASE, cand["folder_name"])
        os.makedirs(cand_dir, exist_ok=True)
        prefix = cand["prefix"]
        print(f"\n[{idx}/16] Processing: {cand['name']} ({cand['target_position']})")
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
        total_files += len(files)

    print(f"\n=======================================================")
    print(f"COMPLETED: Generated {total_files} total files for Batch 3.")
    print(f"=======================================================")

if __name__ == "__main__":
    main()
