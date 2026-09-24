"""Unit tests for automated resume credential verification."""
import unittest
from datetime import date

from app import config
from app.services import credential_verification as cv
from app.services import pipeline, screening


class TestCredentialVerification(unittest.TestCase):

    def test_parse_date_range_standard(self):
        dr = cv.parse_date_range("Jan 2020 - Dec 2022")
        self.assertEqual(dr["start"], "2020-01")
        self.assertEqual(dr["end"], "2022-12")
        self.assertFalse(dr["is_current"])
        self.assertEqual(dr["start_year"], 2020)
        self.assertEqual(dr["end_year"], 2022)
        self.assertTrue(dr["explicit_start_month"])
        self.assertTrue(dr["explicit_end_month"])

    def test_parse_date_range_present(self):
        dr = cv.parse_date_range("Jun 2021 - Present")
        self.assertEqual(dr["start"], "2021-06")
        self.assertEqual(dr["end"], "present")
        self.assertTrue(dr["is_current"])
        self.assertEqual(dr["start_year"], 2021)

    def test_parse_date_range_years_only(self):
        dr = cv.parse_date_range("2018 - 2021")
        self.assertEqual(dr["start_year"], 2018)
        self.assertEqual(dr["end_year"], 2021)
        self.assertFalse(dr["explicit_start_month"])
        self.assertFalse(dr["explicit_end_month"])

    # 1. Timeline Overlap
    def test_timeline_overlap_detected(self):
        work_history = [
            {
                "job_title": "Hotel Front Desk Agent",
                "company": "Hotel Grand",
                "period": "Jan 2021 - Dec 2022",
                "date_range": cv.parse_date_range("Jan 2021 - Dec 2022"),
            },
            {
                "job_title": "Guest Relations Officer",
                "company": "Resort Paradise",
                "period": "Mar 2021 - Nov 2022",
                "date_range": cv.parse_date_range("Mar 2021 - Nov 2022"),
            },
        ]
        flags = cv._check_timeline_overlaps(work_history)
        self.assertTrue(len(flags) >= 1)
        self.assertEqual(flags[0]["check"], "timeline_overlap")
        self.assertEqual(flags[0]["severity"], "WARNING")

    def test_timeline_overlap_part_time_ignored(self):
        work_history = [
            {
                "job_title": "Full Time Server",
                "company": "Bistro A",
                "period": "Jan 2021 - Dec 2022",
                "date_range": cv.parse_date_range("Jan 2021 - Dec 2022"),
            },
            {
                "job_title": "Intern / Trainee",
                "company": "Hotel B",
                "period": "Mar 2021 - Nov 2022",
                "date_range": cv.parse_date_range("Mar 2021 - Nov 2022"),
            },
        ]
        flags = cv._check_timeline_overlaps(work_history)
        self.assertEqual(len(flags), 0)

    # 2. Future Dates
    def test_future_dates_detected(self):
        work_history = [
            {
                "job_title": "Line Cook",
                "company": "Future Grill",
                "period": "Jan 2030 - Dec 2031",
                "date_range": cv.parse_date_range("Jan 2030 - Dec 2031"),
            }
        ]
        flags = cv._check_future_dates(work_history, [])
        self.assertTrue(any(f["check"] == "future_dates" for f in flags))

    # 3. Experience vs. Graduation Gap
    def test_experience_graduation_gap_detected(self):
        profile = {
            "estimated_years_experience": 10.0,
            "education": ["Bachelor of Science in Hospitality Management, 2023"],
        }
        extraction = {
            "estimated_years_experience": 10.0,
            "education": ["Bachelor of Science in Hospitality Management, 2023"],
        }
        flags = cv._check_experience_graduation_gap(profile, extraction)
        self.assertTrue(any(f["check"] == "experience_graduation_gap" for f in flags))

    def test_experience_graduation_gap_valid(self):
        profile = {
            "estimated_years_experience": 4.0,
            "education": ["Bachelor of Science in Hotel Management, 2018"],
        }
        extraction = {
            "estimated_years_experience": 4.0,
            "education": ["Bachelor of Science in Hotel Management, 2018"],
        }
        flags = cv._check_experience_graduation_gap(profile, extraction)
        self.assertEqual(len(flags), 0)

    # 4. Seniority vs. Experience Mismatch
    def test_seniority_experience_mismatch_detected(self):
        profile = {
            "estimated_years_experience": 0.8,
            "job_roles": ["Executive Chef"],
        }
        extraction = {
            "estimated_years_experience": 0.8,
            "work_history": [{"job_title": "Executive Chef"}],
            "job_titles_raw": ["Executive Chef"],
        }
        flags = cv._check_seniority_experience_mismatch(profile, extraction)
        self.assertTrue(any(f["check"] == "seniority_experience_mismatch" for f in flags))

    def test_seniority_experience_mismatch_experienced(self):
        profile = {
            "estimated_years_experience": 6.0,
            "job_roles": ["Executive Chef"],
        }
        extraction = {
            "estimated_years_experience": 6.0,
            "work_history": [{"job_title": "Executive Chef"}],
            "job_titles_raw": ["Executive Chef"],
        }
        flags = cv._check_seniority_experience_mismatch(profile, extraction)
        self.assertEqual(len(flags), 0)

    # 5. Excessive Job Hopping
    def test_excessive_job_hopping_detected(self):
        work_history = [
            {"job_title": "Role 1", "period": "Jan 2021 - Mar 2021", "date_range": cv.parse_date_range("Jan 2021 - Mar 2021")},
            {"job_title": "Role 2", "period": "Apr 2021 - Jun 2021", "date_range": cv.parse_date_range("Apr 2021 - Jun 2021")},
            {"job_title": "Role 3", "period": "Jul 2021 - Sep 2021", "date_range": cv.parse_date_range("Jul 2021 - Sep 2021")},
            {"job_title": "Role 4", "period": "Oct 2021 - Dec 2021", "date_range": cv.parse_date_range("Oct 2021 - Dec 2021")},
            {"job_title": "Role 5", "period": "Jan 2022 - Mar 2022", "date_range": cv.parse_date_range("Jan 2022 - Mar 2022")},
        ]
        flags = cv._check_excessive_job_hopping(work_history)
        self.assertTrue(any(f["check"] == "excessive_job_hopping" for f in flags))
        self.assertEqual(flags[0]["severity"], "INFO")

    # 6. Education-Certification Prerequisites
    def test_education_cert_prerequisites_detected(self):
        profile = {
            "education": ["High School Graduate"],
            "certifications": ["PRC Registered Nurse License"],
        }
        extraction = {
            "education": ["High School Graduate"],
            "certifications_raw": ["PRC Registered Nurse License"],
        }
        flags = cv._check_education_cert_prerequisites(profile, extraction)
        self.assertTrue(any(f["check"] == "education_cert_prerequisites" for f in flags))
        self.assertEqual(flags[0]["severity"], "WARNING")

    def test_education_cert_prerequisites_met(self):
        profile = {
            "education": ["Bachelor of Science in Nursing, 2020"],
            "certifications": ["PRC Registered Nurse License"],
        }
        extraction = {
            "education": ["Bachelor of Science in Nursing, 2020"],
            "certifications_raw": ["PRC Registered Nurse License"],
        }
        flags = cv._check_education_cert_prerequisites(profile, extraction)
        self.assertEqual(len(flags), 0)

    # 7. Chronological Incoherence
    def test_chronological_incoherence_inverted(self):
        work_history = [
            {
                "job_title": "Bartender",
                "period": "May 2023 - Jan 2021",
                "date_range": {"start_year": 2023, "start_month": 5, "end_year": 2021, "end_month": 1, "is_current": False},
            }
        ]
        flags = cv._check_chronological_coherence(work_history, [])
        self.assertTrue(any(f["check"] == "chronological_coherence" for f in flags))

    # Pipeline & Scoring Integration
    def test_single_warning_applies_penalty(self):
        # Fake resume with future date (1 warning)
        resume_text = """
JUAN CORDOVA
Email: juan.cordova@email.com | Phone: 0917 111 2222

WORK EXPERIENCE
Line Cook at Seaside Grill | Jan 2030 - Dec 2031
Prepared food, maintained food safety standards. Knife skills and plating.

SKILLS
Food Safety, HACCP, Knife Skills, Plating, Teamwork, Mise en Place

EDUCATION
Vocational / TESDA Culinary Course, 2019
"""
        job_req = {
            "title": "Line Cook",
            "required_skills": ["Food Safety", "Knife Skills"],
            "preferred_skills": ["Plating"],
            "min_years_experience": 1.0,
            "education_level": "Vocational / TESDA",
            "required_certifications": [],
            "required_information": ["name", "email", "phone"],
        }
        result = pipeline.analyze_resume_text(resume_text, job_req, [])
        verification = result["validation"]["credential_verification"]
        self.assertEqual(verification["warning_count"], 1)
        self.assertEqual(verification["score_penalty"], 5.0)
        self.assertTrue(any("penalty applied" in r.lower() for r in result["screening_reasons"]))

    def test_three_warnings_escalates_to_invalid_credential(self):
        # Fake resume with multiple severe inconsistencies:
        # 1. Timeline overlap
        # 2. Executive Chef with 0.5 years exp (seniority mismatch)
        # 3. PRC Registered Nurse with only High School
        resume_text = """
MARCO BOGUS
Email: marco.bogus@email.com | Phone: 0917 999 8888

WORK EXPERIENCE
Executive Chef at Grand Palace | Jan 2022 - Dec 2023
Fine dining culinary operations.
Executive Chef at Royal Hotel | Jan 2022 - Dec 2023
Kitchen direction and banquet menus.

SKILLS
Food Safety, HACCP, Knife Skills, Plating

EDUCATION
High School Graduate

CERTIFICATIONS
PRC Registered Nurse
"""
        job_req = {
            "title": "Executive Chef",
            "required_skills": ["Food Safety"],
            "preferred_skills": [],
            "min_years_experience": 0.0,
            "education_level": "High School Graduate",
            "required_certifications": [],
            "required_information": ["name", "email", "phone"],
        }
        result = pipeline.analyze_resume_text(resume_text, job_req, [])
        verification = result["validation"]["credential_verification"]
        self.assertTrue(verification["warning_count"] >= 3)
        self.assertTrue(verification["escalate_invalid"])
        self.assertEqual(result["screening_status"], "INVALID_CREDENTIAL")
        self.assertTrue(any("CREDENTIAL_VERIFICATION_CONCERN" in r for r in result["screening_reasons"]))


if __name__ == "__main__":
    unittest.main()
