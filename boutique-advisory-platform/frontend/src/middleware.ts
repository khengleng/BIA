import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  mapAdminPathToTradingOperator,
  mapLegacyTradingPath,
} from '@/lib/tradingOperatorRoutes';

const mode = process.env.NEXT_PUBLIC_PLATFORM_MODE === 'trading' ? 'trading' : 'core';
const isTradingHost = (hostname: string) => hostname === 'trade.cambobia.com';

const tradingProtectedPrefixes = ['/secondary-trading', '/trading', '/admin/bot'];

const tradingSessionCookieNames = [
  'tr_token',
  'tr_accessToken',
  'tr_refreshToken',
  // Backward compatibility if older cookie names remain.
  'token',
  'accessToken',
  'refreshToken',
];

function hasTradingSessionCookie(req: NextRequest): boolean {
  return tradingSessionCookieNames.some((name) => {
    const value = req.cookies.get(name)?.value;
    return typeof value === 'string' && value.trim().length > 0;
  });
}

const staticTradingPrefixes = [
  '/auth',
  '/api-proxy',
  '/_next',
  '/icons',
  '/manifest.json',
  '/sw.js',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

export function middleware(req: NextRequest) {
  const runtimeTradingMode = mode === 'trading' || isTradingHost(req.nextUrl.hostname);

  if (!runtimeTradingMode) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  const isAuthenticated = hasTradingSessionCookie(req);

  if (pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = isAuthenticated ? '/secondary-trading' : '/auth/login';
    return NextResponse.redirect(url);
  }

  if (staticTradingPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const mappedAdminPath = mapAdminPathToTradingOperator(pathname);
  if (mappedAdminPath) {
    const url = req.nextUrl.clone();
    url.pathname = mappedAdminPath;
    return NextResponse.redirect(url);
  }

  const mappedLegacyPath = mapLegacyTradingPath(pathname);
  if (mappedLegacyPath) {
    const url = req.nextUrl.clone();
    url.pathname = mappedLegacyPath;
    return NextResponse.redirect(url);
  }

  if (tradingProtectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = isAuthenticated ? '/secondary-trading' : '/auth/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!.*\\..*).*)', '/'],
};
