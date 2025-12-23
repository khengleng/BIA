/**
 * Syndicate Routes - Investor Pooling (like AngelList)
 * 
 * Allows investors to pool resources and invest together in deals
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// In-memory data (replace with Prisma in production)
let syndicates: any[] = [
    {
        id: 'synd_1',
        tenantId: 'default',
        name: 'Cambodia Tech Fund I',
        description: 'Focused on early-stage tech startups in Cambodia and Southeast Asia. This fund targets innovative technology companies with strong growth potential in fintech, e-commerce, and digital services sectors.',
        leadInvestorId: 'inv_1',
        leadInvestor: {
            id: 'inv_1',
            name: 'John Smith',
            type: 'ANGEL'
        },
        targetAmount: 500000,
        raisedAmount: 325000,
        minInvestment: 5000,
        maxInvestment: 50000,
        managementFee: 2.0,
        carryFee: 20.0,
        status: 'OPEN',
        dealId: 'deal_1',
        deal: {
            id: 'deal_1',
            title: 'Series A - TechCorp Cambodia',
            amount: 500000
        },
        memberCount: 8,
        closingDate: '2025-03-01',
        createdAt: '2024-01-15'
    },
    {
        id: 'synd_2',
        tenantId: 'default',
        name: 'Agri-Tech Syndicate',
        description: 'Investing in sustainable agriculture technology in ASEAN region. Focus on IoT solutions, precision farming, and agricultural supply chain innovations.',
        leadInvestorId: 'inv_2',
        leadInvestor: {
            id: 'inv_2',
            name: 'Sarah Chen',
            type: 'VENTURE_CAPITAL'
        },
        targetAmount: 1000000,
        raisedAmount: 750000,
        minInvestment: 10000,
        maxInvestment: 100000,
        managementFee: 2.5,
        carryFee: 20.0,
        status: 'OPEN',
        dealId: 'deal_2',
        deal: {
            id: 'deal_2',
            title: 'Growth Round - AgriSmart',
            amount: 1000000
        },
        memberCount: 12,
        closingDate: '2025-04-15',
        createdAt: '2024-02-01'
    },
    {
        id: 'synd_3',
        tenantId: 'default',
        name: 'ASEAN Fintech Fund',
        description: 'Premium fund targeting high-growth fintech companies across Southeast Asia, with focus on digital payments, lending platforms, and blockchain solutions.',
        leadInvestorId: 'inv_6',
        leadInvestor: {
            id: 'inv_6',
            name: 'David Tan',
            type: 'FAMILY_OFFICE'
        },
        targetAmount: 2000000,
        raisedAmount: 2000000,
        minInvestment: 25000,
        maxInvestment: 200000,
        managementFee: 2.0,
        carryFee: 25.0,
        status: 'FUNDED',
        dealId: 'deal_3',
        deal: {
            id: 'deal_3',
            title: 'Series B - PayEasy Cambodia',
            amount: 2000000
        },
        memberCount: 15,
        closingDate: '2024-12-01',
        createdAt: '2024-06-15'
    },
    {
        id: 'synd_4',
        tenantId: 'default',
        name: 'Healthcare Innovation Pool',
        description: 'Focused on healthtech startups in Cambodia and Vietnam. Targeting telemedicine, health data analytics, and medical device companies.',
        leadInvestorId: 'inv_7',
        leadInvestor: {
            id: 'inv_7',
            name: 'Dr. Anika Patel',
            type: 'STRATEGIC'
        },
        targetAmount: 750000,
        raisedAmount: 150000,
        minInvestment: 5000,
        maxInvestment: 75000,
        managementFee: 2.0,
        carryFee: 20.0,
        status: 'FORMING',
        dealId: 'deal_4',
        deal: {
            id: 'deal_4',
            title: 'Seed Round - MediConnect',
            amount: 750000
        },
        memberCount: 3,
        closingDate: '2025-06-01',
        createdAt: '2024-11-01'
    },
    {
        id: 'synd_5',
        tenantId: 'default',
        name: 'Clean Energy Collective',
        description: 'Impact-focused syndicate investing in renewable energy and sustainability startups. Solar, wind, and energy storage solutions across Southeast Asia.',
        leadInvestorId: 'inv_8',
        leadInvestor: {
            id: 'inv_8',
            name: 'Green Capital Partners',
            type: 'INSTITUTIONAL'
        },
        targetAmount: 1500000,
        raisedAmount: 600000,
        minInvestment: 15000,
        maxInvestment: 150000,
        managementFee: 1.5,
        carryFee: 18.0,
        status: 'OPEN',
        dealId: 'deal_5',
        deal: {
            id: 'deal_5',
            title: 'Series A - SolarKhmer',
            amount: 1500000
        },
        memberCount: 6,
        closingDate: '2025-05-15',
        createdAt: '2024-09-01'
    },
    {
        id: 'synd_6',
        tenantId: 'default',
        name: 'EdTech Accelerator Fund',
        description: 'Closed syndicate that successfully invested in education technology across Cambodia. Achieved 3x returns within 2 years.',
        leadInvestorId: 'inv_9',
        leadInvestor: {
            id: 'inv_9',
            name: 'Education Ventures',
            type: 'CORPORATE'
        },
        targetAmount: 400000,
        raisedAmount: 400000,
        minInvestment: 5000,
        maxInvestment: 40000,
        managementFee: 2.0,
        carryFee: 20.0,
        status: 'CLOSED',
        dealId: 'deal_6',
        deal: {
            id: 'deal_6',
            title: 'Seed - LearnKhmer Academy',
            amount: 400000
        },
        memberCount: 18,
        closingDate: '2023-06-01',
        createdAt: '2023-01-15'
    }
];

let syndicateMembers: any[] = [
    // Syndicate 1 members
    { id: 'sm_1', syndicateId: 'synd_1', investorId: 'inv_3', investorName: 'Mike Johnson', amount: 25000, status: 'APPROVED', joinedAt: '2024-01-20' },
    { id: 'sm_2', syndicateId: 'synd_1', investorId: 'inv_4', investorName: 'Lisa Wang', amount: 50000, status: 'APPROVED', joinedAt: '2024-01-22' },
    { id: 'sm_3', syndicateId: 'synd_1', investorId: 'inv_5', investorName: 'Tom Brown', amount: 15000, status: 'PENDING', joinedAt: '2024-02-01' },
    { id: 'sm_4', syndicateId: 'synd_1', investorId: 'inv_10', investorName: 'Emma Davis', amount: 30000, status: 'APPROVED', joinedAt: '2024-01-25' },
    { id: 'sm_5', syndicateId: 'synd_1', investorId: 'inv_11', investorName: 'Robert Kim', amount: 45000, status: 'APPROVED', joinedAt: '2024-01-28' },
    // Syndicate 2 members
    { id: 'sm_6', syndicateId: 'synd_2', investorId: 'inv_12', investorName: 'Jennifer Lee', amount: 100000, status: 'APPROVED', joinedAt: '2024-02-05' },
    { id: 'sm_7', syndicateId: 'synd_2', investorId: 'inv_13', investorName: 'William Zhang', amount: 75000, status: 'APPROVED', joinedAt: '2024-02-10' },
    { id: 'sm_8', syndicateId: 'synd_2', investorId: 'inv_14', investorName: 'Sophia Nguyen', amount: 50000, status: 'APPROVED', joinedAt: '2024-02-15' },
    { id: 'sm_9', syndicateId: 'synd_2', investorId: 'inv_15', investorName: 'James Wilson', amount: 80000, status: 'PENDING', joinedAt: '2024-02-20' },
    // Syndicate 3 members (funded)
    { id: 'sm_10', syndicateId: 'synd_3', investorId: 'inv_16', investorName: 'Meng Sophea', amount: 200000, status: 'APPROVED', joinedAt: '2024-07-01' },
    { id: 'sm_11', syndicateId: 'synd_3', investorId: 'inv_17', investorName: 'Chea Vannak', amount: 150000, status: 'APPROVED', joinedAt: '2024-07-15' },
    // Syndicate 4 members (forming)
    { id: 'sm_12', syndicateId: 'synd_4', investorId: 'inv_18', investorName: 'Rachel Green', amount: 50000, status: 'APPROVED', joinedAt: '2024-11-10' },
    { id: 'sm_13', syndicateId: 'synd_4', investorId: 'inv_19', investorName: 'Mark Thompson', amount: 40000, status: 'PENDING', joinedAt: '2024-11-20' },
    // Syndicate 5 members
    { id: 'sm_14', syndicateId: 'synd_5', investorId: 'inv_20', investorName: 'Climate Ventures', amount: 150000, status: 'APPROVED', joinedAt: '2024-09-15' },
    { id: 'sm_15', syndicateId: 'synd_5', investorId: 'inv_21', investorName: 'Sustainable Future Fund', amount: 120000, status: 'APPROVED', joinedAt: '2024-09-20' },
];

// Get all syndicates
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { status, leadInvestorId } = req.query;
        let filtered = [...syndicates];

        if (status) {
            filtered = filtered.filter(s => s.status === status);
        }
        if (leadInvestorId) {
            filtered = filtered.filter(s => s.leadInvestorId === leadInvestorId);
        }

        // Add progress percentage
        const withProgress = filtered.map(s => ({
            ...s,
            progress: Math.round((s.raisedAmount / s.targetAmount) * 100)
        }));

        res.json(withProgress);
    } catch (error) {
        console.error('Error fetching syndicates:', error);
        res.status(500).json({ error: 'Failed to fetch syndicates' });
    }
});

// Get syndicate by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const syndicate = syndicates.find(s => s.id === req.params.id);
        if (!syndicate) {
            res.status(404).json({ error: 'Syndicate not found' });
            return;
        }

        // Get members
        const members = syndicateMembers.filter(m => m.syndicateId === req.params.id);

        res.json({
            ...syndicate,
            progress: Math.round((syndicate.raisedAmount / syndicate.targetAmount) * 100),
            members
        });
    } catch (error) {
        console.error('Error fetching syndicate:', error);
        res.status(500).json({ error: 'Failed to fetch syndicate' });
    }
});

// Create new syndicate (Lead Investor only)
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {
            name,
            description,
            targetAmount,
            minInvestment,
            maxInvestment,
            managementFee,
            carryFee,
            dealId,
            closingDate
        } = req.body;

        const newSyndicate = {
            id: `synd_${Date.now()}`,
            tenantId: req.user?.tenantId || 'default',
            name,
            description,
            leadInvestorId: req.user?.id,
            leadInvestor: {
                id: req.user?.id,
                name: `${req.user?.email?.split('@')[0]}`,
                type: 'ANGEL'
            },
            targetAmount,
            raisedAmount: 0,
            minInvestment: minInvestment || 1000,
            maxInvestment,
            managementFee: managementFee || 2.0,
            carryFee: carryFee || 20.0,
            status: 'FORMING',
            dealId,
            memberCount: 0,
            closingDate,
            createdAt: new Date().toISOString()
        };

        syndicates.push(newSyndicate);
        res.status(201).json(newSyndicate);
    } catch (error) {
        console.error('Error creating syndicate:', error);
        res.status(500).json({ error: 'Failed to create syndicate' });
    }
});

// Join syndicate
router.post('/:id/join', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const syndicate = syndicates.find(s => s.id === req.params.id);
        if (!syndicate) {
            res.status(404).json({ error: 'Syndicate not found' });
            return;
        }

        if (syndicate.status !== 'OPEN') {
            res.status(400).json({ error: 'Syndicate is not open for new members' });
            return;
        }

        const { amount } = req.body;

        if (amount < syndicate.minInvestment) {
            res.status(400).json({ error: `Minimum investment is $${syndicate.minInvestment}` });
            return;
        }

        if (syndicate.maxInvestment && amount > syndicate.maxInvestment) {
            res.status(400).json({ error: `Maximum investment is $${syndicate.maxInvestment}` });
            return;
        }

        // Check if already a member
        const existingMember = syndicateMembers.find(
            m => m.syndicateId === req.params.id && m.investorId === req.user?.id
        );
        if (existingMember) {
            res.status(400).json({ error: 'Already a member of this syndicate' });
            return;
        }

        const newMember = {
            id: `sm_${Date.now()}`,
            syndicateId: req.params.id,
            investorId: req.user?.id,
            investorName: req.user?.email?.split('@')[0],
            amount,
            status: 'PENDING',
            joinedAt: new Date().toISOString()
        };

        syndicateMembers.push(newMember);

        res.status(201).json({
            message: 'Request to join syndicate submitted',
            member: newMember
        });
    } catch (error) {
        console.error('Error joining syndicate:', error);
        res.status(500).json({ error: 'Failed to join syndicate' });
    }
});

// Approve/reject member (Lead Investor only)
router.patch('/:id/members/:memberId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const syndicate = syndicates.find(s => s.id === req.params.id);
        if (!syndicate) {
            res.status(404).json({ error: 'Syndicate not found' });
            return;
        }

        // Check if user is lead investor
        if (syndicate.leadInvestorId !== req.user?.id && req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: 'Only the lead investor can manage members' });
            return;
        }

        const memberIndex = syndicateMembers.findIndex(m => m.id === req.params.memberId);
        if (memberIndex === -1) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }

        const { status } = req.body;
        syndicateMembers[memberIndex].status = status;

        // Update syndicate if approved
        if (status === 'APPROVED') {
            const syndicateIndex = syndicates.findIndex(s => s.id === req.params.id);
            syndicates[syndicateIndex].raisedAmount += syndicateMembers[memberIndex].amount;
            syndicates[syndicateIndex].memberCount += 1;
        }

        res.json(syndicateMembers[memberIndex]);
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ error: 'Failed to update member' });
    }
});

// Get syndicate stats
router.get('/stats/overview', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const totalSyndicates = syndicates.length;
        const activeSyndicates = syndicates.filter(s => s.status === 'OPEN').length;
        const totalRaised = syndicates.reduce((sum, s) => sum + s.raisedAmount, 0);
        const totalTarget = syndicates.reduce((sum, s) => sum + s.targetAmount, 0);
        const totalMembers = syndicateMembers.filter(m => m.status === 'APPROVED').length;

        res.json({
            totalSyndicates,
            activeSyndicates,
            totalRaised,
            totalTarget,
            totalMembers,
            avgSyndicateSize: totalRaised / (activeSyndicates || 1)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
