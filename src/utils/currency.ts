import { Currency } from "@/types";

export const MONTHLY_RATE = 0.07;

export const SYMBOLS: Record<Currency, string> = {
  EUR: "€",
  GBP: "£",
  GHS: "GH₵",
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  EUR: "Euro",
  GBP: "British Pound",
  GHS: "Ghana Cedi",
};

// Rates anchored to EUR. GHS cross-rate derived: GBP→GHS = EUR→GHS / GBP→EUR
export const EUR_TO_GBP = 0.855;
export const EUR_TO_GHS = 16.80;
export const GBP_TO_EUR = 1 / EUR_TO_GBP;          // ~1.170
export const GBP_TO_GHS = EUR_TO_GHS / EUR_TO_GBP; // ~19.65
export const GHS_TO_EUR = 1 / EUR_TO_GHS;          // ~0.0595
export const GHS_TO_GBP = 1 / GBP_TO_GHS;         // ~0.0509

export const RATES: Record<Currency, Record<Currency, number>> = {
  EUR: { EUR: 1,          GBP: EUR_TO_GBP, GHS: EUR_TO_GHS },
  GBP: { EUR: GBP_TO_EUR, GBP: 1,          GHS: GBP_TO_GHS },
  GHS: { EUR: GHS_TO_EUR, GBP: GHS_TO_GBP, GHS: 1           },
};

// Minimum investment = €1.00 (or currency equivalent: ~£0.85 GBP, ~GH₵16.80 GHS)
export const MIN_EUR = 1.00;
export const MIN_GBP = +(MIN_EUR * EUR_TO_GBP).toFixed(2);
export const MIN_GHS = +(MIN_EUR * EUR_TO_GHS).toFixed(2);

export function minForCurrency(c: Currency): number {
  return c === "EUR" ? MIN_EUR : c === "GBP" ? MIN_GBP : MIN_GHS;
}

export function convert(amount: number, from: Currency, to: Currency): number {
  return amount * RATES[from][to];
}

// Locale-aware formatter: EUR → en-DE (€1,234.56), GBP → en-GB, GHS → en-GH with GH₵ prefix
export function fmt(amount: number, currency: Currency): string {
  const locale = currency === "EUR" ? "en-DE" : currency === "GBP" ? "en-GB" : "en-GH";
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount);
  
  // en-DE uses period for thousands and comma for decimals — normalise to en style
  const normalised = currency === "EUR"
    ? formatted.replace(/\./g, "_").replace(",", ".").replace(/_/g, ",")
    : formatted;
  return `${SYMBOLS[currency]}${normalised}`;
}
