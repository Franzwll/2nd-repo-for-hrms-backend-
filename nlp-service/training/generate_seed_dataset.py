"""Generates a seed annotated NER dataset of synthetic hotel-industry resumes.

Every resume is assembled programmatically, so entity offsets are exact by
construction. The output follows the annotation format described in
training/ANNOTATION_GUIDELINES.md and is a legitimate starting corpus; real
annotated resumes can replace or extend it without changing any downstream
step.

Usage:  python training/generate_seed_dataset.py [count] [output.json]
"""
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

OUT_DEFAULT = Path(__file__).parent / "data" / "annotated_resumes.json"

FIRST_NAMES = [
    "Juan", "Maria", "Jose", "Ana", "Carlo", "Nina", "Paolo", "Liza", "Miguel",
    "Grace", "Leo", "Rosa", "Dennis", "Katrina", "Allan", "Joyce", "Ramon",
    "Ella", "Victor", "Sharon", "Ferdinand", "Camille", "Rico", "Bea",
]
LAST_NAMES = [
    "Dela Cruz", "Santos", "Reyes", "Bautista", "Villanueva", "Mercado",
    "Gonzales", "Aquino", "Torres", "Salvador", "Navarro", "Lumibao",
    "Castillo", "Marquez", "Fernandez", "Ocampo", "Rivera", "Domingo",
]

SKILLS_BY_ROLE = {
    "Bartender": ["Mixology", "Inventory Control", "Guest Relations", "Cash Handling", "Responsible Alcohol Service"],
    "Barista": ["Coffee Preparation", "Customer Service", "POS Systems", "Cash Handling"],
    "Line Cook": ["Food Safety", "HACCP", "Knife Skills", "Plating", "Mise en Place"],
    "Housekeeping Attendant": ["Room Turnover", "Linen Handling", "Attention to Detail", "Chemical Safety"],
    "Restaurant Server": ["Table Service", "POS Systems", "Upselling", "Banquet Service"],
    "Front Desk Receptionist": ["Guest Relations", "Check-in / Check-out", "Property Management Systems", "Reservations"],
}
CERTS_BY_ROLE = {
    "Bartender": ["TESDA Bartending NC II"],
    "Barista": ["Barista NC II", "Food Handler Certificate"],
    "Line Cook": ["TESDA Cookery NC II", "Food Handler Certificate"],
    "Housekeeping Attendant": ["TESDA Housekeeping NC II"],
    "Restaurant Server": ["TESDA Food and Beverage Services NC II"],
    "Front Desk Receptionist": ["TESDA Front Office NC II"],
}
EDUCATION_OPTIONS = [
    "High School Graduate",
    "Vocational / TESDA Course",
    "College Level",
    "BS Hospitality Management",
    "BS Tourism",
    "BS Psychology",
]
COMPANIES = [
    "Sky Lounge BGC", "Cafe Verde", "Seaside Grill Hotel", "Sunrise Inn",
    "Bistro Manila", "Grand Horizon Hotel", "Oxford Suites Makati",
    "Harbor View Restaurant", "Palm Court Hotel",
]
YEARS_START = list(range(2015, 2023))


def _build_resume(rng: random.Random) -> dict:
    """Assembles one resume, recording exact character spans for each entity."""
    role = rng.choice(list(SKILLS_BY_ROLE.keys()))
    first = rng.choice(FIRST_NAMES)
    last = rng.choice(LAST_NAMES)
    name = f"{first} {last}"
    email = f"{first.lower()}.{last.lower().replace(' ', '')}@email.com"
    phone = f"09{rng.randint(100, 999)} {rng.randint(100, 999)} {rng.randint(1000, 9999)}"
    years_exp = rng.randint(1, 6)
    start_year = rng.choice(YEARS_START)
    end_year = min(start_year + years_exp, 2026)
    company = rng.choice(COMPANIES)
    education = rng.choice(EDUCATION_OPTIONS)
    skills_pool = SKILLS_BY_ROLE[role]
    other_skills_pool = [s for r, ss in SKILLS_BY_ROLE.items() if r != role for s in ss]
    skills = rng.sample(skills_pool, k=min(len(skills_pool), rng.randint(2, 4)))
    if rng.random() < 0.8 and other_skills_pool:
        base = rng.choice(other_skills_pool)
        unrecognized_skill = f"{base} Framework Level {rng.randint(2, 9)}"
    else:
        unrecognized_skill = "Quantum Hospitality Dynamics"
    certs_pool = CERTS_BY_ROLE.get(role, [])
    certs = rng.sample(certs_pool, k=rng.randint(0, len(certs_pool))) or []

    sections: list[str] = []
    entities: list[list] = []
    cursor = 0

    def place(text: str, label: str | None = None) -> str:
        nonlocal cursor
        start = cursor
        sections.append(text)
        cursor += len(text)
        if label:
            entities.append([start, start + len(text), label])

    def line(*fragments: tuple[str, str | None]):
        """Emits one line from (text, optional_label) fragments; labels must
        cover exactly the entity substring, never the bullet or newline."""
        for text, label in fragments:
            place(text, label)
        place("\n")

    line((name, "PERSON"))
    line((f"Email: {email} | Phone: {phone}", None))
    line(("", None))
    header_title = rng.choice(["PROFILE", "SUMMARY"])
    line((header_title, None))
    summary_sentence = f"Dedicated {role} with {years_exp} years of experience."
    role_at = summary_sentence.index(role)
    line(
        (summary_sentence[:role_at], None),
        (role, "JOB_TITLE"),
        (summary_sentence[role_at + len(role):], None),
    )
    line(("", None))
    line((rng.choice(["WORK EXPERIENCE", "EXPERIENCE"]), None))
    exp_tail = f" - {company} | {start_year} - {end_year}"
    line((role, "JOB_TITLE"), (exp_tail, None))
    line(("Performed duties with quality and consistency.", None))
    line(("", None))
    skills_header = rng.choice(["SKILLS", "CORE SKILLS"])
    line((skills_header, None))
    for skill in skills:
        line(("- ", None), (skill, "SKILL"))
    if rng.random() < 0.8:
        line((f"- {unrecognized_skill}", None))
    line(("", None))
    edu_header = rng.choice(["EDUCATION", "EDUCATIONAL BACKGROUND"])
    line((edu_header, None))
    line((education, "EDUCATION"))
    line(("", None))
    if certs:
        cert_header = rng.choice(["CERTIFICATIONS", "LICENSES AND CERTIFICATIONS"])
        line((cert_header, None))
        for cert in certs:
            line(("- ", None), (cert, "CERTIFICATION"))

    return {"text": "".join(sections), "entities": entities}


def main(count: int = 48, output: Path = OUT_DEFAULT) -> None:
    rng = random.Random(2026)
    dataset = [_build_resume(rng) for _ in range(count)]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(dataset, indent=1), encoding="utf-8")
    total_entities = sum(len(d["entities"]) for d in dataset)
    print(f"Wrote {len(dataset)} annotated resumes ({total_entities} entities) to {output}")


if __name__ == "__main__":
    count_arg = int(sys.argv[1]) if len(sys.argv) > 1 else 48
    out_arg = Path(sys.argv[2]) if len(sys.argv) > 2 else OUT_DEFAULT
    main(count_arg, out_arg)
