"""Multi-format resume text extraction: PDF, DOCX, image (OCR) and plain text.

Every extraction returns a structured result with the method used and a
processing status so failures are never silent.
"""
import re
import shutil
from pathlib import Path
from typing import Dict, List, Optional

from app import config


class ExtractionError(Exception):
    def __init__(self, message: str, status: str = config.STATUS_FAILED):
        super().__init__(message)
        self.status = status


def _locate_tesseract() -> bool:
    """Returns True when the Tesseract OCR binary can be located."""
    if shutil.which("tesseract"):
        return True
    for candidate in (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ):
        if Path(candidate).exists():
            import pytesseract

            pytesseract.pytesseract.tesseract_cmd = candidate
            return True
    return False


def _pdf_text_pdfplumber(path: Path) -> tuple:
    """Extracts text per page with pdfplumber. Returns (text, page_count)."""
    import pdfplumber

    pages: List[str] = []
    with pdfplumber.open(str(path)) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text() or "")
        page_count = len(pdf.pages)
    return "\n".join(pages), page_count


def _pdf_text_pdfium(path: Path) -> Optional[str]:
    """Extracts text with pypdfium2's textpage API when available.

    pypdfium2 preserves per-text-object line breaks, which keeps two-column
    layouts (sidebar contact blocks, banner names) on separate lines where
    pdfplumber's layout analysis merges them into single interleaved rows.
    """
    try:
        import pypdfium2 as pdfium
    except ImportError:
        return None

    try:
        doc = pdfium.PdfDocument(str(path))
        pages: List[str] = []
        try:
            for page in doc:
                textpage = page.get_textpage()
                try:
                    pages.append(textpage.get_text_bounded() or "")
                finally:
                    textpage.close()
        finally:
            doc.close()
    except Exception:
        return None
    return "\n".join(pages).replace("\r\n", "\n").replace("\r", "\n")


DATE_HINT_RE = re.compile(
    r"(?:(?:19|20)\d{2}|[A-Za-z]{3,9}\.?\s+(?:19|20)\d{2})\s*(?:-|–|—|to|until|\?|\ufffd)\s*(?:(?:19|20)\d{2}|present|current|now)\b",
    re.I,
)


def _structure_score(text: str) -> int:
    """Heuristic quality score for extracted resume text.

    Values inline date-range preservation, contact info, line separation,
    and content volume; penalizes very long lines, which indicate merged
    multi-column rows.
    """
    if not text:
        return 0
    lines = [ln for ln in text.split("\n") if ln.strip()]
    alnum = sum(ch.isalnum() for ch in text)
    long_lines = sum(1 for ln in lines if len(ln) > 150)
    dates_count = len(DATE_HINT_RE.findall(text))
    return (
        min(len(lines), 70)
        + min(alnum // 200, 30)
        + (8 if EMAIL_HINT_RE.search(text) else 0)
        + 12 * min(dates_count, 5)
        - 4 * min(long_lines, 6)
    )


EMAIL_HINT_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+")


_HEADER_OR_BULLET_RE = re.compile(
    r"^(?:professional\s+|work\s+|core\s+|technical\s+)?(?:summary|profile|objective|skills|experience|education|certifications?|certificates?|trainings?|seminars?|languages?|awards?|references?|competencies|history)\b|^[\u2022\u25cf\u25aa\u2023\u2043\u25b8\u25b9\u25ba\u25c6\u25c7\u25a0\u25a1\u25cb\u25b6o\-–—*●•✓▸◆►▹?]",
    re.I,
)


def _merge_unique_lines(base: str, other: str, max_len: int = 90) -> str:
    """Appends short unique contact/title lines from `other` missing from `base`.

    Excludes section headers and bullet points so the base document's section
    structure is never corrupted with duplicate trailing headings.
    """
    seen = set()
    for ln in base.split("\n"):
        norm = " ".join(ln.split()).strip().lower()
        if norm:
            seen.add(norm)

    additions: List[str] = []
    for ln in other.split("\n"):
        norm = " ".join(ln.split()).strip()
        if not norm or len(norm) > max_len:
            continue
        if _HEADER_OR_BULLET_RE.search(norm):
            continue
        key = norm.lower()
        if key in seen:
            continue
        # Skip near-duplicates: a base line that fully contains this one.
        if any(key in existing for existing in seen):
            continue
        seen.add(key)
        additions.append(norm)

    if not additions:
        return base
    return base + "\n" + "\n".join(additions)


def extract_pdf(path: Path) -> Dict:
    plumber_text, page_count = _pdf_text_pdfplumber(path)

    pdfium_text = _pdf_text_pdfium(path)
    if plumber_text.strip() or (pdfium_text and pdfium_text.strip()):
        # Choose the better-structured layer as the base, then merge short
        # unique lines (names, contact rows, titles) from the other layer.
        if pdfium_text and pdfium_text.strip():
            if _structure_score(pdfium_text) >= _structure_score(plumber_text):
                base, base_name, other_name = pdfium_text, "pypdfium2", "pdfplumber"
            else:
                base, base_name, other_name = plumber_text, "pdfplumber", "pypdfium2"
            merged = _merge_unique_lines(base, pdfium_text if base_name == "pdfplumber" else plumber_text)
            method = f"pdf-text ({base_name}+{other_name})" if merged != base else base_name
            combined = merged.strip()
            if combined:
                return {"text": combined, "method": method, "pages": page_count}

        combined = plumber_text.strip()
        if combined:
            return {"text": combined, "method": "pdfplumber", "pages": page_count}

    # Scanned/image-based PDF: no text layer. Rasterize every page and
    # recover the text with OCR instead of failing.
    ocr_pages, warnings, renderer = _pdf_ocr_fallback(path)
    if any(p.strip() for p in ocr_pages):
        return {
            "text": "\n".join(ocr_pages).strip(),
            "method": f"pdf-ocr ({renderer}+tesseract)",
            "pages": page_count,
            "warnings": [
                "Scanned or image-based PDF: text recovered via OCR; accuracy may be lower.",
                *warnings,
            ],
        }

    return {"text": "", "method": "pdfplumber", "pages": page_count}


def _rasterize_pdf(path: Path, zoom: float) -> tuple:
    """Renders each PDF page to a PIL image.

    Uses pypdfium2 when available (pure wheel, no native setup) and falls
    back to pymupdf otherwise. Returns (images, renderer_name).
    """
    from PIL import Image

    try:
        import pypdfium2 as pdfium
    except ImportError:
        pdfium = None

    if pdfium is not None:
        images = []
        doc = pdfium.PdfDocument(str(path))
        try:
            for page in doc:
                images.append(page.render(scale=zoom).to_pil())
        finally:
            doc.close()
        return images, "pypdfium2"

    try:
        import pymupdf
    except ImportError as exc:
        raise ExtractionError(
            "This PDF has no text layer (scanned document) and no PDF rasterizer "
            f"is installed. Install 'pypdfium2' (or 'pymupdf') to process it: {exc}",
            config.STATUS_PARTIALLY_PROCESSED,
        )

    images = []
    doc = pymupdf.open(str(path))
    for page in doc:
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom))
        images.append(Image.frombytes("RGB", (pix.width, pix.height), pix.samples))
    doc.close()
    return images, "pymupdf"


def _ocr_with_regions(image) -> str:
    """Full-page OCR plus targeted region passes for styled header banners.

    Some resume templates render the name/contact block inside a colored
    banner. Full-page layout analysis often discards such banners as
    graphics, and Tesseract's global binarization merges dark text into a
    mid-tone banner background. Three passes fix this reliably:
      1. name zone crop (large display-font names),
      2. header strip binarized with a dark-text threshold,
      3. the full page.
    Results merge in reading order with line-level deduplication.
    """
    import pytesseract
    from PIL import ImageOps

    width, height = image.size
    collected: List[str] = []
    seen = set()

    def add(text: str) -> None:
        for line in (text or "").splitlines():
            norm = " ".join(line.split()).strip()
            if len(norm) < 4:
                continue
            key = norm.lower()
            if key not in seen:
                seen.add(key)
                collected.append(norm)

    # 1) Name zone: large display-font names inside header banners.
    name_zone = image.crop((0, 0, int(width * 0.45), int(height * 0.13)))
    add(pytesseract.image_to_string(name_zone, config="--psm 6"))

    # 2) Header strip, binarized: dark text -> black, colored banner and
    #    page background -> white. Recovers contact lines that vanish in
    #    full-page binarization.
    header = image.crop((0, 0, width, int(height * 0.20)))
    header_bw = ImageOps.grayscale(header).point(lambda x: 0 if x < 120 else 255)
    add(pytesseract.image_to_string(header_bw))

    # 3) Full page: body content.
    add(pytesseract.image_to_string(image))

    return "\n".join(collected)


def _pdf_ocr_fallback(path: Path) -> tuple[List[str], List[str], str]:
    """Rasterizes PDF pages and OCRs each with Tesseract.

    Raises ExtractionError when a dependency is unavailable so the failure
    is explicit rather than silent.
    """
    try:
        import pytesseract  # noqa: F401 - availability check for the helpers
    except ImportError as exc:
        raise ExtractionError(
            f"OCR dependency pytesseract is not installed: {exc}",
            config.STATUS_PARTIALLY_PROCESSED,
        )

    if not _locate_tesseract():
        raise ExtractionError(
            "This PDF has no text layer (scanned document) and no OCR engine is "
            "available on this server. Install Tesseract OCR to process it.",
            config.STATUS_PARTIALLY_PROCESSED,
        )

    warnings: List[str] = []
    texts: List[str] = []
    zoom = 200 / 72  # render at ~200 dpi
    try:
        images, renderer = _rasterize_pdf(path, zoom)
        for page_number, image in enumerate(images, start=1):
            page_text = _ocr_with_regions(image)
            if not page_text.strip():
                warnings.append(f"Page {page_number}: OCR produced no readable text.")
            texts.append(page_text)
    except ExtractionError:
        raise
    except Exception as exc:
        raise ExtractionError(f"PDF OCR fallback failed: {exc}")

    return texts, warnings, renderer


def extract_docx(path: Path) -> Dict:
    import docx
    from docx.table import Table
    from docx.text.paragraph import Paragraph

    document = docx.Document(str(path))
    parts: List[str] = []

    for element in document.element.body:
        if element.tag.endswith("p"):
            p = Paragraph(element, document)
            text = p.text.strip()
            if text:
                parts.append(text)
        elif element.tag.endswith("tbl"):
            t = Table(element, document)
            for row in t.rows:
                seen_cells = set()
                unique_cells = []
                for c in row.cells:
                    ctext = c.text.strip()
                    if ctext and ctext not in seen_cells:
                        seen_cells.add(ctext)
                        unique_cells.append(ctext)

                # In 2-column sidebar layouts, if cell 1 has the name header and cell 0 is sidebar (Contact/Skills),
                # place cell 1 first so name & summary come in standard reading order.
                if len(unique_cells) == 2:
                    c0_first = unique_cells[0].splitlines()[0].strip().upper()
                    c1_first = unique_cells[1].splitlines()[0].strip().upper()
                    sidebar_prefixes = ("CONTACT", "GET IN TOUCH", "CORE SKILLS", "SKILLS")
                    if any(c0_first.startswith(h) for h in sidebar_prefixes) and not any(
                        c1_first.startswith(h) for h in ("CONTACT", "GET IN TOUCH")
                    ):
                        unique_cells = [unique_cells[1], unique_cells[0]]

                for ctext in unique_cells:
                    parts.append(ctext)

    return {"text": "\n\n".join(parts).strip(), "method": "python-docx", "pages": 1}


def extract_image(path: Path) -> Dict:
    try:
        import pytesseract
        from PIL import Image
    except ImportError as exc:
        raise ExtractionError(f"OCR dependencies unavailable: {exc}", config.STATUS_PARTIALLY_PROCESSED)

    if not _locate_tesseract():
        raise ExtractionError(
            "OCR engine not available on this server. Image resumes require Tesseract OCR.",
            config.STATUS_PARTIALLY_PROCESSED,
        )

    image = Image.open(str(path))
    image.load()
    text = _ocr_with_regions(image)
    return {"text": text.strip(), "method": "tesseract-ocr", "pages": 1}


def extract_txt(path: Path) -> Dict:
    raw = path.read_bytes()
    for encoding in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            return {"text": raw.decode(encoding).strip(), "method": "plain-text", "pages": 1}
        except UnicodeDecodeError:
            continue
    raise ExtractionError("Unable to decode plain-text resume.")


SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def detect_extension(filename: str) -> str:
    return Path(filename or "").suffix.lower()


def is_supported(filename: str) -> bool:
    ext = detect_extension(filename)
    return ext in SUPPORTED_EXTENSIONS or ext in {
        ".jpg", ".jpeg", ".png", ".bmp", ".gif", ".tif", ".tiff", ".webp",
    }


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".tif", ".tiff", ".webp"}


def extract_text(path: Path, filename: str) -> Dict:
    """Dispatches to the right extractor. Raises ExtractionError on failure.

    Returns dict: text, method, pages, extension, warnings.
    """
    ext = detect_extension(filename)
    warnings: List[str] = []

    if not filename:
        raise ExtractionError("Resume file has no name; unable to determine format.")
    if not path.exists():
        raise ExtractionError("Stored resume file could not be found on disk.")

    try:
        if ext == ".pdf":
            result = extract_pdf(path)
        elif ext == ".docx":
            result = extract_docx(path)
        elif ext == ".txt":
            result = extract_txt(path)
        elif ext in IMAGE_EXTENSIONS:
            result = extract_image(path)
            warnings.append("Text extracted from image using OCR; accuracy may be lower.")
        else:
            raise ExtractionError(
                f"Unsupported resume format '{ext}'. Supported: PDF, DOCX, TXT and common images."
            )
    except ExtractionError:
        raise

    if not result.get("text"):
        raise ExtractionError(
            f"No readable text could be extracted from '{filename}'.",
            config.STATUS_FAILED,
        )

    result.update({"extension": ext, "warnings": warnings})
    return result


_DIGIT_ONLY = re.compile(r"\D+")


def count_digits(value: str) -> int:
    return len(_DIGIT_ONLY.sub("", value))
