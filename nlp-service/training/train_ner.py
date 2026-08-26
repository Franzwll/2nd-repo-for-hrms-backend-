"""Trains the custom role-specific NER model on top of en_core_web_sm.

Reads training/data/train.spacy and training/data/dev.spacy (produced by
prepare_dataset.py), trains only the 'ner' component with the labels
PERSON / EDUCATION / JOB_TITLE / SKILL / CERTIFICATION, reports dev F1 per
epoch and saves the full pipeline to models_spacy/role_specific_ner.

Usage: python training/train_ner.py [epochs]
"""
import random
import sys
from pathlib import Path

import spacy
from spacy.training import Corpus
from spacy.util import compounding, minibatch

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app import config  # noqa: E402

TRAIN_DATA = Path(__file__).parent / "data" / "train.spacy"
DEV_DATA = Path(__file__).parent / "data" / "dev.spacy"
OUTPUT_DIR = config.CUSTOM_NER_MODEL_DIR

EPOCHS_DEFAULT = 30
DROPOUT = 0.35


def score_examples(nlp, corpus_path: Path) -> tuple[float, dict]:
    """Applies the full pipeline to each gold document and scores entity spans.

    Note: Corpus(nlp) only tokenizes; it does not run pipeline components, so
    we rebuild Example objects ourselves with real predictions.
    """
    from spacy.scorer import Scorer
    from spacy.tokens import DocBin
    from spacy.training import Example

    docbin = DocBin().from_disk(str(corpus_path))
    references = list(docbin.get_docs(nlp.vocab))
    examples = []
    for reference in references:
        predicted = nlp(reference.text)
        examples.append(Example(predicted=predicted, reference=reference))
    scores = Scorer().score(examples)
    per_type = {
        label: round(metrics.get("f", 0.0), 3)
        for label, metrics in scores.get("ents_per_type", {}).items()
    }
    return round(scores.get("ents_f", 0.0), 3), per_type


def main(epochs: int = EPOCHS_DEFAULT) -> None:
    if not TRAIN_DATA.exists():
        raise SystemExit(f"{TRAIN_DATA} not found. Run prepare_dataset.py first.")

    nlp = spacy.load(config.BASE_SPACY_MODEL)
    if "ner" in nlp.pipe_names:
        nlp.remove_pipe("ner")
    ner = nlp.add_pipe("ner")
    for label in config.NER_LABELS:
        ner.add_label(label)

    train_corpus = Corpus(str(TRAIN_DATA))
    train_examples = list(train_corpus(nlp))
    print(f"Training on {len(train_examples)} documents, labels: {config.NER_LABELS}")

    rng = random.Random(7)
    best_f = -1.0

    with nlp.select_pipes(enable=["ner"]):
        optimizer = nlp.initialize(lambda: train_examples)
        for epoch in range(1, epochs + 1):
            rng.shuffle(train_examples)
            losses: dict = {}
            for batch in minibatch(train_examples, size=compounding(4.0, 32.0, 1.5)):
                nlp.update(batch, drop=DROPOUT, sgd=optimizer, losses=losses)
            dev_f, per_type = score_examples(nlp, DEV_DATA)
            marker = ""
            if dev_f > best_f:
                best_f = dev_f
                OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
                nlp.to_disk(str(OUTPUT_DIR))
                marker = " *saved*"
            print(f"epoch {epoch:03d} loss={losses.get('ner', 0):.2f} dev_ents_F={dev_f:.3f}{marker} {per_type}")

    print(f"\nBest dev ents_F={best_f:.3f}; model saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    epochs_arg = int(sys.argv[1]) if len(sys.argv) > 1 else EPOCHS_DEFAULT
    main(epochs_arg)
