"""NLP screening service entry point.

Endpoints:
    GET  /health                  -> liveness + model info
    POST /extract-resume          -> multipart file; text extraction + profile + validation
    POST /ner/extract-entities    -> JSON {text}; raw entity extraction
    POST /screening/score         -> multipart file + requirements/open_jobs/reference_data form fields;
                                     full pipeline incl. match score and classification
    POST /screening/analyze-text  -> JSON {text, requirements?, open_jobs?, reference_data?};
                                     same pipeline on raw text
    POST /screening/reclassify    -> JSON {profile, validation, requirements?, open_jobs?,
                                     document_verifications?, screening_settings?}; replays the
                                     classification stage on STORED screening data (no re-OCR)
                                     so document verification can refresh the ranking score
    POST /verification/supporting-document -> multipart file + doc_type + resume_profile
                                     (+ optional reference_data); compares a supporting
                                     document (COE / Certificate / Credential) against the
                                     applicant's resume profile claims
"""
import json
import logging
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app import config
from app.services import document_verification, entity_extraction, matching, pipeline, preprocessing, screening
from app.services import reference_data
from app.services.text_extraction import ExtractionError, extract_text

logger = logging.getLogger("nlp-service")

app = FastAPI(
    title="HRMS NLP Screening Service",
    description="spaCy-based resume processing, NER extraction and role-specific applicant screening.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def load_models() -> None:
    try:
        info = entity_extraction.get_extractor().model_info
        logger.info("Models loaded: %s", info)
    except Exception as exc:
        logger.error("Model loading failed at startup: %s", exc)


@app.get("/health")
def health():
    # get_extractor() lazily loads the models, so health also warms them.
    info = entity_extraction.get_extractor().model_info
    return {
        "status": "ok",
        "base_model": info.get("base_model"),
        "custom_ner_loaded": bool(info.get("custom_ner_loaded")),
        "model_info": info,
        "weights": config.SCORE_WEIGHTS,
        "thresholds": {
            "perfect": config.PERFECT_SCORE_THRESHOLD,
            "alternative_job": config.ALT_JOB_SCORE_THRESHOLD,
            "required_skills_coverage_min": config.REQUIRED_SKILLS_COVERAGE_MIN,
        },
    }


@app.post("/extract-resume")
async def extract_resume(file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix or ".tmp"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)
    try:
        result = _safe(lambda: pipeline.analyze_resume_file(tmp_path, file.filename or "", None, None))
        if not result.get("success"):
            raise HTTPException(status_code=422, detail=result)
        return result
    finally:
        tmp_path.unlink(missing_ok=True)


def _safe(fn):
    """Converts unexpected internal errors into structured failure dicts so
    clients never receive a bare 500 and no failure is silent."""
    try:
        return fn()
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001 - deliberate catch-all boundary
        logger.exception("Unhandled screening error")
        return {
            "success": False,
            "processing_status": config.STATUS_FAILED,
            "error": f"Internal processing error: {exc}",
            "file": {},
        }


class NerRequest(BaseModel):
    text: str


@app.post("/ner/extract-entities")
def ner_extract(request: NerRequest):
    from app.services import preprocessing

    extractor = entity_extraction.get_extractor()
    cleaned = preprocessing.preprocess(request.text)
    result = extractor.extract(cleaned["cleaned_text"])
    return {
        "success": True,
        "entities": result["entities"],
        "sections_detected": result["sections_detected"],
        "estimated_years_experience": result["estimated_years_experience"],
        "work_history": result["work_history"],
        "model_info": extractor.model_info,
    }


def _parse_json_field(raw: str | None, fallback):
    if not raw:
        return fallback
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, (dict, list)) else fallback
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="requirements/open_jobs/reference_data must be valid JSON strings.")


@app.post("/screening/score")
async def screening_score(
    file: UploadFile = File(...),
    requirements: str | None = Form(default=None),
    open_jobs: str | None = Form(default=None),
    reference_data: str | None = Form(default=None),
    screening_settings: str | None = Form(default=None),
    document_verifications: str | None = Form(default=None),
):
    """Contract kept compatible with Laravel App\\Services\\NlpService::screenResume().

    `reference_data` optionally carries DB-managed mappings
    ({skills|job_roles|certifications: {canonical: [aliases]}}) sourced from the
    Laravel database; when absent the bundled seed reference data is used.

    `screening_settings` optionally carries the HR-configurable scoring
    configuration from the Screening Setup dialog:
    {weights: {skills, experience, education, certifications},
     passing_score: 0-100, required_skills_coverage_min: 0-1}.
    When absent the documented defaults in app.config apply.

    `document_verifications` optionally carries the applicant's already-verified
    supporting documents (COE / Certificate / Credential) as a JSON array:
    [{applicant_document_id, doc_type, verification_status, verification_result}].
    They are blended into the ranking score (see verification_scoring.py)."""
    requirements_payload = _parse_json_field(requirements, {})
    open_jobs_payload = _parse_json_field(open_jobs, [])
    reference_payload = _parse_json_field(reference_data, None)
    settings_payload = _parse_json_field(screening_settings, None)
    documents_payload = _parse_json_field(document_verifications, [])

    suffix = Path(file.filename or "").suffix or ".tmp"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)
    try:
        result = _safe(lambda: pipeline.analyze_resume_file(
            tmp_path, file.filename or "", requirements_payload, open_jobs_payload,
            reference_payload, settings_payload, documents_payload
        ))
    finally:
        tmp_path.unlink(missing_ok=True)

    if not result.get("success"):
        raise HTTPException(status_code=422, detail=result)
    return result


class AnalyzeTextRequest(BaseModel):
    text: str
    requirements: dict | None = None
    open_jobs: list | None = None
    reference_data: dict | None = None
    document_verifications: list | None = None


@app.post("/screening/analyze-text")
def analyze_text(request: AnalyzeTextRequest):
    result = _safe(lambda: pipeline.analyze_resume_text(
        request.text, request.requirements, request.open_jobs, request.reference_data,
        document_verifications=request.document_verifications,
    ))
    if result.get("success"):
        verification = result.get("validation", {}).get("credential_verification", {})
        has_warn = verification.get("warning_count", 0) > 0
        result["processing_status"] = config.STATUS_PROCESSED if (
            not result["validation"]["missing_information"]
            and not result["validation"]["invalid_format"]
            and not has_warn
        ) else config.STATUS_PARTIALLY_PROCESSED
    return result


class ReclassifyRequest(BaseModel):
    profile: dict
    validation: dict
    requirements: dict | None = None
    open_jobs: list | None = None
    document_verifications: list | None = None
    screening_settings: dict | None = None
    reference_data: dict | None = None


@app.post("/screening/reclassify")
def screening_reclassify(request: ReclassifyRequest):
    """Re-runs ONLY the classification stage on already-stored screening data.

    Laravel calls this after a supporting document is uploaded, re-verified or
    removed, so the applicant's ranking percentage, rank order and official
    status reflect the new document evidence WITHOUT re-uploading or re-OCR-ing
    the resume: the persisted profile (applicant_screenings.profile_json) and
    validation (validation_json) are replayed through the same classifier used
    by /screening/score. Returns the classification subset only.
    """
    # Job requirements arrive in the same raw shape the pipeline receives, so
    # they are normalised here exactly like analyze_resume_text() does before
    # classifying (min_years_experience, canonical skills, ...).
    references = reference_data.effective_references(request.reference_data)
    parsed_requirements = matching.parse_requirements(request.requirements or {}, references)

    result = _safe(lambda: screening.full_classification(
        request.profile or {},
        request.validation or {},
        parsed_requirements,
        request.open_jobs or [],
        request.screening_settings,
        request.document_verifications,
    ))

    if not result.get("screening_status"):
        raise HTTPException(status_code=422, detail=result)

    return {
        "success": True,
        "match_score": result["match_score"],
        "resume_match_score": result.get("resume_match_score", result["match_score"]),
        "document_verification": result.get("document_verification"),
        "score_breakdown": result["score_breakdown"],
        "screening_status": result["screening_status"],
        "screening_reasons": result["reasons"],
        "matched_summary": result.get("matched_summary"),
        "alternative_job": result.get("alternative_job"),
        "mandatory_requirements_met": result["mandatory_requirements_met"],
        "mandatory_detail": result.get("mandatory_detail"),
        "missing_requirements": result.get("missing_requirements"),
    }


@app.post("/verification/supporting-document")
async def verification_supporting_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    resume_profile: str = Form(default="{}"),
    reference_data: str | None = Form(default=None),
):
    """Contract kept compatible with Laravel App\\Services\\NlpService::verifySupportingDocument().

    Compares a supporting document (COE / Certificate / Credential) against the
    applicant's resume profile claims. Reuses the same text extraction,
    preprocessing and NER extraction used by resume screening; the screening
    pipeline itself is untouched. Unreadable/failed documents are reported as
    verification_status UNABLE_TO_VERIFY instead of an HTTP error so the
    Laravel side can always persist a state.
    """
    profile_payload = _parse_json_field(resume_profile, {})
    reference_payload = _parse_json_field(reference_data, None)

    suffix = Path(file.filename or "").suffix or ".tmp"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)
    try:
        try:
            extracted_meta = extract_text(tmp_path, file.filename or "")
        except ExtractionError as exc:
            logger.warning("Supporting document extraction failed: %s", exc)
            return {
                "success": True,
                "document_type": (doc_type or "").strip(),
                "verification_status": "UNABLE_TO_VERIFY",
                "checks": {},
                "summary": f"The document could not be read: {exc}",
                "error": str(exc),
                "extracted_document_profile": {},
            }

        cleaned = preprocessing.preprocess(extracted_meta["text"])
        try:
            result = document_verification.verify_supporting_document(
                cleaned["cleaned_text"], doc_type, profile_payload, reference_payload
            )
        except Exception as exc:  # noqa: BLE001 - deliberate catch-all boundary
            logger.exception("Supporting-document verification error")
            result = {
                "success": False,
                "document_type": (doc_type or "").strip(),
                "verification_status": "UNABLE_TO_VERIFY",
                "checks": {},
                "summary": f"Verification failed: {exc}",
                "error": str(exc),
                "extracted_document_profile": {},
            }

        result["text_extraction"] = {
            "method": extracted_meta.get("method"),
            "pages": extracted_meta.get("pages"),
            "extension": extracted_meta.get("extension"),
            "character_count": len(extracted_meta.get("text") or ""),
        }
        return result
    finally:
        tmp_path.unlink(missing_ok=True)
