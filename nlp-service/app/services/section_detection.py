"""Rule-based resume section detection.

Identifies common resume sections (summary, education, experience, skills,
certifications) by scanning line headers, so downstream extractors can use
section context instead of parsing the whole document blindly.

Detection strategy (in order):
1. Exact/regex header phrases (with optional trailing colon, bullets, and
   "&"/"and"-joined variants such as "EVENT & HOSPITALITY EXPERIENCE").
2. Fuzzy header recovery for OCR noise: a short line that is mostly
   alphabetic and close (>= 0.72 ratio) to a known header phrase is treated
   as that header, so "PROFESIONAL SUMARY" or "EXPERIENCE" with a stray
   character still segment correctly.
3. ALL-CAPS fallback: a short standalone caps line ending with a section
   keyword (e.g. "CORE COMPETENCIES", "TRAININGS ATTENDED") maps through the
   keyword table.
"""
import difflib
import re
from typing import Dict, List, Tuple

# Canonical section -> regex over the whole header line (anchored).
SECTION_PATTERNS = {
    "education": re.compile(
        r"^(educational\s+(?:background|attainment|credentials|history)|education(\s*(&(amp;)?|and)\s*(certifications?|trainings?|special\s+trainings?))?|acad(emic|emy)\s*(background|history|qualifications|credentials)?|academic\s+credentials|tertiary\s+education|qualifications|scholastic\s+records?)\b",
        re.I,
    ),
    "experience": re.compile(
        r"^((?:work|professional|employment|relevant|hotel|career|event|hospitality|resort|restaurant|culinary|industry|related|previous)(?:\s*(&(amp;)?|and)\s*(?:work|professional|employment|hotel|hospitality|resort|restaurant|culinary|event|industry|related|catering|events?|hospitality))*\s+(?:experience|history|background|record)|experience|employment(\s+history)?|work\s+history|career\s+history|previous\s+employment|professional\s+background)\b",
        re.I,
    ),
    "skills": re.compile(
        r"^((?:technical|core|key|relevant|professional|practical|other)\s+)?(skills(\s*(&(amp;)?|and)\s*(competencies|abilities|expertise|strengths))?|competencies|expertise|strengths|areas?\s+of\s+expertise|qualifications\s*(&(amp;)?|and)\s*skills|core\s+competencies|proficiencies)\b",
        re.I,
    ),
    "certifications": re.compile(
        r"^((?:certifications?|licenses?|licences?|certificates?|trainings?|seminars?|workshops?|credentials?|professional\s+development)(\s*(&(amp;)?|and)\s*(seminars?|trainings?|certifications?|licenses?|development|workshops?|special\s+trainings?))?|(education\s*(&(amp;)?|and)\s*(certifications?|trainings?))|professional\s+certifications?|licenses?\s*(&(amp;)?|and)\s*certifications?|trainings?\s+(?:attended|completed))\b",
        re.I,
    ),
    "summary": re.compile(
        r"^(professional\s+|career\s+|executive\s+|personal\s+)?(summary|profile|objective|about\s+me|career\s+objective|personal\s+profile|biography|career\s+profile)\b",
        re.I,
    ),
    "contact": re.compile(
        r"^(contact\s+(?:information|details?)|contact|get\s+in\s+touch|personal\s+information|personal\s+details?|name|address)\b",
        re.I,
    ),
    "additional": re.compile(
        r"^(additional\s+information|languages?(\s+spoken|\s+proficiency)?|awards?(\s*(&(amp;)?|and)\s*(recognition|honors?|achievements?))?|honors?(\s*(&(amp;)?|and)\s*awards?)?|references?(\s+available\s+upon\s+request|\s+available|\s+upon\s+request)?|character\s+references?|professional\s+references?|affiliations?|memberships?(\s*(&(amp;)?|and)\s*affiliations?)?|other\s+information|interests|hobbies|eligibility|volunteer(?:ing)?\s+(?:work|experience))\b",
        re.I,
    ),
}

_HEADER_LINE_LENGTH_MAX = 60

# Words that indicate remainder of a header line rather than actual section body text
_HEADER_LEFTOVER_RE = re.compile(
    r"^(&(amp;)?|and|\+|/|-|–|—)?\s*(training|seminars?|certifications?|licenses?|education|experience|skills|development|courses?)\b.*$",
    re.I,
)

# Trailing punctuation that may follow a header ("SKILLS:", "PROFILE -")
_HEADER_TRAILING = re.compile(r"[\s:–-]*$")

# Fuzzy-recovery vocabulary: every known header phrase mapped to its section.
_FUZZY_HEADERS: List[Tuple[str, str]] = []
for _section, _pattern in SECTION_PATTERNS.items():
    if _section == "contact":
        # "CONTACT" alone is too generic for fuzzy matching; keep exact only.
        continue
    for phrase in (
        "EDUCATION", "EDUCATIONAL BACKGROUND", "ACADEMIC QUALIFICATIONS",
        "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EMPLOYMENT HISTORY",
        "EXPERIENCE", "WORK HISTORY", "CAREER HISTORY", "RELEVANT EXPERIENCE",
        "SKILLS", "CORE SKILLS", "TECHNICAL SKILLS", "COMPETENCIES", "EXPERTISE",
        "CERTIFICATIONS", "CERTIFICATES", "TRAININGS", "LICENSES",
        "TRAININGS AND SEMINARS", "SEMINARS AND TRAININGS",
        "SUMMARY", "PROFESSIONAL SUMMARY", "PROFILE", "OBJECTIVE",
        "ADDITIONAL INFORMATION", "LANGUAGES", "AWARDS", "REFERENCES",
    ):
        _FUZZY_HEADERS.append((phrase, _section))

# Section keyword -> section for the ALL-CAPS fallback.
_KEYWORD_SECTION = {
    "education": "education", "academic": "education",
    "experience": "experience", "employment": "experience", "history": "experience",
    "skills": "skills", "competencies": "skills", "expertise": "skills",
    "proficiencies": "skills", "strengths": "skills",
    "certifications": "certifications", "certificates": "certifications",
    "trainings": "certifications", "seminars": "certifications", "licenses": "certifications",
    "summary": "summary", "profile": "summary", "objective": "summary",
    "languages": "additional", "awards": "additional", "references": "additional",
    "affiliations": "additional", "hobbies": "additional", "interests": "additional",
}

_STRIP_PREFIX = re.compile(
    r"^[\u2022\u25cf\u25aa\u2023\u2043\u2043\u25b8\u25b9\u25ba\u25c6\u25c7\u25a0\u25a1\u25cb\u25b6o\-–—*●•✓▸◆►▹\s]+"
)

_FUZZY_CACHE: Dict[str, List[str]] = {}


def _fuzzy_header_match(clean_head: str) -> List[str]:
    """Returns section(s) when the line is a close OCR variant of a known header."""
    normalized = clean_head.upper().strip(" :")
    if not normalized or not normalized.isalpha():
        # Allow spaces only; digits/symbols make a header match unreliable.
        if not re.fullmatch(r"[A-Z][A-Z\s&']+", normalized):
            return []
    key = normalized.upper()
    cached = _FUZZY_CACHE.get(key)
    if cached is not None:
        return cached
    best = difflib.get_close_matches(key, [p for p, _ in _FUZZY_HEADERS], n=1, cutoff=0.78)
    result: List[str] = []
    if best:
        ratio = difflib.SequenceMatcher(None, key, best[0]).ratio()
        if ratio >= 0.78 and len(key) >= 5:
            result = [dict(_FUZZY_HEADERS)[best[0]]]
    _FUZZY_CACHE[key] = result
    return result


def _caps_keyword_match(clean_head: str) -> List[str]:
    """ALL-CAPS short lines ending in a section keyword, e.g. 'CORE COMPETENCIES'."""
    if not clean_head or not clean_head.isupper():
        return []
    words = re.findall(r"[A-Za-z]+", clean_head)
    if not words or len(clean_head) > _HEADER_LINE_LENGTH_MAX:
        return []
    for word in reversed(words):
        section = _KEYWORD_SECTION.get(word.lower())
        if section:
            return [section]
    return []


def _normalize_letter_spacing(line: str) -> str:
    """Collapses letter-spaced headers like 'P R O F I L E' or 'E X P E R I E N C E'."""
    words = line.split()
    if len(words) >= 3 and sum(len(w) for w in words) / len(words) <= 1.5 and all(w.isupper() for w in words):
        collapsed = "".join(words)
        for phrase, target in [
            ("PROFESSIONALEXPERIENCE", "PROFESSIONAL EXPERIENCE"),
            ("WORKEXPERIENCE", "WORK EXPERIENCE"),
            ("PROFESSIONALSUMMARY", "PROFESSIONAL SUMMARY"),
            ("CORESKILLS", "CORE SKILLS"),
            ("TECHNICALSKILLS", "TECHNICAL SKILLS"),
            ("CERTIFICATIONS", "CERTIFICATIONS"),
            ("CERTIFICATION", "CERTIFICATIONS"),
            ("EDUCATION", "EDUCATION"),
            ("EXPERIENCE", "EXPERIENCE"),
            ("SUMMARY", "SUMMARY"),
            ("PROFILE", "PROFILE"),
            ("SKILLS", "SKILLS"),
            ("LANGUAGES", "LANGUAGES"),
            ("AWARDS", "AWARDS"),
        ]:
            if collapsed == phrase or collapsed.startswith(phrase):
                return target
        return collapsed
    return line


def detect_sections(text: str) -> Dict[str, str]:
    """Returns a mapping of detected section names to their body text."""
    sections: Dict[str, str] = {}
    if not text:
        return sections

    lines = text.split("\n")
    current_targets: List[str] = []
    buffer: List[str] = []

    def flush():
        if current_targets:
            body = "\n".join(buffer).strip()
            for target in current_targets:
                # If target already exists, append new content
                if target in sections and sections[target]:
                    sections[target] = sections[target] + "\n" + body
                else:
                    sections[target] = body

    for line in lines:
        stripped = line.strip()
        matched_targets: List[str] = []

        if 0 < len(stripped) <= _HEADER_LINE_LENGTH_MAX:
            clean_head = _STRIP_PREFIX.sub("", stripped)
            clean_head = _normalize_letter_spacing(clean_head)
            # Drop trailing colon/dash decorations before matching.
            clean_head = _HEADER_TRAILING.sub("", clean_head).strip()

            if re.match(r"^education\s*(&(amp;)?|and)\s*(certifications?|trainings?|special\s+trainings?)", clean_head, re.I):
                matched_targets = ["education", "certifications"]
            else:
                for name, pattern in SECTION_PATTERNS.items():
                    if pattern.match(clean_head):
                        if stripped.endswith(".") and len(stripped) > 30:
                            continue
                        matched_targets = [name]
                        break
                if not matched_targets:
                    matched_targets = _fuzzy_header_match(clean_head)
                if not matched_targets:
                    matched_targets = _caps_keyword_match(clean_head)

        if matched_targets:
            flush()
            current_targets = matched_targets
            buffer = []
            # Check if there is genuine content on the same line after the header (e.g. "SKILLS: Python, Java")
            first_target = matched_targets[0]
            remainder = SECTION_PATTERNS[first_target].sub("", stripped, count=1).strip(" :–-")
            if remainder and not _HEADER_LEFTOVER_RE.match(remainder) and len(remainder) > 3:
                buffer.append(remainder)
        elif current_targets:
            buffer.append(line)

    flush()
    return sections
