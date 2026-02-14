/**
 * Secondary Trading Routes - Share Trading (like StartEngine)
 * 
 * Uses Prisma ORM for database persistence
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma, prismaReplica } from '../database';
import { payments } from '../utils/stripe';
import { shouldUseDatabase } from '../migration-manager';

const router = Router();

// Platform fee percentage
const PLATFORM_FEE = 0.01; // 1%

// Get all active listings
router.get('/listings', authorize('secondary_trading.list'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

        const listings = await prismaReplica.secondaryListing.findMany({
            where,
            include: {
                seller: {
                    select: { id: true, name: true, type: true }
                },
                dealInvestor: {
                    include: {
                        deal: {
                            include: {
                                sme: { select: { id: true, name: true } }
                            }
                        }
                    }
                },
                trades: true
            },
            orderBy: { listedAt: 'desc' }
        });

        // Map to format that frontend expects (l.deal instead of l.dealInvestor.deal)
        const formattedListings = listings.map(l => ({
            ...l,
            deal: l.dealInvestor.deal,
            // Calculate return percentage if we have original price (placeholder for now)
            returnPercentage: ((l.pricePerShare - 10) / 10) * 100, // Example: assumed $10 original
            originalPricePerShare: 10
        }));

        res.json(formattedListings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// Get listing by ID
router.get('/listings/:id', authorize('secondary_trading.read'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        const listing = await prismaReplica.secondaryListing.findUnique({
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
router.post('/listings', authorize('secondary_trading.create_listing'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

        // Only INVESTOR role can create listings
        if (req.user?.role !== 'INVESTOR') {
            res.status(403).json({ error: 'Only investors can create listings' });
            return;
        }

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
router.put('/listings/:id', authorize('secondary_trading.update_listing'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
router.post('/listings/:id/buy', authorize('secondary_trading.buy'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(503).json({ error: 'Database not available' });
            return;
        }

        const { shares } = req.body;

        // Only INVESTOR role can buy shares
        if (req.user?.role !== 'INVESTOR') {
            res.status(403).json({ error: 'Only investors can buy shares' });
            return;
        }

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

        // Create Escrow Payment Intent
        const escrow = await payments.createEscrowIntent(
            trade.totalAmount + trade.fee,
            'usd',
            { tradeId: trade.id, listingId: listing.id, buyerId: buyer.id }
        );

        // DEMO MODE: Auto-execute if requested
        if (req.body.simulate_payment) {
            await prisma.$transaction(async (tx) => {
                // 1. Mark trade as completed
                await tx.secondaryTrade.update({
                    where: { id: trade.id },
                    data: { status: 'COMPLETED', executedAt: new Date() }
                });

                // 2. Deduct from Seller
                await tx.dealInvestor.update({
                    where: { id: listing.dealInvestorId },
                    data: { amount: { decrement: shares } }
                });

                // 3. Asset Transfer Logic
                // Fetch seller investment to get Deal ID
                const sellerInv = await tx.dealInvestor.findUnique({ where: { id: listing.dealInvestorId } });

                if (!sellerInv) {
                    throw new Error('Seller investment record not found');
                }

                const existingBuyerInv = await tx.dealInvestor.findUnique({
                    where: { dealId_investorId: { dealId: sellerInv.dealId, investorId: buyer.id } }
                });

                if (existingBuyerInv) {
                    await tx.dealInvestor.update({
                        where: { id: existingBuyerInv.id },
                        data: { amount: { increment: shares } }
                    });
                } else {
                    await tx.dealInvestor.create({
                        data: {
                            dealId: sellerInv.dealId,
                            investorId: buyer.id,
                            amount: shares,
                            status: 'APPROVED'
                        }
                    });
                }
            });

            // Refetch updated trade
            const completedTrade = await prisma.secondaryTrade.findUnique({ where: { id: trade.id } });

            res.status(201).json({
                trade: completedTrade,
                message: 'Trade executed immediately (Simulation Mode)'
            });
            return;
        }

        res.status(201).json({
            trade,
            clientSecret: escrow.client_secret,
            paymentIntentId: escrow.id
        });
    } catch (error) {
        console.error('Error creating trade:', error);
        res.status(500).json({ error: 'Failed to create trade' });
    }
});

// Get trades for current user
router.get('/trades/my', authorize('secondary_trading.read'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

        const [purchases, sales] = await Promise.all([
            prismaReplica.secondaryTrade.findMany({
                where: { buyerId: investor.id },
                include: {
                    listing: {
                        include: {
                            dealInvestor: {
                                include: {
                                    deal: {
                                        include: {
                                            sme: { select: { id: true, name: true } }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    seller: { select: { id: true, name: true } },
                    buyer: { select: { id: true, name: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prismaReplica.secondaryTrade.findMany({
                where: { sellerId: investor.id },
                include: {
                    listing: {
                        include: {
                            dealInvestor: {
                                include: {
                                    deal: {
                                        include: {
                                            sme: { select: { id: true, name: true } }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    seller: { select: { id: true, name: true } },
                    buyer: { select: { id: true, name: true } }
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        res.json({ purchases, sales });
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
});

// Execute trade (admin only or webhook)
router.post('/trades/:id/execute', authorize('secondary_trading.execute'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(503).json({ error: 'Database not available' });
            return;
        }

        const tradeId = req.params.id;

        await prisma.$transaction(async (tx) => {
            // 1. Get and verify trade
            const trade = await tx.secondaryTrade.findUnique({
                where: { id: tradeId },
                include: { listing: true }
            });

            if (!trade) {
                throw new Error('Trade not found');
            }

            if (trade.status !== 'PENDING') {
                throw new Error('Trade is not pending execution');
            }

            // 2. Mark trade as completed
            await tx.secondaryTrade.update({
                where: { id: tradeId },
                data: {
                    status: 'COMPLETED',
                    executedAt: new Date()
                }
            });

            // 3. Asset Transfer Logic
            // We treat 'shares' as units of the original investment amount (e.g., $1 principal = 1 share)

            // A. Deduct from Seller
            // Verification: Ensure seller still has enough amount (in case of race conditions or multiple listings)
            const sellerInvestment = await tx.dealInvestor.findUnique({
                where: { id: trade.listing.dealInvestorId }
            });

            if (!sellerInvestment || sellerInvestment.amount < trade.shares) {
                throw new Error('Seller has insufficient investment amount to transfer');
            }

            await tx.dealInvestor.update({
                where: { id: trade.listing.dealInvestorId },
                data: {
                    amount: { decrement: trade.shares }
                }
            });

            // B. Add to Buyer
            // Check if buyer already has an investment in this deal
            const dealId = sellerInvestment.dealId;
            const buyerId = trade.buyerId;

            const buyerInvestment = await tx.dealInvestor.findUnique({
                where: {
                    dealId_investorId: {
                        dealId: dealId,
                        investorId: buyerId
                    }
                }
            });

            if (buyerInvestment) {
                await tx.dealInvestor.update({
                    where: { id: buyerInvestment.id },
                    data: {
                        amount: { increment: trade.shares },
                        status: 'APPROVED' // Ensure it's active
                    }
                });
            } else {
                await tx.dealInvestor.create({
                    data: {
                        dealId: dealId,
                        investorId: buyerId,
                        amount: trade.shares,
                        status: 'APPROVED'
                    }
                });
            }
        });

        res.json({ message: 'Trade executed successfully' });
    } catch (error: any) {
        console.error('Error executing trade:', error);
        res.status(500).json({ error: error.message || 'Failed to execute trade' });
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
            prismaReplica.secondaryListing.count(),
            prismaReplica.secondaryListing.count({ where: { status: 'ACTIVE' } }),
            prismaReplica.secondaryTrade.count({ where: { status: 'COMPLETED' } }),
            prismaReplica.secondaryTrade.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { totalAmount: true }
            }),
            prismaReplica.secondaryTrade.aggregate({
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
