"""Supporting-document evidence aggregation for the ranking score.

`document_verification.py` verifies ONE uploaded document (COE / Certificate /
Credential) against the applicant's resume profile and returns a verdict
(VERIFIED | DISCREPANCY_FOUND | UNABLE_TO_VERIFY) plus a per-field `checks`
map. This module turns the applicant's whole document set into the single
evidence block the screening classifier blends into the final ranking score:

    documents_score = mean(credit of decisive documents) * 100
        VERIFIED          -> DOCUMENT_VERIFICATION_CREDIT_VERIFIED   (1.00)
        UNABLE_TO_VERIFY  -> DOCUMENT_VERIFICATION_CREDIT_UNABLE     (0.50)
        DISCREPANCY_FOUND -> DOCUMENT_VERIFICATION_CREDIT_DISCREPANCY (0.00)

    final_score = resume_score * (1 - weight) + documents_score * weight

Only "decisive" documents participate: still PENDING/PROCESSING rows and
documents that cannot be mapped to a resume section ("Others") are ignored, so
an applicant with no usable evidence keeps the resume-only score exactly as
before this feature existed. Any DISCREPANCY_FOUND escalates the official
classification to INVALID_CREDENTIAL (configurable), mirroring the resume-side
credential-warning escalation.

The module is pure: no file, model or network access, so it is trivially
unit-testable and safe to call from the screening pipeline and the
reclassification endpoint alike.
"""
from typing import Any, Dict, List, Optional

from app import config
from app.services import document_verification as docver

# Statuses whose credit participates in the evidence average.
_PENDING_STATUSES = {"PENDING", "PROCESSING"}

_DOC_TYPE_ALIASES = {
    "coe": "COE",
    "certificate": "Certificate",
    "credential": "Credential",
    "others": "Others",
    "other": "Others",
}


def _normalize_doc_type(raw: Any) -> str:
    value = str(raw or "").strip()
    return _DOC_TYPE_ALIASES.get(value.lower(), value)


def _normalize_status(raw: Any) -> str:
    return str(raw or "").strip().upper()


def _credit_for(status: str) -> Optional[float]:
    """Credit earned by one document, or None when it must not be counted."""
    if status == docver.STATUS_VERIFIED:
        return float(config.DOCUMENT_VERIFICATION_CREDIT_VERIFIED)
    if status == docver.STATUS_UNABLE:
        return float(config.DOCUMENT_VERIFICATION_CREDIT_UNABLE)
    if status == docver.STATUS_DISCREPANCY:
        return float(config.DOCUMENT_VERIFICATION_CREDIT_DISCREPANCY)
    return None


def _document_checks(entry: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """The per-field comparison map, accepting the Laravel payload shapes.

    Laravel forwards `verification_result.checks` straight from the NLP
    verification response; older/partial payloads may carry `checks` on the
    document itself, so both shapes are honoured.
    """
    result = entry.get("verification_result")
    if isinstance(result, dict):
        checks = result.get("checks")
        if isinstance(checks, dict):
            return checks
    checks = entry.get("checks")
    return checks if isinstance(checks, dict) else {}


def _document_summary(entry: Dict[str, Any]) -> str:
    result = entry.get("verification_result")
    if isinstance(result, dict) and isinstance(result.get("summary"), str):
        return result["summary"].strip()
    if isinstance(entry.get("summary"), str):
        return entry["summary"].strip()
    return ""


def _mismatched_labels(checks: Dict[str, Dict[str, Any]]) -> List[str]:
    labels: List[str] = []
    for key, check in checks.items():
        if isinstance(check, dict) and _normalize_status(check.get("result")) == "MISMATCH":
            labels.append(docver.CHECK_LABELS.get(key, key))
    return labels


def classify_evidence_status(
    documents: List[Dict[str, Any]],
    decisive_count: int,
    verified_count: int,
    discrepancy_count: int,
) -> str:
    """Human-facing evidence status for the whole document set.

    PARTIAL means some evidence participated in the score without being fully
    corroborated (mixed results, or documents that could not be compared), so
    the caller must report the blended score rather than claiming the resume
    was fully verified.
    """
    if not documents:
        return config.EVIDENCE_NOT_PROVIDED
    if discrepancy_count > 0:
        return config.EVIDENCE_DISCREPANCY
    if decisive_count == 0:
        return config.EVIDENCE_PENDING
    if verified_count == decisive_count:
        return config.EVIDENCE_VERIFIED
    return config.EVIDENCE_PARTIAL


def aggregate_document_verifications(
    documents: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Aggregates per-document verdicts into the ranking evidence block.

    Args:
        documents: list of dicts shaped like
            {"applicant_document_id": 3, "doc_type": "COE",
             "verification_status": "DISCREPANCY_FOUND",
             "verification_result": {"checks": {...}, "summary": "..."}}
            Missing/unknown fields are tolerated — the entry simply earns no
            credit and never raises.

    Returns a JSON-serialisable block:
        status, weight, documents_total, decisive_count, verified_count,
        discrepancy_count, unable_count, pending_count, ignored_count,
        credit_ratio, documents_score, score_penalty (filled by the caller),
        escalate_invalid, flags (human-readable sentences),
        mismatched_fields, per_document (compact audit rows).
    """
    documents = [d for d in (documents or []) if isinstance(d, dict)]

    per_document: List[Dict[str, Any]] = []
    flags: List[str] = []
    mismatched_fields: List[str] = []
    credits: List[float] = []
    verified_count = discrepancy_count = unable_count = 0
    pending_count = ignored_count = 0

    for entry in documents:
        doc_type = _normalize_doc_type(entry.get("doc_type") or entry.get("document_type"))
        status = _normalize_status(entry.get("verification_status") or entry.get("status"))
        checks = _document_checks(entry)
        mismatches = _mismatched_labels(checks)
        credit = _credit_for(status)

        ignored_reason: Optional[str] = None
        if credit is None and status not in _PENDING_STATUSES:
            # No verification result yet (or an unknown status): nothing to say.
            ignored_count += 1
            ignored_reason = "no verification result recorded"
        elif doc_type not in docver.SUPPORTED_TYPES:
            # "Others" cannot be mapped to a resume section: informational only.
            ignored_count += 1
            ignored_reason = "document type cannot be mapped to a resume section"
        elif credit is None:
            pending_count += 1
            ignored_reason = "verification still in progress"

        counted = ignored_reason is None
        if counted:
            credits.append(float(credit))
            if status == docver.STATUS_VERIFIED:
                verified_count += 1
                flags.append(
                    f"{doc_type} verified: the document corroborates the resume claims."
                )
            elif status == docver.STATUS_DISCREPANCY:
                discrepancy_count += 1
                mismatched_fields.extend(mismatches)
                detail = (
                    "contradicts the resume on " + ", ".join(mismatches)
                    if mismatches
                    else "contradicts the resume claims"
                )
                flags.append(f"{doc_type} discrepancy: the document {detail}.")
            else:  # STATUS_UNABLE
                unable_count += 1
                flags.append(
                    f"{doc_type} unverifiable: the document could not be compared "
                    "against the resume claims."
                )

        per_document.append({
            "applicant_document_id": entry.get("applicant_document_id"),
            "doc_type": doc_type,
            "verification_status": status or "PENDING",
            "counted": counted,
            "credit": credit if counted else None,
            "mismatched_fields": mismatches,
            "summary": _document_summary(entry) or None,
            "ignored_reason": ignored_reason,
        })

    decisive_count = len(credits)
    credit_ratio = (sum(credits) / decisive_count) if decisive_count else None
    documents_score = round(credit_ratio * 100, 2) if credit_ratio is not None else None
    escalate_invalid = bool(
        config.DOCUMENT_VERIFICATION_ESCALATE_ON_DISCREPANCY and discrepancy_count > 0
    )

    status_label = classify_evidence_status(
        documents, decisive_count, verified_count, discrepancy_count
    )

    return {
        "status": status_label,
        "weight": float(config.DOCUMENT_VERIFICATION_WEIGHT),
        "documents_total": len(documents),
        "decisive_count": decisive_count,
        "verified_count": verified_count,
        "discrepancy_count": discrepancy_count,
        "unable_count": unable_count,
        "pending_count": pending_count,
        "ignored_count": ignored_count,
        "credit_ratio": round(credit_ratio, 4) if credit_ratio is not None else None,
        "documents_score": documents_score,
        "score_penalty": 0.0,
        "escalate_invalid": escalate_invalid,
        "mismatched_fields": sorted(set(mismatched_fields)),
        "flags": flags,
        "per_document": per_document,
    }


def apply_document_evidence(match_score: float, aggregate: Optional[Dict[str, Any]]) -> float:
    """Blends the resume score with the document evidence score.

    Returns `match_score` unchanged when there is no decisive evidence, so
    applicants without verifiable documents are scored exactly as before.
    Also annotates `aggregate` with the applied `score_penalty` when given.
    """
    if not aggregate or aggregate.get("credit_ratio") is None:
        return float(match_score)

    weight = float(aggregate.get("weight", config.DOCUMENT_VERIFICATION_WEIGHT))
    weight = min(max(weight, 0.0), 1.0)
    documents_score = float(aggregate.get("documents_score") or 0.0)
    blended = float(match_score) * (1.0 - weight) + documents_score * weight
    blended = max(0.0, round(blended, 2))

    aggregate["score_penalty"] = round(float(match_score) - blended, 2)
    return blended


def summarize_evidence(
    aggregate: Optional[Dict[str, Any]], resume_score: float, final_score: float
) -> str:
    """One-sentence explanation of the verification impact for HR."""
    if not aggregate:
        return ""
    status = aggregate.get("status")
    if status == config.EVIDENCE_NOT_PROVIDED:
        return (
            "No supporting documents were uploaded, so the score reflects the resume "
            "screening only."
        )
    if status == config.EVIDENCE_PENDING:
        return (
            "Supporting documents are still being verified or could not be compared, "
            "so the score reflects the resume screening only."
        )

    parts = []
    if aggregate.get("verified_count"):
        parts.append(f"{aggregate['verified_count']} verified")
    if aggregate.get("discrepancy_count"):
        parts.append(f"{aggregate['discrepancy_count']} with discrepancies")
    if aggregate.get("unable_count"):
        parts.append(f"{aggregate['unable_count']} unverifiable")
    breakdown = ", ".join(parts) if parts else "no decisive documents"

    penalty = round(float(resume_score) - float(final_score), 2)
    if penalty > 0:
        movement = f"reduced the score from {resume_score}% to {final_score}%"
    elif penalty < 0:
        movement = f"raised the score from {resume_score}% to {final_score}%"
    else:
        movement = f"kept the score at {final_score}%"

    return (
        f"Supporting-document verification ({breakdown}) {movement} "
        f"(documents score {aggregate.get('documents_score')}% at a "
        f"{round(float(aggregate.get('weight', 0)) * 100)}% weighting)."
    )

