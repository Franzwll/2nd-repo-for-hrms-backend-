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

/**
 * Pure JavaScript PDF 1.4 Binary Generator for Corporate Training Certificates.
 * Zero external dependencies, SSR-safe, instantaneous vector PDF download.
 */
function createCertificatePdfBinary(data: CertificatePdfData): Uint8Array {
  const company = data.companyName || "OXFORD SUITES MAKATI";
  const recipient = data.recipientName || "Employee";
  const role = data.recipientRole || "Hotel Staff";
  const dept = data.recipientDepartment || "General Operations";
  const course = data.courseTitle;
  const category = data.category || "Hospitality & Compliance";
  const date = data.completedDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const score = data.score || "95%";
  const verification = data.verificationCode || `LMS-OXF-${Math.floor(100000 + Math.random() * 900000)}`;

  // Landscape A4 dimensions in points: 842 x 595
  const streamLines = [
    "q",
    // Outer border (Navy / Gold theme)
    "0.7 0.55 0.2 rg", // Gold accent border
    "3 w",
    "30 30 782 535 re S",
    "0.1 0.15 0.25 RG", // Dark Navy inner border
    "1.5 w",
    "36 36 770 523 re S",

    // Header: Company & Subtitle
    "BT",
    "/F1 14 Tf",
    "0.6 0.45 0.15 rg",
    "260 515 Td",
    `(${company.replace(/[()\\]/g, "")}  ·  LEARNING & DEVELOPMENT) Tj`,
    "ET",

    // Title: CERTIFICATE OF COMPLETION
    "BT",
    "/F2 26 Tf",
    "0.08 0.12 0.25 rg",
    "220 465 Td",
    "(CERTIFICATE OF COMPLETION) Tj",
    "ET",

    // Subtitle: Proudly presented to
    "BT",
    "/F1 12 Tf",
    "0.4 0.4 0.4 rg",
    "340 425 Td",
    "(This is proudly presented to) Tj",
    "ET",

    // Recipient Name
    "BT",
    "/F2 22 Tf",
    "0.08 0.12 0.25 rg",
    `280 385 Td`,
    `(${recipient.replace(/[()\\]/g, "")}) Tj`,
    "ET",

    // Recipient Role & Department
    "BT",
    "/F1 11 Tf",
    "0.35 0.35 0.35 rg",
    "320 360 Td",
    `(${role.replace(/[()\\]/g, "")}  ·  ${dept.replace(/[()\\]/g, "")}) Tj`,
    "ET",

    // Horizontal divider
    "0.8 0.8 0.8 RG",
    "1 w",
    "150 340 m 692 340 l S",

    // Text: For successfully completing
    "BT",
    "/F1 11 Tf",
    "0.4 0.4 0.4 rg",
    "265 315 Td",
    "(For successfully completing the corporate learning curriculum) Tj",
    "ET",

    // Course Title
    "BT",
    "/F2 16 Tf",
    "0.15 0.3 0.6 rg",
    "200 280 Td",
    `(${course.replace(/[()\\]/g, "")}) Tj`,
    "ET",

    // Badges / Metadata: Category, Score, Date
    "BT",
    "/F1 10 Tf",
    "0.25 0.25 0.25 rg",
    "210 240 Td",
    `(Category: ${category.replace(/[()\\]/g, "")}    |    Score: ${score.replace(/[()\\]/g, "")}    |    Date: ${date.replace(/[()\\]/g, "")}) Tj`,
    "ET",

    // Verification ID
    "BT",
    "/F1 9 Tf",
    "0.5 0.5 0.5 rg",
    "325 210 Td",
    `(Credential ID: ${verification.replace(/[()\\]/g, "")}) Tj`,
    "ET",

    // Signatures Line
    "0.7 0.7 0.7 RG",
    "1 w",
    "120 120 m 280 120 l S",
    "562 120 m 722 120 l S",

    // Signatures Text
    "BT",
    "/F2 10 Tf",
    "0.1 0.15 0.25 rg",
    "150 105 Td",
    "(L&D Director) Tj",
    "ET",
    "BT",
    "/F1 9 Tf",
    "0.4 0.4 0.4 rg",
    "145 92 Td",
    "(Oxford Suites PH) Tj",
    "ET",

    "BT",
    "/F2 10 Tf",
    "0.1 0.15 0.25 rg",
    "590 105 Td",
    "(HR Administration) Tj",
    "ET",
    "BT",
    "/F1 9 Tf",
    "0.4 0.4 0.4 rg",
    "575 92 Td",
    "(Corporate Compliance) Tj",
    "ET",

    // Footer Security note
    "BT",
    "/F1 8 Tf",
    "0.6 0.6 0.6 rg",
    "250 50 Td",
    "(Official permanent training record securely certified in Oxford Suites HRMS) Tj",
    "ET",

    "Q",
  ];

  const streamContent = streamLines.join("\n");
  const streamLength = streamContent.length;

  const objects = [
    "%PDF-1.4\n%âãÏÓ",
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj`,
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
    `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`,
  ];

  let body = "";
  const xrefOffsets: number[] = [0];

  let currentOffset = objects[0].length + 1;
  for (let i = 1; i < objects.length; i++) {
    xrefOffsets.push(currentOffset);
    body += objects[i] + "\n";
    currentOffset += objects[i].length + 1;
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
