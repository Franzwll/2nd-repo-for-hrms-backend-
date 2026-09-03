"""Builds the standardized applicant profile and runs validation analysis:
missing information, invalid formats, recognized/unrecognized skills and roles,
and credential analysis. Terminology follows the capstone SOP definitions:

- RECOGNIZED          item exists in reference data or aliases
- UNRECOGNIZED        item not found in reference data (flagged, NOT auto-rejected)
- MISSING             required information was not extracted
- INVALID_FORMAT      value exists but fails format validation
- INVALID_CREDENTIAL  credential issue per documented validation rules
"""
import re
from typing import Dict, List, Optional, Tuple

from app import config
from app.services import reference_data as refdata


EMAIL_STRICT_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$")


def build_profile(
    extraction: Dict,
    references: Optional[Tuple[Dict[str, List[str]], Dict[str, List[str]], Dict[str, List[str]]]] = None,
) -> Dict:
    name = extraction.get("name")
    emails = extraction.get("emails", [])
    phones = extraction.get("phones", [])
    skills_ref, roles_ref, certs_ref = references or (
        refdata.skills_reference(),
        refdata.job_roles_reference(),
        refdata.certifications_reference(),
    )
    skill_classes = refdata.classify_items(extraction.get("skills_raw", []), skills_ref)
    role_classes = refdata.classify_items(
        extraction.get("job_titles_raw", []) + [h["job_title"] for h in extraction.get("work_history", [])],
        roles_ref,
    )
    cert_classes = refdata.classify_items(extraction.get("certifications_raw", []), certs_ref)

    profile = {
        "personal_information": {
            "name": name,
            "email": emails[0] if emails else None,
            "phone": _prefer_mobile(phones),
            "address": extraction.get("address"),
        },
        "education": extraction.get("education", []),
        "work_experience": [
            {
                "job_title": h.get("job_title"),
                "company": h.get("company"),
                "location": h.get("location"),
                "period": h.get("period"),
                "recognized_role": h.get("recognized_role", False),
            }
            for h in extraction.get("work_history", [])
        ],
        "skills": skill_classes["recognized"],
        # Guide (SOP 2): UNRECOGNIZED must not be hidden - extracted
        # certifications stay visible in the profile, flagged separately.
        "certifications": cert_classes["recognized"] + cert_classes["unrecognized"],
        "unrecognized_certifications": cert_classes["unrecognized"],
        "estimated_years_experience": extraction.get("estimated_years_experience", 0),
        "job_roles": role_classes,
        "unrecognized_skills": skill_classes["unrecognized"],
    }

    return profile


def _phone_is_valid(phone: str) -> bool:
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) < 7 or len(digits) > 15:
        return False
    if digits.startswith("63") and len(digits) >= 12:
        digits = digits[2:]
    elif digits.startswith("0"):
        digits = digits[1:]
    # Philippine mobile numbers are 10 digits after the leading 0 and start with 9.
    if digits.startswith("9"):
        return len(digits) == 10
    return True


def _prefer_mobile(phones: List[str]) -> Optional[str]:
    """Picks the best contact number: PH mobile first, then any valid one."""
    for phone in phones:
        digits = re.sub(r"\D", "", phone or "")
        if digits.startswith("0") and len(digits) == 11 and digits[1] == "9":
            return phone
        if digits.startswith("63") and len(digits) == 12 and digits[2] == "9":
            return phone
        if len(digits) == 10 and digits.startswith("9"):
            return phone
    return phones[0] if phones else None


def validate(profile: Dict, required_information: List[str] | None = None,
             malformed_emails: List[str] | None = None) -> Dict:
    """Runs missing/format/credential checks against the standardized profile."""
    personal = profile.get("personal_information", {})
    required = [r.lower() for r in (required_information or config.DEFAULT_REQUIRED_INFORMATION)]

    missing: List[str] = []
    invalid_format: List[str] = []

    if "name" in required and not personal.get("name"):
        missing.append("name")
    if "email" in required:
        email = personal.get("email")
        malformed = malformed_emails or []
        if not email:
            if malformed:
                invalid_format.append(f"Malformed email address: {malformed[0]}")
            else:
                missing.append("email")
        elif not EMAIL_STRICT_RE.match(email):
            invalid_format.append(f"Malformed email address: {email}")
    if "phone" in required:
        phone = personal.get("phone")
        if not phone:
            missing.append("phone")
        elif not _phone_is_valid(phone):
            invalid_format.append(f"Incomplete or malformed phone number: {phone}")

    if "education" in required and not profile.get("education"):
        missing.append("education")
    if "work_experience" in required and not profile.get("work_experience") and not profile.get("estimated_years_experience"):
        missing.append("work experience")

    credential_issues: List[Dict] = []
    for item in invalid_format:
        credential_issues.append({
            "type": "INVALID_FORMAT",
            "detail": item,
            "note": "Value exists but fails expected format validation.",
        })

    unrecognized_skills = profile.get("job_roles", {}).get("unrecognized", [])
    role_unrecognized = [
        {"type": "UNRECOGNIZED_JOB_ROLE", "detail": r,
         "note": "Not found in system reference data; flagged for manual review only."}
        for r in profile.get("job_roles", {}).get("unrecognized", [])
    ]

    return {
        "missing_information": sorted(missing),
        "invalid_format": invalid_format,
        "skill_analysis": {
            "recognized": profile["skills"],
            "unrecognized": profile.get("unrecognized_skills", []),
        },
        "job_role_analysis": {
            "recognized": profile.get("job_roles", {}).get("recognized", []),
            "unrecognized": profile.get("job_roles", {}).get("unrecognized", []),
        },
        "credential_issues": credential_issues,
        "review_flags": role_unrecognized,
    }


def analyze_with_certifications(
    profile: Dict,
    validation: Dict,
    required_certifications: List[str],
    certifications_reference: Dict[str, List[str]],
) -> Dict:
    """Credential analysis for job-required certifications.

    Documented validation rules (aligned with the system's seed data):
    - A required certification that is completely absent is a qualification gap
      ("MISSING" requirement row). It gates PERFECT_FOR_THE_JOB but does not by
      itself classify the applicant as INVALID_CREDENTIAL, because absence of a
      training credential is an experience/qualification matter.
    - When the job requires a certification and the applicant lists
      certification-like entries but none can be validated against reference
      data, the result is UNVERIFIABLE_REQUIRED_CREDENTIAL -> INVALID_CREDENTIAL
      meaning "invalid or requires verification based on system validation rules".
    - Unrecognized certifications are never treated as fraudulent.
    """
    issues = list(validation.get("credential_issues", []))
    analysis_rows: List[Dict] = []

    applicant_certs = list(profile.get("certifications", [])) + [
        c for c in validation.get("skill_analysis", {}).get("unrecognized", [])
    ]

    def norm(v: str) -> str:
        return re.sub(r"\s+", " ", v.strip().lower())

    applicant_norm = {norm(c): c for c in applicant_certs}

    matched_required: List[str] = []
    missing_required: List[str] = []

    for required in required_certifications:
        canonical_req = refdata.canonicalize(required, certifications_reference) or required
        req_norm = norm(canonical_req)
        matched_key = None
        for key in applicant_norm:
            if key == req_norm:
                matched_key = key
                break
            # Substring matching only for substantive strings so short keys
            # ("nc ii") cannot ride inside unrelated long names.
            if len(key) >= 5 and len(req_norm) >= 5 and (key in req_norm or req_norm in key):
                matched_key = key
                break
        if matched_key:
            matched_required.append(canonical_req)
            analysis_rows.append({
                "required": canonical_req,
                "status": "RECOGNIZED",
                "matched_value": applicant_norm[matched_key],
            })
        else:
            missing_required.append(canonical_req)
            analysis_rows.append({
                "required": canonical_req,
                "status": "MISSING",
                "matched_value": None,
                "note": "Required certification not found in resume; treated as unmet qualification requirement.",
            })

    unrecognized_extracted: List[Dict] = []
    for cert in profile.get("certifications", []):
        if refdata.canonicalize(cert, certifications_reference):
            continue
        row = {
            "required": None,
            "extracted": cert,
            "status": "UNRECOGNIZED",
            "note": "Invalid or requires verification based on system validation rules.",
        }
        analysis_rows.append(row)
        unrecognized_extracted.append(cert)

    if required_certifications and not matched_required:
        if unrecognized_extracted:
            issues.append({
                "type": "UNVERIFIABLE_REQUIRED_CREDENTIAL",
                "detail": (
                    f"The applied job requires a certification ({', '.join(missing_required)}) and the "
                    f"certification(s) listed in the resume could not be recognized against system "
                    f"reference data."
                ),
                "note": "Invalid or requires verification based on system validation rules.",
            })
            for row in analysis_rows:
                if row.get("status") == "MISSING":
                    row["status"] = "UNVERIFIABLE"
                    row["note"] = "Listed credentials could not be verified against reference data."

    validation["credential_analysis"] = analysis_rows
    validation["credential_issues"] = issues
    validation["_matched_required_certifications"] = matched_required
    return validation
