'use client'

import { useTranslation } from 'react-i18next';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDual,
  formatNumber,
  formatDate,
  type Currency,
} from '@/lib/format';

/**
 * Locale-bound formatters. Reads the active i18n language so every amount, date
 * and number re-renders when the user switches language — no need to thread the
 * locale through props.
 */
export function useFormat() {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  return {
    lang,
    formatCurrency: (amount: unknown, currency: Currency = 'USD') =>
      formatCurrency(amount, currency, lang),
    formatCurrencyCompact: (amount: unknown, currency: Currency = 'USD') =>
      formatCurrencyCompact(amount, currency, lang),
    formatDual: (usdAmount: unknown, khrPerUsd?: number) =>
      formatDual(usdAmount, lang, khrPerUsd),
    formatNumber: (value: unknown) => formatNumber(value, lang),
    formatDate: (value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions) =>
      formatDate(value, lang, options),
  };
}
