from app.services import screening

profile = {"education": ["Bachelor's Degree"], "job_roles": {"recognized": ["Cook"]}, "work_experience": [{"job_title": "Cook", "years": 2}], "estimated_years_experience": 2, "certifications": [], "skills": ["Cooking"]}
validation = {"skill_analysis": {"recognized": ["Cooking"], "missing_required": []}, "credential_analysis": [], "missing_information": [], "credential_verification": {"score_penalty": 0, "warning_count": 0}, "credential_issues": []}
requirements = {"job_post_id": 1, "title": "Cook", "required_skills": ["Cooking"], "preferred_skills": [], "education_level": "High School", "experience_level": "1-2 Years", "min_years_experience": 1, "required_certifications": [], "required_information": ["name", "email", "phone"]}

# Test with different weights - emphasize experience more
settings = {
    "weights": {"skills": 0.2, "experience": 0.6, "education": 0.1, "certifications": 0.1},
    "passing_score": 80,
    "required_skills_coverage_min": 0.8
}
res = screening.full_classification(profile, validation, requirements, open_jobs=[], settings=settings)
print('status:', res['screening_status'])
print('score:', res['match_score'])
print('breakdown:')
for k,v in res['score_breakdown'].items():
    print(f'  {k}: earned={v[\"earned\"]}/{v[\"max\"]} (w={v[\"weight\"]})')
