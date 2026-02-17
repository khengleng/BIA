import test from 'node:test';
import assert from 'node:assert';

function clearApiModuleCache(): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const modulePath = require.resolve('../lib/api');
  delete require.cache[modulePath];
}

test('apiRequest - GET uses include credentials and skips CSRF fetch', async () => {
  clearApiModuleCache();

  const calls: Array<{ url: string; options: RequestInit }> = [];
  const mockResponse = { ok: true, status: 200 } as Response;

  (global as typeof globalThis & { fetch: typeof fetch }).fetch = (async (
    url: string | URL | globalThis.Request,
    options?: RequestInit
  ) => {
    calls.push({ url: String(url), options: options || {} });
    return mockResponse;
  }) as typeof fetch;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { apiRequest } = require('../lib/api') as typeof import('../lib/api');
  await apiRequest('/api/health');

  assert.strictEqual(calls.length, 1);
  assert.ok(calls[0].url.endsWith('/api/health'));
  assert.strictEqual(calls[0].options.credentials, 'include');
  const headers = new Headers(calls[0].options.headers);
  assert.strictEqual(headers.has('x-csrf-token'), false);
});

test('apiRequest - POST fetches csrf token and sends it in request header', async () => {
  clearApiModuleCache();

  const calls: Array<{ url: string; options: RequestInit }> = [];

  (global as typeof globalThis & { fetch: typeof fetch }).fetch = (async (
    url: string | URL | globalThis.Request,
    options?: RequestInit
  ) => {
    calls.push({ url: String(url), options: options || {} });

    if (String(url).includes('/api/csrf-token')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ csrfToken: 'csrf-test-token' }),
      } as Response;
    }

    return { ok: true, status: 200 } as Response;
  }) as typeof fetch;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { apiRequest } = require('../lib/api') as typeof import('../lib/api');

  await apiRequest('/api/deals', {
    method: 'POST',
    body: JSON.stringify({ name: 'Deal A' }),
  });

  assert.strictEqual(calls.length, 2);
  assert.ok(calls[0].url.includes('/api/csrf-token'));
  assert.ok(calls[1].url.endsWith('/api/deals'));

  const headers = new Headers(calls[1].options.headers);
  assert.strictEqual(headers.get('x-csrf-token'), 'csrf-test-token');
  assert.strictEqual(headers.get('content-type'), 'application/json');
});

test('apiRequest - reuses previously fetched csrf token for second state-changing call', async () => {
  clearApiModuleCache();

  let csrfFetchCount = 0;
  const calls: Array<{ url: string; options: RequestInit }> = [];

  (global as typeof globalThis & { fetch: typeof fetch }).fetch = (async (
    url: string | URL | globalThis.Request,
    options?: RequestInit
  ) => {
    calls.push({ url: String(url), options: options || {} });

    if (String(url).includes('/api/csrf-token')) {
      csrfFetchCount += 1;
      return {
        ok: true,
        status: 200,
        json: async () => ({ csrfToken: 'csrf-once' }),
      } as Response;
    }

    return { ok: true, status: 200 } as Response;
  }) as typeof fetch;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { apiRequest } = require('../lib/api') as typeof import('../lib/api');

  await apiRequest('/api/first', { method: 'POST', body: '{}' });
  await apiRequest('/api/second', { method: 'PATCH', body: '{}' });

  assert.strictEqual(csrfFetchCount, 1);

  const secondHeaders = new Headers(calls[calls.length - 1].options.headers);
  assert.strictEqual(secondHeaders.get('x-csrf-token'), 'csrf-once');
});
