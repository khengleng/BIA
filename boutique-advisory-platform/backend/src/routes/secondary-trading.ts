/**
 * Secondary Trading Routes (like StartEngine)
 * 
 * Allows investors to trade their shares/tokens on a secondary market
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// In-memory data (replace with Prisma in production)
let listings: any[] = [
    {
        id: 'listing_1',
        tenantId: 'default',
        sellerId: 'inv_1',
        seller: {
            id: 'inv_1',
            name: 'John Smith',
            type: 'ANGEL'
        },
        dealInvestorId: 'di_1',
        deal: {
            id: 'deal_1',
            title: 'TechCorp Cambodia - Series A',
            sme: { id: 'sme_1', name: 'TechCorp Cambodia' }
        },
        originalInvestment: 50000,
        sharesOwned: 5000,
        sharesAvailable: 2000,
        pricePerShare: 12.50, // Current price
        originalPricePerShare: 10.00,
        minPurchase: 100,
        totalValue: 25000,
        returnPercentage: 25.0,
        status: 'ACTIVE',
        listedAt: '2024-01-20T10:00:00Z',
        expiresAt: '2024-04-20T10:00:00Z',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
    },
    {
        id: 'listing_2',
        tenantId: 'default',
        sellerId: 'inv_2',
        seller: {
            id: 'inv_2',
            name: 'Sarah Chen',
            type: 'VENTURE_CAPITAL'
        },
        dealInvestorId: 'di_2',
        deal: {
            id: 'deal_2',
            title: 'AgriSmart - Growth Round',
            sme: { id: 'sme_2', name: 'AgriSmart Solutions' }
        },
        originalInvestment: 100000,
        sharesOwned: 10000,
        sharesAvailable: 5000,
        pricePerShare: 11.00,
        originalPricePerShare: 10.00,
        minPurchase: 500,
        totalValue: 55000,
        returnPercentage: 10.0,
        status: 'ACTIVE',
        listedAt: '2024-02-01T14:00:00Z',
        expiresAt: '2024-05-01T14:00:00Z',
        createdAt: '2024-02-01T14:00:00Z',
        updatedAt: '2024-02-01T14:00:00Z'
    }
];

let trades: any[] = [
    {
        id: 'trade_1',
        listingId: 'listing_1',
        buyerId: 'inv_3',
        buyer: { id: 'inv_3', name: 'Mike Johnson' },
        sellerId: 'inv_1',
        seller: { id: 'inv_1', name: 'John Smith' },
        shares: 500,
        pricePerShare: 12.50,
        totalAmount: 6250,
        fee: 62.50, // 1% platform fee
        netAmount: 6187.50,
        status: 'COMPLETED',
        executedAt: '2024-01-25T11:30:00Z',
        createdAt: '2024-01-25T11:00:00Z'
    },
    {
        id: 'trade_2',
        listingId: 'listing_1',
        buyerId: 'inv_4',
        buyer: { id: 'inv_4', name: 'Lisa Wang' },
        sellerId: 'inv_1',
        seller: { id: 'inv_1', name: 'John Smith' },
        shares: 300,
        pricePerShare: 12.50,
        totalAmount: 3750,
        fee: 37.50,
        netAmount: 3712.50,
        status: 'COMPLETED',
        executedAt: '2024-01-28T09:00:00Z',
        createdAt: '2024-01-28T08:45:00Z'
    }
];

// Platform fee percentage
const PLATFORM_FEE = 0.01; // 1%

// Get all active listings
router.get('/listings', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { status, dealId, sellerId, minPrice, maxPrice } = req.query;
        let filtered = [...listings];

        // Default to active listings
        if (status) {
            filtered = filtered.filter(l => l.status === status);
        } else {
            filtered = filtered.filter(l => l.status === 'ACTIVE');
        }

        if (dealId) {
            filtered = filtered.filter(l => l.deal.id === dealId);
        }
        if (sellerId) {
            filtered = filtered.filter(l => l.sellerId === sellerId);
        }
        if (minPrice) {
            filtered = filtered.filter(l => l.pricePerShare >= Number(minPrice));
        }
        if (maxPrice) {
            filtered = filtered.filter(l => l.pricePerShare <= Number(maxPrice));
        }

        // Sort by newest first
        filtered.sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());

        res.json(filtered);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// Get listing by ID
router.get('/listings/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const listing = listings.find(l => l.id === req.params.id);
        if (!listing) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        // Get trade history for this listing
        const listingTrades = trades.filter(t => t.listingId === req.params.id);

        res.json({
            ...listing,
            tradeHistory: listingTrades
        });
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ error: 'Failed to fetch listing' });
    }
});

// Create new listing (Investor selling shares)
router.post('/listings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const {
            dealInvestorId,
            deal,
            sharesOwned,
            sharesAvailable,
            pricePerShare,
            originalPricePerShare,
            minPurchase,
            expiresAt
        } = req.body;

        // Validation
        if (sharesAvailable > sharesOwned) {
            res.status(400).json({ error: 'Cannot list more shares than owned' });
            return;
        }
        if (pricePerShare <= 0) {
            res.status(400).json({ error: 'Price per share must be positive' });
            return;
        }

        const newListing = {
            id: `listing_${Date.now()}`,
            tenantId: req.user?.tenantId || 'default',
            sellerId: req.user?.id,
            seller: {
                id: req.user?.id,
                name: req.user?.email?.split('@')[0],
                type: 'INVESTOR'
            },
            dealInvestorId,
            deal: deal || { id: 'unknown', title: 'Unknown Deal', sme: { id: 'unknown', name: 'Unknown' } },
            originalInvestment: sharesOwned * originalPricePerShare,
            sharesOwned,
            sharesAvailable,
            pricePerShare,
            originalPricePerShare: originalPricePerShare || pricePerShare,
            minPurchase: minPurchase || 1,
            totalValue: sharesAvailable * pricePerShare,
            returnPercentage: originalPricePerShare
                ? ((pricePerShare - originalPricePerShare) / originalPricePerShare * 100)
                : 0,
            status: 'ACTIVE',
            listedAt: new Date().toISOString(),
            expiresAt: expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days default
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        listings.push(newListing);
        res.status(201).json(newListing);
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ error: 'Failed to create listing' });
    }
});

// Update listing
router.put('/listings/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const index = listings.findIndex(l => l.id === req.params.id);
        if (index === -1) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        // Check ownership
        if (listings[index].sellerId !== req.user?.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user?.role || '')) {
            res.status(403).json({ error: 'Not authorized to update this listing' });
            return;
        }

        const { pricePerShare, sharesAvailable, minPurchase, status } = req.body;

        if (pricePerShare) {
            listings[index].pricePerShare = pricePerShare;
            listings[index].totalValue = listings[index].sharesAvailable * pricePerShare;
            listings[index].returnPercentage =
                ((pricePerShare - listings[index].originalPricePerShare) / listings[index].originalPricePerShare * 100);
        }
        if (sharesAvailable !== undefined) {
            if (sharesAvailable > listings[index].sharesOwned) {
                res.status(400).json({ error: 'Cannot list more shares than owned' });
                return;
            }
            listings[index].sharesAvailable = sharesAvailable;
            listings[index].totalValue = sharesAvailable * listings[index].pricePerShare;
        }
        if (minPurchase) listings[index].minPurchase = minPurchase;
        if (status) listings[index].status = status;

        listings[index].updatedAt = new Date().toISOString();

        res.json(listings[index]);
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({ error: 'Failed to update listing' });
    }
});

// Buy shares (Create trade)
router.post('/listings/:id/buy', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const listing = listings.find(l => l.id === req.params.id);
        if (!listing) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }

        if (listing.status !== 'ACTIVE') {
            res.status(400).json({ error: 'Listing is not active' });
            return;
        }

        const { shares } = req.body;

        // Validations
        if (shares < listing.minPurchase) {
            res.status(400).json({ error: `Minimum purchase is ${listing.minPurchase} shares` });
            return;
        }
        if (shares > listing.sharesAvailable) {
            res.status(400).json({ error: 'Not enough shares available' });
            return;
        }
        if (listing.sellerId === req.user?.id) {
            res.status(400).json({ error: 'Cannot buy your own shares' });
            return;
        }

        const totalAmount = shares * listing.pricePerShare;
        const fee = totalAmount * PLATFORM_FEE;
        const netAmount = totalAmount - fee;

        const newTrade = {
            id: `trade_${Date.now()}`,
            listingId: req.params.id,
            buyerId: req.user?.id,
            buyer: {
                id: req.user?.id,
                name: req.user?.email?.split('@')[0]
            },
            sellerId: listing.sellerId,
            seller: listing.seller,
            shares,
            pricePerShare: listing.pricePerShare,
            totalAmount,
            fee,
            netAmount,
            status: 'PENDING',
            executedAt: null,
            createdAt: new Date().toISOString()
        };

        trades.push(newTrade);

        // Update listing
        const listingIndex = listings.findIndex(l => l.id === req.params.id);
        listings[listingIndex].sharesAvailable -= shares;
        listings[listingIndex].totalValue = listings[listingIndex].sharesAvailable * listing.pricePerShare;

        // Mark as sold if no shares left
        if (listings[listingIndex].sharesAvailable === 0) {
            listings[listingIndex].status = 'SOLD';
        }
        listings[listingIndex].updatedAt = new Date().toISOString();

        res.status(201).json({
            message: 'Purchase initiated',
            trade: newTrade
        });
    } catch (error) {
        console.error('Error buying shares:', error);
        res.status(500).json({ error: 'Failed to buy shares' });
    }
});

// Execute trade (Admin/System)
router.post('/trades/:id/execute', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const index = trades.findIndex(t => t.id === req.params.id);
        if (index === -1) {
            res.status(404).json({ error: 'Trade not found' });
            return;
        }

        if (trades[index].status !== 'PENDING') {
            res.status(400).json({ error: 'Trade is not pending' });
            return;
        }

        trades[index].status = 'COMPLETED';
        trades[index].executedAt = new Date().toISOString();

        res.json({
            message: 'Trade executed successfully',
            trade: trades[index]
        });
    } catch (error) {
        console.error('Error executing trade:', error);
        res.status(500).json({ error: 'Failed to execute trade' });
    }
});

// Get user's trade history
router.get('/trades/my', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userTrades = trades.filter(
            t => t.buyerId === req.user?.id || t.sellerId === req.user?.id
        );

        // Separate by role in each trade
        const asBuyer = userTrades.filter(t => t.buyerId === req.user?.id);
        const asSeller = userTrades.filter(t => t.sellerId === req.user?.id);

        res.json({
            purchases: asBuyer,
            sales: asSeller,
            totalPurchased: asBuyer.reduce((sum, t) => sum + t.totalAmount, 0),
            totalSold: asSeller.reduce((sum, t) => sum + t.netAmount, 0)
        });
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
});

// Get market stats
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const activeListings = listings.filter(l => l.status === 'ACTIVE');
        const completedTrades = trades.filter(t => t.status === 'COMPLETED');

        const totalVolume = completedTrades.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalFees = completedTrades.reduce((sum, t) => sum + t.fee, 0);
        const avgTradeSize = completedTrades.length > 0 ? totalVolume / completedTrades.length : 0;
        const totalListingValue = activeListings.reduce((sum, l) => sum + l.totalValue, 0);

        // Calculate average return across all listings
        const avgReturn = activeListings.length > 0
            ? activeListings.reduce((sum, l) => sum + l.returnPercentage, 0) / activeListings.length
            : 0;

        res.json({
            activeListings: activeListings.length,
            totalListingValue,
            completedTrades: completedTrades.length,
            totalVolume,
            totalFees,
            avgTradeSize: Math.round(avgTradeSize * 100) / 100,
            avgReturn: Math.round(avgReturn * 100) / 100,
            last24hVolume: calculateLast24hVolume(completedTrades),
            last7dVolume: calculateLast7dVolume(completedTrades)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

function calculateLast24hVolume(trades: any[]): number {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return trades
        .filter(t => t.executedAt && new Date(t.executedAt).getTime() > oneDayAgo)
        .reduce((sum, t) => sum + t.totalAmount, 0);
}

function calculateLast7dVolume(trades: any[]): number {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return trades
        .filter(t => t.executedAt && new Date(t.executedAt).getTime() > sevenDaysAgo)
        .reduce((sum, t) => sum + t.totalAmount, 0);
}

// Get price history for a deal
router.get('/price-history/:dealId', async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Get all trades for this deal
        const dealListings = listings.filter(l => l.deal.id === req.params.dealId);
        const dealTrades = trades.filter(t =>
            dealListings.some(l => l.id === t.listingId) && t.status === 'COMPLETED'
        );

        // Create price history
        const priceHistory = dealTrades.map(t => ({
            date: t.executedAt,
            price: t.pricePerShare,
            volume: t.shares
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate price metrics
        const currentPrice = dealListings.length > 0
            ? dealListings.reduce((sum, l) => sum + l.pricePerShare, 0) / dealListings.length
            : 0;
        const originalPrice = dealListings.length > 0 ? dealListings[0].originalPricePerShare : 0;
        const priceChange = originalPrice > 0 ? ((currentPrice - originalPrice) / originalPrice * 100) : 0;

        res.json({
            dealId: req.params.dealId,
            currentPrice,
            originalPrice,
            priceChange,
            priceHistory,
            totalVolume: dealTrades.reduce((sum, t) => sum + t.totalAmount, 0),
            tradeCount: dealTrades.length
        });
    } catch (error) {
        console.error('Error fetching price history:', error);
        res.status(500).json({ error: 'Failed to fetch price history' });
    }
});

export default router;
