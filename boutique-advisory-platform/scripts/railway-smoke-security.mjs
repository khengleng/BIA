#!/usr/bin/env node

/**
 * Manipulation-focused smoke/security checks for deployed API instances.
 *
 * Usage:
 *   node scripts/railway-smoke-security.mjs --base-url https://your-app.up.railway.app
 *
 * Env overrides:
 *   SMOKE_BASE_URL
 *   SMOKE_INVESTOR_EMAIL
 *   SMOKE_INVESTOR_PASSWORD
 *   SMOKE_ADMIN_EMAIL
 *   SMOKE_ADMIN_PASSWORD
 */

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";

function parseArgs(argv) {
  const args = { baseUrl: process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--base-url" && argv[i + 1]) {
      args.baseUrl = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  setFromSetCookie(setCookieValues) {
    if (!setCookieValues || setCookieValues.length === 0) return;
    for (const value of setCookieValues) {
      const parts = String(value).split(";");
      const [name, cookieValue] = parts[0].split("=");
      if (name && cookieValue !== undefined) {
        this.cookies.set(name.trim(), cookieValue.trim());
      }
    }
  }

  headerValue() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

function normalizeBaseUrl(input) {
  return String(input).replace(/\/+$/, "");
}

async function request(baseUrl, path, options = {}, jar) {
  const url = `${baseUrl}${path}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "bia-security-smoke/1.0");
  }

  if (jar && jar.headerValue()) {
    headers.set("Cookie", jar.headerValue());
  }

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body,
    redirect: "manual",
  });

  const setCookie = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : [];
  if (jar) {
    jar.setFromSetCookie(setCookie);
  }

  let bodyText = "";
  let bodyJson = null;
  try {
    bodyText = await response.text();
    bodyJson = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    bodyJson = null;
  }

  return { response, bodyText, bodyJson };
}

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchCsrf(baseUrl, jar) {
  const { response, bodyJson } = await request(baseUrl, "/api/csrf-token", {}, jar);
  assertCondition(response.status === 200, `/api/csrf-token expected 200, got ${response.status}`);
  assertCondition(
    bodyJson && typeof bodyJson.csrfToken === "string" && bodyJson.csrfToken.length > 10,
    "/api/csrf-token missing csrfToken"
  );
  return bodyJson.csrfToken;
}

async function login(baseUrl, jar, email, password) {
  const csrfToken = await fetchCsrf(baseUrl, jar);
  const { response, bodyJson, bodyText } = await request(
    baseUrl,
    "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({ email, password }),
    },
    jar
  );

  if (response.status !== 200) {
    throw new Error(`Login failed for ${email}: ${response.status} ${bodyText}`);
  }

  if (bodyJson && bodyJson.require2fa) {
    throw new Error(`Login for ${email} requires 2FA; smoke test account must not require interactive 2FA`);
  }
}

async function main() {
  const { baseUrl } = parseArgs(process.argv);
  const target = normalizeBaseUrl(baseUrl);
  const checks = [];

  function pass(name) {
    checks.push({ name, status: "PASS" });
  }

  function fail(name, error) {
    checks.push({ name, status: "FAIL", error: String(error.message || error) });
  }

  // 1) Availability and baseline hardening headers
  try {
    const { response, bodyJson } = await request(target, "/health");
    assertCondition(response.status === 200, `/health expected 200, got ${response.status}`);
    assertCondition(bodyJson && bodyJson.status === "ok", `/health status expected "ok", got "${bodyJson?.status}"`);

    const xcto = response.headers.get("x-content-type-options");
    const xfo = response.headers.get("x-frame-options");
    const referrerPolicy = response.headers.get("referrer-policy");
    assertCondition(!!xcto, "Missing X-Content-Type-Options header");
    assertCondition(!!xfo, "Missing X-Frame-Options header");
    assertCondition(!!referrerPolicy, "Missing Referrer-Policy header");
    pass("health-and-security-headers");
  } catch (error) {
    fail("health-and-security-headers", error);
  }

  // 2) CSRF issuance
  try {
    const jar = new CookieJar();
    await fetchCsrf(target, jar);
    pass("csrf-token-issuance");
  } catch (error) {
    fail("csrf-token-issuance", error);
  }

  // 3) Unauthenticated manipulation barriers
  try {
    const adminUsers = await request(target, "/api/admin/users");
    assertCondition([401, 403].includes(adminUsers.response.status), `Expected 401/403 for /api/admin/users, got ${adminUsers.response.status}`);

    const dashboard = await request(target, "/api/dashboard/stats");
    assertCondition([401, 403].includes(dashboard.response.status), `Expected 401/403 for /api/dashboard/stats, got ${dashboard.response.status}`);

    const investors = await request(target, "/api/investors");
    assertCondition([401, 403].includes(investors.response.status), `Expected 401/403 for /api/investors, got ${investors.response.status}`);
    pass("unauthenticated-access-denied");
  } catch (error) {
    fail("unauthenticated-access-denied", error);
  }

  // 4) Privilege-escalation registration barrier (cannot self-register as ADMIN)
  try {
    const jar = new CookieJar();
    const csrfToken = await fetchCsrf(target, jar);
    const unique = Date.now();
    const payload = {
      email: `security-check-${unique}@example.com`,
      password: "StrongTestPassword123!",
      role: "ADMIN",
      firstName: "Sec",
      lastName: "Test",
    };

    const registration = await request(
      target,
      "/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify(payload),
      },
      jar
    );

    assertCondition(registration.response.status === 403, `Expected 403 for ADMIN self-registration, got ${registration.response.status}`);
    pass("role-escalation-self-registration-denied");
  } catch (error) {
    fail("role-escalation-self-registration-denied", error);
  }

  // 5) Optional authenticated role-boundary checks
  const investorEmail = process.env.SMOKE_INVESTOR_EMAIL;
  const investorPassword = process.env.SMOKE_INVESTOR_PASSWORD;
  if (investorEmail && investorPassword) {
    try {
      const investorJar = new CookieJar();
      await login(target, investorJar, investorEmail, investorPassword);
      const result = await request(target, "/api/admin/users", {}, investorJar);
      assertCondition([401, 403].includes(result.response.status), `Investor should not access admin users endpoint, got ${result.response.status}`);
      pass("investor-cannot-access-admin-endpoint");
    } catch (error) {
      fail("investor-cannot-access-admin-endpoint", error);
    }
  } else {
    checks.push({
      name: "investor-cannot-access-admin-endpoint",
      status: "SKIP",
      error: "Set SMOKE_INVESTOR_EMAIL and SMOKE_INVESTOR_PASSWORD to enable",
    });
  }

  const failures = checks.filter((c) => c.status === "FAIL");
  console.log("\n=== Security Smoke Results ===");
  for (const check of checks) {
    if (check.status === "PASS") {
      console.log(`PASS ${check.name}`);
    } else if (check.status === "SKIP") {
      console.log(`SKIP ${check.name} (${check.error})`);
    } else {
      console.log(`FAIL ${check.name}: ${check.error}`);
    }
  }

  if (failures.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Security smoke runner crashed:", error);
  process.exit(1);
});
