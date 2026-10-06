"""Automated resume credential verification through internal consistency analysis.

Performs 7 categories of automated cross-validation on extracted profile data to detect
internally inconsistent, embellished, or potentially fabricated resumes:

1. Timeline Overlaps - Overlapping full-time positions (> 3 months)
2. Future Dates - Work or education dates set in the future
3. Experience vs. Graduation Gap - Claimed experience exceeds plausible timeframe since graduation
4. Seniority vs. Experience Mismatch - Executive/director-level titles claimed with low experience
5. Excessive Job Hopping - Unusually high job count in a short timeframe
6. Education-Certification Prerequisites - Licensure certs (PRC, RN, CPA) without degree prerequisite
7. Chronological Incoherence - Inverted date ranges or implausible career timelines
"""
from datetime import date, datetime
import re
from typing import Any, Dict, List, Optional, Set, Tuple

from app import config
from app.services import reference_data as refdata

# Common non-fulltime role keywords where overlaps or short tenures are normal
_PART_TIME_ROLE_KEYWORDS = {
    "intern", "internship", "ojt", "on-the-job trainee", "trainee",
    "part-time", "part time", "freelance", "freelancer", "contractor",
    "consultant", "volunteer", "student assistant", "apprentice",
}

# Licensure keywords requiring a tertiary degree (Bachelor's or higher)
_DEGREE_REQUIRED_CERTS = [
    (re.compile(r"\b(cpa|certified\s+public\s+accountant)\b", re.I), "CPA (Certified Public Accountant)", 4),
    (re.compile(r"\b(prc\s*(?:license|id|registered)?|registered\s+nurse|\brn\b|board\s+passer|prc\s+license)\b", re.I), "PRC Professional Licensure", 4),
    (re.compile(r"\b(licensed\s+professional\s+teacher|let\s+passer)\b", re.I), "Licensed Professional Teacher (LET)", 4),
    (re.compile(r"\b(registered\s+nutritionist|dietitian|rnd)\b", re.I), "Registered Nutritionist Dietitian (RND)", 4),
    (re.compile(r"\b(licensed\s+criminologist|registered\s+criminologist)\b", re.I), "Registered Criminologist", 4),
    (re.compile(r"\b(registered\s+master\s+plumber|licensed\s+engineer|prc\s+engineer)\b", re.I), "Licensed Engineer / Master Plumber", 4),
]

# High-seniority titles that require substantial professional experience
_EXECUTIVE_TITLES = [
    re.compile(r"\b(director(?:\s+of\s+[a-z\s]+)?|general\s+manager|gm|vice\s+president|vp|chief\s+[a-z\s]+|executive\s+chef|head\s+of\s+[a-z\s]+)\b", re.I),
]
_MANAGERIAL_TITLES = [
    re.compile(r"\b(operations\s+manager|hotel\s+manager|restaurant\s+manager|food\s+and\s+beverage\s+manager|f&b\s+manager|branch\s+manager|department\s+manager|senior\s+manager)\b", re.I),
]

_GRADUATION_YEAR_RE = re.compile(
    r"\b(?:graduated|graduate|class\s+of|batch|c/o|\(?)(?:(?:\b|\s*)(?:19|20)\d{2})\b|\b(?:19|20)\d{2}\b",
    re.I,
)


def parse_date_range(period: Optional[str]) -> Dict[str, Any]:
    """Extracts structured start/end dates from a work experience period string.

    Returns dict with:
        start: 'YYYY-MM' or None
        end: 'YYYY-MM', 'present', or None
        is_current: bool
        start_year: int or None
        start_month: int or None
        end_year: int or None
        end_month: int or None
    """
    empty_result = {
        "start": None,
        "end": None,
        "is_current": False,
        "start_year": None,
        "start_month": None,
        "end_year": None,
        "end_month": None,
    }
    if not period or not isinstance(period, str):
        return empty_result

    p = period.strip()
    match = refdata.DATE_RANGE_RE.search(p) if hasattr(refdata, "DATE_RANGE_RE") else None
    if not match:
        from app.services.entity_extraction import DATE_RANGE_RE
        match = DATE_RANGE_RE.search(p)

    months_map = getattr(refdata, "MONTHS", None)
    if months_map is None:
        from app.services.entity_extraction import MONTHS
        months_map = MONTHS

    if match:
        sy = int(match.group("sy"))
        sm_name = (match.group("sm") or "").strip(".").lower()[:3]
        sm = months_map.get(sm_name, 1)

        is_present = bool(re.search(r"\b(present|current|now)\b", match.group("end") or "", re.I))
        if match.group("ey"):
            ey = int(match.group("ey"))
            em_name = (match.group("em") or "").strip(".").lower()[:3]
            em = months_map.get(em_name, 12)
            end_str = f"{ey:04d}-{em:02d}"
        elif is_present:
            ey = date.today().year
            em = date.today().month
            end_str = "present"
        else:
            ey = None
            em = None
            end_str = None

        explicit_sm = bool(match.group("sm"))
        explicit_em = bool(match.group("em"))
        return {
            "start": f"{sy:04d}-{sm:02d}",
            "end": end_str,
            "is_current": is_present,
            "start_year": sy,
            "start_month": sm,
            "end_year": ey,
            "end_month": em,
            "explicit_start_month": explicit_sm,
            "explicit_end_month": explicit_em or is_present,
        }

    # Fallback: check for two 4-digit years: YYYY - YYYY
    years = [int(y) for y in re.findall(r"\b(?:19|20)\d{2}\b", p)]
    if len(years) >= 2:
        is_pres = bool(re.search(r"\b(present|current|now)\b", p, re.I))
        return {
            "start": f"{years[0]:04d}-01",
            "end": f"{years[1]:04d}-12" if not is_pres else "present",
            "is_current": is_pres,
            "start_year": years[0],
            "start_month": 1,
            "end_year": years[1],
            "end_month": 12,
            "explicit_start_month": False,
            "explicit_end_month": is_pres,
        }
    elif len(years) == 1:
        is_pres = bool(re.search(r"\b(present|current|now)\b", p, re.I))
        if is_pres:
            return {
                "start": f"{years[0]:04d}-01",
                "end": "present",
                "is_current": True,
                "start_year": years[0],
                "start_month": 1,
                "end_year": date.today().year,
                "end_month": date.today().month,
                "explicit_start_month": False,
                "explicit_end_month": True,
            }
        return {
            "start": f"{years[0]:04d}-01",
            "end": f"{years[0]:04d}-12",
            "is_current": False,
            "start_year": years[0],
            "start_month": 1,
            "end_year": years[0],
            "end_month": 12,
            "explicit_start_month": False,
            "explicit_end_month": False,
        }

    return empty_result


def _is_part_time_role(title: str) -> bool:
    """Checks if a job title implies part-time, internship, or freelance nature."""
    if not title:
        return False
    low = title.lower()
    return any(kw in low for kw in _PART_TIME_ROLE_KEYWORDS)


def _check_timeline_overlaps(work_history: List[Dict]) -> List[Dict]:
    """Check 1: Detects full-time employment with significant overlapping dates (> 3 months)."""
    flags = []
    entries_with_dates = []

    for item in work_history:
        dr = item.get("date_range") or parse_date_range(item.get("period"))
        sy, sm = dr.get("start_year"), dr.get("start_month", 1)
        ey, em = dr.get("end_year"), dr.get("end_month", 12)
        if sy and ey:
            try:
                start_dt = date(sy, sm or 1, 1)
                end_dt = date(ey, em or 12, 28)
                title = item.get("job_title") or "Unknown Title"
                company = item.get("company") or "Unknown Employer"
                entries_with_dates.append({
                    "title": title,
                    "company": company,
                    "start": start_dt,
                    "end": end_dt,
                    "start_year": sy,
                    "end_year": ey,
                    "explicit_start_month": dr.get("explicit_start_month", False),
                    "explicit_end_month": dr.get("explicit_end_month", False),
                    "is_current": dr.get("is_current", False),
                    "is_part_time": _is_part_time_role(title),
                    "period": item.get("period", ""),
                })
            except (ValueError, OverflowError):
                continue

    n = len(entries_with_dates)
    seen_pairs: Set[Tuple[int, int]] = set()

    for i in range(n):
        for j in range(i + 1, n):
            a = entries_with_dates[i]
            b = entries_with_dates[j]

            # Skip if either is part-time / internship / freelance
            if a["is_part_time"] or b["is_part_time"]:
                continue

            # Same company with overlapping/adjacent roles might be a promotion or transfer
            if a["company"] and b["company"] and a["company"].lower() == b["company"].lower():
                continue

            first, second = (a, b) if a["start"] <= b["start"] else (b, a)

            # If the earlier job ends in the same year the second starts, and either lacks an explicit month,
            # it is standard same-year career transition rather than a verified overlap.
            if first["end_year"] == second["start_year"]:
                if not (first["explicit_end_month"] and second["explicit_start_month"]):
                    continue

            # Overlap computation
            overlap_start = max(a["start"], b["start"])
            overlap_end = min(a["end"], b["end"])

            if overlap_end > overlap_start:
                # Calculate overlap months
                overlap_months = (overlap_end.year - overlap_start.year) * 12 + (overlap_end.month - overlap_start.month)
                if overlap_months >= 3:
                    pair_key = (i, j)
                    if pair_key not in seen_pairs:
                        seen_pairs.add(pair_key)
                        flags.append({
                            "check": "timeline_overlap",
                            "severity": "WARNING",
                            "detail": (
                                f"Significant overlap ({overlap_months} months) between full-time roles: "
                                f"'{a['title']}' at {a['company']} ({a['period']}) and "
                                f"'{b['title']}' at {b['company']} ({b['period']})."
                            ),
                            "evidence": {
                                "role_a": f"{a['title']} at {a['company']}",
                                "period_a": a["period"],
                                "role_b": f"{b['title']} at {b['company']}",
                                "period_b": b["period"],
                                "overlap_months": overlap_months,
                            },
                        })
    return flags


def _check_future_dates(work_history: List[Dict], education: List[str]) -> List[Dict]:
    """Check 2: Flags work or education end dates set in the future."""
    flags = []
    today = date.today()
    current_year = today.year

    for item in work_history:
        dr = item.get("date_range") or parse_date_range(item.get("period"))
        sy = dr.get("start_year")
        ey = dr.get("end_year")
        sm = dr.get("start_month", 1) or 1
        em = dr.get("end_month", 12) or 12
        title = item.get("job_title") or "Role"
        company = item.get("company") or ""

        # Future start date: start month/year is in the future (> current month)
        if sy and (sy > current_year or (sy == current_year and sm > today.month)):
            flags.append({
                "check": "future_dates",
                "severity": "WARNING",
                "detail": (
                    f"Work experience '{title}' at {company or 'unspecified'} has a future start date "
                    f"({sy}-{sm:02d}). Employment cannot start in the future."
                ),
                "evidence": {"job_title": title, "period": item.get("period"), "start": f"{sy}-{sm:02d}"},
            })
        # Future end date (if start wasn't already future, and not marked current/present)
        elif not dr.get("is_current") and ey and (ey > current_year or (ey == current_year and em > today.month + 1)):
            flags.append({
                "check": "future_dates",
                "severity": "WARNING",
                "detail": (
                    f"Work experience '{title}' at {company or 'unspecified'} has a future end date "
                    f"({ey}-{em:02d}) without indicating current employment."
                ),
                "evidence": {"job_title": title, "period": item.get("period"), "end": f"{ey}-{em:02d}"},
            })

    # Check education for unrealistic future graduation dates (> 5 years out)
    for edu in education or []:
        edu_str = str(edu)
        years = [int(y) for y in re.findall(r"\b(?:19|20)\d{2}\b", edu_str)]
        for y in years:
            if y > current_year + 5:
                flags.append({
                    "check": "future_dates",
                    "severity": "WARNING",
                    "detail": (
                        f"Education entry lists an unrealistic future year ({y}): '{edu_str[:100]}'."
                    ),
                    "evidence": {"education_entry": edu_str, "future_year": y},
                })
    return flags


def _extract_graduation_year(education: List[str]) -> Optional[int]:
    """Finds the most plausible graduation year for tertiary education."""
    grad_year = None
    for edu in education or []:
        edu_str = str(edu)
        # Check if this looks like college/bachelor/master
        rank = refdata.education_rank(edu_str)
        if rank >= 3:  # College level or higher
            years = [int(y) for y in re.findall(r"\b(?:19|20)\d{2}\b", edu_str)]
            if years:
                # Use the latest year in the tertiary education entry as graduation year
                valid_years = [y for y in years if y <= date.today().year + 1]
                if valid_years:
                    candidate = max(valid_years)
                    if grad_year is None or candidate > grad_year:
                        grad_year = candidate
    return grad_year


def _check_experience_graduation_gap(profile: Dict, extraction: Dict) -> List[Dict]:
    """Check 3: Compares claimed years of experience with years since graduation."""
    flags = []
    years_exp = float(profile.get("estimated_years_experience") or extraction.get("estimated_years_experience") or 0.0)
    education = profile.get("education") or extraction.get("education") or []

    grad_year = _extract_graduation_year(education)
    if not grad_year:
        return flags

    current_year = date.today().year
    years_since_grad = max(0, current_year - grad_year)

    # If claimed experience exceeds years since graduation by > 4 years and claimed experience >= 4 years
    # (Allowing up to 4 years of working while in college or prior vocational work)
    excess = years_exp - years_since_grad
    if excess >= 5.0 and years_exp >= 5.0:
        flags.append({
            "check": "experience_graduation_gap",
            "severity": "WARNING",
            "detail": (
                f"Claimed experience ({years_exp} yrs) significantly exceeds years elapsed since "
                f"tertiary graduation ({years_since_grad} yrs since {grad_year}). May indicate inflated experience."
            ),
            "evidence": {
                "estimated_years_experience": years_exp,
                "graduation_year": grad_year,
                "years_since_graduation": years_since_grad,
                "unexplained_years": round(excess, 1),
            },
        })
    return flags


def _check_seniority_experience_mismatch(profile: Dict, extraction: Dict) -> List[Dict]:
    """Check 4: Detects executive or senior-level titles claimed with low total experience."""
    flags = []
    years_exp = float(profile.get("estimated_years_experience") or extraction.get("estimated_years_experience") or 0.0)

    # Collect all titles from profile job_roles, work_history, and raw extraction
    titles_to_check = set()
    for role in profile.get("job_roles", []):
        titles_to_check.add(str(role))
    for h in extraction.get("work_history", []):
        if h.get("job_title"):
            titles_to_check.add(str(h["job_title"]))
        if h.get("raw_line"):
            titles_to_check.add(str(h["raw_line"]))
    for t in extraction.get("job_titles_raw", []):
        titles_to_check.add(str(t))

    for title in titles_to_check:
        # Check executive titles: Director, GM, VP, Chief, Executive Chef
        for pat in _EXECUTIVE_TITLES:
            if pat.search(title):
                if years_exp < 2.5:
                    flags.append({
                        "check": "seniority_experience_mismatch",
                        "severity": "WARNING",
                        "detail": (
                            f"High-seniority title '{title}' listed with only {years_exp} year(s) of total "
                            f"estimated experience. Executive and director-level roles typically require 3+ years."
                        ),
                        "evidence": {"job_title": title, "total_experience_years": years_exp, "threshold": 2.5},
                    })
                    break

        # Check managerial titles: Operations Manager, Hotel Manager, Restaurant Manager
        for pat in _MANAGERIAL_TITLES:
            if pat.search(title):
                if years_exp < 1.0:
                    flags.append({
                        "check": "seniority_experience_mismatch",
                        "severity": "WARNING",
                        "detail": (
                            f"Managerial role '{title}' listed with under 1 year of total estimated "
                            f"experience ({years_exp} yrs). Management positions typically require prior experience."
                        ),
                        "evidence": {"job_title": title, "total_experience_years": years_exp, "threshold": 1.0},
                    })
                    break

    return flags


def _check_excessive_job_hopping(work_history: List[Dict]) -> List[Dict]:
    """Check 5: Flags unusually high job turnover (> 4 positions in < 2 years)."""
    flags = []
    full_time_entries = []

    for item in work_history:
        title = item.get("job_title") or ""
        if _is_part_time_role(title):
            continue
        dr = item.get("date_range") or parse_date_range(item.get("period"))
        if dr.get("start_year") and dr.get("end_year"):
            full_time_entries.append({
                "title": title,
                "start": (dr["start_year"], dr.get("start_month", 1) or 1),
                "end": (dr["end_year"], dr.get("end_month", 12) or 12),
            })

    if len(full_time_entries) >= 5:
        # Calculate total timespan across all entries
        all_starts = [e["start"][0] * 12 + e["start"][1] for e in full_time_entries]
        all_ends = [e["end"][0] * 12 + e["end"][1] for e in full_time_entries]
        earliest = min(all_starts)
        latest = max(all_ends)
        span_months = max(1, latest - earliest)

        if span_months <= 24:
            flags.append({
                "check": "excessive_job_hopping",
                "severity": "INFO",
                "detail": (
                    f"High job mobility: {len(full_time_entries)} positions listed within a "
                    f"{span_months}-month timeframe (average tenure ~{round(span_months / len(full_time_entries), 1)} months). "
                    f"Advisory for HR interviewer review."
                ),
                "evidence": {
                    "position_count": len(full_time_entries),
                    "span_months": span_months,
                    "avg_tenure_months": round(span_months / len(full_time_entries), 1),
                },
            })

    return flags


def _check_education_cert_prerequisites(profile: Dict, extraction: Dict) -> List[Dict]:
    """Check 6: Flags licensure certifications (PRC, CPA, RN) claimed without degree prerequisites."""
    flags = []
    certs = profile.get("certifications") or extraction.get("certifications_raw") or []
    education = profile.get("education") or extraction.get("education") or []

    # Highest education rank (Bachelor's rank = 4)
    highest_edu_rank = max(
        (refdata.education_rank(edu) for edu in education),
        default=0,
    )

    for cert in certs:
        cert_str = str(cert)
        for pattern, lic_name, required_rank in _DEGREE_REQUIRED_CERTS:
            if pattern.search(cert_str):
                if highest_edu_rank < required_rank:
                    edu_name = education[0] if education else "No tertiary education listed"
                    flags.append({
                        "check": "education_cert_prerequisites",
                        "severity": "WARNING",
                        "detail": (
                            f"Professional credential '{cert_str}' ({lic_name}) legally requires a Bachelor's "
                            f"degree prerequisite, but applicant's highest listed education is '{edu_name}'. "
                            f"Credential verification required."
                        ),
                        "evidence": {
                            "certification": cert_str,
                            "license_type": lic_name,
                            "required_rank": required_rank,
                            "applicant_rank": highest_edu_rank,
                            "applicant_education": edu_name,
                        },
                    })
                break

    return flags


def _check_chronological_coherence(work_history: List[Dict], education: List[str]) -> List[Dict]:
    """Check 7: Detects inverted dates, start after end, or work predating education by decades."""
    flags = []

    for item in work_history:
        dr = item.get("date_range") or parse_date_range(item.get("period"))
        sy, sm = dr.get("start_year"), dr.get("start_month", 1) or 1
        ey, em = dr.get("end_year"), dr.get("end_month", 12) or 12
        title = item.get("job_title") or "Position"

        if sy and ey and not dr.get("is_current"):
            if sy > ey or (sy == ey and sm > em):
                flags.append({
                    "check": "chronological_coherence",
                    "severity": "WARNING",
                    "detail": (
                        f"Inverted employment dates for '{title}': start date ({sy}-{sm:02d}) is after "
                        f"end date ({ey}-{em:02d})."
                    ),
                    "evidence": {"job_title": title, "start": f"{sy}-{sm:02d}", "end": f"{ey}-{em:02d}"},
                })

    # Cross check earliest work year vs graduation year
    grad_year = _extract_graduation_year(education)
    if grad_year:
        work_start_years = []
        for item in work_history:
            dr = item.get("date_range") or parse_date_range(item.get("period"))
            if dr.get("start_year"):
                work_start_years.append(dr["start_year"])

        if work_start_years:
            earliest_work = min(work_start_years)
            # If earliest work is > 15 years prior to college graduation, it's chronologically suspect
            if grad_year - earliest_work > 15:
                flags.append({
                    "check": "chronological_coherence",
                    "severity": "WARNING",
                    "detail": (
                        f"Earliest work experience begins in {earliest_work}, which is {grad_year - earliest_work} "
                        f"years before tertiary graduation in {grad_year}. An implausible timeline for standard careers."
                    ),
                    "evidence": {
                        "earliest_work_year": earliest_work,
                        "graduation_year": grad_year,
                        "gap_years": grad_year - earliest_work,
                    },
                })

    return flags


def verify_credentials(profile: Dict, extraction: Dict) -> Dict[str, Any]:
    """Main verification orchestrator running all 7 checks on extracted resume data.

    Returns:
        Dict with keys:
            flags: List of flag dicts
            warning_count: int
            info_count: int
            risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
            score_penalty: float (0.0 to 15.0)
            escalate_invalid: bool (True if warning_count >= 3)
            summary: str
            checks_performed: List[str]
    """
    work_history = extraction.get("work_history") or []
    education = profile.get("education") or extraction.get("education") or []

    # Ensure date_range is populated for all work history entries
    for h in work_history:
        if "date_range" not in h or not h["date_range"].get("start_year"):
            h["date_range"] = parse_date_range(h.get("period"))

    all_flags: List[Dict] = []
    all_flags.extend(_check_timeline_overlaps(work_history))
    all_flags.extend(_check_future_dates(work_history, education))
    all_flags.extend(_check_experience_graduation_gap(profile, extraction))
    all_flags.extend(_check_seniority_experience_mismatch(profile, extraction))
    all_flags.extend(_check_excessive_job_hopping(work_history))
    all_flags.extend(_check_education_cert_prerequisites(profile, extraction))
    all_flags.extend(_check_chronological_coherence(work_history, education))

    warning_count = sum(1 for f in all_flags if f.get("severity") == "WARNING")
    info_count = sum(1 for f in all_flags if f.get("severity") == "INFO")

    # Risk level classification
    if warning_count >= 3:
        risk_level = "HIGH"
    elif warning_count >= 1:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Score penalty: 5 points per warning, capped at 15
    penalty_per_warn = getattr(config, "CREDENTIAL_VERIFICATION_PENALTY_PER_WARNING", 5.0)
    max_penalty = getattr(config, "CREDENTIAL_VERIFICATION_MAX_PENALTY", 15.0)
    escalation_thresh = getattr(config, "CREDENTIAL_VERIFICATION_ESCALATION_THRESHOLD", 3)

    score_penalty = min(warning_count * penalty_per_warn, max_penalty)
    escalate_invalid = warning_count >= escalation_thresh

    # Build human-readable summary
    if warning_count == 0 and info_count == 0:
        summary = "All internal credential consistency checks passed. No timeline or credential anomalies detected."
    elif warning_count == 0:
        summary = f"Credential checks passed with {info_count} informational note(s)."
    else:
        summary = (
            f"Credential verification identified {warning_count} warning(s) and {info_count} informational note(s). "
            f"Risk Level: {risk_level}. {'Escalated for manual credential verification.' if escalate_invalid else 'Penalty applied to match score.'}"
        )

    return {
        "flags": all_flags,
        "warning_count": warning_count,
        "info_count": info_count,
        "risk_level": risk_level,
        "score_penalty": score_penalty,
        "escalate_invalid": escalate_invalid,
        "summary": summary,
        "checks_performed": [
            "timeline_overlap",
            "future_dates",
            "experience_graduation_gap",
            "seniority_experience_mismatch",
            "excessive_job_hopping",
            "education_cert_prerequisites",
            "chronological_coherence",
        ],
    }
