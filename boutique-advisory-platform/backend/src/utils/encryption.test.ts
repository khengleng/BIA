import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';

test('encryption module fails fast when ENCRYPTION_KEY is missing outside test env', () => {
    const result = spawnSync(
        process.execPath,
        ['-r', 'ts-node/register', '-e', "process.env.NODE_ENV='production'; delete process.env.ENCRYPTION_KEY; require('./src/utils/encryption.ts');"],
        {
            cwd: process.cwd(),
            encoding: 'utf8'
        }
    );

    assert.notStrictEqual(result.status, 0, 'process should fail when key is missing in production');
    const stderr = `${result.stderr || ''}${result.stdout || ''}`;
    assert.match(stderr, /ENCRYPTION_KEY is required outside test environments/);
});

test('encryption module loads in test env without ENCRYPTION_KEY', () => {
    const result = spawnSync(
        process.execPath,
        ['-r', 'ts-node/register', '-e', "process.env.NODE_ENV='test'; delete process.env.ENCRYPTION_KEY; require('./src/utils/encryption.ts');"],
        {
            cwd: process.cwd(),
            encoding: 'utf8'
        }
    );

    assert.strictEqual(result.status, 0, `process should load in test env: ${result.stderr}`);
});
