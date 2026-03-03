export const PLATFORM_MODE = process.env.NEXT_PUBLIC_PLATFORM_MODE === 'trading' ? 'trading' : 'core';
export const IS_TRADING_PLATFORM = PLATFORM_MODE === 'trading';

