"""Central configuration for the NLP screening service."""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "app" / "data"
MODELS_DIR = BASE_DIR / "models_spacy"
CUSTOM_NER_MODEL_DIR = MODELS_DIR / "role_specific_ner"
TRAINING_DIR = BASE_DIR / "training"

BASE_SPACY_MODEL = "en_core_web_sm"

# Entity labels produced by the custom NER model.
NER_LABELS = ["PERSON", "EDUCATION", "JOB_TITLE", "SKILL", "CERTIFICATION"]

# Documented scoring weights (sum to 1.00). They mirror the historical
# applicant_screening_scores seed data: Skills 40 / Experience 30 /
# Education 20 / Certifications 10 out of 100.
SCORE_WEIGHTS = {
    "skills": 0.40,
    "experience": 0.30,
    "education": 0.20,
    "certifications": 0.10,
}

# Classification thresholds and mandatory-requirement rules.
PERFECT_SCORE_THRESHOLD = 75.0
ALT_JOB_SCORE_THRESHOLD = 75.0
REQUIRED_SKILLS_COVERAGE_MIN = 0.60

# Processing statuses tracked per resume (SOP 1).
STATUS_PROCESSED = "PROCESSED"
STATUS_PARTIALLY_PROCESSED = "PARTIALLY_PROCESSED"
STATUS_FAILED = "FAILED"
STATUS_PENDING = "PENDING"
STATUS_PROCESSING = "PROCESSING"

# Official user-facing screening classifications.
CLASS_PERFECT = "PERFECT_FOR_THE_JOB"
CLASS_INVALID_CREDENTIAL = "INVALID_CREDENTIAL"
CLASS_FIT_OTHER = "FIT_FOR_OTHER_JOB"
CLASS_NOT_FITTED = "NOT_FITTED_TO_JOB"

# Education level ranking used for requirement comparison. Higher is better.
EDUCATION_RANKS = {
    "high school graduate": 1,
    "high school": 1,
    "secondary education": 1,
    "senior high school": 1,
    "senior high": 1,
    "vocational / tesda": 2,
    "vocational": 2,
    "tesda": 2,
    "vocational diploma": 2,
    "technical course": 2,
    "college level": 3,
    "associate degree": 3,
    "associate": 3,
    "diploma": 3,
    "college undergraduate": 3,
    "bachelor's degree": 4,
    "bachelor's": 4,
    "bachelor": 4,
    "b.s.": 4,
    "bs": 4,
    "b.a.": 4,
    "ba": 4,
    "bsba": 4,
    "bshm": 4,
    "bsitm": 4,
    "college graduate": 4,
    "master's degree": 5,
    "master's": 5,
    "master": 5,
    "m.s.": 5,
    "mba": 5,
    "doctorate": 6,
    "phd": 6,
}

DEFAULT_REQUIRED_INFORMATION = ["name", "email", "phone"]
