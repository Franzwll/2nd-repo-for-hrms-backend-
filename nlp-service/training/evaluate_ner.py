"""Evaluates the trained custom NER model on the held-out TEST split.

Reports per-entity Precision / Recall / F1 for PERSON, EDUCATION, JOB_TITLE,
SKILL and CERTIFICATION using spaCy's Scorer on test.spacy (documents never
seen during training or validation).

Usage: python training/evaluate_ner.py [model_dir]
"""
import json
import sys
from pathlib import Path

import spacy

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app import config  # noqa: E402

TEST_DATA = Path(__file__).parent / "data" / "test.spacy"


def main(model_dir: str = str(config.CUSTOM_NER_MODEL_DIR)) -> None:
    if not TEST_DATA.exists():
        raise SystemExit(f"{TEST_DATA} not found. Run prepare_dataset.py first.")

    nlp = spacy.load(model_dir)

    from spacy.scorer import Scorer
    from spacy.tokens import DocBin
    from spacy.training import Example

    docbin = DocBin().from_disk(str(TEST_DATA))
    references = list(docbin.get_docs(nlp.vocab))
    examples = [
        Example(predicted=nlp(reference.text), reference=reference)
        for reference in references
    ]
    scores = Scorer().score(examples)

    report = {
        "model": model_dir,
        "test_documents": len(examples),
        "overall": {
            "precision": round(scores.get("ents_p", 0.0), 4),
            "recall": round(scores.get("ents_r", 0.0), 4),
            "f1": round(scores.get("ents_f", 0.0), 4),
        },
        "per_entity": {},
    }
    for label, metrics in sorted(scores.get("ents_per_type", {}).items()):
        report["per_entity"][label] = {
            "precision": round(metrics.get("p", 0.0), 4),
            "recall": round(metrics.get("r", 0.0), 4),
            "f1": round(metrics.get("f", 0.0), 4),
        }

    print(json.dumps(report, indent=2))
    out_file = Path(__file__).parent / "data" / "ner_test_report.json"
    out_file.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\nSaved report to {out_file}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(config.CUSTOM_NER_MODEL_DIR))
