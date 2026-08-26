/**
 * Multi-format Report Exporter (PDF, DOCX, Excel) for HRMS Modules.
 */

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

export function exportReport(report: ReportData, format: ReportFormat): void {
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${new Date().toISOString().slice(0, 10)}`;

  if (format === "excel") {
    exportToCsv(report, `${filename}.csv`);
  } else if (format === "docx") {
    exportToWord(report, `${filename}.doc`, generatedAt);
  } else if (format === "pdf") {
    exportToPrintablePdf(report, generatedAt);
  }
}

/** Exports data to CSV / Excel spreadsheet format. */
function exportToCsv(report: ReportData, filename: string): void {
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines: string[] = [];
  lines.push(`"${report.title}"`);
  if (report.subtitle) lines.push(`"${report.subtitle}"`);
  lines.push(`"Generated: ${new Date().toLocaleString()}"`);
  lines.push("");

  if (report.summary && report.summary.length > 0) {
    lines.push(report.summary.map((s) => `${escapeCsv(s.label)}: ${escapeCsv(s.value)}`).join(","));
    lines.push("");
  }

  // Header row
  lines.push(report.columns.map((c) => escapeCsv(c.header)).join(","));

  // Data rows
  for (const row of report.rows) {
    lines.push(report.columns.map((c) => escapeCsv(row[c.key] ?? "")).join(","));
  }

  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}

/** Exports data to Microsoft Word compatible DOC format with styled tables. */
function exportToWord(report: ReportData, filename: string, generatedAt: string): void {
  const tableHeaders = report.columns
    .map(
      (c) =>
        `<th style="background-color:#520c19;color:#ffffff;padding:10px 8px;border:1px solid #7a1226;font-size:12px;text-align:left;">${c.header}</th>`,
    )
    .join("");

  const tableRows = report.rows
    .map(
      (row, idx) => `
      <tr style="background-color:${idx % 2 === 0 ? "#ffffff" : "#f9fafb"};">
        ${report.columns
          .map(
            (c) =>
              `<td style="padding:8px 8px;border:1px solid #e5e7eb;font-size:11px;color:#1f2937;">${row[c.key] ?? "—"}</td>`,
          )
          .join("")}
      </tr>`,
    )
    .join("");

  const summaryHtml = report.summary
    ? `
      <table style="width:100%;margin-bottom:16px;border-collapse:collapse;">
        <tr>
          ${report.summary
            .map(
              (s) => `
            <td style="padding:10px 14px;background-color:#fdfaf3;border:1px solid #e8dcc4;border-radius:6px;">
              <span style="font-size:10px;color:#854d0e;text-transform:uppercase;font-weight:bold;">${s.label}</span><br/>
              <span style="font-size:16px;color:#520c19;font-weight:bold;">${s.value}</span>
            </td>`,
            )
            .join("")}
        </tr>
      </table>`
    : "";

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${report.title}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; margin: 30px; }
        h1 { color: #520c19; font-size: 22px; margin: 0 0 4px 0; }
        .sub { color: #6b7280; font-size: 12px; margin: 0 0 16px 0; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 12px; }
      </style>
    </head>
    <body>
      <div>
        <div style="border-bottom:2px solid #520c19;padding-bottom:10px;margin-bottom:16px;">
          <h1>${report.title}</h1>
          <p class="sub">${report.subtitle || "Oxford Suites Makati &bull; HR Management System"} &bull; Generated on ${generatedAt}</p>
        </div>
        ${summaryHtml}
        <table class="data">
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(["\uFEFF" + html], { type: "application/msword;charset=utf-8" });
  triggerDownload(blob, filename);
}

/** Opens a print/PDF dialog with stylized printable layout. */
function exportToPrintablePdf(report: ReportData, generatedAt: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate and print PDF reports.");
    return;
  }

  const tableHeaders = report.columns
    .map((c) => `<th style="width:${c.width || "auto"};">${c.header}</th>`)
    .join("");

  const tableRows = report.rows
    .map(
      (row, idx) => `
      <tr class="${idx % 2 === 0 ? "even" : "odd"}">
        ${report.columns.map((c) => `<td>${row[c.key] ?? "—"}</td>`).join("")}
      </tr>`,
    )
    .join("");

  const summaryHtml = report.summary
    ? `
      <div class="summary-grid">
        ${report.summary
          .map(
            (s) => `
          <div class="summary-card">
            <div class="summary-label">${s.label}</div>
            <div class="summary-value">${s.value}</div>
          </div>`,
          )
          .join("")}
      </div>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${report.title} — Oxford Suites Makati</title>
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; color: #1f2937; margin: 0; padding: 20px; font-size: 12px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #520c19; padding-bottom: 12px; margin-bottom: 16px; }
        .brand-title { font-size: 20px; font-weight: bold; color: #520c19; margin: 0; }
        .brand-sub { font-size: 11px; color: #d4af37; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; margin: 2px 0 0 0; }
        .report-title { font-size: 18px; font-weight: bold; color: #111827; margin: 0 0 4px 0; }
        .report-meta { font-size: 11px; color: #6b7280; margin: 0; }
        .summary-grid { display: flex; gap: 12px; margin-bottom: 16px; }
        .summary-card { flex: 1; background: #faf6ef; border: 1px solid #e8dcc4; border-radius: 8px; padding: 8px 12px; }
        .summary-label { font-size: 10px; color: #854d0e; text-transform: uppercase; font-weight: bold; }
        .summary-value { font-size: 16px; font-weight: bold; color: #520c19; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #520c19; color: #ffffff; text-align: left; padding: 8px 10px; font-size: 11px; font-weight: 600; }
        td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
        tr.even { background-color: #ffffff; }
        tr.odd { background-color: #f9fafb; }
        .footer { margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom:16px;display:flex;justify-content:flex-end;gap:8px;">
        <button onclick="window.print()" style="background:#520c19;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;">Print / Save as PDF</button>
        <button onclick="window.close()" style="background:#e5e7eb;color:#374151;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;">Close</button>
      </div>
      <div class="header">
        <div>
          <div class="brand-title">OXFORD SUITES</div>
          <div class="brand-sub">Makati</div>
        </div>
        <div style="text-align:right;">
          <div class="report-title">${report.title}</div>
          <div class="report-meta">${report.subtitle || "HR Management System Report"} &bull; ${generatedAt}</div>
        </div>
      </div>
      ${summaryHtml}
      <table>
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">
        <span>Oxford Suites Makati &bull; 518 P. Burgos St., Makati, Metro Manila</span>
        <span>Confidential Internal Document</span>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
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
