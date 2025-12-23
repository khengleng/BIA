import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create default tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            name: 'Boutique Advisory',
            domain: 'boutique-advisory.com',
            settings: {},
        },
    });
    console.log('✅ Created tenant:', tenant.name);

    // Hash passwords
    const passwordHash = await bcrypt.hash('admin123', 10);
    const advisorHash = await bcrypt.hash('advisor123', 10);
    const investorHash = await bcrypt.hash('investor123', 10);
    const smeHash = await bcrypt.hash('sme123', 10);

    // Create Admin user
    const adminUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: 'default',
                email: 'admin@boutique-advisory.com'
            }
        },
        update: {},
        create: {
            email: 'admin@boutique-advisory.com',
            password: passwordHash,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            tenantId: 'default',
        },
    });
    console.log('✅ Created admin user:', adminUser.email);

    // Create Advisor user
    const advisorUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: 'default',
                email: 'advisor@boutique-advisory.com'
            }
        },
        update: {},
        create: {
            email: 'advisor@boutique-advisory.com',
            password: advisorHash,
            firstName: 'Expert',
            lastName: 'Advisor',
            role: 'ADVISOR',
            tenantId: 'default',
        },
    });
    console.log('✅ Created advisor user:', advisorUser.email);

    // Create Investor user
    const investorUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: 'default',
                email: 'investor@boutique-advisory.com'
            }
        },
        update: {},
        create: {
            email: 'investor@boutique-advisory.com',
            password: investorHash,
            firstName: 'John',
            lastName: 'Smith',
            role: 'INVESTOR',
            tenantId: 'default',
        },
    });
    console.log('✅ Created investor user:', investorUser.email);

    // Create SME user
    const smeUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: 'default',
                email: 'sme@boutique-advisory.com'
            }
        },
        update: {},
        create: {
            email: 'sme@boutique-advisory.com',
            password: smeHash,
            firstName: 'TechCorp',
            lastName: 'Cambodia',
            role: 'SME',
            tenantId: 'default',
        },
    });
    console.log('✅ Created SME user:', smeUser.email);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin:    admin@boutique-advisory.com / admin123');
    console.log('   Advisor:  advisor@boutique-advisory.com / advisor123');
    console.log('   Investor: investor@boutique-advisory.com / investor123');
    console.log('   SME:      sme@boutique-advisory.com / sme123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
