function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeOrigins(raw: string | undefined): string[] {
  return String(raw || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export const config = {
  serviceName: process.env.SERVICE_NAME || 'market-service',
  port: Number(process.env.PORT || 3006),
  nodeEnv: process.env.NODE_ENV || 'production',
  jwtSecret: requireEnv('JWT_SECRET'),
  databaseUrl: requireEnv('DATABASE_URL'),
  tradingFrontendUrl: process.env.TRADING_FRONTEND_URL || 'https://trade.cambobia.com',
  corsOrigins: normalizeOrigins(process.env.CORS_ORIGIN || process.env.TRADING_FRONTEND_URL || 'https://trade.cambobia.com'),
};

export type MarketServiceConfig = typeof config;
