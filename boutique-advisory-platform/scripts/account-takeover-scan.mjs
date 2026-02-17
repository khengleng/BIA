#!/usr/bin/env node

const DEFAULT_BASE_URL = process.env.ATO_BASE_URL || 'https://www.cambobia.com/api-proxy';

function getArg(name, fallback = undefined) {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

class Jar {
  constructor() { this.cookies = new Map(); }
  setFrom(res) {
    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const raw of setCookies) {
      const first = String(raw).split(';')[0];
      const eq = first.indexOf('=');
      if (eq <= 0) continue;
      const k = first.slice(0, eq).trim();
      const v = first.slice(eq + 1).trim();
      this.cookies.set(k, v);
    }
  }
  header() {
    return Array.from(this.cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

async function call(base, path, opts = {}, jar) {
  const headers = new Headers(opts.headers || {});
  if (!headers.has('User-Agent')) headers.set('User-Agent', 'bia-ato-scan/1.0');
  if (jar?.header()) headers.set('Cookie', jar.header());
  const res = await fetch(`${base}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body,
    redirect: 'manual'
  });
  if (jar) jar.setFrom(res);
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { res, text, json };
}

async function csrf(base, jar) {
  const r = await call(base, '/api/csrf-token', {}, jar);
  if (r.res.status !== 200 || !r.json?.csrfToken) throw new Error('csrf token issue');
  return r.json.csrfToken;
}

async function login(base, jar, email, password) {
  const token = await csrf(base, jar);
  return call(base, '/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-csrf-token': token },
    body: JSON.stringify({ email, password })
  }, jar);
}

function log(name, status, detail = '') {
  console.log(`${status} ${name}${detail ? `: ${detail}` : ''}`);
}

async function main() {
  const base = String(getArg('--base-url', DEFAULT_BASE_URL)).replace(/\/+$/, '');
  const investorEmail = process.env.ATO_INVESTOR_EMAIL;
  const investorPassword = process.env.ATO_INVESTOR_PASSWORD;

  const fails = [];

  // 1) Refresh token without cookie must fail
  try {
    const r = await call(base, '/api/auth/refresh', { method: 'POST' });
    if (![401, 403].includes(r.res.status)) throw new Error(`status ${r.res.status}`);
    log('refresh-without-cookie-denied', 'PASS');
  } catch (e) { fails.push(['refresh-without-cookie-denied', e.message]); log('refresh-without-cookie-denied', 'FAIL', e.message); }

  // 2) Session endpoints require auth
  try {
    const r = await call(base, '/api/auth/sessions');
    if (![401, 403].includes(r.res.status)) throw new Error(`status ${r.res.status}`);
    log('sessions-endpoint-unauth-denied', 'PASS');
  } catch (e) { fails.push(['sessions-endpoint-unauth-denied', e.message]); log('sessions-endpoint-unauth-denied', 'FAIL', e.message); }

  // 3) Brute-force signal check (sample)
  try {
    const sample = 12;
    let sawRateHeaders = false;
    let saw429 = false;
    for (let i = 0; i < sample; i += 1) {
      const jar = new Jar();
      const r = await login(base, jar, `nope_${Date.now()}_${i}@example.com`, 'WrongPassword123!');
      const rlRemaining = r.res.headers.get('ratelimit-remaining');
      if (rlRemaining !== null) sawRateHeaders = true;
      if (r.res.status === 429) saw429 = true;
      if (![400, 401, 403, 429].includes(r.res.status)) throw new Error(`unexpected status ${r.res.status}`);
    }
    if (!sawRateHeaders) throw new Error('no ratelimit headers observed');
    log('login-bruteforce-protection-signal', 'PASS', saw429 ? '429 observed' : 'rate headers observed');
  } catch (e) { fails.push(['login-bruteforce-protection-signal', e.message]); log('login-bruteforce-protection-signal', 'FAIL', e.message); }

  // 4) Forgot-password anti-enumeration behavior
  try {
    const jar = new Jar();
    const token = await csrf(base, jar);
    const a = await call(base, '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': token },
      body: JSON.stringify({ email: `nobody_${Date.now()}@example.com` })
    }, jar);
    if (a.res.status !== 200) throw new Error(`status ${a.res.status}`);
    if (!a.json?.message) throw new Error('missing generic message');
    log('forgot-password-generic-response', 'PASS');
  } catch (e) { fails.push(['forgot-password-generic-response', e.message]); log('forgot-password-generic-response', 'FAIL', e.message); }

  // 5) Role boundary (optional authenticated investor)
  if (investorEmail && investorPassword) {
    try {
      const jar = new Jar();
      const l = await login(base, jar, investorEmail, investorPassword);
      if (l.res.status !== 200) throw new Error(`investor login status ${l.res.status}`);
      const adminUsers = await call(base, '/api/admin/users', {}, jar);
      if (![401, 403].includes(adminUsers.res.status)) throw new Error(`status ${adminUsers.res.status}`);
      log('investor-admin-boundary', 'PASS');
    } catch (e) { fails.push(['investor-admin-boundary', e.message]); log('investor-admin-boundary', 'FAIL', e.message); }
  } else {
    log('investor-admin-boundary', 'SKIP', 'Set ATO_INVESTOR_EMAIL + ATO_INVESTOR_PASSWORD');
  }

  // 6) Reset-token invalid/replay baseline
  try {
    const jar = new Jar();
    const token = await csrf(base, jar);
    const r = await call(base, '/api/auth/reset-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': token },
      body: JSON.stringify({ token: 'invalid-token', newPassword: 'StrongPass123!' })
    }, jar);
    if (![400, 401].includes(r.res.status)) throw new Error(`status ${r.res.status}`);
    log('reset-token-invalid-denied', 'PASS');
  } catch (e) { fails.push(['reset-token-invalid-denied', e.message]); log('reset-token-invalid-denied', 'FAIL', e.message); }

  console.log('\nSummary:');
  if (fails.length === 0) {
    console.log('PASS account-takeover-scan');
    process.exit(0);
  }
  for (const [name, msg] of fails) console.log(`FAIL ${name}: ${msg}`);
  process.exit(1);
}

main().catch((e) => {
  console.error('Fatal scan error:', e);
  process.exit(1);
});
