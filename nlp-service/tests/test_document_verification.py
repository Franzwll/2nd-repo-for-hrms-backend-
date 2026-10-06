"""Unit tests for supporting-document verification (COE / Certificate / Credential).

Covers the planned scenarios: matching/mismatching COE fields, canonical-alias
matches, education and certification comparisons, and the UNABLE_TO_VERIFY
paths (empty document, missing resume profile).
"""
import unittest

from app.services import document_verification as dv
from app.services import reference_data as refdata

COE_MATCH_TEXT = """
CERTIFICATE OF EMPLOYMENT

This is to certify that Juan Dela Cruz was employed by ABC Hotel
as Front Desk Receptionist from January 2021 to December 2022.

This certification is issued upon the request of the employee.
"""

COE_COMPANY_MISMATCH_TEXT = """
CERTIFICATE OF EMPLOYMENT

This is to certify that Juan Dela Cruz was employed by Seaside Resorts Inc
as Front Desk Receptionist from January 2021 to December 2022.
"""

COE_DATE_MISMATCH_TEXT = """
CERTIFICATE OF EMPLOYMENT

This is to certify that Juan Dela Cruz was employed by ABC Hotel
as Front Desk Receptionist from January 2022 to December 2023.
"""

COE_ALIAS_POSITION_TEXT = """
CERTIFICATE OF EMPLOYMENT

This is to certify that Juan Dela Cruz was employed by ABC Hotel
as Front Desk Agent from January 2021 to December 2022.
"""

# COE with day-level dates against a resume that rounds to the month — the
# classic "resume April 2018 / paper August 1, 2018" case HR kept flagging.
COE_ROUNDED_DATES_TEXT = """
CERTIFICATE OF EMPLOYMENT

This is to certify that Juan Dela Cruz was employed by ABC Hotel
as Front Desk Receptionist from August 1, 2018 to December 20, 2021.
"""

EDUCATION_MATCH_TEXT = """
CERTIFICATE OF GRADUATION

This is to certify that Juan Dela Cruz has completed the requirements
for the degree of Bachelor of Science in Hospitality Management.
"""

EDUCATION_MISMATCH_TEXT = """
CERTIFICATE OF GRADUATION

This is to certify that Juan Dela Cruz has completed the requirements
for the degree of Bachelor of Science in Tourism Management.
"""

CERTIFICATION_MATCH_TEXT = """
CERTIFICATE OF COMPLETION

This is to certify that Juan Dela Cruz has met all the requirements
of the training qualification listed below.

CERTIFICATIONS

Commercial Cooking NC II

Issued on March 5, 2022.
"""

RESUME_PROFILE = {
    "personal_information": {"name": "Juan Dela Cruz"},
    "education": ["Bachelor of Science in Hospitality Management"],
    "work_experience": [
        {
            "job_title": "Front Desk Receptionist",
            "company": "ABC Hotel",
            "location": "Manila",
            "period": "Jan 2021 - Dec 2022",
            "recognized_role": True,
        }
    ],
    "certifications": ["TESDA Cookery NC II"],
}

JOB_ROLE_ALIAS_REFERENCE = {
    "job_roles": {"Front Desk Receptionist": ["Front Desk Agent"]}
}


class TestSupportingDocumentVerification(unittest.TestCase):

    # 1. COE with all fields matching -> VERIFIED
    def test_coe_all_fields_match_verified(self):
        result = dv.verify_supporting_document(COE_MATCH_TEXT, "COE", RESUME_PROFILE)
        self.assertTrue(result["success"])
        self.assertEqual(result["verification_status"], "VERIFIED")
        self.assertEqual(result["checks"]["company"]["result"], "MATCH")
        self.assertEqual(result["checks"]["company"]["match_method"], "exact")
        self.assertEqual(result["checks"]["position"]["result"], "MATCH")
        self.assertEqual(result["checks"]["start_date"]["result"], "MATCH")
        self.assertEqual(result["checks"]["end_date"]["result"], "MATCH")
        self.assertEqual(result["checks"]["company"]["document_value"], "ABC Hotel")
        claims = result["extracted_document_profile"]["document_claims"]
        self.assertEqual(claims["employment_dates"], "January 2021 to December 2022")

    # 2. COE with company mismatch -> DISCREPANCY_FOUND
    def test_coe_company_mismatch_detected(self):
        result = dv.verify_supporting_document(COE_COMPANY_MISMATCH_TEXT, "COE", RESUME_PROFILE)
        self.assertEqual(result["verification_status"], "DISCREPANCY_FOUND")
        self.assertEqual(result["checks"]["company"]["result"], "MISMATCH")
        self.assertEqual(result["checks"]["position"]["result"], "MATCH")
        self.assertIn("Employer", result["summary"])

    # 3. COE with date mismatch -> DISCREPANCY_FOUND
    def test_coe_date_mismatch_detected(self):
        result = dv.verify_supporting_document(COE_DATE_MISMATCH_TEXT, "COE", RESUME_PROFILE)
        self.assertEqual(result["verification_status"], "DISCREPANCY_FOUND")
        self.assertEqual(result["checks"]["company"]["result"], "MATCH")
        self.assertEqual(result["checks"]["start_date"]["result"], "MISMATCH")
        self.assertEqual(result["checks"]["end_date"]["result"], "MISMATCH")
        self.assertEqual(result["checks"]["start_date"]["normalized_resume"], "2021-01")
        self.assertEqual(result["checks"]["start_date"]["normalized_document"], "2022-01")

    # 4. COE with position matched via canonical alias -> VERIFIED
    def test_coe_position_matched_via_canonical_alias(self):
        result = dv.verify_supporting_document(
            COE_ALIAS_POSITION_TEXT, "COE", RESUME_PROFILE, JOB_ROLE_ALIAS_REFERENCE
        )
        self.assertEqual(result["verification_status"], "VERIFIED")
        self.assertEqual(result["checks"]["position"]["result"], "MATCH")
        self.assertEqual(result["checks"]["position"]["match_method"], "canonical_alias")
        # Compare-level unit assertion: both sides resolve to one canonical entry.
        _, roles_ref, _ = refdata.effective_references(JOB_ROLE_ALIAS_REFERENCE)
        check = dv._compare_text_values("Front Desk Receptionist", "Front Desk Agent", roles_ref)
        self.assertEqual(check["match_method"], "canonical_alias")
        self.assertEqual(check["result"], "MATCH")

    # 5. Education document matching degree -> VERIFIED
    def test_education_degree_match_verified(self):
        result = dv.verify_supporting_document(EDUCATION_MATCH_TEXT, "Certificate", RESUME_PROFILE)
        self.assertEqual(result["verification_status"], "VERIFIED")
        self.assertEqual(result["checks"]["degree"]["result"], "MATCH")
        self.assertEqual(
            result["checks"]["degree"]["document_value"],
            "Bachelor of Science in Hospitality Management",
        )

    # 6. Education document with a different degree -> DISCREPANCY_FOUND
    def test_education_degree_mismatch_detected(self):
        result = dv.verify_supporting_document(EDUCATION_MISMATCH_TEXT, "Certificate", RESUME_PROFILE)
        self.assertEqual(result["verification_status"], "DISCREPANCY_FOUND")
        self.assertEqual(result["checks"]["degree"]["result"], "MISMATCH")

    # 7. Certification matching via alias -> VERIFIED
    def test_certification_matched_via_alias(self):
        result = dv.verify_supporting_document(CERTIFICATION_MATCH_TEXT, "Credential", RESUME_PROFILE)
        self.assertEqual(result["verification_status"], "VERIFIED")
        self.assertEqual(result["checks"]["certification"]["result"], "MATCH")
        # Alias resolution happens through the certifications reference table.
        _, _, certs_ref = refdata.effective_references(None)
        check = dv._compare_text_values("TESDA Cookery NC II", "Commercial Cooking NC II", certs_ref)
        self.assertEqual(check["result"], "MATCH")
        self.assertEqual(check["match_method"], "canonical_alias")

    # 8. Certification with a different cert name -> DISCREPANCY_FOUND
    def test_certification_mismatch_detected(self):
        profile = {**RESUME_PROFILE, "certifications": ["TESDA Bartending NC II"]}
        result = dv.verify_supporting_document(CERTIFICATION_MATCH_TEXT, "Credential", profile)
        self.assertEqual(result["verification_status"], "DISCREPANCY_FOUND")
        self.assertEqual(result["checks"]["certification"]["result"], "MISMATCH")

    # 9. Empty / unreadable document -> UNABLE_TO_VERIFY
    def test_empty_document_unable_to_verify(self):
        result = dv.verify_supporting_document("", "COE", RESUME_PROFILE)
        self.assertEqual(result["verification_status"], "UNABLE_TO_VERIFY")
        self.assertEqual(result["checks"], {})
        self.assertTrue(result["summary"])

    # 10. Missing resume profile -> UNABLE_TO_VERIFY
    def test_missing_resume_profile_unable_to_verify(self):
        result = dv.verify_supporting_document(COE_MATCH_TEXT, "COE", None)
        self.assertEqual(result["verification_status"], "UNABLE_TO_VERIFY")
        self.assertEqual(result["checks"], {})
        self.assertTrue(result["summary"])

    # Bonus: "Others" is extracted but never automatically comparable.
    def test_others_type_extracted_but_unverified(self):
        result = dv.verify_supporting_document(COE_MATCH_TEXT, "Others", RESUME_PROFILE)
        self.assertEqual(result["verification_status"], "UNABLE_TO_VERIFY")
        self.assertEqual(result["checks"], {})
        self.assertTrue(result["extracted_document_profile"])

    # 11. Month-level rounding on one side is the same period, not a discrepancy.
    #     resume: April 2018 - December 2021 / COE: August 1, 2018 - December 20, 2021
    def test_coe_month_level_start_within_tolerance_matches(self):
        profile = {
            **RESUME_PROFILE,
            "work_experience": [
                {
                    "job_title": "Front Desk Receptionist",
                    "company": "ABC Hotel",
                    "location": "Manila",
                    "period": "April 2018 - December 2021",
                    "recognized_role": True,
                }
            ],
        }
        result = dv.verify_supporting_document(COE_ROUNDED_DATES_TEXT, "COE", profile)
        self.assertEqual(result["checks"]["start_date"]["result"], "MATCH")
        self.assertEqual(
            result["checks"]["start_date"]["match_method"], dv.METHOD_DATE_TOLERANCE
        )
        self.assertIn("Same period", result["checks"]["start_date"]["note"])
        self.assertEqual(result["checks"]["end_date"]["result"], "MATCH")
        self.assertEqual(result["verification_status"], "VERIFIED")

    # 12. A gap wider than the tolerance window is still a real discrepancy.
    def test_coe_start_outside_tolerance_still_mismatch(self):
        profile = {
            **RESUME_PROFILE,
            "work_experience": [
                {
                    "job_title": "Front Desk Receptionist",
                    "company": "ABC Hotel",
                    "location": "Manila",
                    "period": "April 2018 - December 2021",
                    "recognized_role": True,
                }
            ],
        }
        result = dv.verify_supporting_document(COE_MATCH_TEXT, "COE", profile)
        # COE says January 2021 - December 2022: 33 months after April 2018.
        self.assertEqual(result["checks"]["start_date"]["result"], "MISMATCH")
        self.assertEqual(result["verification_status"], "DISCREPANCY_FOUND")

    # 13. Calendar-only values are metadata, not credential names.
    def test_calendar_only_certificate_values_are_not_compared(self):
        self.assertTrue(dv._is_date_only_phrase("(October 2020)"))
        self.assertTrue(dv._is_date_only_phrase("Conducted On March 2019"))
        self.assertTrue(dv._is_date_only_phrase("Issued: 05 March 2022"))
        self.assertFalse(dv._is_date_only_phrase("TESDA Cookery NC II"))
        check = dv._compare_cert_values("(October 2020)", "Conducted On March 2019")
        self.assertEqual(check["result"], "UNABLE_TO_EXTRACT")

    # 14. Resume-side date fragments never reach the comparison as titles.
    def test_resume_date_fragment_filtered_from_certifications(self):
        from app.services import entity_extraction

        self.assertTrue(entity_extraction.is_date_only_fragment("(October 2020)"))
        self.assertTrue(entity_extraction.is_date_only_fragment("Conducted on March 2019"))
        self.assertFalse(entity_extraction.is_date_only_fragment("TESDA Cookery NC II"))


if __name__ == "__main__":
    unittest.main()
