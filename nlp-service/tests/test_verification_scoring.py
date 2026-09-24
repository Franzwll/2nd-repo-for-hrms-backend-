"""Unit tests for supporting-document evidence in the ranking score.

Covers the approved policy: the resume match score is blended with the
supporting-document evidence score at a 15% weighting (VERIFIED = 100,
UNABLE_TO_VERIFY = 50, DISCREPANCY_FOUND = 0), documents without decisive
evidence leave the resume score untouched, and a discrepancy escalates the
official classification to INVALID_CREDENTIAL.
"""
import unittest

from app import config
from app.services import matching, screening, verification_scoring as vs

# 100/100 resume: every component earns full points (skills 40 + experience 30
# + education 20 + certifications 10), so blending is easy to reason about.
FULL_PROFILE = {
    "personal_information": {"name": "Juan Dela Cruz", "email": "juan@example.com", "phone": "09171234567"},
    "education": ["Bachelor of Science in Hospitality Management"],
    "skills": ["Customer Service", "Front Office Operations"],
    "certifications": [],
    "estimated_years_experience": 3.0,
}

WEAK_PROFILE = {
    "personal_information": {"name": "Juan Dela Cruz", "email": "juan@example.com", "phone": "09171234567"},
    "education": [],
    "skills": ["Customer Service"],
    "certifications": [],
    "estimated_years_experience": 0.0,
}

VALIDATION = {
    "missing_information": [],
    "invalid_format": [],
    "skill_analysis": {"recognized": ["Customer Service", "Front Office Operations"], "unrecognized": []},
    "job_role_analysis": {"recognized": [], "unrecognized": []},
    "credential_analysis": [],
    "credential_issues": [],
    "credential_verification": {"warning_count": 0, "score_penalty": 0.0, "escalate_invalid": False, "flags": []},
}

REQUIREMENTS = {
    "job_post_id": 1,
    "title": "Front Desk Receptionist",
    "required_skills": ["Customer Service", "Front Office Operations"],
    "preferred_skills": [],
    "education_level": "Bachelor's Degree",
    "experience_level": "1-2 Years",
    "required_certifications": [],
    "required_information": ["name", "email", "phone"],
}


def doc(status, doc_type="COE", checks=None, doc_id=1):
    return {
        "applicant_document_id": doc_id,
        "doc_type": doc_type,
        "verification_status": status,
        "verification_result": {"checks": checks or {}, "summary": ""},
    }


COE_MISMATCH_CHECKS = {
    "company": {"result": "MISMATCH", "resume_value": "ABC Hotel", "document_value": "Seaside Resorts"},
    "position": {"result": "MATCH", "resume_value": "Front Desk Receptionist", "document_value": "Front Desk Receptionist"},
}


class TestEvidenceAggregation(unittest.TestCase):

    def test_no_documents_returns_not_provided(self):
        aggregate = vs.aggregate_document_verifications([])
        self.assertEqual(aggregate["status"], config.EVIDENCE_NOT_PROVIDED)
        self.assertIsNone(aggregate["credit_ratio"])
        self.assertIsNone(aggregate["documents_score"])
        self.assertFalse(aggregate["escalate_invalid"])

    def test_only_pending_documents_are_ignored(self):
        aggregate = vs.aggregate_document_verifications([
            doc("PENDING"), doc("PROCESSING", doc_id=2),
        ])
        self.assertEqual(aggregate["status"], config.EVIDENCE_PENDING)
        self.assertEqual(aggregate["pending_count"], 2)
        self.assertEqual(aggregate["decisive_count"], 0)
        self.assertIsNone(aggregate["credit_ratio"])

    def test_others_and_result_less_entries_are_ignored(self):
        aggregate = vs.aggregate_document_verifications([
            doc("VERIFIED", doc_type="Others"),
            {"applicant_document_id": 9, "doc_type": None},
        ])
        self.assertEqual(aggregate["ignored_count"], 2)
        self.assertEqual(aggregate["decisive_count"], 0)
        self.assertEqual(aggregate["status"], config.EVIDENCE_PENDING)

    def test_verified_document_scores_100(self):
        aggregate = vs.aggregate_document_verifications([doc("VERIFIED")])
        self.assertEqual(aggregate["status"], config.EVIDENCE_VERIFIED)
        self.assertEqual(aggregate["documents_score"], 100.0)
        self.assertFalse(aggregate["escalate_invalid"])

    def test_unverifiable_document_scores_partial_credit(self):
        aggregate = vs.aggregate_document_verifications([doc("UNABLE_TO_VERIFY")])
        self.assertEqual(aggregate["documents_score"], 50.0)
        self.assertEqual(aggregate["unable_count"], 1)
        self.assertFalse(aggregate["escalate_invalid"])

    def test_discrepancy_reports_mismatched_fields_and_escalates(self):
        aggregate = vs.aggregate_document_verifications([
            doc("DISCREPANCY_FOUND", checks=COE_MISMATCH_CHECKS),
        ])
        self.assertEqual(aggregate["status"], config.EVIDENCE_DISCREPANCY)
        self.assertTrue(aggregate["escalate_invalid"])
        self.assertEqual(aggregate["mismatched_fields"], ["Employer"])
        self.assertEqual(aggregate["documents_score"], 0.0)

    def test_mixed_documents_average_credit(self):
        aggregate = vs.aggregate_document_verifications([
            doc("VERIFIED", doc_id=1),
            doc("UNABLE_TO_VERIFY", doc_type="Certificate", doc_id=2),
        ])
        self.assertEqual(aggregate["status"], config.EVIDENCE_PARTIAL)
        self.assertEqual(aggregate["documents_score"], 75.0)


class TestBlending(unittest.TestCase):

    def test_blend_is_noop_without_decisive_documents(self):
        aggregate = vs.aggregate_document_verifications([doc("PENDING")])
        self.assertEqual(vs.apply_document_evidence(87.5, aggregate), 87.5)
        self.assertEqual(aggregate["score_penalty"], 0.0)

    def test_blend_math_and_penalty(self):
        aggregate = vs.aggregate_document_verifications([doc("UNABLE_TO_VERIFY")])
        # 80 * 0.85 + 50 * 0.15 = 68 + 7.5 = 75.5
        self.assertEqual(vs.apply_document_evidence(80.0, aggregate), 75.5)
        self.assertEqual(aggregate["score_penalty"], 4.5)

    def test_blend_never_goes_below_zero(self):
        aggregate = vs.aggregate_document_verifications([doc("DISCREPANCY_FOUND")])
        self.assertEqual(vs.apply_document_evidence(4.0, aggregate), 3.4)

    def test_summary_describes_movement(self):
        aggregate = vs.aggregate_document_verifications([doc("UNABLE_TO_VERIFY")])
        vs.apply_document_evidence(80.0, aggregate)
        text = vs.summarize_evidence(aggregate, 80.0, 75.5)
        self.assertIn("80.0%", text)
        self.assertIn("75.5%", text)
        self.assertIn("1 unverifiable", text)


class TestScreeningIntegration(unittest.TestCase):
    """The classifier expects PARSED requirements (min_years_experience etc.),
    exactly as the pipeline builds them, so these tests parse the payload first."""

    def test_classification_without_documents_keeps_resume_score(self):
        result = screening.full_classification(
            FULL_PROFILE, VALIDATION, matching.parse_requirements(REQUIREMENTS)
        )
        self.assertEqual(result["screening_status"], config.CLASS_PERFECT)
        self.assertEqual(result["match_score"], result["resume_match_score"])
        self.assertEqual(result["document_verification"]["status"], config.EVIDENCE_NOT_PROVIDED)

    def test_verified_document_keeps_perfect_classification(self):
        result = screening.full_classification(
            FULL_PROFILE, VALIDATION, matching.parse_requirements(REQUIREMENTS),
            document_verifications=[doc("VERIFIED")],
        )
        self.assertEqual(result["screening_status"], config.CLASS_PERFECT)
        self.assertEqual(result["match_score"], 100.0)
        self.assertEqual(result["resume_match_score"], 100.0)
        self.assertTrue(any("Supporting-document verification" in r for r in result["reasons"]))

    def test_unverifiable_document_blends_score_without_escalation(self):
        result = screening.full_classification(
            FULL_PROFILE, VALIDATION, matching.parse_requirements(REQUIREMENTS),
            document_verifications=[doc("UNABLE_TO_VERIFY")],
        )
        self.assertEqual(result["screening_status"], config.CLASS_PERFECT)
        self.assertEqual(result["match_score"], 92.5)
        self.assertEqual(result["resume_match_score"], 100.0)
        self.assertEqual(result["document_verification"]["score_penalty"], 7.5)
        self.assertEqual(result["document_verification"]["status"], config.EVIDENCE_PARTIAL)

    def test_discrepancy_escalates_to_invalid_credential(self):
        result = screening.full_classification(
            FULL_PROFILE, VALIDATION, matching.parse_requirements(REQUIREMENTS),
            document_verifications=[doc("DISCREPANCY_FOUND", checks=COE_MISMATCH_CHECKS)],
        )
        self.assertEqual(result["screening_status"], config.CLASS_INVALID_CREDENTIAL)
        self.assertEqual(result["match_score"], 85.0)
        self.assertTrue(any("Employer" in r for r in result["reasons"]))

    def test_resume_credential_blocker_still_blends_document_evidence(self):
        """A resume-level blocker flags the applicant, but the ranking
        percentage still includes the supporting-document evidence."""
        validation = dict(VALIDATION)
        validation["credential_issues"] = [{
            "type": "UNVERIFIABLE_REQUIRED_CREDENTIAL",
            "detail": "TESDA Front Office Services NC II could not be verified.",
            "note": "Manual review required.",
        }]
        result = screening.full_classification(
            FULL_PROFILE, validation, matching.parse_requirements(REQUIREMENTS),
            document_verifications=[doc("UNABLE_TO_VERIFY")],
        )
        self.assertEqual(result["screening_status"], config.CLASS_INVALID_CREDENTIAL)
        self.assertEqual(result["resume_match_score"], 100.0)
        self.assertEqual(result["match_score"], 92.5)

    def test_alternative_job_uses_blended_score(self):
        open_job = {
            "job_post_id": 2,
            "title": "Front Office Associate",
            "required_skills": ["Customer Service"],
            "preferred_skills": [],
            "education_level": None,
            "experience_level": "No Experience",
            "required_certifications": [],
            "required_information": ["name", "email", "phone"],
        }
        # Weak resume: the applied job is not met, the lighter open job is.
        result = screening.full_classification(
            WEAK_PROFILE, VALIDATION, matching.parse_requirements(REQUIREMENTS),
            open_jobs=[open_job],
            document_verifications=[doc("UNABLE_TO_VERIFY")],
        )
        self.assertEqual(result["screening_status"], config.CLASS_FIT_OTHER)
        applied_score = result["alternative_job"]["applied_job_score"]
        alternative_score = result["alternative_job"]["alternative_match_score"]
        # Applied job resume-only score = skills 40 (both recognized in the
        # validation payload) + experience 0 + education 0 + certifications 10
        # = 50 -> blended 50 * 0.85 + 50 * 0.15 = 50.
        self.assertEqual(applied_score, 50.0)
        # Open job resume-only score = 40 + 30 + 20 + 10 = 100
        # -> blended 100 * 0.85 + 50 * 0.15 = 92.5.
        self.assertEqual(alternative_score, 92.5)


if __name__ == "__main__":
    unittest.main()
