<?php

namespace App\Services;

/**
 * Arial Bold advance-width metrics for the hiring-poster headline.
 *
 * The poster is composed as an SVG string (see
 * RecruitmentManagementController::posterResponse) and GD/Imagick are not part of
 * every deployment, so the position name cannot be measured with imagettfbbox().
 * These are the real Arial Bold advance widths (1000 units per em) and they let the
 * controller work out how big the position name may be drawn before it would run
 * under the building photo on storage/jobpost_picture/template.png.
 *
 * Estimates deliberately round up: a slightly smaller headline is fine, text that
 * drifts over the photo or the red shapes is not.
 */
class PosterTextMetrics
{
    private const UNITS_PER_EM = 1000;

    /** Arial Bold advance widths, 1000 units per em (ASCII 32..126). */
    private const ADVANCE = [
        ' ' => 278, '!' => 333, '"' => 474, '#' => 556, '$' => 556, '%' => 889,
        '&' => 722, "'" => 238, '(' => 333, ')' => 333, '*' => 389, '+' => 584,
        ',' => 278, '-' => 333, '.' => 278, '/' => 278, '0' => 556, '1' => 556,
        '2' => 556, '3' => 556, '4' => 556, '5' => 556, '6' => 556, '7' => 556,
        '8' => 556, '9' => 556, ':' => 333, ';' => 333, '<' => 584, '=' => 584,
        '>' => 584, '?' => 611, '@' => 975, 'A' => 722, 'B' => 722, 'C' => 722,
        'D' => 722, 'E' => 667, 'F' => 611, 'G' => 778, 'H' => 722, 'I' => 278,
        'J' => 556, 'K' => 722, 'L' => 611, 'M' => 833, 'N' => 722, 'O' => 778,
        'P' => 667, 'Q' => 778, 'R' => 722, 'S' => 667, 'T' => 611, 'U' => 722,
        'V' => 667, 'W' => 944, 'X' => 667, 'Y' => 667, 'Z' => 611, '[' => 333,
        '\\' => 278, ']' => 333, '^' => 584, '_' => 556, '`' => 278, 'a' => 556,
        'b' => 611, 'c' => 556, 'd' => 611, 'e' => 556, 'f' => 333, 'g' => 611,
        'h' => 611, 'i' => 278, 'j' => 278, 'k' => 556, 'l' => 278, 'm' => 889,
        'n' => 611, 'o' => 611, 'p' => 611, 'q' => 611, 'r' => 389, 's' => 556,
        't' => 333, 'u' => 611, 'v' => 556, 'w' => 778, 'x' => 556, 'y' => 556,
        'z' => 500, '{' => 389, '|' => 280, '}' => 389, '~' => 584,
    ];

    /** Rendered width of $text at $fontSize, in poster pixels. */
    public static function width(string $text, float $fontSize): float
    {
        $units = 0;

        foreach (self::characters($text) as $character) {
            $units += self::ADVANCE[$character] ?? self::fallbackUnits($character);
        }

        return $units * $fontSize / self::UNITS_PER_EM;
    }

    /**
     * Largest whole font size between $preferred and $floor that keeps $text inside
     * $maxWidth. $floor is returned when even that is too wide.
     */
    public static function fitFontSize(string $text, float $maxWidth, int $preferred, int $floor = 20): int
    {
        for ($size = $preferred; $size > $floor; $size--) {
            if (self::width($text, $size) <= $maxWidth) {
                return $size;
            }
        }

        return $floor;
    }

    /**
     * Split a title into two lines of similar length, breaking on spaces only.
     * Titles without a usable break point come back as a single entry.
     *
     * @return array<int, string>
     */
    public static function splitBalanced(string $text): array
    {
        $words = preg_split('/\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        if (count($words) < 2) {
            return [$text];
        }

        $best = null;
        for ($split = 1; $split < count($words); $split++) {
            $first = implode(' ', array_slice($words, 0, $split));
            $second = implode(' ', array_slice($words, $split));
            $delta = abs(strlen($first) - strlen($second));

            if ($best === null || $delta < $best[0]) {
                $best = [$delta, $first, $second];
            }
        }

        return [$best[1], $best[2]];
    }

    /**
     * Shorten $text with an ellipsis until it fits $maxWidth at $fontSize, so a
     * freakishly long position name still stays on the poster's white sheet.
     */
    public static function truncate(string $text, float $maxWidth, float $fontSize): string
    {
        if (self::width($text, $fontSize) <= $maxWidth) {
            return $text;
        }

        $characters = self::characters($text);

        while ($characters !== [] && self::width(implode('', $characters) . '…', $fontSize) > $maxWidth) {
            array_pop($characters);
        }

        return $characters === []
            ? $text
            : rtrim(implode('', $characters)) . '…';
    }

    /**
     * UTF-8 characters of $text. preg_split() keeps this working without mbstring.
     *
     * @return array<int, string>
     */
    private static function characters(string $text): array
    {
        return preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    }

    /**
     * Accented Latin glyphs are ~0.75 em wide in Arial Bold; anything needing more
     * bytes than that (CJK, emoji, ...) is treated as a full em so the estimate can
     * never come out too small.
     */
    private static function fallbackUnits(string $character): int
    {
        return match (strlen($character)) {
            1 => 556,
            2 => 750,
            default => self::UNITS_PER_EM,
        };
    }
}
