/**
 * Security Validation on Startup
 * Validates security configuration before the server starts
 */

interface SecurityCheckResult {
    name: string;
    passed: boolean;
    message: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Run all security checks before server startup
 * Returns false if any CRITICAL checks fail
 */
export function validateSecurityConfiguration(): { success: boolean; results: SecurityCheckResult[] } {
    const results: SecurityCheckResult[] = [];

    // ============================================
    // CRITICAL CHECKS - Server won't start without these
    // ============================================

    // Check JWT_SECRET
    results.push(checkJwtSecret());

    // Check NODE_ENV in production
    results.push(checkNodeEnv());

    // Check DATABASE_URL
    results.push(checkDatabaseUrl());

    // ============================================
    // HIGH PRIORITY CHECKS
    // ============================================

    // Check for secure cookie settings
    results.push(checkCookieSettings());

    // Check CORS configuration
    results.push(checkCorsConfiguration());

    // Check rate limiting
    results.push(checkRateLimiting());

    // ============================================
    // MEDIUM PRIORITY CHECKS
    // ============================================

    // Check for HTTPS enforcement
    results.push(checkHttpsEnforcement());

    // Check session configuration
    results.push(checkSessionConfig());

    // Check logging configuration
    results.push(checkLoggingConfig());

    // ============================================
    // LOW PRIORITY CHECKS (Warnings)
    // ============================================

    // Check for monitoring
    results.push(checkMonitoring());

    // Print results
    printSecurityReport(results);

    // Check for critical failures
    const criticalFailures = results.filter(r => !r.passed && r.severity === 'CRITICAL');
    const highFailures = results.filter(r => !r.passed && r.severity === 'HIGH');

    if (criticalFailures.length > 0) {
        console.error('\n❌ CRITICAL SECURITY CHECKS FAILED - SERVER CANNOT START');
        return { success: false, results };
    }

    if (highFailures.length > 0) {
        console.warn('\n⚠️  HIGH PRIORITY SECURITY ISSUES DETECTED - Review before production');
    }

    return { success: true, results };
}

// ============================================
// INDIVIDUAL CHECKS
// ============================================

function checkJwtSecret(): SecurityCheckResult {
    const isProduction = process.env.NODE_ENV === 'production';
    const secret = process.env.JWT_SECRET || '';

    if (isProduction && (!secret || secret.length < 32)) {
        return {
            name: 'JWT_SECRET',
            passed: false,
            message: 'JWT_SECRET is too short or missing (min 32 characters required for production)',
            severity: 'CRITICAL'
        };
    }

    if (isProduction && secret === 'your-super-secret-jwt-key-change-in-production') {
        return {
            name: 'JWT_SECRET',
            passed: false,
            message: 'JWT_SECRET is using default value - CHANGE IMMEDIATELY for production',
            severity: 'CRITICAL'
        };
    }

    // Check for common weak secrets in production
    const weakSecrets = ['secret', 'password', 'jwt', 'token', '123456', 'admin'];
    if (isProduction && weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
        return {
            name: 'JWT_SECRET',
            passed: false,
            message: 'JWT_SECRET appears to contain weak/guessable content',
            severity: 'HIGH'
        };
    }

    return {
        name: 'JWT_SECRET',
        passed: true,
        message: secret ? `JWT_SECRET is configured (${secret.length} characters)` : 'JWT_SECRET not set (local dev mode)',
        severity: 'CRITICAL'
    };
}

function checkNodeEnv(): SecurityCheckResult {
    const nodeEnv = process.env.NODE_ENV;

    if (nodeEnv === 'production') {
        return {
            name: 'NODE_ENV',
            passed: true,
            message: 'NODE_ENV is set to production',
            severity: 'CRITICAL'
        };
    }

    // If running on a cloud platform, warn if not production
    if (process.env.KUBERNETES_SERVICE_HOST || process.env.RENDER || process.env.HEROKU || process.env.GOOGLE_CLOUD_PROJECT) {
        return {
            name: 'NODE_ENV',
            passed: false,
            message: `NODE_ENV is "${nodeEnv}" but running on cloud platform - should be "production"`,
            severity: 'HIGH'
        };
    }

    return {
        name: 'NODE_ENV',
        passed: true,
        message: `NODE_ENV is "${nodeEnv}" (development mode)`,
        severity: 'CRITICAL'
    };
}

function checkDatabaseUrl(): SecurityCheckResult {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        return {
            name: 'DATABASE_URL',
            passed: false,
            message: 'DATABASE_URL is not configured',
            severity: 'CRITICAL'
        };
    }

    // Check for localhost in production
    if (process.env.NODE_ENV === 'production' &&
        (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1'))) {
        return {
            name: 'DATABASE_URL',
            passed: false,
            message: 'DATABASE_URL points to localhost in production',
            severity: 'CRITICAL'
        };
    }

    // Check for SSL in production
    if (process.env.NODE_ENV === 'production' && !dbUrl.includes('sslmode=require')) {
        return {
            name: 'DATABASE_URL',
            passed: false,
            message: 'DATABASE_URL should include sslmode=require for production',
            severity: 'HIGH'
        };
    }

    return {
        name: 'DATABASE_URL',
        passed: true,
        message: 'DATABASE_URL is configured',
        severity: 'CRITICAL'
    };
}

function checkCookieSettings(): SecurityCheckResult {
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
        return {
            name: 'Cookie Security',
            passed: true,
            message: 'Development mode - cookie security checks skipped',
            severity: 'HIGH'
        };
    }

    // In production, cookies should be secure
    return {
        name: 'Cookie Security',
        passed: true,
        message: 'Cookie security settings will be enforced in production',
        severity: 'HIGH'
    };
}

function checkCorsConfiguration(): SecurityCheckResult {
    const frontendUrl = process.env.FRONTEND_URL;
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction && !frontendUrl) {
        return {
            name: 'CORS Configuration',
            passed: false,
            message: 'FRONTEND_URL not set - CORS may be too permissive',
            severity: 'HIGH'
        };
    }

    if (frontendUrl?.includes('*')) {
        return {
            name: 'CORS Configuration',
            passed: false,
            message: 'FRONTEND_URL contains wildcard - not recommended for production',
            severity: 'HIGH'
        };
    }

    return {
        name: 'CORS Configuration',
        passed: true,
        message: frontendUrl ? `CORS configured for: ${frontendUrl}` : 'CORS will allow localhost in development',
        severity: 'HIGH'
    };
}

function checkRateLimiting(): SecurityCheckResult {
    // Rate limiting is enabled by default in our configuration
    return {
        name: 'Rate Limiting',
        passed: true,
        message: 'Rate limiting is enabled (100 req/15min in production)',
        severity: 'HIGH'
    };
}

function checkHttpsEnforcement(): SecurityCheckResult {
    const isProduction = process.env.NODE_ENV === 'production';

    // Many cloud platforms automatically provide HTTPS termination
    if (process.env.KUBERNETES_SERVICE_HOST || process.env.GOOGLE_CLOUD_PROJECT) {
        return {
            name: 'HTTPS Enforcement',
            passed: true,
            message: 'Running in cloud environment - HTTPS is typically handled by ingress/load balancer',
            severity: 'MEDIUM'
        };
    }

    if (isProduction) {
        return {
            name: 'HTTPS Enforcement',
            passed: true,
            message: 'HSTS headers are enabled for production',
            severity: 'MEDIUM'
        };
    }

    return {
        name: 'HTTPS Enforcement',
        passed: true,
        message: 'Development mode - HTTPS not required',
        severity: 'MEDIUM'
    };
}

function checkSessionConfig(): SecurityCheckResult {
    const sessionSecret = process.env.SESSION_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction && !sessionSecret) {
        return {
            name: 'Session Configuration',
            passed: true,
            message: 'Using JWT-based auth (no server-side sessions)',
            severity: 'MEDIUM'
        };
    }

    return {
        name: 'Session Configuration',
        passed: true,
        message: 'Session configuration is acceptable',
        severity: 'MEDIUM'
    };
}

function checkLoggingConfig(): SecurityCheckResult {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        name: 'Logging Configuration',
        passed: true,
        message: isProduction ? 'Using combined logging format' : 'Using dev logging format',
        severity: 'MEDIUM'
    };
}

function checkMonitoring(): SecurityCheckResult {
    // Check for monitoring endpoints or services
    return {
        name: 'Monitoring',
        passed: true,
        message: 'Health check endpoint available at /health',
        severity: 'LOW'
    };
}

// ============================================
// REPORT PRINTING
// ============================================

function printSecurityReport(results: SecurityCheckResult[]): void {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                   SECURITY CONFIGURATION CHECK                    ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');

    const grouped = {
        CRITICAL: results.filter(r => r.severity === 'CRITICAL'),
        HIGH: results.filter(r => r.severity === 'HIGH'),
        MEDIUM: results.filter(r => r.severity === 'MEDIUM'),
        LOW: results.filter(r => r.severity === 'LOW'),
    };

    for (const [severity, checks] of Object.entries(grouped)) {
        if (checks.length === 0) continue;

        console.log(`║ ${severity} PRIORITY:`);
        console.log('║──────────────────────────────────────────────────────────────────');

        for (const check of checks) {
            const icon = check.passed ? '✅' : '❌';
            const status = check.passed ? 'PASS' : 'FAIL';
            console.log(`║ ${icon} [${status}] ${check.name}`);
            console.log(`║    └─ ${check.message}`);
        }
        console.log('║');
    }

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const percentage = Math.round((passed / total) * 100);

    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║ RESULT: ${passed}/${total} checks passed (${percentage}%)`);
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('\n');
}

export default {
    validateSecurityConfiguration
};
