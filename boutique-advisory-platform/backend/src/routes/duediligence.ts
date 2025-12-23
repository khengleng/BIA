/**
 * Due Diligence Routes - SME Scoring System (like OurCrowd)
 * 
 * Provides detailed scoring and risk assessment for SMEs
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// In-memory data (replace with Prisma in production)
let dueDiligences: any[] = [
    {
        id: 'dd_1',
        smeId: 'sme_1',
        sme: {
            id: 'sme_1',
            name: 'TechCorp Cambodia',
            sector: 'Technology'
        },
        advisorId: 'adv_1',
        advisor: {
            id: 'adv_1',
            name: 'Expert Advisor'
        },
        financialScore: 85,
        teamScore: 90,
        marketScore: 78,
        productScore: 88,
        legalScore: 92,
        operationalScore: 75,
        overallScore: 84.67,
        riskLevel: 'LOW',
        strengths: [
            'Strong founding team with 15+ years experience',
            'Proven revenue model with 40% YoY growth',
            'Strategic partnerships with major banks',
            'Clear regulatory compliance framework'
        ],
        weaknesses: [
            'Limited international presence',
            'Dependency on single revenue stream',
            'High customer acquisition cost'
        ],
        recommendations: [
            'Diversify revenue streams through new product lines',
            'Expand to Vietnam and Thailand markets',
            'Strengthen operational processes'
        ],
        redFlags: [],
        status: 'COMPLETED',
        completedAt: '2024-01-20',
        expiresAt: '2025-01-20',
        createdAt: '2024-01-10'
    },
    {
        id: 'dd_2',
        smeId: 'sme_2',
        sme: {
            id: 'sme_2',
            name: 'AgriSmart Solutions',
            sector: 'Agriculture'
        },
        advisorId: 'adv_1',
        financialScore: 72,
        teamScore: 80,
        marketScore: 85,
        productScore: 75,
        legalScore: 70,
        operationalScore: 68,
        overallScore: 75.0,
        riskLevel: 'MEDIUM',
        strengths: [
            'Innovative IoT technology for farming',
            'Large addressable market in SEA',
            'Government support and subsidies available'
        ],
        weaknesses: [
            'Early-stage with limited revenue',
            'Technology adoption barriers in rural areas',
            'Seasonal revenue patterns'
        ],
        recommendations: [
            'Build pilot programs with large farms',
            'Secure government partnerships',
            'Develop offline-capable solutions'
        ],
        redFlags: [
            'Pending legal dispute with former partner'
        ],
        status: 'COMPLETED',
        completedAt: '2024-02-01',
        expiresAt: '2025-02-01',
        createdAt: '2024-01-25'
    }
];

// Calculate overall score helper
function calculateOverallScore(scores: any): number {
    const weights = {
        financial: 0.25,
        team: 0.20,
        market: 0.20,
        product: 0.15,
        legal: 0.10,
        operational: 0.10
    };

    return Math.round(
        (scores.financialScore * weights.financial +
            scores.teamScore * weights.team +
            scores.marketScore * weights.market +
            scores.productScore * weights.product +
            scores.legalScore * weights.legal +
            scores.operationalScore * weights.operational) * 100
    ) / 100;
}

// Determine risk level helper
function determineRiskLevel(score: number, redFlags: string[]): string {
    if (redFlags.length > 2) return 'VERY_HIGH';
    if (redFlags.length > 0 && score < 70) return 'HIGH';
    if (score >= 80) return 'LOW';
    if (score >= 60) return 'MEDIUM';
    return 'HIGH';
}

// Get all due diligence reports
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { smeId, status, riskLevel } = req.query;
        let filtered = [...dueDiligences];

        if (smeId) {
            filtered = filtered.filter(d => d.smeId === smeId);
        }
        if (status) {
            filtered = filtered.filter(d => d.status === status);
        }
        if (riskLevel) {
            filtered = filtered.filter(d => d.riskLevel === riskLevel);
        }

        res.json(filtered);
    } catch (error) {
        console.error('Error fetching due diligences:', error);
        res.status(500).json({ error: 'Failed to fetch due diligences' });
    }
});

// Get due diligence by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const dd = dueDiligences.find(d => d.id === req.params.id);
        if (!dd) {
            res.status(404).json({ error: 'Due diligence not found' });
            return;
        }

        res.json(dd);
    } catch (error) {
        console.error('Error fetching due diligence:', error);
        res.status(500).json({ error: 'Failed to fetch due diligence' });
    }
});

// Get due diligence for specific SME
router.get('/sme/:smeId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const dd = dueDiligences.find(d => d.smeId === req.params.smeId && d.status === 'COMPLETED');
        if (!dd) {
            res.status(404).json({ error: 'No completed due diligence found for this SME' });
            return;
        }

        res.json(dd);
    } catch (error) {
        console.error('Error fetching SME due diligence:', error);
        res.status(500).json({ error: 'Failed to fetch due diligence' });
    }
});

// Create new due diligence (Advisor only)
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { smeId, sme } = req.body;

        const newDD = {
            id: `dd_${Date.now()}`,
            smeId,
            sme: sme || { id: smeId, name: 'Unknown SME', sector: 'Unknown' },
            advisorId: req.user?.id,
            advisor: {
                id: req.user?.id,
                name: req.user?.email?.split('@')[0]
            },
            financialScore: 0,
            teamScore: 0,
            marketScore: 0,
            productScore: 0,
            legalScore: 0,
            operationalScore: 0,
            overallScore: 0,
            riskLevel: 'MEDIUM',
            strengths: [],
            weaknesses: [],
            recommendations: [],
            redFlags: [],
            status: 'PENDING',
            completedAt: null,
            expiresAt: null,
            createdAt: new Date().toISOString()
        };

        dueDiligences.push(newDD);
        res.status(201).json(newDD);
    } catch (error) {
        console.error('Error creating due diligence:', error);
        res.status(500).json({ error: 'Failed to create due diligence' });
    }
});

// Update due diligence scores (Advisor only)
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const index = dueDiligences.findIndex(d => d.id === req.params.id);
        if (index === -1) {
            res.status(404).json({ error: 'Due diligence not found' });
            return;
        }

        const {
            financialScore,
            teamScore,
            marketScore,
            productScore,
            legalScore,
            operationalScore,
            strengths,
            weaknesses,
            recommendations,
            redFlags,
            status
        } = req.body;

        // Update scores
        if (financialScore !== undefined) dueDiligences[index].financialScore = financialScore;
        if (teamScore !== undefined) dueDiligences[index].teamScore = teamScore;
        if (marketScore !== undefined) dueDiligences[index].marketScore = marketScore;
        if (productScore !== undefined) dueDiligences[index].productScore = productScore;
        if (legalScore !== undefined) dueDiligences[index].legalScore = legalScore;
        if (operationalScore !== undefined) dueDiligences[index].operationalScore = operationalScore;

        // Update assessments
        if (strengths) dueDiligences[index].strengths = strengths;
        if (weaknesses) dueDiligences[index].weaknesses = weaknesses;
        if (recommendations) dueDiligences[index].recommendations = recommendations;
        if (redFlags) dueDiligences[index].redFlags = redFlags;

        // Recalculate overall score
        dueDiligences[index].overallScore = calculateOverallScore(dueDiligences[index]);
        dueDiligences[index].riskLevel = determineRiskLevel(
            dueDiligences[index].overallScore,
            dueDiligences[index].redFlags
        );

        // Update status
        if (status === 'COMPLETED') {
            dueDiligences[index].status = 'COMPLETED';
            dueDiligences[index].completedAt = new Date().toISOString();
            // Set expiry to 1 year from completion
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            dueDiligences[index].expiresAt = expiryDate.toISOString();
        } else if (status) {
            dueDiligences[index].status = status;
        }

        res.json(dueDiligences[index]);
    } catch (error) {
        console.error('Error updating due diligence:', error);
        res.status(500).json({ error: 'Failed to update due diligence' });
    }
});

// Get score breakdown
router.get('/:id/breakdown', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const dd = dueDiligences.find(d => d.id === req.params.id);
        if (!dd) {
            res.status(404).json({ error: 'Due diligence not found' });
            return;
        }

        const breakdown = {
            categories: [
                { name: 'Financial Health', score: dd.financialScore, weight: 25, maxScore: 100 },
                { name: 'Team & Leadership', score: dd.teamScore, weight: 20, maxScore: 100 },
                { name: 'Market Opportunity', score: dd.marketScore, weight: 20, maxScore: 100 },
                { name: 'Product/Service', score: dd.productScore, weight: 15, maxScore: 100 },
                { name: 'Legal & Compliance', score: dd.legalScore, weight: 10, maxScore: 100 },
                { name: 'Operations', score: dd.operationalScore, weight: 10, maxScore: 100 }
            ],
            overallScore: dd.overallScore,
            riskLevel: dd.riskLevel,
            grade: getGrade(dd.overallScore)
        };

        res.json(breakdown);
    } catch (error) {
        console.error('Error fetching breakdown:', error);
        res.status(500).json({ error: 'Failed to fetch breakdown' });
    }
});

function getGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    return 'D';
}

// Get due diligence stats
router.get('/stats/overview', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const completed = dueDiligences.filter(d => d.status === 'COMPLETED');
        const avgScore = completed.reduce((sum, d) => sum + d.overallScore, 0) / (completed.length || 1);

        const riskDistribution = {
            LOW: completed.filter(d => d.riskLevel === 'LOW').length,
            MEDIUM: completed.filter(d => d.riskLevel === 'MEDIUM').length,
            HIGH: completed.filter(d => d.riskLevel === 'HIGH').length,
            VERY_HIGH: completed.filter(d => d.riskLevel === 'VERY_HIGH').length
        };

        res.json({
            total: dueDiligences.length,
            completed: completed.length,
            pending: dueDiligences.filter(d => d.status === 'PENDING').length,
            inProgress: dueDiligences.filter(d => d.status === 'IN_PROGRESS').length,
            averageScore: Math.round(avgScore * 100) / 100,
            riskDistribution
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
