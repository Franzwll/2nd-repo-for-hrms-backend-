/**
 * Multi-format Report Exporter (PDF, DOCX, Excel) for HRMS Modules.
 *
 * Produces formal, corporate-grade documents entirely client-side with zero
 * external dependencies:
 *  - PDF   : a typeset, printable A4 report (Save as PDF) styled after a
 *            formal company report — letterhead, document control block,
 *            ruled tables and a certification block
 *  - DOCX  : a Microsoft Word–compatible .doc typeset like an official
 *            company report (Times New Roman, ruled tables, sign-off block)
 *  - Excel : a native Excel workbook (.xls / SpreadsheetML 2003)
 *
 * Every "Generate Report" button in the app routes through `exportReport`,
 * so improving this module upgrades all of them at once.
 */

import oxfordMarkMaroon from "@/assets/oxford-mark-maroon.png";
import { getUser } from "@/lib/auth";

export type ReportFormat = "pdf" | "docx" | "excel";

export interface ReportColumn {
  header: string;
  key: string;
  width?: string;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: Record<string, any>[];
  summary?: { label: string; value: string | number }[];
}

/** Brand identity shared by every exported document. */
const BRAND = "OXFORD SUITES MAKATI";
const BRAND_SUB = "Human Resources Management System";
const BRAND_COLOR = "#520c19";
const BRAND_COLOR_LIGHT = "#7a1226";
const ACCENT = "#d4af37";
const ADDRESS = "518 P. Burgos St., Makati, Metro Manila, Philippines";
const CONTACT = "Tel: +63 (2) 8888-0000 · hr@oxfordsuitesmakati.com";
const SERIF = "'Garamond', 'Times New Roman', Georgia, 'Cambria', serif";

/** Preload the company logo as a base64 data URI so it can be embedded
 *  directly into the printed / Word documents (no external file dependency). */
let LOGO_DATA_URI: string | null = null;
if (typeof window !== "undefined" && typeof fetch !== "undefined") {
  fetch(oxfordMarkMaroon)
    .then((r) => (r.ok ? r.blob() : null))
    .then((blob) => {
      if (!blob) return;
      const reader = new FileReader();
      reader.onload = () => {
        LOGO_DATA_URI = reader.result as string;
      };
      reader.readAsDataURL(blob);
    })
    .catch(() => {
      LOGO_DATA_URI = null;
    });
}

function buildFilename(report: ReportData, ext: string): string {
  const base = report.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${base}_${new Date().toISOString().slice(0, 10)}.${ext}`;
}

function buildReference(report: ReportData): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const prefix = (report.title.replace(/[^a-z]/gi, "").slice(0, 3) || "RPT").toUpperCase();
  return `OSM-HR-${prefix}-${datePart}-${rand}`;
}

function escapeHtml(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Long-form date, e.g. "31 August 2026" — formal documents avoid numeric dates. */
function formalDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** 12-hour clock time, e.g. "4:37 PM" for the generated timestamp. */
function formalTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function exportReport(report: ReportData, format: ReportFormat): void {
  const now = new Date();
  const generatedAt = `${formalDate(now)}, ${formalTime(now)}`;
  const refNo = buildReference(report);
  const user = getUser();
  const preparedBy = (user?.full_name as string | undefined) || "System Administrator";
  const preparedByTitle = (user?.role as string | undefined) || "Human Resources";
  const preparedByDept =
    (user?.department_name as string | undefined) || "Human Resources Department";

  if (format === "excel") {
    exportToExcel(report, generatedAt, refNo, preparedBy);
  } else if (format === "docx") {
    exportToWord(report, generatedAt, refNo, preparedBy, preparedByTitle, preparedByDept);
  } else if (format === "pdf") {
    exportToPrintablePdf(report, generatedAt, refNo, preparedBy, preparedByTitle, preparedByDept);
  }
}

/* ------------------------------------------------------------------ */
/* Shared building blocks                                             */
/* ------------------------------------------------------------------ */

/** Letterhead (logo + wordmark) used by the HTML-based formats. */
function letterheadHtml(opts: { inline?: boolean }): string {
  const logo = LOGO_DATA_URI
    ? `<img src="${LOGO_DATA_URI}" alt="Oxford Suites Makati" ${
        opts.inline ? 'style="height:46px;width:auto;display:block;"' : 'class="brand-logo"'
      } />`
    : "";
  const wordmark = opts.inline
    ? `<div style="line-height:1.1;">
         <div style="font-size:19px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.06em;font-family:${SERIF};">OXFORD SUITES MAKATI</div>
         <div style="font-size:9px;color:${ACCENT};font-weight:700;letter-spacing:0.22em;text-transform:uppercase;margin-top:3px;font-family:${SERIF};">Human Resources Management System</div>
       </div>`
    : `<div class="brand-words">
         <div class="brand-title">OXFORD SUITES MAKATI</div>
         <div class="brand-sub">Human Resources Management System</div>
       </div>`;

  if (opts.inline) {
    return `<div style="display:flex;align-items:center;gap:14px;">${logo}${wordmark}</div>`;
  }
  return `<div class="brand">${logo}${wordmark}</div>`;
}

/* ------------------------------------------------------------------ */
/* EXCEL — native workbook via SpreadsheetML 2003 (.xls)               */
/* ------------------------------------------------------------------ */
function exportToExcel(
  report: ReportData,
  generatedAt: string,
  refNo: string,
  preparedBy: string,
): void {
  const filename = buildFilename(report, "xls");
  const span = Math.max(report.columns.length - 1, 5);

  const metaRows = `
    <Row>
      <Cell ss:MergeAcross="${span}" ss:StyleID="Title"><Data ss:Type="String">${escapeXml(BRAND)}</Data></Cell>
    </Row>
    <Row>
      <Cell ss:MergeAcross="${span}" ss:StyleID="Sub"><Data ss:Type="String">${escapeXml(BRAND_SUB)}</Data></Cell>
    </Row>
    <Row>
      <Cell ss:MergeAcross="${span}" ss:StyleID="Sub"><Data ss:Type="String">${escapeXml(report.title)}</Data></Cell>
    </Row>
    <Row>
      <Cell ss:StyleID="Meta"><Data ss:Type="String">Document Control No.:</Data></Cell>
      <Cell ss:MergeAcross="2" ss:StyleID="MetaVal"><Data ss:Type="String">${escapeXml(refNo)}</Data></Cell>
      <Cell ss:StyleID="Meta"><Data ss:Type="String">Date of Issue:</Data></Cell>
      <Cell ss:MergeAcross="${Math.max(span - 4, 0)}" ss:StyleID="MetaVal"><Data ss:Type="String">${escapeXml(generatedAt)}</Data></Cell>
    </Row>
    <Row>
      <Cell ss:StyleID="Meta"><Data ss:Type="String">Prepared by:</Data></Cell>
      <Cell ss:MergeAcross="${span - 1}" ss:StyleID="MetaVal"><Data ss:Type="String">${escapeXml(preparedBy)}</Data></Cell>
    </Row>
    <Row>
      <Cell ss:StyleID="Meta"><Data ss:Type="String">Subject:</Data></Cell>
      <Cell ss:MergeAcross="${span - 1}" ss:StyleID="MetaVal"><Data ss:Type="String">${escapeXml(report.subtitle || `${BRAND} · ${BRAND_SUB}`)}</Data></Cell>
    </Row>`;

  const summaryRows = (report.summary ?? [])
    .map(
      (s, i) => `
      <Row>
        <Cell ss:StyleID="SumLabel"><Data ss:Type="String">${escapeXml(s.label)}</Data></Cell>
        <Cell ss:StyleID="SumVal"><Data ss:Type="String">${escapeXml(s.value)}</Data></Cell>
        ${
          i === 0
            ? `<Cell ss:MergeAcross="${span - 1}" ss:StyleID="Meta"><Data ss:Type="String">Company: ${escapeXml(BRAND)} · ${escapeXml(ADDRESS)}</Data></Cell>`
            : Array.from({ length: span - 1 })
                .map(() => '<Cell><Data ss:Type="String"></Data></Cell>')
                .join("")
        }
      </Row>`,
    )
    .join("");

  const headerRow = `
    <Row>
      ${report.columns
        .map(
          (c) =>
            `<Cell ss:StyleID="Head"><Data ss:Type="String">${escapeXml(c.header)}</Data></Cell>`,
        )
        .join("")}
    </Row>`;

  const dataRows = report.rows
    .map(
      (row) => `
      <Row>
        ${report.columns
          .map(
            (c) =>
              `<Cell ss:StyleID="Cell"><Data ss:Type="String">${escapeXml(row[c.key] ?? "—")}</Data></Cell>`,
          )
          .join("")}
      </Row>`,
    )
    .join("");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
   <Style ss:ID="Title"><Font ss:Bold="1" ss:Size="14" ss:Color="${BRAND_COLOR}"/></Style>
   <Style ss:ID="Sub"><Font ss:Color="#6B7280" ss:Size="10"/></Style>
   <Style ss:ID="Meta"><Font ss:Bold="1" ss:Color="#374151" ss:Size="10"/></Style>
   <Style ss:ID="MetaVal"><Font ss:Color="#111827" ss:Size="10"/></Style>
   <Style ss:ID="Head"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="${BRAND_COLOR}" ss:Pattern="Solid"/><Alignment ss:Horizontal="Left"/></Style>
   <Style ss:ID="SumLabel"><Font ss:Bold="1" ss:Color="#854D0E" ss:Size="10"/></Style>
   <Style ss:ID="SumVal"><Font ss:Bold="1" ss:Size="14" ss:Color="${BRAND_COLOR}"/></Style>
   <Style ss:ID="Cell"><Font ss:Size="10"/></Style>
 </Styles>
 <Worksheet ss:Name="Report">
   <Table>
    ${metaRows}
    <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
    ${summaryRows}
    <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
    ${headerRow}
    ${dataRows}
   </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob(["﻿" + xml], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  triggerDownload(blob, filename);
}

/* ------------------------------------------------------------------ */
/* DOCX — Microsoft Word–compatible .doc (HTML wordprocessing)        */
/* ------------------------------------------------------------------ */
function exportToWord(
  report: ReportData,
  generatedAt: string,
  refNo: string,
  preparedBy: string,
  preparedByTitle: string,
  preparedByDept: string,
): void {
  const filename = buildFilename(report, "doc");
  const logo = LOGO_DATA_URI
    ? `<img src="${LOGO_DATA_URI}" width="46" alt="Oxford Suites Makati" style="display:block;" />`
    : "";

  const metaBlock = `
    <table style="width:100%;border-collapse:collapse;margin-top:6px;">
      <tr>
        <td style="width:52%;vertical-align:top;padding:0;">
          ${logo}
          <div style="font-size:19px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.06em;font-family:'Times New Roman',serif;margin-top:6px;">OXFORD SUITES MAKATI</div>
          <div style="font-size:9px;color:${ACCENT};font-weight:700;letter-spacing:0.22em;text-transform:uppercase;font-family:'Times New Roman',serif;">Human Resources Management System</div>
          <div style="font-size:9px;color:#6b7280;margin-top:6px;font-family:'Times New Roman',serif;">${escapeHtml(ADDRESS)}</div>
        </td>
        <td style="width:48%;vertical-align:top;text-align:right;padding:0;font-size:10px;color:#111827;line-height:1.8;font-family:'Times New Roman',serif;">
          <div><strong style="color:${BRAND_COLOR};">Document Control No.:</strong> ${escapeHtml(refNo)}</div>
          <div><strong style="color:${BRAND_COLOR};">Date of Issue:</strong> ${escapeHtml(generatedAt)}</div>
          <div><strong style="color:${BRAND_COLOR};">Prepared by:</strong> ${escapeHtml(preparedBy)}</div>
          <div><strong style="color:${BRAND_COLOR};">Department:</strong> ${escapeHtml(preparedByDept)}</div>
        </td>
      </tr>
    </table>`;

  const titleBlock = `
    <div style="margin:20px 0 4px 0;border-bottom:2px solid ${BRAND_COLOR};padding-bottom:8px;text-align:center;">
      <p style="font-size:11px;color:#6b7280;letter-spacing:0.24em;text-transform:uppercase;margin:0 0 6px 0;font-family:'Times New Roman',serif;">Management Report</p>
      <h1 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 4px 0;font-family:'Times New Roman',serif;">${escapeHtml(report.title)}</h1>
      <p style="font-size:11px;color:#6b7280;margin:0;font-style:italic;font-family:'Times New Roman',serif;">${escapeHtml(report.subtitle || `${BRAND} · ${BRAND_SUB}`)}</p>
    </div>`;

  const summaryHtml = report.summary
    ? `
    <table style="width:100%;margin:16px 0 8px 0;border-collapse:collapse;">
      <tr>
        ${report.summary
          .map(
            (s) => `
          <td style="padding:10px 14px;background-color:#faf7f0;border:1px solid #e0d5bd;width:${100 / (report.summary?.length ?? 1)}%;text-align:center;">
            <span style="font-size:9px;color:#854d0e;text-transform:uppercase;font-weight:bold;letter-spacing:0.08em;font-family:'Times New Roman',serif;">${escapeHtml(s.label)}</span><br/>
            <span style="font-size:17px;color:${BRAND_COLOR};font-weight:bold;font-family:'Times New Roman',serif;">${escapeHtml(s.value)}</span>
          </td>`,
          )
          .join("")}
      </tr>
    </table>`
    : "";

  const tableHeaders = report.columns
    .map(
      (c) =>
        `<th style="background-color:${BRAND_COLOR};color:#ffffff;padding:9px 8px;border:1px solid ${BRAND_COLOR_LIGHT};font-size:11px;text-align:left;font-weight:700;font-family:'Times New Roman',serif;">${escapeHtml(c.header)}</th>`,
    )
    .join("");

  const tableRows = report.rows
    .map(
      (row, idx) => `
      <tr style="background-color:${idx % 2 === 0 ? "#ffffff" : "#f7f5f2"};">
        ${report.columns
          .map(
            (c) =>
              `<td style="padding:8px 8px;border:1px solid #b8b2a8;font-size:11px;color:#1a1a1a;font-family:'Times New Roman',serif;">${escapeHtml(row[c.key] ?? "—")}</td>`,
          )
          .join("")}
      </tr>`,
    )
    .join("");

  const emptyRowNote =
    report.rows.length === 0
      ? `<tr><td colspan="${report.columns.length}" style="padding:14px;border:1px solid #b8b2a8;font-size:11px;color:#6b7280;text-align:center;font-style:italic;font-family:'Times New Roman',serif;">No records were available for inclusion in this report.</td></tr>`
      : "";

  const signOffBlock = `
    <table style="width:100%;margin-top:36px;border-collapse:collapse;font-family:'Times New Roman',serif;font-size:11px;color:#111827;">
      <tr>
        <td style="width:55%;vertical-align:bottom;padding:0;">
          <div style="border-bottom:1px solid #111827;width:230px;height:34px;"></div>
          <div style="margin-top:4px;"><strong>${escapeHtml(preparedBy)}</strong></div>
          <div style="font-size:10px;color:#6b7280;">${escapeHtml(preparedByTitle)} · ${escapeHtml(preparedByDept)}</div>
        </td>
        <td style="width:45%;vertical-align:bottom;text-align:right;padding:0;">
          <div style="border-bottom:1px solid #111827;width:180px;height:34px;margin-left:auto;"></div>
          <div style="margin-top:4px;">Noted / Received by</div>
          <div style="font-size:10px;color:#6b7280;">Signature over printed name · Date</div>
        </td>
      </tr>
    </table>`;

  const html = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>${escapeHtml(report.title)}</title>
    <style>
      body { font-family: 'Times New Roman', serif; margin: 34px 38px; }
      table.data { width: 100%; border-collapse: collapse; margin-top: 12px; }
      @page { size: A4; margin: 25mm; }
    </style>
  </head>
  <body>
    <div style="border-bottom:3px double ${BRAND_COLOR};padding-bottom:12px;">
      ${metaBlock}
    </div>
    ${titleBlock}
    ${summaryHtml}
    <table class="data">
      <thead><tr>${tableHeaders}</tr></thead>
      <tbody>${tableRows}${emptyRowNote}</tbody>
    </table>
    ${signOffBlock}
    <p style="margin-top:28px;font-size:9px;color:#8a8a8a;border-top:1px solid #d8d3c8;padding-top:8px;font-family:'Times New Roman',serif;text-align:center;">
      ${escapeHtml(ADDRESS)} &bull; ${escapeHtml(CONTACT)}<br/>
      This document is a system-generated record of the ${escapeHtml(BRAND)} Human Resources Management System and is strictly confidential.
    </p>
  </body>
  </html>`;

  const blob = new Blob(["﻿" + html], { type: "application/msword;charset=utf-8" });
  triggerDownload(blob, filename);
}

/* ------------------------------------------------------------------ */
/* PDF — formal typeset A4 report rendered through an iframe          */
/*      (avoids popup blockers; "Save as PDF" in the print dialog)     */
/* ------------------------------------------------------------------ */
function exportToPrintablePdf(
  report: ReportData,
  generatedAt: string,
  refNo: string,
  preparedBy: string,
  preparedByTitle: string,
  preparedByDept: string,
): void {
  const landscape = report.columns.length > 6;
  const colCount = report.columns.length;

  const tableHeaders = report.columns
    .map(
      (c) =>
        `<th style="width:${c.width || `${Math.floor(100 / colCount)}%`};">${escapeHtml(c.header)}</th>`,
    )
    .join("");

  const tableRows = report.rows
    .map(
      (row, idx) => `
      <tr class="${idx % 2 === 0 ? "even" : "odd"}">
        ${report.columns.map((c) => `<td>${escapeHtml(row[c.key] ?? "—")}</td>`).join("")}
      </tr>`,
    )
    .join("");

  const emptyRowNote =
    report.rows.length === 0
      ? `<tr><td colspan="${colCount}" class="empty-note">No records were available for inclusion in this report.</td></tr>`
      : "";

  const summaryHtml = report.summary
    ? `
    <div class="summary-grid">
      ${report.summary
        .map(
          (s) => `
        <div class="summary-card">
          <div class="summary-label">${escapeHtml(s.label)}</div>
          <div class="summary-value">${escapeHtml(s.value)}</div>
        </div>`,
        )
        .join("")}
    </div>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(report.title)} — ${BRAND}</title>
  <style>
    @page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 16mm 15mm 18mm; }
    * { box-sizing: border-box; }
    body { font-family: ${SERIF}; color: #111827; margin: 0; padding: 0; font-size: 12px; line-height: 1.45; }
    .letterhead { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px double ${BRAND_COLOR}; padding-bottom: 12px; margin-bottom: 16px; }
    .brand { display: flex; align-items: center; gap: 14px; }
    .brand-logo { height: 46px; width: auto; display: block; }
    .brand-title { font-size: 20px; font-weight: 700; color: ${BRAND_COLOR}; letter-spacing: 0.05em; line-height: 1; }
    .brand-sub { font-size: 9px; color: ${ACCENT}; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; margin-top: 4px; }
    .brand-address { font-size: 9px; color: #6b7280; margin-top: 6px; }
    .doc-meta { text-align: right; font-size: 10px; color: #374151; line-height: 1.75; }
    .doc-meta strong { color: ${BRAND_COLOR}; font-weight: 700; }
    .doc-heading { text-align: center; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px; margin-bottom: 14px; }
    .doc-kicker { font-size: 10px; color: #6b7280; letter-spacing: 0.26em; text-transform: uppercase; margin-bottom: 6px; }
    .doc-title { font-size: 19px; font-weight: 700; color: #111827; margin: 0 0 4px 0; }
    .doc-subtitle { font-size: 12px; color: #6b7280; margin: 0; font-style: italic; }
    .summary-grid { display: flex; gap: 10px; margin: 14px 0; flex-wrap: wrap; }
    .summary-card { flex: 1; min-width: 132px; background: #faf7f0; border: 1px solid #e0d5bd; border-top: 2px solid ${BRAND_COLOR}; padding: 9px 12px; text-align: center; }
    .summary-label { font-size: 9px; color: #854d0e; text-transform: uppercase; font-weight: 700; letter-spacing: 0.09em; }
    .summary-value { font-size: 17px; font-weight: 700; color: ${BRAND_COLOR}; margin-top: 3px; }
    table.doc-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10.5px; }
    table.doc-table th { background: ${BRAND_COLOR}; color: #ffffff; text-align: left; padding: 8px 9px; border: 1px solid ${BRAND_COLOR_LIGHT}; font-weight: 700; letter-spacing: 0.02em; }
    table.doc-table td { padding: 7px 9px; border: 1px solid #b8b2a8; }
    table.doc-table tr.even td { background-color: #ffffff; }
    table.doc-table tr.odd td { background-color: #f7f5f2; }
    td.empty-note { text-align: center; font-style: italic; color: #6b7280; padding: 14px; }
    .signoff { display: flex; justify-content: space-between; margin-top: 42px; font-size: 11px; color: #111827; }
    .sign-line { border-bottom: 1px solid #111827; height: 34px; }
    .sign-prepared { width: 230px; }
    .sign-noted { width: 180px; text-align: left; }
    .sign-name { font-weight: 700; margin-top: 4px; }
    .sign-role { font-size: 9.5px; color: #6b7280; }
    .footer { margin-top: 30px; border-top: 1px solid #d8d3c8; padding-top: 8px; font-size: 9px; color: #8a8a8a; display: flex; justify-content: space-between; }
    .footer .confidential { text-align: right; max-width: 46%; }
  </style>
</head>
<body>
  <div class="letterhead">
    <div>
      ${letterheadHtml({})}
      <div class="brand-address">${escapeHtml(ADDRESS)}</div>
    </div>
    <div class="doc-meta">
      <div><strong>Document Control No.:</strong> ${escapeHtml(refNo)}</div>
      <div><strong>Date of Issue:</strong> ${escapeHtml(generatedAt)}</div>
      <div><strong>Prepared by:</strong> ${escapeHtml(preparedBy)}</div>
      <div><strong>Department:</strong> ${escapeHtml(preparedByDept)}</div>
    </div>
  </div>
  <div class="doc-heading">
    <div class="doc-kicker">Management Report</div>
    <div class="doc-title">${escapeHtml(report.title)}</div>
    <p class="doc-subtitle">${escapeHtml(report.subtitle || `${BRAND} · ${BRAND_SUB}`)}</p>
  </div>
  ${summaryHtml}
  <table class="doc-table">
    <thead><tr>${tableHeaders}</tr></thead>
    <tbody>${tableRows}${emptyRowNote}</tbody>
  </table>
  <div class="signoff">
    <div>
      <div class="sign-line sign-prepared"></div>
      <div class="sign-name">${escapeHtml(preparedBy)}</div>
      <div class="sign-role">${escapeHtml(preparedByTitle)} · ${escapeHtml(preparedByDept)}</div>
    </div>
    <div>
      <div class="sign-line sign-noted"></div>
      <div class="sign-name">&nbsp;</div>
      <div class="sign-role">Noted / Received by — signature over printed name, date</div>
    </div>
  </div>
  <div class="footer">
    <span>${escapeHtml(ADDRESS)} &bull; ${escapeHtml(CONTACT)}</span>
    <span class="confidential">A system-generated record of the ${escapeHtml(BRAND)} Human Resources Management System &bull; Strictly confidential</span>
  </div>
  <script>
    function __printReport() { window.focus(); window.print(); }
    if (document.readyState === "complete") { setTimeout(__printReport, 300); }
    else { window.addEventListener("load", function () { setTimeout(__printReport, 300); }); }
  </script>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    const w = window.open("", "_blank");
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    } else {
      alert("Unable to open the report. Please allow popups for this site.");
    }
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const remove = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 800);
  };
  iframe.contentWindow?.focus();
  try {
    iframe.contentWindow?.print();
  } catch {
    /* ignore */
  }
  remove();
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
