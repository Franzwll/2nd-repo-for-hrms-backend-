"""Unit tests for resume work-history / skills / certs / education extraction.

Covers the failure modes behind inaccurate Resume-vs-Documents matching:
duty-sentence fragments filed as titles ("codes", "replenishment",
"techniques"), locations filed as titles/companies, stacked vertical
layouts (Company / Date / Title / Location each on its own row, as DOCX
exports produce), and cross-period pairing of dates.
"""
import unittest

from app.services import entity_extraction
from app.services import reference_data as refdata


STACKED_RESUME_TEXT = """MARCO ANTONIO REYES
BARTENDER / LEAD MIXOLOGIST

WORK EXPERIENCE

The Peninsula Manila

September 2022 - Present

Lead Bartender & Mixologist

Makati City, Metro Manila

Oversee nightly bar operations and craft cocktail service at Salon de Ning accommodating 180+ nightly patrons.
Developed 8 signature Filipino-inspired craft cocktails, increasing specialty beverage revenue by 18% within 6 months.
Conduct daily bar stock inventory reconciliations and maintain optimal par levels for premium spirits.
Manage POS register transactions with 100% balancing accuracy and mentor junior barbacks on speed-pour techniques.

Discovery Primea

January 2021 - August 2022

Bartender

Makati City, Metro Manila

Prepared high-quality cocktails, artisanal mocktails, and wine services according to exact standard recipe sheets.
Maintained pristine bar counter sanitation, ice hygiene, and glass sterilization compliant with food safety codes.
Delivered engaging and warm guest interactions, consistently achieving positive TripAdvisor mentions for beverage service.

City Garden Grand Hotel

June 2019 - December 2020

Bar Attendant / Barback

Makati City, Metro Manila

Assisted head bartenders with liquor requisitions, juice preparation, fruit carving, and bar station replenishment.
Ensured continuous supply of clean glassware, garnishes, and clean bar towels during peak dinner hours.
"""

INLINE_RESUME_TEXT = """MARCO ANTONIO REYES

WORK EXPERIENCE
The Peninsula Manila September 2022 - Present
Lead Bartender & Mixologist Makati City, Metro Manila
Oversee nightly bar operations and craft cocktail service.
Discovery Primea January 2021 - August 2022
Bartender Makati City, Metro Manila
Prepared high-quality cocktails and wine services.
"""


JOSHUA_STACKED_RESUME_TEXT = """JOSHUA DAVID RAMOS
Mandaluyong City, Metro Manila
+63 920 418 7329
joshua.ramos.culinary@gmail.com

WORK EXPERIENCE

SM Supermarket - Megamall

September 2022 - Present

Sales Associate & Grocery Crew

Mandaluyong City, Metro Manila

Assist supermarket customers with grocery inquiries and price verifications.

Replenish grocery aisle shelves and arrange product facing.

Jollibee Food Corp - Shaw Blvd

January 2021 - August 2022

Counter Crew & Dining Attendant

Operated POS cash register and dispensed change accurately.

Wiped dining tables and maintained clean condiment stations.

7-Eleven Convenience Store

May 2019 - December 2020

Cashier & Store Clerk

Processed fast-paced cashier transactions and cash deposits.

Received delivery crates and organized stockroom storage.

EDUCATION

High School Diploma
Jose Rizal University
Year: 2019
"""

INLINE_DIGIT_AND_ROLE_TEXT = """ARVIN KEITH DEL ROSARIO

WORK EXPERIENCE

I'M Hotel Makati November 2022 - Present

Line Cook / Station Chef Makati City, Metro Manila

Prepare and execute station orders for a rooftop dining restaurant.

Romulo Cafe Makati July 2019 - December 2020

Kitchen Prep Assistant Makati City, Metro Manila

Peeled, chopped, portioned, and weighed ingredients.

7-Eleven Convenience Store May 2019 - December 2020

Cashier & Store Clerk Makati City, Metro Manila

Processed cashier transactions and handled cash deposits.
"""

INLINE_GENERIC_ORG_TEXT = """RONALD BRIAN TAN

WORK EXPERIENCE

Carrier Concepcion Facility Services June 2017 - February 2019

Electro-Mechanical Technician Pasig City, Metro Manila

Performed scheduled compressor overhauls and filter cleanings.

EDUCATION

Bachelor of Science in Mechanical Engineering
"""


def _extract(text):
    extractor = entity_extraction.get_extractor()
    return extractor.extract(text, None)


class TestWorkHistoryExtraction(unittest.TestCase):

    def test_stacked_layout_entries_pair_correctly(self):
        out = _extract(STACKED_RESUME_TEXT)
        history = out["work_history"]
        self.assertEqual(len(history), 3)
        self.assertEqual(history[0]["job_title"], "Lead Bartender & Mixologist")
        self.assertEqual(history[0]["company"], "The Peninsula Manila")
        self.assertEqual(history[0]["period"], "September 2022 - Present")
        self.assertEqual(history[1]["job_title"], "Bartender")
        self.assertEqual(history[1]["company"], "Discovery Primea")
        self.assertEqual(history[1]["period"], "January 2021 - August 2022")
        self.assertEqual(history[2]["job_title"], "Bar Attendant / Barback")
        self.assertEqual(history[2]["company"], "City Garden Grand Hotel")
        self.assertEqual(history[2]["period"], "June 2019 - December 2020")

    def test_inline_layout_entries_pair_correctly(self):
        out = _extract(INLINE_RESUME_TEXT)
        history = out["work_history"]
        self.assertEqual(len(history), 2)
        self.assertEqual(history[0]["company"], "The Peninsula Manila")
        self.assertEqual(history[0]["job_title"], "Lead Bartender & Mixologist")
        self.assertEqual(history[1]["company"], "Discovery Primea")

    def test_duty_fragments_never_become_titles(self):
        out = _extract(STACKED_RESUME_TEXT)
        titles = [t.lower() for t in out["job_titles_raw"]]
        for fragment in ("codes", "replenishment", "techniques", "patrons",
                         "beverage service", "garnishes"):
            self.assertNotIn(fragment, titles)
        companies = [(h.get("company") or "").lower() for h in out["work_history"]]
        for company in companies:
            self.assertNotIn("beverage service", company)
            self.assertNotIn("food safety", company)

    def test_location_never_becomes_title_or_company(self):
        out = _extract(STACKED_RESUME_TEXT)
        for title in out["job_titles_raw"]:
            self.assertNotIn("makati city", title.lower())
        for entry in out["work_history"]:
            company = (entry.get("company") or "").lower()
            self.assertFalse(
                company.replace(" ", "") in {"makaticity,metromanila", "makaticity"},
                f"location filed as company: {company}",
            )

    def test_lead_title_survives_verb_filter(self):
        # "Lead ..." opens a legitimate title even though "lead" is verb-shaped.
        out = _extract(INLINE_RESUME_TEXT)
        self.assertIn("Lead Bartender & Mixologist", out["job_titles_raw"])

    def test_skill_phrase_with_ampersand_is_not_a_title(self):
        text = (
            "SKILLS & COMPETENCIES PROFESSIONAL EXPERIENCE\n"
            "Responsible Alcohol Service & Guest Intoxication Assessment\n"
            "The Peninsula Manila\n"
            "September 2022 - Present\n"
            "Lead Bartender & Mixologist\n"
            "Makati City, Metro Manila\n"
            "Oversee nightly bar operations.\n"
        )
        out = _extract(text)
        titles = [t.lower() for t in out["job_titles_raw"]]
        self.assertNotIn(
            "responsible alcohol service & guest intoxication assessment", titles
        )

    def test_compound_skill_split_across_lines_is_found(self):
        skills_ref, _, _ = refdata.effective_references(None)
        extractor = entity_extraction.get_extractor()
        found = extractor._extract_skills(
            "Point of Sale (POS) Order Processing, Cash\nHandling & Tab Settlement",
            {"skills": "Point of Sale (POS) Order Processing, Cash\nHandling & Tab Settlement"},
            skills_ref,
        )
        self.assertIn("Cash Handling", found)

    def test_duty_sentence_is_not_a_skill(self):
        skills_ref, _, _ = refdata.effective_references(None)
        extractor = entity_extraction.get_extractor()
        found = extractor._extract_skills(
            "Delivered engaging and warm guest interactions.",
            {"skills": "Delivered engaging and warm guest interactions."},
            skills_ref,
        )
        self.assertNotIn("Delivered engaging", found)

    def test_duty_sentence_is_not_a_certification(self):
        _, _, certs_ref = refdata.effective_references(None)
        extractor = entity_extraction.get_extractor()
        found = extractor._extract_certifications(
            "CERTIFICATIONS\nOversee nightly bar operations and craft cocktail service at Salon de Ning.",
            {"certifications": "Oversee nightly bar operations and craft cocktail service at Salon de Ning."},
            certs_ref,
        )
        self.assertEqual(found, [])

    def test_name_like_entry_is_not_a_certification(self):
        out = _extract(
            "Marco Antonio Reyes\nCERTIFICATIONS\nTESDA National Certificate II in Bartending (NC II)\n"
            "Marco Antonio Reyes\nTechnical Education and Skills Development Authority (TESDA)\nNovember 2021\n"
        )
        for cert in out["certifications_raw"]:
            self.assertNotIn("marco antonio", cert.lower())

    def test_phone_tail_is_not_joined_to_email(self):
        extractor = entity_extraction.get_extractor()
        emails = extractor._extract_emails(JOSHUA_STACKED_RESUME_TEXT)
        self.assertEqual(emails, ["joshua.ramos.culinary@gmail.com"])

    def test_stacked_company_first_titles_with_ampersand_and_digit_employer(self):
        out = _extract(JOSHUA_STACKED_RESUME_TEXT)
        history = out["work_history"]
        self.assertEqual(len(history), 3)
        self.assertEqual(history[0]["job_title"], "Sales Associate & Grocery Crew")
        self.assertEqual(history[0]["company"], "SM Supermarket")
        self.assertEqual(history[0]["period"], "September 2022 - Present")
        self.assertEqual(history[1]["job_title"], "Counter Crew & Dining Attendant")
        self.assertEqual(history[1]["company"], "Jollibee Food Corp")
        self.assertEqual(history[1]["period"], "January 2021 - August 2022")
        self.assertEqual(history[2]["job_title"], "Cashier & Store Clerk")
        self.assertEqual(history[2]["company"], "7-Eleven Convenience Store")
        self.assertEqual(history[2]["period"], "May 2019 - December 2020")
        self.assertIn("Sales Associate & Grocery Crew", out["job_titles_raw"])
        self.assertNotIn("Restaurant Cashier", out["job_titles_raw"])

    def test_inline_digit_led_company_and_role_ending_title(self):
        out = _extract(INLINE_DIGIT_AND_ROLE_TEXT)
        history = out["work_history"]
        titles = [h["job_title"] for h in history]
        companies = [h["company"] for h in history]
        self.assertEqual(
            companies,
            ["I'M Hotel Makati", "Romulo Cafe Makati", "7-Eleven Convenience Store"],
        )
        self.assertEqual(
            titles,
            ["Line Cook / Station Chef", "Kitchen Prep Assistant", "Cashier & Store Clerk"],
        )
        self.assertEqual(history[1]["period"], "July 2019 - December 2020")
        self.assertEqual(history[2]["period"], "May 2019 - December 2020")

    def test_role_ending_title_is_not_an_employer(self):
        out = _extract(INLINE_GENERIC_ORG_TEXT)
        history = out["work_history"]
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0]["job_title"], "Electro-Mechanical Technician")
        self.assertEqual(history[0]["company"], "Carrier Concepcion Facility Services")
        self.assertEqual(history[0]["period"], "June 2017 - February 2019")


if __name__ == "__main__":
    unittest.main()
