from app.services import screening
profile = {"education": ["Bachelor's Degree"], "job_roles": {"recognized": ["Cook"]}, "work_experience": [{"job_title": "Cook", "years": 2}], "estimated_years_experience": 2, "certifications": [], "skills": ["Cooking"]}
validation = {"skill_analysis": {"recognized": ["Cooking"], "missing_required": []}, "credential_analysis": [], "missing_information": [], "credential_verification": {"score_penalty": 0, "warning_count": 0}, "credential_issues": []}
requirements = {"job_post_id": 1, "title": "Cook", "required_skills": ["Cooking"], "preferred_skills": [], "education_level": "High School", "experience_level": "1-2 Years", "min_years_experience": 1, "required_certifications": [], "required_information": ["name", "email", "phone"]}
res = screening.classify_applied_job(profile, validation, requirements)
print(res)
