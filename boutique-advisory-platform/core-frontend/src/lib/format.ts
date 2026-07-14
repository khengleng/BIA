/**
 * Locale-aware formatting for currency, numbers and dates.
 *
 * Cambodia is a dual-currency economy (USD + Khmer riel), so amounts can be
 * shown in either currency and, where useful, side by side. KHR is a zero-
 * decimal currency; USD uses two decimals. All output is locale-aware via the
 * Intl APIs, mapping the app's language codes to full BCP-47 locales.
 */

export type Currency = 'USD' | 'KHR';

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  km: 'km-KH',
  zh: 'zh-CN',
};

/** Indicative KHR per 1 USD. The riel is informally pegged near 4100/USD.
 *  Replace with a live rate feed once one is wired; kept as a constant so the
 *  dual-currency display works today without a rate service. */
export const KHR_PER_USD = 4100;

export function intlLocale(lang?: string): string {
  return LOCALE_MAP[(lang || 'en').slice(0, 2)] || 'en-US';
}

function toFiniteNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Format an amount as a currency string, e.g. "$1,250.00" or "៛5,125,000". */
export function formatCurrency(amount: unknown, currency: Currency = 'USD', lang = 'en'): string {
  const value = toFiniteNumber(amount);
  const fractionDigits = currency === 'KHR' ? 0 : 2;
  try {
    return new Intl.NumberFormat(intlLocale(lang), {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    const symbol = currency === 'KHR' ? '៛' : '$';
    return symbol + value.toLocaleString();
  }
}

/** Compact currency for dashboards, e.g. "$1.2M" / "៛5.1B". */
export function formatCurrencyCompact(amount: unknown, currency: Currency = 'USD', lang = 'en'): string {
  const value = toFiniteNumber(amount);
  const fractionDigits = currency === 'KHR' ? 0 : 1;
  try {
    return new Intl.NumberFormat(intlLocale(lang), {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return formatCurrency(value, currency, lang);
  }
}

/** Dual USD + KHR display, e.g. "$1,000.00 · ៛4,100,000". */
export function formatDual(usdAmount: unknown, lang = 'en', khrPerUsd: number = KHR_PER_USD): string {
  const usd = toFiniteNumber(usdAmount);
  return `${formatCurrency(usd, 'USD', lang)} · ${formatCurrency(usd * khrPerUsd, 'KHR', lang)}`;
}

/** Locale-aware plain number, e.g. "1,250" / Khmer numerals under km-KH. */
export function formatNumber(value: unknown, lang = 'en'): string {
  try {
    return new Intl.NumberFormat(intlLocale(lang)).format(toFiniteNumber(value));
  } catch {
    return String(toFiniteNumber(value));
  }
}

/** Locale-aware date. Defaults to a medium date (e.g. "15 Jul 2026"). */
export function formatDate(
  value: Date | string | number | null | undefined,
  lang = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  if (value == null) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(
      intlLocale(lang),
      options ?? { year: 'numeric', month: 'short', day: 'numeric' }
    ).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}
