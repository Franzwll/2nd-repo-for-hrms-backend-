"""NLP screening service entry point.

Endpoints:
    GET  /health                  -> liveness + model info
    POST /extract-resume          -> multipart file; text extraction + profile + validation
    POST /extract-document        -> multipart file; generic handbook/learning-material text
                                     extraction (PDF/DOCX/TXT/image OCR) returning raw text
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
from app.services import doc_classifier, reference_data, section_detection
from app.services.text_extraction import ExtractionError, extract_text

logger = logging.getLogger("nlp-service")

# Bump this whenever the classifier/extractor changes so the test page can
# prove which engine version actually answered (stale-process diagnosis).
CLASSIFIER_VERSION = "v9-fast-classify+ocr-warmup"

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
    _warm_extraction()


def _warm_extraction() -> None:
    """Pays first-upload costs at boot: parser imports + one tiny OCR run.

    Tesseract's first invocation per process is several seconds slower than
    the rest, and pdfplumber/pypdfium2/python-docx are imported lazily. Both
    are warmed defensively so a missing dependency can never block startup.
    """
    for module in ("pdfplumber", "pypdfium2", "docx"):
        try:
            __import__(module)
        except Exception:
            pass
    try:
        from PIL import Image

        from app.services import text_extraction

        if not text_extraction._locate_tesseract():
            logger.info("OCR warm-up skipped: Tesseract not installed.")
            return
        import pytesseract

        pytesseract.image_to_string(Image.new("L", (64, 32), 255), config="--psm 6")
        logger.info("OCR warm-up complete.")
    except Exception as exc:  # noqa: BLE001 - warm-up must never block startup
        logger.warning("OCR warm-up skipped: %s", exc)


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


@app.post("/extract-document")
async def extract_document(file: UploadFile = File(...)):
    """Generic handbook / learning-material extraction.

    Unlike /extract-resume this returns the raw extracted text (no NER, no
    scoring) plus the page count, so the LMS quiz generator can ground its
    questions strictly in the source handbook. Reuses the same multi-format
    extractor (pdfplumber / pypdfium2 / python-docx / Tesseract OCR).
    """
    name = file.filename or ""
    suffix = Path(name).suffix or ".tmp"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)
    try:
        try:
            result = extract_text(tmp_path, name)
        except ExtractionError as exc:
            raise HTTPException(status_code=422, detail=str(exc))
        except Exception as exc:  # noqa: BLE001 - deliberate boundary
            logger.exception("Unhandled document extraction error")
            raise HTTPException(status_code=500, detail=f"Internal extraction error: {exc}")

        return {
            "ok": True,
            "text": result.get("text") or "",
            "page_count": int(result.get("pages") or 1),
            "method": result.get("method"),
            "extension": result.get("extension"),
            "warnings": result.get("warnings") or [],
        }
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


@app.post("/classify-document")
async def classify_document(file: UploadFile = File(...), is_first: bool = Form(False)):
    """Content-based single-dropzone classifier (test + future apply flow).

    Three-signal fusion: CONTENT dominates; filename is a small hint; the
    FIRST upload is expected to be the resume (is_first=True gives a small
    +2 resume prior that never overrules strong document phrasing).
    Unreadable files return predicted_type Others with confidence 0.
    """
    suffix = Path(file.filename or "").suffix or ".tmp"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)

    def _unreadable(reason: str) -> dict:
        diagnostics = None
        if suffix.lower() == ".docx":
            try:
                from app.services.text_extraction import describe_docx

                diagnostics = describe_docx(tmp_path)
            except Exception:  # noqa: BLE001 - diagnostics must never break the reply
                diagnostics = None
        reply = {
            "success": True,
            "classifier_version": CLASSIFIER_VERSION,
            "predicted_type": "Others",
            "confidence": 0.0,
            "scores": {"Resume": 0.0, "COE": 0.0, "Certificate": 0.0, "Credential": 0.0, "Others": 0.0},
            "reasons": [reason],
            "signals": {"has_email": False, "has_phone": False, "sections": [], "char_count": 0},
            "text_extraction": {"method": None, "pages": None, "extension": suffix.lstrip(".")},
            "text_preview": "",
        }
        if diagnostics is not None:
            reply["diagnostics"] = diagnostics
        return reply

    try:
        try:
            # Classification only needs section/keyword evidence, not a
            # faithful transcript: allow the single-pass OCR shortcut.
            extracted_meta = extract_text(tmp_path, file.filename or "", fast=True)
        except ExtractionError as exc:
            logger.warning("Classify-document extraction failed: %s", exc)
            return _unreadable(f"Could not read file text: {exc}")

        try:
            cleaned = preprocessing.preprocess(extracted_meta["text"])
            text = cleaned["cleaned_text"]
        except Exception as exc:  # noqa: BLE001 - preprocessing must never break classification
            logger.warning("Classify-document preprocessing failed: %s", exc)
            return _unreadable(f"Could not process file text: {exc}")
        try:
            # classify_text only needs the section NAMES, which is the same
            # detect_sections() call extract() makes internally. Skipping the
            # full NER pass saves ~120 ms per classify without changing scores.
            sections = sorted(section_detection.detect_sections(text))
        except Exception:  # noqa: BLE001 - section detection must never break classification
            sections = []
        try:
            result = doc_classifier.classify_text(text, file.filename or "", sections, None, is_first)
        except Exception as exc:  # noqa: BLE001 - classifier must never 500 the test page
            logger.warning("Classify-document scoring failed: %s", exc)
            return _unreadable(f"Could not score document: {exc}")
        result["success"] = True
        result["classifier_version"] = CLASSIFIER_VERSION
        result["text_extraction"] = {
            "method": extracted_meta.get("method"),
            "pages": extracted_meta.get("pages"),
            "extension": extracted_meta.get("extension"),
            "character_count": len(extracted_meta.get("text") or ""),
        }
        # Short preview so the test page can show what was actually read.
        result["text_preview"] = (extracted_meta.get("text") or "")[:600]
        return result
    finally:
        tmp_path.unlink(missing_ok=True)
