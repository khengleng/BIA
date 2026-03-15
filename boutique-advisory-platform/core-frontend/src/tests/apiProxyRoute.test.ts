import test from 'node:test';
import assert from 'node:assert';
import { __proxyTestUtils } from '../app/api-proxy/api/[...path]/route';

test('sanitizeBaseUrl strips frontend proxy path segments to origin', () => {
  assert.strictEqual(
    __proxyTestUtils.sanitizeBaseUrl('https://www.cambobia.com/api-proxy'),
    'https://www.cambobia.com'
  );
  assert.strictEqual(
    __proxyTestUtils.sanitizeBaseUrl('https://www.cambobia.com/api-proxy/api'),
    'https://www.cambobia.com'
  );
  assert.strictEqual(
    __proxyTestUtils.sanitizeBaseUrl('https://api.example.com/api'),
    'https://api.example.com'
  );
  assert.strictEqual(
    __proxyTestUtils.sanitizeBaseUrl('https://api.example.com/api/v1'),
    'https://api.example.com'
  );
});

test('sanitizeBaseUrl preserves non-proxy pathnames', () => {
  assert.strictEqual(
    __proxyTestUtils.sanitizeBaseUrl('https://backend.example.com/service'),
    'https://backend.example.com/service'
  );
  assert.strictEqual(
    __proxyTestUtils.sanitizeBaseUrl('https://backend.example.com/service/'),
    'https://backend.example.com/service'
  );
});

test('sanitizeBaseUrl rejects empty and non-http(s) values', () => {
  assert.strictEqual(__proxyTestUtils.sanitizeBaseUrl(undefined), null);
  assert.strictEqual(__proxyTestUtils.sanitizeBaseUrl('   '), null);
  assert.strictEqual(__proxyTestUtils.sanitizeBaseUrl('ftp://backend.example.com'), null);
});
