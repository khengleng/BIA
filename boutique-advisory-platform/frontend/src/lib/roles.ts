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
  const normalized = String(role ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_')
  if (normalized === 'SUPERADMIN') return 'SUPER_ADMIN'
  if (normalized === 'SUPER__ADMIN') return 'SUPER_ADMIN'
  return normalized
}

export function isTradingOperatorRole(role: string | undefined | null): boolean {
  return TRADING_OPERATOR_ROLES.includes(normalizeRole(role) as (typeof TRADING_OPERATOR_ROLES)[number])
}
