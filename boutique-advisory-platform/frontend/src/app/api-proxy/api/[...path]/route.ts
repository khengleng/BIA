import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TRANSIENT_STATUSES = new Set([502, 503, 504]);
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);

function sanitizeBaseUrl(baseUrl: string | undefined): string | null {
  if (!baseUrl) return null;
  const trimmed = baseUrl.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
  } catch {
    return null;
  }
}

function getBackendTargets(req: NextRequest): string[] {
  const targets: string[] = [];
  const addTarget = (candidate?: string) => {
    const sanitized = sanitizeBaseUrl(candidate);
    if (!sanitized) return;
    if (targets.includes(sanitized)) return;
    if (sanitized === req.nextUrl.origin) return;
    targets.push(sanitized);
  };

  const railwayPrivateBackend = process.env.RAILWAY_SERVICE_BACKEND_URL
    ? `http://${process.env.RAILWAY_SERVICE_BACKEND_URL}`
    : 'http://backend.railway.internal:8080';

  addTarget(process.env.API_URL);
  addTarget(process.env.BACKEND_INTERNAL_URL);
  addTarget(railwayPrivateBackend);
  addTarget(process.env.BACKEND_URL);
  addTarget(process.env.NEXT_PUBLIC_API_URL);

  return targets;
}

function buildUpstreamHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) return;
    headers.set(key, value);
  });

  headers.set('x-forwarded-host', req.nextUrl.host);
  headers.set('x-forwarded-proto', req.nextUrl.protocol.replace(':', ''));
  headers.set('x-forwarded-for', req.headers.get('x-forwarded-for') || 'unknown');
  return headers;
}

function copyUpstreamHeaders(upstream: Response, response: NextResponse): void {
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) return;
    if (lower === 'set-cookie') return;
    response.headers.set(key, value);
  });

  // Next/undici supports getSetCookie() for multi-cookie passthrough.
  const setCookies = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.();
  if (setCookies && setCookies.length > 0) {
    for (const cookie of setCookies) {
      response.headers.append('set-cookie', cookie);
    }
    return;
  }

  const fallbackCookie = upstream.headers.get('set-cookie');
  if (fallbackCookie) {
    response.headers.append('set-cookie', fallbackCookie);
  }
}

async function proxy(req: NextRequest, pathParts: string[]): Promise<NextResponse> {
  const targets = getBackendTargets(req);
  if (targets.length === 0) {
    return NextResponse.json(
      { error: 'Backend proxy is not configured.' },
      { status: 503 }
    );
  }

  const upstreamPath = `/api/${pathParts.join('/')}${req.nextUrl.search}`;
  const method = req.method.toUpperCase();
  const headers = buildUpstreamHeaders(req);
  const requestBody =
    method === 'GET' || method === 'HEAD' ? undefined : Buffer.from(await req.arrayBuffer());

  let lastStatus: number | null = null;
  let lastError: string | null = null;

  for (let i = 0; i < targets.length; i += 1) {
    const targetBase = targets[i];
    const upstreamUrl = `${targetBase}${upstreamPath}`;
    const isLastTarget = i === targets.length - 1;

    try {
      const upstream = await fetch(upstreamUrl, {
        method,
        headers,
        body: requestBody,
        cache: 'no-store',
        redirect: 'manual'
      });

      lastStatus = upstream.status;
      if (!TRANSIENT_STATUSES.has(upstream.status) || isLastTarget) {
        const response = new NextResponse(upstream.body, { status: upstream.status });
        copyUpstreamHeaders(upstream, response);
        response.headers.set('x-proxy-target', targetBase);
        return response;
      }
    } catch (error: any) {
      lastError = error?.message || 'Proxy connection failed';
      if (isLastTarget) break;
    }
  }

  return NextResponse.json(
    {
      error: 'Service temporarily unavailable. Please try again in a few seconds.',
      proxyStatus: lastStatus,
      proxyError: lastError
    },
    { status: 503 }
  );
}

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(req, path);
}

export async function OPTIONS(req: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(req, path);
}
