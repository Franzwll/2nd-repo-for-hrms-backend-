"""Splits the annotated resume dataset into train/validation/test DocBins.

The split is performed by complete resume document to prevent data leakage:
no pages or fragments of the same resume ever appear in more than one set.
Default ratios: 70% train / 15% validation / 15% test.

Usage: python training/prepare_dataset.py [input.json]
"""
import json
import random
import sys
from pathlib import Path

import spacy
from spacy.tokens import DocBin

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = Path(__file__).parent / "data" / "annotated_resumes.json"
OUT_DIR = Path(__file__).parent / "data"

RATIOS = {"train": 0.70, "dev": 0.15, "test": 0.15}


def convert(nlp, records):
    docs = DocBin(attrs=["ENT_IOB", "ENT_TYPE"], store_user_data=False)
    for record in records:
        doc = nlp.make_doc(record["text"])
        entities = []
        for start, end, label in record["entities"]:
            span = doc.char_span(start, end, label=label, alignment_mode="contract")
            if span is None:
                raise ValueError(
                    f"Span [{start}:{end}] '{record['text'][start:end]}' does not align "
                    f"to tokens; fix the annotation or text."
                )
            entities.append(span)
        doc.ents = entities
        docs.add(doc)
    return docs


def main(input_path: Path = DEFAULT_INPUT) -> None:
    rng = random.Random(42)
    records = json.loads(Path(input_path).read_text(encoding="utf-8"))
    shuffled = list(records)
    rng.shuffle(shuffled)

    n = len(shuffled)
    n_train = int(n * RATIOS["train"])
    n_dev = int(n * RATIOS["dev"])
    splits = {
        "train": shuffled[:n_train],
        "dev": shuffled[n_train:n_train + n_dev],
        "test": shuffled[n_train + n_dev:],
    }

    # Use the base model's tokenizer so training/eval tokenization matches serving.
    nlp = spacy.load("en_core_web_sm", exclude=["ner"])

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, subset in splits.items():
        docbin = convert(nlp, subset)
        out_file = OUT_DIR / f"{name}.spacy"
        docbin.to_disk(str(out_file))
        counts: dict[str, int] = {}
        for record in subset:
            for _s, _e, label in record["entities"]:
                counts[label] = counts.get(label, 0) + 1
        print(f"{name}: {len(subset)} resumes -> {out_file} | labels: {counts}")

    overlap_check = {
        "train_texts": {r["text"] for r in splits["train"]},
        "dev_texts": {r["text"] for r in splits["dev"]},
        "test_texts": {r["text"] for r in splits["test"]},
    }
    assert not (overlap_check["train_texts"] & overlap_check["test_texts"]), "Leakage between train and test!"
    assert not (overlap_check["train_texts"] & overlap_check["dev_texts"]), "Leakage between train and dev!"
    print("No document appears in more than one split (leakage check passed).")


if __name__ == "__main__":
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
    main(path)
