// ISO 4217 currency codes supported
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "CHF", "GBP"] as const;
export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  CHF: "CHF",
  GBP: "£",
};

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

/**
 * Normalize price string for storage:
 * - Remove currency symbols (€, $, CHF, £)
 * - Remove Swiss formatting (.-, .–)
 * - Replace comma with dot for decimals
 * - Trim whitespace
 * - Keep only digits and single decimal point
 */
export function normalizePrice(input: string): string {
  if (!input || !input.trim()) return "";
  
  let normalized = input.trim();
  
  // Remove currency symbols and codes
  normalized = normalized.replace(/[€$£]/g, "");
  normalized = normalized.replace(/\bCHF\b/gi, "");
  normalized = normalized.replace(/\bUSD\b/gi, "");
  normalized = normalized.replace(/\bEUR\b/gi, "");
  normalized = normalized.replace(/\bGBP\b/gi, "");
  
  // Remove Swiss formatting (.-, .–, .--, etc.)
  normalized = normalized.replace(/[.\s]*[-–—]+\s*$/g, "");
  
  // Replace comma with dot (European decimal separator)
  normalized = normalized.replace(/,/g, ".");
  
  // Remove all whitespace
  normalized = normalized.replace(/\s/g, "");
  
  // Remove thousand separators (dots followed by 3 digits, then more or end)
  // E.g., 1.000.00 → keep only last dot as decimal
  const parts = normalized.split(".");
  if (parts.length > 2) {
    // Multiple dots: assume last is decimal separator
    const decimalPart = parts.pop();
    normalized = parts.join("") + "." + decimalPart;
  }
  
  // Keep only digits and single decimal point
  normalized = normalized.replace(/[^\d.]/g, "");
  
  // Ensure only one decimal point
  const dotIndex = normalized.indexOf(".");
  if (dotIndex !== -1) {
    normalized = normalized.slice(0, dotIndex + 1) + normalized.slice(dotIndex + 1).replace(/\./g, "");
  }
  
  // Remove leading zeros (except for "0.xx")
  if (normalized.length > 1 && normalized.startsWith("0") && normalized[1] !== ".") {
    normalized = normalized.replace(/^0+/, "");
  }
  
  return normalized;
}

/**
 * Format price for display with currency symbol
 */
export function formatPriceDisplay(price: string | undefined, currency: CurrencyCode = DEFAULT_CURRENCY): string {
  if (!price) return "";
  
  const symbol = CURRENCY_SYMBOLS[currency];
  
  // For CHF, put code after number
  if (currency === "CHF") {
    return `${price} CHF`;
  }
  
  return `${symbol}${price}`;
}
