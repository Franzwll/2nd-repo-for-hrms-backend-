"""Smoke tests: runs the full pipeline over synthetic resumes covering all
four screening classifications. Run from nlp-service/: python tests/smoke_test.py"""
import json
import sys

sys.path.insert(0, ".")

from app.services import pipeline  # noqa: E402

RESUMES = {
    "perfect_line_cook": """
JUAN DELA CRUZ
Email: juan.delacruz@email.com | Phone: 0917 123 4567

PROFESSIONAL SUMMARY
Line cook with 3 years of hotel kitchen experience and TESDA certification.

WORK EXPERIENCE
Line Cook - Seaside Grill Hotel | Jan 2021 - Present
Prepared mise en place, maintained HACCP food safety compliance.
Cooked hot kitchen dishes to recipe standards with strong plating.

SKILLS
Food Safety, HACCP, Knife Skills, Plating, Teamwork, Mise en Place

EDUCATION
Vocational / TESDA Culinary Course, 2019

CERTIFICATIONS
TESDA Cookery NC II
Food Handler Certificate
""",
    "credential_issue": """
PRINCESS MABANGIS
Email: princess.mabangis@email
Phone: 0912 345

EXPERIENCE
Housekeeping Attendant at Sunrise Inn | 2022 - 2024
Room turnover, linen handling, public area cleaning.

SKILLS
Room Turnover, Linen Handling, Attention to Detail

EDUCATION
High School Graduate
""",
    "fit_for_other_job": """
KANOR ORNAK
Email: kanor.ornak@email.com | Phone: 0905 118 7742

PROFILE
Cafe service crew member with barista and customer service background.

WORK EXPERIENCE
Barista at Cafe Verde | Jun 2022 - Present
Coffee preparation, POS systems operation, cash handling.
Service Crew at Retail Mart | 2020 - 2022

SKILLS
Customer Service, Coffee Preparation, POS Systems, Cash Handling

EDUCATION
College Level, HRM Undergraduate
""",
    "not_fitted": """
ELENA TORRES
elena.torres@email.com / 0918 220 3341

SUMMARY
Clerical staff with data entry experience.

WORK EXPERIENCE
Data Encoder - ACME Corp | 2021 - 2023

SKILLS
MS Office, Data Entry, Documentation

EDUCATION
BS Accountancy
""",
}

JOBS = {
    "line_cook": {
        "job_post_id": 2,
        "title": "Line Cook",
        "required_skills": ["Food Safety", "HACCP", "Knife Skills", "Plating", "Teamwork"],
        "preferred_skills": [],
        "education_level": "Vocational / TESDA",
        "experience_level": "1-2 Years",
        "required_certifications": ["TESDA NC II in Cookery", "Valid food handler's certificate"],
        "required_information": ["name", "email", "phone"],
    },
    "bartender": {
        "job_post_id": 5,
        "title": "Bartender",
        "required_skills": ["Mixology", "Inventory Control", "Guest Relations"],
        "preferred_skills": ["Cash Handling"],
        "education_level": "Vocational / TESDA",
        "experience_level": "3-5 Years",
        "required_certifications": ["TESDA Bartending NC II"],
        "required_information": ["name", "email", "phone"],
    },
    "barista": {
        "job_post_id": 20,
        "title": "Barista",
        "required_skills": ["Customer Service", "Coffee Preparation"],
        "preferred_skills": ["POS Systems", "Cash Handling"],
        "education_level": "High School Graduate",
        "experience_level": "No Experience",
        "required_certifications": [],
        "required_information": ["name", "email", "phone"],
    },
    "housekeeping": {
        "job_post_id": 3,
        "title": "Housekeeping Attendant",
        "required_skills": ["Room Turnover", "Attention to Detail"],
        "preferred_skills": [],
        "education_level": "High School Graduate",
        "experience_level": "No Experience",
        "required_certifications": [],
        "required_information": ["name", "email", "phone"],
    },
}


def main():
    cases = [
        ("perfect_line_cook", JOBS["line_cook"], [], "PERFECT_FOR_THE_JOB"),
        ("credential_issue", JOBS["housekeeping"], [], "INVALID_CREDENTIAL"),
        ("not_fitted", JOBS["bartender"], [JOBS["line_cook"]], "NOT_FITTED_TO_JOB"),
        ("fit_for_other_job", JOBS["bartender"], [JOBS["barista"], JOBS["line_cook"]], None),
    ]
    failures = 0
    for name, reqs, open_jobs, expected in cases:
        result = pipeline.analyze_resume_text(RESUMES[name], reqs, open_jobs)
        status = result["screening_status"]
        score = result["match_score"]
        ok = expected is None or status == expected
        if not ok:
            failures += 1
        print(f"\n=== {name} -> {status} (expected {expected or 'FIT_FOR_OTHER_JOB'}) score={score} {'OK' if ok else 'FAIL'}")
        print("  reasons:", *result["screening_reasons"], sep="\n    ")
        alt = result.get("alternative_job")
        if alt:
            print(f"  alternative: {alt['title']} ({alt['alternative_match_score']}%)")
        v = result["validation"]
        print(f"  missing={v['missing_information']} invalid={v['invalid_format']}")
        print(f"  skills recognized={v['skill_analysis']['recognized'][:6]} unrecognized={v['skill_analysis']['unrecognized'][:4]}")
        print(f"  roles recognized={v['job_role_analysis']['recognized'][:4]}")
    print(f"\n{'ALL PASS' if failures == 0 else f'{failures} FAILURES'}")
    return failures


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
