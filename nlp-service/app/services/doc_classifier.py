"""Content-based document classifier for the single-dropzone apply flow.

Goal: applicant drags resume + supporting docs into ONE box in ANY order
with NO manual tags, and the system still figures out which file is which
by reading the CONTENT (not filename, not order).

Types: Resume | COE | Certificate | Credential | Others

Strategy (rule-based, transparent — every point has a human-readable reason):
  Resume      -> NER sections (experience/skills/education/summary) + contact
                 info (email/phone) + resume keywords + long body text.
  COE         -> "certificate of employment" / "certifies employment" phrasing
                 + employer/position/date-range employment claims.
  Certificate -> training/seminar/workshop completion phrasing (TESDA NC II,
                 hours, conducted on, awarded to).
  Credential  -> degree conferral / diploma / TOR / license / PRC phrasing.
  Others      -> fallback when nothing scores (awards, portfolio, IDs, etc).

Filename hints give only a SMALL bonus so content always dominates —
renamed files and shuffled order still classify correctly.

Upload-order rule: the FIRST file is EXPECTED to be the resume (applicants
almost always drop it first) but this is only a small prior (+2), never a
decision — strong COE/certificate/credential content still wins even when
first. Final formula: content (dominant) + filename (hint) + order (hint).
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Tuple

# ---------------------------------------------------------------------------
# Phrase / keyword signals (all matched case-insensitively on cleaned text,
# EXCEPT _TOR_CASE_SENSITIVE which uses _hit_cs — blurred OCR reads "for" as
# "tor", e.g. "procedures tor all assigned" on Nathaniel's resume, which
# wrongly fired +7 Credential and beat real resume signals).
# ---------------------------------------------------------------------------

# Case-sensitive TOR: matched with re.search WITHOUT re.I (see _hit_cs).
_TOR_CASE_SENSITIVE = r"\bTOR\b"

_RESUME_KEYWORDS = [
    (r"\bcurriculum\s+vitae\b", "contains 'curriculum vitae'", 4),
    (r"\bresume\b", "contains 'resume'", 2),
    (r"\bwork\s+experience\b", "contains 'work experience' section", 3),
    (r"\bprofessional\s+experience\b", "contains 'professional experience'", 3),
    (r"\bemployment\s+history\b", "contains 'employment history'", 3),
    (r"\bcareer\s+objective\b", "contains 'career objective'", 2),
    (r"\bprofessional\s+summary\b", "contains 'professional summary'", 2),
    (r"\bcore\s+competencies\b", "contains 'core competencies'", 2),
    (r"\btechnical\s+skills\b", "contains 'technical skills'", 2),
    (r"\breferences?\s+(available\s+upon\s+request|available)\b", "has references line", 1),
]

_COE_STRONG = [
    (r"\bcertificate\s+of\s+employment\b", "says 'certificate of employment'", 8),
    (r"\bcertification\s+of\s+employment\b", "says 'certification of employment'", 8),
    (r"\bthis\s+is\s+to\s+certify\s+that\b.{0,80}\bemploy", "certifies employment of a person", 6),
    (r"\bhas\s+been\s+employed\b", "states 'has been employed'", 5),
    (r"\bwas\s+employed\b", "states 'was employed'", 4),
    (r"\bis\s+employed\b", "states 'is employed'", 4),
    (r"\bdate\s+hired\b", "states 'date hired'", 3),
    (r"\btenure\b", "mentions tenure", 2),
    (r"\bemployment\s+period\b", "mentions employment period", 3),
    (r"\bmonthly\s+compensation\b|\bbasic\s+salary\b", "mentions compensation (COE style)", 2),
]

_CERTIFICATE_SIGNALS = [
    (r"\bcertificate\s+of\s+(completion|participation|recognition|achievement|attendance|training|competency|competence|proficiency|excellence)\b",
     "training certificate phrasing", 8),
    (r"\bcertifies\s+that\b.{0,80}\b(complet|participat|attend)", "certifies training completion", 5),
    (r"\bthis\s+is\s+to\s+certify\s+that\b.{0,120}\b(passed|completed|participated|attended|finished)\b",
     "certifies course completion/pass", 5),
    (r"\btesda\b", "mentions TESDA", 4),
    (r"\bnational\s+certificate\b|\bNC\s*(II|III|IV|I|1|2|3)\b", "mentions National Certificate level", 5),
    (r"\btraining\b.{0,40}\bhours\b|\bhours\b.{0,40}\b(training|practical)\b|\b\d+\s*hours?\s+(of\s+)?(training|practical)\b",
     "mentions training hours", 3),
    (r"\bconducted\s+on\b|\bheld\s+on\b", "states when training was conducted", 3),
    (r"\bseminar\b|\bworkshop\b", "mentions seminar/workshop", 3),
    (r"\bawarded\s+(to|on)\b|\bpresented\s+to\b", "award-style presentation line", 3),
    (r"\bqualification\s+course\b|\bhas\s+successfully\s+(passed|completed)\b",
     "completed qualification course", 4),
    # ---- Professional designation certificates (e.g. CFDR, hospitality certs)
    # These say "CERTIFIED ... / Certification Board confers this designation /
    # Date of Issuance / Validity / Credential ID" — none of the training-course
    # phrases above fire, so without these they lost to lone "Registrar" (+5).
    (r"\bconfers?\s+(this\s+)?designation\b", "confers professional designation", 8),
    (r"\bcertification\s+board\b", "mentions certification board", 5),
    (r"\bhereby\s+confers\b", "formal conferral of designation", 4),
    (r"\bcertified\b", "says 'certified' (professional certification)", 3),
    (r"\bdate\s+of\s+issuance\b", "states date of issuance", 3),
    (r"\bvalidity\s*:\s*\d+\s*years?\b|\bvalid\s+(for|until)\b", "states credential validity period", 3),
    (r"\bcredential\s+id\b|\bcertificate\s+(id|no\.?|number)\b|\bcertification\s+no\.?\b",
     "shows certificate/credential ID", 2),
]

_CREDENTIAL_SIGNALS = [
    # NOTE: bare "TOR" is case-SENSITIVE (matched without re.I): blurred OCR
    # reads "for" as "tor" ("procedures tor all assigned"), which wrongly
    # fired +7 Credential on Nathaniel's resume and beat real resume signals.
    # "transcript of records" stays case-insensitive; real TOR docs use caps.
    (r"\btranscript\s+of\s+records?\b", "mentions transcript of records", 7),
    (_TOR_CASE_SENSITIVE, "mentions TOR (transcript of records)", 7),
    (r"\bthis\s+diploma\b|\bdiploma\s+is\s+presented\b", "diploma presentation phrasing", 8),
    (r"\bdiploma\b", "mentions diploma", 6),
    (r"\bconferred\b.{0,40}\bdegree\b|\bdegree\s+of\b", "degree conferral phrasing", 6),
    (r"\b(cum\s+laude|magna\s+cum\s+laude|summa\s+cum\s+laude|with\s+honors|academic\s+honors)\b",
     "mentions latin/academic honors", 6),
    (r"\bboard\s+of\s+trustees\b|\buniversity\s+seal\b|\bcollege\s+of\b",
     "trustees/seal/college mark (diploma style)", 5),
    # NOTE: lone "registrar" scores only +2 (was +5). Reason: real industry
    # certificates (hospitality CFDR, TESDA, seminars) also have a "Board
    # Registrar" signatory, so a lone registrar must not outscore genuine
    # certificate phrasing ("confers designation" +8, "certification board" +5).
    # True diplomas still win via diploma/degree/honors/transcript signals.
    (r"\bregistrar\b", "mentions registrar", 2),
    (r"\bbachelor\b.{0,30}(science|arts|hospitality|business|nursing|computer)",
     "names a bachelor degree", 5),
    (r"\bprofessional\s+regulation\s+commission\b|\bPRC\b", "mentions PRC", 5),
    # NOTE: bare "license" scores only when it looks like a LICENSE DOCUMENT
    # (license card/ID/number near a license card context), NOT when it is a
    # registry/tracking number on a training certificate — e.g. Jerome's AAP
    # defensive-driving cert says "License Registry No: AAP-DDS-2022-4221",
    # which wrongly fired +4 credential and beat the certificate signals.
    (r"\blicense\s+(card|id|no\.?|number)\b|\blicence\s+(card|id)\b|\bdriver'?s?\s+license\b",
     "mentions license document", 4),
    (r"\bboard\s+passer\b|\bboard\s+exam", "mentions board exam", 4),
    (r"\bgraduated\b", "mentions graduation", 3),
    (r"\bacademic\s+year\b|\bschool\s+year\b", "mentions school year", 2),
]

_FILENAME_HINTS = [
    ("resume", "Resume", 2, "filename looks like a resume"),
    ("cv", "Resume", 2, "filename looks like a CV"),
    ("coe", "COE", 2, "filename hints COE"),
    ("certificate of employment", "COE", 2, "filename hints COE"),
    ("employment", "COE", 1, "filename hints employment"),
    ("training", "Certificate", 1, "filename hints training"),
    ("seminar", "Certificate", 1, "filename hints seminar"),
    ("tesda", "Certificate", 2, "filename hints TESDA"),
    ("nc2", "Certificate", 1, "filename hints NC II"),
    ("nc ii", "Certificate", 1, "filename hints NC II"),
    ("diploma", "Credential", 2, "filename hints diploma"),
    ("tor", "Credential", 2, "filename hints TOR"),
    ("transcript", "Credential", 2, "filename hints transcript"),
    ("license", "Credential", 2, "filename hints license"),
    ("prc", "Credential", 2, "filename hints PRC"),
]

_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
# OCR-tolerant email: Tesseract on scans/images often inserts spaces around @
# and drops the dot ("procurement@ gmailcom", "john @ gmail com"). Requires
# the "@-word" to contain a letter (so "@ Managed" false-hits on Nathaniel's
# blur don't count) and a dot OR a known mail host word (gmail/com/outlook/
# yahoo/mail/ph) so "te @es" fragments don't count either.
_EMAIL_OCR_RE = re.compile(
    r"[A-Za-z0-9._%+-]*[A-Za-z][A-Za-z0-9._%+-]*\s*@\s*"
    r"(?=[A-Za-z0-9.-]*[A-Za-z])"
    r"[A-Za-z0-9.-]+(?:\s*\.\s*[A-Za-z]{2,}|(?=.*\b(gmail|yahoo|outlook|hotmail|mail|email|com|ph|org|net)\b))",
    re.I,
)
_PHONE_RE = re.compile(r"(?:\+?63|0)[\s.-]?\d[\d\s.-]{6,13}\d")
# OCR-tolerant phone: blurred scans lose the leading 0/+63 ("463917 402 5501"
# from "+63 917 402 5581"). Fallback: a long digit run (10+ digits ignoring
# separators) that the strict PH pattern missed. Still +2 only, so a stray
# registry/track number can't carry a document alone.
_PHONE_OCR_RE = re.compile(r"\d[\d\s.\-()]{8,}\d")

_TYPES = ("Resume", "COE", "Certificate", "Credential", "Others")


def _hit(pattern: str, text: str) -> bool:
    return re.search(pattern, text, re.I | re.S) is not None


def _hit_cs(pattern: str, text: str) -> bool:
    """Case-sensitive match (no re.I) — for TOR, where blurred OCR turns
    lowercase "for" into "tor" and a case-insensitive \\bTOR\\b would fire."""
    return re.search(pattern, text, re.S) is not None


def classify_text(
    text: str,
    filename: str = "",
    sections: List[str] | None = None,
    profile: Dict[str, Any] | None = None,
    is_first: bool = False,
) -> Dict[str, Any]:
    """Scores cleaned document text and returns prediction + breakdown.

    Three-signal fusion: CONTENT dominates, filename is a small hint (+2 max),
    upload order is a small prior (+2 when is_first). Content always wins —
    strong COE/certificate/credential phrasing beats both hints combined.

    Returns:
        predicted_type, confidence (0..1), scores {type: points},
        reasons [str], signals {has_email, has_phone, sections, char_count, is_first}.
    """
    cleaned = text or ""
    low_len = len(cleaned)
    sections = sections or []
    section_set = {s.lower() for s in sections}

    scores: Dict[str, float] = {t: 0.0 for t in _TYPES}
    reasons: List[str] = []

    # ---- Resume: structure signals -------------------------------------
    # NOTE: education alone proves little (diplomas/TORs also match it), so it
    # is weighted 1 while experience/skills carry 3. A lone education section
    # must never outscore real credential phrasing.
    _SECTION_WEIGHTS = {"experience": 3, "skills": 3, "summary": 2, "education": 1}
    resume_sections = section_set & set(_SECTION_WEIGHTS)
    section_pts = sum(_SECTION_WEIGHTS[s] for s in resume_sections)
    if resume_sections:
        scores["Resume"] += section_pts
        reasons.append(
            f"resume sections found: {', '.join(sorted(resume_sections))} (+{section_pts})"
        )
    if len(section_set) >= 3:
        scores["Resume"] += 2
        reasons.append(f"{len(section_set)} sections detected — resume-style structure (+2)")

    has_email = bool(_EMAIL_RE.search(cleaned)) or bool(_EMAIL_OCR_RE.search(cleaned))
    has_phone = bool(_PHONE_RE.search(cleaned)) or (
        not _PHONE_RE.search(cleaned)
        and any(sum(ch.isdigit() for ch in m.group(0)) >= 10 for m in _PHONE_OCR_RE.finditer(cleaned))
    )
    if has_email:
        scores["Resume"] += 2
        reasons.append("contains email address (+2 resume)")
    if has_phone:
        scores["Resume"] += 2
        reasons.append("contains phone number (+2 resume)")

    # Contact block with both email+phone is strongly resume-like
    if has_email and has_phone:
        scores["Resume"] += 2
        reasons.append("has both email and phone — applicant contact block (+2 resume)")

    # OCR fallback headings: blurred image resumes (Camille's spa files) lose
    # every header to OCR noise, so section_detection returns []. But the BODY
    # still holds resume-shaped evidence: date ranges (2022 - Present), bullet
    # density, and long multi-role text. Count each once so a real resume
    # still beats Others without letting diplomas ride on length alone.
    ocr_heading_pts = 0
    if not resume_sections:
        date_ranges = re.findall(
            r"(?:(?:19|20)\d{2}|[A-Za-z]{3,9}\.?\s+(?:19|20)\d{2})\s*(?:-|–|—|to|until)\s*"
            r"(?:(?:19|20)\d{2}|[A-Za-z]{3,9}\.?\s+(?:19|20)\d{2}|present|current|now)\b",
            cleaned,
            re.I,
        )
        if len(date_ranges) >= 2:
            scores["Resume"] += 2
            ocr_heading_pts += 2
            reasons.append(f"{len(date_ranges)} employment date ranges — work-history shape (+2 resume)")
        bullets = sum(1 for ln in cleaned.split("\n") if re.match(r"\s*(?:[•\-*▪►]|\d+\.)\s+\S", ln))
        if bullets >= 5:
            scores["Resume"] += 1
            ocr_heading_pts += 1
            reasons.append(f"{bullets} bullet lines — resume work-detail shape (+1 resume)")
        # Destroyed-blur shape fallback: when OCR kills every word (0 date
        # ranges, headers gone) but the page keeps RESUME SHAPE — dozens of
        # bullet-led detail lines + dozens of long content lines + thousands
        # of chars — award a small shape point. Diplomas/certs are short
        # single-claim pages (few bullets, few long lines), so they can't
        # reach this; the Decide-step gate below (doc-type signals present ->
        # shape ignored) is the backstop against a noisy COE/diploma.
        if ocr_heading_pts == 0:
            any_bullets = sum(1 for ln in cleaned.split("\n") if re.match(r"\s*[^\w\s]\s*\S", ln))
            long_lines = sum(1 for ln in cleaned.split("\n") if len(ln.strip()) > 40)
            if any_bullets >= 30 and long_lines >= 40 and low_len >= 4000:
                scores["Resume"] += 2
                ocr_heading_pts += 2
                reasons.append(
                    f"resume page shape ({any_bullets} detail lines, {long_lines} long lines) "
                    "despite unreadable OCR text (+2 resume)"
                )

    # Profile evidence (when caller passes NER profile): name + skills/work history
    if profile:
        pi = profile.get("personal_information", {}) if isinstance(profile, dict) else {}
        if isinstance(pi, dict) and pi.get("name"):
            scores["Resume"] += 1
            reasons.append("NER found a person name (+1 resume)")
        skills = profile.get("skills") if isinstance(profile, dict) else None
        if isinstance(skills, list) and len(skills) >= 3:
            scores["Resume"] += 2
            reasons.append(f"NER found {len(skills)} skills (+2 resume)")

    # Resume keywords
    keyword_pts = 0
    for pattern, label, pts in _RESUME_KEYWORDS:
        if _hit(pattern, cleaned):
            scores["Resume"] += pts
            keyword_pts += pts
            reasons.append(f"{label} (+{pts} resume)")

    # Length counts ONLY with real resume structure (contact info, 2+ sections,
    # a resume keyword, or blurred-OCR work-history shape). This stops long
    # diplomas/certificates from scoring as resumes just for being long.
    has_structure = has_email or len(resume_sections) >= 2 or keyword_pts > 0 or ocr_heading_pts > 0
    if low_len >= 1500 and has_structure:
        scores["Resume"] += 3
        reasons.append(f"long structured document ({low_len} chars) — resume-like (+3 resume)")
    elif low_len >= 800 and has_structure:
        scores["Resume"] += 1
        reasons.append(f"medium structured length ({low_len} chars) (+1 resume)")
    elif low_len and low_len < 300:
        scores["Others"] += 1
        reasons.append(f"very short ({low_len} chars) — likely single-claim doc (+1 others)")

    # ---- COE signals ----------------------------------------------------
    for pattern, label, pts in _COE_STRONG:
        if _hit(pattern, cleaned):
            scores["COE"] += pts
            reasons.append(f"{label} (+{pts} COE)")

    # ---- Certificate signals --------------------------------------------
    for pattern, label, pts in _CERTIFICATE_SIGNALS:
        if _hit(pattern, cleaned):
            scores["Certificate"] += pts
            reasons.append(f"{label} (+{pts} certificate)")

    # ---- Credential signals ----------------------------------------------
    for pattern, label, pts in _CREDENTIAL_SIGNALS:
        if pattern == _TOR_CASE_SENSITIVE:
            hit = _hit_cs(pattern, cleaned)
        else:
            hit = _hit(pattern, cleaned)
        if hit:
            scores["Credential"] += pts
            reasons.append(f"{label} (+{pts} credential)")

    # ---- Filename: small bonus only (content dominates) ------------------
    # NOTE: hints match on TOKEN boundaries (split on _ - . and spaces), not raw
    # substrings — "Procurement_Coordinator" contains "tor" inside "coordinaTOR"
    # which wrongly fired +2 Credential ("filename hints TOR"). Token matching
    # keeps real "TOR"/"CV" filenames working while killed the false hit.
    fname_low = (filename or "").lower()
    fname_tokens = set(re.split(r"[_\-\.\s]+", fname_low))
    filename_pts = 0
    for hint, target, pts, label in _FILENAME_HINTS:
        hint_tokens = set(re.split(r"[_\-\.\s]+", hint))
        if hint_tokens and hint_tokens <= fname_tokens:
            scores[target] += pts
            filename_pts = pts if target == "Resume" else 0
            reasons.append(f"{label} (+{pts} {target.lower()} filename hint)")
            break  # one filename hint max — never outweigh content

    # ---- Upload order: small prior only (content dominates) ---------------
    # First file is EXPECTED to be the resume, but never trusted: +2 can only
    # break ties / nudge weak claims. Strong COE/cert/credential phrasing
    # (6+) still wins via the guard below, so a COE uploaded first stays COE.
    order_pts = 2 if is_first else 0
    if is_first:
        scores["Resume"] += order_pts
        reasons.append("uploaded first — expected resume slot (+2 resume order prior)")

    # ---- Decide -----------------------------------------------------------
    # Guard: a weak resume claim (no email, <2 sections, no resume keyword)
    # must not beat strong document phrasing. Diplomas rarely carry contact
    # blocks, so without them the best COE/Certificate/Credential score >= 6
    # wins even if Resume is ahead on hints alone. Compare CONTENT-only
    # resume (hints stripped) so filename + order (+4 max) can never smuggle
    # a COE past this guard.
    resume_structural = section_pts + (2 if has_email else 0) + (2 if has_phone else 0) + keyword_pts
    best_doc = max(
        (("COE", scores["COE"]), ("Certificate", scores["Certificate"]), ("Credential", scores["Credential"])),
        key=lambda kv: kv[1],
    )
    resume_content_only = scores["Resume"] - filename_pts - order_pts
    if resume_structural < 4 and best_doc[1] >= 6 and resume_content_only <= best_doc[1] + 1:
        scores["Resume"] -= 4
        reasons.append(
            f"weak resume structure (no contact block / single section) vs strong {best_doc[0].lower()} phrasing — adjusted (-4 resume)"
        )
    # Shape-guard backstop: the destroyed-blur shape fallback (+2) is only a
    # tiebreak against Others — if ANY real document-type signal fired (COE /
    # Certificate / Credential >= 4), a shape-only resume must not steal the
    # win. Strip shape + length points so content phrasing decides.
    shape_pts = ocr_heading_pts + (3 if low_len >= 1500 and has_structure and ocr_heading_pts > 0 else 0)
    if shape_pts > 0 and best_doc[1] >= 4 and section_pts == 0 and not has_email and keyword_pts == 0:
        scores["Resume"] -= shape_pts
        reasons.append(
            f"shape-only resume claim vs real {best_doc[0].lower()} phrasing — shape ignored (-{shape_pts} resume)"
        )

    ranked: List[Tuple[str, float]] = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    top_type, top_score = ranked[0]
    second_score = ranked[1][1] if len(ranked) > 1 else 0.0

    # Nothing fired -> Others
    if top_score <= 0:
        top_type = "Others"
        reasons.append("no resume/COE/certificate/credential signals — marked Others")

    # Confidence = margin over runner-up, scaled. Ties -> low confidence.
    total = sum(scores.values())
    if total <= 0:
        confidence = 0.0
    else:
        margin = top_score - second_score
        confidence = round(min(0.99, max(0.35, margin / max(total, 1) + 0.35)), 2)
        if margin <= 0:
            confidence = 0.35

    return {
        "predicted_type": top_type,
        "confidence": confidence,
        "scores": {k: round(float(max(0.0, v)), 1) for k, v in scores.items()},
        "reasons": reasons,
        "signals": {
            "has_email": has_email,
            "has_phone": has_phone,
            "sections": sorted(section_set),
            "char_count": low_len,
            "is_first": is_first,
        },
    }


def pick_resume(results: List[Dict[str, Any]]) -> int | None:
    """Index of the file most likely the resume (highest Resume score).

    Returns None when no file looks like a resume at all.
    """
    best_idx: int | None = None
    best_score = 0.0
    for i, r in enumerate(results):
        s = float((r.get("scores") or {}).get("Resume", 0))
        if s > best_score:
            best_score = s
            best_idx = i
    return best_idx
