
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const platform = (process.argv[2] || process.env.SEED_PLATFORM || process.env.SERVICE_MODE || 'core').toLowerCase();
const isTrade = platform === 'trade' || platform === 'trading';
const tenantId = isTrade ? (process.env.TRADING_TENANT_ID || 'trade') : (process.env.CORE_TENANT_ID || 'default');

async function main() {
    if (isTrade) {
        const adminPassword = process.env.INITIAL_TRADING_ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD || 'TradeAdmin123!';
        const investorHash = await bcrypt.hash('TradeInvestor123!', 12);
        const sellerHash = await bcrypt.hash('TradeSeller123!', 12);
        const adminHash = await bcrypt.hash(adminPassword, 12);
        const adminEmail = process.env.DEFAULT_TRADING_SUPERADMIN_EMAIL || 'trading-admin@cambobia.com';

        await prisma.tenant.upsert({
            where: { id: tenantId },
            update: { name: 'CamboBia Trading', domain: 'trade.cambobia.com' },
            create: { id: tenantId, name: 'CamboBia Trading', domain: 'trade.cambobia.com', settings: {} }
        });

        await prisma.user.upsert({
            where: { tenantId_email: { tenantId, email: adminEmail } },
            update: { isEmailVerified: true, status: 'ACTIVE', password: adminHash, role: 'SUPER_ADMIN' },
            create: {
                email: adminEmail,
                password: adminHash,
                firstName: 'Trading',
                lastName: 'Administrator',
                role: 'SUPER_ADMIN',
                tenantId,
                isEmailVerified: true,
                status: 'ACTIVE'
            }
        });

        const investor = await prisma.user.upsert({
            where: { tenantId_email: { tenantId, email: 'tradeinvestor.test@cambobia.com' } },
            update: { isEmailVerified: true, status: 'ACTIVE', password: investorHash, role: 'INVESTOR' },
            create: {
                email: 'tradeinvestor.test@cambobia.com',
                password: investorHash,
                firstName: 'Trade',
                lastName: 'Investor',
                role: 'INVESTOR',
                tenantId,
                isEmailVerified: true,
                status: 'ACTIVE'
            }
        });

        await prisma.investor.upsert({
            where: { userId: investor.id },
            update: { tenantId, name: 'Trade Investor', type: 'ANGEL', kycStatus: 'VERIFIED' },
            create: {
                userId: investor.id,
                tenantId,
                name: 'Trade Investor',
                type: 'ANGEL',
                kycStatus: 'VERIFIED'
            }
        });

        const seller = await prisma.user.upsert({
            where: { tenantId_email: { tenantId, email: 'trader.seller@cambobia.com' } },
            update: { isEmailVerified: true, status: 'ACTIVE', password: sellerHash, role: 'INVESTOR' },
            create: {
                email: 'trader.seller@cambobia.com',
                password: sellerHash,
                firstName: 'Listing',
                lastName: 'Seller',
                role: 'INVESTOR',
                tenantId,
                isEmailVerified: true,
                status: 'ACTIVE'
            }
        });

        await prisma.investor.upsert({
            where: { userId: seller.id },
            update: { tenantId, name: 'Listing Seller', type: 'PRIVATE_EQUITY', kycStatus: 'VERIFIED' },
            create: {
                userId: seller.id,
                tenantId,
                name: 'Listing Seller',
                type: 'PRIVATE_EQUITY',
                kycStatus: 'VERIFIED'
            }
        });

        console.log(`Successfully created trade demo users in tenant ${tenantId}.`);
        return;
    }

    const investorHash = await bcrypt.hash('investor123', 12);
    const advisorHash = await bcrypt.hash('advisor123', 12);

    await prisma.tenant.upsert({
        where: { id: tenantId },
        update: { name: 'Boutique Advisory', domain: 'cambobia.com' },
        create: { id: tenantId, name: 'Boutique Advisory', domain: 'cambobia.com', settings: {} }
    });

    const investor = await prisma.user.upsert({
        where: { tenantId_email: { tenantId, email: 'investor@cambobia.com' } },
        update: { isEmailVerified: true, status: 'ACTIVE', password: investorHash, role: 'INVESTOR' },
        create: {
            email: 'investor@cambobia.com',
            password: investorHash,
            firstName: 'Test',
            lastName: 'Investor',
            role: 'INVESTOR',
            tenantId,
            isEmailVerified: true,
            status: 'ACTIVE'
        }
    });

    await prisma.investor.upsert({
        where: { userId: investor.id },
        update: {},
        create: {
            userId: investor.id,
            tenantId,
            name: 'Test Investor',
            type: 'ANGEL',
            kycStatus: 'VERIFIED'
        }
    });

    const advisor = await prisma.user.upsert({
        where: { tenantId_email: { tenantId, email: 'advisor@cambobia.com' } },
        update: { isEmailVerified: true, status: 'ACTIVE', password: advisorHash, role: 'ADVISOR' },
        create: {
            email: 'advisor@cambobia.com',
            password: advisorHash,
            firstName: 'Test',
            lastName: 'Advisor',
            role: 'ADVISOR',
            tenantId,
            isEmailVerified: true,
            status: 'ACTIVE'
        }
    });

    await prisma.advisor.upsert({
        where: { userId: advisor.id },
        update: {},
        create: {
            userId: advisor.id,
            tenantId,
            name: 'Test Advisor',
            specialization: ['Investment'],
            certificationList: ['CFA'],
            status: 'ACTIVE'
        }
    });

    console.log(`Successfully created core demo users in tenant ${tenantId}.`);
}

main().finally(() => prisma.$disconnect());
