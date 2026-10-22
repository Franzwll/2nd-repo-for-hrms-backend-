#!/usr/bin/env python3
"""Generate the reference Fire Safety & Emergency Response handbook PDF.

This produces a realistic, properly paginated multi-page PDF with a real text
layer (so the NLP extractor and the AI quiz generator can read it). The content
is synthetic but modelled on a hotel fire-safety SOP aligned to RA 9514.

Run from the repository root:

    python backend-laravel/scripts/generate-fire-safety-handbook.py

Output:

    backend-laravel/storage/app/public/handbooks/fire-safety.pdf
"""

from __future__ import annotations

import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

# ---------------------------------------------------------------------------
# Paths and constants
# ---------------------------------------------------------------------------

BACKEND_ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = BACKEND_ROOT / "storage" / "app" / "public" / "handbooks"
OUT_FILE = OUT_DIR / "fire-safety.pdf"

DOC_CODE = "OS-HR-SAF-003"
DOC_REV = "4.0"
DOC_DATE = "01 October 2026"
PROPERTY = "Oxford Suites Hotel & Residences"
PROPERTY_HTML = PROPERTY.replace("&", "&amp;")

INK = colors.HexColor("#1f2937")
MUTED = colors.HexColor("#6b7280")
RULE = colors.HexColor("#d1d5db")
RED = colors.HexColor("#b91c1c")
RED_DARK = colors.HexColor("#7f1d1d")
PALE = colors.HexColor("#f3f4f6")
PALE_RED = colors.HexColor("#fef2f2")

PAGE_W, PAGE_H = A4
LEFT = RIGHT = 22 * mm
TOP = 22 * mm
BOTTOM = 20 * mm
FRAME_W = PAGE_W - LEFT - RIGHT


# ---------------------------------------------------------------------------
# Styles
# ---------------------------------------------------------------------------


def build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    styles: dict[str, ParagraphStyle] = {}

    styles["Body"] = ParagraphStyle(
        "Body",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=9.7,
        leading=14,
        textColor=INK,
        alignment=TA_JUSTIFY,
        spaceAfter=5,
    )
    styles["BodyTight"] = ParagraphStyle(
        "BodyTight", parent=styles["Body"], spaceAfter=1
    )
    styles["H1"] = ParagraphStyle(
        "H1",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=17,
        leading=21,
        textColor=RED_DARK,
        spaceBefore=4,
        spaceAfter=8,
        keepWithNext=1,
    )
    styles["H2"] = ParagraphStyle(
        "H2",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11.5,
        leading=15,
        textColor=INK,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=1,
    )
    styles["H3"] = ParagraphStyle(
        "H3",
        parent=base["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=9.9,
        leading=13,
        textColor=RED_DARK,
        spaceBefore=7,
        spaceAfter=2,
        keepWithNext=1,
    )
    styles["Bullet"] = ParagraphStyle(
        "Bullet",
        parent=styles["Body"],
        leftIndent=13,
        bulletIndent=3,
        spaceAfter=2.5,
    )
    styles["Small"] = ParagraphStyle(
        "Small",
        parent=styles["Body"],
        fontSize=8.3,
        leading=11,
        textColor=MUTED,
        spaceAfter=3,
    )
    styles["Caption"] = ParagraphStyle(
        "Caption",
        parent=base["BodyText"],
        fontName="Helvetica-Oblique",
        fontSize=8.2,
        leading=11,
        textColor=MUTED,
        spaceBefore=2,
        spaceAfter=8,
    )
    styles["TableCell"] = ParagraphStyle(
        "TableCell",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=8.4,
        leading=11,
        textColor=INK,
        spaceAfter=0,
    )
    styles["TableHead"] = ParagraphStyle(
        "TableHead",
        parent=styles["TableCell"],
        fontName="Helvetica-Bold",
        textColor=colors.white,
    )
    styles["TOCHead"] = ParagraphStyle(
        "TOCHead",
        parent=styles["H1"],
        spaceBefore=0,
    )
    return styles


ST = build_styles()


# ---------------------------------------------------------------------------
# Flowable helpers
# ---------------------------------------------------------------------------


def body(text: str, style: str = "Body") -> Paragraph:
    return Paragraph(text, ST[style])


def bullets(items: list[str]) -> list[Paragraph]:
    return [Paragraph(t, ST["Bullet"], bulletText="\u2022") for t in items]


def numbered(items: list[str]) -> list[Paragraph]:
    return [
        Paragraph(t, ST["Bullet"], bulletText=f"{i}.")
        for i, t in enumerate(items, start=1)
    ]


def h1(text: str) -> Paragraph:
    return Paragraph(text, ST["H1"])


def h2(text: str) -> Paragraph:
    return Paragraph(text, ST["H2"])


def h3(text: str) -> Paragraph:
    return Paragraph(text, ST["H3"])


def rule(space_before: float = 2, space_after: float = 8) -> HRFlowable:
    return HRFlowable(
        width="100%",
        thickness=0.6,
        color=RULE,
        spaceBefore=space_before,
        spaceAfter=space_after,
    )


def callout(title: str, text: str, accent: str = "#b91c1c") -> Table:
    accent_color = colors.HexColor(accent)
    inner = [
        Paragraph(
            f'<font color="{accent}"><b>{title}</b></font>',
            ST["BodyTight"],
        ),
        Spacer(1, 2),
        Paragraph(text, ST["BodyTight"]),
    ]
    table = Table([[inner]], colWidths=[FRAME_W])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PALE_RED),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#fecaca")),
                ("LINEBEFORE", (0, 0), (0, -1), 3, accent_color),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return table


def data_table(
    header: list[str],
    rows: list[list[str]],
    widths: list[float],
    zebra: bool = True,
) -> Table:
    data = [[Paragraph(c, ST["TableHead"]) for c in header]]
    for row in rows:
        data.append([Paragraph(str(c), ST["TableCell"]) for c in row])

    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.4, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, 0), 5),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 5),
    ]
    if zebra:
        for i in range(1, len(data)):
            if i % 2 == 0:
                commands.append(("BACKGROUND", (0, i), (-1, i), PALE))
    table.setStyle(TableStyle(commands))
    return table


def checklist_table(title: str, items: list[str], note: str | None = None) -> Table:
    rows = [[Paragraph(f'<b>{title}</b>', ST["TableHead"]), Paragraph("Done", ST["TableHead"])]]
    for item in items:
        rows.append([Paragraph(item, ST["TableCell"]), Paragraph("[   ]", ST["TableCell"])])
    table = Table(rows, colWidths=[FRAME_W - 52, 52], repeatRows=1, hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("GRID", (0, 0), (-1, -1), 0.4, RULE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
    ]
    for i in range(1, len(rows)):
        if i % 2 == 0:
            commands.append(("BACKGROUND", (0, i), (-1, i), PALE))
    table.setStyle(TableStyle(commands))
    out: list = [table]
    if note:
        out.append(Paragraph(note, ST["Caption"]))
    return out  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# Document template with header/footer + table of contents
# ---------------------------------------------------------------------------


class HandbookDoc(BaseDocTemplate):
    def __init__(self, filename: str, total_pages: int = 0, **kwargs):
        super().__init__(filename, **kwargs)
        self.total_pages = total_pages
        self._seq = 0
        self._cover_drawn = False

    def afterFlowable(self, flowable):  # noqa: N802 (reportlab API)
        if not isinstance(flowable, Paragraph):
            return
        name = flowable.style.name
        if name not in ("H1", "H2"):
            return
        level = 0 if name == "H1" else 1
        text = flowable.getPlainText()
        self._seq += 1
        key = f"h{level}-{self._seq}"
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(text, key, level=level, closed=False)
        self.notify("TOCEntry", (level, text, self.page))


def draw_cover(canvas, doc):  # noqa: ARG001
    canvas.saveState()
    canvas.setFillColor(INK)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    canvas.setFillColor(RED)
    canvas.rect(0, PAGE_H - 8 * mm, PAGE_W, 8 * mm, fill=1, stroke=0)
    canvas.rect(0, 0, PAGE_W, 6 * mm, fill=1, stroke=0)

    left = 24 * mm
    canvas.setFillColor(colors.HexColor("#e5e7eb"))
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(left, PAGE_H - 34 * mm, PROPERTY.upper())

    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 34)
    canvas.drawString(left, PAGE_H - 62 * mm, "Fire Safety")
    canvas.drawString(left, PAGE_H - 76 * mm, "and Emergency")
    canvas.drawString(left, PAGE_H - 90 * mm, "Response")

    canvas.setFillColor(RED)
    canvas.rect(left, PAGE_H - 99 * mm, 38 * mm, 1.6 * mm, fill=1, stroke=0)

    canvas.setFillColor(colors.HexColor("#d1d5db"))
    canvas.setFont("Helvetica", 13)
    canvas.drawString(left, PAGE_H - 113 * mm, "Handbook for all colleagues,")
    canvas.drawString(left, PAGE_H - 120 * mm, "contractors, and duty managers")

    info = [
        ("Document code", DOC_CODE),
        ("Revision", DOC_REV),
        ("Effective date", DOC_DATE),
        ("Owner", "Director of Engineering and Safety"),
        ("Approved by", "General Manager"),
    ]
    y = PAGE_H - 150 * mm
    for label, value in info:
        canvas.setFillColor(colors.HexColor("#9ca3af"))
        canvas.setFont("Helvetica-Bold", 7.5)
        canvas.drawString(left, y, label.upper())
        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica", 9.5)
        canvas.drawString(left + 42 * mm, y, value)
        y -= 8 * mm

    canvas.setFillColor(colors.HexColor("#6b7280"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(left, 18 * mm, "Human Resources  |  Safety and Compliance")
    canvas.drawRightString(PAGE_W - 24 * mm, 18 * mm, "Internal use only")
    canvas.restoreState()


def draw_header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.4)
    canvas.setFillColor(MUTED)
    canvas.drawString(LEFT, PAGE_H - 13 * mm, "Fire Safety and Emergency Response Handbook")
    canvas.drawRightString(PAGE_W - RIGHT, PAGE_H - 13 * mm, f"{DOC_CODE}  |  Rev. {DOC_REV}")
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.5)
    canvas.line(LEFT, PAGE_H - 15 * mm, PAGE_W - RIGHT, PAGE_H - 15 * mm)

    canvas.line(LEFT, 14 * mm, PAGE_W - RIGHT, 14 * mm)
    canvas.setFont("Helvetica", 7.4)
    canvas.drawString(LEFT, 9.5 * mm, "Internal use only - printed copies are uncontrolled")
    page_label = f"Page {doc.page}"
    if doc.total_pages:
        page_label += f" of {doc.total_pages}"
    canvas.drawRightString(PAGE_W - RIGHT, 9.5 * mm, page_label)
    canvas.restoreState()


# ---------------------------------------------------------------------------
# Story
# ---------------------------------------------------------------------------


def build_story() -> list:
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(
            "TOCLevel0",
            fontName="Helvetica-Bold",
            fontSize=9.6,
            leading=16,
            textColor=INK,
            leftIndent=0,
            firstLineIndent=0,
        ),
        ParagraphStyle(
            "TOCLevel1",
            fontName="Helvetica",
            fontSize=8.8,
            leading=13,
            textColor=MUTED,
            leftIndent=16,
            firstLineIndent=0,
        ),
    ]

    story: list = [
        NextPageTemplate("body"),
        PageBreak(),
        h1("Contents"),
        rule(0, 6),
        toc,
        Spacer(1, 10),
        callout(
            "How to use this handbook",
            "Read Sections 1 to 4 for the principles, Sections 5 to 9 for prevention, "
            "and Sections 10 to 14 for what to do during an emergency. Appendices A to C "
            "are working tools: keep the checklists with your shift paperwork and confirm "
            "the assembly point during your first week.",
        ),
        PageBreak(),
        h1("Document control"),
        rule(0, 6),
        data_table(
            ["Field", "Detail"],
            [
                ["Document title", "Fire Safety and Emergency Response Handbook"],
                ["Document code", DOC_CODE],
                ["Revision", DOC_REV],
                ["Effective date", DOC_DATE],
                ["Next scheduled review", "01 October 2027, or sooner after a significant incident"],
                ["Document owner", "Director of Engineering and Safety"],
                ["Approver", "General Manager"],
                ["Applies to", "All colleagues, contractors, tenants, and on-site partners"],
                ["Classification", "Internal use only"],
            ],
            [48 * mm, FRAME_W - 48 * mm],
        ),
        Spacer(1, 8),
        h2("Revision history"),
        data_table(
            ["Rev.", "Date", "Summary of change"],
            [
                ["1.0", "Mar 2019", "Initial issue for the property opening."],
                ["2.0", "Aug 2021", "Added kitchen suppression, PWD evacuation, and warden roles."],
                ["3.0", "Nov 2023", "Aligned to RA 9514 and its IRR; added impairment fire watch."],
                ["4.0", DOC_DATE, "Multi-page reference edition; revised roles matrix and checklists."],
            ],
            [16 * mm, 28 * mm, FRAME_W - 44 * mm],
        ),
        Spacer(1, 8),
        callout(
            "Controlled document notice",
            "The electronic copy on the HR portal is the controlled version. Printed copies "
            "are uncontrolled unless stamped by the Safety Office. Do not amend this handbook "
            "locally; submit proposed changes to the Safety Office for the next revision.",
            accent="#374151",
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 1
        h1("1. Purpose, scope, and policy"),
        rule(0, 6),
        body(
            "This handbook sets out how Oxford Suites protects guests, colleagues, contractors, "
            "and property from fire. It explains how fires start, how to prevent them, how to "
            "respond in the first critical minutes, and how we evacuate and account for everyone."
        ),
        h2("1.1 Purpose"),
        body(
            "The purpose of this handbook is to give every person on the property a clear, "
            "practical, and consistent set of instructions. It supports compliance with the "
            "Fire Code of the Philippines (RA 9514) and its implementing rules, the Occupational "
            "Safety and Health Standards, and the property's fire safety inspection certificate."
        ),
        h2("1.2 Scope"),
        body("This handbook applies to:"),
        *bullets(
            [
                "All employees, whether permanent, probationary, casual, or agency-supplied.",
                "Contractors, vendors, entertainers, and event suppliers working on site.",
                "Tenants and retail partners operating within the property.",
                "Any guest or visitor present during an emergency, who must be guided and assisted.",
            ]
        ),
        h2("1.3 Policy statement"),
        body(
            "No operational task is so urgent that it overrides safety. Every colleague has the "
            "authority, and the duty, to stop an unsafe act, raise the alarm, and challenge "
            "unsafe work. Fire prevention is a condition of employment and of doing business "
            "with the property."
        ),
        h2("1.4 Life safety priorities"),
        *numbered(
            [
                "Life safety of guests, colleagues, and responders.",
                "Protection of the property and continuity of operations.",
                "Protection of the environment and neighbouring premises.",
                "Preservation of records, evidence, and reputation.",
            ]
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 2
        h1("2. Definitions"),
        rule(0, 6),
        body(
            "The following terms are used throughout this handbook. Where a term is defined in "
            "RA 9514 or its IRR, that definition prevails."
        ),
        data_table(
            ["Term", "Meaning"],
            [
                ["Assembly area", "A designated safe location outside the building where evacuees report for roll call."],
                ["Fire warden", "A trained colleague responsible for sweeping an assigned area and guiding evacuation."],
                ["Flash point", "The lowest temperature at which a liquid gives off enough vapour to ignite."],
                ["Hot work", "Any activity producing heat, sparks, or flame, such as welding, cutting, or grinding."],
                ["Impairment", "A condition where a fire protection system is out of service or reduced in capability."],
                ["PEEP", "Personal Emergency Evacuation Plan for a guest or colleague who needs assistance."],
                ["RACE", "Recognise, Alarm, Contain, Evacuate - the emergency response sequence in Section 10."],
                ["Refuge area", "A protected temporary holding area for people who cannot use stairs."],
                ["Roll call", "The process of confirming that everyone expected at an assembly area is present."],
                ["Stage", "A temporary event structure, platform, or set that may introduce ignition or blocking risks."],
            ],
            [36 * mm, FRAME_W - 36 * mm],
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 3
        h1("3. Regulatory and standards framework"),
        rule(0, 6),
        body(
            "The property maintains a fire safety program that meets or exceeds the following "
            "requirements. Where a local ordinance is stricter, the stricter requirement applies."
        ),
        h2("3.1 Primary legislation and codes"),
        *bullets(
            [
                "<b>RA 9514 - Fire Code of the Philippines</b> and its Revised Implementing Rules and Regulations.",
                "<b>RA 11058 - Occupational Safety and Health Standards</b>, including worker training and reporting duties.",
                "<b>Bureau of Fire Protection (BFP)</b> permits, including the Fire Safety Inspection Certificate (FSIC).",
                "<b>Local government</b> fire safety, building, and business permit conditions.",
                "<b>NFPA 10 and NFPA 101</b> as technical reference for extinguishers and means of egress.",
            ]
        ),
        h2("3.2 Property obligations"),
        data_table(
            ["Obligation", "How the property complies"],
            [
                ["Valid FSIC", "Renewed annually; posted at the front office and filed with Engineering."],
                ["Fire safety practitioner", "A designated safety officer coordinates inspections, drills, and records."],
                ["Means of egress", "Exits, stairs, and corridors kept clear and unlocked during operating hours."],
                ["Detection and suppression", "Systems maintained under contract and tested on a scheduled basis."],
                ["Training and drills", "Induction training plus at least two evacuation drills per year."],
                ["Reporting", "All fires and near misses reported to management and, where required, the BFP."],
            ],
            [42 * mm, FRAME_W - 42 * mm],
        ),
        h2("3.3 Individual obligations"),
        body(
            "Every colleague must know the location of the two nearest exits, the nearest manual "
            "call point, the nearest extinguisher, and the assembly area for their shift. Ignorance "
            "of these four facts is not an acceptable excuse during an emergency."
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 4
        h1("4. Fire science: how fire starts and spreads"),
        rule(0, 6),
        h2("4.1 The fire triangle"),
        body(
            "Fire needs three things: fuel, oxygen, and heat. Remove any one and the fire cannot "
            "start or continue. Prevention means keeping fuel and heat sources apart; response "
            "means removing one side of the triangle as quickly and safely as possible."
        ),
        data_table(
            ["Side", "Examples in a hotel", "How we remove it"],
            [
                ["Fuel", "Linen, paper, grease, gas, fuel oil, furnishings, waste.", "Housekeeping, storage discipline, and shutdown procedures."],
                ["Oxygen", "Air in corridors, guest rooms, ducts, and voids.", "Closing doors and using fire doors to limit air and smoke spread."],
                ["Heat", "Cooking, electrical faults, smoking, hot work, friction.", "Maintenance, permits, and safe work practices."],
            ],
            [22 * mm, 70 * mm, FRAME_W - 92 * mm],
        ),
        h2("4.2 How heat travels"),
        *bullets(
            [
                "<b>Conduction</b> - heat passes through solid materials, such as a metal duct or structural beam.",
                "<b>Convection</b> - hot gases and smoke rise and spread through stairwells, shafts, and ceilings.",
                "<b>Radiation</b> - heat travels in straight lines and can ignite materials some distance away.",
                "<b>Direct contact</b> - flame touches a combustible surface and ignites it.",
            ]
        ),
        body(
            "Convection is the greatest life-safety hazard in a hotel. Most fire deaths are caused "
            "by smoke inhalation, not burns. Smoke rises at roughly one metre per second, which is "
            "faster than most people can climb stairs. This is why we close doors, keep stairwells "
            "clear, and evacuate early rather than waiting to see flames."
        ),
        h2("4.3 Classes of fire"),
        data_table(
            ["Class", "Fuel", "Typical hotel example", "Correct agent"],
            [
                ["A", "Ordinary combustibles", "Linen, paper, wood, rubbish", "Water, ABC dry powder"],
                ["B", "Flammable liquids", "Cooking oil, petrol, solvents", "Foam, ABC dry powder, CO2"],
                ["C", "Flammable gases", "LPG, methane, acetylene", "Shut off gas; dry powder"],
                ["D", "Combustible metals", "Magnesium, sodium (rare on site)", "Specialist D powder"],
                ["K", "Cooking oils and fats", "Deep fryer, wok, grease", "Wet chemical (K-class)"],
            ],
            [16 * mm, 40 * mm, 60 * mm, FRAME_W - 116 * mm],
        ),
        body(
            "Never use water on an electrical fire or on a fat or oil fire. Water conducts "
            "electricity and turns burning oil into a steam-driven spray that can cause severe "
            "burns. Switch off the power first where it is safe to do so, then use the correct agent."
        ),
        h2("4.4 Stages of fire"),
        *bullets(
            [
                "<b>Incipient</b> - small, localised, and still controllable with a portable extinguisher.",
                "<b>Growth</b> - the fire spreads to nearby fuel; heat and smoke increase rapidly.",
                "<b>Fully developed</b> - the whole compartment is involved; only trained responders with protective equipment may intervene.",
                "<b>Decay</b> - fuel or oxygen is exhausted; the structure may still be unsafe to enter.",
            ]
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 5
        h1("5. General fire prevention"),
        rule(0, 6),
        body(
            "Most hotel fires are preventable and start from ordinary causes: cooking, electrical "
            "faults, smoking, and careless storage. The following rules apply everywhere on the property."
        ),
        h2("5.1 Housekeeping and egress"),
        *bullets(
            [
                "Keep exits, corridors, stairwells, and landings clear at all times.",
                "Never wedge, prop, or chock a fire door open. Fire doors must close fully on their own.",
                "Do not store linen, boxes, chairs, or equipment in corridors or against exit doors.",
                "Keep the area around electrical panels, extinguishers, and hose reels clear.",
                "Report blocked exits immediately to the duty manager, even if the blockage is temporary.",
            ]
        ),
        h2("5.2 Smoking"),
        *bullets(
            [
                "Smoking is permitted only in designated outdoor areas with proper receptacles.",
                "Never smoke in guest rooms, corridors, storerooms, kitchens, or back-of-house areas.",
                "Do not dispose of cigarette ends in planters, bins, or rubbish chutes.",
                "If a guest is found smoking in a non-smoking room, notify the duty manager immediately.",
            ]
        ),
        h2("5.3 Hot work"),
        body(
            "Welding, cutting, grinding, and any task producing heat or sparks requires a hot work "
            "permit approved by Engineering and the Safety Office. The permit requires a fire watch "
            "during the work and for at least 60 minutes afterwards, a clear area within 10 metres, "
            "and a suitable extinguisher at the work point."
        ),
        h2("5.4 Storage and waste"),
        *bullets(
            [
                "Store flammable materials away from heat sources, electrical panels, and ignition risks.",
                "Keep combustible waste in covered metal bins and empty them at the end of each shift.",
                "Do not allow cardboard, pallets, or packaging to accumulate in service corridors or loading bays.",
                "Maintain at least one metre of clearance below sprinkler heads and around electrical equipment.",
            ]
        ),
        callout(
            "Stop and report",
            "If you see an unsafe condition you cannot fix immediately, report it through the duty "
            "manager and log it in the hazard register. Do not leave it for the next shift.",
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 6
        h1("6. Guest rooms and public areas"),
        rule(0, 6),
        h2("6.1 Guest room fire safety"),
        *bullets(
            [
                "Guest room doors must be self-closing and positive-latching. Report defects the same day.",
                "Do not permit cooking appliances, portable stoves, or candles in guest rooms.",
                "Check that electrical sockets, lamps, and televisions show no scorching, cracking, or loose cords.",
                "Ensure the evacuation card is present, legible, and shows the current exit route.",
                "Housekeeping must report any smell of burning, smoke staining, or damaged wiring immediately.",
            ]
        ),
        h2("6.2 Public areas and corridors"),
        *bullets(
            [
                "Keep corridor widths clear; housekeeping carts must not block more than half the corridor.",
                "Do not hang decorations, signage, or artwork over exit signs or fire equipment.",
                "Treat curtains, drapes, and upholstery with flame-retardant treatment where required.",
                "Keep fire hose reels, extinguishers, and manual call points visible and accessible.",
                "Control candles, open flames, and cooking stations at events; require a permit for live flame.",
            ]
        ),
        h2("6.3 Event and function spaces"),
        body(
            "Event organisers must submit a layout plan showing exits, aisle widths, and the position "
            "of any temporary structures. The Safety Office may require a fire watch for pyrotechnics, "
            "live flame, large sets, or high-occupancy events. Do not exceed the posted occupant load."
        ),
        h2("6.4 Evacuation information for guests"),
        body(
            "Every guest room displays a floor plan with the two nearest exits and the assembly area. "
            "Front office colleagues should point out the exit route at check-in for guests who ask, "
            "and must offer assistance to guests with mobility needs."
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 7
        h1("7. Kitchens and food service"),
        rule(0, 6),
        body(
            "Commercial kitchens are the highest-risk area on the property. Grease, open flame, hot "
            "surfaces, and high energy use combine to create fires that spread quickly through hoods "
            "and ducts."
        ),
        h2("7.1 Grease and hood cleaning"),
        *bullets(
            [
                "Clean cooking surfaces, filters, and drip trays at the end of every shift.",
                "Clean hood filters at least weekly, or more often in high-volume kitchens.",
                "Have hood and duct systems professionally cleaned on a documented schedule.",
                "Keep the hood suppression system tagged, serviced, and linked to the kitchen fuel shut-off.",
                "Never operate a cooking line with a suppression system under impairment without a fire watch.",
            ]
        ),
        h2("7.2 Safe cooking practices"),
        *bullets(
            [
                "Never leave cooking unattended. If you must step away, turn off the heat.",
                "Control oil temperature and do not overfill fryers; wet food causes oil to surge and spill.",
                "Keep combustible items away from burners, fryers, and hot surfaces.",
                "Do not use water to extinguish an oil or fat fire. Cover the pan with a lid or use a K-class extinguisher.",
                "Turn off gas and electrical supplies before leaving the kitchen at the end of service.",
            ]
        ),
        h2("7.3 Gas safety"),
        *bullets(
            [
                "If you smell gas, do not operate electrical switches or use a phone in the area.",
                "Shut off the gas supply at the nearest isolation valve if it is safe to do so.",
                "Open doors and windows for ventilation and evacuate the area.",
                "Raise the alarm and notify Engineering and the duty manager from a safe location.",
                "Do not re-enter or restore gas until Engineering confirms the area is safe.",
            ]
        ),
        h2("7.4 Kitchen response sequence"),
        *numbered(
            [
                "Turn off the heat source and, if safe, the fuel supply.",
                "Raise the alarm and alert the kitchen team.",
                "Use the correct extinguisher or the hood suppression system for the fire type.",
                "Evacuate if the fire does not come under control immediately.",
                "Close the kitchen doors and proceed to the assembly area for roll call.",
            ]
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 8
        h1("8. Engineering, electrical, and back-of-house"),
        rule(0, 6),
        h2("8.1 Electrical safety"),
        *bullets(
            [
                "Never overload sockets or daisy-chain extension cords and power strips.",
                "Use extension cords only as a temporary measure; remove them after the task.",
                "Report damaged cables, scorched plugs, buzzing panels, or flickering lights immediately.",
                "Keep electrical panels clear to a depth of one metre and labelled clearly.",
                "Only authorised electricians may open panels, modify circuits, or replace protective devices.",
            ]
        ),
        h2("8.2 Plant rooms and generators"),
        *bullets(
            [
                "Keep generator, boiler, and fuel rooms clean and free of combustible storage.",
                "Store fuel only in approved containers and quantities, away from ignition sources.",
                "Maintain ventilation and ensure fire detection and suppression are operational.",
                "Log all maintenance and fuel transfers; report leaks immediately.",
                "Restrict access to authorised engineering staff and maintain a key register.",
            ]
        ),
        h2("8.3 Laundry and linen"),
        *bullets(
            [
                "Clean lint filters before every shift and inspect dryers for overheating.",
                "Allow hot linen to cool before folding or stacking; spontaneous ignition is possible.",
                "Do not store linen against heaters, electrical panels, or in exit corridors.",
                "Report dryers that take longer than normal or produce a burning smell.",
            ]
        ),
        h2("8.4 Vehicles and car parks"),
        *bullets(
            [
                "Keep vehicle aisles and ramps clear for fire appliances and evacuation.",
                "Do not store fuel, paint, or gas cylinders in car parks.",
                "Report leaking vehicles or strong fuel smells immediately.",
                "For electric vehicle charging, follow the posted instructions and report damaged cables.",
            ]
        ),
        h2("8.5 Contractor control"),
        body(
            "Contractors must be inducted before work begins and must comply with this handbook. "
            "Hot work, isolation of fire systems, and work in occupied areas require a permit. "
            "The host department remains responsible for contractor conduct and housekeeping."
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 9
        h1("9. Detection, alarm, and suppression systems"),
        rule(0, 6),
        h2("9.1 Detection"),
        *bullets(
            [
                "Smoke and heat detectors protect guest rooms, corridors, plant rooms, and back-of-house areas.",
                "Do not paint, cover, or obstruct detectors, sprinkler heads, or alarm devices.",
                "Report any detector that is beeping, damaged, or disconnected.",
                "Do not use aerosol sprays, steam, or dust-generating work near detectors without a permit.",
            ]
        ),
        h2("9.2 Alarm and communication"),
        *bullets(
            [
                "Manual call points are located at exits and strategic corridor points.",
                "The fire alarm panel is monitored at the security control room at all times.",
                "Do not silence or reset the alarm panel unless you are authorised and have confirmed the cause.",
                "Treat every alarm as real until the incident commander declares otherwise.",
            ]
        ),
        h2("9.3 Automatic sprinklers"),
        body(
            "Sprinklers activate individually by heat and are highly effective at controlling fire "
            "in its early stage. Never hang anything from a sprinkler head, and never stack stock "
            "within one metre below it. If a sprinkler discharges, treat it as a fire signal and "
            "follow the response procedure."
        ),
        h2("9.4 Extinguishers, hose reels, and standpipes"),
        *bullets(
            [
                "Extinguishers are inspected monthly and serviced annually by a competent provider.",
                "Hose reels must be accessible and their valves unobstructed.",
                "Standpipe outlets and fire department connections must remain clear and visible.",
                "After any use, report the equipment immediately so it can be recharged or replaced.",
            ]
        ),
        h2("9.5 Impairments and fire watch"),
        body(
            "When a fire protection system is impaired, the Safety Office must be notified, the "
            "affected area must be logged, and a fire watch must be established until the system "
            "is restored. The fire watch is a dedicated person with no other duties, an extinguisher, "
            "and a means of raising the alarm."
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 10
        h1("10. Emergency response: RACE"),
        rule(0, 6),
        body(
            "The first three minutes decide the outcome. Use RACE in order. Do not skip the alarm "
            "to investigate; the alarm brings help and starts the evacuation clock."
        ),
        h2("10.1 RACE"),
        data_table(
            ["Step", "Action"],
            [
                ["Recognise", "Identify the emergency: smoke, flame, gas, heat, or a colleague's warning."],
                ["Alarm", "Activate the nearest manual call point, call the emergency number, and alert people nearby."],
                ["Contain", "Close doors, switch off equipment if safe, and confine the fire where possible."],
                ["Evacuate", "Leave by the nearest safe exit, assist others, and go to the assembly area."],
            ],
            [26 * mm, FRAME_W - 26 * mm],
        ),
        h2("10.2 If you discover a fire"),
        *numbered(
            [
                "Raise the alarm immediately. Do not wait to confirm the cause.",
                "Alert guests and colleagues in the immediate area.",
                "Call the emergency number and state the location clearly: building, floor, area, and what is burning.",
                "Attempt to control only a small, incipient fire with the correct extinguisher, keeping your back to an exit.",
                "Evacuate if the fire does not come under control with one extinguisher.",
                "Never re-enter a building once evacuated. Wait for the incident commander.",
            ]
        ),
        h2("10.3 Fire in a guest room"),
        *bullets(
            [
                "Do not open a hot door. Feel the door and handle with the back of your hand.",
                "If the door is hot, keep it closed, seal gaps, and call the emergency number.",
                "If the door is cool, open it slowly and stay low behind it.",
                "If there is smoke, close the door and use the refuge or balcony if instructed.",
                "Never use a lift. Never jump from a window except as a last resort directed by responders.",
            ]
        ),
        h2("10.4 If you are trapped"),
        *bullets(
            [
                "Close all doors between you and the fire.",
                "Seal gaps around doors with wet towels or tape if available.",
                "Stay low where the air is cleaner and call the emergency number.",
                "Signal your location from a window with a light-coloured cloth or torch.",
                "Do not break windows unless you must escape; it can draw fire and smoke toward you.",
            ]
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 11
        h1("11. Evacuation and assembly"),
        rule(0, 6),
        h2("11.1 When to evacuate"),
        body(
            "Evacuate immediately when the alarm sounds, when instructed by a warden or responder, "
            "or when the fire is beyond the incipient stage. Do not stop to collect belongings, "
            "finish a task, or investigate the source."
        ),
        h2("11.2 Evacuation rules"),
        *bullets(
            [
                "Use the nearest safe exit and the stairs. Never use lifts during a fire.",
                "Keep to the right in corridors and stairwells to let responders pass.",
                "Close doors behind you as you go, if it is safe to do so.",
                "Do not run; move quickly and calmly to avoid injury and panic.",
                "Assist guests and colleagues who need help, following their PEEP where one exists.",
                "If smoke is present, stay low, cover your nose and mouth, and feel doors before opening them.",
            ]
        ),
        h2("11.3 People who need assistance"),
        body(
            "Guests and colleagues with mobility, sensory, or cognitive needs may require assistance. "
            "Where possible, move them horizontally to a protected refuge area and notify the incident "
            "commander. Do not use a lift, even with assistance, unless directed by responders."
        ),
        h2("11.4 Assembly and roll call"),
        *numbered(
            [
                "Proceed to the assembly area assigned to your shift and location.",
                "Report to your fire warden and answer the roll call.",
                "Report anyone missing, injured, or last seen in the building.",
                "Do not leave the assembly area until the incident commander releases you.",
                "Do not re-enter the building until the fire service declares it safe.",
            ]
        ),
        callout(
            "Contractors and visitors",
            "The hosting department must account for its contractors, vendors, and visitors at the "
            "assembly area. If you invited them on site, you are responsible for confirming they "
            "are safe.",
            accent="#374151",
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 12
        h1("12. Fire wardens and emergency roles"),
        rule(0, 6),
        body(
            "The following roles activate during an alarm. A person may hold more than one role on "
            "a shift, but the incident commander must never be the same person as the fire warden "
            "sweeping a floor."
        ),
        data_table(
            ["Role", "Primary responsibility"],
            [
                ["Incident commander", "Takes command at the control point, decides on evacuation, liaises with the fire service."],
                ["Deputy commander", "Assumes command if the commander is unavailable; manages the control log."],
                ["Fire warden", "Sweeps the assigned area, closes doors, guides people to the stairs, reports clear or missing."],
                ["Searcher", "Checks rooms, toilets, and back-of-house areas along the sweep route."],
                ["Stairwell monitor", "Controls flow at the stair entrance, prevents re-entry, assists responders."],
                ["Assembly marshal", "Organises evacuees, conducts roll call, reports missing persons."],
                ["Communications officer", "Handles radio, PA announcements, and calls to emergency services."],
                ["Engineering responder", "Isolates utilities, confirms system status, supports the fire service."],
                ["Security responder", "Controls access, keeps routes clear, protects the perimeter."],
                ["First aid responder", "Sets up the treatment point and triages injuries."],
            ],
            [40 * mm, FRAME_W - 40 * mm],
        ),
        h2("12.1 Before an emergency"),
        *bullets(
            [
                "Know your sweep route and the location of exits, call points, and extinguishers.",
                "Check that your radio is charged and on the correct channel at the start of each shift.",
                "Confirm who is on duty and who is the incident commander for the shift.",
                "Keep the warden vest and torch accessible, not locked in an office.",
            ]
        ),
        h2("12.2 After an emergency"),
        *bullets(
            [
                "Participate in the debrief and report what you observed.",
                "Record missing-person reports, injuries, and equipment used.",
                "Do not reset systems or restart operations until authorised.",
                "Support colleagues affected by the incident and preserve evidence.",
            ]
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 13
        h1("13. Communication during an emergency"),
        rule(0, 6),
        h2("13.1 Alarm and PA announcements"),
        body(
            "Use calm, clear, and scripted language. Do not speculate about the cause or severity. "
            "The communications officer reads the approved script and repeats it as needed."
        ),
        callout(
            "Sample announcement",
            "Attention please. Attention please. We are responding to a fire alarm in the building. "
            "Please leave your room, close the door behind you, use the nearest stairwell, and do not "
            "use the lifts. Proceed to the assembly area. Our team will assist you.",
            accent="#374151",
        ),
        h2("13.2 Informing guests"),
        *bullets(
            [
                "Give short, direct instructions: what to do, where to go, and what not to do.",
                "Use simple language and repeat key points; consider translation where possible.",
                "Do not disclose unverified information or the identity of anyone involved.",
                "Direct guests away from the incident and keep routes clear for responders.",
            ]
        ),
        h2("13.3 Internal escalation"),
        *numbered(
            [
                "Duty manager and security control room.",
                "Incident commander and Safety Office.",
                "General Manager and department heads.",
                "Emergency services, as required by the situation.",
            ]
        ),
        h2("13.4 Media and social media"),
        body(
            "Only the General Manager or the designated spokesperson may speak to the media. "
            "Colleagues must not post about the incident, speculate, or share images until the "
            "incident is closed and communication is authorised."
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 14
        h1("14. Fire extinguishers and PASS"),
        rule(0, 6),
        body(
            "Only attempt to fight a fire if it is small, incipient, and you have a clear escape route. "
            "If in doubt, do not fight it: raise the alarm and evacuate."
        ),
        h2("14.1 Using an extinguisher (PASS)"),
        *numbered(
            [
                "<b>Pull</b> the pin.",
                "<b>Aim</b> at the base of the fire, not the flames.",
                "<b>Squeeze</b> the handle firmly.",
                "<b>Sweep</b> from side to side across the base of the fire.",
            ]
        ),
        h2("14.2 Safety rules"),
        *bullets(
            [
                "Always keep your back to an exit and never let the fire come between you and your way out.",
                "Work in pairs where possible; one person fights the fire, the other watches.",
                "Do not turn your back on a fire that is not fully extinguished.",
                "If the fire grows, the smoke thickens, or the extinguisher empties, leave immediately.",
                "After use, report the extinguisher so it is recharged or replaced.",
            ]
        ),
        h2("14.3 Selection"),
        body(
            "Use the matrix in Appendix A. Using the wrong agent can make the fire worse: water on "
            "fat or electrical fires, or powder in a kitchen where it can contaminate food and "
            "equipment. When the correct agent is not available, evacuate."
        ),
        h2("14.4 Inspection"),
        *bullets(
            [
                "Monthly: check the gauge, pin, seal, hose, and label; record the check.",
                "Annual: professional service and certification by a competent provider.",
                "After any use or damage: remove from service and replace immediately.",
                "Report missing, obstructed, or damaged extinguishers to Engineering the same day.",
            ]
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 15
        h1("15. Drills, training, and records"),
        rule(0, 6),
        h2("15.1 Training"),
        *bullets(
            [
                "All new colleagues receive fire safety induction before their first solo shift.",
                "All colleagues complete refresher training at least annually.",
                "Fire wardens receive additional training in sweep procedures, radios, and roll call.",
                "Kitchen teams receive specific training on hood suppression and K-class extinguishers.",
                "Engineering and security receive training on isolation, panels, and fire watches.",
            ]
        ),
        h2("15.2 Drills"),
        *bullets(
            [
                "Conduct at least two full evacuation drills per year, at least one unannounced.",
                "Include night shift and weekend scenarios, not only day-shift office hours.",
                "Test the alarm, communications, stairwell flow, assembly roll call, and missing-person process.",
                "Record the drill start time, evacuation time, and any issues.",
                "Debrief within 48 hours and assign corrective actions with owners and dates.",
            ]
        ),
        h2("15.3 Records"),
        data_table(
            ["Record", "Owner", "Retention"],
            [
                ["Training attendance and competency", "HR and Safety Office", "5 years"],
                ["Drill reports and debrief actions", "Safety Office", "5 years"],
                ["Extinguisher and system inspections", "Engineering", "5 years"],
                ["Hot work permits", "Engineering", "3 years"],
                ["Incident and near-miss reports", "Safety Office", "5 years"],
            ],
            [60 * mm, 52 * mm, FRAME_W - 112 * mm],
        ),
        PageBreak(),

        # ---------------------------------------------------------------- 16
        h1("16. Reporting, investigation, and improvement"),
        rule(0, 6),
        h2("16.1 Immediate reporting"),
        *bullets(
            [
                "Report every fire, activation, near miss, and unsafe condition, however small.",
                "Call the emergency number first for an active incident; report to your manager afterwards.",
                "Do not disturb the scene more than necessary; preserve evidence for investigation.",
                "Record names, times, locations, and what you observed while it is fresh.",
            ]
        ),
        h2("16.2 Investigation"),
        body(
            "The Safety Office leads the investigation with Engineering and the affected department. "
            "The investigation establishes the origin, cause, spread, response effectiveness, and "
            "corrective actions. It is not a blame exercise; the goal is to prevent recurrence."
        ),
        h2("16.3 Corrective actions"),
        *bullets(
            [
                "Assign each action an owner and a due date.",
                "Track actions to completion and verify effectiveness.",
                "Update this handbook, training, or procedures where the finding warrants it.",
                "Share lessons learned with all departments without disclosing personal information.",
            ]
        ),
        h2("16.4 External notification"),
        body(
            "Where required by law or by the BFP, the General Manager or Safety Office notifies the "
            "authorities within the prescribed period. Do not make external statements without "
            "authorisation."
        ),
        PageBreak(),

        # ---------------------------------------------------------------- Appendix A
        h1("Appendix A. Extinguisher selection matrix"),
        rule(0, 6),
        body(
            "Use this matrix to choose the correct agent. When two agents are listed, prefer the "
            "first. If the correct agent is not immediately available, evacuate and let responders "
            "handle the fire."
        ),
        data_table(
            ["Fire type", "Preferred agent", "Do not use"],
            [
                ["Paper, linen, wood, rubbish (Class A)", "Water or ABC dry powder", "CO2 alone (limited cooling)"],
                ["Cooking oil, fat, grease (Class K)", "Wet chemical (K-class)", "Water, CO2, dry powder"],
                ["Petrol, solvent, paint (Class B)", "Foam or ABC dry powder", "Water jet"],
                ["LPG, gas (Class C)", "Shut off gas; ABC dry powder", "Water on the leak"],
                ["Electrical equipment", "CO2 or ABC dry powder after isolating power", "Water or foam"],
                ["Combustible metal (Class D)", "Specialist D powder", "Water, foam, CO2"],
            ],
            [62 * mm, 62 * mm, FRAME_W - 124 * mm],
        ),
        h2("A.1 Extinguisher locations"),
        body(
            "Extinguishers are placed at exits, kitchen lines, plant rooms, and back-of-house corridors. "
            "Your department's location chart shows the nearest unit. Check it during your first week "
            "and whenever you change departments."
        ),
        h2("A.2 Monthly inspection record"),
        data_table(
            ["Check", "Pass criteria"],
            [
                ["Access", "Visible, unobstructed, and within reach."],
                ["Pressure gauge", "Needle in the green operating band."],
                ["Pin and seal", "Pin in place; tamper seal intact."],
                ["Hose and nozzle", "No cracks, blockages, or damage."],
                ["Label", "Service tag current and legible."],
                ["Mounting", "Secure; not corroded or loose."],
            ],
            [50 * mm, FRAME_W - 50 * mm],
        ),
        PageBreak(),

        # ---------------------------------------------------------------- Appendix B
        h1("Appendix B. Inspection checklists"),
        rule(0, 6),
        body(
            "Copy these checklists for shift use or complete them electronically in the maintenance "
            "system. Record the date, time, and initials. Escalate any failed item immediately."
        ),
        h2("B.1 Daily - kitchen and food service"),
        *checklist_table(
            "Daily kitchen fire safety checklist",
            [
                "Cooking surfaces, filters, and drip trays cleaned.",
                "Hood suppression system indicator normal and tagged.",
                "No combustible items stored near burners or fryers.",
                "Fryer oil level correct and temperature controlled.",
                "Gas and electrical supplies switched off at end of service.",
                "Extinguisher accessible and gauge in the green band.",
                "Exit route and kitchen door clear.",
            ],
        ),
        h2("B.2 Daily - public areas and back-of-house"),
        *checklist_table(
            "Daily egress and housekeeping checklist",
            [
                "Corridors and stairwells clear of stores and equipment.",
                "Fire doors close fully and are not wedged open.",
                "Exit signs illuminated and unobstructed.",
                "Manual call points visible and accessible.",
                "No smoking outside designated areas.",
                "Waste bins covered and emptied.",
                "Fire panel showing normal, no faults or isolations.",
            ],
        ),
        h2("B.3 Weekly and monthly"),
        *checklist_table(
            "Weekly and monthly fire safety checks",
            [
                "Weekly: hood filters cleaned and recorded.",
                "Weekly: extinguisher locations checked for obstruction.",
                "Weekly: emergency lighting and exit signs tested.",
                "Monthly: extinguisher gauge, pin, seal, and hose inspected.",
                "Monthly: hose reels and valves checked.",
                "Monthly: fire doors and self-closers inspected.",
                "Monthly: warden radios and vests checked.",
            ],
            note="Record all checks in the fire safety log. A missed check is a finding, not a blank.",
        ),
        PageBreak(),

        # ---------------------------------------------------------------- Appendix C
        h1("Appendix C. Assembly points and evacuation map"),
        rule(0, 6),
        body(
            "The property has two primary assembly areas. Your assigned area depends on your work "
            "location and the wind direction at the time of the incident. Follow the wardens; do "
            "not choose an area based on convenience."
        ),
        data_table(
            ["Assembly area", "Serves", "Notes"],
            [
                ["Assembly Area 1 - Front driveway", "Front office, lobby, F&amp;B outlets, guest towers A and B", "Primary area for most day-shift colleagues."],
                ["Assembly Area 2 - Staff car park", "Kitchen, laundry, engineering, stores, back-of-house", "Keep clear of the fire appliance access lane."],
            ],
            [44 * mm, 80 * mm, FRAME_W - 124 * mm],
        ),
        h2("C.1 Evacuation map"),
        body(
            "Insert or display the current floor evacuation plan here. The plan must show the two "
            "nearest exits, the route to the stairwell, the manual call point, the extinguisher, and "
            "the assembly area. Floor plans are also posted in every guest room and service corridor."
        ),
        callout(
            "Map placeholder",
            "This reference edition leaves the floor plan as a placeholder. Replace it with the "
            "property's approved evacuation drawings before issuing the handbook to colleagues.",
            accent="#374151",
        ),
        h2("C.2 Roll call sheet"),
        data_table(
            ["Department", "Expected", "Accounted for", "Missing"],
            [
                ["Front Office", "", "", ""],
                ["Housekeeping", "", "", ""],
                ["Food and Beverage", "", "", ""],
                ["Kitchen", "", "", ""],
                ["Engineering", "", "", ""],
                ["Security", "", "", ""],
                ["Contractors and visitors", "", "", ""],
            ],
            [66 * mm, 34 * mm, 40 * mm, FRAME_W - 140 * mm],
        ),
        PageBreak(),

        # ---------------------------------------------------------------- Appendix D
        h1("Appendix D. Emergency contacts and acknowledgement"),
        rule(0, 6),
        h2("D.1 Emergency contacts"),
        data_table(
            ["Contact", "Number", "When to call"],
            [
                ["Fire, medical, and rescue", "911", "Any life-threatening emergency."],
                ["Security control room", "Local extension 0", "Alarm, suspicious activity, access control."],
                ["Duty manager", "Local extension 100", "Any incident after hours or when unsure."],
                ["Engineering on-call", "Local extension 200", "Utilities, gas, electrical, or system impairment."],
                ["Safety Office", "Local extension 300", "Reporting, investigation, training, permits."],
                ["BFP local station", "See posted list", "Fire reporting and inspection matters."],
            ],
            [50 * mm, 40 * mm, FRAME_W - 90 * mm],
        ),
        h2("D.2 Acknowledgement"),
        body(
            "I confirm that I have received, read, and understood this handbook. I know the location "
            "of my nearest exits, manual call point, and extinguisher, and I know my assembly area. "
            "I understand that I must raise the alarm and evacuate when instructed, and that I must "
            "never re-enter a building until the incident commander declares it safe."
        ),
        Spacer(1, 18),
        data_table(
            ["Field", "Entry"],
            [
                ["Name", ""],
                ["Position", ""],
                ["Department", ""],
                ["Signature", ""],
                ["Date", ""],
            ],
            [40 * mm, FRAME_W - 40 * mm],
            zebra=False,
        ),
        Spacer(1, 14),
        body(
            "<i>Return the signed acknowledgement to Human Resources. Training records are retained "
            "for five years in line with Section 15.3.</i>",
            "Small",
        ),
        Spacer(1, 24),
        rule(0, 6),
        body(
            f"{PROPERTY_HTML}  |  Human Resources and Safety Office  |  {DOC_CODE}  |  Rev. {DOC_REV}",
            "Small",
        ),
    ]

    return story


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------


def build(total_pages: int = 0) -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    doc = HandbookDoc(
        str(OUT_FILE),
        total_pages=total_pages,
        pagesize=A4,
        leftMargin=LEFT,
        rightMargin=RIGHT,
        topMargin=TOP,
        bottomMargin=BOTTOM,
        title="Fire Safety and Emergency Response Handbook",
        author="Oxford Suites Hotel & Residences - Human Resources",
        subject="Fire prevention, emergency response, and evacuation",
        creator="Oxford Suites Safety Office",
    )

    cover_frame = Frame(0, 0, PAGE_W, PAGE_H, id="cover", showBoundary=0)
    body_frame = Frame(
        LEFT,
        BOTTOM,
        FRAME_W,
        PAGE_H - TOP - BOTTOM,
        id="body",
        showBoundary=0,
    )

    doc.addPageTemplates(
        [
            PageTemplate(id="cover", frames=[cover_frame], onPage=draw_cover),
            PageTemplate(id="body", frames=[body_frame], onPage=draw_header_footer),
        ]
    )

    doc.multiBuild(build_story())
    return doc.page


if __name__ == "__main__":
    first_pass = build(0)
    final_pages = build(first_pass)
    size_kb = OUT_FILE.stat().st_size / 1024
    print(f"Wrote {OUT_FILE}")
    print(f"Pages: {final_pages}  |  Size: {size_kb:.1f} KB")
