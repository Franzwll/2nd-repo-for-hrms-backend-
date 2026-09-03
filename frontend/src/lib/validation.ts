/**
 * Input sanitization, formatting, and validation helpers for HRMS modules.
 */

/** Validates email format with standard pattern. */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Sanitizes names to only allow letters, accented characters, spaces, hyphens,
 * periods, and apostrophes (e.g. "Juan Dela Cruz, Jr.", "Mary-Ann O'Connor").
 */
export function sanitizeName(value: string): string {
  return value.replace(/[^a-zA-Z\u00C0-\u024F\s.'\-]/g, "");
}

/** Validates that a name contains at least 2 letters and no disallowed symbols. */
export function isValidName(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 2) return false;
  return /^[a-zA-Z\u00C0-\u024F\s.'\-]+$/.test(trimmed);
}

/**
 * Sanitizes phone numbers to digits and allowed punctuation (+, -, space, parentheses).
 */
export function sanitizePhone(value: string): string {
  return value.replace(/[^0-9+\-\s()]/g, "");
}

/**
 * Validates Philippine or international phone numbers.
 * PH examples: 09171234567, +639171234567, 0917 123 4567
 */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Sanitizes integer inputs (e.g., headcount, slots, vacancies) ensuring positive bounds.
 */
export function sanitizeInteger(value: any, fallback = 1, min = 0, max = 999999): number {
  const num = parseInt(String(value).replace(/\D/g, ""), 10);
  if (isNaN(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitizes input to digits only as string.
 */
export function sanitizeDigitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Sanitizes numeric amount/salary inputs.
 */
export function sanitizeAmount(value: any, fallback = 0, min = 0): number {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return fallback;
  return Math.max(min, num);
}

/**
 * Sanitizes input string to valid decimal number string.
 */
export function sanitizeDecimalString(value: string): string {
  const clean = value.replace(/[^0-9.]/g, "");
  const parts = clean.split(".");
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return clean;
}
