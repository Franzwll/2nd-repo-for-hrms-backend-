"""Text cleaning and preprocessing applied to every extracted resume.

Handles the noise profiles of all four extraction sources:
- PDF text layers: ligatures (fi/fl), fancy quotes/dashes, soft hyphens,
  replacement characters from broken encodings (UTF-8 read as cp1252).
- DOCX: control chars, stray bullets.
- OCR: contact icons, bullet glyphs misread as letters, mojibake around
  Philippine place names (Parañaque, Las Piñas, ...), letter-spaced text.
"""
import re
import unicodedata
from typing import Dict

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_MULTIPLE_SPACES = re.compile(r"[^\S\r\n]+")
_HYPHEN_LINEBREAK = re.compile(r"(\w)-\n(\w)")
_MULTIPLE_NEWLINES = re.compile(r"\n{3,}")
_BULLET_PREFIX = re.compile(
    r"^\s*[\u2022\u25cf\u25aa\u2023\u2043\u25b8\u25b9\u25ba\u25c6\u25c7\u25a0\u25a1\u25cb\u25b6\u25ab\u2013\u2014o\-–—*●•✓▸◆►▹·▪▫]+\s*",
    re.MULTILINE,
)
_CONTACT_ICONS = re.compile(r"[📍📞📱✉📧🔗🌐🏠]\s*")
_ZERO_WIDTH = re.compile(r"[\u200b\u200c\u200d\ufeff\u00ad]")

# Ligature and typographic normalizations applied before anything else.
_LIGATURES = {
    "\ufb00": "ff", "\ufb01": "fi", "\ufb02": "fl", "\ufb03": "ffi", "\ufb04": "ffl",
}
_QUOTES_DASHES = {
    "\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
    "\u2013": "-", "\u2014": "-", "\u2212": "-",
}

# UTF-8 text decoded as cp1252 produces "Ã±" for "ñ" etc. Repair the
# Philippine-specific sequences that appear in addresses.
_MOJIBAKE_REPAIRS = [
    (re.compile(r"ParaÃ±aque|ParaÃ•aque|ParaaÃ±aque", re.I), "Parañaque"),
    (re.compile(r"Las\s+PiÃ±as|Las\s+PiÃ‘as", re.I), "Las Piñas"),
    (re.compile(r"DasmariÃ±as", re.I), "Dasmariñas"),
    (re.compile(r"SeÃ±or", re.I), "Señor"),
    (re.compile(r"PeÃ±a", re.I), "Peña"),
]

# Replacement characters inside known PH place words (OCR / encoding loss).
_PLACE_REPAIRS = [
    (re.compile(r"\bPara[\ufffd?@°§*]a?que\b", re.I), "Parañaque"),
    (re.compile(r"\bLas\s+Pi[\ufffd?@°§*]as\b", re.I), "Las Piñas"),
    (re.compile(r"\bDasmari[\ufffd?@°§*]as\b", re.I), "Dasmariñas"),
    (re.compile(r"\bMalabon\b", re.I), "Malabon"),
    (re.compile(r"\bS\u2019more\b", re.I), "S'more"),
]

# A replacement char sandwiched between digits is usually a lost range dash
# (e.g. date ranges "2020 ? 2022").
_REPL_BETWEEN_DIGITS = re.compile(r"(?<=\d)\s*[\ufffd?]\s*(?=\d)")


def preprocess(raw_text: str) -> Dict:
    """Cleans raw extracted text.

    Returns dict: cleaned_text, original_length, cleaned_length.
    """
    if not raw_text:
        return {"cleaned_text": "", "original_length": 0, "cleaned_length": 0}

    text = unicodedata.normalize("NFKC", raw_text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = _CONTROL_CHARS.sub("", text)
    text = _ZERO_WIDTH.sub("", text)
    text = _CONTACT_ICONS.sub("", text)

    for src, dst in _LIGATURES.items():
        text = text.replace(src, dst)
    for src, dst in _QUOTES_DASHES.items():
        text = text.replace(src, dst)

    for pattern, replacement in _MOJIBAKE_REPAIRS:
        text = pattern.sub(replacement, text)
    for pattern, replacement in _PLACE_REPAIRS:
        text = pattern.sub(replacement, text)

    # Replacement characters: between digits assume a lost range dash;
    # inside PH place words the repairs above already handled the common
    # cases; anything else degrades to a plain dash.
    text = _REPL_BETWEEN_DIGITS.sub(" - ", text)
    text = re.sub(r"Para[\ufffd?]aque", "Parañaque", text, flags=re.I)
    text = re.sub(r"(?<=\w|\d)\s*[\ufffd]\s*(?=\w|\d)", " - ", text)
    text = text.replace("\ufffd", "-")

    text = _HYPHEN_LINEBREAK.sub(r"\1\2", text)
    # Join date ranges split across linebreaks: "June 2022 - \n Present" -> "June 2022 - Present"
    text = re.sub(
        r"((?:(?:19|20)\d{2}|[A-Za-z]{3,9}\.?\s+(?:19|20)\d{2})\s*(?:-|–|—|to|until|\?|\ufffd))\s*\n\s*((?:[A-Za-z]{3,9}\.?\s+)?(?:(?:19|20)\d{2}|present|current|now)\b)",
        r"\1 \2",
        text,
        flags=re.I,
    )
    text = _MULTIPLE_SPACES.sub(" ", text)

    # Process lines: strip trailing/leading spaces and bullet symbols
    cleaned_lines = []
    for line in text.split("\n"):
        line_str = line.strip()
        if not line_str:
            cleaned_lines.append("")
            continue
        line_clean = _BULLET_PREFIX.sub("", line_str).strip()
        cleaned_lines.append(line_clean)

    text = "\n".join(cleaned_lines)
    text = _MULTIPLE_NEWLINES.sub("\n\n", text)

    return {
        "cleaned_text": text.strip(),
        "original_length": len(raw_text),
        "cleaned_length": len(text.strip()),
    }
