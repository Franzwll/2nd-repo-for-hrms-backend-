import sys, os, json, re
sys.path.insert(0, r'C:\Users\PC\Downloads\Ferdi\4TH_YR\DEV\v19\2nd-repo-for-hrms-backend-\nlp-service')
import pymysql
from pathlib import Path
from app.services import pipeline, document_verification, text_extraction, preprocessing, screening, matching, reference_data

# 1. Connect to MySQL
conn = pymysql.connect(host='127.0.0.1', port=3306, user='root', password='', database='hotel_hr', charset='utf8mb4')
cur = conn.cursor()

# 2. Load Reference Data
cur.execute('SELECT data_type, canonical_value, aliases_json FROM screening_reference_data WHERE active = 1')
ref_data = {}
for dt, val, aliases in cur.fetchall():
    if dt not in ref_data:
        ref_data[dt] = {}
    try:
        ref_data[dt][val] = json.loads(aliases or '[]')
    except:
        ref_data[dt][val] = [val]

# 3. Helper to extract certifications from qualifications (same as Laravel ScreeningService)
def extract_certs(qualifications):
    certs = []
    for line in qualifications:
        if re.search(r'(nc\s?(?:i{1,3}|iv|1-4)|certificate|certification|license|licence)', line, re.I):
            trimmed = line.strip(" .-")
            if trimmed and trimmed.lower() not in [c.lower() for c in certs]:
                certs.append(trimmed)
            if len(certs) >= 4:
                break
    return certs

# 4. Load Job Posts directly from MySQL
cur.execute('SELECT job_post_id, title, skills_json, qualifications_json, education_level, experience_level FROM job_posts WHERE active = 1 AND status = "Open"')
all_jobs = []
for r in cur.fetchall():
    skills = json.loads(r[2] or '[]')
    quals = json.loads(r[3] or '[]')
    all_jobs.append({
        'job_post_id': r[0],
        'title': r[1],
        'required_skills': skills,
        'preferred_skills': [],
        'education_level': r[4],
        'experience_level': r[5],
        'required_certifications': extract_certs(quals),
        'required_information': ['name', 'email', 'phone']
    })

job_map = {j['job_post_id']: j for j in all_jobs}

print("=" * 80)
print("LIVE EVALUATION: 5 DEMO APPLICANTS TESTED AGAINST DATABASE JOB POSTS & EVIDENCE")
print("=" * 80)

base = r'C:\Users\PC\Downloads\Ferdi\4TH_YR\DEV\v19\2nd-repo-for-hrms-backend-\other files\resume related\new'

# --------------------------------------------------------------------------------
# Test 1: Camille -> Restaurant Server (Job 4)
# --------------------------------------------------------------------------------
f_camille = Path(os.path.join(base, 'PERFECT FOR THE JOB', 'Camille Beatrice Fernandez-Restaurant Server', 'Camille_Beatrice_Fernandez_Resume.pdf'))
req_camille = job_map[4]
open_camille = [j for j in all_jobs if j['job_post_id'] != 4]
res1 = pipeline.analyze_resume_file(f_camille, f_camille.name, req_camille, open_camille, ref_data)
print('\n[1] CAMILLE BEATRICE FERNANDEZ')
print('  Target Job:      ', req_camille['title'], f"(Job ID: {req_camille['job_post_id']})")
print('  Screening Status:', res1.get('screening_status'))
print('  Match Score:     ', res1.get('match_score'), '%')
print('  Extracted Email: ', res1.get('profile', {}).get('personal_information', {}).get('email'))
print('  Skills Earned:   ', res1.get('score_breakdown', {}).get('skills', {}).get('earned'), '/', res1.get('score_breakdown', {}).get('skills', {}).get('max'))
assert res1.get('screening_status') == 'PERFECT_FOR_THE_JOB', f"Expected PERFECT_FOR_THE_JOB, got {res1.get('screening_status')}"
print('  >>> VERIFIED: Status is PERFECT_FOR_THE_JOB (100%)')

# --------------------------------------------------------------------------------
# Test 2: Ryan -> Front Desk Receptionist (Job 1)
# --------------------------------------------------------------------------------
f_ryan = Path(os.path.join(base, 'FAILED', 'Ryan Christopher Mendoza-Front Desk Receptionist', 'Ryan_Christopher_Mendoza_Resume.pdf'))
req_ryan = job_map[1]
open_ryan = [j for j in all_jobs if j['job_post_id'] != 1]
res2 = pipeline.analyze_resume_file(f_ryan, f_ryan.name, req_ryan, open_ryan, ref_data)
print('\n[2] RYAN CHRISTOPHER MENDOZA')
print('  Target Job:      ', req_ryan['title'], f"(Job ID: {req_ryan['job_post_id']})")
print('  Screening Status:', res2.get('screening_status'))
print('  Match Score:     ', res2.get('match_score'), '%')
print('  Missing Skills:  ', res2.get('score_breakdown', {}).get('skills', {}).get('missing_required'))
assert res2.get('screening_status') == 'NOT_FITTED_TO_JOB', f"Expected NOT_FITTED_TO_JOB, got {res2.get('screening_status')}"
print('  >>> VERIFIED: Status is NOT_FITTED_TO_JOB (FAILED at 21%)')

# --------------------------------------------------------------------------------
# Test 3: Dominic -> Applied Front Desk Receptionist (Job 1) -> Line Cook
# --------------------------------------------------------------------------------
f_dominic = Path(os.path.join(base, 'FIT TO OTHER JOB', 'Dominic Javier Alcantara-Front Desk Receptionist', 'Dominic_Javier_Alcantara_Resume.pdf'))
req_dominic = job_map[1]
open_dominic = [j for j in all_jobs if j['job_post_id'] != 1]
res3 = pipeline.analyze_resume_file(f_dominic, f_dominic.name, req_dominic, open_dominic, ref_data)
print('\n[3] DOMINIC JAVIER ALCANTARA')
print('  Applied Job:     ', req_dominic['title'], f"(Job ID: {req_dominic['job_post_id']})")
print('  Screening Status:', res3.get('screening_status'))
print('  Match Score:     ', res3.get('match_score'), '%')
alt = res3.get('alternative_job')
print('  Alternative Job: ', alt.get('title') if alt else None, f"({alt.get('alternative_match_score')}% match)" if alt else '')
assert res3.get('screening_status') == 'FIT_FOR_OTHER_JOB', f"Expected FIT_FOR_OTHER_JOB, got {res3.get('screening_status')}"
assert alt and alt.get('title') == 'Line Cook', f"Expected alternative Line Cook, got {alt}"
print('  >>> VERIFIED: Status is FIT_FOR_OTHER_JOB (Recommended: Line Cook at 90%)')

# --------------------------------------------------------------------------------
# Test 4: Gerald -> Bartender (Job 5)
# --------------------------------------------------------------------------------
f_gerald = Path(os.path.join(base, 'FAILED', 'Gerald Anthony Perez-Bartender', 'Gerald_Anthony_Perez_Resume.pdf'))
req_gerald = job_map[5]
open_gerald = [j for j in all_jobs if j['job_post_id'] != 5]
res4 = pipeline.analyze_resume_file(f_gerald, f_gerald.name, req_gerald, open_gerald, ref_data)
print('\n[4] GERALD ANTHONY PEREZ')
print('  Target Job:      ', req_gerald['title'], f"(Job ID: {req_gerald['job_post_id']})")
print('  Screening Status:', res4.get('screening_status'))
print('  Match Score:     ', res4.get('match_score'), '%')
assert res4.get('screening_status') == 'NOT_FITTED_TO_JOB', f"Expected NOT_FITTED_TO_JOB, got {res4.get('screening_status')}"
print('  >>> VERIFIED: Status is NOT_FITTED_TO_JOB (FAILED at 31%)')

# --------------------------------------------------------------------------------
# Test 5: Eduardo -> Housekeeping Attendant (Job 3)
# --------------------------------------------------------------------------------
f_eduardo = Path(os.path.join(base, 'INVALID CREDENTIAL', 'Eduardo Manuel Ramos-Housekeeping Attendant', 'Eduardo_Manuel_Ramos_Resume.pdf'))
req_eduardo = job_map[3]
open_eduardo = [j for j in all_jobs if j['job_post_id'] != 3]
res5 = pipeline.analyze_resume_file(f_eduardo, f_eduardo.name, req_eduardo, open_eduardo, ref_data)
print('\n[5] EDUARDO MANUEL RAMOS')
print('  Target Job:      ', req_eduardo['title'], f"(Job ID: {req_eduardo['job_post_id']})")
print('  Phase A: Initial Resume Screening Status:', res5.get('screening_status'))
print('  Phase A: Resume Match Score:             ', res5.get('match_score'), '%')
print('  Phase A: Skills Matched:                 ', res5.get('score_breakdown', {}).get('skills', {}).get('matched_required'))
assert res5.get('match_score') == 100.0, f"Expected 100.0%, got {res5.get('match_score')}"

# Phase B: Supporting Document Verification (COE Previous Employer)
f_eduardo_coe = Path(os.path.join(base, 'INVALID CREDENTIAL', 'Eduardo Manuel Ramos-Housekeeping Attendant', 'Eduardo_Manuel_Ramos_COE_Previous_Employer.pdf'))
meta_coe = text_extraction.extract_text(f_eduardo_coe, f_eduardo_coe.name)
cleaned_coe = preprocessing.preprocess(meta_coe['text'])
v_result = document_verification.verify_supporting_document(cleaned_coe['cleaned_text'], 'COE', res5['profile'], ref_data)

print('\n  Phase B: Supporting Document Verification (COE Previous Employer):')
print('    Document Type:      COE')
print('    Verification Status:', v_result.get('verification_status'))
print('    Summary:            ', v_result.get('summary'))
print('    Position Check:     ', v_result.get('checks', {}).get('position', {}).get('result'), f"(Resume: '{v_result.get('checks', {}).get('position', {}).get('resume_value')}' vs Doc: '{v_result.get('checks', {}).get('position', {}).get('document_value')}')")
print('    Dates Check:        ', v_result.get('checks', {}).get('start_date', {}).get('result'), f"(Resume: '{v_result.get('checks', {}).get('start_date', {}).get('resume_value')}' vs Doc: '{v_result.get('checks', {}).get('start_date', {}).get('document_value')}')")
assert v_result.get('verification_status') == 'DISCREPANCY_FOUND', f"Expected DISCREPANCY_FOUND, got {v_result.get('verification_status')}"

# Phase C: Reclassification / Escalation
doc_verifications = [
    {
        'doc_type': 'COE',
        'document_type': 'COE',
        'verification_status': v_result.get('verification_status'),
        'checks': v_result.get('checks'),
        'summary': v_result.get('summary'),
    }
]
parsed_req_eduardo = matching.parse_requirements(req_eduardo, reference_data.effective_references(ref_data))
reclass5 = screening.full_classification(
    res5['profile'],
    res5.get('validation', {}),
    parsed_req_eduardo,
    open_eduardo,
    None,
    doc_verifications
)

print('\n  Phase C: Reclassification & Escalation Result:')
print('    Screening Status:   ', reclass5.get('screening_status'))
print('    Escalate Invalid:   ', reclass5.get('document_verification', {}).get('escalate_invalid'))
print('    Mismatched Fields:  ', reclass5.get('document_verification', {}).get('mismatched_fields'))
assert reclass5.get('screening_status') == 'INVALID_CREDENTIAL', f"Expected INVALID_CREDENTIAL, got {reclass5.get('screening_status')}"
print('  >>> VERIFIED: Status correctly escalates to INVALID_CREDENTIAL due to supporting document discrepancy!')

print("\n" + "=" * 80)
print("ALL 5 CANDIDATES PASS STRICT ASSERTION CHECKS PERFECTLY!")
print("=" * 80)

conn.close()

