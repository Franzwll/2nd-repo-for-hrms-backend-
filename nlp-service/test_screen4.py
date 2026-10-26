from app.services import screening

# Case 1: Missing required skills affects coverage
profile = {"education": ["Bachelor's Degree"], "job_roles": {"recognized": ["Cook"]}, "work_experience": [{"job_title": "Cook", "years": 2}], "estimated_years_experience": 2, "certifications": [], "skills": ["Cooking"]}
validation = {"skill_analysis": {"recognized": ["Cooking"], "missing_required": ["Food Safety"]}, "credential_analysis": [], "missing_information": [], "credential_verification": {"score_penalty": 0, "warning_count": 0}, "credential_issues": []}
requirements = {"job_post_id": 1, "title": "Cook", "required_skills": ["Cooking", "Food Safety"], "preferred_skills": [], "education_level": "High School", "experience_level": "1-2 Years", "min_years_experience": 1, "required_certifications": [], "required_information": ["name", "email", "phone"]}

# Default coverage 0.6, 50% coverage means not met
res = screening.full_classification(profile, validation, requirements, open_jobs=[], settings=None)
print('DEFAULT - status:', res['screening_status'], 'score:', res['match_score'], 'coverage:', res['mandatory_detail']['required_skills_coverage'])
