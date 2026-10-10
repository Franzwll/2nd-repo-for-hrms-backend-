export interface CertificatePdfData {
  companyName?: string;
  recipientName?: string;
  recipientRole?: string;
  recipientDepartment?: string;
  courseTitle: string;
  category?: string;
  completedDate?: string;
  score?: string;
  verificationCode?: string;
}

/* ------------------------------------------------------------------ */
/* WinAnsi text encoding.                                               */
/* PDF Type1 base fonts only understand single-byte WinAnsi. Emitting   */
/* raw UTF-8 (e.g. "·" = 0xC2 0xB7) renders as garbage glyphs AND breaks */
/* the xref table, because string length != byte length. Every string   */
/* below is encoded to WinAnsi bytes before it touches the PDF.         */
/* ------------------------------------------------------------------ */

const WIN_ANSI_PUNCT: Record<string, number> = {
  "·": 0xb7, // middle dot (header / role separators)
  "•": 0x95, // bullet
  "–": 0x96, // en dash
  "—": 0x97, // em dash
  "‘": 0x92,
  "’": 0x92,
  "‚": 0x82,
  "“": 0x93,
  "”": 0x94,
  "„": 0x84,
  "…": 0x85, // ellipsis
  "ñ": 0xf1,
  "Ñ": 0xd1,
  "é": 0xe9,
  "É": 0xc9,
  "è": 0xe8,
  "ê": 0xea,
  "ë": 0xeb,
  "á": 0xe1,
  "Á": 0xc1,
  "à": 0xe0,
  "â": 0xe2,
  "ä": 0xe4,
  "í": 0xed,
  "Í": 0xcd,
  "ì": 0xec,
  "ó": 0xf3,
  "Ó": 0xd3,
  "ò": 0xf2,
  "ô": 0xf4,
  "ö": 0xf6,
  "ú": 0xfa,
  "Ú": 0xda,
  "ù": 0xf9,
  "ü": 0xfc,
  "ç": 0xe7,
  "Ç": 0xc7,
  "°": 0xb0,
  "©": 0xa9,
  "®": 0xae,
};

/** Strip PDF-literal delimiters, then map every char to one WinAnsi byte. */
function winAnsiBytes(value: string): number[] {
  const out: number[] = [];
  const clean = value.replace(/[()\\]/g, "");
  for (const ch of clean) {
    const cp = ch.codePointAt(0) ?? 0x3f;
    if (cp < 128) {
      out.push(cp);
    } else if (WIN_ANSI_PUNCT[ch] !== undefined) {
      out.push(WIN_ANSI_PUNCT[ch]);
    } else if (cp <= 0xff) {
      out.push(cp);
    } else {
      out.push(0x2d); // "-" fallback for anything outside WinAnsi
    }
  }
  return out;
}

/** WinAnsi-safe string for measuring (same transform the PDF draws). */
function printable(value: string): string {
  return Array.from(value.replace(/[()\\]/g, ""), (ch) => {
    const cp = ch.codePointAt(0) ?? 0x3f;
    if (cp < 128 || WIN_ANSI_PUNCT[ch] !== undefined || cp <= 0xff) return ch;
    return "-";
  }).join("");
}

function asciiBytes(value: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < value.length; i++) out.push(value.charCodeAt(i) & 0xff);
  return out;
}

/**
 * Pure JavaScript PDF 1.4 Binary Generator for Corporate Training Certificates.
 * Zero external dependencies, SSR-safe, instantaneous vector PDF download.
 */
function createCertificatePdfBinary(data: CertificatePdfData): Uint8Array<ArrayBuffer> {
  const company = data.companyName || "OXFORD SUITES MAKATI";
  const recipient = data.recipientName || "Employee";
  const role = data.recipientRole || "Hotel Staff";
  const dept = data.recipientDepartment || "General Operations";
  const course = data.courseTitle;
  const category = data.category || "Hospitality & Compliance";
  const date =
    data.completedDate ||
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const score = data.score || "95%";
  const verification = data.verificationCode || `LMS-OXF-${Math.floor(100000 + Math.random() * 900000)}`;

  // Landscape A4 dimensions in points: 842 x 595. Page horizontal center: 421.
  const CX = 421;
  // Approximate Helvetica advance-width factors (avg glyph width / font size).
  const F_CAPS_BOLD = 0.62; // all-caps bold titles
  const F_BOLD = 0.56; // mixed-case bold
  const F_REG = 0.5; // regular
  const cx = (text: string, size: number, f: number) =>
    Math.round(CX - (printable(text).length * size * f) / 2);

  const headerLine = `${company}  ·  LEARNING & DEVELOPMENT`;
  const roleLine = `${role}  ·  ${dept}`;
  const metaLine = `Category: ${category}    |    Score: ${score}    |    Date: ${date}`;
  const credLine = `Credential ID: ${verification}`;
  const footerLine = "Official permanent training record securely certified in Oxford Suites HRMS";

  const leftSigX1 = 150;
  const leftSigX2 = 290;
  const rightSigX1 = 552;
  const rightSigX2 = 692;
  const leftSigCX = (leftSigX1 + leftSigX2) / 2;
  const rightSigCX = (rightSigX1 + rightSigX2) / 2;
  const sigNameL = "L&D Director";
  const sigSubL = "Oxford Suites PH";
  const sigNameR = "HR Administration";
  const sigSubR = "Corporate Compliance";

  // Content stream as raw bytes (never a JS string — byte length is exact).
  const S: number[] = [];
  const push = (...parts: (number[] | string)[]) => {
    for (const p of parts) {
      if (typeof p === "string") S.push(...asciiBytes(p));
      else S.push(...p);
    }
  };
  /** ( text ) Tj — WinAnsi-encoded PDF literal. */
  const tj = (text: string) => [0x28, ...winAnsiBytes(text), 0x29, 0x20, 0x54, 0x6a]; // "(...) Tj"
  /** BT /Fn size Tf  R G B rg  x y Td */
  const textAt = (font: string, size: number, r: number, g: number, b: number, x: number, y: number) =>
    `BT\n/${font} ${size} Tf\n${r} ${g} ${b} rg\n${x} ${y} Td\n`;

  push("q\n");
  // Outer border (gold) + inner border (dark navy)
  push("0.7 0.55 0.2 rg\n3 w\n30 30 782 535 re S\n");
  push("0.1 0.15 0.25 RG\n1.5 w\n36 36 770 523 re S\n");

  // Header: company · Learning & Development (centered, gold)
  push(textAt("F1", 13, 0.6, 0.45, 0.15, cx(headerLine, 13, 0.58), 545));
  push(tj(headerLine), "\nET\n");
  // Gold accent rule beneath the header
  push("0.7 0.55 0.2 RG\n1.2 w\n331 528 m 511 528 l S\n");

  // Title (centered, navy)
  const title = "CERTIFICATE OF COMPLETION";
  push(textAt("F2", 25, 0.08, 0.12, 0.25, cx(title, 25, F_CAPS_BOLD), 488));
  push(tj(title), "\nET\n");

  // Presented-to line (centered, gray)
  const presented = "This is proudly presented to";
  push(textAt("F1", 11.5, 0.4, 0.4, 0.4, cx(presented, 11.5, F_REG), 452));
  push(tj(presented), "\nET\n");

  // Recipient name (centered, navy bold)
  push(textAt("F2", 21, 0.08, 0.12, 0.25, cx(recipient, 21, F_BOLD), 416));
  push(tj(recipient), "\nET\n");

  // Role · department (centered, gray)
  push(textAt("F1", 10.5, 0.35, 0.35, 0.35, cx(roleLine, 10.5, F_REG), 392));
  push(tj(roleLine), "\nET\n");

  // Horizontal divider (symmetric around center)
  push("0.8 0.8 0.8 RG\n1 w\n170 368 m 672 368 l S\n");

  // Curriculum line (centered)
  const curriculum = "For successfully completing the corporate learning curriculum";
  push(textAt("F1", 11, 0.4, 0.4, 0.4, cx(curriculum, 11, F_REG), 342));
  push(tj(curriculum), "\nET\n");

  // Course title (centered, brand blue bold)
  push(textAt("F2", 15, 0.15, 0.3, 0.6, cx(course, 15, F_BOLD), 312));
  push(tj(course), "\nET\n");

  // Metadata line (centered)
  push(textAt("F1", 10, 0.25, 0.25, 0.25, cx(metaLine, 10, F_REG), 278));
  push(tj(metaLine), "\nET\n");

  // Credential ID (centered)
  push(textAt("F1", 8.5, 0.5, 0.5, 0.5, cx(credLine, 8.5, F_REG), 248));
  push(tj(credLine), "\nET\n");

  // Signature rules (symmetric pair)
  push(
    "0.7 0.7 0.7 RG\n1 w\n" +
      `${leftSigX1} 168 m ${leftSigX2} 168 l S\n` +
      `${rightSigX1} 168 m ${rightSigX2} 168 l S\n`
  );

  // Signature captions, each centered over its rule
  push(textAt("F2", 9.5, 0.1, 0.15, 0.25, Math.round(leftSigCX - (printable(sigNameL).length * 9.5 * F_BOLD) / 2), 154));
  push(tj(sigNameL), "\nET\n");
  push(textAt("F1", 8.5, 0.4, 0.4, 0.4, Math.round(leftSigCX - (printable(sigSubL).length * 8.5 * F_REG) / 2), 142));
  push(tj(sigSubL), "\nET\n");
  push(textAt("F2", 9.5, 0.1, 0.15, 0.25, Math.round(rightSigCX - (printable(sigNameR).length * 9.5 * F_BOLD) / 2), 154));
  push(tj(sigNameR), "\nET\n");
  push(textAt("F1", 8.5, 0.4, 0.4, 0.4, Math.round(rightSigCX - (printable(sigSubR).length * 8.5 * F_REG) / 2), 142));
  push(tj(sigSubR), "\nET\n");

  // Footer security note (centered)
  push(textAt("F1", 8, 0.6, 0.6, 0.6, cx(footerLine, 8, F_REG), 62));
  push(tj(footerLine), "\nET\n");

  push("Q\n");

  const streamLength = S.length;

  const enc = (s: string): number[] => asciiBytes(s);
  const header: number[] = enc("%PDF-1.4\n%âãÏÓ\n");
  const obj1 = enc(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  const obj2 = enc(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
  const obj3 = enc(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`
  );
  const obj4Head = enc(`4 0 obj\n<< /Length ${streamLength} >>\nstream\n`);
  const obj4Tail = enc(`\nendstream\nendobj\n`);
  const obj5 = enc(
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`
  );
  const obj6 = enc(
    `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`
  );

  // Rebuild deterministically: header, then objects 1..6 in order.
  // Offsets are exact byte counts (no string-length guessing).
  const body: number[] = [...header];
  const starts: number[] = [0];
  const ordered: number[][] = [obj1, obj2, obj3, [...obj4Head, ...S, ...obj4Tail], obj5, obj6];
  for (const o of ordered) {
    starts.push(body.length);
    body.push(...o);
  }
  const startXref = body.length;

  let xrefStr = `xref\n0 7\n0000000000 65535 f \n`;
  for (let i = 1; i <= 6; i++) {
    xrefStr += `${String(starts[i]).padStart(10, "0")} 00000 n \n`;
  }
  const trailerStr =
    `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  return Uint8Array.from([...body, ...enc(xrefStr), ...enc(trailerStr)]);
}

/**
 * Downloads a corporate LMS certificate as a PDF in the user's browser.
 */
export async function downloadCertificatePdf(
  filename: string,
  data: CertificatePdfData
): Promise<void> {
  const binary = createCertificatePdfBinary(data);
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
