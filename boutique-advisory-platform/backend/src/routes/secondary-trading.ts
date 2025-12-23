/**
 * Secondary Trading Routes - Share Trading (like StartEngine)
 * 
 * Uses Prisma ORM for database persistence
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../database';
import { shouldUseDatabase } from '../migration-manager';

const router = Router();

// Platform fee percentage
const PLATFORM_FEE = 0.01; // 1%

// Get all active listings
router.get('/listings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.json([]);
            return;
        }

        const { status, dealId, sellerId, minPrice, maxPrice } = req.query;

        const where: any = {};
        if (status) where.status = status;
        if (sellerId) where.sellerId = sellerId;
        if (minPrice) where.pricePerShare = { ...where.pricePerShare, gte: parseFloat(minPrice as string) };
        if (maxPrice) where.pricePerShare = { ...where.pricePerShare, lte: parseFloat(maxPrice as string) };

        const listings = await prisma.secondaryListing.findMany({
            where,
            include: {
                trades: true
            },
            orderBy: { listedAt: 'desc' }
        });

        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// Get listing by ID
router.get('/listings/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        const listing = await prisma.secondaryListing.findUnique({
            where: { id: req.params.id },
            include: {
                trades: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!listing) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        res.json(listing);
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ error: 'Failed to fetch listing' });
    }
});

// Create listing
router.post('/listings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(503).json({ error: 'Database not available' });
            return;
        }

        const {
            dealInvestorId,
            sharesAvailable,
            pricePerShare,
            minPurchase,
            expiresAt
        } = req.body;

        // Get investor ID for the current user
        const investor = await prisma.investor.findFirst({
            where: { userId: req.user?.id }
        });

        if (!investor) {
            res.status(403).json({ error: 'Only investors can create listings' });
            return;
        }

        // Verify the deal investment exists
        const dealInvestor = await prisma.dealInvestor.findUnique({
            where: { id: dealInvestorId }
        });

        if (!dealInvestor || dealInvestor.investorId !== investor.id) {
            res.status(400).json({ error: 'Invalid deal investment' });
            return;
        }

        const listing = await prisma.secondaryListing.create({
            data: {
                tenantId: 'default',
                sellerId: investor.id,
                dealInvestorId,
                sharesAvailable,
                pricePerShare,
                minPurchase: minPurchase || 1,
                status: 'ACTIVE',
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        res.status(201).json(listing);
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ error: 'Failed to create listing' });
    }
});

// Update listing
router.put('/listings/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(503).json({ error: 'Database not available' });
            return;
        }

        const existing = await prisma.secondaryListing.findUnique({
            where: { id: req.params.id }
        });

        if (!existing) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        // Check ownership
        const investor = await prisma.investor.findFirst({
            where: { userId: req.user?.id }
        });

        const isOwner = investor && existing.sellerId === investor.id;
        const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

        if (!isOwner && !isAdmin) {
            res.status(403).json({ error: 'Not authorized to update this listing' });
            return;
        }

        const { pricePerShare, sharesAvailable, minPurchase, status } = req.body;

        const updateData: any = {};
        if (pricePerShare) updateData.pricePerShare = pricePerShare;
        if (sharesAvailable !== undefined) updateData.sharesAvailable = sharesAvailable;
        if (minPurchase) updateData.minPurchase = minPurchase;
        if (status) updateData.status = status;

        const listing = await prisma.secondaryListing.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.json(listing);
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({ error: 'Failed to update listing' });
    }
});

// Buy shares (create trade)
router.post('/listings/:id/buy', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(503).json({ error: 'Database not available' });
            return;
        }

        const { shares } = req.body;

        // Get buyer investor ID
        const buyer = await prisma.investor.findFirst({
            where: { userId: req.user?.id }
        });

        if (!buyer) {
            res.status(403).json({ error: 'Only investors can buy shares' });
            return;
        }

        const listing = await prisma.secondaryListing.findUnique({
            where: { id: req.params.id }
        });

        if (!listing) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        if (listing.status !== 'ACTIVE') {
            res.status(400).json({ error: 'Listing is not active' });
            return;
        }

        if (buyer.id === listing.sellerId) {
            res.status(400).json({ error: 'Cannot buy your own shares' });
            return;
        }

        if (shares < listing.minPurchase) {
            res.status(400).json({ error: `Minimum purchase is ${listing.minPurchase} shares` });
            return;
        }

        if (shares > listing.sharesAvailable) {
            res.status(400).json({ error: 'Not enough shares available' });
            return;
        }

        const totalAmount = shares * listing.pricePerShare;
        const fee = totalAmount * PLATFORM_FEE;

        // Create trade
        const trade = await prisma.secondaryTrade.create({
            data: {
                listingId: listing.id,
                buyerId: buyer.id,
                sellerId: listing.sellerId,
                shares,
                pricePerShare: listing.pricePerShare,
                totalAmount,
                fee,
                status: 'PENDING'
            }
        });

        // Update listing
        const newSharesAvailable = listing.sharesAvailable - shares;
        await prisma.secondaryListing.update({
            where: { id: listing.id },
            data: {
                sharesAvailable: newSharesAvailable,
                status: newSharesAvailable === 0 ? 'SOLD' : 'ACTIVE'
            }
        });

        res.status(201).json({
            message: 'Trade created successfully',
            trade,
            netAmount: totalAmount - fee
        });
    } catch (error) {
        console.error('Error creating trade:', error);
        res.status(500).json({ error: 'Failed to create trade' });
    }
});

// Get trades for current user
router.get('/trades/my', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.json({ asBuyer: [], asSeller: [] });
            return;
        }

        const investor = await prisma.investor.findFirst({
            where: { userId: req.user?.id }
        });

        if (!investor) {
            res.json({ asBuyer: [], asSeller: [] });
            return;
        }

        const [asBuyer, asSeller] = await Promise.all([
            prisma.secondaryTrade.findMany({
                where: { buyerId: investor.id },
                include: { listing: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.secondaryTrade.findMany({
                where: { sellerId: investor.id },
                include: { listing: true },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        res.json({ asBuyer, asSeller });
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
});

// Execute trade (admin only)
router.post('/trades/:id/execute', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(503).json({ error: 'Database not available' });
            return;
        }

        if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const trade = await prisma.secondaryTrade.update({
            where: { id: req.params.id },
            data: {
                status: 'COMPLETED',
                executedAt: new Date()
            }
        });

        res.json({ message: 'Trade executed', trade });
    } catch (error) {
        console.error('Error executing trade:', error);
        res.status(500).json({ error: 'Failed to execute trade' });
    }
});

// Get trading stats
router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.json({
                totalListings: 0,
                activeListings: 0,
                totalTrades: 0,
                totalVolume: 0,
                totalFees: 0
            });
            return;
        }

        const [totalListings, activeListings, totalTrades, volumeResult, feeResult] = await Promise.all([
            prisma.secondaryListing.count(),
            prisma.secondaryListing.count({ where: { status: 'ACTIVE' } }),
            prisma.secondaryTrade.count({ where: { status: 'COMPLETED' } }),
            prisma.secondaryTrade.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { totalAmount: true }
            }),
            prisma.secondaryTrade.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { fee: true }
            })
        ]);

        res.json({
            totalListings,
            activeListings,
            totalTrades,
            totalVolume: volumeResult._sum.totalAmount || 0,
            totalFees: feeResult._sum.fee || 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
