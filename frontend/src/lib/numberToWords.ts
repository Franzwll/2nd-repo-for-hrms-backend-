/**
 * Convert a number to English words for official receipt / payslip displays.
 */
export function numberToWords(amount: number, currency: string = "Philippine Peso"): string {
  if (isNaN(amount) || amount === 0) return `${currency} Zero Only`;

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertGroup(num: number): string {
    let result = "";
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + (num % 10 > 0 ? "-" + ones[num % 10] : "") + " ";
    } else if (num > 0) {
      result += ones[num] + " ";
    }
    return result.trim();
  }

  const integerPart = Math.floor(Math.abs(amount));
  const decimalPart = Math.round((Math.abs(amount) - integerPart) * 100);

  let words = "";

  const billions = Math.floor(integerPart / 1000000000);
  const millions = Math.floor((integerPart % 1000000000) / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const remainder = integerPart % 1000;

  if (billions > 0) {
    words += convertGroup(billions) + " Billion ";
  }
  if (millions > 0) {
    words += convertGroup(millions) + " Million ";
  }
  if (thousands > 0) {
    words += convertGroup(thousands) + " Thousand ";
  }
  if (remainder > 0) {
    words += convertGroup(remainder) + " ";
  }

  words = words.trim();
  if (!words) words = "Zero";

  let finalStr = `${currency} ${words}`;
  if (decimalPart > 0) {
    finalStr += ` and ${convertGroup(decimalPart)} Centavos`;
  }
  finalStr += " Only";

  return finalStr;
}
