"""
Evaluation harness for reference/RESUME/new dataset.

Each folder contains:
  - 6 resume variants: .pdf, .docx, .png, .jpg, _Blurred.png, _Blurred.jpg
  - 1 ground truth txt (OCR.txt or Actual Info ...txt)

We compare extracted text (via text_extraction.extract_text) to ground truth
using token-level precision/recall and normalized Levenshtein-style coverage.
Also checks entity extraction (name/email/phone) recall.

Run: python evaluate_new_resumes.py
"""
import re
import json
from pathlib import Path
from difflib import SequenceMatcher
from collections import defaultdict

import sys
sys.path.insert(0, str(Path(__file__).parent))

from app.services.text_extraction import extract_text, ExtractionError
from app.services import preprocessing, entity_extraction

BASE = Path(__file__).parent.parent / "reference" / "RESUME" / "new"
if not BASE.exists():
    BASE = Path(r"C:\Users\PC\Downloads\Ferdi\4TH_YR\DEV\v7 (orig)\2nd-repo-for-hrms-backend-\reference\RESUME\new")

def normalize(s: str) -> str:
    s = re.sub(r"\s+", " ", s.lower()).strip()
    s = re.sub(r"[^a-z0-9@.\- ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def token_metrics(pred: str, truth: str):
    pred_tokens = normalize(pred).split()
    truth_tokens = normalize(truth).split()
    if not truth_tokens:
        return {"precision":0,"recall":0,"f1":0,"pred_len":len(pred_tokens),"truth_len":0}
    pred_set = set(pred_tokens)
    truth_set = set(truth_tokens)
    # also count multiset overlap for better recall
    from collections import Counter
    pc = Counter(pred_tokens)
    tc = Counter(truth_tokens)
    overlap = sum(min(pc[t], tc[t]) for t in tc)
    precision = overlap / len(pred_tokens) if pred_tokens else 0
    recall = overlap / len(truth_tokens) if truth_tokens else 0
    f1 = 2*precision*recall/(precision+recall) if (precision+recall)>0 else 0
    # sequence similarity
    seq = SequenceMatcher(None, normalize(pred), normalize(truth)).ratio()
    return {
        "precision": round(precision,3),
        "recall": round(recall,3),
        "f1": round(f1,3),
        "seq_ratio": round(seq,3),
        "pred_len": len(pred_tokens),
        "truth_len": len(truth_tokens),
        "overlap": overlap,
    }

def load_ground_truth(folder: Path):
    txts = list(folder.glob("*.txt"))
    if not txts:
        return None, None
    # prefer OCR.txt or Actual Info
    txt_path = txts[0]
    # if multiple, pick largest? we have only 1 per folder
    text = txt_path.read_text(encoding="utf-8", errors="ignore")
    return txt_path, text

def parse_variation_truth(text: str):
    """Split Actual Info ...txt into sections.
    Returns dict keyed by header type e.g. 'PDF RESUME', 'DOCX RESUME', 'PNG RESUME', 'JPG RESUME', 'BLURRED PNG RESUME', 'BLURRED JPG RESUME'
    Value is header Target Position line + body so it is the full resume ground truth for that format.
    """
    # Split on lines of equals: \n===\n  The text uses \n==================================================\n as separator
    parts = re.split(r"\n=+\n", text)
    # parts[0] preamble, then header, body, header, body ...
    # Example: [preamble, 'PDF RESUME\nTarget Position: ...', '\nFull Name: ...', 'DOCX RESUME\nTarget...', '\nFull Name...', ...]
    sections = {}
    # parts length should be 13 for 6 resumes (1 preamble + 6*2)
    for i in range(1, len(parts), 2):
        header = parts[i].strip()
        body = parts[i+1] if i+1 < len(parts) else ""
        # header first line is type, e.g. 'PDF RESUME' or 'BLURRED PNG RESUME'
        first_line = header.split("\n")[0].strip().upper()
        # normalize: ensure consistent keys
        # header may contain target position line already? In our split, header = 'PDF RESUME\nTarget Position: ...' so first_line is 'PDF RESUME'
        # body starts with '\nFull Name: ...'
        # Combine header's Target Position line + body as ground truth
        combined = header + "\n" + body.strip()
        sections[first_line] = combined.strip()
    return sections

def variation_key_for_file(filename: str) -> str:
    low = filename.lower()
    is_blurred = "blurred" in low
    if low.endswith(".pdf"):
        return "PDF RESUME"
    if low.endswith(".docx"):
        return "DOCX RESUME"
    if low.endswith(".png"):
        return "BLURRED PNG RESUME" if is_blurred else "PNG RESUME"
    if low.endswith(".jpg") or low.endswith(".jpeg"):
        return "BLURRED JPG RESUME" if is_blurred else "JPG RESUME"
    return ""

def main():
    extractor = entity_extraction.get_extractor()
    extractor.load_models()

    folders = sorted([p for p in BASE.iterdir() if p.is_dir()])
    print(f"Found {len(folders)} folders under {BASE}")
    results = []
    per_ext_stats = defaultdict(list)
    failures = []

    for folder in folders:
        txt_path, truth_text = load_ground_truth(folder)
        if not txt_path:
            print(f"[{folder.name}] no txt ground truth")
            continue
        is_variation = "Hospitality Resume Variations" in folder.name
        variation_sections = None
        if is_variation:
            variation_sections = parse_variation_truth(truth_text)
            # print section keys for debugging first time
            # print(f"  variation sections: {list(variation_sections.keys())}")

        # collect resume files (exclude txt)
        files = [p for p in folder.iterdir() if p.suffix.lower() in {".pdf",".docx",".png",".jpg",".jpeg"}]
        # sort to have deterministic order: pdf, docx, png, jpg, blurred
        files = sorted(files, key=lambda p: p.name.lower())

        print(f"\n=== {folder.name} ===")
        print(f"  Ground truth: {txt_path.name} ({len(truth_text)} chars, {len(truth_text.split())} words)")
        if is_variation:
            print(f"  Variation sections detected: {list(variation_sections.keys())}")

        for f in files:
            # determine expected truth segment
            expected = truth_text
            if is_variation and variation_sections:
                key = variation_key_for_file(f.name)
                if key in variation_sections:
                    expected = variation_sections[key]
                else:
                    # fallback: try role word overlap (legacy)
                    name_low = f.name.lower()
                    best_key = None
                    best_overlap = -1
                    role_words = re.sub(r"_+"," ", f.stem.replace("_Blurred","").replace("Blurred","")).lower()
                    role_tokens = set(re.findall(r"[a-z]+", role_words))
                    role_tokens = {t for t in role_tokens if t not in {"danielle","faith","mercado","angelica","therese","navarro","dominic","luis","herrera","isabella","marie","dela","cruz","marcelino","adrian","reyes","rafael","miguel","torres"}}
                    for k, seg in variation_sections.items():
                        m = re.search(r"Target Position:\s*([^\n]+)", seg, re.I)
                        target = m.group(1).lower() if m else ""
                        target_tokens = set(re.findall(r"[a-z]+", target))
                        overlap = len(role_tokens & target_tokens)
                        if overlap > best_overlap:
                            best_overlap = overlap
                            best_key = k
                    if best_key:
                        expected = variation_sections[best_key]

            try:
                res = extract_text(f, f.name)
                pred = res["text"]
                method = res["method"]
            except ExtractionError as e:
                print(f"  {f.name:55} ERROR {e} ({e.status})")
                failures.append((folder.name, f.name, str(e)))
                per_ext_stats[f.suffix.lower()].append({"f1":0,"recall":0,"seq_ratio":0})
                continue
            except Exception as e:
                print(f"  {f.name:55} EXCEPTION {e}")
                failures.append((folder.name, f.name, str(e)))
                continue

            metrics = token_metrics(pred, expected)
            # entity check: does extracted text contain name/email/phone from expected?
            # simple check: email regex presence
            email_in_truth = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", expected)
            email_in_pred = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", pred)
            email_recall = len(set(email_in_pred) & set(email_in_truth)) / len(set(email_in_truth)) if email_in_truth else 1.0

            status = "OK" if metrics["recall"]>0.7 and metrics["f1"]>0.6 else "LOW" if metrics["recall"]>0.4 else "FAIL"
            print(f"  {f.name:55} {method:25} rec={metrics['recall']:.2f} f1={metrics['f1']:.2f} seq={metrics['seq_ratio']:.2f} {status}  email_rec={email_recall:.1f}  pred{metrics['pred_len']} truth{metrics['truth_len']}")
            results.append({
                "folder": folder.name,
                "file": f.name,
                "ext": f.suffix.lower(),
                "is_blurred": "blurred" in f.name.lower(),
                "method": method,
                "metrics": metrics,
                "email_recall": email_recall,
            })
            per_ext_stats[f.suffix.lower()].append(metrics)
            per_ext_stats["blurred" if "blurred" in f.name.lower() else "clear"].append(metrics)

    # summary
    print("\n========== SUMMARY ==========")
    for ext, lst in per_ext_stats.items():
        if not lst: continue
        avg_rec = sum(m["recall"] for m in lst)/len(lst)
        avg_f1 = sum(m["f1"] for m in lst)/len(lst)
        avg_seq = sum(m["seq_ratio"] for m in lst)/len(lst)
        low = sum(1 for m in lst if m["recall"]<0.5)
        print(f"{ext:12} n={len(lst):2}  avg_rec={avg_rec:.3f} avg_f1={avg_f1:.3f} avg_seq={avg_seq:.3f}  low(<0.5)={low}")

    # save json
    out = Path(__file__).parent / "evaluation_new_resumes.json"
    with open(out, "w", encoding="utf-8") as fp:
        json.dump({"results": results, "failures": failures, "summary": {k: {"n":len(v),"avg_rec": sum(x["recall"] for x in v)/len(v) if v else 0} for k,v in per_ext_stats.items()}}, fp, indent=2)
    print(f"\nSaved detailed results to {out}")
    if failures:
        print(f"Failures: {len(failures)}")
        for f in failures[:10]:
            print(" ", f)

if __name__ == "__main__":
    main()
