"""Screening classification into the four official statuses.

Documented decision logic (order matters):

1. Any credential issue per validation rules (missing required certification,
   malformed email/phone, unparseable credential)  -> INVALID_CREDENTIAL.
2. Mandatory requirements met AND overall score >= PERFECT_SCORE_THRESHOLD
   -> PERFECT_FOR_THE_JOB.
3. Otherwise every other open job is scored the same way; if the best
   alternative satisfies its mandatory requirements, reaches
   ALT_JOB_SCORE_THRESHOLD and outscores the applied job
   -> FIT_FOR_OTHER_JOB with a recommendation payload.
4. Otherwise -> NOT_FITTED_TO_JOB.

Unrecognized skills/roles NEVER trigger rejection by themselves; they are only
flagged for review.
"""
from typing import Dict, List, Optional

from app import config
from app.services import matching


def _credential_blockers(validation: Dict) -> List[Dict]:
    return [i for i in validation.get("credential_issues", []) if i.get("type") in {
        "INVALID_FORMAT",
        "UNVERIFIABLE_REQUIRED_CREDENTIAL",
    }]


def _thresholds(settings: Dict | None) -> Dict[str, float]:
    """Per-request classification thresholds, clamped to sane bounds.

    `settings` optionally carries the HR-configurable values from the
    Screening Setup dialog: passing_score (0-100) and
    required_skills_coverage_min (0-1). Missing/invalid values fall back
    to the documented defaults in app.config.
    """
    if not settings:
        return {
            "perfect": config.PERFECT_SCORE_THRESHOLD,
            "alternative": config.ALT_JOB_SCORE_THRESHOLD,
            "coverage_min": config.REQUIRED_SKILLS_COVERAGE_MIN,
        }

    def _clamp(raw, default, low, high):
        try:
            value = float(raw)
        except (TypeError, ValueError):
            return default
        return min(max(value, low), high)

    passing = _clamp(settings.get("passing_score"), config.PERFECT_SCORE_THRESHOLD, 0.0, 100.0)
    coverage = _clamp(
        settings.get("required_skills_coverage_min"),
        config.REQUIRED_SKILLS_COVERAGE_MIN,
        0.0,
        1.0,
    )
    return {
        "perfect": passing,
        "alternative": config.ALT_JOB_SCORE_THRESHOLD,
        "coverage_min": coverage,
    }


def classify_applied_job(
    profile: Dict,
    validation: Dict,
    requirements: Dict,
    weights: Optional[Dict] = None,
    thresholds: Optional[Dict[str, float]] = None,
) -> Dict:
    match = matching.match_profile_to_requirements(profile, validation, requirements, weights)
    blockers = _credential_blockers(validation)
    reasons: List[str] = []
    threshold = (thresholds or {}).get("perfect", config.PERFECT_SCORE_THRESHOLD)
    coverage_min = (thresholds or {}).get("coverage_min", config.REQUIRED_SKILLS_COVERAGE_MIN)

    result = {
        "screening_status": None,
        "match_score": match["match_score"],
        "score_breakdown": match["score_breakdown"],
        "mandatory_requirements_met": match["mandatory_requirements_met"],
        "mandatory_detail": match["mandatory_detail"],
        "missing_requirements": match["missing_requirements"],
        "reasons": reasons,
        "alternative_job": None,
        "matched_summary": matching.summarize_match(match, requirements),
    }

    if blockers:
        result["screening_status"] = config.CLASS_INVALID_CREDENTIAL
        for blocker in blockers:
            reasons.append(f"{blocker['type']}: {blocker['detail']} ({blocker['note']})")
        reasons.append(
            "Classification INVALID_CREDENTIAL means 'invalid or requires verification "
            "based on system validation rules'; it does not imply fraud."
        )
        return result

    if match["mandatory_requirements_met"] and match["match_score"] >= threshold:
        result["screening_status"] = config.CLASS_PERFECT
        reasons.append(
            f"Overall match score {match['match_score']}% reached the required threshold of "
            f"{threshold}% for {requirements['title']}."
        )
        if match["score_breakdown"]["skills"]["matched_required"]:
            reasons.append(
                "Matched required skills: "
                + ", ".join(match["score_breakdown"]["skills"]["matched_required"])
                + "."
            )
        detail = match["mandatory_detail"]
        reasons.append(
            f"Education requirement met: {detail['education_requirement_met']}; "
            f"experience requirement met: {detail['experience_requirement_met']} "
            f"({profile.get('estimated_years_experience', 0)} yrs vs "
            f"{requirements['min_years_experience']} yrs minimum)."
        )
        return result

    # Not strong enough for the applied job — build explanation for fallback paths.
    if not match["mandatory_detail"]["education_requirement_met"]:
        reasons.append("Education does not meet the requirement of the applied job.")
    if not match["mandatory_detail"]["experience_requirement_met"]:
        reasons.append(
            f"Estimated experience {profile.get('estimated_years_experience', 0)} yrs is below the "
            f"{requirements['min_years_experience']} yrs minimum."
        )
    if match["mandatory_detail"]["required_skills_coverage"] < coverage_min:
        missing = match["missing_requirements"]["skills"]
        reasons.append(
            f"Required-skills coverage {round(match['mandatory_detail']['required_skills_coverage'] * 100)}% is below "
            f"the {round(coverage_min * 100)}% minimum. Missing: {', '.join(missing) or 'none'}."
        )
    if match["missing_requirements"]["information"]:
        reasons.append(
            "Essential information missing: " + ", ".join(match["missing_requirements"]["information"]) + "."
        )
    if match["match_score"] < threshold:
        reasons.append(
            f"Overall score {match['match_score']}% is below the {threshold}% threshold."
        )
        weakest_name, weakest = min(
            match["score_breakdown"].items(),
            key=lambda item: (item[1]["earned"] / item[1]["max"]) if item[1]["max"] else 1.0,
        )
        reasons.append(
            f"Lowest-scoring component: {weakest_name} "
            f"({weakest['earned']}/{weakest['max']} pts)."
        )
    return result


def evaluate_alternative_jobs(
    profile: Dict,
    validation: Dict,
    open_jobs: List[Dict],
    weights: Optional[Dict] = None,
    thresholds: Optional[Dict[str, float]] = None,
) -> List[Dict]:
    evaluated = []
    alt_threshold = (thresholds or {}).get("alternative", config.ALT_JOB_SCORE_THRESHOLD)
    for job in open_jobs:
        requirements = matching.parse_requirements(job)
        # Defensive guard: a job with no criteria at all would trivially score
        # 100% and pollute alternative-job recommendations.
        if not (
            requirements["required_skills"]
            or requirements["required_certifications"]
            or requirements.get("education_level")
            or requirements.get("experience_level")
        ):
            continue
        match = matching.match_profile_to_requirements(profile, validation, requirements, weights)
        eligible = (
            match["mandatory_requirements_met"]
            and match["match_score"] >= alt_threshold
        )
        evaluated.append({
            "job_post_id": requirements["job_post_id"],
            "title": requirements["title"],
            "match_score": match["match_score"],
            "eligible": eligible,
            "mandatory_requirements_met": match["mandatory_requirements_met"],
            "matched_skills": match["score_breakdown"]["skills"]["matched_required"],
            "summary": matching.summarize_match(match, requirements),
            "_requirements": requirements,
        })
    evaluated.sort(key=lambda x: x["match_score"], reverse=True)
    return evaluated


def full_classification(
    profile: Dict,
    validation: Dict,
    requirements: Dict,
    open_jobs: List[Dict] | None = None,
    settings: Dict | None = None,
) -> Dict:
    thresholds = _thresholds(settings)
    applied = classify_applied_job(
        profile, validation, requirements,
        weights=(settings or {}).get("weights"),
        thresholds=thresholds,
    )

    if applied["screening_status"] is not None:
        return applied

    open_jobs = open_jobs or []
    alternatives = [
        alt for alt in evaluate_alternative_jobs(
            profile, validation, open_jobs,
            weights=(settings or {}).get("weights"),
            thresholds=thresholds,
        )
        if requirements.get("job_post_id") is None or alt["job_post_id"] != requirements.get("job_post_id")
    ]

    best = next((alt for alt in alternatives if alt["eligible"]), None)
    if best and best["match_score"] > applied["match_score"]:
        applied["screening_status"] = config.CLASS_FIT_OTHER
        applied["alternative_job"] = {
            "job_post_id": best["job_post_id"],
            "title": best["title"],
            "alternative_match_score": best["match_score"],
            "applied_job_score": applied["match_score"],
            "matched_skills": best["matched_skills"],
            "reason": (
                f"The applicant did not sufficiently match {requirements['title']} "
                f"({applied['match_score']}%) but strongly matches {best['title']} "
                f"({best['match_score']}%): {best['summary']}"
            ),
        }
        applied["reasons"].append(
            f"Applied-job requirements were not fully satisfied, so other open positions were analysed."
        )
        applied["reasons"].append(
            f"Best alternative '{best['title']}' scored {best['match_score']}% and satisfied that role's mandatory requirements."
        )
        return applied

    if alternatives:
        top = alternatives[0]
        applied["reasons"].append(
            f"Alternative job analysis: highest-scoring open position '{top['title']}' reached only "
            f"{top['match_score']}%, below the {thresholds.get('alternative', config.ALT_JOB_SCORE_THRESHOLD)}% recommendation threshold."
        )
    elif open_jobs:
        applied["reasons"].append("Alternative job analysis found no eligible open positions.")
    else:
        applied["reasons"].append("No other open positions were supplied for alternative analysis.")

    applied["screening_status"] = config.CLASS_NOT_FITTED
    return applied
