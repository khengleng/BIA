import { prisma } from '../database';

/**
 * Perform maintenance tasks:
 * 1. Data retention (Log rotation, session cleanup)
 * 2. Database optimization (if needed)
 */
export async function runMaintenanceTasks() {
    console.log('🧹 [Maintenance] Starting maintenance tasks...');
    const start = Date.now();

    try {
        // 1. Process Data Retention Rules
        await processLogRetention();

        // 2. Clean up expired refresh tokens
        await cleanupExpiredTokens();

        const duration = Date.now() - start;
        console.log(`✅ [Maintenance] Completed in ${duration}ms`);
    } catch (error: any) {
        console.error('❌ [Maintenance] Failed:', error.message);
    }
}

/**
 * Rotate logs based on retention rules defined in the database
 */
async function processLogRetention() {
    try {
        // Check if retention table exists (failsafe against missing migrations)
        const rules = await prisma.dataRetentionRule.findMany({
            where: {
                module: 'ACTIVITY_LOGS',
                status: 'ACTIVE'
            }
        }).catch(() => []);

        if (rules.length === 0) {
            // Default: Keep logs for 90 days if no rule is set
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const deleted = await prisma.activityLog.deleteMany({
                where: { timestamp: { lt: ninetyDaysAgo } }
            });

            if (deleted.count > 0) {
                console.log(`   [Logs] Cleaned up ${deleted.count} logs older than 90 days (default)`);
            }
            return;
        }

        // Process each tenant's rule
        for (const rule of rules) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - rule.retentionDays);

            // Note: In a real implementation, you might ARCHIVE these to S3 before deleting.
            // For now, we purge to manage DB size as per audit recommendation.
            const deleted = await prisma.activityLog.deleteMany({
                where: {
                    tenantId: rule.tenantId,
                    timestamp: { lt: cutoff }
                }
            });

            if (deleted.count > 0) {
                console.log(`   [Logs] Cleaned up ${deleted.count} logs for tenant ${rule.tenantId} (Rule: ${rule.retentionDays} days)`);
            }
        }
    } catch (error: any) {
        // Silent fail if table doesn't exist yet
        if (error.code !== 'P2021') {
            console.error('   [Logs] Retention processing failed:', error.message);
        }
    }
}

/**
 * Remove revoked or expired refresh tokens
 */
async function cleanupExpiredTokens() {
    try {
        const deleted = await prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { revoked: true }
                ]
            }
        });

        if (deleted.count > 0) {
            console.log(`   [Auth] Cleaned up ${deleted.count} expired/revoked refresh tokens`);
        }
    } catch (error: any) {
        console.error('   [Auth] Token cleanup failed:', error.message);
    }
}
