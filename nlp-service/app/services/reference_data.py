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

_FUZZY_MIN_LENGTH = 5
_FUZZY_CUTOFF = 0.82  # lowered from 0.86 to tolerate OCR noise (e.g. PROPESSIONAL, Houskeeping) — blurred scans need more permissive matching
# SequenceMatcher's ratio is bounded by 2*min(len(a), len(b)) / (len(a)+len(b)).
# Keys outside this length window can never reach the cutoff, so they can be
# skipped without changing which match wins.
_FUZZY_LENGTH_LOW = _FUZZY_CUTOFF / (2 - _FUZZY_CUTOFF)
_FUZZY_LENGTH_HIGH = (2 - _FUZZY_CUTOFF) / _FUZZY_CUTOFF
_MEMO_MAX = 4096


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

    __slots__ = ("exact", "keys_by_length", "key_token_items", "key_list", "memo")

    def __init__(self, reference: Tuple[Tuple[str, Tuple[str, ...]], ...]):
        self.exact: Dict[str, str] = {}
        for canonical, aliases in reference:
            self.exact[canonical.lower()] = canonical
            for alias in aliases:
                self.exact[alias.lower()] = canonical
        # Longest first so substring containment prefers the most specific key.
        self.keys_by_length = sorted(self.exact.keys(), key=len, reverse=True)
        self.key_list = list(self.exact.keys())
        # (key, tokens, first token, token count) in the same insertion order
        # as before, so equal-length token-set matches still resolve the same.
        self.key_token_items = []
        for key in self.exact:
            parts = key.split()
            self.key_token_items.append((key, parts, parts[0], len(parts)))
        self.memo: Dict[str, Optional[str]] = {}


@lru_cache(maxsize=32)
def _index_for(reference: Tuple[Tuple[str, Tuple[str, ...]], ...]) -> _AliasIndex:
    return _AliasIndex(reference)


# Building the frozen tuple on every canonicalize() call is expensive (the
# bundled skill/role/cert lists are large). Requests reuse the same dict
# object, so resolve it to its index once and keep the dict alive to make the
# id() safe. Overrides create a new dict per request and fall back to the
# value-keyed cache above.
_INDEX_BY_IDENTITY: Dict[int, Tuple[Dict[str, List[str]], _AliasIndex]] = {}
_INDEX_IDENTITY_MAX = 16


def _index_for_reference(reference: Dict[str, List[str]]) -> _AliasIndex:
    cached = _INDEX_BY_IDENTITY.get(id(reference))
    if cached is not None and cached[0] is reference:
        return cached[1]
    index = _index_for(_freeze(reference))
    if len(_INDEX_BY_IDENTITY) >= _INDEX_IDENTITY_MAX:
        _INDEX_BY_IDENTITY.clear()
    _INDEX_BY_IDENTITY[id(reference)] = (reference, index)
    return index


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


def _is_word_char(char: str) -> bool:
    """Equivalent to regex \\w for the boundary check below."""
    return char.isalnum() or char == "_"


def _boundary_match(key: str, value: str) -> bool:
    """Matches r"(^|\\W)key(\\W|$)" without compiling a regex per key."""
    start = 0
    key_len = len(key)
    value_len = len(value)
    while True:
        idx = value.find(key, start)
        if idx < 0:
            return False
        before_ok = idx == 0 or not _is_word_char(value[idx - 1])
        end = idx + key_len
        after_ok = end == value_len or not _is_word_char(value[end])
        if before_ok and after_ok:
            return True
        start = idx + 1


def canonicalize(value: str, reference: Dict[str, List[str]]) -> Optional[str]:
    """Returns the canonical reference entry matching `value`, else None."""
    if not value:
        return None
    normalized = normalize_text(value)
    if not normalized:
        return None

    index = _index_for_reference(reference)
    memo = index.memo
    try:
        return memo[normalized]
    except KeyError:
        pass

    result = _canonicalize_normalized(normalized, index)
    if len(memo) >= _MEMO_MAX:
        # Bounded on purpose: the service is long-running and values come
        # from user documents, so an unbounded memo would leak memory.
        memo.clear()
    memo[normalized] = result
    return result


def _canonicalize_normalized(normalized: str, index: _AliasIndex) -> Optional[str]:
    # 1. exact alias
    hit = index.exact.get(normalized)
    if hit:
        return hit

    # 2. boundary substring (longest key first)
    padded = f" {normalized} "
    for key in index.keys_by_length:
        # keys_by_length is descending, so everything after this is shorter.
        if len(key) < 4:
            break
        if f" {key} " in padded:
            return index.exact[key]
        # allow punctuation-glued forms ("haccp," / "opera.").
        # The substring pre-check avoids running the boundary scan for keys
        # that cannot possibly match (the vast majority on free-text values).
        if key in normalized and _boundary_match(key, normalized):
            return index.exact[key]

    # 3. token-set containment for multi-word keys (order-preserving:
    # key tokens must appear in the value as an ordered subsequence, so
    # "safety food protocols" does not falsely complete "safety protocols")
    value_tokens = re.sub(r"[(),/|&.:;\"'\-_–—\[\]{}]", " ", normalized).split()
    if len(value_tokens) > 1:
        value_token_set = set(value_tokens)
        best_key = None
        best_len = 0
        for key, parts, first_token, token_count in index.key_token_items:
            if token_count < 2 or len(key) <= best_len:
                continue
            # Both conditions are necessary for an ordered-subsequence match,
            # and filtering on them cannot change which key wins.
            if token_count > len(value_tokens) or first_token not in value_token_set:
                continue
            cursor = 0
            ok = True
            for token in parts:
                found = -1
                for i in range(cursor, len(value_tokens)):
                    if value_tokens[i] == token:
                        found = i
                        break
                if found < 0:
                    ok = False
                    break
                cursor = found + 1
            if ok and len(key) > best_len:
                best_key = key
                best_len = len(key)
        if best_key:
            return index.exact[best_key]

    # 4. fuzzy recovery for OCR noise
    if len(normalized) >= _FUZZY_MIN_LENGTH:
        length = len(normalized)
        low = int(length * _FUZZY_LENGTH_LOW)
        high = int(length * _FUZZY_LENGTH_HIGH) + 2
        # Preserve key_list order so difflib's tie-breaking is unchanged.
        candidates = [key for key in index.key_list if low <= len(key) <= high]
        if candidates:
            close = difflib.get_close_matches(
                normalized, candidates, n=1, cutoff=_FUZZY_CUTOFF
            )
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
