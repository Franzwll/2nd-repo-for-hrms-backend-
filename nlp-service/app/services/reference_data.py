"""Loads reference data (skills, job roles, certifications) and normalizes
extracted values against it, classifying items as RECOGNIZED or UNRECOGNIZED.

Canonicalization pipeline (first hit wins):
1. exact normalized alias lookup
2. boundary-checked substring containment (longest key wins), so variants
   such as 'strong background in haccp compliance' resolve to HACCP
3. token-set containment: every token of a multi-word key appears in the
   value (word-order independent, e.g. 'safety food protocols' -> Food Safety)
4. fuzzy match (difflib ratio >= 0.86) for OCR noise such as
   'Pos System Operation' / 'HACCP compliancc' -> canonical entry
"""
import difflib
import json
import re
from functools import lru_cache
from typing import Dict, List, Optional, Tuple

from app import config

_FUZZY_MIN_LENGTH = 6
_FUZZY_CUTOFF = 0.86


def _load(filename: str) -> Dict[str, List[str]]:
    path = config.DATA_DIR / filename
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


@lru_cache(maxsize=1)
def skills_reference() -> Dict[str, List[str]]:
    return _load("skills.json")


@lru_cache(maxsize=1)
def job_roles_reference() -> Dict[str, List[str]]:
    return _load("job_roles.json")


@lru_cache(maxsize=1)
def certifications_reference() -> Dict[str, List[str]]:
    return _load("certifications.json")


class _AliasIndex:
    """Precomputed lookup structures for one reference mapping."""

    __slots__ = ("exact", "keys_by_length", "key_tokens", "key_list")

    def __init__(self, reference: Tuple[Tuple[str, Tuple[str, ...]], ...]):
        self.exact: Dict[str, str] = {}
        for canonical, aliases in reference:
            self.exact[canonical.lower()] = canonical
            for alias in aliases:
                self.exact[alias.lower()] = canonical
        # Longest first so substring containment prefers the most specific key.
        self.keys_by_length = sorted(self.exact.keys(), key=len, reverse=True)
        self.key_tokens = {k: frozenset(k.split()) for k in self.exact}
        self.key_list = list(self.exact.keys())


@lru_cache(maxsize=32)
def _index_for(reference: Tuple[Tuple[str, Tuple[str, ...]], ...]) -> _AliasIndex:
    return _AliasIndex(reference)


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def build_alias_index(reference: Dict[str, List[str]]) -> Dict[str, str]:
    """Backwards-compatible flat alias -> canonical mapping."""
    return dict(_index_for(_freeze(reference)).exact)


def _freeze(reference: Dict[str, List[str]]) -> Tuple[Tuple[str, Tuple[str, ...]], ...]:
    return tuple((k, tuple(v)) for k, v in reference.items())


def _boundary_contains(key: str, value: str) -> bool:
    """Word-boundary substring check without regex compilation overhead."""
    return f" {key} " in f" {value} " or f" {key} " in f" {value} ".replace("/", " ").replace(",", " ")


def canonicalize(value: str, reference: Dict[str, List[str]]) -> Optional[str]:
    """Returns the canonical reference entry matching `value`, else None."""
    if not value:
        return None
    index = _index_for(_freeze(reference))
    normalized = normalize_text(value)
    if not normalized:
        return None

    # 1. exact alias
    hit = index.exact.get(normalized)
    if hit:
        return hit

    # 2. boundary substring (longest key first)
    padded = f" {normalized} "
    for key in index.keys_by_length:
        if len(key) >= 4 and f" {key} " in padded:
            return index.exact[key]
        # allow punctuation-glued forms ("haccp," / "opera.")
        if len(key) >= 4 and re.search(rf"(^|\W){re.escape(key)}(\W|$)", normalized):
            return index.exact[key]

    # 3. token-set containment for multi-word keys (order-preserving:
    # key tokens must appear in the value as an ordered subsequence, so
    # "safety food protocols" does not falsely complete "safety protocols")
    value_tokens = normalized.split()
    if len(value_tokens) > 1:
        best_key = None
        best_len = 0
        for key, tokens in index.key_tokens.items():
            if len(tokens) < 2 or len(key) <= best_len:
                continue
            positions = []
            cursor = 0
            ok = True
            for token in key.split():
                found = -1
                for i in range(cursor, len(value_tokens)):
                    if value_tokens[i] == token:
                        found = i
                        break
                if found < 0:
                    ok = False
                    break
                positions.append(found)
                cursor = found + 1
            if ok and len(key) > best_len:
                best_key = key
                best_len = len(key)
        if best_key:
            return index.exact[best_key]

    # 4. fuzzy recovery for OCR noise
    if len(normalized) >= _FUZZY_MIN_LENGTH:
        close = difflib.get_close_matches(normalized, index.key_list, n=1, cutoff=_FUZZY_CUTOFF)
        if close:
            return index.exact[close[0]]

    return None


def classify_items(values: List[str], reference: Dict[str, List[str]]) -> Dict[str, List[str]]:
    recognized: List[str] = []
    unrecognized: List[str] = []
    seen = set()
    for raw in values:
        canonical = canonicalize(raw, reference)
        target = canonical or raw.strip()
        key = normalize_text(target)
        if key in seen:
            continue
        seen.add(key)
        if canonical:
            recognized.append(canonical)
        else:
            unrecognized.append(target)
    return {"recognized": sorted(set(recognized)), "unrecognized": sorted(set(unrecognized))}


def education_rank(label: str) -> int:
    normalized = normalize_text(label)
    for key, rank in config.EDUCATION_RANKS.items():
        if re.search(rf"\b{re.escape(key)}\b", normalized):
            return rank
    return 0


def merge_reference(
    bundled: Dict[str, List[str]], override: Optional[Dict[str, List[str]]]
) -> Dict[str, List[str]]:
    """Merges a caller-provided reference mapping over the bundled JSON data.

    The override fully replaces the bundled set for its data type when non-empty
    (the database is then the single source of truth for that type); otherwise
    the bundled seed data is used unchanged (resilience when Laravel/DB is not
    the provider, e.g. direct pipeline or smoke-test usage).
    """
    if not override:
        return bundled
    cleaned: Dict[str, List[str]] = {}
    for canonical, aliases in override.items():
        name = str(canonical).strip()
        if not name:
            continue
        alias_list = []
        for alias in aliases or []:
            text = str(alias).strip()
            if text and text.lower() != name.lower() and text not in alias_list:
                alias_list.append(text)
        cleaned[name] = alias_list
    return cleaned or bundled


def effective_references(
    override: Optional[Dict[str, Dict[str, List[str]]]],
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]], Dict[str, List[str]]]:
    """Returns (skills, job_roles, certifications) with optional DB-sourced overrides."""
    supplied = override or {}
    return (
        merge_reference(skills_reference(), supplied.get("skills")),
        merge_reference(job_roles_reference(), supplied.get("job_roles")),
        merge_reference(certifications_reference(), supplied.get("certifications")),
    )
