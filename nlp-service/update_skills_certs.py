import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from app.services import reference_data

base = Path(__file__).parent.parent / "reference" / "RESUME" / "new"
if not base.exists():
    base = Path(r"C:\Users\PC\Downloads\Ferdi\4TH_YR\DEV\v7 (orig)\2nd-repo-for-hrms-backend-\reference\RESUME\new")

skills_path = Path(__file__).parent / "app" / "data" / "skills.json"
certs_path = Path(__file__).parent / "app" / "data" / "certifications.json"

skills = json.loads(skills_path.read_text(encoding="utf-8"))
certs = json.loads(certs_path.read_text(encoding="utf-8"))

# Collect from dataset
new_skills=set()
new_certs=set()
for folder in base.iterdir():
    if not folder.is_dir():
        continue
    txts = list(folder.glob("*.txt"))
    if not txts:
        continue
    txt = txts[0].read_text(encoding="utf-8", errors="ignore")
    for m in re.finditer(r'CORE SKILLS\s*\n(.*?)\n\s*PROFESSIONAL EXPERIENCE', txt, re.S|re.I):
        for line in m.group(1).split("\n"):
            line=line.strip()
            if line.startswith("-"):
                s=line.lstrip("- ").strip()
                s=re.sub(r'\s+',' ',s).strip()
                if s and 3 < len(s) < 80:
                    new_skills.add(s)
    # also capture skills that are in variation sections where CORE SKILLS appears multiple times, already handled via finditer
    for m in re.finditer(r'Certifications and Training:\s*\n(.*?)(?:\n\nAdditional|\n\n$)', txt, re.S|re.I):
        for line in m.group(1).split("\n"):
            line=line.strip()
            if line.startswith("-"):
                c=line.lstrip("- ").strip()
                c=re.sub(r'\s+',' ',c).strip()
                if c and 5 < len(c) < 120:
                    new_certs.add(c)
    for m in re.finditer(r'Certifications?:\s*\n(.*?)(?:\n\n)', txt, re.S|re.I):
        for line in m.group(1).split("\n"):
            line=line.strip()
            if line.startswith("-"):
                c=line.lstrip("- ").strip()
                if c and 5 < len(c) < 120:
                    new_certs.add(c)

print(f"Collected {len(new_skills)} skills, {len(new_certs)} certs from dataset")

# Normalize existing for comparison (lowercase canonical)
existing_skill_canonicals = {k.lower(): k for k in skills.keys()}
existing_skill_aliases = set()
for canon, aliases in skills.items():
    for a in aliases:
        existing_skill_aliases.add(a.lower())

added_skills = 0
for s in sorted(new_skills):
    low = s.lower()
    if low in existing_skill_canonicals:
        continue
    if low in existing_skill_aliases:
        continue
    # also check via canonicalize (fuzzy may match)
    can = reference_data.canonicalize(s, skills)
    if can:
        continue
    # Add as new canonical with aliases: lowercased, without special chars variant
    aliases = [low]
    # add alias without '&' -> 'and'
    if '&' in s:
        aliases.append(low.replace('&','and').strip())
    # add alias without slash?
    skills[s] = aliases
    added_skills += 1
    print(f"Added skill: {s} -> {aliases}")

print(f"Added {added_skills} new skills, total now {len(skills)}")

added_certs = 0
existing_cert_canonicals = {k.lower(): k for k in certs.keys()}
existing_cert_aliases = set()
for canon, aliases in certs.items():
    for a in aliases:
        existing_cert_aliases.add(a.lower())

for c in sorted(new_certs):
    low = c.lower()
    if low in existing_cert_canonicals or low in existing_cert_aliases:
        continue
    can = reference_data.canonicalize(c, certs)
    if can:
        continue
    # Clean canonical: keep as is, aliases lower
    # Create aliases: lower, without year, without org
    aliases = [low]
    # alias without trailing year and org in parentheses
    no_year = re.sub(r'\s*\(?\b(19|20)\d{2}\)?\s*$','',c).strip()
    if no_year and no_year.lower()!=low:
        aliases.append(no_year.lower())
    # alias without dash org
    no_org = re.sub(r'\s*-\s*[^-]+$','',c).strip()
    if no_org and no_org.lower()!=low and len(no_org)>10:
        aliases.append(no_org.lower())
    # dedupe
    aliases = list(dict.fromkeys([a for a in aliases if a]))
    certs[c] = aliases
    added_certs += 1
    print(f"Added cert: {c} -> {aliases}")

print(f"Added {added_certs} new certs, total now {len(certs)}")

# Write back
skills_path.write_text(json.dumps(skills, indent=2, ensure_ascii=False), encoding="utf-8")
certs_path.write_text(json.dumps(certs, indent=2, ensure_ascii=False), encoding="utf-8")
print("Wrote updated JSON files")
