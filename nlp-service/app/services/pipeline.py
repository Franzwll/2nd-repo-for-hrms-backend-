"""End-to-end screening pipeline orchestration shared by file and text endpoints."""
import time
from typing import Dict, List, Optional

from app import config
from app.services import entity_extraction, matching, preprocessing, profile_builder, screening, reference_data
from app.services.text_extraction import ExtractionError, extract_text


def analyze_resume_text(
    raw_text: str,
    requirements: Optional[Dict],
    open_jobs: Optional[List[Dict]],
    reference_override: Optional[Dict[str, Dict[str, List[str]]]] = None,
) -> Dict:
    started = time.perf_counter()
    extractor = entity_extraction.get_extractor()
    cleaned = preprocessing.preprocess(raw_text)
    text = cleaned["cleaned_text"]

    references = reference_data.effective_references(reference_override)
    extraction = extractor.extract(text, reference_override)
    profile = profile_builder.build_profile(extraction, references)
    parsed_requirements = matching.parse_requirements(requirements or {}, references)

    validation = profile_builder.validate(
        profile,
        parsed_requirements["required_information"],
        malformed_emails=extraction.get("emails_malformed", []),
    )
    validation = profile_builder.analyze_with_certifications(
        profile,
        validation,
        parsed_requirements["required_certifications"],
        references[2],
    )

    classification = screening.full_classification(profile, validation, parsed_requirements, open_jobs)

    return {
        "success": True,
        "profile": profile,
        "entities": extraction["entities"],
        "sections_detected": extraction["sections_detected"],
        "estimated_years_experience": extraction.get("estimated_years_experience"),
        "validation": {
            "missing_information": validation["missing_information"],
            "invalid_format": validation["invalid_format"],
            "skill_analysis": validation["skill_analysis"],
            "job_role_analysis": validation["job_role_analysis"],
            "credential_analysis": validation.get("credential_analysis", []),
            "credential_issues": validation["credential_issues"],
            "review_flags": validation.get("review_flags", []),
        },
        "requirements_applied": {
            key: value for key, value in parsed_requirements.items()
        },
        "match_score": classification["match_score"],
        "score_breakdown": classification["score_breakdown"],
        "screening_status": classification["screening_status"],
        "screening_reasons": classification["reasons"],
        "matched_summary": classification.get("matched_summary"),
        "alternative_job": classification.get("alternative_job"),
        "mandatory_requirements_met": classification["mandatory_requirements_met"],
        "model_info": extractor.model_info,
        "_timing_seconds": round(time.perf_counter() - started, 4),
    }


def analyze_resume_file(
    path,
    filename: str,
    requirements: Optional[Dict],
    open_jobs: Optional[List[Dict]],
    reference_override: Optional[Dict[str, Dict[str, List[str]]]] = None,
) -> Dict:
    try:
        extraction_meta = extract_text(path, filename)
    except ExtractionError as exc:
        return {
            "success": False,
            "processing_status": exc.status,
            "error": str(exc),
            "file": {"name": filename},
        }

    result = analyze_resume_text(extraction_meta["text"], requirements, open_jobs, reference_override)

    warnings = list(extraction_meta.get("warnings") or [])
    unrecognized = result["validation"]["skill_analysis"]["unrecognized"] + \
        result["validation"]["job_role_analysis"]["unrecognized"]
    missing = result["validation"]["missing_information"]
    invalid = result["validation"]["invalid_format"]

    if not missing and not invalid and not unrecognized and not warnings:
        processing_status = config.STATUS_PROCESSED
    else:
        processing_status = config.STATUS_PARTIALLY_PROCESSED

    result.update({
        "processing_status": processing_status,
        "text_extraction": {
            "method": extraction_meta["method"],
            "pages": extraction_meta.get("pages"),
            "extension": extraction_meta.get("extension"),
            "original_length": None,
            "character_count": len(extraction_meta["text"]),
            "warnings": warnings,
        },
        "parsed_successfully": True,
    })
    return result
