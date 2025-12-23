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
        description: 'Focused on early-stage tech startups in Cambodia and Southeast Asia',
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
        closingDate: '2024-03-01',
        createdAt: '2024-01-15'
    },
    {
        id: 'synd_2',
        tenantId: 'default',
        name: 'Agri-Tech Syndicate',
        description: 'Investing in sustainable agriculture technology in ASEAN region',
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
        closingDate: '2024-04-15',
        createdAt: '2024-02-01'
    }
];

let syndicateMembers: any[] = [
    { id: 'sm_1', syndicateId: 'synd_1', investorId: 'inv_3', investorName: 'Mike Johnson', amount: 25000, status: 'APPROVED', joinedAt: '2024-01-20' },
    { id: 'sm_2', syndicateId: 'synd_1', investorId: 'inv_4', investorName: 'Lisa Wang', amount: 50000, status: 'APPROVED', joinedAt: '2024-01-22' },
    { id: 'sm_3', syndicateId: 'synd_1', investorId: 'inv_5', investorName: 'Tom Brown', amount: 15000, status: 'PENDING', joinedAt: '2024-02-01' },
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
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const syndicate = syndicates.find(s => s.id === req.params.id);
        if (!syndicate) {
            return res.status(404).json({ error: 'Syndicate not found' });
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
router.post('/:id/join', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const syndicate = syndicates.find(s => s.id === req.params.id);
        if (!syndicate) {
            return res.status(404).json({ error: 'Syndicate not found' });
        }

        if (syndicate.status !== 'OPEN') {
            return res.status(400).json({ error: 'Syndicate is not open for new members' });
        }

        const { amount } = req.body;

        if (amount < syndicate.minInvestment) {
            return res.status(400).json({ error: `Minimum investment is $${syndicate.minInvestment}` });
        }

        if (syndicate.maxInvestment && amount > syndicate.maxInvestment) {
            return res.status(400).json({ error: `Maximum investment is $${syndicate.maxInvestment}` });
        }

        // Check if already a member
        const existingMember = syndicateMembers.find(
            m => m.syndicateId === req.params.id && m.investorId === req.user?.id
        );
        if (existingMember) {
            return res.status(400).json({ error: 'Already a member of this syndicate' });
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
router.patch('/:id/members/:memberId', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const syndicate = syndicates.find(s => s.id === req.params.id);
        if (!syndicate) {
            return res.status(404).json({ error: 'Syndicate not found' });
        }

        // Check if user is lead investor
        if (syndicate.leadInvestorId !== req.user?.id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only the lead investor can manage members' });
        }

        const memberIndex = syndicateMembers.findIndex(m => m.id === req.params.memberId);
        if (memberIndex === -1) {
            return res.status(404).json({ error: 'Member not found' });
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
