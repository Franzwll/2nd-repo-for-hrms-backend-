import os
import sys
import io
import math
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
import pypdfium2 as pdfium
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def safe_path(p):
    """Handles Windows 260-char MAX_PATH limit by adding \\?\ prefix for absolute paths."""
    abs_p = os.path.abspath(p)
    if os.name == 'nt' and not abs_p.startswith('\\\\?\\'):
        return '\\\\?\\' + abs_p
    return abs_p

# -------------------------------------------------------------
# Font Registration
# -------------------------------------------------------------
font_map = {
    'Arial': 'C:\\Windows\\Fonts\\arial.ttf',
    'Arial-Bold': 'C:\\Windows\\Fonts\\arialbd.ttf',
    'Arial-Italic': 'C:\\Windows\\Fonts\\ariali.ttf',
    'Calibri': 'C:\\Windows\\Fonts\\calibri.ttf',
    'Calibri-Bold': 'C:\\Windows\\Fonts\\calibrib.ttf',
    'Calibri-Italic': 'C:\\Windows\\Fonts\\calibrii.ttf',
    'Georgia': 'C:\\Windows\\Fonts\\georgia.ttf',
    'Georgia-Bold': 'C:\\Windows\\Fonts\\georgiab.ttf',
    'Georgia-Italic': 'C:\\Windows\\Fonts\\georgiai.ttf',
    'SegoeUI': 'C:\\Windows\\Fonts\\segoeui.ttf',
    'SegoeUI-Bold': 'C:\\Windows\\Fonts\\segoeuib.ttf',
    'SegoeUI-Italic': 'C:\\Windows\\Fonts\\segoeuii.ttf',
    'Times': 'C:\\Windows\\Fonts\\times.ttf',
    'Times-Bold': 'C:\\Windows\\Fonts\\timesbd.ttf',
    'Times-Italic': 'C:\\Windows\\Fonts\\timesi.ttf'
}

for fname, fpath in font_map.items():
    if os.path.exists(fpath):
        try:
            pdfmetrics.registerFont(TTFont(fname, fpath))
        except Exception:
            pass

F_SANS = 'SegoeUI' if 'SegoeUI' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
F_SANS_BOLD = 'SegoeUI-Bold' if 'SegoeUI-Bold' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold'
F_SANS_ITALIC = 'SegoeUI-Italic' if 'SegoeUI-Italic' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Oblique'

F_SERIF = 'Georgia' if 'Georgia' in pdfmetrics.getRegisteredFontNames() else 'Times-Roman'
F_SERIF_BOLD = 'Georgia-Bold' if 'Georgia-Bold' in pdfmetrics.getRegisteredFontNames() else 'Times-Bold'
F_SERIF_ITALIC = 'Georgia-Italic' if 'Georgia-Italic' in pdfmetrics.getRegisteredFontNames() else 'Times-Italic'

F_CALIBRI = 'Calibri' if 'Calibri' in pdfmetrics.getRegisteredFontNames() else F_SANS
F_CALIBRI_BOLD = 'Calibri-Bold' if 'Calibri-Bold' in pdfmetrics.getRegisteredFontNames() else F_SANS_BOLD
F_CALIBRI_ITALIC = 'Calibri-Italic' if 'Calibri-Italic' in pdfmetrics.getRegisteredFontNames() else F_SANS_ITALIC

F_ARIAL = 'Arial' if 'Arial' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
F_ARIAL_BOLD = 'Arial-Bold' if 'Arial-Bold' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold'
F_ARIAL_ITALIC = 'Arial-Italic' if 'Arial-Italic' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Oblique'

F_TIMES = 'Times' if 'Times' in pdfmetrics.getRegisteredFontNames() else 'Times-Roman'
F_TIMES_BOLD = 'Times-Bold' if 'Times-Bold' in pdfmetrics.getRegisteredFontNames() else 'Times-Bold'
F_TIMES_ITALIC = 'Times-Italic' if 'Times-Italic' in pdfmetrics.getRegisteredFontNames() else 'Times-Italic'

def draw_wrapped(c, text, x, y, max_w, font_n, font_s, color_obj, line_h):
    c.setFont(font_n, font_s)
    c.setFillColor(color_obj)
    words = text.split(' ')
    line = ""
    for word in words:
        test = line + " " + word if line else word
        if c.stringWidth(test, font_n, font_s) < max_w:
            line = test
        else:
            c.drawString(x, y, line)
            y -= line_h
            line = word
    if line:
        c.drawString(x, y, line)
        y -= line_h
    return y

def pdf_to_image(pdf_path, output_image_path, scale=2, format="PNG", quality=95):
    """Render first page of PDF to image at 200 DPI."""
    sp_pdf = safe_path(pdf_path)
    sp_img = safe_path(output_image_path)
    pdf = pdfium.PdfDocument(sp_pdf)
    page = pdf[0]
    img = page.render(scale=scale).to_pil()
    if format.upper() in ["JPG", "JPEG"]:
        img = img.convert("RGB")
        img.save(sp_img, format="JPEG", quality=quality)
    else:
        img.save(sp_img, format="PNG")
    pdf.close()
    return output_image_path

def apply_uniform_blur(image_path, output_blurred_path, blur_radius=1.8, format="PNG", quality=85):
    """
    Applies light, UNIFORM degradation across the ENTIRE image.
    Simulates slight defocus, scan blur, and mild compression without black boxes or selective masking.
    Remains partially OCR-readable.
    """
    sp_in = safe_path(image_path)
    sp_out = safe_path(output_blurred_path)
    img = Image.open(sp_in)
    blurred = img.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    enhancer = ImageEnhance.Contrast(blurred)
    blurred = enhancer.enhance(1.05)
    if format.upper() in ["JPG", "JPEG"]:
        blurred = blurred.convert("RGB")
        blurred.save(sp_out, format="JPEG", quality=quality)
    else:
        blurred.save(sp_out, format="PNG")
    return output_blurred_path

def apply_torn_scan_defect(pdf_path, output_pdf_path, torn_box=(220, 290, 560, 340)):
    """
    Renders PDF to image, applies realistic torn/severed paper effect over recipient name area,
    and flattens back into a PDF to test UNABLE_TO_VERIFY.
    """
    sp_in = safe_path(pdf_path)
    sp_out = safe_path(output_pdf_path)
    pdf = pdfium.PdfDocument(sp_in)
    page = pdf[0]
    img = page.render(scale=2).to_pil().convert("RGBA")
    
    # Scale box coordinates by 2
    bx0, by0, bx1, by1 = [coord * 2 for coord in torn_box]
    draw = ImageDraw.Draw(img)
    
    import random
    points = []
    curr_x = bx0
    while curr_x < bx1:
        points.append((curr_x, by0 + random.randint(-4, 4)))
        curr_x += 12
    points.append((bx1, by0))
    curr_y = by0
    while curr_y < by1:
        points.append((bx1 + random.randint(-4, 4), curr_y))
        curr_y += 12
    points.append((bx1, by1))
    curr_x = bx1
    while curr_x > bx0:
        points.append((curr_x, by1 + random.randint(-4, 4)))
        curr_x -= 12
    points.append((bx0, by1))
    curr_y = by1
    while curr_y > by0:
        points.append((bx0 + random.randint(-4, 4), curr_y))
        curr_y -= 12
    
    draw.polygon(points, fill=(245, 245, 245, 255), outline=(210, 210, 210, 255))
    
    for step in range(bx0, bx1, 16):
        draw.line([(step, by0), (step + 10, by1)], fill=(225, 225, 225, 180), width=1)

    img_rgb = img.convert("RGB")
    img_rgb.save(sp_out, "PDF", resolution=150.0)
    pdf.close()
    return output_pdf_path
