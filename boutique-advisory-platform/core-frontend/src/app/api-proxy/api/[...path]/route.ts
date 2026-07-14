import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-encoding',
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

function inferServiceUrl(hostOrUrl: string | undefined, fallback: string): string {
  const candidate = (hostOrUrl || '').trim();
  if (!candidate) return fallback;
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) return candidate;

  // Railway internal service hosts should be accessed over plain HTTP.
  if (candidate.endsWith('.railway.internal')) return `http://${candidate}`;

  // Public Railway/custom domains should be accessed via HTTPS to avoid 301 redirects.
  return `https://${candidate}`;
}

// The platform now runs against a SINGLE consolidated backend (core-backend).
// Resolve one backend base URL from the existing backend env vars, in order of
// preference. These all point at the same backend; the list is only a
// deployment-config fallback chain, NOT a multi-service fan-out.
function getBackendTarget(req: NextRequest): string | null {
  const currentHost = req.headers.get('host')?.toLowerCase() || req.nextUrl.host.toLowerCase();

  const candidates: (string | undefined)[] = [
    process.env.CORE_API_URL,
    process.env.CORE_BACKEND_INTERNAL_URL,
    process.env.CORE_BACKEND_URL,
    process.env.API_URL,
    process.env.BACKEND_INTERNAL_URL,
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
    inferServiceUrl(process.env.RAILWAY_SERVICE_BACKEND_URL, 'http://backend.railway.internal:8080')
  ];

  for (const candidate of candidates) {
    const sanitized = sanitizeBaseUrl(candidate);
    if (!sanitized) continue;

    // Guardrail: do not proxy to ourselves (prevents infinite loops and 404s
    // from misconfigured env vars).
    try {
      if (new URL(sanitized).host.toLowerCase() === currentHost) continue;
    } catch {
      continue;
    }

    return sanitized;
  }

  return null;
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
  const targetBase = getBackendTarget(req);
  if (!targetBase) {
    console.error(`❌ [Proxy] No backend target configured for request to /api/${pathParts.join('/')}`);
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

  try {
    console.log(`📡 [Proxy] ${method} -> ${targetBase}/api/${pathParts.join('/')}`);
    const upstream = await fetch(`${targetBase}${upstreamPath}`, {
      method,
      headers,
      body: requestBody,
      cache: 'no-store',
      redirect: 'manual'
    });

    // Read full body buffer to avoid streaming/decoding issues during content forwarding
    const bodyBuffer = await upstream.arrayBuffer();
    const response = new NextResponse(bodyBuffer, { status: upstream.status });

    copyUpstreamHeaders(upstream, response);

    // SECURITY: Strip encoding and length from copied headers as the new body
    // buffer is already decompressed and Next will set its own length.
    response.headers.delete('content-encoding');
    response.headers.delete('content-length');
    response.headers.delete('transfer-encoding');

    return response;
  } catch (error: any) {
    const errMessage = error?.message || 'Proxy connection failed';
    console.warn(`⚠️ [Proxy Error] ${method} ${upstreamPath} failed: ${errMessage}`);
    return NextResponse.json(
      { error: 'Service temporarily unavailable. Please try again in a few seconds.' },
      { status: 503 }
    );
  }
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
