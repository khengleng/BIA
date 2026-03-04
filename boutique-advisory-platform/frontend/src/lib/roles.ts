export const TRADING_OPERATOR_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'SUPPORT',
  'FINOPS',
  'CX',
  'AUDITOR',
  'COMPLIANCE',
] as const

export function normalizeRole(role: string | undefined | null): string {
  return String(role ?? '').toUpperCase()
}

export function isTradingOperatorRole(role: string | undefined | null): boolean {
  return TRADING_OPERATOR_ROLES.includes(normalizeRole(role) as (typeof TRADING_OPERATOR_ROLES)[number])
}

