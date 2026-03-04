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
  if (!normalized) return ''

  // Be resilient to legacy/custom naming from upstream identity payloads.
  if (normalized.includes('SUPER') && normalized.includes('ADMIN')) return 'SUPER_ADMIN'
  if (normalized === 'SUPERADMIN' || normalized === 'SUPER__ADMIN') return 'SUPER_ADMIN'

  if (normalized === 'ADMIN' || normalized.startsWith('ADMIN_') || normalized.endsWith('_ADMIN')) return 'ADMIN'
  if (normalized === 'FIN_OPS' || normalized === 'FINANCE_OPS' || normalized === 'FINANCIAL_OPS') return 'FINOPS'
  if (normalized === 'CUSTOMER_EXPERIENCE' || normalized === 'CUSTOMER_SUCCESS') return 'CX'
  if (normalized === 'COMPLIANCE_OFFICER') return 'COMPLIANCE'
  if (normalized === 'SUPPORT_AGENT') return 'SUPPORT'

  return normalized
}

export function isTradingOperatorRole(role: string | undefined | null): boolean {
  return TRADING_OPERATOR_ROLES.includes(normalizeRole(role) as (typeof TRADING_OPERATOR_ROLES)[number])
}
