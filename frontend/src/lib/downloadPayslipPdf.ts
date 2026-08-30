import { myProfile, myPayroll } from "@/data/ess";
import { numberToWords } from "@/lib/numberToWords";

export interface PayslipPdfData {
  companyName?: string;
  companyAddress?: string;
  employeeName?: string;
  employeeId?: string;
  designation?: string;
  department?: string;
  dateOfJoining?: string;
  payPeriod?: string;
  payDate?: string;
  paidDays?: number;
  lopDays?: number;
  bankAccount?: string;
  tin?: string;
  sss?: string;
  philHealth?: string;
  pagIbig?: string;
  earnings?: Array<{ label: string; amount: number; ytd?: number }>;
  deductions?: Array<{ label: string; amount: number; ytd?: number }>;
  netPay?: number;
}

/**
 * Pure JavaScript PDF 1.4 Binary Generator.
 * Zero external dependencies, 100% SSR-safe, immune to Vite bundling/MIME issues.
 * Generates an ultra-crisp vector A4 PDF with perfect typography and enterprise styling.
 */
function createPayslipPdfBinary(data: PayslipPdfData): Uint8Array {
  const companyName = (data.companyName || "OXFORD SUITES MAKATI").toUpperCase();
  const address = data.companyAddress || "7840 Makati Avenue, Poblacion, Makati City, Philippines 1210";
  const empName = data.employeeName || myProfile.name || "Kevin Santos";
  const empId = data.employeeId || myProfile.employeeId || "OSM-2026-0142";
  const designation = data.designation || myProfile.position || "Line Cook";
  const dept = data.department || myProfile.department || "Kitchen / Culinary";
  const dateHired = data.dateOfJoining || "15/04/2026";
  const payPeriod = data.payPeriod || "2026-07-01 – 07-15";
  const payDate = data.payDate || "05/08/2026";
  const paidDays = data.paidDays ?? 15;
  const lopDays = data.lopDays ?? 0;
  const bankAcct = data.bankAccount || "BDO ****4412";
  const tin = data.tin || "123-456-789-000";
  const sss = data.sss || "34-1234567-8";
  const philHealth = data.philHealth || "12-345678901-2";
  const pagIbig = data.pagIbig || "1234-5678-9012";

  const earnings = data.earnings || [
    { label: "Basic Pay", amount: 16000, ytd: 112000 },
    { label: "Overtime Pay", amount: 2100, ytd: 14700 },
    { label: "Night Differential", amount: 900, ytd: 6300 },
    { label: "Meal Allowance", amount: 1500, ytd: 10500 },
    { label: "Service Charge Share", amount: 1000, ytd: 7000 },
  ];

  const deductions = data.deductions || [
    { label: "SSS Contribution", amount: 900, ytd: 6300 },
    { label: "PhilHealth Premium", amount: 550, ytd: 3850 },
    { label: "Pag-IBIG HDMF", amount: 200, ytd: 1400 },
    { label: "Withholding Tax (BIR)", amount: 1160, ytd: 8120 },
    { label: "Company Salary Loan", amount: 450, ytd: 3150 },
  ];

  const grossEarnings = earnings.reduce((s, i) => s + (i.amount || 0), 0);
  const totalDeductions = deductions.reduce((s, i) => s + (i.amount || 0), 0);
  const netPay = data.netPay ?? (grossEarnings - totalDeductions);
  const words = numberToWords(netPay);

  // A4 dimensions: 595.28 x 841.89 points
  const W = 595.28;
  const H = 841.89;
  const margin = 36;
  const contentWidth = W - margin * 2; // 523.28

  const ops: string[] = [];

  // Helper drawing functions
  const formatNum = (n?: number) => {
    if (n === undefined || isNaN(n)) return "0.00";
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const escapePdf = (text: string) => {
    return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  };

  const drawRect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number, fill = true, stroke = false) => {
    ops.push("q");
    if (fill) {
      ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
    }
    if (stroke) {
      ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG 0.75 w`);
    }
    ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill && stroke ? "B" : fill ? "f" : "s"}`);
    ops.push("Q");
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, r = 0.8, g = 0.8, b = 0.8, w = 0.75) => {
    ops.push("q");
    ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG ${w} w`);
    ops.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
    ops.push("Q");
  };

  const drawText = (text: string, x: number, y: number, font: "/F1" | "/F2" | "/F3" = "/F1", size = 9, r = 0.1, g = 0.1, b = 0.1, align: "left" | "right" | "center" = "left", targetWidth = 0) => {
    ops.push("q");
    ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
    ops.push("BT");
    ops.push(`${font} ${size} Tf`);

    // Approximate text offset for right align
    let finalX = x;
    if (align === "right" && targetWidth > 0) {
      const approxCharWidth = size * 0.52;
      const textLen = text.length * approxCharWidth;
      finalX = x + targetWidth - textLen;
    } else if (align === "center" && targetWidth > 0) {
      const approxCharWidth = size * 0.52;
      const textLen = text.length * approxCharWidth;
      finalX = x + (targetWidth - textLen) / 2;
    }

    ops.push(`${finalX.toFixed(2)} ${y.toFixed(2)} Td (${escapePdf(text)}) Tj`);
    ops.push("ET");
    ops.push("Q");
  };

  // --- 1. Background White Base ---
  drawRect(0, 0, W, H, 1, 1, 1);

  // Outer border
  drawRect(margin - 8, margin - 8, contentWidth + 16, H - (margin - 8) * 2, 0.88, 0.9, 0.93, false, true);

  // --- 2. Header ---
  let cursorY = H - margin - 20;

  // Maroon brand indicator
  drawRect(margin, cursorY - 2, 4, 32, 0.45, 0.05, 0.12);

  // Company Name & Address
  drawText(companyName, margin + 12, cursorY + 18, "/F2", 14, 0.35, 0.05, 0.1);
  drawText(address, margin + 12, cursorY + 4, "/F1", 8, 0.45, 0.45, 0.45);

  // Right side: Period
  drawText("PAYSLIP FOR THE PERIOD", margin + contentWidth - 180, cursorY + 18, "/F2", 8.5, 0.4, 0.4, 0.4, "right", 180);
  drawText(payPeriod, margin + contentWidth - 180, cursorY + 4, "/F2", 12, 0.1, 0.1, 0.1, "right", 180);

  cursorY -= 16;
  drawLine(margin, cursorY, margin + contentWidth, cursorY, 0.88, 0.9, 0.93, 1);

  // --- 3. Employee Summary & Net Pay Card ---
  cursorY -= 18;
  drawText("EMPLOYEE SUMMARY", margin, cursorY, "/F2", 9, 0.35, 0.35, 0.35);

  cursorY -= 8;
  const summaryTop = cursorY;

  // Left 70% Summary Details
  const leftColX = margin;
  const midColX = margin + 155;

  const leftItems = [
    { label: "Employee Name", val: `: ${empName}` },
    { label: "Employee ID", val: `: ${empId}` },
    { label: "Designation", val: `: ${designation}` },
    { label: "Department", val: `: ${dept}` },
    { label: "Date of Joining", val: `: ${dateHired}` },
    { label: "Pay Date", val: `: ${payDate}` },
  ];

  let itemY = summaryTop - 8;
  for (let i = 0; i < leftItems.length; i += 2) {
    const it1 = leftItems[i];
    const it2 = leftItems[i + 1];

    if (it1) {
      drawText(it1.label, leftColX, itemY, "/F1", 8.5, 0.45, 0.45, 0.45);
      drawText(it1.val, leftColX + 72, itemY, "/F2", 8.5, 0.1, 0.1, 0.1);
    }
    if (it2) {
      drawText(it2.label, midColX, itemY, "/F1", 8.5, 0.45, 0.45, 0.45);
      drawText(it2.val, midColX + 72, itemY, "/F2", 8.5, 0.1, 0.1, 0.1);
    }
    itemY -= 15;
  }

  // Right 30%: Net Pay Highlight Box
  const cardX = margin + contentWidth - 170;
  const cardW = 170;
  const cardH = 58;
  const cardY = summaryTop - 62;

  // Soft emerald background box
  drawRect(cardX, cardY, cardW, cardH, 0.94, 0.98, 0.95, true, true);
  drawRect(cardX, cardY, 3.5, cardH, 0.05, 0.6, 0.35, true, false);

  drawText(`PHP ${formatNum(netPay)}`, cardX + 12, cardY + 38, "/F2", 15, 0.04, 0.45, 0.25);
  drawText("Employee Net Pay", cardX + 12, cardY + 26, "/F1", 8, 0.05, 0.5, 0.3);

  drawLine(cardX + 8, cardY + 20, cardX + cardW - 8, cardY + 20, 0.85, 0.92, 0.87, 0.75);

  drawText("Paid Days", cardX + 12, cardY + 7, "/F1", 8, 0.2, 0.4, 0.3);
  drawText(`: ${paidDays}`, cardX + 55, cardY + 7, "/F2", 8, 0.1, 0.1, 0.1);

  drawText("LOP / Unpaid", cardX + 85, cardY + 7, "/F1", 8, 0.2, 0.4, 0.3);
  drawText(`: ${lopDays}`, cardX + 145, cardY + 7, "/F2", 8, 0.1, 0.1, 0.1);

  // --- 4. Statutory Numbers Bar ---
  cursorY = cardY - 18;
  const statBarH = 26;
  drawRect(margin, cursorY - statBarH + 10, contentWidth, statBarH, 0.96, 0.97, 0.98, true, true);

  const statCols = [
    { label: "BANK A/C NUMBER", val: bankAcct },
    { label: "TIN", val: tin },
    { label: "SSS NUMBER", val: sss },
    { label: "PHILHEALTH", val: philHealth },
    { label: "PAG-IBIG (HDMF)", val: pagIbig },
  ];

  const colW = contentWidth / 5;
  for (let i = 0; i < statCols.length; i++) {
    const sx = margin + i * colW + 6;
    drawText(statCols[i].label, sx, cursorY + 2, "/F2", 6.5, 0.5, 0.5, 0.55);
    drawText(statCols[i].val, sx, cursorY - 9, "/F2", 7.5, 0.15, 0.15, 0.2);
  }

  // --- 5. Side-by-Side Earnings & Deductions Table ---
  cursorY -= 36;
  const tableTopY = cursorY;
  const tableW = contentWidth;
  const halfW = tableW / 2;

  // Header Row
  const headerH = 22;
  drawRect(margin, tableTopY - headerH, tableW, headerH, 0.93, 0.94, 0.96, true, true);

  // Earnings Header
  drawText("EARNINGS", margin + 8, tableTopY - 15, "/F2", 8, 0.3, 0.35, 0.4);
  drawText("AMOUNT", margin + halfW - 90, tableTopY - 15, "/F2", 8, 0.3, 0.35, 0.4, "right", 40);
  drawText("YTD", margin + halfW - 40, tableTopY - 15, "/F2", 8, 0.3, 0.35, 0.4, "right", 35);

  // Deductions Header
  drawText("DEDUCTIONS", margin + halfW + 8, tableTopY - 15, "/F2", 8, 0.3, 0.35, 0.4);
  drawText("AMOUNT", margin + tableW - 90, tableTopY - 15, "/F2", 8, 0.3, 0.35, 0.4, "right", 40);
  drawText("YTD", margin + tableW - 40, tableTopY - 15, "/F2", 8, 0.3, 0.35, 0.4, "right", 35);

  // Divider between Earnings and Deductions
  drawLine(margin + halfW, tableTopY, margin + halfW, tableTopY - headerH, 0.8, 0.82, 0.86);

  // Table Body Rows
  const maxRows = Math.max(earnings.length, deductions.length);
  const rowH = 18;
  let rowY = tableTopY - headerH;

  for (let r = 0; r < maxRows; r++) {
    const earn = earnings[r];
    const ded = deductions[r];

    // Subtle zebra background
    if (r % 2 === 1) {
      drawRect(margin, rowY - rowH, tableW, rowH, 0.98, 0.985, 0.99);
    }

    // Border line
    drawLine(margin, rowY, margin + tableW, rowY, 0.9, 0.92, 0.94, 0.5);
    drawLine(margin + halfW, rowY, margin + halfW, rowY - rowH, 0.9, 0.92, 0.94, 0.5);

    const textY = rowY - 12;

    if (earn && earn.label) {
      drawText(earn.label, margin + 8, textY, "/F1", 8, 0.2, 0.2, 0.2);
      drawText(`PHP ${formatNum(earn.amount)}`, margin + halfW - 90, textY, "/F2", 8, 0.1, 0.1, 0.1, "right", 40);
      drawText(`PHP ${formatNum(earn.ytd)}`, margin + halfW - 40, textY, "/F1", 7.5, 0.5, 0.5, 0.5, "right", 35);
    }

    if (ded && ded.label) {
      drawText(ded.label, margin + halfW + 8, textY, "/F1", 8, 0.2, 0.2, 0.2);
      drawText(`PHP ${formatNum(ded.amount)}`, margin + tableW - 90, textY, "/F2", 8, 0.75, 0.1, 0.15, "right", 40);
      drawText(`PHP ${formatNum(ded.ytd)}`, margin + tableW - 40, textY, "/F1", 7.5, 0.5, 0.5, 0.5, "right", 35);
    }

    rowY -= rowH;
  }

  // Totals Row
  const totalRowH = 22;
  drawRect(margin, rowY - totalRowH, tableW, totalRowH, 0.95, 0.96, 0.97, true, true);
  drawLine(margin + halfW, rowY, margin + halfW, rowY - totalRowH, 0.8, 0.82, 0.86);

  const totTextY = rowY - 14;
  drawText("Gross Earnings", margin + 8, totTextY, "/F2", 8.5, 0.15, 0.15, 0.15);
  drawText(`PHP ${formatNum(grossEarnings)}`, margin + halfW - 90, totTextY, "/F2", 9, 0.05, 0.55, 0.25, "right", 40);

  drawText("Total Deductions", margin + halfW + 8, totTextY, "/F2", 8.5, 0.15, 0.15, 0.15);
  drawText(`PHP ${formatNum(totalDeductions)}`, margin + tableW - 90, totTextY, "/F2", 9, 0.75, 0.1, 0.15, "right", 40);

  // Outer border of table
  drawRect(margin, rowY - totalRowH, tableW, tableTopY - (rowY - totalRowH), 0.8, 0.82, 0.86, false, true);

  // --- 6. Total Net Payable Banner ---
  cursorY = rowY - totalRowH - 16;
  const netBannerH = 38;
  drawRect(margin, cursorY - netBannerH, contentWidth, netBannerH, 0.96, 0.97, 0.98, true, true);

  drawText("TOTAL NET PAYABLE", margin + 12, cursorY - 15, "/F2", 9.5, 0.1, 0.1, 0.1);
  drawText("Gross Earnings - Total Deductions", margin + 12, cursorY - 27, "/F1", 7.5, 0.45, 0.45, 0.45);

  // Green Net Badge inside banner
  const badgeW = 125;
  const badgeH = 24;
  const badgeX = margin + contentWidth - badgeW - 10;
  const badgeY = cursorY - netBannerH + 7;

  drawRect(badgeX, badgeY, badgeW, badgeH, 0.88, 0.96, 0.9, true, true);
  drawText(`PHP ${formatNum(netPay)}`, badgeX, badgeY + 7, "/F2", 13, 0.04, 0.45, 0.2, "center", badgeW);

  // --- 7. Amount in Words ---
  cursorY = cursorY - netBannerH - 14;
  drawText("Amount In Words : ", margin + contentWidth - 320, cursorY, "/F1", 7.5, 0.45, 0.45, 0.45, "right", 120);
  drawText(words, margin + contentWidth - 200, cursorY, "/F2", 7.5, 0.15, 0.15, 0.15, "right", 200);

  // --- 8. Footer Disclaimer ---
  cursorY -= 16;
  drawLine(margin, cursorY, margin + contentWidth, cursorY, 0.88, 0.9, 0.93);

  cursorY -= 10;
  drawText("-- This document has been automatically generated by Oxford Suites Makati HRMS; therefore, a signature is not required. --", margin, cursorY, "/F3", 7, 0.55, 0.55, 0.55, "center", contentWidth);

  // Build Standard PDF 1.4 Object Stream
  const streamContent = ops.join("\n");
  const streamLength = new TextEncoder().encode(streamContent).length;

  const objects = [
    `%PDF-1.4\n%âãÏÓ`,
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W.toFixed(2)} ${H.toFixed(2)}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>\nendobj`,
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
    `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`,
    `7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\nendobj`,
  ];

  let body = "";
  const xrefOffsets = [0];

  for (let i = 1; i < objects.length; i++) {
    xrefOffsets.push(body.length + objects[0].length + 1);
    body += objects[i] + "\n";
  }

  const fullHeaderAndBody = objects[0] + "\n" + body;
  const startXref = fullHeaderAndBody.length;

  let xref = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < xrefOffsets.length; i++) {
    xref += String(xrefOffsets[i]).padStart(10, "0") + " 00000 n \n";
  }

  const trailer = `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
  const pdfString = fullHeaderAndBody + xref + trailer;

  return new TextEncoder().encode(pdfString);
}

/**
 * Downloads the official Oxford Suites Makati payslip PDF directly in the user's browser.
 * Instant, 100% native vector quality, zero bundler errors.
 */
export async function downloadPayslipPdf(
  elementId?: string,
  filename: string = "Oxford-Suites-Makati-Official-Payslip.pdf",
  data?: PayslipPdfData
): Promise<void> {
  const binary = createPayslipPdfBinary(data || {});
  const blob = new Blob([binary], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
