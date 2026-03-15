"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const api_1 = require("../lib/api");
(0, node_test_1.default)('apiRequest - GET uses include credentials and skips CSRF fetch', async () => {
    (0, api_1.__resetApiTestState)();
    const calls = [];
    const mockResponse = { ok: true, status: 200 };
    global.fetch = (async (url, options) => {
        calls.push({ url: String(url), options: options || {} });
        return mockResponse;
    });
    await (0, api_1.apiRequest)('/api/health');
    node_assert_1.default.strictEqual(calls.length, 1);
    node_assert_1.default.ok(calls[0].url.endsWith('/api/health'));
    node_assert_1.default.strictEqual(calls[0].options.credentials, 'include');
    const headers = new Headers(calls[0].options.headers);
    node_assert_1.default.strictEqual(headers.has('x-csrf-token'), false);
});
(0, node_test_1.default)('apiRequest - POST fetches csrf token and sends it in request header', async () => {
    (0, api_1.__resetApiTestState)();
    const calls = [];
    global.fetch = (async (url, options) => {
        calls.push({ url: String(url), options: options || {} });
        if (String(url).includes('/api/csrf-token')) {
            return {
                ok: true,
                status: 200,
                json: async () => ({ csrfToken: 'csrf-test-token' }),
            };
        }
        return { ok: true, status: 200 };
    });
    await (0, api_1.apiRequest)('/api/deals', {
        method: 'POST',
        body: JSON.stringify({ name: 'Deal A' }),
    });
    node_assert_1.default.strictEqual(calls.length, 2);
    node_assert_1.default.ok(calls[0].url.includes('/api/csrf-token'));
    node_assert_1.default.ok(calls[1].url.endsWith('/api/deals'));
    const headers = new Headers(calls[1].options.headers);
    node_assert_1.default.strictEqual(headers.get('x-csrf-token'), 'csrf-test-token');
    node_assert_1.default.strictEqual(headers.get('content-type'), 'application/json');
});
(0, node_test_1.default)('apiRequest - reuses previously fetched csrf token for second state-changing call', async () => {
    (0, api_1.__resetApiTestState)();
    let csrfFetchCount = 0;
    const calls = [];
    global.fetch = (async (url, options) => {
        calls.push({ url: String(url), options: options || {} });
        if (String(url).includes('/api/csrf-token')) {
            csrfFetchCount += 1;
            return {
                ok: true,
                status: 200,
                json: async () => ({ csrfToken: 'csrf-once' }),
            };
        }
        return { ok: true, status: 200 };
    });
    await (0, api_1.apiRequest)('/api/first', { method: 'POST', body: '{}' });
    await (0, api_1.apiRequest)('/api/second', { method: 'PATCH', body: '{}' });
    node_assert_1.default.strictEqual(csrfFetchCount, 1);
    const secondHeaders = new Headers(calls[calls.length - 1].options.headers);
    node_assert_1.default.strictEqual(secondHeaders.get('x-csrf-token'), 'csrf-once');
});
