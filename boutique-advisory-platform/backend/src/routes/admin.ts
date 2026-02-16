import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma } from '../database';

const router = Router();

// ==================== User Management ====================

// List all users (System-wide)
router.get('/users', authorize('admin.user_manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const status = req.query.status as string;

        const where: any = {
            status: { not: 'DELETED' }
        };
        if (status) {
            where.status = status;
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                sme: { select: { id: true, name: true, status: true } },
                investor: { select: { id: true, name: true, kycStatus: true } },
                advisor: { select: { id: true, name: true, status: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user status
router.put('/users/:userId/status', authorize('admin.user_manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // ACTIVE, INACTIVE, SUSPENDED

        const user = await prisma.user.update({
            where: { id: userId },
            data: { status }
        });

        return res.json({ message: `User status updated to ${status}`, user });
    } catch (error) {
        console.error('Error updating user status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user role
router.put('/users/:userId/role', authorize('admin.user_manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        return res.json({ message: `User role updated to ${role}`, user });
    } catch (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new user (Admin only)
router.post('/users', authorize('admin.user_manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        if (!email || !password || !firstName || !lastName || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const tenantId = req.user?.tenantId || 'default';

        // Check if user exists in this tenant
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                tenantId
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists in this tenant' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role as any,
                tenantId,
                status: 'ACTIVE',
                language: 'EN'
            }
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;

        return res.status(201).json({
            message: 'User created successfully',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== Platform Overview ====================

router.get('/stats', authorize('admin.read'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const [
            userCount,
            smeCount,
            investorCount,
            advisorCount,
            dealCount,
            totalDealAmount,
            secondaryTradeStats,
            syndicateTradeStats
        ] = await Promise.all([
            prisma.user.count({ where: { status: { not: 'DELETED' } } }),
            prisma.sME.count({ where: { status: { not: 'DELETED' } } }),
            prisma.investor.count({ where: { status: { not: 'DELETED' } } }),
            prisma.advisor.count({ where: { status: { not: 'DELETED' } } }),
            prisma.deal.count({ where: { status: { not: 'CLOSED' } } }),
            prisma.deal.aggregate({ _sum: { amount: true } }),
            prisma.secondaryTrade.aggregate({
                _sum: { totalAmount: true, fee: true }
            }),
            prisma.syndicateTokenTrade.aggregate({
                _sum: { totalAmount: true, fee: true }
            })
        ]);

        const dealVolume = totalDealAmount._sum.amount || 0;
        const secondaryVolume = (secondaryTradeStats._sum.totalAmount || 0) + (syndicateTradeStats._sum.totalAmount || 0);
        const totalFees = (secondaryTradeStats._sum.fee || 0) + (syndicateTradeStats._sum.fee || 0);

        return res.json({
            stats: {
                users: userCount,
                smes: smeCount,
                investors: investorCount,
                advisors: advisorCount,
                deals: dealCount,
                totalVolume: dealVolume + secondaryVolume,
                totalFees
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== Tenant Settings (Branding) ====================

// Get tenant settings
router.get('/tenant/settings', authorize('settings.read'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        return res.json({ settings: tenant.settings });
    } catch (error) {
        console.error('Error fetching tenant settings:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update tenant settings
router.put('/tenant/settings', authorize('settings.update'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { branding } = req.body;

        if (!branding) {
            return res.status(400).json({ error: 'Branding settings are required' });
        }

        // Get existing settings to merge
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        const currentSettings = (tenant?.settings as any) || {};
        const updatedSettings = {
            ...currentSettings,
            branding: {
                ...currentSettings.branding,
                ...branding
            }
        };

        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: { settings: updatedSettings }
        });

        return res.json({
            message: 'Branding settings updated successfully',
            settings: updatedTenant.settings
        });
    } catch (error) {
        console.error('Error updating tenant settings:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
