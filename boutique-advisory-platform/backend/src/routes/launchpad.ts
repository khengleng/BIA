import { Router } from 'express';
import { prisma } from '../database';
import { authenticateToken, authorizeRoles } from '../middleware/jwt-auth';
import * as bcrypt from 'bcryptjs';

const router = Router();

// ==========================================
// PUBLIC/INVESTOR ROUTES
// ==========================================

// TEMP: Mock Data Seeder
router.get('/seed-mock-data', async (req, res) => {
    try {
        const tenantId = 'default';
        const password = await bcrypt.hash('password123', 10);
        let advisorUser = await prisma.user.findUnique({ where: { tenantId_email: { tenantId, email: 'mock.advisor@cambobia.com' } }, include: { advisor: true } });
        if (!advisorUser) {
            advisorUser = await prisma.user.create({
                data: { tenantId, email: 'mock.advisor@cambobia.com', password, firstName: 'Alice', lastName: 'Advises', role: 'ADVISOR', isEmailVerified: true, advisor: { create: { tenantId, name: 'Alice Advisory Firm', specialization: ['Tokenized Equity', 'Growth Capital'], certificationList: ['CFA'], status: 'ACTIVE' } } }, include: { advisor: true }
            });
        }
        let advisoryService = await prisma.advisoryService.findFirst({ where: { advisorId: advisorUser.advisor!.id } });
        if (!advisoryService) {
            advisoryService = await prisma.advisoryService.create({
                data: { tenantId, advisorId: advisorUser.advisor!.id, name: 'Tokenization Prep', category: 'LEGAL', description: 'Prep for drop.', price: 5000, duration: '4 weeks', features: ['Legal'], status: 'ACTIVE' }
            });
        }
        let smeUser = await prisma.user.findUnique({ where: { tenantId_email: { tenantId, email: 'mock.sme@cambobia.com' } }, include: { sme: true } });
        if (!smeUser) {
            smeUser = await prisma.user.create({
                data: { tenantId, email: 'mock.sme@cambobia.com', password, firstName: 'Bob', lastName: 'Builder', role: 'SME', isEmailVerified: true, sme: { create: { tenantId, name: 'EcoBuild Solutions', sector: 'CLEANTECH', stage: 'GROWTH', fundingRequired: 500000, description: 'Sustainable.', status: 'CERTIFIED' } } }, include: { sme: true }
            });
        }
        let investorUser = await prisma.user.findUnique({ where: { tenantId_email: { tenantId, email: 'mock.investor@cambobia.com' } }, include: { investor: true, wallet: true } });
        if (!investorUser) {
            investorUser = await prisma.user.create({
                data: { tenantId, email: 'mock.investor@cambobia.com', password, firstName: 'Charlie', lastName: 'Capital', role: 'INVESTOR', isEmailVerified: true, investor: { create: { tenantId, name: 'C Capital Ventures', type: 'INSTITUTIONAL', status: 'ACTIVE', kycStatus: 'VERIFIED' } }, wallet: { create: { tenantId, balance: 1000000.0, currency: 'USD' } } }, include: { investor: true, wallet: true }
            });
        } else if (!investorUser.wallet) {
            await prisma.wallet.create({ data: { userId: investorUser.id, tenantId, balance: 1000000.0, currency: 'USD' } });
        }
        let deal = await prisma.deal.findFirst({ where: { smeId: smeUser.sme!.id, title: 'EcoBuild Series A Tokenization' } });
        if (!deal) {
            deal = await prisma.deal.create({ data: { tenantId, smeId: smeUser.sme!.id, title: 'EcoBuild Series A Tokenization', description: 'Raising 500k.', amount: 500000, equity: 10, status: 'LAUNCHPAD_PREP' } });
        } else if (!['LAUNCHPAD_PREP', 'LAUNCHPAD_ACTIVE', 'FUNDED'].includes(deal.status)) {
            await prisma.deal.update({ where: { id: deal.id }, data: { status: 'LAUNCHPAD_PREP' } });
        }
        const now = new Date();
        const startTime = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1);
        const endTime = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
        let offering = await prisma.launchpadOffering.findFirst({ where: { dealId: deal.id } });
        if (!offering) {
            offering = await prisma.launchpadOffering.create({ data: { tenantId, dealId: deal.id, hardCap: 500000, unitPrice: 10.0, minCommitment: 1000, maxCommitment: 50000, startTime, endTime } });
            await prisma.deal.update({ where: { id: deal.id }, data: { status: 'LAUNCHPAD_ACTIVE' } });
        }
        let commitment = await prisma.launchpadCommitment.findFirst({ where: { offeringId: offering.id, investorId: investorUser.investor!.id } });
        if (!commitment && investorUser.investor) {
            commitment = await prisma.launchpadCommitment.create({ data: { tenantId, offeringId: offering.id, investorId: investorUser.investor.id, committedAmount: 25000, status: 'PENDING' } });
            const wallet = await prisma.wallet.findUnique({ where: { userId: investorUser.id } });
            if (wallet) {
                await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: 25000 }, frozenBalance: { increment: 25000 } } });
                await prisma.walletTransaction.create({ data: { walletId: wallet.id, tenantId, type: 'LAUNCHPAD_LOCK', amount: -25000, status: 'SUCCESS', description: `Locked commitment for EcoBuild Launchpad` } });
            }
        }

        let deal2 = await prisma.deal.findFirst({ where: { smeId: smeUser.sme!.id, title: 'EcoBuild Seed (Completed)' } });
        if (!deal2) {
            deal2 = await prisma.deal.create({ data: { tenantId, smeId: smeUser.sme!.id, title: 'EcoBuild Seed (Completed)', description: 'Seed round.', amount: 100000, equity: 5, status: 'SECONDARY_TRADING' } });
            const dealInv = await prisma.dealInvestor.create({ data: { dealId: deal2.id, investorId: investorUser.investor!.id, amount: 25000, status: 'COMPLETED' } });
            await prisma.secondaryListing.create({ data: { tenantId, sellerId: investorUser.investor!.id, dealInvestorId: dealInv.id, sharesAvailable: 1000, pricePerShare: 12.50, minPurchase: 10, status: 'ACTIVE' } });
        }
        res.json({ success: true, message: 'Mock data seeded successfully.' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Get all launchpad offerings (with optional status filters)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || req.headers['x-tenant-id'];
        if (!tenantId) {
            res.status(400).json({ error: 'Tenant ID required' });
            return;
        }

        const offerings = await prisma.launchpadOffering.findMany({
            where: { tenantId },
            include: {
                deal: {
                    include: { sme: true }
                }
            },
            orderBy: { startTime: 'desc' }
        });

        res.json(offerings);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch offerings', details: error.message });
    }
});

// Get a single offering by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const offering = await prisma.launchpadOffering.findUnique({
            where: { id },
            include: {
                deal: {
                    include: { sme: true, documents: true }
                }
            }
        });

        if (!offering) {
            res.status(404).json({ error: 'Offering not found' });
            return;
        }

        res.json(offering);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch offering', details: error.message });
    }
});

// Submit a commitment (Investor)
router.post('/:id/commit', authenticateToken, authorizeRoles('INVESTOR'), async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const userId = (req as any).user.id;
        const tenantId = (req as any).user.tenantId;

        if (!amount || amount <= 0) {
            res.status(400).json({ error: 'Invalid commitment amount' });
            return;
        }

        // 1. Fetch Offering & Validations
        const offering = await prisma.launchpadOffering.findUnique({ where: { id } });
        if (!offering) {
            res.status(404).json({ error: 'Offering not found' });
            return;
        }

        if (amount < offering.minCommitment || amount > offering.maxCommitment) {
            res.status(400).json({ error: `Amount must be between ${offering.minCommitment} and ${offering.maxCommitment}` });
            return;
        }

        const now = new Date();
        if (now < offering.startTime || now > offering.endTime) {
            res.status(400).json({ error: 'Offering is not currently active' });
            return;
        }

        // 2. Fetch Investor Profile
        const investor = await prisma.investor.findUnique({ where: { userId } });
        if (!investor) {
            res.status(404).json({ error: 'Investor profile not found' });
            return;
        }

        // 3. Process Transaction in a Serializable Transaction
        const result = await prisma.$transaction(async (tx) => {
            // Find wallet
            const wallet = await tx.wallet.findUnique({
                where: { userId }
            });

            if (!wallet) throw new Error('Wallet not found');
            if (wallet.balance < amount) throw new Error('Insufficient wallet balance');

            // Deduct from wallet balance and move to frozen balance (locked)
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { decrement: amount },
                    frozenBalance: { increment: amount }
                }
            });

            // Record transaction
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    tenantId: tenantId,
                    type: 'LAUNCHPAD_LOCK',
                    amount: -amount,
                    status: 'SUCCESS',
                    description: `Locked commitment for offering ${id}`
                }
            });

            // Create Commitment Record
            const commitment = await tx.launchpadCommitment.create({
                data: {
                    offeringId: id,
                    investorId: investor.id,
                    tenantId: tenantId,
                    committedAmount: amount,
                    status: 'PENDING'
                }
            });

            return commitment;
        });

        res.json({ message: 'Commitment successful', commitment: result });

    } catch (error: any) {
        if (error.message.includes('Insufficient wallet balance')) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to process commitment', details: error.message });
    }
});

// ==========================================
// ADMIN / OPERATOR / ADVISOR ROUTES
// ==========================================

// Get Deals that are ready to be listed on the Launchpad
router.get('/eligible-deals', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'ADVISOR', 'PLATFORM_OPERATOR'), async (req, res) => {
    try {
        const tenantId = (req as any).user.tenantId;

        const deals = await prisma.deal.findMany({
            where: {
                tenantId,
                status: {
                    in: ['LAUNCHPAD_PREP', 'APPROVED_FOR_LISTING']
                },
                launchpadOffering: null // Not already an offering
            },
            include: { sme: true }
        });

        res.json(deals);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch eligible deals', details: error.message });
    }
});

// Create a new offering (Triggered from cambobia.com origination normally)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_OPERATOR', 'ADVISOR'), async (req, res) => {
    try {
        const tenantId = (req as any).user.tenantId;
        const { dealId, hardCap, unitPrice, minCommitment, maxCommitment, startTime, endTime } = req.body;

        // Verify deal exists
        const deal = await prisma.deal.findUnique({ where: { id: dealId, tenantId } });
        if (!deal) {
            res.status(404).json({ error: 'Deal not found' });
            return;
        }

        // Update Deal Status to Prep
        await prisma.deal.update({
            where: { id: dealId },
            data: { status: 'LAUNCHPAD_PREP' }
        });

        // Create Offering
        const offering = await prisma.launchpadOffering.create({
            data: {
                dealId,
                tenantId,
                hardCap,
                unitPrice,
                minCommitment,
                maxCommitment,
                startTime: new Date(startTime),
                endTime: new Date(endTime)
            }
        });

        res.status(201).json({ message: 'Launchpad offering created', offering });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create offering', details: error.message });
    }
});

export default router;
