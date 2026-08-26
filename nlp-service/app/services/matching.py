"""Role-specific requirement matching and transparent match score computation.

Documented formula (weights configurable in app.config, sum = 1.00):

    Overall Match Score =
        Skills Score          * 0.40
      + Experience Score      * 0.30
      + Education Score       * 0.20
      + Certifications Score  * 0.10

Each component is normalised to its weight (i.e. expressed out of the weight's
share of 100). Mandatory requirements (education level, minimum experience,
required-skills coverage) gate the PERFECT_FOR_THE_JOB classification and can
override a passing numerical score.

Skill matching is alias-aware first (reference canonicalization) and then
fuzzy-aware (difflib ratio >= 0.90) so OCR noise or near-variants such as
"Customer Servic" still earn credit; every fuzzy credit is reported in the
breakdown via matched_fuzzy for transparency.
"""
import difflib
import re
from typing import Dict, List, Optional, Tuple

from app import config
from app.services import reference_data as refdata

_FUZZY_SKILL_RATIO = 0.88


def fuzzy_match_skill(required: str, recognized_skills: set) -> Optional[str]:
    """Finds a recognized skill that is a near-match for `required`.

    Catches canonical-name drift between the job requirements and the skills
    reference (e.g. required 'POS System Operation' vs recognized 'POS
    Systems'). Exact matches are handled before this runs.
    """
    req_low = re.sub(r"\s+", " ", required.lower().strip())
    req_tokens = set(req_low.split())
    best: Optional[str] = None
    best_ratio = 0.0
    for skill in recognized_skills:
        low = re.sub(r"\s+", " ", skill.lower().strip())
        if low == req_low:
            continue
        skill_tokens = set(low.split())
        if len(req_tokens) >= 2 and (req_tokens.issubset(skill_tokens) or skill_tokens.issubset(req_tokens)):
            return skill
        ratio = difflib.SequenceMatcher(None, req_low, low).ratio()
        if ratio >= _FUZZY_SKILL_RATIO and ratio > best_ratio:
            best = skill
            best_ratio = ratio
    return best


def parse_min_years(experience_level: Optional[str]) -> float:
    """Converts values like 'No Experience', '1-2 Years', '3-5 Years', '5+ Years' to min years."""
    if not experience_level:
        return 0.0
    normalized = experience_level.lower()
    if "no experience" in normalized or "none" in normalized:
        return 0.0
    numbers = [float(n) for n in re.findall(r"\d+(?:\.\d+)?", normalized)]
    if not numbers:
        return 0.0
    return min(numbers)


def parse_requirements(
    requirements: Dict,
    references: Optional[Tuple[Dict[str, List[str]], Dict[str, List[str]], Dict[str, List[str]]]] = None,
) -> Dict:
    """Normalises the requirements payload sent by Laravel.

    `references` optionally carries DB-managed (skills, job_roles, certifications)
    mappings; when omitted the bundled seed reference data is used.
    """
    skills_ref, _roles_ref, certs_ref = references or (
        refdata.skills_reference(),
        refdata.job_roles_reference(),
        refdata.certifications_reference(),
    )

    def canon_list(items: List[str], reference: Dict[str, List[str]]) -> List[str]:
        out = []
        for item in items or []:
            canonical = refdata.canonicalize(str(item), reference)
            if canonical and canonical not in out:
                out.append(canonical)
        return out

    required_skills = canon_list(requirements.get("required_skills"), skills_ref)
    preferred_skills = [
        s for s in canon_list(requirements.get("preferred_skills"), skills_ref)
        if s not in required_skills
    ]
    required_certs = []
    for cert in requirements.get("required_certifications") or []:
        canonical = refdata.canonicalize(str(cert), certs_ref) or str(cert)
        if canonical not in required_certs:
            required_certs.append(canonical)

    return {
        "job_post_id": requirements.get("job_post_id"),
        "title": requirements.get("title") or "Unspecified Position",
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "education_level": requirements.get("education_level"),
        "experience_level": requirements.get("experience_level"),
        "min_years_experience": parse_min_years(requirements.get("experience_level")),
        "required_certifications": required_certs,
        "required_information": [
            r.lower() for r in (requirements.get("required_information") or config.DEFAULT_REQUIRED_INFORMATION)
        ],
    }


def match_profile_to_requirements(profile: Dict, validation: Dict, requirements: Dict) -> Dict:
    """Component-by-component matching with full explanation data."""
    recognized_skills = set(validation["skill_analysis"]["recognized"])
    required_skills = set(requirements["required_skills"])
    preferred_skills = set(requirements["preferred_skills"])

    matched_required = sorted(required_skills & recognized_skills)
    fuzzy_required: Dict[str, str] = {}
    for req in sorted(set(required_skills) - recognized_skills):
        near = fuzzy_match_skill(req, recognized_skills)
        if near:
            fuzzy_required[req] = near
    missing_required = sorted(set(required_skills) - recognized_skills - set(fuzzy_required))
    matched_preferred = sorted(preferred_skills & recognized_skills)
    missing_preferred = sorted(set(preferred_skills) - recognized_skills)

    required_coverage = (
        (len(matched_required) + len(fuzzy_required)) / len(required_skills)
        if required_skills else 1.0
    )
    preferred_coverage = len(matched_preferred) / len(preferred_skills) if preferred_skills else 1.0
    skills_ratio = 0.7 * required_coverage + 0.3 * preferred_coverage

    applicant_rank = max(
        (refdata.education_rank(level) for level in profile.get("education", [])),
        default=0,
    )
    required_rank = refdata.education_rank(requirements.get("education_level") or "")
    education_met = applicant_rank >= required_rank if required_rank > 0 else True
    education_gap = max(0, required_rank - applicant_rank)

    years = float(profile.get("estimated_years_experience") or 0)
    min_years = requirements["min_years_experience"]
    experience_met = years >= min_years
    experience_ratio = 1.0 if min_years <= 0 else min(1.0, years / min_years)

    certs_matched = []
    for row in validation.get("credential_analysis", []):
        if row.get("status") == "RECOGNIZED" and row.get("required"):
            certs_matched.append(row["required"])
    cert_ratio = (
        len(certs_matched) / len(requirements["required_certifications"])
        if requirements["required_certifications"] else None
    )

    weights = config.SCORE_WEIGHTS
    breakdown = {
        "skills": {
            "weight": weights["skills"],
            "earned": round(weights["skills"] * 100 * skills_ratio, 2),
            "max": round(weights["skills"] * 100, 2),
            "matched_required": matched_required,
            "fuzzy_matched_required": fuzzy_required,
            "missing_required": missing_required,
            "matched_preferred": matched_preferred,
            "missing_preferred": missing_preferred,
            "required_coverage": round(required_coverage, 4),
            "preferred_coverage": round(preferred_coverage, 4),
        },
        "experience": {
            "weight": weights["experience"],
            "earned": round(weights["experience"] * 100 * experience_ratio, 2),
            "max": round(weights["experience"] * 100, 2),
            "estimated_years": years,
            "min_years_required": min_years,
            "requirement_met": experience_met,
        },
        "education": {
            "weight": weights["education"],
            "earned": round(weights["education"] * 100 * _edu_ratio(education_gap), 2),
            "max": round(weights["education"] * 100, 2),
            "applicant_highest_level": profile.get("education", [])[:3],
            "required_level": requirements.get("education_level"),
            "requirement_met": education_met,
        },
        "certifications": {
            "weight": weights["certifications"],
            "earned": round(weights["certifications"] * 100 * (cert_ratio if cert_ratio is not None else 1.0), 2),
            "max": round(weights["certifications"] * 100, 2),
            "matched": certs_matched,
            "missing": [r for r in requirements["required_certifications"] if r not in certs_matched],
            "no_requirements": cert_ratio is None,
        },
    }

    overall = round(sum(component["earned"] for component in breakdown.values()), 2)

    completeness_ok = len(validation["missing_information"]) == 0
    mandatory_ok = (
        education_met
        and experience_met
        and required_coverage >= config.REQUIRED_SKILLS_COVERAGE_MIN
        and completeness_ok
    )

    return {
        "match_score": overall,
        "score_breakdown": breakdown,
        "mandatory_requirements_met": mandatory_ok,
        "mandatory_detail": {
            "education_requirement_met": education_met,
            "experience_requirement_met": experience_met,
            "required_skills_coverage": round(required_coverage, 4),
            "required_skills_coverage_min": config.REQUIRED_SKILLS_COVERAGE_MIN,
            "essential_information_complete": completeness_ok,
        },
        "missing_requirements": {
            "skills": missing_required,
            "certifications": breakdown["certifications"]["missing"],
            "information": validation["missing_information"],
            "education_below_requirement": not education_met,
            "experience_below_minimum": not experience_met,
        },
    }


def _edu_ratio(gap: int) -> float:
    if gap <= 0:
        return 1.0
    if gap == 1:
        return 0.5
    return 0.25 * max(0, 3 - gap)


def summarize_match(match: Dict, requirements: Dict) -> str:
    b = match["score_breakdown"]
    parts = []
    matched = b["skills"]["matched_required"]
    if matched:
        parts.append(f"Matched skills: {', '.join(matched[:6])}")
    if b["education"]["requirement_met"]:
        parts.append("Education requirement satisfied")
    if b["experience"]["requirement_met"]:
        parts.append(
            f"Experience requirement satisfied ({b['experience']['estimated_years']} yrs vs "
            f"{b['experience']['min_years_required']} yrs required)"
        )
    if b["certifications"]["no_requirements"]:
        parts.append("No certification requirements defined for this role")
    elif not b["certifications"]["missing"]:
        parts.append("All required certifications matched")
    if not parts:
        return ""
    return "; ".join(parts) + f" — meets {requirements['title']} requirements."
