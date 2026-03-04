export const isTradingHostname = (hostname: string): boolean => hostname === 'trade.cambobia.com';

const envTrading = process.env.NEXT_PUBLIC_PLATFORM_MODE === 'trading';
export const PLATFORM_MODE = envTrading ? 'trading' : 'core';
export const IS_TRADING_PLATFORM = PLATFORM_MODE === 'trading';
export const CORE_FRONTEND_URL = (process.env.NEXT_PUBLIC_CORE_FRONTEND_URL || 'https://www.cambobia.com').replace(/\/+$/, '');
