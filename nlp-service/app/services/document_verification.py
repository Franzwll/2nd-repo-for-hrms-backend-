"""Supporting-document verification: compares uploaded verification documents
(COE, Certificate, Credential) against the claims made in the applicant's
resume profile (applicant_screenings.profile_json).

This module is deliberately independent of the resume screening pipeline:
credential_verification.py runs 7 internal-consistency checks on the resume
itself and is NOT touched by this feature. Here the uploaded document is the
evidence - its extracted claims are compared field-by-field against what the
resume claims.

Matching ladder per text check (first hit wins):
1. exact match on normalized text (lowercase, collapsed whitespace)
2. punctuation-insensitive normalized match ("ABC Hotel, Inc." == "abc hotel inc")
3. company-suffix-stripped match ("ABC Hotel Inc." == "ABC Hotel")
4. canonical alias lookup against reference data (job roles / certifications;
   an optional 'education' mapping is honoured when the caller supplies one)
5. acronym match ("UP" == "University of the Philippines", "BSHM" ==
   "Bachelor of Science in Hospitality Management")
6. token-set match: every word of the shorter value appears in the longer one
   ("Oxford Suites" == "Oxford Suites Makati", "Cook" == "Line Cook",
   "Cookery NC II" == "TESDA Cookery NC II"), or high token overlap
7. degree-level equivalence for education (same rank + same program area)
8. fuzzy ratio (difflib.SequenceMatcher >= 0.80)

Dates are parsed with credential_verification.parse_date_range() and compared
on year+month when both sides carry explicit months, otherwise on year only.
A "present" end date compares equal only to another "present".

Document type domains:
    COE         -> employment verification (company / position / dates)
    Certificate -> education verification (degree / institution)
    Credential  -> certification verification (certification name / issuer)
    Others      -> extracted for manual review, marked UNABLE_TO_VERIFY
"""
import re
from datetime import date
from difflib import SequenceMatcher
from typing import Any, Dict, List, Optional, Tuple

from app.services import credential_verification, entity_extraction
from app.services import reference_data as refdata

# Overall statuses persisted by Laravel in applicant_documents.verification_status
STATUS_VERIFIED = "VERIFIED"
STATUS_DISCREPANCY = "DISCREPANCY_FOUND"
STATUS_UNABLE = "UNABLE_TO_VERIFY"

# Per-check results
RESULT_MATCH = "MATCH"
RESULT_MISMATCH = "MISMATCH"
RESULT_UNABLE = "UNABLE_TO_EXTRACT"

# How a check was decided
METHOD_EXACT = "exact"
METHOD_NORMALIZED = "normalized"
METHOD_SUFFIX = "suffix_stripped"
METHOD_CANONICAL_ALIAS = "canonical_alias"
METHOD_ACRONYM = "acronym"
METHOD_TOKEN_SET = "token_set"
METHOD_DEGREE = "degree_level"
METHOD_CERT = "cert_normalized"
METHOD_FUZZY = "fuzzy"
METHOD_DATE_TOLERANCE = "date_tolerance"
METHOD_UNABLE = "unable"

_FUZZY_THRESHOLD = 0.80
_TOKEN_DICE_THRESHOLD = 0.80

# Resumes round employment dates to the month while COEs / contracts state the
# exact day the employee signed (and often a probationary start). A difference
# within this window is the same employment period, not a discrepancy:
#   resume "April 2018 - December 2021" vs COE "August 1, 2018 - December 20, 2021"
# is a MATCH. Anything wider than the window is still reported as a MISMATCH.
_DATE_TOLERANCE_MONTHS = 6

# Legal-entity suffixes ignored when comparing company names, so
# "ABC Hotel Inc." matches "ABC Hotel" while "ABC Hotel" still differs
# from "Seaside Resorts" (the core names still differ after stripping).
_COMPANY_SUFFIXES = {
    "inc", "incorporated", "corp", "corporation", "ltd", "limited",
    "opc", "oppc", "co", "company", "llc", "plc", "holdings", "group",
    "enterprises", "corp.",
    "inc.",
    "ltd.",
    "co.",
}

# Small glue words ignored for acronyms / token overlap.
_SMALL_WORDS = {
    "of", "the", "and", "a", "an", "de", "del", "sa", "ng",
    "at", "in", "on", "for", "&",
}

# Single tokens too generic to prove a match on their own
# (e.g. a bare "NC II" must not match every credential).
_GENERIC_SINGLETONS = {
    "nc", "i", "ii", "iii", "iv", "1", "2", "3", "4", "11",
    "tesda", "certificate", "certification", "certified",
    "national", "license", "licence",
}

# Degree words that carry no program meaning on their own.
_DEGREE_GENERIC = {
    "bachelor", "bachelors", "master", "masters", "associate",
    "diploma", "degree", "science", "sciences", "arts",
    "of", "in", "and", "the", "a", "bs", "ba", "ms", "ma",
    "mba", "phd", "b", "m", "college", "undergraduate",
    "graduate", "graduated", "vocational", "tesda", "high",
    "school", "secondary", "senior", "program", "course",
    "major", "bshm", "bsitm", "bsba",
}

_NC_LEVELS = {
    "i": "I", "1": "I",
    "ii": "II", "2": "II", "11": "II",
    "iii": "III", "3": "III",
    "iv": "IV", "4": "IV",
}

# Certificate boilerplate that must never be mistaken for a claim.
# Without this, "CERTIFICATE OF COMPLETION This is proudly presented"
# would be extracted as the degree and falsely DISCREPANCY against any
# real program instead of reporting "can't confirm".
_BOILERPLATE_RE = re.compile(
    r"(certificate\s+of\s+(completion|recognition|achievement|participation|appreciation)"
    r"|this\s+is\s+to\s+(\w+\s+){0,2}certify"
    r"|this\s+certifies|proudly\s+presented|\bhereby\b"
    r"|in\s+witness\s+whereof|under\s+the\s+seal)",
    re.I,
)


def _is_boilerplate(value: Optional[str]) -> bool:
    return bool(value and _BOILERPLATE_RE.search(value))


# Signatory lines ("Enrico J. Salcedo", "Dr. Corazon G. Reyes") are people,
# not credential titles — they carry initials/honorifics and no credential
# vocabulary (nc/tesda/certificate/training/…).
_CERT_KEYWORD_RE = re.compile(
    r"\b(nc|tesda|certificat|licen[cs]e|training|course|diploma|degree|competency|completion)\b",
    re.I,
)
_PERSON_MARK_RE = re.compile(r"\b(Dr|Mr|Ms|Mrs|Atty)\.|\b[A-Z]\.", re.I)


def _looks_like_person(value: Optional[str]) -> bool:
    if not value or _CERT_KEYWORD_RE.search(value):
        return False
    return bool(_PERSON_MARK_RE.search(value))

COE_TYPES = {"COE"}
EDUCATION_TYPES = {"Certificate"}
CERTIFICATION_TYPES = {"Credential"}
SUPPORTED_TYPES = COE_TYPES | EDUCATION_TYPES | CERTIFICATION_TYPES

CHECK_LABELS = {
    "company": "Employer",
    "position": "Job title",
    "start_date": "Start date",
    "end_date": "End date",
    "degree": "Degree",
    "institution": "Institution",
    "certification": "Certification",
    "issuer": "Issuing organization",
}

DOC_LABELS = {
    "COE": "certificate of employment",
    "Certificate": "educational certificate",
    "Credential": "credential document",
}

# ---------------------------------------------------------------------------
# Targeted claim extraction. Supporting documents rarely carry resume-style
# section headers, so the generic NER output is used only as a fallback; the
# primary patterns are anchored to the fixed COE/certificate phrasings.
# ---------------------------------------------------------------------------

_COMPANY_PRIMARY_RE = re.compile(
    r"\b(?:employed|working|worked|hired|engaged)\s+(?:by|at|with|for)\s+"
    r"(?P<value>[A-Z][A-Za-z0-9&.,'’()\- ]+?)"
    r"(?=\s+(?:as|from|under|at|in|based|since|until|through)\b|\s*[,.;:!?\n]|\s*$)",
)

_COMPANY_SECONDARY_RE = re.compile(
    r"\b(?:at|with|for)\s+(?P<value>[A-Z][A-Za-z0-9&.,'’()\- ]+?)"
    r"(?=\s+(?:from|under|as|since|until|through)\b|\s*[,.;:!?\n]|\s*$)",
)

_POSITION_RE = re.compile(
    r"\b(?:as|position\s+of|role\s+of|position\s*:)\s+(?:an?\s+)?"
    r"(?P<value>[A-Z][A-Za-z0-9/&,'’()\- ]+?)"
    r"(?=\s+(?:from|for|under|at|in|with|based)\b|\s*[,.;:!?\n]|\s*$)",
)

_INSTITUTION_RE = re.compile(
    r"\b(?:at|from)\s+(?P<value>[A-Z][A-Za-z0-9.,'’()\- ]+?"
    r"(?:University|College|Institute|Academy|School)[A-Za-z]*)"
    r"(?=\s*[,.;:!?\n]|\s+(?:in|from|with|and|on)\b|\s*$)",
)

_ISSUER_RE = re.compile(
    r"\b(?:issued?\s+by|given\s+under\s+the\s+seal\s+of)\s+"
    r"(?P<value>[A-Z][A-Za-z0-9&.,'’()\- ]+?)"
    r"(?=\s*[,.;:!?\n]|\s+(?:on|in|this|with|under|dated)\b|\s*$)",
)

# Resume-side signal that an education entry actually names an institution.
_INSTITUTION_KEYWORD_RE = re.compile(r"\b(university|college|institute|academy|school)\b", re.I)

# Fallback for credential docs without a CERTIFICATIONS section header.
_CERT_MARKER_RE = re.compile(
    r"\b(nc\s*(?:i{1,3}|1|2|3)\b|national\s+certificate|"
    r"certified\s+\w|certificate\s+(?:of\s+)?(?:completion|recognition|achievement))",
    re.I,
)

# Trailing narrative prose that greedy degree patterns may swallow.
_TRIM_PROSE_RE = re.compile(
    r"\s+(?:and\s+is\b|and\s+hereby\b|hereby\b|having\s+been\b|"
    r"upon\s+(?:the\s+)?(?:completion|satisfactory)\b)",
    re.I,
)

_MONTH_NAMES = set(entity_extraction.MONTHS.keys())


# ---------------------------------------------------------------------------
# Small text utilities
# ---------------------------------------------------------------------------

def _norm(value: Optional[str]) -> str:
    return re.sub(r"\s+", " ", (value or "").strip().lower())


def _clean_value(value: Optional[str]) -> str:
    text = re.sub(r"\s+", " ", (value or "").strip())
    return text.strip(" .,;:|-*\u2022").strip()


def _is_month_phrase(value: Optional[str]) -> bool:
    low = _norm(value)
    if not low:
        return True
    return low.split()[0].strip(".") in _MONTH_NAMES


# Lead-ins that turn a date into a sentence ("Conducted On March 2019",
# "Issued: 05 March 2022") — they carry no credential name.
_DATE_LEAD_IN_RE = re.compile(
    r"^\s*(?:conducted|issued|given|dated|held|taken|obtained|earned|completed|"
    r"awarded|valid|conferred|attended|finished|on|last)\b[\s:]*",
    re.I,
)
_DATE_SHAPES = (
    re.compile(r"^(?:[A-Za-z]{3,9})\.?\s+(?:19|20)\d{2}$"),                      # October 2020
    re.compile(r"^(?:19|20)\d{2}$"),                                             # 2020
    re.compile(r"^\d{1,2}\s+[A-Za-z]{3,9}\.?,?\s+(?:19|20)\d{2}$"),             # 20 March 2019
    re.compile(r"^[A-Za-z]{3,9}\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+(?:19|20)\d{2}$"),  # March 20, 2019
    re.compile(r"^(?:19|20)\d{2}[-/.]\d{1,2}(?:[-/.]\d{1,2})?$"),                # 2019-03 / 2019-03-20
    re.compile(r"^\d{1,2}[-/.]\d{1,2}[-/.](?:19|20)\d{2}$"),                     # 03/20/2019
)


def _is_date_only_phrase(value: Optional[str]) -> bool:
    """True when a value carries only calendar information — "October 2020",
    "(October 2020)", "Conducted On March 2019", "Issued: 05 March 2022".

    Such values are metadata, not certificate / licence titles, so comparing
    them as if they named a credential produces a false "Different". Callers
    use this to report "can't compare" instead.
    """
    text = _clean_value(value).replace("(", " ").replace(")", " ")
    text = _clean_value(text)
    if not text:
        return False
    # Strip lead-in words repeatedly — "Conducted On March 2019" carries two.
    stripped = text
    for _ in range(4):
        nxt = _clean_value(_DATE_LEAD_IN_RE.sub("", stripped))
        nxt = _clean_value(re.sub(r"^(?:the|a|an)\s+", "", nxt, flags=re.I))
        if not nxt or nxt == stripped:
            stripped = nxt or ""
            break
        stripped = nxt
    if not stripped:
        return True
    if any(pattern.match(stripped) for pattern in _DATE_SHAPES):
        return True
    return False


def _text_ratio(a: Optional[str], b: Optional[str]) -> float:
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()


def _join_and(values: List[str]) -> str:
    values = [str(v) for v in values]
    if not values:
        return ""
    if len(values) == 1:
        return values[0]
    return ", ".join(values[:-1]) + " and " + values[-1]


def _norm_smart(value: Optional[str]) -> str:
    """Lowercase, punctuation-insensitive normalization.

    "&" becomes "and", dashes/slashes become spaces, and
    . , ; : ' " ( ) [ ] are dropped, so "ABC Hotel, Inc."
    and "abc hotel inc" compare equal.
    """
    text = (value or "").strip().lower().replace("&", " and ")
    text = re.sub(r"[.\-,/_–—:;\"'’‘“”()\[\]]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _tokens(value: Optional[str]) -> List[str]:
    return [t for t in _norm_smart(value).split(" ") if t]


def _token_dice(a: List[str], b: List[str]) -> float:
    """Dice coefficient over token sets (word-order independent)."""
    if not a or not b:
        return 0.0
    set_a, set_b = set(a), set(b)
    inter = len(set_a & set_b)
    if not inter:
        return 0.0
    return 2.0 * inter / (len(set_a) + len(set_b))


def _token_set_match(a: List[str], b: List[str]) -> bool:
    """True when the shorter value's words are (almost) all inside the
    longer one — e.g. branch names ("Oxford Suites" in
    "Oxford Suites Makati") or seniority prefixes ("Cook" in "Line Cook").
    A lone generic token ("NC", "II", "TESDA") never proves a match."""
    if not a or not b:
        return False
    short, long_ = (a, b) if len(a) <= len(b) else (b, a)
    short_set, long_set = set(short), set(long_)
    if not short_set <= long_set:
        return _token_dice(a, b) >= _TOKEN_DICE_THRESHOLD
    if len(short_set) == 1:
        only = next(iter(short_set))
        if only in _GENERIC_SINGLETONS or len(only) < 4:
            return False
    return True


def _acronym(value: Optional[str]) -> str:
    """First letters of the significant words, uppercased.

    "University of the Philippines" -> "UP"; "Bachelor of Science in
    Hospitality Management" -> "BSHM". Short all-letter tokens such as
    "BS" or "TESDA" are already acronyms and returned as-is.
    """
    toks = [t for t in _tokens(value) if t not in _SMALL_WORDS]
    if not toks:
        return ""
    if len(toks) == 1:
        tok = toks[0]
        if tok.isalpha() and len(tok) <= 6:
            return tok.upper()
        return tok[0].upper() if tok else ""
    return "".join(t[0].upper() for t in toks if t and t[0].isalpha())


def _acronym_match(a: Optional[str], b: Optional[str]) -> bool:
    """True when one side literally is the acronym of the other.

    "UP" matches "University of the Philippines" and "BSHM" matches
    "Bachelor of Science in Hospitality Management", but two different
    phrases that merely share initials ("Bachelor Degree" vs "Business
    Degree") do not match.
    """
    if not a or not b:
        return False
    norm_a = re.sub(r"\s+", "", _norm_smart(a)).upper()
    norm_b = re.sub(r"\s+", "", _norm_smart(b)).upper()
    if not norm_a or not norm_b or norm_a == norm_b:
        return False
    acr_a, acr_b = _acronym(a), _acronym(b)
    if acr_a != acr_b or len(acr_a) < 2:
        return False
    return norm_a == acr_a or norm_b == acr_b


def _strip_company_suffix(value: Optional[str]) -> str:
    toks = _tokens(value)
    while toks and toks[-1].rstrip(".") in _COMPANY_SUFFIXES:
        toks.pop()
    return " ".join(toks)


def _similarity(a: Optional[str], b: Optional[str]) -> float:
    """Best of character-level and word-level similarity (0..1)."""
    if not a or not b:
        return 0.0
    ratio = SequenceMatcher(None, _norm_smart(a), _norm_smart(b)).ratio()
    return max(ratio, _token_dice(_tokens(a), _tokens(b)))


def _normalize_cert(value: Optional[str]) -> str:
    """Canonical form for credential names: uppercased with NC levels
    unified, so "Cookery NCII", "Cookery NC 2" and "Cookery NC II"
    all become "COOKERY NC II"."""
    text = re.sub(r"\s+", " ", (value or "").strip().upper())
    text = re.sub(r"\bN\s*\.?\s*C\s*\.?\s*(II|III|IV|I|1|2|3|4|11)\b",
                  lambda m: "NC " + _NC_LEVELS.get(m.group(1), m.group(1)), text)
    text = re.sub(r"\bNATIONAL\s+CERTIFICATE\s*(II|III|IV|I|1|2|3|4|11)\b",
                  lambda m: "NC " + _NC_LEVELS.get(m.group(1), m.group(1)), text)
    return re.sub(r"\s+", " ", text).strip()


def _distinctive_degree_tokens(value: Optional[str]) -> List[str]:
    return [t for t in _tokens(value) if t not in _DEGREE_GENERIC]


def _degree_equivalent(a: Optional[str], b: Optional[str]) -> bool:
    """True when both values sit at the same education level AND name the
    same program area — so "BS in Hospitality Management" matches
    "Bachelor of Science in Hospitality Management" (or its "BSHM"
    acronym), while "Hospitality" still differs from "Tourism".

    A side that names no program at all ("Bachelor's Degree") accepts any
    program at the same level, since the document then proves the level.
    """
    if not a or not b:
        return False
    if _acronym_match(a, b):
        return True
    rank_a = refdata.education_rank(a)
    rank_b = refdata.education_rank(b)
    if rank_a <= 0 or rank_b <= 0 or rank_a != rank_b:
        return False
    dist_a = _distinctive_degree_tokens(a)
    dist_b = _distinctive_degree_tokens(b)
    if not dist_a or not dist_b:
        return True
    set_a, set_b = set(dist_a), set(dist_b)
    if set_a <= set_b or set_b <= set_a:
        return True
    return _token_dice(dist_a, dist_b) >= 0.67


# ---------------------------------------------------------------------------
# Check builders
# ---------------------------------------------------------------------------

def _unable_check(resume_value: Optional[str], document_value: Optional[str]) -> Dict[str, Any]:
    return {
        "resume_value": resume_value,
        "document_value": document_value,
        "normalized_resume": _norm(resume_value) if resume_value else None,
        "normalized_document": _norm(document_value) if document_value else None,
        "match_method": METHOD_UNABLE,
        "result": RESULT_UNABLE,
    }


def _check_rank(check: Dict[str, Any]) -> Tuple[int, float]:
    if check.get("result") == RESULT_MATCH:
        return (2, _similarity(check.get("resume_value"), check.get("document_value")))
    if check.get("result") == RESULT_MISMATCH:
        return (1, _similarity(check.get("resume_value"), check.get("document_value")))
    return (0, 0.0)


def _compare_text_values(
    resume_value: Any, document_value: Any, reference: Optional[Dict[str, List[str]]] = None
) -> Dict[str, Any]:
    """Exact -> normalized -> suffix-stripped -> canonical alias -> acronym
    -> token-set -> fuzzy comparison ladder for one field."""
    resume_value = _clean_value(resume_value) if isinstance(resume_value, str) else resume_value
    document_value = _clean_value(document_value) if isinstance(document_value, str) else document_value
    if not resume_value or not document_value:
        return _unable_check(resume_value or None, document_value or None)

    n_resume, n_doc = _norm(resume_value), _norm(document_value)
    base = {
        "resume_value": resume_value,
        "document_value": document_value,
        "normalized_resume": n_resume,
        "normalized_document": n_doc,
    }

    # 1. exact
    if n_resume == n_doc:
        return {**base, "match_method": METHOD_EXACT, "result": RESULT_MATCH}

    # 2. punctuation-insensitive ("ABC Hotel, Inc." == "abc hotel inc")
    s_resume, s_doc = _norm_smart(resume_value), _norm_smart(document_value)
    if s_resume and s_resume == s_doc:
        return {**base, "match_method": METHOD_NORMALIZED, "result": RESULT_MATCH}

    # 3. company-suffix-stripped ("ABC Hotel Inc." == "ABC Hotel")
    stripped_resume = _strip_company_suffix(resume_value)
    stripped_doc = _strip_company_suffix(document_value)
    if stripped_resume and stripped_doc and stripped_resume == stripped_doc:
        return {**base, "match_method": METHOD_SUFFIX, "result": RESULT_MATCH}

    # 4. canonical alias lookup against reference data
    if reference:
        canon_resume = refdata.canonicalize(resume_value, reference)
        canon_doc = refdata.canonicalize(document_value, reference)
        canon_resume_norm = _norm(canon_resume) if canon_resume else None
        canon_doc_norm = _norm(canon_doc) if canon_doc else None
        if canon_resume and canon_doc and canon_resume_norm == canon_doc_norm:
            return {**base, "match_method": METHOD_CANONICAL_ALIAS, "result": RESULT_MATCH}
        if canon_resume_norm and n_doc == canon_resume_norm:
            return {**base, "match_method": METHOD_CANONICAL_ALIAS, "result": RESULT_MATCH}
        if canon_doc_norm and n_resume == canon_doc_norm:
            return {**base, "match_method": METHOD_CANONICAL_ALIAS, "result": RESULT_MATCH}

    # 5. acronym ("UP" == "University of the Philippines")
    if _acronym_match(resume_value, document_value):
        return {**base, "match_method": METHOD_ACRONYM, "result": RESULT_MATCH}

    # 6. token-set ("Oxford Suites" == "Oxford Suites Makati",
    #    "Cook" == "Line Cook", "Cookery NC II" == "TESDA Cookery NC II")
    if _token_set_match(_tokens(resume_value), _tokens(document_value)):
        return {**base, "match_method": METHOD_TOKEN_SET, "result": RESULT_MATCH}

    # 7. fuzzy
    if _text_ratio(s_resume, s_doc) >= _FUZZY_THRESHOLD:
        return {**base, "match_method": METHOD_FUZZY, "result": RESULT_MATCH}
    return {**base, "match_method": METHOD_FUZZY, "result": RESULT_MISMATCH}


def _compare_degree_values(
    resume_value: Any, document_value: Any, reference: Optional[Dict[str, List[str]]] = None
) -> Dict[str, Any]:
    """Degree comparison with its own strict ladder.

    Generic word-overlap is deliberately NOT used here: "Hospitality"
    and "Tourism" share most words yet name different programs, so only
    exact, alias, acronym, same-level-same-program, or very-close fuzzy
    (typo-level, >= 0.90) count as matches.
    """
    resume_value = _clean_value(resume_value) if isinstance(resume_value, str) else resume_value
    document_value = _clean_value(document_value) if isinstance(document_value, str) else document_value
    if not resume_value or not document_value:
        return _unable_check(resume_value or None, document_value or None)

    n_resume, n_doc = _norm(resume_value), _norm(document_value)
    base = {
        "resume_value": resume_value,
        "document_value": document_value,
        "normalized_resume": n_resume,
        "normalized_document": n_doc,
    }

    if n_resume == n_doc:
        return {**base, "match_method": METHOD_EXACT, "result": RESULT_MATCH}
    s_resume, s_doc = _norm_smart(resume_value), _norm_smart(document_value)
    if s_resume and s_resume == s_doc:
        return {**base, "match_method": METHOD_NORMALIZED, "result": RESULT_MATCH}

    if reference:
        canon_resume = refdata.canonicalize(resume_value, reference)
        canon_doc = refdata.canonicalize(document_value, reference)
        canon_resume_norm = _norm(canon_resume) if canon_resume else None
        canon_doc_norm = _norm(canon_doc) if canon_doc else None
        if canon_resume and canon_doc and canon_resume_norm == canon_doc_norm:
            return {**base, "match_method": METHOD_CANONICAL_ALIAS, "result": RESULT_MATCH}

    if _acronym_match(resume_value, document_value):
        return {**base, "match_method": METHOD_ACRONYM, "result": RESULT_MATCH}

    if _degree_equivalent(resume_value, document_value):
        return {**base, "match_method": METHOD_DEGREE, "result": RESULT_MATCH}

    if _text_ratio(s_resume, s_doc) >= 0.90:
        return {**base, "match_method": METHOD_FUZZY, "result": RESULT_MATCH}
    return {**base, "match_method": METHOD_FUZZY, "result": RESULT_MISMATCH}


def _compare_cert_values(
    resume_value: Any, document_value: Any, reference: Optional[Dict[str, List[str]]] = None
) -> Dict[str, Any]:
    """Credential-name comparison on NC-level-normalized forms, so
    "Cookery NCII", "Cookery NC 2" and "TESDA Cookery NC II" all meet."""
    clean_resume = _clean_value(resume_value) if isinstance(resume_value, str) else resume_value
    clean_doc = _clean_value(document_value) if isinstance(document_value, str) else document_value
    if not clean_resume or not clean_doc:
        return _unable_check(clean_resume or None, clean_doc or None)
    # A bare date is not a credential name: "(October 2020)" on the resume and
    # "Conducted On March 2019" on the paper carry no title to compare, so the
    # row is reported as "not compared" instead of a misleading "Different".
    if _is_date_only_phrase(clean_resume) or _is_date_only_phrase(clean_doc):
        return _unable_check(clean_resume, clean_doc)
    if _norm(clean_resume) == _norm(clean_doc):
        return {
            "resume_value": clean_resume,
            "document_value": clean_doc,
            "normalized_resume": _norm(clean_resume),
            "normalized_document": _norm(clean_doc),
            "match_method": METHOD_EXACT,
            "result": RESULT_MATCH,
        }
    resume_norm = _normalize_cert(clean_resume)
    doc_norm = _normalize_cert(clean_doc)
    check = _compare_text_values(resume_norm, doc_norm, reference)
    if check.get("result") == RESULT_MATCH and check.get("match_method") != METHOD_CANONICAL_ALIAS:
        check = {**check, "match_method": METHOD_CERT}
    check["resume_value"] = clean_resume
    check["document_value"] = clean_doc
    return check


def _best_degree_check(
    resume_values: Optional[List[Any]],
    document_value: Any,
    reference: Optional[Dict[str, List[str]]] = None,
) -> Dict[str, Any]:
    """Best-of-resume comparison using the strict degree ladder."""
    values = [v for v in (resume_values or []) if isinstance(v, str) and v.strip()]
    document_value = _clean_value(document_value) if isinstance(document_value, str) else document_value
    if not document_value:
        return _unable_check(None, None)
    if not values:
        return _unable_check(None, document_value)
    best: Optional[Dict[str, Any]] = None
    best_rank: Tuple[int, float] = (-1, -1.0)
    for value in values:
        check = _compare_degree_values(value, document_value, reference)
        rank = _check_rank(check)
        if rank > best_rank:
            best, best_rank = check, rank
    return best or _unable_check(None, document_value)


def _best_cert_check(
    resume_values: Optional[List[Any]],
    document_value: Any,
    reference: Optional[Dict[str, List[str]]] = None,
) -> Dict[str, Any]:
    """Best-of-resume comparison using NC-normalized credential matching."""
    values = [v for v in (resume_values or []) if isinstance(v, str) and v.strip()]
    document_value = _clean_value(document_value) if isinstance(document_value, str) else document_value
    if not document_value:
        return _unable_check(None, None)
    if not values:
        return _unable_check(None, document_value)
    best: Optional[Dict[str, Any]] = None
    best_rank: Tuple[int, float] = (-1, -1.0)
    for value in values:
        check = _compare_cert_values(value, document_value, reference)
        rank = _check_rank(check)
        if rank > best_rank:
            best, best_rank = check, rank
    return best or _unable_check(None, document_value)


def _best_text_check(
    resume_values: Optional[List[Any]],
    document_value: Any,
    reference: Optional[Dict[str, List[str]]] = None,
) -> Dict[str, Any]:
    """Compares the document value against every resume-side candidate and
    keeps the strongest comparison (MATCH beats MISMATCH beats UNABLE)."""
    values = [v for v in (resume_values or []) if isinstance(v, str) and v.strip()]
    document_value = _clean_value(document_value) if isinstance(document_value, str) else document_value
    if not document_value:
        return _unable_check(None, None)
    if not values:
        return _unable_check(None, document_value)
    best: Optional[Dict[str, Any]] = None
    best_rank: Tuple[int, float] = (-1, -1.0)
    for value in values:
        check = _compare_text_values(value, document_value, reference)
        rank = _check_rank(check)
        if rank > best_rank:
            best, best_rank = check, rank
    return best or _unable_check(None, document_value)


def _boundary_contains(outer: Optional[str], inner: Optional[str]) -> bool:
    o, i = _norm(outer), _norm(inner)
    if not o or not i:
        return False
    padded = f" {o} "
    return f" {i} " in padded or f" {i} " in padded.replace("/", " ").replace(",", " ")


def _issuer_check(document_issuer: Any, resume_values: Optional[List[Any]]) -> Dict[str, Any]:
    """Compares the document's issuing organization against the resume's
    certification entries.

    Resume profiles carry no dedicated issuer field, so a non-matching
    issuer is reported as UNABLE_TO_EXTRACT (unverifiable from the resume),
    never as a fabricated mismatch — only an explicit containment counts as
    a match. The certification title itself carries the verdict.
    """
    document_issuer = _clean_value(document_issuer) if isinstance(document_issuer, str) else document_issuer
    values = [v for v in (resume_values or []) if isinstance(v, str) and v.strip()]
    if not document_issuer or not values:
        return _unable_check(None, document_issuer or None)
    for value in values:
        if _boundary_contains(value, document_issuer) or _boundary_contains(document_issuer, value):
            return {
                "resume_value": value,
                "document_value": document_issuer,
                "normalized_resume": _norm(value),
                "normalized_document": _norm(document_issuer),
                "match_method": METHOD_EXACT,
                "result": RESULT_MATCH,
            }
    return _unable_check(None, document_issuer)


# Case-insensitive fallbacks for lowercased / OCR-flattened documents
# whose proper nouns lost their capital letters.
_COMPANY_PRIMARY_CI_RE = re.compile(
    r"\b(?:employed|working|worked|hired|engaged)\s+(?:by|at|with|for)\s+"
    r"(?P<value>[A-Za-z0-9&.,'’()\- ]+?)"
    r"(?=\s+(?:as|from|under|at|in|based|since|until|through)\b|\s*[,.;:!?\n]|\s*$)",
    re.I,
)

_POSITION_CI_RE = re.compile(
    r"\b(?:as|position\s+of|role\s+of|designation|job\s+title|position\s*:|title\s*:)\s+(?:an?\s+)?"
    r"(?P<value>[A-Za-z0-9/&,'’()\- ]+?)"
    r"(?=\s+(?:from|for|under|at|in|with|based)\b|\s*[,.;:!?\n]|\s*$)",
    re.I,
)

_COMPANY_EMPLOYEE_OF_RE = re.compile(
    r"\b(?:employee|staff|member)\s+(?:of|at|with)\s+"
    r"(?P<value>[A-Z][A-Za-z0-9&.,'’()\- ]+?)"
    r"(?=\s+(?:since|from|as|with|and)\b|\s*[,.;:!?\n]|\s*$)",
)

_POSITION_DESIGNATION_RE = re.compile(
    r"\b(?:designation|job\s+title|position|title)\s*[:\-]\s*"
    r"(?P<value>[A-Z][A-Za-z0-9/&,'’()\- ]+?)"
    r"(?=\s*[,.;:!?\n]|\s*$)",
)

_INSTITUTION_EXTRA_RE = re.compile(
    r"\b(?:at|from|by)\s+(?P<value>[A-Z][A-Za-z0-9.,'’()\- ]+?"
    r"(?:TESDA|Training\s+Center|Polytechnic|Foundation|Seminary|Seminario))[A-Za-z]*"
    r"(?=\s*[,.;:!?\n]|\s+(?:in|from|with|and|on)\b|\s*$)",
)

_INSTITUTION_ORG_HINT_RE = re.compile(
    r"\b(university|college|institute|academy|school|tesda|"
    r"training\s+center|polytechnic|foundation)\b",
    re.I,
)

_ISSUER_ORG_HINT_RE = re.compile(
    r"\b(tesda|technical\s+education|skills\s+development|commission|"
    r"institute|association|board|authority|red\s+cross|department|"
    r"professional\s+regulation|training|education)\b",
    re.I,
)


def _dedup_candidates(values: List[Optional[str]]) -> List[str]:
    seen: set = set()
    out: List[str] = []
    for value in values:
        cleaned = _clean_value(value) if isinstance(value, str) else ""
        if not cleaned or len(cleaned) < 2:
            continue
        if _is_boilerplate(cleaned):
            continue
        key = _norm_smart(cleaned)
        if key in seen:
            continue
        seen.add(key)
        out.append(cleaned)
    return out


def _choose_candidate(
    candidates: List[str], resume_values: Optional[List[Any]]
) -> Optional[str]:
    """Picks the document claim most relevant to this applicant.

    When several phrases were extracted, the one closest to the resume wins
    — e.g. the real employer beats a letterhead vendor. Without resume hints
    the first (most precise pattern) candidate wins.
    """
    if not candidates:
        return None
    if len(candidates) == 1:
        return candidates[0]
    hints = [v for v in (resume_values or []) if isinstance(v, str) and v.strip()]
    if not hints:
        return candidates[0]
    best: Optional[str] = None
    best_score = -1.0
    for candidate in candidates:
        score = max(_similarity(hint, candidate) for hint in hints)
        if score > best_score:
            best, best_score = candidate, score
    return best if best is not None else candidates[0]


def _choose_tiered(
    precise: List[Optional[str]],
    fallback: List[Optional[str]],
    resume_values: Optional[List[Any]],
    is_match: Optional[Any] = None,
) -> Optional[str]:
    """Anchored-regex hits outrank NER guesses: a phrase explicitly framed as
    "employed by X as Y" is a more precise claim than a bare organization
    mention. Resume hints only break ties *within* a tier, so an explicit
    statement is never shadowed by a model guess.

    When `is_match(hint, candidate)` is supplied (same verdict logic the
    comparison step will use), a precise-tier candidate that matches nothing
    on the resume yields to a fallback candidate that does — e.g. a venue or
    client name caught by a regex gives way to the real employer also named
    in the document. A precise claim that matches (even via alias) is always
    kept, so "as Front Desk Agent" still resolves through the alias table.
    """
    precise_cands = _dedup_candidates(precise)
    fallback_cands = _dedup_candidates(fallback)
    hints = [v for v in (resume_values or []) if isinstance(v, str) and v.strip()]
    if precise_cands:
        if is_match and hints:
            matched = [
                c for c in precise_cands
                if any(is_match(h, c) for h in hints)
            ]
            if matched:
                return _choose_candidate(matched, resume_values)
            for c in sorted(
                fallback_cands,
                key=lambda c: max(_similarity(h, c) for h in hints),
                reverse=True,
            ):
                if any(is_match(h, c) for h in hints):
                    return c
        else:
            return _choose_candidate(precise_cands, resume_values)
        return precise_cands[0]
    if is_match and hints:
        # Fallback tier is weak evidence (bare org mention, NER guess): it may
        # corroborate the resume but must never accuse — a letterhead vendor
        # or a generic NER span is not a claim. No corroboration → nothing
        # (UNABLE) instead of a false mismatch.
        for c in sorted(
            fallback_cands,
            key=lambda c: max(_similarity(h, c) for h in hints),
            reverse=True,
        ):
            if any(is_match(h, c) for h in hints):
                return c
        return None
    return _choose_candidate(fallback_cands, resume_values)

# ---------------------------------------------------------------------------
# Document-side claim extraction.
# Each extractor gathers every plausible phrase (anchored regexes first,
# then case-insensitive fallbacks, then NER output) and — when resume
# hints are supplied — returns the candidate closest to the resume, so a
# letterhead vendor or a noisy NER span no longer shadows the real claim.
# ---------------------------------------------------------------------------

def _regex_value(pattern: "re.Pattern[str]", text: str) -> Optional[str]:
    try:
        match = pattern.search(text)
    except Exception:
        return None
    if not match:
        return None
    try:
        value = _clean_value(match.group("value"))
    except IndexError:
        return None
    if not value or _is_month_phrase(value):
        return None
    return value


def _extract_company(
    text: str, extraction: Dict[str, Any], resume_companies: Optional[List[Any]] = None
) -> Optional[str]:
    precise: List[Optional[str]] = [
        _regex_value(_COMPANY_PRIMARY_RE, text),
        _regex_value(_COMPANY_EMPLOYEE_OF_RE, text),
    ]
    position_match = _POSITION_RE.search(text) or _POSITION_CI_RE.search(text)
    if position_match:
        try:
            secondary = _COMPANY_SECONDARY_RE.search(text[position_match.end():])
            if secondary:
                precise.append(_regex_value(_COMPANY_SECONDARY_RE, text[position_match.end():]))
        except Exception:
            pass
    precise.append(_regex_value(_COMPANY_PRIMARY_CI_RE, text))
    fallback = [
        org.strip() for org in extraction.get("organizations") or []
        if isinstance(org, str) and org.strip()
    ]
    return _choose_tiered(
        precise, fallback, resume_companies,
        is_match=lambda h, c: _compare_text_values(h, c)["result"] == RESULT_MATCH,
    )


def _extract_position(
    text: str, extraction: Dict[str, Any], resume_titles: Optional[List[Any]] = None,
    roles_ref: Optional[Dict[str, List[str]]] = None,
) -> Optional[str]:
    precise: List[Optional[str]] = [
        _regex_value(_POSITION_RE, text),
        _regex_value(_POSITION_DESIGNATION_RE, text),
        _regex_value(_POSITION_CI_RE, text),
    ]
    fallback = [
        title.strip() for title in extraction.get("job_titles_raw") or []
        if isinstance(title, str) and title.strip()
    ]
    return _choose_tiered(
        precise, fallback, resume_titles,
        is_match=lambda h, c: _compare_text_values(h, c, roles_ref)["result"] == RESULT_MATCH,
    )


def _extract_degree(
    text: str, extraction: Dict[str, Any], resume_education: Optional[List[Any]] = None
) -> Optional[str]:
    """Degree/program claim from a certificate text. Different degree patterns
    capture different spans (some group only the degree keyword, others the
    full program), so every pattern contributes candidates; the candidate
    closest to the resume wins, otherwise the longest well-formed one.
    NER education entries are only a fallback when no pattern fires."""
    pattern_cands: List[str] = []
    for pattern in entity_extraction.DEGREE_PATTERNS:
        match = pattern.search(text)
        if not match:
            continue
        for raw in ((match.group(1) if match.groups() else None), match.group(0)):
            if not raw:
                continue
            value = _clean_value(raw)
            value = _TRIM_PROSE_RE.split(value, maxsplit=1)[0].strip(" .,;:|-")
            # Degree names are single-line phrases; multi-line or very long
            # matches are narrative noise swallowed by greedy patterns.
            if value and "\n" not in value and len(value) <= 70:
                pattern_cands.append(value)
    ner_cands = [
        _clean_value(e) for e in extraction.get("education") or []
        if isinstance(e, str) and e.strip()
    ]
    hints = [v for v in (resume_education or []) if isinstance(v, str) and v.strip()]
    pattern_cands = _dedup_candidates(pattern_cands)
    if pattern_cands:
        if hints:
            chosen = _choose_candidate(pattern_cands, hints)
            if chosen:
                return chosen
        return max(pattern_cands, key=len)
    ner_cands = _dedup_candidates(ner_cands)
    if ner_cands:
        if hints:
            chosen = _choose_candidate(ner_cands, hints)
            if chosen:
                return chosen
        return ner_cands[0]
    return None


def _extract_institution(
    text: str,
    extraction: Optional[Dict[str, Any]] = None,
    resume_education: Optional[List[Any]] = None,
) -> Optional[str]:
    precise: List[Optional[str]] = [
        _regex_value(_INSTITUTION_RE, text),
        _regex_value(_INSTITUTION_EXTRA_RE, text),
    ]
    fallback: List[Optional[str]] = []
    if extraction:
        for org in extraction.get("organizations") or []:
            if isinstance(org, str) and org.strip() and _INSTITUTION_ORG_HINT_RE.search(org):
                # Header-style school names ("ATENEO DE MANILA UNIVERSITY" on a
                # Filipino diploma) carry no at/from framing — the keyword is
                # the signal. Boilerplate ("Republic of the Philippines" has
                # none of these keywords) stays excluded.
                if not _is_boilerplate(org):
                    fallback.append(org.strip())
    return _choose_tiered(
        precise, fallback, resume_education,
        is_match=lambda h, c: _compare_text_values(h, c)["result"] == RESULT_MATCH,
    )


def _extract_issuer(
    text: str,
    extraction: Dict[str, Any],
    resume_certs: Optional[List[Any]] = None,
) -> Optional[str]:
    precise: List[Optional[str]] = [_regex_value(_ISSUER_RE, text)]
    fallback: List[Optional[str]] = []
    for org in extraction.get("organizations") or []:
        if isinstance(org, str) and org.strip() and _ISSUER_ORG_HINT_RE.search(org):
            fallback.append(org.strip())
    return _choose_tiered(precise, fallback, resume_certs)


def _cert_line_fallback(text: str) -> Optional[str]:
    for line in (text or "").split("\n"):
        line = _clean_value(line)
        if not line or len(line) > 90:
            continue
        if _is_boilerplate(line):
            continue
        # Date/ID lines ("Conferred on: October 2020") are metadata, not titles.
        if ":" in line or _looks_like_person(line):
            continue
        low = line.lower()
        if low.startswith(("certifications", "certificates", "this is to certify", "this certifies")):
            continue
        if _CERT_MARKER_RE.search(line):
            return line
    return None


def _select_document_cert(
    doc_certs: List[Any], certs_ref: Dict[str, List[str]],
    resume_certs: Optional[List[Any]] = None,
) -> Optional[str]:
    """Credential documents trigger noisy global NER candidates (title lines,
    'Issued on ...' phrases). Prefer the candidate the certifications reference
    data actually recognizes — breaking ties toward the resume — otherwise the
    candidate closest to the resume, else the first non-trivial candidate."""
    cleaned: List[str] = []
    for cert in doc_certs:
        value = _clean_value(cert) if isinstance(cert, str) else ""
        if not value or len(value) < 4:
            continue
        if _is_boilerplate(value):
            continue
        # ID/serial fragments ("Id: Cred", "Registration Id: Ws") and
        # signatory names are never credential titles.
        if ":" in value or _looks_like_person(value):
            continue
        # "Conducted On March 2019" and friends are the paper's metadata, not
        # the name of the credential it certifies.
        if _is_date_only_phrase(value):
            continue
        low = value.lower()
        if low.startswith((
            "of ", "the ", "this is to", "this certifies",
            "to officially certify", "hereby",
            "issued", "given", "has met", "requirements",
        )):
            continue
        if value not in cleaned:
            cleaned.append(value)
    if not cleaned:
        return None
    recognized = [v for v in cleaned if refdata.canonicalize(v, certs_ref)]
    pool = recognized or cleaned
    if len(pool) == 1:
        return pool[0]
    chosen = _choose_candidate(pool, resume_certs)
    return chosen or pool[0]


def _extract_date_range(text: str, anchor: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """Parses the document's employment date range with the shared
    credential_verification.parse_date_range() parser, preferring the range
    closest to the employment sentence."""
    scan = re.sub(r"\bu\.?p\.?\s+to\b", " to ", text or "", flags=re.I)
    matches = list(entity_extraction.DATE_RANGE_RE.finditer(scan))
    best = None
    if matches:
        if anchor is not None:
            best = min(matches, key=lambda m: abs(m.start() - anchor))
        else:
            best = matches[0]
    else:
        years_only = re.search(r"\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:19|20)\d{2}\b", scan)
        best = years_only
    if best is None:
        return _extract_since_present_range(scan)
    parsed = credential_verification.parse_date_range(best.group(0))
    parsed["raw"] = _clean_value(best.group(0))
    return parsed


def _extract_since_present_range(scan: str) -> Optional[Dict[str, Any]]:
    """Open-ended tenure fallback for COEs that never state a range.

    "employed with Raffles Makati since January 2022 and is currently an
    active employee" carries a start plus a present-tense signal but no
    "YYYY - YYYY" span, so the shared range parser finds nothing. When a
    "since MONTH YYYY" sits near a present word (currently/present/active),
    the employment is start-dated with a present end.
    """
    since_match = re.search(
        r"\bsince\s+(?:(?P<sm>[A-Za-z]{3,9})\.?\s+)?(?P<sy>(?:19|20)\d{2})",
        scan or "",
        re.I,
    )
    if not since_match:
        return None
    window = (scan or "")[since_match.end():since_match.end() + 150]
    if not re.search(r"\b(currently|present|active|to date|ongoing|now)\b", window, re.I):
        return None
    sm_name = (since_match.group("sm") or "").strip(".").lower()[:3]
    months = getattr(entity_extraction, "MONTHS", {})
    sm = months.get(sm_name, 1) if sm_name else 1
    sy = int(since_match.group("sy"))
    today = date.today()
    return {
        "start": f"{sy:04d}-{sm:02d}",
        "end": "present",
        "is_current": True,
        "start_year": sy,
        "start_month": sm,
        "end_year": today.year,
        "end_month": today.month,
        "explicit_start_month": bool(since_match.group("sm")),
        "explicit_end_month": True,
        "raw": _clean_value(since_match.group(0)) + " – Present",
    }


def _date_check(resume_period: Any, doc_range: Optional[Dict[str, Any]], side: str) -> Dict[str, Any]:
    """Compares one side (start/end) of the employment period. Year+month are
    compared when both sides name the month, otherwise year only."""
    resume_dr = credential_verification.parse_date_range(resume_period if isinstance(resume_period, str) else "")
    doc_dr = doc_range or {}
    doc_raw = doc_dr.get("raw")
    if side == "start":
        resume_val = resume_dr.get("start")
        doc_val = doc_dr.get("start")
        resume_explicit = bool(resume_dr.get("explicit_start_month"))
        doc_explicit = bool(doc_dr.get("explicit_start_month"))
        resume_year, doc_year = resume_dr.get("start_year"), doc_dr.get("start_year")
        resume_month, doc_month = resume_dr.get("start_month"), doc_dr.get("start_month")
    else:
        resume_val = resume_dr.get("end")
        doc_val = doc_dr.get("end")
        resume_explicit = bool(resume_dr.get("explicit_end_month"))
        doc_explicit = bool(doc_dr.get("explicit_end_month"))
        resume_year, doc_year = resume_dr.get("end_year"), doc_dr.get("end_year")
        resume_month, doc_month = resume_dr.get("end_month"), doc_dr.get("end_month")

    base = {
        "resume_value": resume_period if isinstance(resume_period, str) and resume_period.strip() else None,
        "document_value": doc_raw,
        "normalized_resume": resume_val,
        "normalized_document": doc_val,
    }
    if not resume_val or not doc_val or resume_year is None or doc_year is None:
        return {**base, "match_method": METHOD_UNABLE, "result": RESULT_UNABLE}
    if resume_val == "present" or doc_val == "present":
        result = RESULT_MATCH if resume_val == doc_val else RESULT_MISMATCH
    elif resume_explicit and doc_explicit:
        delta_months = abs(
            (resume_year * 12 + (resume_month or 1)) - (doc_year * 12 + (doc_month or 1))
        )
        if delta_months == 0:
            return {**base, "match_method": METHOD_EXACT, "result": RESULT_MATCH}
        if delta_months <= _DATE_TOLERANCE_MONTHS:
            return {
                **base,
                "match_method": METHOD_DATE_TOLERANCE,
                "result": RESULT_MATCH,
                "note": (
                    f"Same period — the resume rounds to the month while the paper states "
                    f"the exact date ({delta_months} month"
                    f"{'' if delta_months == 1 else 's'} apart)."
                ),
            }
        result = RESULT_MISMATCH
    else:
        result = RESULT_MATCH if resume_year == doc_year else RESULT_MISMATCH
    return {**base, "match_method": METHOD_EXACT, "result": result}


# ---------------------------------------------------------------------------
# Type-specific verifiers
# ---------------------------------------------------------------------------

def _verify_coe(
    text: str, extraction: Dict[str, Any], profile: Dict[str, Any], refs: Tuple
) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Any]]:
    """Employment verification: compares employer, position and employment
    dates against the resume's work-history entries."""
    roles_ref = refs[1]
    work = [w for w in (profile.get("work_experience") or []) if isinstance(w, dict)]
    resume_companies = [w.get("company") for w in work]
    resume_titles = [w.get("job_title") for w in work]
    doc_company = _extract_company(text, extraction, resume_companies)
    doc_position = _extract_position(text, extraction, resume_titles, roles_ref)
    anchor_match = (
        _COMPANY_PRIMARY_RE.search(text)
        or _POSITION_RE.search(text)
        or _COMPANY_PRIMARY_CI_RE.search(text)
        or _POSITION_CI_RE.search(text)
    )
    try:
        anchor_end = anchor_match.end() if anchor_match else None
    except Exception:
        anchor_end = None
    doc_range = _extract_date_range(text, anchor_end)

    claims: Dict[str, Any] = {
        "company": doc_company,
        "position": doc_position,
        "employment_dates": (doc_range or {}).get("raw"),
    }

    checks: Dict[str, Dict[str, Any]] = {}
    if not work:
        checks["company"] = _unable_check(None, doc_company)
        checks["position"] = _unable_check(None, doc_position)
        checks["start_date"] = _date_check(None, doc_range, "start")
        checks["end_date"] = _date_check(None, doc_range, "end")
        return checks, claims

    # Compare against the resume entry the document most plausibly proves.
    # Entries score on JOINT company+title evidence (straight or swapped):
    # a generic title elsewhere ("Concierge") must not beat the true entry
    # whose company/title are merely swapped or noisy. Entries whose
    # company/title look swapped (hotel name in the title slot) are
    # recovered cross-wise when the crossed reading clearly wins.
    best_entry: Optional[Dict[str, Any]] = None
    best_score = -1.0
    best_swapped = False
    for entry in work:
        straight = (
            _similarity(entry.get("company"), doc_company)
            + _similarity(entry.get("job_title"), doc_position)
        ) / 2.0
        crossed = (
            _similarity(entry.get("company"), doc_position)
            + _similarity(entry.get("job_title"), doc_company)
        ) / 2.0
        if crossed > straight and (crossed - straight) >= 0.1:
            score, swapped = crossed, True
        else:
            score, swapped = straight, False
        if score > best_score:
            best_entry, best_score, best_swapped = entry, score, swapped

    if best_swapped and best_entry is not None:
        checks["company"] = _compare_text_values(best_entry.get("job_title"), doc_company)
        checks["position"] = _compare_text_values(
            best_entry.get("company"), doc_position, roles_ref
        )
    else:
        checks["company"] = _compare_text_values(
            best_entry.get("company") if best_entry else None, doc_company
        )
        checks["position"] = _compare_text_values(
            best_entry.get("job_title") if best_entry else None, doc_position, roles_ref
        )
    checks["start_date"] = _date_check(
        best_entry.get("period") if best_entry else None, doc_range, "start"
    )
    checks["end_date"] = _date_check(
        best_entry.get("period") if best_entry else None, doc_range, "end"
    )
    return checks, claims


def _verify_education(
    text: str, extraction: Dict[str, Any], profile: Dict[str, Any],
    education_ref: Optional[Dict[str, List[str]]],
) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Any]]:
    """Education verification: compares the degree/program and (when both
    sides actually name one) the institution against the resume's education
    entries."""
    entries = [e for e in (profile.get("education") or []) if isinstance(e, str) and e.strip()]
    doc_degree = _extract_degree(text, extraction, entries)
    doc_institution = _extract_institution(text, extraction, entries)

    claims: Dict[str, Any] = {"degree": doc_degree, "institution": doc_institution}

    checks: Dict[str, Dict[str, Any]] = {
        "degree": _best_degree_check(entries, doc_degree, education_ref),
    }
    if doc_institution:
        institution_entries = [e for e in entries if _INSTITUTION_KEYWORD_RE.search(e)]
        if institution_entries:
            checks["institution"] = _best_text_check(institution_entries, doc_institution)
        else:
            checks["institution"] = _unable_check(None, doc_institution)
    else:
        checks["institution"] = _unable_check(None, None)
    return checks, claims


def _verify_certification(
    text: str, extraction: Dict[str, Any], profile: Dict[str, Any], refs: Tuple
) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Any]]:
    """Certification verification: compares the certification name against the
    resume's certification entries via the reference alias table, and the
    issuing organization when the document names one."""
    certs_ref = refs[2]
    resume_certs = [c for c in (profile.get("certifications") or []) if isinstance(c, str) and c.strip()]
    doc_certs = [c for c in (extraction.get("certifications_raw") or []) if isinstance(c, str) and c.strip()]
    doc_cert = _select_document_cert(doc_certs, certs_ref, resume_certs) or _cert_line_fallback(text)
    doc_issuer = _extract_issuer(text, extraction, resume_certs)

    claims: Dict[str, Any] = {"certification": doc_cert, "issuer": doc_issuer}

    checks: Dict[str, Dict[str, Any]] = {
        "certification": _best_cert_check(resume_certs, doc_cert, certs_ref),
        "issuer": _issuer_check(doc_issuer, resume_certs),
    }
    return checks, claims


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def _unwrap_profile(resume_profile: Any) -> Optional[Dict[str, Any]]:
    if not isinstance(resume_profile, dict):
        return None
    if any(k in resume_profile for k in ("work_experience", "education", "certifications")):
        return resume_profile
    inner = resume_profile.get("profile")
    if isinstance(inner, dict):
        return inner
    return resume_profile


def _profile_payload(extraction: Dict[str, Any]) -> Dict[str, Any]:
    """Raw entity extraction from the document, kept for the HR dossier."""
    return {
        "name": extraction.get("name"),
        "organizations": extraction.get("organizations"),
        "job_titles_raw": extraction.get("job_titles_raw"),
        "education": extraction.get("education"),
        "certifications_raw": extraction.get("certifications_raw"),
        "work_history": extraction.get("work_history"),
        "sections_detected": extraction.get("sections_detected"),
        "estimated_years_experience": extraction.get("estimated_years_experience"),
    }


def _recipient_name_present(resume_profile: Dict[str, Any], doc_text: str) -> bool:
    """True when the applicant's name appears anywhere in the document text.

    A paper that names nobody (torn scan with the recipient area severed,
    or somebody else's document) cannot be attributed to this applicant no
    matter how well its other claims read — comparing its contents would
    risk verifying the wrong person's history. Requires the family name
    plus at least one given name (tolerating OCR noise at ratio >= 0.85);
    single-token names need just that token. Skipped when the resume has
    no usable name rather than punishing the document.
    """
    name = None
    personal = resume_profile.get("personal_information")
    if isinstance(personal, dict):
        name = personal.get("name")
    if not isinstance(name, str) or not name.strip():
        name = resume_profile.get("name")
    if not isinstance(name, str) or not name.strip():
        return True
    tokens = [t.lower() for t in re.findall(r"[A-Za-zÑñ]+", name) if len(t) > 1]
    if not tokens:
        return True
    words = re.findall(r"[A-Za-zÑñ]+", _norm_smart(doc_text))
    word_set = set(words)

    def found(token: str) -> bool:
        if token in word_set:
            return True
        return any(
            abs(len(w) - len(token)) <= 2 and SequenceMatcher(None, token, w).ratio() >= 0.85
            for w in word_set
        )

    if len(tokens) == 1:
        return found(tokens[0])
    return found(tokens[-1]) and any(found(t) for t in tokens[:-1])


def verify_supporting_document(
    doc_text: str,
    doc_type: str,
    resume_profile: Any,
    reference_data: Optional[Dict[str, Dict[str, List[str]]]] = None,
) -> Dict[str, Any]:
    """Compares a supporting document's extracted claims against the resume profile.

    Args:
        doc_text: pre-extracted (and ideally preprocessed) document text.
        doc_type: COE | Certificate | Credential | Others.
        resume_profile: the applicant's profile from applicant_screenings.profile_json.
        reference_data: optional DB-managed alias mapping
            ({skills|job_roles|certifications|education: {canonical: [aliases]}}).

    Returns a dict with success, document_type, verification_status
    (VERIFIED | DISCREPANCY_FOUND | UNABLE_TO_VERIFY), a per-field checks map,
    a human-readable summary and the raw extracted_document_profile.
    """
    normalized_type = (doc_type or "").strip()
    text = (doc_text or "").strip()
    profile = _unwrap_profile(resume_profile)

    result: Dict[str, Any] = {
        "success": True,
        "document_type": normalized_type,
        "verification_status": STATUS_UNABLE,
        "checks": {},
        "summary": "",
        "extracted_document_profile": {},
    }

    if not text:
        result["summary"] = (
            "No readable text could be extracted from the document, so no "
            "comparison against the resume claims was possible."
        )
        return result

    if not profile:
        result["summary"] = (
            "No resume screening profile is available for this applicant, so the "
            "document claims have nothing to compare against. Screen the applicant's "
            "resume first, then re-verify this document."
        )
        return result

    if not _recipient_name_present(profile, text):
        result["summary"] = (
            "The applicant's name appears nowhere in the document — the recipient "
            "area may be torn off or unreadable, or this may be someone else's "
            "paper — so its claims cannot be attributed to this applicant. "
            "Manual HR review is required."
        )
        return result

    extractor = entity_extraction.get_extractor()
    extraction = extractor.extract(text, reference_data)
    result["extracted_document_profile"] = _profile_payload(extraction)

    if normalized_type not in SUPPORTED_TYPES:
        result["summary"] = (
            f"Document type '{normalized_type or 'unknown'}' cannot be mapped to a resume "
            "section automatically; the extracted content is stored for manual HR review."
        )
        return result

    refs = refdata.effective_references(reference_data)
    if normalized_type in COE_TYPES:
        checks, claims = _verify_coe(text, extraction, profile, refs)
    elif normalized_type in EDUCATION_TYPES:
        checks, claims = _verify_education(
            text, extraction, profile, (reference_data or {}).get("education")
        )
    else:
        checks, claims = _verify_certification(text, extraction, profile, refs)

    result["checks"] = checks
    if claims:
        result["extracted_document_profile"]["document_claims"] = claims

    results = [c.get("result") for c in checks.values()]
    extractable = [r for r in results if r != RESULT_UNABLE]
    mismatched = [CHECK_LABELS.get(k, k) for k, c in checks.items() if c.get("result") == RESULT_MISMATCH]
    unresolved = [CHECK_LABELS.get(k, k) for k, c in checks.items() if c.get("result") == RESULT_UNABLE]
    doc_label = DOC_LABELS.get(normalized_type, "supporting document")

    if not checks or not extractable:
        result["verification_status"] = STATUS_UNABLE
        if unresolved:
            result["summary"] = (
                f"The {doc_label} could not be verified: {_join_and(unresolved)} "
                "could not be compared against the resume claims."
            )
        else:
            result["summary"] = (
                f"The {doc_label} contained no comparable claims, so no comparison "
                "against the resume was possible."
            )
    elif mismatched:
        result["verification_status"] = STATUS_DISCREPANCY
        result["summary"] = (
            f"Discrepancy found in {_join_and(mismatched)} - the {doc_label} does not "
            "fully match the resume claims."
        )
    else:
        result["verification_status"] = STATUS_VERIFIED
        result["summary"] = (
            f"All {len(extractable)} comparable field(s) on the {doc_label} match the resume claims."
            + (
                ""
                if not unresolved
                else f" {_join_and(unresolved)} could not be compared because the resume "
                "carries no equivalent value."
            )
        )

    return result
