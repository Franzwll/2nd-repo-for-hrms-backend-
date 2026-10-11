# ==============================================================================
# HOSPITALITY RESUME & SUPPORTING DOCUMENT DATASET GENERATOR
# TARGET ROLES: Oxford Suites Makati Open Job Postings
# ==============================================================================
import os
import sys

# Ensure repository root and reference directories are in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
ref_dir = os.path.dirname(current_dir)
repo_root = os.path.dirname(ref_dir)
for p in [repo_root, ref_dir, current_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

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
)

TARGET_BASE = current_dir
os.makedirs(TARGET_BASE, exist_ok=True)

CANDIDATES = [
    # --------------------------------------------------------------------------
    # 1. Marco Antonio Reyes — Bartender & Mixologist
    # Target Job Post: Bartender.txt
    # --------------------------------------------------------------------------
    {
        "name": "Marco Antonio Reyes",
        "prefix": "Marco_Antonio_Reyes",
        "folder_name": "Marco Antonio Reyes - Bartender and Mixologist",
        "is_scanned_pdf": False,
        "target_position": "Bartender / Lead Mixologist",
        "phone": "+63 917 842 1953",
        "email": "marco.reyes.bar@outlook.ph",
        "address": "124 Jupiter St., Bel-Air, 1209 Makati City, Philippines",
        "linkedin": "linkedin.com/in/marco-reyes-bar",
        "summary": (
            "Dynamic and creative Lead Bartender & Mixologist with 5+ years of craft cocktail preparation, high-volume "
            "lounge operations, and premium beverage inventory management in boutique hotels and upscale Makati lounges. "
            "Proven expertise in signature cocktail creation, TESDA Bartending NC II standards, POS register accuracy, "
            "and bar sanitation. Skilled in delivering warm Filipino hospitality, optimizing bar profitability, and "
            "conducting pre-shift bar mise en place."
        ),
        "skills": [
            "Craft Cocktail Mixology, Signature Recipe Development & Beverage Staging",
            "Bar Sanitation, Glassware Sanitization & HACCP Hygiene Protocols",
            "Point of Sale (POS) Order Processing, Cash Handling & Tab Settlement",
            "Bar Inventory Control, Par Stock Auditing & Daily Mise en Place",
            "Responsible Alcohol Service & Guest Intoxication Assessment",
            "Beverage Upselling, Wine Presentation & Guest Relations",
            "TESDA Bartending Standards & Bar Station Turnover Flow",
            "Speed Pouring, Flair Bartending & High-Volume Service Execution"
        ],
        "experience": [
            {
                "company": "The Peninsula Manila",
                "location": "Makati City, Metro Manila",
                "position": "Lead Bartender & Mixologist",
                "duration": "September 2022 – Present",
                "bullets": [
                    "Oversee nightly bar operations and craft cocktail service at Salon de Ning accommodating 180+ nightly patrons.",
                    "Developed 8 signature Filipino-inspired craft cocktails, increasing specialty beverage revenue by 18% within 6 months.",
                    "Conduct daily bar stock inventory reconciliations and maintain optimal par levels for premium spirits and fresh garnishes.",
                    "Manage POS register transactions with 100% balancing accuracy and mentor junior barbacks on speed-pour techniques."
                ]
            },
            {
                "company": "Discovery Primea",
                "location": "Makati City, Metro Manila",
                "position": "Bartender",
                "duration": "January 2021 – August 2022",
                "bullets": [
                    "Prepared high-quality cocktails, artisanal mocktails, and wine services according to exact standard recipe sheets.",
                    "Maintained pristine bar counter sanitation, ice hygiene, and glass sterilization compliant with food safety codes.",
                    "Delivered engaging and warm guest interactions, consistently achieving positive TripAdvisor mentions for beverage service."
                ]
            },
            {
                "company": "City Garden Grand Hotel",
                "location": "Makati City, Metro Manila",
                "position": "Bar Attendant / Barback",
                "duration": "June 2019 – December 2020",
                "bullets": [
                    "Assisted head bartenders with liquor requisitions, juice preparation, fruit carving, and bar station replenishment.",
                    "Ensured continuous supply of clean glassware, garnishes, and clean bar towels during peak dinner hours."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Hotel and Restaurant Management",
            "institution": "Centro Escolar University (CEU) — Mendiola, Manila",
            "year": "2019"
        },
        "certifications": [
            {
                "title": "TESDA National Certificate II in Bartending (NC II)",
                "issuer": "Technical Education and Skills Development Authority (TESDA)",
                "date": "November 2021"
            },
            {
                "title": "Food Handler Safety & Responsible Beverage Service",
                "issuer": "Philippine Food Safety & Hygiene Council",
                "date": "August 2022"
            },
            {
                "title": "Mixology and Bar Management Specialist",
                "issuer": "Philippine Hospitality Development Center",
                "date": "March 2020"
            }
        ],
        "theme": {
            "p_dark": "#78350F",     # Deep Amber / Cognac
            "p_accent": "#D97706",   # Golden Amber
            "p_light": "#FEF3C7",    # Pale Warm Amber
            "p_sub": "#B45309",      # Warm Bronze
            "p_gray": "#374151"
        },
        "discrepancy_coe_dates": "April 1, 2021 – August 15, 2022",
        "discrepancy_coe_reason": "Official COE certifies employment from April 2021 to August 2022, whereas resume claims start date of January 2021 (3-month discrepancy).",
        "discrepancy_cert_course": "Foundations of Dining Room Service and Table Etiquette",
        "discrepancy_cert_reason": "Resume claims 'Mixology and Bar Management Specialist', but certificate certifies 'Foundations of Dining Room Service and Table Etiquette'.",
        "incomplete_cert_name": "Food Handler Safety & Responsible Beverage Service",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 2. Kristine Joy Bautista — Front Desk Receptionist & Guest Relations Officer
    # Target Job Posts: Front Desk Receptionist.txt & Guest Relations Officer.txt
    # --------------------------------------------------------------------------
    {
        "name": "Kristine Joy Bautista",
        "prefix": "Kristine_Joy_Bautista",
        "folder_name": "Kristine Joy Bautista - Front Desk Receptionist and Guest Relations Officer",
        "is_scanned_pdf": False,
        "target_position": "Front Desk Receptionist / Guest Relations Officer",
        "phone": "+63 918 392 6174",
        "email": "kristine.bautista.frontdesk@outlook.ph",
        "address": "312 Paseo de Roxas, Legaspi Village, 1229 Makati City, Philippines",
        "linkedin": "linkedin.com/in/kristine-bautista-frontdesk",
        "summary": (
            "Charming, articulate, and service-driven Front Desk Receptionist and Guest Relations Officer with 4+ years "
            "of front office experience in premier business hotels. Proficient in Opera PMS, express check-in/out protocols, "
            "VIP arrival arrangements, and proactive complaint recovery. Adept at driving rooms and amenity upselling "
            "while delivering authentic Filipino hospitality and maintaining meticulous guest folio accuracy across 24/7 "
            "shifting schedules."
        ),
        "skills": [
            "Front Office PMS Operations (Opera PMS, Micros Fidelio) & Folio Settlement",
            "Guest Check-In / Check-Out Execution & Queue Flow Management",
            "VIP Guest Arrival Staging, Amenity Setup & Executive Lounge Service",
            "Complaint Resolution, Service Recovery Protocols & Guest Satisfaction",
            "Front Desk Revenue Upselling (Room Category Upgrades, Breakfast Packages)",
            "Cash Handling, Foreign Currency Exchange & Shift Reconciliation",
            "Cross-Department Coordination with Housekeeping & Concierge",
            "TESDA Front Office Operations Standards & Telephone Etiquette"
        ],
        "experience": [
            {
                "company": "Makati Diamond Residences",
                "location": "Makati City, Metro Manila",
                "position": "Front Desk Receptionist & Guest Relations Officer",
                "duration": "October 2022 – Present",
                "bullets": [
                    "Process 60+ daily guest arrivals and departures using Opera PMS with 99.4% billing and credit card transaction accuracy.",
                    "Coordinate personalized check-ins for corporate VIPs, long-stay residents, and loyalty program members.",
                    "Achieved PHP 420,000 in incremental revenue during Q3 2023 through proactive suite upgrades and breakfast upselling.",
                    "Liaise directly with Housekeeping floor supervisors to expedite room turnover for early arrivals."
                ]
            },
            {
                "company": "New World Makati Hotel",
                "location": "Makati City, Metro Manila",
                "position": "Guest Service Agent",
                "duration": "February 2021 – September 2022",
                "bullets": [
                    "Welcomed domestic and international travelers, managed phone reservations, and handled concierge inquiries.",
                    "Resolved guest room placement and noise complaints with immediate on-the-spot service recovery gifts.",
                    "Managed cash float balancing and processed daily shift turnover reports with zero variance."
                ]
            },
            {
                "company": "Valero Grand Suites by Swiss-Belhotel",
                "location": "Makati City, Metro Manila",
                "position": "Front Office Intern / Trainee",
                "duration": "July 2019 – January 2020",
                "bullets": [
                    "Escorted arriving VIP guests to rooms, assisted with luggage handling, and maintained lobby presentation.",
                    "Managed message distribution and answered switchboard telephone calls adhering to luxury brand voice."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Tourism Management",
            "institution": "University of Santo Tomas (UST) — España, Manila",
            "year": "2020"
        },
        "certifications": [
            {
                "title": "TESDA National Certificate II in Front Office Services (NC II)",
                "issuer": "Technical Education and Skills Development Authority (TESDA)",
                "date": "August 2021"
            },
            {
                "title": "Service Excellence and VIP Guest Relations Certification",
                "issuer": "Philippine Hospitality Development Center",
                "date": "May 2022"
            },
            {
                "title": "Opera PMS Front Desk Operations Mastery",
                "issuer": "Hospitality Technology Training Institute",
                "date": "January 2021"
            }
        ],
        "theme": {
            "p_dark": "#1E3A8A",     # Royal Blue
            "p_accent": "#2563EB",   # Vibrant Blue
            "p_light": "#EFF6FF",    # Soft Ice Blue
            "p_sub": "#1D4ED8",      # Classic Navy Blue
            "p_gray": "#374151"
        },
        "discrepancy_coe_dates": "May 1, 2021 – September 15, 2022",
        "discrepancy_coe_reason": "Official COE certifies employment from May 2021 to September 2022, whereas resume claims start date of February 2021 (3-month discrepancy).",
        "discrepancy_cert_course": "Basic Reservations & Call Center Telephone Etiquette",
        "discrepancy_cert_reason": "Resume claims 'Opera PMS Front Desk Operations Mastery', but certificate certifies 'Basic Reservations & Call Center Telephone Etiquette'.",
        "incomplete_cert_name": "Service Excellence and VIP Guest Relations Certification",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 3. Eduardo Jose Montemayor — Hotel General Manager
    # Target Job Post: General Manager.txt
    # --------------------------------------------------------------------------
    {
        "name": "Eduardo Jose Montemayor",
        "prefix": "Eduardo_Jose_Montemayor",
        "folder_name": "Eduardo Jose Montemayor - Hotel General Manager",
        "is_scanned_pdf": False,
        "target_position": "General Manager / Hotel General Manager",
        "phone": "+63 917 119 4820",
        "email": "eduardo.montemayor.gm@outlook.ph",
        "address": "52 Ayala Avenue, Urdaneta Village, 1225 Makati City, Philippines",
        "linkedin": "linkedin.com/in/eduardo-montemayor-gm",
        "summary": (
            "Visionary, high-impact Hotel General Manager with 12+ years of comprehensive executive leadership across "
            "rooms division, food & beverage, and hotel finance in premier business hotels. Proven success in driving "
            "RevPAR growth, executing multi-million peso operational budgets, enforcing strict regulatory and Food Handler "
            "compliance, and mentoring executive committees. Renowned for championing genuine Filipino hospitality while "
            "optimizing bottom-line GOP margins."
        ),
        "skills": [
            "Full-Scope Hotel General Management & Executive Committee Leadership",
            "Profit & Loss (P&L) Oversight, Annual CapEx/OpEx Budgeting & GOP Optimization",
            "Hotel Revenue Management, RevPAR Growth Strategy & Yield Maximization",
            "Regulatory Safety Compliance, Fire Safety Codes & Food Safety Sanitation",
            "Cross-Department Operational Alignment (Rooms, F&B, Engineering, HR)",
            "Executive Guest Escalation Resolution & VIP Stakeholder Relations",
            "Workforce Talent Development, Succession Planning & Service Culture",
            "Hotel Property Management Systems & Advanced Hospitality Analytics"
        ],
        "experience": [
            {
                "company": "Somerset Millennium Makati",
                "location": "Makati City, Metro Manila",
                "position": "General Manager",
                "duration": "January 2021 – Present",
                "bullets": [
                    "Direct full-property operations for a 147-room premier serviced residence and business hotel with 110 employees.",
                    "Increased annual Gross Operating Profit (GOP) by 14.2% while achieving a 93.8% guest satisfaction rating across major OTAs.",
                    "Championed hotel-wide sustainability and regulatory compliance, achieving 100% pass rates in city safety audits.",
                    "Spearheaded strategic direct booking campaigns, boosting direct web bookings by 22% year-over-year."
                ]
            },
            {
                "company": "City Garden Hotel Makati",
                "location": "Makati City, Metro Manila",
                "position": "Resident Manager / Operations Manager",
                "duration": "March 2017 – December 2020",
                "bullets": [
                    "Managed daily operations across Front Office, Housekeeping, Engineering, and Food & Beverage divisions.",
                    "Led hotel pandemic response and health certification protocols with zero safety violations.",
                    "Re-engineered F&B banquet and room service offerings, reducing operational food waste by 11%."
                ]
            },
            {
                "company": "The Picasso Boutique Serviced Residences",
                "location": "Makati City, Metro Manila",
                "position": "Director of Rooms",
                "duration": "August 2013 – February 2017",
                "bullets": [
                    "Supervised Front Office, Concierge, Housekeeping, and Guest Relations teams across 136 designer suites.",
                    "Maintained room occupancy above 84% through dynamic corporate rate negotiations with multinational embassies."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Business Administration major in Hospitality Management",
            "institution": "De La Salle University (DLSU) — Taft Avenue, Manila",
            "year": "2011"
        },
        "certifications": [
            {
                "title": "Certified Hotel Administrator (CHA)",
                "issuer": "American Hotel & Lodging Educational Institute (AHLEI)",
                "date": "November 2020"
            },
            {
                "title": "Food Handler Safety Oversight & Compliance Certification",
                "issuer": "Philippine Food Safety & Hygiene Council",
                "date": "June 2021"
            },
            {
                "title": "Advanced Hospitality Financial Management & Revenue Optimization",
                "issuer": "Asian Institute of Management / PHDC",
                "date": "April 2018"
            }
        ],
        "theme": {
            "p_dark": "#0F172A",     # Executive Navy / Slate
            "p_accent": "#0284C7",   # High-Tech Cerulean Blue
            "p_light": "#F8FAFC",    # Crisp White Slate
            "p_sub": "#1E293B",      # Deep Slate Blue
            "p_gray": "#334151"
        },
        "discrepancy_coe_dates": "June 1, 2017 – December 15, 2020",
        "discrepancy_coe_reason": "Official COE certifies employment from June 2017 to December 2020, whereas resume claims start date of March 2017 (3-month discrepancy).",
        "discrepancy_cert_course": "Executive Essentials of Hotel Purchasing and Vendor Negotiations",
        "discrepancy_cert_reason": "Resume claims 'Advanced Hospitality Financial Management & Revenue Optimization', but certificate certifies 'Executive Essentials of Hotel Purchasing and Vendor Negotiations'.",
        "incomplete_cert_name": "Food Handler Safety Oversight & Compliance Certification",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 4. Katherine Ann Mendoza — HR & Administration Manager
    # Target Job Posts: HR & Administration Manager.txt & HR Assistant.txt
    # --------------------------------------------------------------------------
    {
        "name": "Katherine Ann Mendoza",
        "prefix": "Katherine_Ann_Mendoza",
        "folder_name": "Katherine Ann Mendoza - HR and Administration Manager",
        "is_scanned_pdf": False,
        "target_position": "HR & Administration Manager",
        "phone": "+63 919 448 3209",
        "email": "katherine.mendoza.hr@outlook.ph",
        "address": "84 Legaspi St., San Lorenzo, 1223 Makati City, Philippines",
        "linkedin": "linkedin.com/in/katherine-mendoza-hr",
        "summary": (
            "Accomplished, empathetic HR & Administration Manager with 7+ years of human resources leadership in premier "
            "hospitality and corporate lodging properties. Expert in end-to-end talent acquisition, DOLE labor law compliance, "
            "automated payroll administration, 201-file governance, and structured employee engagement. Holds certified "
            "First Aid credentials and is passionate about championing Filipino hospitality values while sustaining high "
            "employee retention."
        ),
        "skills": [
            "Full-Lifecycle Talent Acquisition & Hospitality Recruitment Strategy",
            "Philippine Labor Code Compliance, DOLE Reporting & Statutory Benefits",
            "Payroll Administration Support, Timekeeping & Compensation Structuring",
            "Employee Relations, Conflict Mediation & Grievance Handling",
            "201 File Management, HRIS Records Documentation & Audit Readiness",
            "Hospitality Onboarding & Service Standards Training Facilitation",
            "First Aid & Occupational Safety and Health (OSH) Committee Leadership",
            "Administrative Office Operations, Procurement & Vendor Management"
        ],
        "experience": [
            {
                "company": "Fairmont Makati",
                "location": "Makati City, Metro Manila",
                "position": "HR & Administration Assistant Manager",
                "duration": "August 2021 – Present",
                "bullets": [
                    "Oversee talent acquisition for 180+ hotel staff across Front Office, Housekeeping, Culinary, and Engineering divisions.",
                    "Maintain 100% compliance on 201 employee files, DOLE mandatory reporting, and SSS/PhilHealth/Pag-IBIG remittances.",
                    "Spearheaded employee engagement and wellness programs, reducing annual voluntary staff turnover by 16%.",
                    "Coordinate bi-monthly payroll audit reconciliations with Finance, resolving timekeeping discrepancies promptly."
                ]
            },
            {
                "company": "Berjaya Makati Hotel",
                "location": "Makati City, Metro Manila",
                "position": "Human Resources Supervisor",
                "duration": "January 2019 – July 2021",
                "bullets": [
                    "Managed end-to-end recruitment pipelines, interviewed hospitality applicants, and issued employment offers.",
                    "Conducted employee counseling, managed disciplinary grievance hearings, and ensured fair labor code adherence.",
                    "Organized new-hire orientation sessions focusing on brand standards and guest service hospitality excellence."
                ]
            },
            {
                "company": "St. Giles Southgate Hotel",
                "location": "Makati City, Metro Manila",
                "position": "HR Assistant",
                "duration": "July 2017 – December 2018",
                "bullets": [
                    "Administered 201 file archiving, issued Certificates of Employment (COE), and tracked staff attendance logs.",
                    "Facilitated candidate interview scheduling and coordinated pre-employment medical examinations."
                ]
            }
        ],
        "education": {
            "degree": "Bachelor of Science in Psychology",
            "institution": "Ateneo de Manila University (ADMU) — Loyola Heights, Quezon City",
            "year": "2017"
        },
        "certifications": [
            {
                "title": "Certified Human Resources Professional (CHRP)",
                "issuer": "Human Resource Management Philippines / HRCI",
                "date": "October 2021"
            },
            {
                "title": "Standard First Aid and Basic Life Support (BLS)",
                "issuer": "Philippine Red Cross",
                "date": "September 2022"
            },
            {
                "title": "Philippine Labor Law and Industrial Relations Mastery",
                "issuer": "Philippine Hospitality Development Center",
                "date": "May 2019"
            }
        ],
        "theme": {
            "p_dark": "#4A0E4E",     # Deep Royal Plum
            "p_accent": "#9333EA",   # Rich Purple
            "p_light": "#FAF5FF",    # Soft Lavender White
            "p_sub": "#6B21A8",      # Vibrant Plum
            "p_gray": "#374151"
        },
        "discrepancy_coe_dates": "March 1, 2019 – July 15, 2021",
        "discrepancy_coe_reason": "Official COE certifies employment from March 2019 to July 2021, whereas resume claims start date of January 2019 (2-month discrepancy).",
        "discrepancy_cert_course": "Fundamentals of Corporate Payroll and Tax Calculation",
        "discrepancy_cert_reason": "Resume claims 'Philippine Labor Law and Industrial Relations Mastery', but certificate certifies 'Fundamentals of Corporate Payroll and Tax Calculation'.",
        "incomplete_cert_name": "Standard First Aid and Basic Life Support (BLS)",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 5. Arvin Keith Del Rosario — Line Cook & Station Chef
    # Target Job Post: Line Cook.txt
    # --------------------------------------------------------------------------
    {
        "name": "Arvin Keith Del Rosario",
        "prefix": "Arvin_Keith_Del_Rosario",
        "folder_name": "Arvin Keith Del Rosario - Line Cook and Station Chef",
        "is_scanned_pdf": False,
        "target_position": "Line Cook / Station Chef",
        "phone": "+63 917 520 8831",
        "email": "arvin.delrosario.cook@outlook.ph",
        "address": "67 Chino Roces Avenue, Bangkal, 1233 Makati City, Philippines",
        "linkedin": "linkedin.com/in/arvin-delrosario-cook",
        "summary": (
            "Energetic, precision-focused Line Cook with 4+ years of culinary experience in high-volume hotel banquet kitchens "
            "and full-service dining establishments. Certified in TESDA Cookery NC II and HACCP food safety standards. "
            "Experienced in hot and cold line stations, high-speed mise en place, sauté and grill techniques, and meticulous "
            "plate presentation under high-pressure meal services."
        ),
        "skills": [
            "Hot Line Culinary Production (Sauté, Grill, Roast, Fry Stations)",
            "Kitchen Mise en Place Speed & Prep Station Organization",
            "Recipe Standardization, Food Portioning & Plating Aesthetics",
            "HACCP Food Hygiene, Temperature Danger Zone Controls & Kitchen Sanitation",
            "Station Ingredient Inventory Par Auditing & Perishable Stock Rotation (FIFO)",
            "High-Volume Banquet & A La Carte Peak Service Execution",
            "Commercial Kitchen Equipment Operation & Knife Skills Mastery",
            "TESDA Cookery Standards & Cross-Contamination Prevention"
        ],
        "experience": [
            {
                "company": "I'M Hotel Makati",
                "location": "Makati City, Metro Manila",
                "position": "Line Cook / Station Chef",
                "duration": "November 2022 – Present",
                "bullets": [
                    "Prepare and execute sauté and grill station orders for an upscale 160-seat rooftop dining restaurant and room service.",
                    "Conduct morning mise en place prep, ingredient slicing, and sauce reductions adhering strictly to head chef recipes.",
                    "Maintain immaculate station cleanliness and food sanitation, achieving zero health audit infractions.",
                    "Monitor walk-in chiller temperatures and enforce First-In, First-Out (FIFO) stock rotation for premium meats and seafood."
                ]
            },
            {
                "company": "Dusit Thani Manila",
                "location": "Makati City, Metro Manila",
                "position": "Commis Chef",
                "duration": "January 2021 – October 2022",
                "bullets": [
                    "Prepared buffet replenishment and banquet production batches catering for events up to 400 attendees.",
                    "Maintained safe knife handling, station sanitization, and daily trash removal following hotel kitchen safety codes.",
                    "Assisted pastry and cold kitchen sections during high-volume Sunday brunch services."
                ]
            },
            {
                "company": "Romulo Café Makati",
                "location": "Makati City, Metro Manila",
                "position": "Kitchen Prep Assistant",
                "duration": "July 2019 – December 2020",
                "bullets": [
                    "Peeled, chopped, portioned, and weighed ingredients for traditional Filipino specialty dishes.",
                    "Washed, sanitized, and stored heavy cookware, utensils, and service equipment."
                ]
            }
        ],
        "education": {
            "degree": "Associate Degree in Culinary Arts and Kitchen Management",
            "institution": "De La Salle-College of Saint Benilde (DLS-CSB) — Malate, Manila",
            "year": "2019"
        },
        "certifications": [
            {
                "title": "TESDA National Certificate II in Cookery (NC II)",
                "issuer": "Technical Education and Skills Development Authority (TESDA)",
                "date": "September 2021"
            },
            {
                "title": "ServSafe Food Handler & Kitchen Sanitation Certificate",
                "issuer": "Philippine Food Safety & Hygiene Council",
                "date": "June 2022"
            },
            {
                "title": "Culinary Knife Skills and Modern Plating Workshop",
                "issuer": "Philippine Hospitality Development Center",
                "date": "February 2020"
            }
        ],
        "theme": {
            "p_dark": "#7F1D1D",     # Deep Brick Red
            "p_accent": "#DC2626",   # Vibrant Crimson
            "p_light": "#FEF2F2",    # Soft Rose White
            "p_sub": "#991B1B",      # Dark Crimson
            "p_gray": "#374151"
        },
        "discrepancy_coe_dates": "April 1, 2021 – October 15, 2022",
        "discrepancy_coe_reason": "Official COE certifies employment from April 2021 to October 2022, whereas resume claims start date of January 2021 (3-month discrepancy).",
        "discrepancy_cert_course": "Fundamentals of Basic Western Bakery and Pastry Arts",
        "discrepancy_cert_reason": "Resume claims 'Culinary Knife Skills and Modern Plating Workshop', but certificate certifies 'Fundamentals of Basic Western Bakery and Pastry Arts'.",
        "incomplete_cert_name": "ServSafe Food Handler & Kitchen Sanitation Certificate",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 6. John Paul Mercado — Restaurant Server & Food & Beverage Attendant
    # Target Job Post: Restaurant Server).txt
    # --------------------------------------------------------------------------
    {
        "name": "John Paul Mercado",
        "prefix": "John_Paul_Mercado",
        "folder_name": "John Paul Mercado - Restaurant Server and Food and Beverage Attendant",
        "is_scanned_pdf": False,
        "target_position": "Restaurant Server / Food & Beverage Attendant",
        "phone": "+63 919 283 5519",
        "email": "johnpaul.mercado.server@outlook.ph",
        "address": "93 Evangelista St., Bangkal, 1233 Makati City, Philippines",
        "linkedin": "linkedin.com/in/johnpaul-mercado-server",
        "summary": (
            "Courteous, energetic, and detail-oriented Restaurant Server and Food & Beverage Attendant with 3+ years "
            "of front-of-house dining experience in renowned Makati hotel restaurants. Proven capability in table greeting, "
            "order precision, tray service, POS billing, and handling guest feedback with warm Filipino hospitality. "
            "Known for impeccable grooming, fast table turnover, and proactive beverage recommendations."
        ),
        "skills": [
            "Sequence of Table Service (American, English & French Dining Styles)",
            "Guest Greeting, Seating Etiquette & Warm Filipino Hospitality Delivery",
            "Point of Sale (POS) Order Entry, Bill Settlement & Split-Payment Handling",
            "Menu Knowledge, Daily Special Upselling & Dietary Allergy Awareness",
            "Dining Room Table Grooming, Crumbing & Rapid Table Turnovers",
            "Food & Beverage Tray Carrying Technique & Spillage Prevention",
            "Guest Complaint De-Escalation & Timely Service Recovery Relay",
            "TESDA Food and Beverage Services NC II Standards Compliance"
        ],
        "experience": [
            {
                "company": "Holiday Inn & Suites Makati",
                "location": "Makati City, Metro Manila",
                "position": "Restaurant Server / Dining Attendant",
                "duration": "July 2022 – Present",
                "bullets": [
                    "Provide sequence of service to 70+ seated guests per shift in an all-day dining restaurant and terrace lounge.",
                    "Memorized 45+ food and beverage menu items, including allergen warnings and chef specials, boosting average check size by 12%.",
                    "Enter food orders swiftly into Micros POS and relay special dietary requests directly to kitchen station chefs.",
                    "Coordinate table clearing and resetting within 90 seconds to minimize lobby guest waiting queues."
                ]
            },
            {
                "company": "The Mini Suites Eton Tower Makati",
                "location": "Makati City, Metro Manila",
                "position": "Food & Beverage Attendant",
                "duration": "November 2020 – June 2022",
                "bullets": [
                    "Greeted guests warmly, seated patrons, and provided prompt water and bread basket service.",
                    "Conducted daily pre-shift silver polishing, napkin folding, and dining station condiment replenishment.",
                    "Processed guest billing via credit card terminals and cash registers with zero cashier discrepancies."
                ]
            },
            {
                "company": "Conti's Bakeshop & Restaurant Makati",
                "location": "Makati City, Metro Manila",
                "position": "Dining Server Assistant",
                "duration": "August 2019 – October 2020",
                "bullets": [
                    "Assisted senior waitstaff with food running, table clearing, and water glass refilling.",
                    "Maintained dining room floor cleanliness and sanitized tables between customer seatings."
                ]
            }
        ],
        "education": {
            "degree": "Associate in Hospitality and Food Service Management",
            "institution": "Pamantasan ng Lungsod ng Maynila (PLM) — Intramuros, Manila",
            "year": "2019"
        },
        "certifications": [
            {
                "title": "TESDA National Certificate II in Food and Beverage Services (NC II)",
                "issuer": "Technical Education and Skills Development Authority (TESDA)",
                "date": "March 2021"
            },
            {
                "title": "Food Handler Health & Sanitation Certificate",
                "issuer": "Philippine Food Safety & Hygiene Council",
                "date": "May 2022"
            },
            {
                "title": "Hospitality Dining Etiquette and Five-Star Guest Service",
                "issuer": "Philippine Hospitality Development Center",
                "date": "September 2020"
            }
        ],
        "theme": {
            "p_dark": "#7C2D12",     # Warm Terracotta
            "p_accent": "#EA580C",   # Vibrant Rust Orange
            "p_light": "#FFF7ED",    # Soft Cream White
            "p_sub": "#9A3412",      # Deep Terracotta
            "p_gray": "#374151"
        },
        "discrepancy_coe_dates": "February 1, 2021 – June 15, 2022",
        "discrepancy_coe_reason": "Official COE certifies employment from February 2021 to June 2022, whereas resume claims start date of November 2020 (3-month discrepancy).",
        "discrepancy_cert_course": "Basic Barista Skills and Espresso Machine Maintenance",
        "discrepancy_cert_reason": "Resume claims 'Hospitality Dining Etiquette and Five-Star Guest Service', but certificate certifies 'Basic Barista Skills and Espresso Machine Maintenance'.",
        "incomplete_cert_name": "Food Handler Health & Sanitation Certificate",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    },

    # --------------------------------------------------------------------------
    # 7. Maricel Santos Dizon — Housekeeping Attendant
    # Target Job Post: Housekeeping Attendant.txt & Housekeeping.txt
    # --------------------------------------------------------------------------
    {
        "name": "Maricel Santos Dizon",
        "prefix": "Maricel_Santos_Dizon",
        "folder_name": "Maricel Santos Dizon - Housekeeping Attendant",
        "is_scanned_pdf": False,
        "target_position": "Housekeeping Attendant",
        "phone": "+63 918 672 9014",
        "email": "maricel.dizon.housekeeping@outlook.ph",
        "address": "18 Kalayaan Avenue, Guadalupe Nuevo, 1212 Makati City, Philippines",
        "linkedin": "linkedin.com/in/maricel-dizon-housekeeping",
        "summary": (
            "Dedicated, energetic, and detail-driven Housekeeping Attendant with 4+ years of hands-on experience servicing "
            "luxury suites, guest rooms, and hotel public areas. Certified in TESDA Housekeeping NC II. Highly adept at "
            "bed making, deep bathroom sanitization, linen replenishment, chemical dilution safety, and swift guestroom "
            "turnover. Committed to upholding five-star cleanliness standards, defect reporting, and courteous guest service."
        ),
        "skills": [
            "Luxury Guestroom Make-Up, Bed Making & Triple-Sheeting Techniques",
            "Bathroom Deep Cleaning, Fixture Sanitization & Grout Descaling",
            "Housekeeping Caddy & Linen Trolley Par Stock Organization",
            "Safe Chemical Dilution, MSDS Protocols & PPE Safety Compliance",
            "Lost & Found Procedure Adherence & Item Custody Registration",
            "Defect Identification & Maintenance Work Order Logging",
            "Turn-Down Evening Service & Personalized Guest Amenity Replenishment",
            "TESDA Housekeeping NC II Standards & Waste Segregation"
        ],
        "experience": [
            {
                "company": "Ascott Makati",
                "location": "Makati City, Metro Manila",
                "position": "Housekeeping Room Attendant",
                "duration": "August 2022 – Present",
                "bullets": [
                    "Clean, sanitize, and dress 16-18 luxury serviced apartments daily adhering to stringent 35-point hygiene checklists.",
                    "Execute flawless bed making, linen replacement, and bathroom disinfection within 25 minutes per standard room.",
                    "Restock complimentary vanity amenities, bathrobes, tea/coffee sets, and fresh drinking water.",
                    "Log plumbing and air-conditioning maintenance defects immediately via handheld mobile housekeeping terminals."
                ]
            },
            {
                "company": "BSA Tower Serviced Residences",
                "location": "Makati City, Metro Manila",
                "position": "Housekeeping Attendant",
                "duration": "October 2020 – July 2022",
                "bullets": [
                    "Maintained cleanliness across guest corridors, service elevator vestibules, and assigned floor linen pantries.",
                    "Logged 100% of discovered guest lost-and-found belongings with security dispatch following chain of custody.",
                    "Managed chemical cleaning agents with zero chemical spill incidents or safety violations."
                ]
            },
            {
                "company": "Red Planet Hotel Makati",
                "location": "Makati City, Metro Manila",
                "position": "Public Area Cleaner",
                "duration": "May 2019 – September 2020",
                "bullets": [
                    "Cleaned and polished lobby marble floors, elevator tracks, and public restroom facilities.",
                    "Handled guest requests for extra pillows, ironing boards, and towels with prompt courtesy."
                ]
            }
        ],
        "education": {
            "degree": "Associate in Hotel and Restaurant Services",
            "institution": "Polytechnic University of the Philippines (PUP) — Sta. Mesa, Manila",
            "year": "2019"
        },
        "certifications": [
            {
                "title": "TESDA National Certificate II in Housekeeping (NC II)",
                "issuer": "Technical Education and Skills Development Authority (TESDA)",
                "date": "January 2021"
            },
            {
                "title": "Hospitality Chemical Safety and Sanitation Compliance",
                "issuer": "Philippine Safety & Hygiene Council",
                "date": "November 2021"
            },
            {
                "title": "Professional Guestroom Cleaning and Inspection Standards",
                "issuer": "Philippine Hospitality Development Center",
                "date": "June 2020"
            }
        ],
        "theme": {
            "p_dark": "#134E4A",     # Deep Forest Teal
            "p_accent": "#0D9488",   # Vibrant Fresh Teal
            "p_light": "#F0FDFA",    # Soft Mint White
            "p_sub": "#0F766E",      # Mid Teal
            "p_gray": "#374151"
        },
        "discrepancy_coe_dates": "January 1, 2021 – July 15, 2022",
        "discrepancy_coe_reason": "Official COE certifies employment from January 2021 to July 2022, whereas resume claims start date of October 2020 (3-month discrepancy).",
        "discrepancy_cert_course": "Basic Commercial Carpet Shampooing and Floor Polishing Techniques",
        "discrepancy_cert_reason": "Resume claims 'Professional Guestroom Cleaning and Inspection Standards', but certificate certifies 'Basic Commercial Carpet Shampooing and Floor Polishing Techniques'.",
        "incomplete_cert_name": "Hospitality Chemical Safety and Sanitation Compliance",
        "incomplete_reason": "Recipient name area is severed/torn off in the uploaded scan, preventing candidate verification."
    }
]


def build_candidate_ground_truth(cand, out_path):
    pdf_status_note = "SCANNED / IMAGE-ONLY (No digital text layer, forces OCR processing)" if cand.get("is_scanned_pdf") else "DIGITAL VECTOR TEXT (Directly extractable without OCR)"
    
    content = f"""================================================================================
HOSPITALITY RESUME & SUPPORTING DOCUMENT BENCHMARK DATASET (SINGLE PROFILE)
GROUND TRUTH & VERIFICATION REFERENCE
================================================================================

DOCUMENT IDENTIFIER: Actual Info in the Resume of {cand['name']}.txt
TARGET CANDIDATE: {cand['name']}
TARGET ROLE: {cand['target_position']}
EXTRACTION MODE: {pdf_status_note}
TOTAL DATASET FILES: 13 Files (6 Resumes, 6 Supporting Documents, 1 Ground Truth)
DATE GENERATED: 2026-10-05

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
   • {cand['experience'][0]['bullets'][0]}
   • {cand['experience'][0]['bullets'][1]}
   • {cand['experience'][0]['bullets'][2]}
   • {cand['experience'][0]['bullets'][3]}

2. Employer:     {cand['experience'][1]['company']}
   Location:     {cand['experience'][1]['location']}
   Job Title:    {cand['experience'][1]['position']}
   Duration:     {cand['experience'][1]['duration']}
   Tenure Type:  Previous Employment
   Responsibilities & Achievements:
   • {cand['experience'][1]['bullets'][0]}
   • {cand['experience'][1]['bullets'][1]}
   • {cand['experience'][1]['bullets'][2]}

3. Employer:     {cand['experience'][2]['company']}
   Location:     {cand['experience'][2]['location']}
   Job Title:    {cand['experience'][2]['position']}
   Duration:     {cand['experience'][2]['duration']}
   Tenure Type:  Historical Employment
   Responsibilities & Achievements:
   • {cand['experience'][2]['bullets'][0]}
   • {cand['experience'][2]['bullets'][1]}

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


def main():
    print(f"Generating 7 new candidate datasets for current open job posts into: {TARGET_BASE}")
    total_files_generated = 0

    for idx, cand in enumerate(CANDIDATES, 1):
        cand_dir = os.path.join(TARGET_BASE, cand["folder_name"])
        os.makedirs(cand_dir, exist_ok=True)
        prefix = cand["prefix"]
        print(f"\n[{idx}/7] Processing: {cand['name']} ({cand['target_position']})")
        print(f"       Folder: {cand['folder_name']}")
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
    print(f"COMPLETED: Generated {total_files_generated} total files across {len(CANDIDATES)} candidate folders.")
    print(f"Target location: {TARGET_BASE}")
    print(f"=======================================================")


if __name__ == "__main__":
    main()
