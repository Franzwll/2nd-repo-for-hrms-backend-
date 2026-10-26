/**
 * Prints a single element in an isolated iframe.
 *
 * Printing a document that lives inside a modal/portal is fragile: fixed
 * positioning, translate-based centering, and global print rules can clip the
 * content or split it across pages. Cloning the element into a clean document
 * guarantees only that element is printed, laid out on its own page.
 */
export interface PrintElementOptions {
  /** id of the element to print. */
  elementId: string;
  /** Document title used by the browser print dialog. */
  title?: string;
  /** id for the temporary iframe (lets repeat prints reuse/cleanup). */
  frameId?: string;
  /** CSS appended after the app styles, so it wins on equal specificity. */
  extraCss?: string;
  /** Optional class names for the iframe body. */
  bodyClass?: string;
}

export function printElement({
  elementId,
  title = "Print",
  frameId = "print-element-frame",
  extraCss = "",
  bodyClass = "",
}: PrintElementOptions) {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Remove any previous print frame so repeated clicks stay clean.
  document.getElementById(frameId)?.remove();

  const frame = document.createElement("iframe");
  frame.id = frameId;
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "none";
  frame.style.zIndex = "-9999";
  document.body.appendChild(frame);

  const frameDoc = frame.contentWindow?.document;
  if (!frameDoc) {
    frame.remove();
    window.print();
    return;
  }

  // Reuse the app's compiled styles so utility classes still apply.
  const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join("\n");

  frameDoc.open();
  frameDoc.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${headStyles}
    <style>
      @page { size: A4 portrait; margin: 0 !important; }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #0f172a !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Undo the app's "hide everything" print rules. */
      body * { visibility: visible !important; }
      ${extraCss}
    </style>
  </head>
  <body class="${bodyClass}">
    <div id="print-element-root">${element.outerHTML}</div>
    <script>
      window.onload = function () {
        var go = function () {
          setTimeout(function () {
            window.focus();
            window.print();
          }, 300);
        };
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(go);
        } else {
          go();
        }
      };
    </script>
  </body>
</html>`);
  frameDoc.close();
}
