import pymysql, json, subprocess, os

conn = pymysql.connect(host='127.0.0.1', port=3306, user='root', password='', database='hotel_hr', charset='utf8mb4')
cur = conn.cursor()

# 1. Clean Template Names (fix encoding artifact)
templates = [
    'Front Desk Receptionist — Core Requirements',
    'Guest Relations Officer — Core Requirements',
    'Restaurant Server — Core Requirements',
    'Bartender — Core Requirements',
    'Line Cook — Core Requirements',
    'Pastry Chef — Core Requirements',
    'Housekeeping Attendant — Core Requirements',
    'HR Assistant — Core Requirements',
]

for tname in templates:
    prefix = tname.split('—')[0].strip()
    cur.execute("UPDATE screening_requirement_templates SET name = %s WHERE name LIKE %s", (tname, f"{prefix}%"))
    print(f"  [Template Synced] {tname}")

# 2. Update Job Posts to align with templates and test applicants

# Job 1: Front Desk Receptionist
cur.execute("""
UPDATE job_posts SET
    skills_json = %s,
    qualifications_json = %s,
    education_level = "Bachelor's Degree",
    experience_level = '1-2 Years',
    status = 'Open',
    active = 1
WHERE job_post_id = 1
""", (
    json.dumps(['Guest Relations', 'Opera PMS', 'Check-in / Check-out', 'Cash Handling', 'Reservations']),
    json.dumps([
        "Bachelor's degree in Hospitality Management or related field.",
        "TESDA Front Office NC II certification.",
        "1-2 Years experience in hotel front desk operations.",
        "Proficiency in Opera Property Management System (PMS)."
    ])
))
print("  [Job Post 1 Updated] Front Desk Receptionist")

# Job 2: Line Cook
cur.execute("""
UPDATE job_posts SET
    skills_json = %s,
    qualifications_json = %s,
    education_level = 'Vocational / TESDA',
    experience_level = '1-2 Years',
    status = 'Open',
    active = 1
WHERE job_post_id = 2
""", (
    json.dumps(['Hot Kitchen', 'Food Handler', 'HACCP', 'Mise en Place', 'Plating']),
    json.dumps([
        "Vocational / TESDA diploma in Culinary Arts or Commercial Cooking.",
        "TESDA Cookery NC II certification.",
        "1-2 Years hands-on hot kitchen line experience.",
        "Valid Food Handler Certificate and HACCP compliance."
    ])
))
print("  [Job Post 2 Updated] Line Cook")

# Job 4: Restaurant Server
cur.execute("""
UPDATE job_posts SET
    skills_json = %s,
    qualifications_json = %s,
    education_level = 'High School Graduate',
    experience_level = 'No Experience',
    status = 'Open',
    active = 1
WHERE job_post_id = 4
""", (
    json.dumps(['Table Service', 'POS Systems', 'Banquet Service', 'Food Safety', 'Upselling']),
    json.dumps([
        "High School Graduate or equivalent.",
        "TESDA Food and Beverage Services NC II is an advantage.",
        "Good communication and guest table service skills.",
        "Valid Food Safety & Sanitary Food Handling Certificate."
    ])
))
print("  [Job Post 4 Updated] Restaurant Server")

# Job 5: Bartender
cur.execute("""
UPDATE job_posts SET
    skills_json = %s,
    qualifications_json = %s,
    education_level = 'Vocational / TESDA',
    experience_level = '1-2 Years',
    status = 'Open',
    active = 1
WHERE job_post_id = 5
""", (
    json.dumps(['Mixology', 'Cocktail Craft', 'Inventory', 'Bar Hygiene']),
    json.dumps([
        "Vocational / TESDA course in Bartending or Food & Beverage Services.",
        "TESDA Bartending NC II certification.",
        "1-2 Years experience in bar operations and beverage mixing.",
        "Knowledge of bar sanitation and inventory control."
    ])
))
print("  [Job Post 5 Updated] Bartender")

conn.commit()
conn.close()

# 3. Clear Laravel Cache
backend_dir = r"C:\Users\PC\Downloads\Ferdi\4TH_YR\DEV\v19\2nd-repo-for-hrms-backend-\backend-laravel"
try:
    subprocess.run(["php", "artisan", "cache:clear"], cwd=backend_dir, capture_output=True, text=True)
    subprocess.run(["php", "artisan", "config:clear"], cwd=backend_dir, capture_output=True, text=True)
    print("  [Cache] Laravel cache & config cleared successfully!")
except Exception as e:
    print(f"  [WARN] Cache clear: {e}")

print("\nSUCCESS: All Demo Job Posts and Templates are permanently synchronized!")
