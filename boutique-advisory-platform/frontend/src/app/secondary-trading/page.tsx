'use client'

import { useState, useEffect } from 'react'
import {
    ArrowLeftRight,
    Plus,
    TrendingUp,
    TrendingDown,
    DollarSign,
    BarChart3,
    Clock,
    CheckCircle2,
    AlertCircle,
    Filter,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Briefcase,
    ShoppingCart,
    X
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useToast } from '../../contexts/ToastContext'
import usePermissions from '../../hooks/usePermissions'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

interface Listing {
    id: string
    sellerId: string
    seller: {
        id: string
        name: string
        type: string
    }
    deal: {
        id: string
        title: string
        sme: { id: string; name: string }
    }
    originalInvestment: number
    sharesOwned: number
    sharesAvailable: number
    pricePerShare: number
    originalPricePerShare: number
    minPurchase: number
    totalValue: number
    returnPercentage: number
    status: string
    listedAt: string
    expiresAt: string
}

interface Trade {
    id: string
    listingId: string
    buyerId: string
    buyer: { id: string; name: string }
    sellerId: string
    seller: { id: string; name: string }
    shares: number
    pricePerShare: number
    totalAmount: number
    fee: number
    netAmount: number
    status: string
    executedAt: string | null
    createdAt: string
}

interface MarketStats {
    activeListings: number
    totalListingValue: number
    completedTrades: number
    totalVolume: number
    totalFees: number
    avgTradeSize: number
    avgReturn: number
    last24hVolume: number
    last7dVolume: number
}

export default function SecondaryTradingPage() {
    const { addToast } = useToast()
    const { isAdmin, user } = usePermissions()

    const [listings, setListings] = useState<Listing[]>([])
    const [myTrades, setMyTrades] = useState<{ purchases: Trade[], sales: Trade[] }>({ purchases: [], sales: [] })
    const [stats, setStats] = useState<MarketStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'marketplace' | 'my-trades' | 'sell'>('marketplace')
    const [showBuyModal, setShowBuyModal] = useState(false)
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
    const [buyShares, setBuyShares] = useState('')
    const [isBuying, setIsBuying] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                window.location.href = '/auth/login'
                return
            }

            // Fetch listings
            const listingsRes = await fetch(`${API_URL}/api/secondary-trading/listings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (listingsRes.ok) {
                setListings(await listingsRes.json())
            }

            // Fetch my trades
            const tradesRes = await fetch(`${API_URL}/api/secondary-trading/trades/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (tradesRes.ok) {
                setMyTrades(await tradesRes.json())
            }

            // Fetch stats
            const statsRes = await fetch(`${API_URL}/api/secondary-trading/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (statsRes.ok) {
                setStats(await statsRes.json())
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            addToast('error', 'Error loading marketplace')
        } finally {
            setIsLoading(false)
        }
    }

    const handleBuyClick = (listing: Listing) => {
        setSelectedListing(listing)
        setBuyShares(listing.minPurchase.toString())
        setShowBuyModal(true)
    }

    const handleBuyShares = async () => {
        if (!selectedListing) return
        setIsBuying(true)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/secondary-trading/listings/${selectedListing.id}/buy`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ shares: parseFloat(buyShares) })
            })

            if (response.ok) {
                addToast('success', 'Purchase initiated successfully!')
                setShowBuyModal(false)
                fetchData()
            } else {
                const error = await response.json()
                addToast('error', error.error || 'Failed to buy shares')
            }
        } catch (error) {
            console.error('Error buying shares:', error)
            addToast('error', 'Error processing purchase')
        } finally {
            setIsBuying(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>
            case 'SOLD':
                return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Sold</span>
            case 'PENDING':
                return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs">Pending</span>
            case 'COMPLETED':
                return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Completed</span>
            default:
                return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">{status}</span>
        }
    }

    const filteredListings = listings.filter(l =>
        l.deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.deal.sme.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ArrowLeftRight className="w-8 h-8 text-blue-400" />
                        Secondary Market
                    </h1>
                    <p className="text-gray-400 mt-2">Trade your investment shares with other investors</p>
                </div>
            </div>

            {/* Stats Dashboard */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <Briefcase className="w-4 h-4" />
                            Active Listings
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.activeListings || 0}</p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <DollarSign className="w-4 h-4" />
                            Total Value
                        </div>
                        <p className="text-2xl font-bold text-white">${((stats.totalListingValue || 0) / 1000).toFixed(0)}K</p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed Trades
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.completedTrades || 0}</p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <Activity className="w-4 h-4" />
                            Total Volume
                        </div>
                        <p className="text-2xl font-bold text-white">${((stats.totalVolume || 0) / 1000).toFixed(0)}K</p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <TrendingUp className="w-4 h-4" />
                            Avg Return
                        </div>
                        <p className={`text-2xl font-bold ${(stats.avgReturn || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(stats.avgReturn || 0) >= 0 ? '+' : ''}{(stats.avgReturn || 0).toFixed(1)}%
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <BarChart3 className="w-4 h-4" />
                            24h Volume
                        </div>
                        <p className="text-2xl font-bold text-white">${(stats.last24hVolume || 0).toFixed(0)}</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('marketplace')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'marketplace'
                        ? 'text-blue-400'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Marketplace
                    </div>
                    {activeTab === 'marketplace' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('my-trades')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'my-trades'
                        ? 'text-blue-400'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <ArrowLeftRight className="w-4 h-4" />
                        My Trades
                    </div>
                    {activeTab === 'my-trades' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                    )}
                </button>
            </div>

            {/* Marketplace Tab */}
            {activeTab === 'marketplace' && (
                <>
                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by deal or company name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredListings.map((listing) => (
                            <div key={listing.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all">
                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">{listing.deal.title}</h3>
                                            <p className="text-sm text-gray-400">{listing.deal.sme.name}</p>
                                        </div>
                                        {getStatusBadge(listing.status)}
                                    </div>

                                    {/* Price Info */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-gray-400 mb-1">Price/Share</p>
                                            <p className="text-lg font-bold text-white">${(listing.pricePerShare || 0).toFixed(2)}</p>
                                            <div className={`flex items-center justify-center gap-1 text-xs ${listing.returnPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {listing.returnPercentage >= 0 ? (
                                                    <ArrowUpRight className="w-3 h-3" />
                                                ) : (
                                                    <ArrowDownRight className="w-3 h-3" />
                                                )}
                                                {(listing.returnPercentage || 0).toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-gray-400 mb-1">Available</p>
                                            <p className="text-lg font-bold text-white">{listing.sharesAvailable.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">shares</p>
                                        </div>
                                        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-gray-400 mb-1">Total Value</p>
                                            <p className="text-lg font-bold text-green-400">${((listing.totalValue || 0) / 1000).toFixed(1)}K</p>
                                            <p className="text-xs text-gray-500">min ${listing.minPurchase}</p>
                                        </div>
                                    </div>

                                    {/* Seller Info */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <span>Seller:</span>
                                            <span className="text-white">{listing.seller.name}</span>
                                            <span className="text-xs text-gray-500">({listing.seller.type})</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Clock className="w-4 h-4" />
                                            Expires {new Date(listing.expiresAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Footer */}
                                <div className="px-5 py-4 bg-gray-800/80 border-t border-gray-700 flex justify-between items-center">
                                    <div className="text-sm text-gray-400">
                                        Original: ${(listing.originalPricePerShare || 0).toFixed(2)}/share
                                    </div>
                                    {listing.status === 'ACTIVE' && listing.sellerId !== user?.id && (
                                        <button
                                            onClick={() => handleBuyClick(listing)}
                                            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Buy Shares
                                        </button>
                                    )}
                                    {listing.sellerId === user?.id && (
                                        <span className="text-sm text-blue-400">Your Listing</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredListings.length === 0 && (
                        <div className="text-center py-16">
                            <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">No listings found</p>
                            <p className="text-gray-500 text-sm mt-2">Check back later for new opportunities</p>
                        </div>
                    )}
                </>
            )}

            {/* My Trades Tab */}
            {activeTab === 'my-trades' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Purchases */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <ArrowDownRight className="w-5 h-5 text-green-400" />
                            Purchases
                        </h3>

                        {myTrades.purchases.length > 0 ? (
                            <div className="space-y-3">
                                {myTrades.purchases.map((trade) => (
                                    <div key={trade.id} className="bg-gray-700/50 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-white font-medium">{trade.shares} shares</p>
                                                <p className="text-sm text-gray-400">@ ${(trade.pricePerShare || 0).toFixed(2)}</p>
                                            </div>
                                            {getStatusBadge(trade.status)}
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Total:</span>
                                            <span className="text-green-400 font-semibold">${(trade.totalAmount || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>From: {trade.seller.name}</span>
                                            <span>{trade.executedAt ? new Date(trade.executedAt).toLocaleDateString() : 'Pending'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No purchases yet</p>
                            </div>
                        )}
                    </div>

                    {/* Sales */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <ArrowUpRight className="w-5 h-5 text-blue-400" />
                            Sales
                        </h3>

                        {myTrades.sales.length > 0 ? (
                            <div className="space-y-3">
                                {myTrades.sales.map((trade) => (
                                    <div key={trade.id} className="bg-gray-700/50 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-white font-medium">{trade.shares} shares</p>
                                                <p className="text-sm text-gray-400">@ ${(trade.pricePerShare || 0).toFixed(2)}</p>
                                            </div>
                                            {getStatusBadge(trade.status)}
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Net:</span>
                                            <span className="text-blue-400 font-semibold">${(trade.netAmount || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>To: {trade.buyer.name}</span>
                                            <span>{trade.executedAt ? new Date(trade.executedAt).toLocaleDateString() : 'Pending'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No sales yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Buy Modal */}
            {showBuyModal && selectedListing && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Buy Shares</h3>
                            <button
                                onClick={() => setShowBuyModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Deal Info */}
                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <p className="text-white font-medium">{selectedListing.deal.title}</p>
                                <p className="text-sm text-gray-400">{selectedListing.deal.sme.name}</p>
                            </div>

                            {/* Price Info */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Price per share:</span>
                                <span className="text-xl font-bold text-white">${(selectedListing.pricePerShare || 0).toFixed(2)}</span>
                            </div>

                            {/* Shares Input */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Number of Shares</label>
                                <input
                                    type="number"
                                    value={buyShares}
                                    onChange={(e) => setBuyShares(e.target.value)}
                                    min={selectedListing.minPurchase}
                                    max={selectedListing.sharesAvailable}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Min: {selectedListing.minPurchase}</span>
                                    <span>Available: {selectedListing.sharesAvailable.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Total Calculation */}
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-green-400">Total Cost:</span>
                                    <span className="text-2xl font-bold text-green-400">
                                        ${(parseFloat(buyShares || '0') * (selectedListing.pricePerShare || 0)).toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">+ 1% platform fee</p>
                            </div>

                            {/* Warning */}
                            <div className="flex items-start gap-3 text-amber-400 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>All sales are final. Please review carefully before purchasing.</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowBuyModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBuyShares}
                                    disabled={isBuying || parseFloat(buyShares) < selectedListing.minPurchase || parseFloat(buyShares) > selectedListing.sharesAvailable}
                                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isBuying ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Confirm Purchase
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
