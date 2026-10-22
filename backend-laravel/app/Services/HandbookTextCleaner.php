<?php

namespace App\Services;

/**
 * Tidies text extracted from a generated PDF handbook before it is cached as a
 * course's reading material.
 *
 * The extractor returns the PDF exactly as rendered, so every page's running
 * header/footer and the table of contents come along for the ride. That noise
 * pollutes the reader's text view and, worse, the deterministic quiz fallback -
 * which ranks frequent terms and would happily build a question about the
 * phrase "printed copies are uncontrolled".
 *
 * Deliberately conservative: it only strips the known running header/footer and
 * the leading contents block, and normalises bullet glyphs. Real prose is left
 * untouched.
 */
class HandbookTextCleaner
{
    public static function clean(string $text): string
    {
        if (trim($text) === '') {
            return '';
        }

        $text = str_replace(["\r\n", "\r"], "\n", $text);

        // pdfium renders some bullets as "(cid:127)"-style artifacts.
        $text = (string) preg_replace('/\(cid:\d+\)/', '-', $text);

        $out = [];
        $inToc = false;

        foreach (explode("\n", $text) as $line) {
            $trimmed = trim($line);

            if ($trimmed !== '' && self::isRunningHeaderFooter($trimmed)) {
                continue;
            }

            if (! $inToc && preg_match('/^contents$/i', $trimmed) === 1) {
                $inToc = true;
                continue;
            }

            if ($inToc) {
                if (self::isContentsEntry($trimmed)) {
                    continue;
                }
                // Anything else is the first real heading/body line, so the
                // contents block has ended.
                $inToc = false;
            }

            $out[] = $line;
        }

        // Collapse the blank runs left behind by the removed headers.
        $clean = (string) preg_replace("/\n{3,}/", "\n\n", implode("\n", $out));

        return trim($clean);
    }

    /** A page's running header/footer in the generated handbook. */
    private static function isRunningHeaderFooter(string $line): bool
    {
        return preg_match('/^internal use only\b.*printed copies are uncontrolled.*page \d+ of \d+$/i', $line) === 1
            || preg_match('/^fire safety and emergency response handbook\b.*\brev\.?\s*\d/i', $line) === 1
            || preg_match('/^os-hr-saf-\d+\s*[|·-]\s*rev\.?\s*\d/i', $line) === 1
            || preg_match('/^\d{1,3}\s*\|\s*rev\.?\s*\d/i', $line) === 1
            // Any running footer that carries the document code + revision,
            // e.g. "Oxford Suites ... | OS-HR-SAF-003 | Rev. 4.0".
            || (preg_match('/\bos-hr-saf-\d+\b/i', $line) === 1 && preg_match('/\brev\.?\s*\d/i', $line) === 1);
    }

    /** One line of the leading table of contents. */
    private static function isContentsEntry(string $line): bool
    {
        if ($line === '') {
            return true;
        }

        // Dot leaders, with or without a trailing page number.
        if (preg_match('/(?:\.\s){2,}/', $line) === 1) {
            return true;
        }

        // "Contents 2", "Document control 5", "1. Purpose, scope, and policy 6",
        // "4. Fire science: how fire starts and spreads 9" - i.e. a title line
        // ending in a page number (with or without leading numbering).
        return preg_match('/^(?:[\d.]+[.)]?\s+)?\S.*\s+\d{1,3}\s*$/', $line) === 1;
    }
}
