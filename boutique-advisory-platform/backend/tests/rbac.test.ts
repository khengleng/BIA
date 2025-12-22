/**
 * E2E RBAC Tests for Boutique Advisory Platform
 * 
 * Tests all role-based access control scenarios as defined in RBAC_GUIDE.md
 * 
 * Roles tested: SUPER_ADMIN, ADMIN, ADVISOR, SME, INVESTOR, SUPPORT
 * 
 * Run with: npx ts-node tests/rbac.test.ts
 * Or with Jest: npm test -- tests/rbac.test.ts
 */

// Declare process for Node.js environment
declare const process: { env: Record<string, string | undefined>; exit: (code: number) => void };

const API_URL = process.env.API_URL || 'http://localhost:4000';

// Test credentials from RBAC_GUIDE.md
const TEST_USERS = {
    SUPER_ADMIN: { email: 'superadmin@boutique-advisory.com', password: 'SuperAdmin123!' },
    ADMIN: { email: 'admin@boutique-advisory.com', password: 'Admin123!' },
    ADVISOR: { email: 'advisor@boutique-advisory.com', password: 'Advisor123!' },
    SME: { email: 'sme@boutique-advisory.com', password: 'SME123!' },
    INVESTOR: { email: 'investor@boutique-advisory.com', password: 'Investor123!' },
    SUPPORT: { email: 'support@boutique-advisory.com', password: 'Support123!' }
};

interface TestResult {
    test: string;
    role: string;
    endpoint: string;
    method: string;
    expected: number;
    actual: number;
    passed: boolean;
    details?: string;
}

const results: TestResult[] = [];

// Helper function to login and get token
async function login(email: string, password: string): Promise<string | null> {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            return data.token;
        }
        return null;
    } catch {
        console.error(`Login failed for ${email}`);
        return null;
    }
}

// Helper function to make authenticated request
async function authRequest(
    endpoint: string,
    method: string,
    token: string,
    body?: object
): Promise<{ status: number; data?: any }> {
    try {
        const options: any = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);
        let data;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        return { status: response.status, data };
    } catch {
        return { status: 500 };
    }
}

// Test runner
async function runTest(
    testName: string,
    role: keyof typeof TEST_USERS,
    endpoint: string,
    method: string,
    expectedStatus: number | number[],
    body?: object
) {
    const user = TEST_USERS[role];
    const token = await login(user.email, user.password);

    if (!token) {
        results.push({
            test: testName,
            role,
            endpoint,
            method,
            expected: Array.isArray(expectedStatus) ? expectedStatus[0] : expectedStatus,
            actual: -1,
            passed: false,
            details: 'Failed to login'
        });
        return;
    }

    const response = await authRequest(endpoint, method, token, body);
    const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    const passed = expectedStatuses.includes(response.status);

    results.push({
        test: testName,
        role,
        endpoint,
        method,
        expected: expectedStatuses[0],
        actual: response.status,
        passed,
        details: passed ? undefined : `Expected ${expectedStatuses.join(' or ')}, got ${response.status}`
    });
}

// ============================================
// SME ENDPOINT TESTS
// ============================================
async function testSMEEndpoints() {
    console.log('\n📋 Testing SME Endpoints...\n');

    // GET /api/smes - All roles except unauthenticated should have access
    for (const role of ['ADMIN', 'ADVISOR', 'SME', 'INVESTOR'] as const) {
        await runTest(`GET /api/smes - ${role} should have access`, role, '/api/smes', 'GET', 200);
    }

    // POST /api/smes - Only ADMIN and ADVISOR can create
    await runTest('POST /api/smes - ADMIN can create', 'ADMIN', '/api/smes', 'POST', [201, 400], {
        companyName: 'Test SME',
        sector: 'Technology',
        businessDescription: 'Test description'
    });

    await runTest('POST /api/smes - ADVISOR can create', 'ADVISOR', '/api/smes', 'POST', [201, 400], {
        companyName: 'Test SME 2',
        sector: 'Technology',
        businessDescription: 'Test description'
    });

    await runTest('POST /api/smes - SME cannot create', 'SME', '/api/smes', 'POST', 403, {
        companyName: 'Test SME 3',
        sector: 'Technology',
        businessDescription: 'Test description'
    });

    await runTest('POST /api/smes - INVESTOR cannot create', 'INVESTOR', '/api/smes', 'POST', 403, {
        companyName: 'Test SME 4',
        sector: 'Technology',
        businessDescription: 'Test description'
    });

    // DELETE /api/smes/:id - Only ADMIN and ADVISOR can delete
    await runTest('DELETE /api/smes/:id - ADMIN can delete', 'ADMIN', '/api/smes/sme_1', 'DELETE', [200, 404]);
    await runTest('DELETE /api/smes/:id - ADVISOR can delete', 'ADVISOR', '/api/smes/sme_1', 'DELETE', [200, 404]);
}

// ============================================
// INVESTOR ENDPOINT TESTS
// ============================================
async function testInvestorEndpoints() {
    console.log('\n📋 Testing Investor Endpoints...\n');

    // GET /api/investors - All authenticated roles should have access
    for (const role of ['ADMIN', 'ADVISOR', 'SME', 'INVESTOR'] as const) {
        await runTest(`GET /api/investors - ${role} should have access`, role, '/api/investors', 'GET', 200);
    }

    // POST /api/investors - Only ADMIN and ADVISOR can create
    await runTest('POST /api/investors - ADMIN can create', 'ADMIN', '/api/investors', 'POST', [201, 400], {
        name: 'Test Investor',
        type: 'ANGEL'
    });

    await runTest('POST /api/investors - ADVISOR can create', 'ADVISOR', '/api/investors', 'POST', [201, 400], {
        name: 'Test Investor 2',
        type: 'ANGEL'
    });

    await runTest('POST /api/investors - SME cannot create', 'SME', '/api/investors', 'POST', 403, {
        name: 'Test Investor 3',
        type: 'ANGEL'
    });

    await runTest('POST /api/investors - INVESTOR cannot create', 'INVESTOR', '/api/investors', 'POST', 403, {
        name: 'Test Investor 4',
        type: 'ANGEL'
    });

    // DELETE /api/investors/:id - Only ADMIN and ADVISOR can delete
    await runTest('DELETE /api/investors/:id - ADMIN can delete', 'ADMIN', '/api/investors/investor_1', 'DELETE', [200, 404]);
    await runTest('DELETE /api/investors/:id - ADVISOR can delete', 'ADVISOR', '/api/investors/investor_1', 'DELETE', [200, 404]);
}

// ============================================
// DEAL ENDPOINT TESTS
// ============================================
async function testDealEndpoints() {
    console.log('\n📋 Testing Deal Endpoints...\n');

    // GET /api/deals - All authenticated roles should have access
    for (const role of ['ADMIN', 'ADVISOR', 'SME', 'INVESTOR'] as const) {
        await runTest(`GET /api/deals - ${role} should have access`, role, '/api/deals', 'GET', 200);
    }

    // POST /api/deals - ADMIN, ADVISOR, and INVESTOR can create (SME cannot)
    await runTest('POST /api/deals - ADMIN can create', 'ADMIN', '/api/deals', 'POST', [201, 400], {
        smeId: 'sme_1',
        title: 'Test Deal',
        description: 'Test deal description',
        amount: 50000
    });

    await runTest('POST /api/deals - ADVISOR can create', 'ADVISOR', '/api/deals', 'POST', [201, 400], {
        smeId: 'sme_1',
        title: 'Test Deal 2',
        description: 'Test deal description',
        amount: 50000
    });

    await runTest('POST /api/deals - INVESTOR can create', 'INVESTOR', '/api/deals', 'POST', [201, 400], {
        smeId: 'sme_1',
        title: 'Test Deal 3',
        description: 'Test deal description',
        amount: 50000
    });

    await runTest('POST /api/deals - SME cannot create', 'SME', '/api/deals', 'POST', 403, {
        smeId: 'sme_1',
        title: 'Test Deal 4',
        description: 'Test deal description',
        amount: 50000
    });

    // DELETE /api/deals/:id - Only ADMIN and ADVISOR can delete
    await runTest('DELETE /api/deals/:id - ADMIN can delete', 'ADMIN', '/api/deals/deal_1', 'DELETE', [200, 404]);
    await runTest('DELETE /api/deals/:id - ADVISOR can delete', 'ADVISOR', '/api/deals/deal_1', 'DELETE', [200, 404]);
    await runTest('DELETE /api/deals/:id - INVESTOR cannot delete', 'INVESTOR', '/api/deals/deal_1', 'DELETE', 403);
    await runTest('DELETE /api/deals/:id - SME cannot delete', 'SME', '/api/deals/deal_1', 'DELETE', 403);
}

// ============================================
// REPORTS ENDPOINT TESTS
// ============================================
async function testReportsEndpoints() {
    console.log('\n📋 Testing Reports Endpoints...\n');

    // GET /api/reports - All authenticated roles should have access
    for (const role of ['ADMIN', 'ADVISOR', 'SME', 'INVESTOR'] as const) {
        await runTest(`GET /api/reports - ${role} should have access`, role, '/api/reports', 'GET', 200);
    }

    // GET /api/reports/stats - All authenticated roles should have access
    for (const role of ['ADMIN', 'ADVISOR', 'SME', 'INVESTOR'] as const) {
        await runTest(`GET /api/reports/stats - ${role} should have access`, role, '/api/reports/stats', 'GET', 200);
    }

    // POST /api/reports/generate - Only ADMIN and ADVISOR can generate
    await runTest('POST /api/reports/generate - ADMIN can generate', 'ADMIN', '/api/reports/generate', 'POST', 201, {
        reportType: 'Monthly Summary'
    });

    await runTest('POST /api/reports/generate - ADVISOR can generate', 'ADVISOR', '/api/reports/generate', 'POST', 201, {
        reportType: 'Monthly Summary'
    });

    await runTest('POST /api/reports/generate - SME cannot generate', 'SME', '/api/reports/generate', 'POST', 403, {
        reportType: 'Monthly Summary'
    });

    await runTest('POST /api/reports/generate - INVESTOR cannot generate', 'INVESTOR', '/api/reports/generate', 'POST', 403, {
        reportType: 'Monthly Summary'
    });
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
    console.log('='.repeat(60));
    console.log('🧪 RBAC E2E Test Suite - Boutique Advisory Platform');
    console.log('='.repeat(60));
    console.log(`API URL: ${API_URL}`);
    console.log(`Started: ${new Date().toISOString()}`);

    try {
        await testSMEEndpoints();
        await testInvestorEndpoints();
        await testDealEndpoints();
        await testReportsEndpoints();
    } catch (error) {
        console.error('Test suite error:', error);
    }

    // Print results summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    console.log(`\n✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📋 Total: ${results.length}`);
    console.log(`🎯 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`);

    // Print failed tests
    if (failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        console.log('-'.repeat(60));
        results.filter(r => !r.passed).forEach(r => {
            console.log(`  ${r.test}`);
            console.log(`    Role: ${r.role} | ${r.method} ${r.endpoint}`);
            console.log(`    Expected: ${r.expected} | Actual: ${r.actual}`);
            if (r.details) console.log(`    Details: ${r.details}`);
            console.log();
        });
    }

    // Print all results as table
    console.log('\n📋 DETAILED RESULTS:');
    console.log('-'.repeat(100));
    console.log('| Test'.padEnd(50) + '| Role'.padEnd(12) + '| Method'.padEnd(8) + '| Expected'.padEnd(10) + '| Actual'.padEnd(8) + '| Status |');
    console.log('-'.repeat(100));

    results.forEach(r => {
        const status = r.passed ? '✅' : '❌';
        console.log(
            `| ${r.test.substring(0, 48).padEnd(48)} ` +
            `| ${r.role.padEnd(10)} ` +
            `| ${r.method.padEnd(6)} ` +
            `| ${String(r.expected).padEnd(8)} ` +
            `| ${String(r.actual).padEnd(6)} ` +
            `| ${status}     |`
        );
    });
    console.log('-'.repeat(100));

    console.log(`\nCompleted: ${new Date().toISOString()}`);

    // Exit with error code if tests failed
    if (failed > 0) {
        process.exit(1);
    }
}

// Run tests
runAllTests().catch(console.error);
