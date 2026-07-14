function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function normalizeOrigins(raw: string | undefined): string[] {
  return String(raw || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

// Architecture consolidated to a single backend (core-backend). The former
// identity/wallet/funding/market/trade services are now one deployable, so all
// upstream URLs resolve to CORE_BACKEND_URL. The legacy per-service env vars are
// still honored if explicitly set, for backward-compatible rollouts.
const coreBackendUrl = requireEnv('CORE_BACKEND_URL')

export const config = {
  serviceName: process.env.SERVICE_NAME || 'twallet-bff-service',
  port: Number(process.env.PORT || 3010),
  nodeEnv: process.env.NODE_ENV || 'production',
  mobileAppUrl: process.env.MOBILE_APP_URL || 'https://mobile-app-production-bf9a.up.railway.app',
  corsOrigins: normalizeOrigins(process.env.CORS_ORIGIN || process.env.MOBILE_APP_URL || 'https://mobile-app-production-bf9a.up.railway.app'),
  coreBackendUrl,
  identityServiceUrl: process.env.IDENTITY_SERVICE_URL?.trim() || coreBackendUrl,
  walletServiceUrl: process.env.WALLET_SERVICE_URL?.trim() || coreBackendUrl,
  fundingServiceUrl: process.env.FUNDING_SERVICE_URL?.trim() || coreBackendUrl,
  marketServiceUrl: process.env.MARKET_SERVICE_URL?.trim() || coreBackendUrl,
  tradeApiUrl: process.env.TRADE_API_URL?.trim() || coreBackendUrl,
  tradingFrontendHost: process.env.TRADING_FRONTEND_HOST || 'trade.cambobia.com',
}

export type TWalletBffConfig = typeof config
