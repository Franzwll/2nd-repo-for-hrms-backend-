/**
 * Utility to print only the official payslip receipt cleanly in an isolated frame or window.
 * Guarantees zero dark mode interference, zero background bleed, and a 1-page pristine white receipt.
 */
export function printReceipt(elementId: string = "official-payslip-receipt", title: string = "Oxford Suites Makati - Official Pay Advice") {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Create an isolated iframe for clean printing
  let printFrame = document.getElementById("payslip-print-frame") as HTMLIFrameElement | null;
  if (printFrame) {
    document.body.removeChild(printFrame);
  }

  printFrame = document.createElement("iframe");
  printFrame.id = "payslip-print-frame";
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "none";
  printFrame.style.zIndex = "-9999";
  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentWindow?.document;
  if (!frameDoc) {
    window.print();
    return;
  }

  // Collect all stylesheet links and style tags from current document
  const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join("\n");

  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title></title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          }
          #official-payslip-receipt {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            padding: 24px !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
          }
          .print\\:hidden, button, [role="button"] {
            display: none !important;
          }
        </style>
      </head>
      <body class="light bg-white text-slate-900">
        <div>
          ${element.outerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 250);
          };
        </script>
      </body>
    </html>
  `);
  frameDoc.close();
}
