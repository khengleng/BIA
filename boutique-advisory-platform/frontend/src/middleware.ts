import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const mode = process.env.NEXT_PUBLIC_PLATFORM_MODE === 'trading' ? 'trading' : 'core';

const tradingAllowedPrefixes = [
  '/auth',
  '/secondary-trading',
  '/settings/sessions',
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
  if (mode !== 'trading') {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  if (pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/secondary-trading';
    return NextResponse.redirect(url);
  }

  if (tradingAllowedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/secondary-trading';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!.*\\..*).*)', '/'],
};

