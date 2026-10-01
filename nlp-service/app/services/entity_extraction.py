"""Entity extraction pipeline.

Combines four documented extraction methods and tags every produced entity
with its method so no extraction is falsely labelled as pure NER:

- regex            -> email / phone / date ranges
- section_rule     -> section-context keyword matching against reference data
- spacy_base       -> spaCy en_core_web_sm statistical NER (PERSON / ORG)
- custom_ner       -> trained role-specific NER model when available

Robustness features beyond plain rules:

- OCR e-mail repair: "(at)"/"[at]" -> @, spaced dots, split lines, common
  domain typos (gmai1/gmial -> gmail, yah00 -> yahoo, .c0m/.corn -> .com).
- Address recovery from mixed contact lines ("0917... a@b.com Makati City,
  Philippines linkedin.com/in/x") by stripping contact tokens first.
- Scattered-name assembly for two-column PDF layouts where the given/middle/
  family name land on separate interleaved lines.
- Work-history lines of the form "Title <sep> Company, City | Date range".
"""
import difflib
import re
from datetime import date
from typing import Dict, List, Optional, Tuple

import spacy

from app import config
from app.services import reference_data as refdata
from app.services.section_detection import detect_sections

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
EMAIL_LOOSE_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+")
PHONE_RE = re.compile(
    r"(?:\+?63[\s.-]?|0)(9\d{2})[\s.-]?(\d{3})[\s.-]?(\d{4})"
    r"|\(?(0\d{2,3})\)?[\s.-]?(\d{3,4})[\s.-]?(\d{3,4})(?:\s(?:local|loc)\.?\s*\d+)?",
)
GENERIC_PHONE_RE = re.compile(r"\b\d[\d\s().-]{6,16}\d\b")
URL_RE = re.compile(r"(?:https?://|www\.)\S+|(?:linkedin\.com|github\.com|fb\.com|facebook\.com)/\S+", re.I)

# ---------------------------------------------------------------------------
# OCR e-mail repair
# ---------------------------------------------------------------------------

_EMAIL_AT_VARIANTS = re.compile(
    r"(?<=[A-Za-z0-9._%+-])\s*(?:\(\s*at\s*\)|\[\s*at\s*\]|\{\s*at\s*\}|\bat\b)\s*(?=[A-Za-z0-9][A-Za-z0-9.-]*\.[A-Za-z]{2,})",
    re.I,
)
_EMAIL_DOT_VARIANTS = re.compile(r"[\[\{(]dot[\]\)}]", re.I)
_EMAIL_JOIN_LINEBREAK_1 = re.compile(r"([A-Za-z0-9._%+-]+)\s*\n\s*@")
_EMAIL_JOIN_LINEBREAK_2 = re.compile(r"@\s*\n\s*([A-Za-z0-9.-]+)")
_EMAIL_JOIN_TLD_SPLIT = re.compile(r"([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+)\s*\n\s*\.([A-Za-z]{2,})")
# Column-boundary splits inside the local part: "dan\niel.cruz@gmail.com".
# The leading fragment is capped at 4 chars and common labels are excluded.
_EMAIL_JOIN_LOCAL_SPLIT = re.compile(
    r"\b([A-Za-z0-9._%+-]{1,4})\n(?!(?:email|mail|info|name|tel|web|phone)\b)"
    r"([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})",
    re.I,
)
_EMAIL_SPACED_AT = re.compile(r"(?<=[A-Za-z0-9._%+-])\s*@\s*(?=[A-Za-z0-9])")
_EMAIL_SPACED_DOT = re.compile(r"(?<=[A-Za-z0-9])\s*\.\s*(?=[A-Za-z0-9])")
_EMAIL_MISSING_TLD_DOT = re.compile(r"@(gmail|yahoo|hotmail|outlook|ymail)\s+com\b", re.I)

_DOMAIN_TYPO_FIXES = [
    (re.compile(r"\bgmai1\b", re.I), "gmail"),
    (re.compile(r"\bgmial\b", re.I), "gmail"),
    (re.compile(r"\bgmails\b", re.I), "gmail"),
    (re.compile(r"\bgnail\b", re.I), "gmail"),
    (re.compile(r"\bgemail\b", re.I), "gmail"),
    (re.compile(r"\bhotmai1\b", re.I), "hotmail"),
    (re.compile(r"\bhotmial\b", re.I), "hotmail"),
    (re.compile(r"\byah00\b", re.I), "yahoo"),
    (re.compile(r"\byahooo\b", re.I), "yahoo"),
    (re.compile(r"\byafoo\b", re.I), "yahoo"),
    (re.compile(r"\boutl00k\b", re.I), "outlook"),
    (re.compile(r"\boutlok\b", re.I), "outlook"),
    (re.compile(r"\.c0m\b", re.I), ".com"),
    (re.compile(r"\.corn\b", re.I), ".com"),
    (re.compile(r"\.comm\b", re.I), ".com"),
    (re.compile(r"\.cm\b", re.I), ".com"),
    (re.compile(r"\.ph0\b", re.I), ".ph"),
    (re.compile(r"\.edu\.ph\.", re.I), ".edu.ph"),
]

MONTHS = {
    "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3,
    "apr": 4, "april": 4, "may": 5, "june": 6, "jun": 6,
    "jul": 7, "july": 7, "aug": 8, "august": 8, "sep": 9, "september": 9,
    "oct": 10, "october": 10, "nov": 11, "november": 11, "dec": 12, "december": 12,
}

DATE_RANGE_RE = re.compile(
    r"(?P<start>(?:(?P<sm>[A-Za-z]{3,9})\.?\s+(?:\d{1,2}(?:st|nd|rd|th)?,?\s+)?)?(?P<sy>(?:19|20)\d{2}))\s*(?:-|–|—|to|until|through|\?|\ufffd)\s*"
    r"(?P<end>(?:(?P<em>[A-Za-z]{3,9})\.?\s+(?:\d{1,2}(?:st|nd|rd|th)?,?\s+)?)?(?:(?P<ey>(?:19|20)\d{2})|present|current|now))\b",
    re.I,
)
YEARS_PHRASE_RE = re.compile(r"(\d{1,2}(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of\s+experience)?\b", re.I)

# Calendar-only fragments that the section rules sometimes pick up as if they
# were entities: "(October 2020)", "Conducted On March 2019", "Issued: 2022-03".
# A date is metadata attached to an entry, never the name of a credential.
_DATE_ONLY_FRAGMENT_RE = re.compile(
    r"^(?:(?:conducted|issued|given|dated|held|taken|obtained|earned|completed|awarded|"
    r"valid|conferred|attended|finished|on|last|since|the)\b[\s:,-]*)*"
    r"(?:(?:(?:[A-Za-z]{3,9})\.?\s+)?(?:\d{1,2}(?:st|nd|rd|th)?,?\s+)?(?:19|20)\d{2}"
    r"|(?:19|20)\d{2}[-/.]\d{1,2}(?:[-/.]\d{1,2})?"
    r"|\d{1,2}[-/.]\d{1,2}[-/.](?:19|20)\d{2})$",
    re.I,
)


def is_date_only_fragment(value: str) -> bool:
    """True when a string carries nothing but a date (with optional lead-in words)."""
    text = (value or "").strip().strip("()[]{} .,;:-|•*")
    if not text:
        return False
    return bool(_DATE_ONLY_FRAGMENT_RE.match(text))

WORD_NUMS = {
    "one": 1.0, "two": 2.0, "three": 3.0, "four": 4.0, "five": 5.0,
    "six": 6.0, "seven": 7.0, "eight": 8.0, "nine": 9.0, "ten": 10.0,
}

DEGREE_PATTERNS = [
    re.compile(r"\b(bachelor(?:'s)?(?:\s+of\s+science|\s+of\s+arts)?(?:\s+degree)?|b\.?s\.?c?\.?|bsba|bsitm|bshm)\s+(?:in|of)\s+[^,\n;]{3,60}", re.I),
    re.compile(r"\b(master(?:'s)?(?:\s+of\s+science|\s+of\s+arts)?(?:\s+degree)?|m\.?s\.?|mba)\s+(?:in|of)\s+[^,\n;]{3,60}", re.I),
    re.compile(r"\b(bachelor\s+of\s+[a-z\s&/]{3,60})", re.I),
    re.compile(r"\b(b\.?s\.?\s+in\s+[a-z\s&/]{3,60}|b\.?a\.?\s+in\s+[a-z\s&/]{3,60})", re.I),
    re.compile(r"\b(vocational(?:\s*/\s*tesda)?(?:\s+[a-z\s&/,-]{3,50})?|tesda(?:\s+[a-z\s&/,-]{3,50})?)\b", re.I),
    re.compile(r"\b(college\s+level(?:\s*,\s*[a-z\s&/,-]{3,50})?|college\s+undergraduate)\b", re.I),
    re.compile(r"\b(diploma\s+(?:in|of)\s+[a-z\s,&-]{3,60})", re.I),
    re.compile(r"\b(vocational\s+diploma\s+(?:in|of)\s+[a-z\s,&-]{3,60})", re.I),
    re.compile(r"\b(associate(?:'s)?\s+degree(?:\s+(?:in|of)\s+[a-z\s,&-]{3,60})?)", re.I),
    re.compile(r"\b(certificate\s+(?:in|of)\s+[a-z\s,&-]{3,60})", re.I),
    re.compile(r"\b(senior\s+high\s+school\s+diploma|high\s+school\s+graduate|high\s+school|secondary\s+education)\b", re.I),
    re.compile(r"\b(bachelor(?:'s)?\s+degree|master(?:'s)?\s+degree|college\s+graduate)\b", re.I),
    # Standalone honours-degree acronyms common in PH hospitality resumes.
    re.compile(r"\b(BSHM|BSITM|BSBA|BSCS|BSA|BSN|AB|BS)\b(?=\s*[-–,(]|\s+(?:in|major|degree)\b)"),
    re.compile(r"\b(?:graduated|graduate)\s+(?:of|with\s+a?)\s*((?:bachelor|diploma|certificate)[^,\n;]{3,60})", re.I),
]

CERT_HINT_RE = re.compile(
    r"\b(tesda[a-z\s]*nc\s*(?:i{1,3}|iv|1-4)|[a-z][a-z\s'\-&/()]{2,60}(?:certificate|certification|license|licence|training|workshop)|nc\s*(?:i{1,3}|iv)\b)",
    re.I,
)

_NAME_STOPWORDS = {
    "resume", "curriculum", "vitae", "personal", "information", "contact",
    "address", "philippines", "email", "phone", "mobile", "applicant",
    "objective", "summary", "profile", "manila", "quezon", "city",
    "about", "me", "linkedin", "github", "portfolio", "touch", "get",
    "languages", "awards", "references", "available", "upon", "request",
    "page", "declaration", "details", "makati", "pasay", "taguig",
    "mandaluyong", "paranaque", "marikina", "pasig", "caloocan",
    "muntinlupa", "las", "pinas", "batangas", "cavite", "antipolo",
    "rizal", "tagaytay", "cebu", "davao", "street", "st", "ave",
    "avenue", "road", "rd", "blvd", "block", "lot", "brgy", "barangay",
    "location", "phone", "email",
}

_NAME_ROLE_WORDS = {
    "professional", "manager", "supervisor", "specialist", "officer",
    "coordinator", "assistant", "associate", "attendant", "agent",
    "intern", "trainee", "staff", "personnel", "director", "executive",
    "representative", "consultant", "technician", "engineer", "chef",
    "cook", "server", "bartender", "barista", "receptionist", "housekeeper",
    "cashier", "host", "hostess", "auditor", "steward", "crew",
    "lead", "leader", "clerk", "controller", "helper",
    # section/heading/action words
    "training", "hygiene", "supervision", "management", "operations",
    "competencies", "references", "certifications", "development",
    "experience", "education", "skills", "work", "service", "services",
    "booking", "systems", "repair", "response", "maintenance",
    "installation", "sanitation", "safety", "handling", "processing",
    "reporting", "coordination", "relations", "facilitation", "excellence",
    "standards", "compliance", "inspection", "audit", "control",
    "accounting", "administration", "procurement", "purchasing", "inventory",
    "sales", "marketing", "logistics", "recreation", "beverage",
    "culinary", "hospitality", "hotel", "resort", "restaurant", "dining",
    "food", "guest", "front", "desk", "office", "housekeeping",
    "laundry", "events", "catering", "banquet", "kitchen", "pastry",
    "bakery", "bar", "customer", "support", "technical", "core",
    # extra heading words seen in banner templates
    "profile", "summary", "objective", "overview", "background",
}

_NAME_HEADER_PREFIX_RE = re.compile(
    r"^(?:contact|name|applicant|candidate|personal\s+information|personal\s+details)\s*[:\-–]?\s+(.+)$",
    re.I,
)

_EDU_NOISE_VALUES = {
    "education", "educational background", "bachelor of", "master of",
    "international school for", "academic qualifications", "qualifications",
}

_PH_CITIES = [
    "Makati City", "Taguig City", "Pasig City", "Quezon City", "Manila",
    "Pasay City", "Mandaluyong City", "Parañaque City", "Marikina City",
    "Las Piñas City", "Muntinlupa City", "Caloocan City", "Malabon City",
    "Navotas City", "Valenzuela City", "San Juan City", "Pateros",
    "Antipolo City", "Tagaytay City", "Batangas City", "Cebu City", "Davao City",
    "Makati", "Taguig", "Pasig", "Quezon", "Pasay", "Mandaluyong",
    "Parañaque", "Marikina", "Las Piñas", "Muntinlupa", "Antipolo",
    "Tagaytay", "Batangas", "Cavite", "Rizal", "Laguna", "Bulacan", "Pampanga",
    "Cebu", "Davao", "Metro Manila", "NCR", "Iloilo", "Bacolod",
    "Baguio", "Angeles", "San Fernando", "General Santos", "Ilocos",
    "Bicol", "Nueva Ecija", "Tarlac", "Pangasinan", "Zambales", "Bataan",
    # Unaccented spellings — PDF text extraction frequently drops the ñ
    # ("Paranaque City", "Las Pinas") which used to fail every city check.
    "Paranaque City", "Paranaque", "Las Pinas City", "Las Pinas",
    "Dasmariñas", "Dasmariñas City", "Dasmariñas", "Binan", "Biñan",
    "Sta. Rosa", "Santa Rosa", "Calamba", "Cabuyao", "Los Banos", "Los Baños",
    "San Pedro", "Imus", "Bacoor", "Lipa City", "Lipa", "Lucena",
    "Cagayan de Oro", "Iligan", "Zamboanga", "Dumaguete", "Naga",
    "Legazpi", "Vigan", "Dagupan", "Urdaneta", "Malolos", "Meycauayan",
    "Marilao", "Mandaue", "Lapu-Lapu", "Mactan", "Alabang", "Sucat",
    "Novaliches", "Cubao", "Ermita", "Malate", "Bgc", "Ortigas",
    "Silang", "Trece Martires", "Tanauan", "San Pablo", "Kawit",
]

# Words that mark a token sequence as an organization rather than a person.
_ORG_SUFFIX_WORDS = {
    "hotel", "hotels", "resort", "resorts", "restaurant", "restaurants",
    "cafe", "cafeteria", "catering", "services", "service", "group",
    "corporation", "corp", "inc", "inc.", "llc", "company", "co",
    "grill", "bistro", "trattoria", "roasters", "spa", "inn", "suites",
    "tower", "center", "centre", "plaza", "manor", "lodge", "kitchen",
    "garden", "gardens", "mart", "store", "stores", "bank", "clinic",
}

# Articles/connectives that never begin a person's name.
_NAME_ASSEMBLY_STOPWORDS = _NAME_STOPWORDS | _NAME_ROLE_WORDS | {
    "the", "and", "of", "for", "at", "in", "on", "a", "an", "or", "to",
}

# Prefixes of section-heading words, used to reject OCR-mangled headings
# ("PROFESSIONA", "CERTIFITATONS") that slip past exact stopword lists.
_SECTION_WORD_PREFIXES = (
    "professional", "summary", "profile", "experience", "education",
    "certification", "competency", "competencies", "references",
    "curriculum", "vitae", "objective", "background", "information",
    "qualifications", "employment",
)


def _is_sectionish_token(normalized: str) -> bool:
    if normalized in _NAME_STOPWORDS or normalized in _NAME_ROLE_WORDS:
        return True
    if len(normalized) >= 6:
        for prefix in _SECTION_WORD_PREFIXES:
            if normalized.startswith(prefix) or prefix.startswith(normalized):
                return True
    if len(normalized) >= 7 and _is_fuzzy_section_word(normalized):
        return True
    return False


# Long header words for OCR-truncation matching ("PROFESSIC" for
# "PROFESSIONAL", "EXPERIENC" for "EXPERIENCE"). Short names ("Summer",
# "Joshua") are excluded by the length gate so real names never match.
_FUZZY_SECTION_WORDS = (
    "professional", "experience", "education", "certification",
    "competencies", "references", "curriculum", "qualifications",
    "employment", "background", "information",
)

_FUZZY_SECTION_CACHE: Dict[str, bool] = {}


def _is_fuzzy_section_word(normalized: str) -> bool:
    """True when a long token is an OCR-mangled section word."""
    cached = _FUZZY_SECTION_CACHE.get(normalized)
    if cached is not None:
        return cached
    result = False
    if len(normalized) >= 7:
        best = difflib.get_close_matches(
            normalized, _FUZZY_SECTION_WORDS, n=1, cutoff=0.75
        )
        result = bool(best)
    _FUZZY_SECTION_CACHE[normalized] = result
    return result


# Name suffixes ignored by the case-uniformity check ("Maria S. Reyes" mixes
# an upper initial into a title-case name but is still one name).
_NAME_CASE_SUFFIXES = frozenset({"jr", "sr", "ii", "iii", "iv", "v"})

# Education vocabulary: a row below a split name carrying these words is a
# qualification line ("College Graduate"), never a third name row.
_EDU_CONTINUATION_RE = re.compile(
    r"\b(college|bachelor|master|diploma|degree|universit|school|graduate|"
    r"tesda|vocational|education|high\s+school)\b",
    re.I,
)


def _strip_contact_tokens(line: str) -> str:
    """Removes emails, URLs and phone numbers so the remainder can be
    checked for an address fragment."""
    line = URL_RE.sub(" ", line)
    line = EMAIL_RE.sub(" ", line)
    line = PHONE_RE.sub(" ", line)
    line = GENERIC_PHONE_RE.sub(" ", line)
    return line


# Structural address markers. PDF text extraction routinely loses the line
# breaks and city spellings resumes were written with, so a candidate line
# counts as an address when it carries any of these even if no _PH_CITIES
# entry matches ("78 Palm Grove Blvd, Brgy. Tambo, Paranaque").
# NOTE: "st" intentionally allows an optional dot ("Sampaguita St" without a
# period is the norm in PH resumes); weak residential tokens (blk/lot/phase)
# are included but callers must demand extra evidence (comma/digit/city) for
# them so prose like "a lot of experience" is never mistaken for an address.
_ADDRESS_MARKERS = re.compile(
    r"\b(barangay|brgy\.?|street|st\.?|avenue|ave\.?|road|rd\.?|blvd\.?|boulevard|"
    r"drive|dr\.?|lane|subdivision|subd\.?|village|vill\.?|compound|condo|tower|"
    r"building|bldg\.?|unit|flr\.?|floor|room|rm\.?|suite|purok|sitio|zone|district|"
    r"province|city|cities|municipality|municipal|zip|postal\s*code|"
    r"plaza|park|court|terrace|loop|circle|highway|corner|extension|ext\.?)\b",
    re.I,
)

# Weak residential tokens: meaningful only with extra evidence (comma, house
# number or known city) because they also occur in ordinary prose.
_WEAK_ADDRESS_MARKERS = re.compile(
    r"\b(blk\.?|block|lot|phase|ph\.?|house|home)\b",
    re.I,
)


def _normalize_name_word(word: str) -> str:
    """Strips non-letter decorations and returns the comparable form."""
    return re.sub(r"[^a-z]", "", word.lower())


class EntityExtractor:
    """Loads spaCy models once and extracts entities from cleaned resume text."""

    def __init__(self):
        self.base_nlp = None
        self.custom_nlp = None
        self.name_source = "rule"
        self.education_sources = {}
        self.title_sources = {}
        self.skill_sources = {}
        self.cert_sources = {}
        self.model_info = {"base_model": None, "custom_ner_loaded": False, "custom_ner_path": str(config.CUSTOM_NER_MODEL_DIR)}

    def load_models(self) -> Dict:
        try:
            self.base_nlp = spacy.load(config.BASE_SPACY_MODEL, exclude=["lemmatizer"])
        except OSError as exc:
            raise RuntimeError(
                f"spaCy base model '{config.BASE_SPACY_MODEL}' is not installed. "
                f"Run: python -m spacy download {config.BASE_SPACY_MODEL}"
            ) from exc
        if config.CUSTOM_NER_MODEL_DIR.exists() and any(config.CUSTOM_NER_MODEL_DIR.iterdir()):
            try:
                self.custom_nlp = spacy.load(str(config.CUSTOM_NER_MODEL_DIR))
                self.model_info["custom_ner_loaded"] = True
            except Exception:
                self.custom_nlp = None
                self.model_info["custom_ner_loaded"] = False
        else:
            self.custom_nlp = None
        self.model_info["base_model"] = config.BASE_SPACY_MODEL
        return dict(self.model_info)

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------

    def extract(self, text: str, references=None) -> Dict:
        """Extracts entities from cleaned resume text."""
        skills_ref, roles_ref, certs_ref = refdata.effective_references(references)
        sections = detect_sections(text)
        head_text = "\n".join([ln for ln in text.split("\n")[:35]])

        emails = self._extract_emails(text)
        malformed = [
            c for c in EMAIL_LOOSE_RE.findall(text) if not EMAIL_RE.fullmatch(c)
        ]
        phones = self._extract_phones(text)

        name = self._extract_name(head_text, text)
        address = self._extract_address(head_text, text, sections)
        education = self._extract_education(text, sections)
        titles, orgs, work_history = self._extract_titles_and_orgs(
            text, sections, head_text, roles_ref
        )
        experience = self._estimate_experience(text, sections)
        skills = self._extract_skills(text, sections, skills_ref)
        certifications = self._extract_certifications(text, sections, certs_ref)

        if name:
            name_low = name.lower()

            def _not_the_name(value: str) -> bool:
                vlow = value.lower()
                return vlow != name_low and vlow not in name_low and name_low not in vlow

            titles = [t for t in titles if _not_the_name(t)]
            if isinstance(orgs, list):
                orgs = [o for o in orgs if _not_the_name(o)]

        entities: List[Dict] = []
        if name:
            entities.append({"label": "PERSON", "value": name, "source": getattr(self, "name_source", "rule")})
        for e in education:
            entities.append({"label": "EDUCATION", "value": e, "source": self.education_sources.get(e, "section_rule")})
        for t in titles:
            entities.append({"label": "JOB_TITLE", "value": t, "source": self.title_sources.get(t, "section_rule")})
        for s in skills:
            entities.append({"label": "SKILL", "value": s, "source": self.skill_sources.get(s, "section_rule")})
        for c in certifications:
            entities.append({"label": "CERTIFICATION", "value": c, "source": self.cert_sources.get(c, "section_rule")})
        for o in orgs:
            entities.append({"label": "ORGANIZATION", "value": o, "source": "section_rule"})
        for em in emails:
            entities.append({"label": "EMAIL", "value": em, "source": "regex"})
        for ph in phones:
            entities.append({"label": "PHONE", "value": ph, "source": "regex"})

        return {
            "entities": entities,
            "sections_detected": sorted(sections.keys()),
            "estimated_years_experience": experience,
            # Same figure expressed in whole months, so downstream consumers can
            # show "10 years 4 months" without re-deriving it from the decimal.
            "estimated_experience_months": int(round(experience * 12)),
            "work_history": work_history,
            "name": name,
            "address": address,
            "emails": emails,
            "emails_malformed": list(dict.fromkeys(malformed)),
            "phones": phones,
            "education": education,
            "skills_raw": skills,
            "certifications_raw": certifications,
            "job_titles_raw": titles,
            "organizations": orgs,
        }

    # ------------------------------------------------------------------
    # Contact details (regex + OCR repair)
    # ------------------------------------------------------------------

    def _repair_ocr_email_text(self, text: str) -> str:
        """Applies conservative repairs so OCR-corrupted e-mails match EMAIL_RE.

        Only patterns containing an explicit @ (or an at-variant) are touched,
        so ordinary prose is never modified.
        """
        text = _EMAIL_AT_VARIANTS.sub("@", text)
        text = _EMAIL_DOT_VARIANTS.sub(".", text)
        text = _EMAIL_JOIN_LOCAL_SPLIT.sub(r"\1\2", text)
        text = _EMAIL_JOIN_LINEBREAK_1.sub(r"\1@", text)
        text = _EMAIL_JOIN_LINEBREAK_2.sub(r"@\1", text)
        text = _EMAIL_JOIN_TLD_SPLIT.sub(r"\1.\2", text)
        text = _EMAIL_MISSING_TLD_DOT.sub(r"@\1.com", text)

        repaired_lines = []
        for line in text.split("\n"):
            if "@" in line:
                # "juan gmail com" -> handled above; close up spacing around
                # @ and dots only on lines that clearly hold an e-mail.
                line = _EMAIL_SPACED_AT.sub("@", line)
                if EMAIL_LOOSE_RE.search(line.replace(" ", "")) or "@" in line:
                    line = _EMAIL_SPACED_DOT.sub(".", line)
            repaired_lines.append(line)
        text = "\n".join(repaired_lines)

        def _fix_domain(match: re.Match) -> str:
            candidate = match.group(0)
            local, _, domain = candidate.rpartition("@")
            for pattern, fix in _DOMAIN_TYPO_FIXES:
                domain = pattern.sub(fix, domain)
            return f"{local}@{domain}"

        return EMAIL_LOOSE_RE.sub(_fix_domain, text)

    def _extract_emails(self, text: str) -> List[str]:
        repaired = self._repair_ocr_email_text(text)
        return list(dict.fromkeys(EMAIL_RE.findall(repaired)))

    def _extract_phones(self, text: str) -> List[str]:
        found: List[str] = []
        for match in PHONE_RE.finditer(text):
            candidate = re.sub(r"\s+", " ", match.group(0)).strip()
            digits = re.sub(r"\D", "", candidate)
            if 7 <= len(digits) <= 13:
                found.append(candidate)
        if not found:
            for candidate in GENERIC_PHONE_RE.findall(text):
                digits = re.sub(r"\D", "", candidate)
                if 7 <= len(digits) <= 13:
                    found.append(candidate.strip())
        return list(dict.fromkeys(found))

    # ------------------------------------------------------------------
    # Name extraction
    # ------------------------------------------------------------------

    def _repair_with_context(self, candidate: str, head_text: str) -> str:
        if not candidate:
            return candidate
        lines = [l.strip() for l in head_text.split("\n") if l.strip()]
        cand_low = candidate.lower()

        for i, line in enumerate(lines[:6]):
            if cand_low in line.lower() or line.lower() in cand_low:
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    next_words = next_line.split()
                    if 1 <= len(next_words) <= 2 and not any(ch.isdigit() for ch in next_line) and "@" not in next_line:
                        if all(re.match(r"^[A-Z][a-zA-Z.'-]*$", w) or w.isupper() for w in next_words):
                            lowered = [_normalize_name_word(w) for w in next_words]
                            # Reject ALL-CAPS long words: those are section
                            # headers ("PROFESSIONAL"), not given names.
                            if any(w.isupper() and len(re.sub(r"\W", "", w)) >= 7 for w in next_words):
                                continue
                            if any(_is_sectionish_token(w) for w in lowered):
                                continue
                            combined = f"{candidate} {next_line}".strip()
                            if self._looks_like_person(combined):
                                return combined

        cwords = {_normalize_name_word(w) for w in re.findall(r"[A-Za-z]+", candidate)}
        for ln in lines[:6]:
            words = ln.split()
            if not (1 < len(words) <= 5):
                continue
            if not all(w.upper() == w or re.match(r"^[A-Z][a-zA-Z.'-]*$", w) for w in words):
                continue
            lowered = [_normalize_name_word(w) for w in words]
            if any(_is_sectionish_token(w) for w in lowered):
                continue
            lset = set(lowered)
            if cwords and cwords.issubset(lset) and len(lset) >= len(cwords):
                return ln

        return candidate

    def _extract_name(self, head_text: str, full_text: str) -> Optional[str]:
        lines = [ln.strip() for ln in head_text.split("\n") if ln.strip()]

        if len(lines) >= 2:
            l1, l2 = lines[0], lines[1]
            if not EMAIL_RE.search(l1) and not EMAIL_RE.search(l2) and not any(ch.isdigit() for ch in l1 + l2):
                combined = f"{l1} {l2}".strip()
                if self._looks_like_person(combined) and len(l1.split()) <= 3 and len(l2.split()) <= 2:
                    # A split display name can continue on further rows
                    # ("VINCENT" / "PAUL" / "SORIANO"): absorb following
                    # name rows while they are clearly name parts rather
                    # than a title, city or education line.
                    for nxt in lines[2:5]:
                        if len(combined.split()) >= 4:
                            break
                        nxt_words = nxt.split()
                        if not nxt_words or len(nxt_words) > 2:
                            break
                        if EMAIL_RE.search(nxt) or any(ch.isdigit() for ch in nxt):
                            break
                        if _ADDRESS_MARKERS.search(nxt) or _WEAK_ADDRESS_MARKERS.search(nxt):
                            break
                        if any(re.search(rf"\b{re.escape(c)}\b", nxt, re.I) for c in _PH_CITIES):
                            break
                        if _EDU_CONTINUATION_RE.search(nxt):
                            break
                        extended = f"{combined} {nxt}".strip()
                        if not self._looks_like_person(extended):
                            break
                        combined = extended
                    self.name_source = "rule"
                    return combined

        for line in lines[:6]:
            clean_line = re.sub(r"^[\u2022\u25cf\u25aa\u2023\u2043\u25b8\u25b9\u25ba\u25c6\u25c7\u25a0\u25a1\u25cb\u25b6o\-–—*●•✓▸◆►▹\s]+", "", line).strip()
            # "CONTACT JUAN DELA CRUZ" -> "JUAN DELA CRUZ"
            header_prefix = _NAME_HEADER_PREFIX_RE.match(clean_line)
            if header_prefix:
                clean_line = header_prefix.group(1).strip()
            if "|" in clean_line or "•" in clean_line or "·" in clean_line:
                for seg in re.split(r"[|•·]", clean_line):
                    clean_seg = seg.strip(" ,-–—")
                    if self._looks_like_person(clean_seg):
                        self.name_source = "rule"
                        return self._repair_with_context(clean_seg, head_text)
            elif self._looks_like_person(clean_line):
                self.name_source = "rule"
                return self._repair_with_context(clean_line, head_text)

        assembled = self._assemble_scattered_name(head_text)
        if assembled:
            self.name_source = "rule"
            return assembled

        # Scan remaining header lines for layouts where sidebar contact/skills come first
        for line in lines[6:30]:
            clean_line = re.sub(r"^[\u2022\u25cf\u25aa\u2023\u2043\u25b8\u25b9\u25ba\u25c6\u25c7\u25a0\u25a1\u25cb\u25b6o\-–—*●•✓▸◆►▹\s]+", "", line).strip()
            header_prefix = _NAME_HEADER_PREFIX_RE.match(clean_line)
            if header_prefix:
                clean_line = header_prefix.group(1).strip()
            if self._looks_like_person(clean_line):
                self.name_source = "rule"
                return self._repair_with_context(clean_line, head_text)

        if self.custom_nlp:
            doc = self.custom_nlp(head_text[:800])
            for ent in doc.ents:
                if ent.label_ == "PERSON" and self._looks_like_person(ent.text):
                    self.name_source = "custom_ner"
                    return self._repair_with_context(ent.text.strip(), head_text)

        if self.base_nlp:
            doc = self.base_nlp(head_text[:800])
            for ent in doc.ents:
                if ent.label_ == "PERSON" and self._looks_like_person(ent.text):
                    self.name_source = "spacy_base"
                    return self._repair_with_context(ent.text.strip(), head_text)

        return None

    def _assemble_scattered_name(self, head_text: str) -> Optional[str]:
        """Recovers names split across interleaved two-column lines.

        Two-column PDF layouts interleave the display-font name with sidebar
        text ("ALYSSA Hotel Spa..." / "MARIE PROFESSIONAL SUMMARY" /
        "VALDEZ"). Leading name-like tokens of the first lines are collected
        — continuing while each line contributes at least one token — and
        joined into one candidate.
        """
        lines = [l.strip() for l in head_text.split("\n") if l.strip()][:6]
        if not lines:
            return None

        tokens: List[str] = []
        lines_contributed = 0
        for line in lines:
            line = _NAME_HEADER_PREFIX_RE.sub(r"\1", line)
            words = line.split()
            taken = 0
            line_case: Optional[str] = None
            for word in words[:4]:
                clean = re.sub(r"^[^\w]+|[^\w]+$", "", word, flags=re.UNICODE)
                if not clean:
                    break
                is_name_shape = bool(re.match(r"^[A-Z][a-zA-Z.'-]*$", clean)) or (
                    clean.isupper() and clean.isalpha()
                )
                if not is_name_shape:
                    break
                normalized = _normalize_name_word(clean)
                if _is_sectionish_token(normalized) or normalized in _NAME_ASSEMBLY_STOPWORDS:
                    break
                if normalized in _ORG_SUFFIX_WORDS:
                    break
                if len(normalized) >= 13:
                    break  # OCR garbage tends to produce very long caps runs
                # A case change inside one row marks the start of interleaved
                # prose ("SORIANO Detail-obsesse"): stop before it.
                word_case = "upper" if clean.isupper() else "other"
                if taken == 0:
                    line_case = word_case
                elif word_case != line_case and len(normalized) > 2:
                    break
                tokens.append(clean)
                taken += 1
            if taken:
                lines_contributed += 1
                if len(tokens) >= 4:
                    break
            elif tokens:
                break  # first non-contributing line ends the name block

        if len(tokens) < 2 or len(tokens) > 4:
            return None
        # A 2-token candidate must draw from >= 2 lines (single-line pairs are
        # usually organization fragments like "Metropolitan Garden").
        if len(tokens) == 2 and lines_contributed < 2:
            return None
        candidate = " ".join(tokens)
        return candidate if self._looks_like_person(candidate) else None

    @staticmethod
    def _looks_like_person(value: str) -> bool:
        value = value.strip(" ,.-–—|•·")
        if not value or "@" in value or any(ch.isdigit() for ch in value):
            return False
        if any(x in value.lower() for x in ["http", "linkedin", "github", "portfolio", ".com", ".ph"]):
            return False
        cleaned = re.sub(r"[^\w\s.'-]", "", value).strip()
        words = cleaned.split()
        if not (1 < len(words) <= 5):
            return False
        for w in words:
            core = re.sub(r"[^A-Za-z.'-]", "", w)
            if len(re.sub(r"[^A-Za-z]", "", core)) < 2:
                return False
            if not (re.match(r"^[A-Z][a-zA-Z.'-]*$", core) or core.isupper()):
                return False
            if _is_sectionish_token(_normalize_name_word(core)):
                return False
        # Real names are uniformly cased (all "VINCENT PAUL SORIANO" or all
        # "Vincent Paul Soriano"). A mixed row ("SORIANO Detail-obsesse") is a
        # two-column interleave of name + summary prose, not a name.
        case_classes = set()
        for w in words:
            core = re.sub(r"[^A-Za-z.'-]", "", w)
            norm = _normalize_name_word(core)
            if len(norm) <= 2 or norm in _NAME_CASE_SUFFIXES:
                continue
            case_classes.add("upper" if core.isupper() else "other")
        if len(case_classes) > 1:
            return False
        return True

    # ------------------------------------------------------------------
    # Address / Location extraction
    # ------------------------------------------------------------------

    def _extract_address(self, head_text: str, full_text: str, sections: Dict[str, str]) -> Optional[str]:
        """Extracts candidate contact address / location.

        Covers the header contact block (first lines), an explicit
        "Contact Information" section wherever it sits, mid-line labels
        ("... Address: 123 ..."), long two-column merged rows, and — as a
        strict last resort — residential-looking lines elsewhere in the
        document (work-history "Hotel, City | dates" rows are excluded).
        """
        # Label prefix ("Address:", "Location -", ...) anywhere in a fragment.
        _label_prefix_re = re.compile(
            r"(?:^|[\s|•·,;]+)(?:location|address|residence)\s*[:–—-]\s*(.+)$",
            re.I,
        )
        # First house-number / residential anchor inside a long merged row:
        # "Juan ... Address: 78 Palm Grove Blvd, ..." -> start at "78 ...".
        _addr_start_re = re.compile(
            r"\b(?:\d{1,5}[A-Za-z]?\s+[A-Za-z0-9][^,|•·\n]{0,40}"
            r"|(?:blk\.?|block|lot|phase|purok|brgy\.?|barangay|sitio)\s*\.?\s*\d*[A-Za-z]*)",
            re.I,
        )
        # Words that mark a row as employment history rather than a home address.
        _work_row_re = re.compile(
            r"\b(hotel|hotels|resort|resorts|restaurant|corp\.?|corporation|company|"
            r"inc\.?|suites|inn\b|associate|attendant|supervisor|manager|intern|"
            r"operations|management|experience|coordinator)\b",
            re.I,
        )
        # Country names that terminate an address ("..., Manila, Philippines").
        _country_re = re.compile(
            r"\b(philippines|united\s+states|usa|u\.s\.a?\.?)\b", re.I
        )
        # Skill/noise vocabulary for dropping trailing comma-segments that are
        # interleaved right-column skills, not address parts ("Credit Card
        # Gateway Settlements", "Posting & City Ledger ... Flash Summaries").
        _noise_seg_re = re.compile(
            r"\b(credit|card|gateway|settlement|posting|ledger|executive|flash|"
            r"summar|audit|revenue|balancing|compliance|security|processing|"
            r"reception|emergency|duty|variance|report|financial|accounts|"
            r"reconciliation|cashier|verification|keycard|lock|pre-authorization|"
            r"chargeback|defense|privacy|rate|comp|safe|drop|float|cash)\b",
            re.I,
        )
        # Bare label ("ADDRESS 77 Padre Faura ..." with no colon) — stripped
        # only when the remainder carries address evidence, so prose like
        # "Address guest concerns ..." is never promoted.
        _bare_label_re = re.compile(
            r"^(?:location|address|residence)\s+(.+)$", re.I
        )

        def _has_city(cand: str) -> bool:
            return (
                any(re.search(rf"\b{re.escape(c)}\b", cand, re.I) for c in _PH_CITIES)
                or "philippines" in cand.lower()
                or "united states" in cand.lower()
                or re.search(r"\b(usa|u\.s\.a\.?|ph\b)", cand, re.I) is not None
            )

        def _trim_trailing_noise(cand: str) -> str:
            # Cut job prose that got merged after the address
            # ("... Paranaque 1701 Sales Associate with 3 years ...").
            # NOTE: the first 4-digit run is often the house number ("1422
            # Brickell Ave ... 33131"), so the postal code is searched from
            # the end and only used to trim when the tail is short/location-
            # like or clearly job prose. A house-number tail that continues
            # with street/city words is kept intact.
            zip_matches = list(re.finditer(r"\b\d{4,5}\b", cand))
            if zip_matches:
                zip_m = None
                tail_after: str = ""
                for m in reversed(zip_matches):
                    tail = cand[m.end():]
                    if len(tail.strip()) <= 60:
                        zip_m = m
                        tail_after = tail
                        break
                if zip_m is None:
                    zip_m = zip_matches[-1]
                    tail_after = cand[zip_m.end():]
                # Keep at most a location tail (", Metro Manila, Philippines").
                tail_keep = re.match(
                    r"(?i)\s*,?\s*((?:metro\s+manila|ncr|philippines|united\s+states|usa"
                    r"|manila|makati|taguig|pasig|quezon|pasay|rizal|laguna|cavite|cebu|davao"
                    r"|florida|miami|fl)[\w\s.,-]{0,40})",
                    tail_after,
                )
                if tail_keep:
                    sep = ", " if tail_after.lstrip().startswith(",") else " "
                    cand = cand[: zip_m.end()] + sep + tail_keep.group(1).strip(" ,-")
                elif (
                    len(tail_after.strip()) > 40
                    and _work_row_re.search(tail_after)
                ):
                    cand = cand[: zip_m.end()]
                # else: house-number-like match mid-address — keep full text.
            else:
                # No zip: drop a trailing " with ..." / " Sales Associate ..." tail.
                cand = re.split(
                    r"\s+(?:with\s+\d+|sales\s+associate|hotel\s+operations|"
                    r"years?\s+of\s+experience|experience\s+in)\b",
                    cand,
                    flags=re.I,
                )[0]
            return cand.strip(" ,|-•·:–—")

        def _seg_evidence(seg: str) -> bool:
            """True when a comma-segment looks like part of an address."""
            if _country_re.search(seg):
                return True
            if re.search(r"\b\d{4,5}\b", seg):
                return True
            if any(re.search(rf"\b{re.escape(c)}\b", seg, re.I) for c in _PH_CITIES):
                return True
            if re.search(r"\d", seg) and (
                _ADDRESS_MARKERS.search(seg) or _WEAK_ADDRESS_MARKERS.search(seg)
            ):
                return True
            if _ADDRESS_MARKERS.search(seg) or _WEAK_ADDRESS_MARKERS.search(seg):
                return True
            if re.search(r"\d", seg):
                return True
            return False

        def _leading_portion(cand: str) -> str:
            """Keeps the leading address comma-segments, dropping interleaved
            right-column skill prose ("77 Padre Faura Street, Ermita,
            1000 Manila, Credit Card Gateway Settlements, ..." ->
            "77 Padre Faura Street, Ermita, 1000 Manila"). A country word ends
            the address ("..., Manila, Philippines"). Short clean tails
            ("Blk 7 Lot 22, San Isidro") are preserved."""
            segs = [s.strip(" ") for s in cand.split(",")]
            segs = [s for s in segs if s]
            if not segs:
                return ""
            trimmed: List[str] = []
            for seg in segs:
                cm = _country_re.search(seg)
                if cm:
                    trimmed.append(seg[: cm.end()].strip())
                    break
                trimmed.append(seg)
            segs = trimmed
            if not _seg_evidence(segs[0]):
                return ""
            last = 0
            for i, seg in enumerate(segs):
                if _seg_evidence(seg):
                    last = i
            kept = segs[: last + 1]
            for seg in segs[last + 1:]:
                words = seg.split()
                if len(words) <= 3 and not _noise_seg_re.search(seg):
                    kept.append(seg)
                else:
                    break
            return ", ".join(kept).strip(" ,")

        def clean_addr(cand: str, strict_weak: bool = True) -> Optional[str]:
            if not cand:
                return None
            cand = cand.strip(" ,|-•·:–—\"'")
            if not cand or len(cand) < 6:
                return None
            if "@" in cand or re.search(r"https?://|linkedin\.com|www\.", cand, re.I):
                return None
            # Strip a leading label wherever it appears ("Address: ...").
            label_m = _label_prefix_re.search(cand)
            if label_m and len(label_m.group(1).strip()) >= 6:
                cand = label_m.group(1).strip(" ,|-•·:–—")
            else:
                # Bare label without colon ("ADDRESS 77 Padre Faura ...") —
                # strip only when the remainder carries address evidence.
                bare_m = _bare_label_re.match(cand)
                if bare_m and len(bare_m.group(1).strip()) >= 6:
                    rest = bare_m.group(1).strip()
                    if (
                        re.search(r"\d", rest)
                        or _ADDRESS_MARKERS.search(rest)
                        or _WEAK_ADDRESS_MARKERS.search(rest)
                        or _has_city(rest)
                    ):
                        cand = rest
            if " — " in cand:
                cand = cand.split(" — ")[-1].strip()
            # Long merged rows: start from the residential anchor and trim noise.
            if len(cand) > 200:
                start_m = _addr_start_re.search(cand)
                if start_m:
                    cand = cand[start_m.start(): start_m.start() + 200]
                else:
                    return None
            # Drop trailing interleaved skill comma-segments before validating.
            cand = _leading_portion(cand)
            cand = _trim_trailing_noise(cand)
            if not cand or len(cand) < 6 or len(cand) > 200:
                return None
            city_match = _has_city(cand)
            marker_match = bool(_ADDRESS_MARKERS.search(cand)) or bool(
                re.search(r"\b\d{4,5}\b", cand)
            )
            weak_match = bool(_WEAK_ADDRESS_MARKERS.search(cand))
            if not (city_match or marker_match or weak_match):
                return None
            if weak_match and not (city_match or marker_match):
                # "Blk/Lot/Phase" alone is not enough ("a lot of experience").
                if strict_weak and not (
                    "," in cand or re.search(r"\d", cand) or city_match
                ):
                    return None
            # A lone structural word without city/zip/comma/digit is not an
            # address ("Posting & City Ledger ..." matches "City" but is an
            # interleaved skill fragment).
            if not city_match and not re.search(r"\b\d{4,5}\b", cand):
                if "," not in cand and not re.search(r"\d", cand):
                    return None
            # Employer rows ("Front Desk Associate - Grand Hotel, Makati") are
            # employment history, not a home address. Reject them even when
            # they carry a comma, unless a residential anchor / zip / country
            # proves the fragment is a home address.
            _employer_re = re.compile(
                r"\b(hotel|hotels|resort|resorts|restaurants?|corp\.?|corporation|"
                r"company|inc\.?|suites|grill|bistro|caf[eé]|cafeteria|catering)\b",
                re.I,
            )
            _title_re = re.compile(
                r"\b(associate|attendant|supervisor|manager|intern|server|cook|"
                r"clerk|crew|staff|officer|coordinator|specialist)\b",
                re.I,
            )
            has_residential = bool(
                _ADDRESS_MARKERS.search(cand)
                or _WEAK_ADDRESS_MARKERS.search(cand)
                or re.search(r"\b\d{4,5}\b", cand)
                or "philippines" in cand.lower()
                or "united states" in cand.lower()
            )
            # Strong home anchors: a bare "City" is not enough when employer
            # vocabulary is present ("Seaside Grill Hotel, Taguig City" is a
            # workplace, not a home address).
            has_strong_home = bool(
                re.search(
                    r"\b(street|st\.?|avenue|ave\.?|road|rd\.?|blvd\.?|boulevard|"
                    r"drive|dr\.?|lane|subdivision|subd\.?|village|vill\.?|barangay|"
                    r"brgy\.?|purok|sitio|blk\.?|block|lot|phase|house|zip|postal\s*code)\b",
                    cand, re.I,
                )
                or re.search(r"\b\d{4,5}\b", cand)
                or "philippines" in cand.lower()
                or "united states" in cand.lower()
            )
            if (_employer_re.search(cand) or _title_re.search(cand)) and not has_strong_home:
                return None
            if (_employer_re.search(cand) or _title_re.search(cand)) and not has_residential:
                return None
            # A bare city/province word without comma, digit or structural
            # marker is too weak ("Jose Rizal" matches province "Rizal" but is
            # a name). Accept it only when it exactly equals a known place.
            if city_match and not marker_match and "," not in cand and not re.search(r"\d", cand):
                norm = cand.strip().lower()
                known = {c.lower() for c in _PH_CITIES} | {
                    "philippines", "united states", "usa", "metro manila", "ncr",
                }
                if norm not in known:
                    return None
            # Reject lines that are clearly job bullets rather than an address.
            if _work_row_re.search(cand) and "," not in cand:
                return None
            if DATE_RANGE_RE.search(cand):
                return None
            return cand or None

        def _residue_candidates(line: str) -> List[str]:
            residue = _strip_contact_tokens(line)
            parts: List[str] = []
            for part in re.split(r"[|•·]|\s{2,}|\t", residue):
                part = part.strip()
                if part:
                    parts.append(part)
            whole = re.sub(r"\s+", " ", residue).strip()
            if whole and whole not in parts:
                parts.append(whole)
            # Also try the raw line split (for rows where nothing was stripped).
            for part in re.split(r"[|•·]|\s{2,}|\t", line):
                part = _strip_contact_tokens(part).strip()
                part = re.sub(r"\s+", " ", part).strip()
                if part and part not in parts:
                    parts.append(part)
            return parts

        def _is_contact_only(line: str) -> bool:
            """True for e-mail/phone/URL/linkedin rows (never address lines)."""
            if "@" in line or "linkedin.com" in line.lower() or "www." in line.lower():
                return True
            if re.fullmatch(r"[\d\s()+.xXext-]{7,25}", line.strip()):
                return True
            return False

        def _continuation_country(next_line: str) -> Optional[str]:
            """Picks a country/zip/city continuation starting the next line
            ("Philippines Pre-Authorization Audits ..." -> "Philippines")."""
            if not next_line or _is_contact_only(next_line):
                return None
            portion = _leading_portion(next_line)
            if not portion:
                return None
            first = portion.split(",")[0].strip()
            if _country_re.match(first) or re.match(r"^\d{4,5}\b", first):
                return first
            if len(first.split()) <= 3 and _has_city(first) and "," not in portion:
                return first
            return None

        contact_scope = sections.get("contact", "") + "\n" + head_text
        contact_lines = [l.strip() for l in contact_scope.split("\n") if l.strip()]

        # 1) Explicit labels, including mid-line
        # ("Contact: ... | Address: 45 Marigold St ...").
        for line in contact_lines:
            m = _label_prefix_re.search(line)
            if m:
                res = clean_addr(m.group(1))
                if res:
                    return res
        for i, line in enumerate(contact_lines):
            if line.lower() in {"location", "address", "residence", "city"}:
                if i + 1 < len(contact_lines):
                    res = clean_addr(contact_lines[i + 1])
                    if res:
                        return res

        # 1b) Label-below: the ADDRESS label sits on its own row (often with
        # interleaved right-column skills) and the real address follows on the
        # next line(s), sometimes spanning two lines ("77 Padre Faura Street,
        # Ermita, 1000 Manila," / "Philippines ...").
        _label_line_re = re.compile(
            r"^(?:location|address|residence)\b\s*[:–—-]?\s*(.*)$", re.I
        )
        search_lines = contact_lines + [
            l.strip()
            for l in full_text.split("\n")
            if l.strip() and l.strip() not in set(contact_lines)
        ]
        for i, line in enumerate(search_lines):
            lm = _label_line_re.match(line)
            if not lm:
                continue
            remainder = lm.group(1).strip(" ,|-•·:–—")
            if remainder and clean_addr(remainder):
                return clean_addr(remainder)
            # Gather the following address-bearing line(s), skipping contact rows.
            for j in range(i + 1, min(i + 4, len(search_lines))):
                nxt = search_lines[j]
                if not nxt or _is_contact_only(nxt):
                    continue
                if DATE_RANGE_RE.search(nxt):
                    continue
                portion = _leading_portion(_strip_contact_tokens(nxt))
                if not portion:
                    portion = _leading_portion(nxt)
                if not portion:
                    continue
                res = clean_addr(portion)
                if not res:
                    continue
                # Append a country/zip/city continuation from the line below
                # ("..., 1000 Manila," + "Philippines ...").
                if j + 1 < len(search_lines) and not _country_re.search(res):
                    cont = _continuation_country(search_lines[j + 1])
                    if cont and cont.lower() not in res.lower():
                        combined = res.rstrip(" ,") + ", " + cont
                        res2 = clean_addr(combined)
                        if res2:
                            return res2
                return res

        # 2) Mixed contact rows: strip phones/e-mails/URLs, then test fragments.
        # Contact-section lines are scanned too (PDF headers often keep the
        # address in a "Contact Information" block further down the page).
        for line in contact_lines[:40]:
            if (
                not any(re.search(rf"\b{re.escape(c)}\b", line, re.I) for c in _PH_CITIES)
                and "philippines" not in line.lower()
                and "united states" not in line.lower()
                and not _ADDRESS_MARKERS.search(line)
                and not _WEAK_ADDRESS_MARKERS.search(line)
                and not re.search(r"\b\d{4,5}\b", line)
            ):
                continue
            residue = _strip_contact_tokens(line)
            if residue != line:
                for part in re.split(r"[|•·]|\s{2,}|\t", residue):
                    res = clean_addr(part)
                    if res:
                        return res
                res = clean_addr(re.sub(r"\s+", " ", residue).strip())
                if res:
                    return res

        # 3) Generic pass over header/contact fragments.
        for line in contact_lines[:40]:
            for part in re.split(r"[|•·]|\s{2,}|\t", line):
                res = clean_addr(part)
                if res and not PHONE_RE.search(res):
                    return res

        for line in contact_lines[:40]:
            if line.startswith(("+", "09", "http", "linkedin", "www", "Tel")):
                # Still try the residue: "0917... Makati City" carries the
                # address after the leading phone number.
                for part in _residue_candidates(line):
                    res = clean_addr(part)
                    if res and not PHONE_RE.search(res):
                        return res
                continue
            res = clean_addr(line)
            if res and not PHONE_RE.search(res) and not self._looks_like_person(res):
                return res

        # 4) Full-document fallback for addresses outside the header
        # (footers, sidebar blocks rendered late). Work-history rows are
        # excluded: they carry date ranges or hotel/company vocabulary without
        # residential markers.
        full_lines = [l.strip() for l in full_text.split("\n") if l.strip()][:100]
        seen_contact = set(contact_lines)
        for line in full_lines:
            if line in seen_contact:
                continue
            if DATE_RANGE_RE.search(line):
                continue
            low = line.lower()
            has_residential = (
                bool(_ADDRESS_MARKERS.search(line))
                or bool(_WEAK_ADDRESS_MARKERS.search(line))
                or bool(re.search(r"\b\d{4,5}\b", line))
                or "philippines" in low
                or "united states" in low
            )
            if not has_residential:
                continue
            # "Grand Harbor Hotel, Makati" is employment, not home — demand a
            # residential anchor or zip/country before accepting it.
            if _work_row_re.search(line) and not (
                _WEAK_ADDRESS_MARKERS.search(line)
                or re.search(r"\b(street|st\.?|avenue|ave\.?|barangay|brgy|village|"
                             r"subdivision|purok|sitio|zip|postal|blk|block|lot|phase|"
                             r"house)\b", line, re.I)
                or re.search(r"\b\d{4,5}\b", line)
                or "philippines" in low
                or "united states" in low
            ):
                continue
            label_m = _label_prefix_re.search(line)
            if label_m:
                res = clean_addr(label_m.group(1))
                if res:
                    return res
            for part in _residue_candidates(line):
                res = clean_addr(part)
                if res and not PHONE_RE.search(res) and not self._looks_like_person(res):
                    # Final guard: a bare "City" without comma/digit/marker is
                    # usually a work location, not the applicant's address.
                    if (
                        res in _PH_CITIES
                        and "," not in res
                        and not re.search(r"\d", res)
                    ):
                        continue
                    return res

        return None

    # ------------------------------------------------------------------
    # Education extraction
    # ------------------------------------------------------------------

    def _extract_education(self, text: str, sections: Dict[str, str]) -> List[str]:
        self.education_sources = {}
        results: List[str] = []

        def add(value: str, source: str):
            value = value.strip(" .,-;|•·")
            lowv = value.lower()
            if not value or len(value) < 10 or lowv in _EDU_NOISE_VALUES:
                return
            if any(lowv.startswith(bad) for bad in ["college,", "university,", "school for", "high school —", "graduated", "tertiary"]):
                return
            for i, existing in enumerate(results):
                ex_low = existing.lower()
                if lowv in ex_low:
                    return
                if ex_low in lowv:
                    results[i] = value
                    self.education_sources[value] = source
                    self.education_sources.pop(existing, None)
                    return
            results.append(value)
            self.education_sources[value] = source

        edu_section = sections.get("education", "")
        if edu_section:
            for line in edu_section.split("\n"):
                line = line.strip(" •·,;:-–—")
                if not line or len(line) < 10:
                    continue
                if re.match(r"^(certifications?|trainings?|skills?|experience|work|languages?)\b", line, re.I):
                    break
                for pattern in DEGREE_PATTERNS:
                    m = pattern.search(line)
                    if m:
                        clean_deg = m.group(0).strip(" ,-–—")
                        add(clean_deg, "section_rule")
                        break

        if not results:
            for pattern in DEGREE_PATTERNS:
                m = pattern.search(text)
                if m:
                    add(m.group(0).strip(" ,-–—"), "section_rule")
                    break

        return results[:6]

    # ------------------------------------------------------------------
    # Skills extraction
    # ------------------------------------------------------------------

    def _extract_skills(self, text: str, sections: Dict[str, str], skills_ref: Dict[str, List[str]]) -> List[str]:
        self.skill_sources = {}
        results: List[str] = []

        def add(canonical: str, source: str):
            if canonical and canonical.lower() not in {r.lower() for r in results}:
                results.append(canonical)
                self.skill_sources.setdefault(canonical, source)

        city_names = {
            "manila", "makati", "pasay", "quezon", "taguig", "mandaluyong",
            "paranaque", "marikina", "pasig", "caloocan", "muntinlupa",
            "batangas", "cavite", "antipolo", "tagaytay", "philippines",
            "cebu", "davao", "city",
        }
        noise_words = {
            "coordinate", "conduct", "helped", "facing", "supporting", "ensuring",
            "through", "during", "season", "volume", "increase", "assist", "toast",
            "fast", "late", "focused", "table", "catering", "services", "monitoring",
            "discrepancies", "shrinkage", "fundamentals", "transactions",
            "prepare and serve", "up to", "per shift", "daily", "guests",
            "customers", "including", "across", "contributing",
        }

        def clean_raw_skill(cand: str) -> Optional[str]:
            cand = re.sub(r"\([^)]*\)", "", cand)
            cand = cand.strip(" .,;:-–—|•·/\"'")
            if not cand or len(cand) < 3 or len(cand) > 50:
                return None
            low = cand.lower()
            if low.startswith(("in ", "to ", "for ", "and ", "with ", "from ", "by ", "& ")):
                return None
            if low.endswith((" in", " to", " for", " and", " with", " from", " by", " &", " late", " basic", " fast")):
                return None
            words = set(re.findall(r"\w+", low))
            if words & city_names:
                return None
            if any(bad in low for bad in ["linkedin", "http", "phone", "email", "@", "www.", ".com"]):
                return None
            return cand

        skills_section = sections.get("skills", "")
        for line in skills_section.split("\n"):
            line = line.strip(" •·,;:-–—")
            if not line:
                continue
            if re.match(r"^(languages?|awards?|experience|work|education|certifications?)\b", line, re.I):
                break
            for chunk in re.split(r"[,;/•|·]|\band\b", line):
                cleaned = clean_raw_skill(chunk)
                if not cleaned:
                    continue
                canonical = refdata.canonicalize(cleaned, skills_ref)
                if canonical:
                    add(canonical, "section_rule")
                elif len(cleaned.split()) <= 4 and not (set(re.findall(r"\w+", cleaned.lower())) & noise_words):
                    add(cleaned, "section_rule")

        for canonical, aliases in skills_ref.items():
            for variant in [canonical] + aliases:
                if re.search(rf"\b{re.escape(variant)}\b", text, re.I):
                    add(canonical, "reference_scan")
                    break

        return results[:30]

    # ------------------------------------------------------------------
    # Certifications extraction
    # ------------------------------------------------------------------

    def _extract_certifications(self, text: str, sections: Dict[str, str], certs_ref: Dict[str, List[str]]) -> List[str]:
        self.cert_sources = {}
        results: List[str] = []

        def add(canonical: str, source: str):
            clean = canonical.strip(" .,-;:|–—✓▸◆►▹●•·")
            low = clean.lower()
            if not clean or len(clean) < 4:
                return
            # Dates are entry metadata ("(October 2020)"), not credential names.
            if is_date_only_fragment(clean):
                return
            if low in {
                "& training", "and training", "and seminars", "& seminars",
                "languages", "additional information", "references", "nc ii",
                "nc 2", "tesda", "training", "trainings", "certifications",
                "certificates", "awards", "recognition",
            }:
                return
            if low.startswith(("& ", "and ", "▸ ", "✓ ", "• ", "● ")):
                return
            if any(low.startswith(b) for b in ["bachelor", "master", "diploma in", "senior high"]):
                return
            if clean and low not in {r.lower() for r in results}:
                results.append(clean)
                self.cert_sources.setdefault(clean, source)

        certs_section = sections.get("certifications", "")
        for line in certs_section.split("\n"):
            line = line.strip(" •·,;:-–—")
            if len(line) < 4:
                continue
            if re.match(r"^(references?\b|available\s+upon\s+request|languages?\b|additional\s+information|awards?\b|experience\b|work\b)", line, re.I):
                break
            if DATE_RANGE_RE.match(line):
                break

            clean_cert = re.sub(r"\s*(?:—|–|-)\s*[^,\n]+\s*(?:\((?:19|20)\d{2}\)|\b(?:19|20)\d{2}\b)?$", "", line).strip(" ,;-–—")
            clean_cert = re.sub(r"[,;\s]+(?:(?:19|20)\d{2})\s*$", "", clean_cert).strip(" ,;-–—")

            canonical = refdata.canonicalize(clean_cert, certs_ref) or refdata.canonicalize(line, certs_ref)
            if canonical:
                add(canonical, "section_rule")
                continue

            m = CERT_HINT_RE.search(line)
            if m:
                raw = m.group(0).strip()
                add(refdata.canonicalize(raw, certs_ref) or raw.title(), "hint_pattern")
                continue

            low = clean_cert.lower()
            if (
                len(clean_cert) >= 6
                and "|" not in clean_cert
                and not any(bad in low for bad in ("reference", "available upon request", "languages", "native", "fluent", "conversational", "team leader", "beverage inventory"))
                and not re.fullmatch(r"(certifications?|licenses?|trainings?)[:.]?", low)
            ):
                add(clean_cert.title(), "section_rule")

        for canonical, aliases in certs_ref.items():
            for variant in [canonical] + aliases:
                if re.search(rf"\b{re.escape(variant)}\b", text, re.I):
                    add(canonical, "reference_scan")
                    break

        return results[:12]

    # ------------------------------------------------------------------
    # Job titles + organizations + work history
    # ------------------------------------------------------------------

    def _extract_titles_and_orgs(
        self,
        text: str,
        sections: Dict[str, str],
        head_text: str,
        roles_ref: Dict[str, List[str]],
    ) -> Tuple[List[str], List[str], List[Dict]]:
        self.title_sources = {}
        titles: List[str] = []
        orgs: List[str] = []
        history: List[Dict] = []
        history_keys = set()

        city_or_place_words = {
            "manila", "makati", "pasay", "quezon", "taguig", "mandaluyong",
            "paranaque", "marikina", "pasig", "caloocan", "muntinlupa",
            "batangas", "cavite", "antipolo", "tagaytay", "philippines", "city",
        }
        date_words = {
            "january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december",
            "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
            "present", "current", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025",
        }
        # Verb openings that mark a duty bullet rather than a title line.
        bullet_verbs = (
            "coordinate", "monitor", "review", "help", "assist", "provide",
            "prepare", "maintain", "ensure", "handle", "support", "trained",
            "took", "set", "upsold", "handled", "supported", "assisted",
            "conducted", "operated", "processed", "resolved", "managed",
            "delivered", "performed", "created", "developed", "achieved",
            "recognized", "contributed", "worked", "collaborated", "led",
            "oversee", "oversaw", "greeted", "supported", "coordinated", "designed",
            "improved", "reduced", "increased", "tracked", "supervised", "directed",
        )

        def is_clean_title(candidate: str) -> bool:
            if not candidate or len(candidate) < 3 or len(candidate) > 50:
                return False
            low = candidate.lower().strip()
            # Reject obvious non-titles: sentences starting with and/or, containing review channels, key achievements, or ending with period
            if low.startswith(("and ", "or ", "the ", "a ", "an ")) or low.startswith("and through") or "online review" in low or "key achievements" in low or "professional summary" in low:
                return False
            if candidate.strip().endswith(".") and len(candidate.split()) > 6:
                return False
            if refdata.canonicalize(candidate, roles_ref):
                return True
            words = set(re.findall(r"\w+", low))
            if words and words.issubset(city_or_place_words):
                return False
            if words and words.issubset(date_words):
                return False
            if any(bad in low for bad in ["increasing", "variances", "supporting", "chain", "restaurant —", "hotel —", "resort —", "deliver", "coordinate", "manage", "assist", "through online", "review channels", "guest relations across", "key achievements"]):
                return False
            return True

        def add_title(canonical: str, source: str):
            clean = canonical.strip(" .,-–—;:|•·")
            if clean and is_clean_title(clean) and clean.lower() not in {t.lower() for t in titles}:
                titles.append(clean)
                self.title_sources.setdefault(clean, source)

        def looks_like_title(seg: str) -> bool:
            seg = seg.strip(" .,;-–—|•·")
            if not seg or len(seg) > 50:
                return False
            words = seg.split()
            if not (1 <= len(words) <= 6):
                return False
            if seg.endswith((".", ";", ",")):
                return False
            low = seg.lower()
            if low.split()[0] in bullet_verbs:
                return False
            return is_clean_title(seg)

        def looks_like_company(seg: str) -> bool:
            seg = seg.strip(" .,;-–—|•·")
            if not seg or len(seg) > 60 or "," in seg and len(seg.split(",")) > 2:
                return False
            # Reject known headers that look like capitalized companies
            if seg.upper() in [h.upper() for h in ["PROFESSIONAL SUMMARY","WORK EXPERIENCE","CORE SKILLS","EDUCATION","CERTIFICATIONS","KEY ACHIEVEMENTS","PROFESSIONAL EXPERIENCE"]] or seg.lower() in ["key achievements","professional summary","work experience"]:
                return False
            words = re.findall(r"[^\W\d_]+", seg, flags=re.UNICODE)
            if not (1 <= len(words) <= 7):
                return False
            low_words = {w.lower() for w in words}
            if low_words & set(_NAME_ROLE_WORDS) and not (low_words & _ORG_SUFFIX_WORDS):
                return False
            if low_words & (city_or_place_words | date_words) and len(low_words) <= 2:
                return False
            if low_words & _ORG_SUFFIX_WORDS:
                return True
            cap_words = [w for w in seg.split() if w[:1].isalpha()]
            if len(cap_words) >= 2 and all(w[0].isupper() or not w[:1].isalpha() for w in cap_words):
                # But reject if it's clearly a sentence fragment like "and through online review"
                if seg.lower().startswith("and through") or "online review" in seg.lower():
                    return False
                return True
            return False

        def split_company_location(value: str) -> Tuple[Optional[str], Optional[str]]:
            """'Metropolitan Garden Hotel, Makati City' -> (hotel, city)."""
            value = value.strip(" .,-–—|•·")
            if not value or len(value) > 70:
                return None, None
            m = re.match(
                r"^(.*?),\s*([A-Za-z\u00f1\u00d1\s\.]+(?:City|Province|Philippines|Manila|Makati|Taguig|Pasig|Quezon|Pasay|Rizal|Cavite|Laguna|Cebu|Davao|Antipolo|Tagaytay|Batangas)\.?)\s*$",
                value,
            )
            if m and len(m.group(1).strip()) >= 3:
                return m.group(1).strip(" .,-"), m.group(2).strip(" .,-")
            return value, None

        def segments_without_date(line_clean: str, had_range: bool) -> List[str]:
            work = DATE_RANGE_RE.sub(" ", line_clean) if had_range else line_clean
            parts = re.split(r"\||\t|[•·]| — | – | - |\s+at\s+", work)
            return [p.strip(" .,;-–—|•·") for p in parts if p.strip(" .,;-–—|•·")]

        def after_date_tail(line_clean: str, range_match) -> Optional[str]:
            """Text after the date range, e.g. '... | Jan 2021 - Present — Corp'."""
            tail = line_clean[range_match.end():].strip(" .,;-–—|•·")
            return tail or None

        exp_section = sections.get("experience", "")
        exp_lines = [l.strip() for l in exp_section.split("\n") if l.strip()]

        pending_title: Optional[str] = None
        pending_date: Optional[str] = None
        pending_company: Optional[str] = None
        pending_location: Optional[str] = None

        for i, line in enumerate(exp_lines):
            # --- Labeled format support (new dataset: "Job Title:", "Employer:", "Location:", "Employment Dates:") ---
            low_labeled = line.strip().lower()
            if low_labeled.startswith("job title:"):
                val = line.split(":", 1)[1].strip()
                if val:
                    can = refdata.canonicalize(val, roles_ref)
                    pending_title = can or val
                    add_title(pending_title, "section_rule")
                continue
            if low_labeled.startswith("employer:"):
                val = line.split(":", 1)[1].strip()
                if val:
                    pending_company = val
                continue
            if low_labeled.startswith("location:"):
                val = line.split(":", 1)[1].strip()
                if val:
                    pending_location = val
                continue
            if low_labeled.startswith("employment dates:") or low_labeled.startswith("employment date:"):
                val = line.split(":", 1)[1].strip()
                dm = DATE_RANGE_RE.search(val)
                effective = dm.group(0) if dm else val
                if pending_title:
                    job_title = pending_title
                    company, loc = (pending_company, pending_location)
                    # If company line had " - Location" suffix, split it
                    if company and " - " in company:
                        parts = company.split(" - ", 1)
                        company = parts[0].strip()
                        if not loc:
                            loc = parts[1].strip()
                    key = (job_title.lower(), (company or "").lower(), effective or "")
                    if key not in history_keys:
                        history_keys.add(key)
                        history.append({
                            "job_title": job_title,
                            "company": company,
                            "location": loc,
                            "recognized_role": bool(refdata.canonicalize(job_title, roles_ref)),
                            "period": effective,
                            "raw_line": line.strip()[:160],
                        })
                    # Clear for next entry, but keep pending_title cleared; company/location cleared as well
                    pending_title = None
                    pending_company = None
                    pending_location = None
                    pending_date = None
                    continue
                else:
                    # No title yet, store date for next title
                    pending_date = effective
                    continue
            line_clean = re.sub(r"^[\u2022\u25cf\u25aa\u2023\u2043\u25b8\u25b9\u25ba\u25c6\u25c7\u25a0\u25a1\u25cb\u25b6o\-–—*●•✓▸◆►▹\s]+", "", line).strip()
            if not line_clean or len(line_clean) < 4:
                continue

            range_match = DATE_RANGE_RE.search(line_clean)
            segs = segments_without_date(line_clean, bool(range_match))

            # Unlabeled 3-line pattern: Title (pending) -> Company -> Date
            # If current line is a date and we have a pending title, complete the history now
            if range_match and pending_title:
                effective_date = range_match.group(0)
                job_title = pending_title
                company = pending_company
                location = pending_location
                if not company:
                    tail = after_date_tail(line_clean, range_match)
                    if tail:
                        company, location = split_company_location(tail)
                if company and " - " in company and not location:
                    parts = company.split(" - ", 1)
                    company = parts[0].strip()
                    location = parts[1].strip()
                canonical = refdata.canonicalize(job_title, roles_ref)
                job_title = canonical or job_title
                add_title(job_title, "section_rule")
                key = (job_title.lower(), (company or "").lower(), effective_date or "")
                if key not in history_keys:
                    history_keys.add(key)
                    history.append({
                        "job_title": job_title,
                        "company": company,
                        "location": location,
                        "recognized_role": bool(canonical),
                        "period": effective_date,
                        "raw_line": line_clean[:160],
                    })
                pending_title = None
                pending_company = None
                pending_location = None
                pending_date = None
                continue

            # Standalone date line preceding title/company
            if range_match and not segs:
                pending_date = range_match.group(0)
                continue

            if range_match or pending_date:
                effective_date = range_match.group(0) if range_match else pending_date
                title_seg = None
                company_seg = None
                location_seg = None

                company_segs = [s for s in segs if looks_like_company(s)]
                title_segs = [s for s in segs if looks_like_title(s) and s not in company_segs]

                if pending_title:
                    title_seg = pending_title
                    pending_title = None
                    if company_segs:
                        company_seg = company_segs[0]
                    elif segs:
                        company_seg = segs[0]
                else:
                    if title_segs:
                        title_seg = title_segs[0]
                    company_segs = [s for s in company_segs if s != title_seg]
                    if company_segs:
                        company_seg = company_segs[0]
                    location_segs = [
                        s for s in segs
                        if s not in (title_seg, company_seg)
                        and any(re.search(rf"\b{re.escape(c)}\b", s, re.I) for c in _PH_CITIES)
                    ]
                    if location_segs:
                        location_seg = location_segs[0]

                if not title_seg and segs and looks_like_title(segs[0]):
                    title_seg = segs[0]

                if title_seg:
                    canonical = refdata.canonicalize(title_seg, roles_ref)
                    job_title = canonical or title_seg
                    add_title(job_title, "section_rule")

                    company = None
                    location = None
                    if company_seg:
                        company, location = split_company_location(company_seg)
                    if company is None and range_match:
                        tail = after_date_tail(line_clean, range_match)
                        if tail:
                            company, location = split_company_location(tail)
                    if company is None and i + 1 < len(exp_lines):
                        next_l = exp_lines[i + 1]
                        if " — " in next_l or " - " in next_l:
                            parts = re.split(r" — | - ", next_l, maxsplit=1)
                            company = parts[0].strip()
                            location = parts[1].strip()
                        elif not DATE_RANGE_RE.search(next_l) and len(next_l) < 60 and not next_l.startswith(("•", "-", "*", "—")):
                            company = next_l.strip()

                    key = (job_title.lower(), (company or "").lower(), effective_date or "")
                    if key not in history_keys:
                        history_keys.add(key)
                        history.append({
                            "job_title": job_title,
                            "company": company,
                            "location": location,
                            "recognized_role": bool(canonical),
                            "period": effective_date,
                            "raw_line": line_clean[:160],
                        })
                    pending_date = None
                    continue

            # No date range on this line.
            if segs:
                first = segs[0]
                # Pending title + company line should be treated as company before title check
                if pending_title and (looks_like_company(first) or any(re.search(rf"\b{re.escape(c)}\b", first, re.I) for c in _PH_CITIES)):
                    company, location = split_company_location(first)
                    pending_company = company
                    pending_location = location
                    continue
                canonical = refdata.canonicalize(first, roles_ref)
                if canonical:
                    if pending_title and pending_company:
                        key = (pending_title.lower(), (pending_company or "").lower(), pending_date or "")
                        if key not in history_keys:
                            history_keys.add(key)
                            history.append({
                                "job_title": pending_title,
                                "company": pending_company,
                                "location": pending_location,
                                "recognized_role": bool(refdata.canonicalize(pending_title, roles_ref)),
                                "period": pending_date,
                                "raw_line": line_clean[:160],
                            })
                        pending_title = None
                        pending_company = None
                        pending_location = None
                        pending_date = None
                    add_title(canonical, "section_rule")
                    pending_title = canonical
                    continue
                words = first.split()
                ends_sentence = first.endswith((".", ";", ",", ":"))
                if (
                    looks_like_title(first)
                    and not ends_sentence
                    and len(words) <= 7
                    and len(first) <= 55
                ):
                    if pending_title and pending_company:
                        key = (pending_title.lower(), (pending_company or "").lower(), pending_date or "")
                        if key not in history_keys:
                            history_keys.add(key)
                            history.append({
                                "job_title": pending_title,
                                "company": pending_company,
                                "location": pending_location,
                                "recognized_role": bool(refdata.canonicalize(pending_title, roles_ref)),
                                "period": pending_date,
                                "raw_line": line_clean[:160],
                            })
                        pending_title = None
                        pending_company = None
                        pending_location = None
                        pending_date = None
                    pending_title = first
                    continue

        # Flush any remaining pending title/company (last entry without trailing date)
        if pending_title:
            key = (pending_title.lower(), (pending_company or "").lower(), pending_date or "")
            if key not in history_keys:
                history_keys.add(key)
                history.append({
                    "job_title": pending_title,
                    "company": pending_company,
                    "location": pending_location,
                    "recognized_role": bool(refdata.canonicalize(pending_title, roles_ref)),
                    "period": pending_date,
                    "raw_line": pending_title[:160],
                })
            pending_title = None
            pending_company = None
            pending_location = None
            pending_date = None

        # Organizations: companies captured from work history plus spaCy ORG
        # entities found in the experience section.
        for h in history:
            company = h.get("company")
            if not company:
                continue
            low = company.lower()
            words = set(re.findall(r"\w+", low))
            if len(company) < 3 or len(company) > 60:
                continue
            if words.issubset(city_or_place_words | date_words):
                continue
            if low not in {o.lower() for o in orgs}:
                orgs.append(company)

        if self.base_nlp and exp_section:
            doc = self.base_nlp(exp_section[:4000])
            for ent in doc.ents:
                if ent.label_ != "ORG":
                    continue
                candidate = ent.text.strip(" .,-–—|•·")
                if not (3 <= len(candidate) <= 60):
                    continue
                low = candidate.lower()
                if any(x in low for x in ("http", "linkedin", ".com")):
                    continue
                normalized_words = [_normalize_name_word(w) for w in candidate.split()]
                if any(w in _NAME_STOPWORDS or w in _NAME_ROLE_WORDS for w in normalized_words):
                    continue
                if low not in {o.lower() for o in orgs}:
                    orgs.append(candidate)
        orgs = orgs[:10]

        if not titles:
            for canonical, aliases in roles_ref.items():
                for variant in [canonical] + aliases:
                    if re.search(rf"\b{re.escape(variant)}\b", text, re.I):
                        add_title(canonical, "reference_scan")
                        break

        from app.services.credential_verification import parse_date_range
        for h in history:
            h["date_range"] = parse_date_range(h.get("period"))

        return titles[:8], orgs, history[:8]

    # ------------------------------------------------------------------
    # Experience duration estimation
    # ------------------------------------------------------------------

    def _estimate_experience(self, text: str, sections: Dict[str, str]) -> float:
        ranges: List[Tuple[date, date]] = []
        today = date.today()

        exp_scope = sections.get("experience")
        if not exp_scope:
            exp_scope = text
            for key in ("education", "summary", "skills"):
                body = sections.get(key)
                if body:
                    exp_scope = exp_scope.replace(body, "\n")

        for m in DATE_RANGE_RE.finditer(exp_scope):
            sy = int(m.group("sy"))
            sm = MONTHS.get((m.group("sm") or "jan")[:3].lower(), 1)
            start = date(sy, min(sm, 12), 1)
            if m.group("ey"):
                ey = int(m.group("ey"))
                em = MONTHS.get((m.group("em") or "dec")[:3].lower(), 12)
                end = date(ey, min(em, 12), 28)
            else:
                end = today
            if start.year < 1980 or start > today or end < start:
                continue
            ranges.append((start, end))

        merged: List[List] = []
        for start, end in sorted(ranges):
            if merged and start <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], end)
            else:
                merged.append([start, end])

        # Every employment period counts inclusively — a stint written as
        # "June 2016 - March 2018" is 22 months of service, not 21. Overlapping
        # entries are merged above first, so no month is counted twice.
        months_total = 0
        for start, end in merged:
            months_total += (end.year - start.year) * 12 + (end.month - start.month) + 1

        phrase_years = 0.0
        for m in YEARS_PHRASE_RE.finditer(text):
            phrase_years = max(phrase_years, float(m.group(1)))

        for word, val in WORD_NUMS.items():
            if re.search(rf"\b(?:over|more\s+than|around|about)?\s*{word}\s*(?:\+?\s*)?(?:years?|yrs?)(?:\s+of\s+experience)?\b", text, re.I):
                phrase_years = max(phrase_years, val)

        range_years = round(months_total / 12.0, 2)
        if range_years > 0:
            # Dated employment history is the evidence, so it drives the number.
            # A claimed summary ("8 years of experience") may raise the estimate
            # by at most 25% but never shrink verified employment.
            years = (
                max(range_years, min(phrase_years, range_years * 1.25))
                if phrase_years > 0
                else range_years
            )
        else:
            years = phrase_years

        return min(years, 45.0)


_extractor: Optional[EntityExtractor] = None


def get_extractor() -> EntityExtractor:
    global _extractor
    if _extractor is None:
        _extractor = EntityExtractor()
        _extractor.load_models()
    return _extractor
