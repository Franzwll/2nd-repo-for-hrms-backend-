"""NLP screening service entry point.

Endpoints:
    GET  /health                  -> liveness + model info
    POST /extract-resume          -> multipart file; text extraction + profile + validation
    POST /ner/extract-entities    -> JSON {text}; raw entity extraction
    POST /screening/score         -> multipart file + requirements/open_jobs/reference_data form fields;
                                     full pipeline incl. match score and classification
    POST /screening/analyze-text  -> JSON {text, requirements?, open_jobs?, reference_data?};
                                     same pipeline on raw text
"""
import json
import logging
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app import config
from app.services import entity_extraction, pipeline

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
    extractor_loaded = entity_extraction._extractor is not None
    custom = bool(entity_extraction._extractor.model_info.get("custom_ner_loaded")) if extractor_loaded else False
    return {
        "status": "ok",
        "base_model": config.BASE_SPACY_MODEL,
        "custom_ner_loaded": custom,
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
):
    """Contract kept compatible with Laravel App\\Services\\NlpService::screenResume().

    `reference_data` optionally carries DB-managed mappings
    ({skills|job_roles|certifications: {canonical: [aliases]}}) sourced from the
    Laravel database; when absent the bundled seed reference data is used."""
    requirements_payload = _parse_json_field(requirements, {})
    open_jobs_payload = _parse_json_field(open_jobs, [])
    reference_payload = _parse_json_field(reference_data, None)

    suffix = Path(file.filename or "").suffix or ".tmp"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)
    try:
        result = _safe(lambda: pipeline.analyze_resume_file(
            tmp_path, file.filename or "", requirements_payload, open_jobs_payload, reference_payload
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


@app.post("/screening/analyze-text")
def analyze_text(request: AnalyzeTextRequest):
    result = _safe(lambda: pipeline.analyze_resume_text(
        request.text, request.requirements, request.open_jobs, request.reference_data
    ))
    if result.get("success"):
        result["processing_status"] = config.STATUS_PROCESSED if (
            not result["validation"]["missing_information"]
            and not result["validation"]["invalid_format"]
        ) else config.STATUS_PARTIALLY_PROCESSED
    return result
