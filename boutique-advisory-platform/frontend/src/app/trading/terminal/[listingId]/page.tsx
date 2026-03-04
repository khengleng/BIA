'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { authorizedRequest } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import usePermissions from '@/hooks/usePermissions'
import { isTradingOperatorRole, normalizeRole } from '@/lib/roles'

interface Listing {
    id: string
    sharesAvailable: number
    pricePerShare: number
    minPurchase: number
    status: string
    deal?: {
        id: string
        title: string
        sme?: {
            id: string
            name: string
            sector?: string
            stage?: string
        }
    }
}

interface RecentTrade {
    id: string
    listingId: string
    pricePerShare: number
    shares: number
    totalAmount: number
    executedAt: string
}

export default function TradeTerminalPage() {
    const params = useParams<{ listingId: string }>()
    const router = useRouter()
    const { addToast } = useToast()
    const { user, isLoading: isRoleLoading } = usePermissions()
    const listingId = params?.listingId

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [listing, setListing] = useState<Listing | null>(null)
    const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([])
    const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
    const [quantity, setQuantity] = useState('')

    useEffect(() => {
        if (isRoleLoading) return
        const role = normalizeRole(user?.role)
        if (isTradingOperatorRole(role)) {
            router.replace('/trading/markets')
            return
        }

        const load = async () => {
            if (!listingId) return

            try {
                const [listingRes, tradesRes] = await Promise.all([
                    authorizedRequest(`/api/secondary-trading/listings/${listingId}`),
                    authorizedRequest('/api/secondary-trading/trades/recent?limit=80')
                ])

                if (listingRes.status === 404) {
                    addToast('error', 'Trading pair not found')
                    router.push('/trading/markets')
                    return
                }

                if (listingRes.ok) {
                    const data = await listingRes.json()
                    setListing(data)
                    setQuantity(String(data.minPurchase || 1))
                }

                if (tradesRes.ok) {
                    const payload = await tradesRes.json()
                    const filtered = Array.isArray(payload.trades)
                        ? payload.trades.filter((t: RecentTrade) => t.listingId === listingId)
                        : []
                    setRecentTrades(filtered)
                }
            } catch (error) {
                console.error('Failed to load terminal', error)
                addToast('error', 'Failed to load trading terminal')
            } finally {
                setIsLoading(false)
            }
        }

        load()
    }, [addToast, isRoleLoading, listingId, router, user?.role])

    const total = useMemo(() => {
        if (!listing) return 0
        const qty = Number(quantity || 0)
        return qty * Number(listing.pricePerShare || 0)
    }, [listing, quantity])

    const depth = useMemo(() => {
        if (!listing) return { asks: [], bids: [] as Array<{ price: number; shares: number }> }
        const base = Number(listing.pricePerShare || 0)
        const totalShares = Number(listing.sharesAvailable || 0)
        const asks = Array.from({ length: 8 }).map((_, idx) => ({
            price: Number((base * (1 + (idx + 1) * 0.003)).toFixed(2)),
            shares: Math.max(1, Math.round(totalShares * (0.14 - idx * 0.012)))
        }))
        const bids = Array.from({ length: 8 }).map((_, idx) => ({
            price: Number((base * (1 - (idx + 1) * 0.003)).toFixed(2)),
            shares: Math.max(1, Math.round(totalShares * (0.14 - idx * 0.012)))
        }))
        return { asks, bids }
    }, [listing])

    const submitOrder = async () => {
        if (!listing) return
        const qty = Number(quantity)
        if (!Number.isFinite(qty) || qty <= 0) {
            addToast('error', 'Invalid quantity')
            return
        }

        if (side === 'SELL') {
            addToast('info', 'Sell flow is available from your portfolio positions.')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await authorizedRequest(`/api/secondary-trading/listings/${listing.id}/buy`, {
                method: 'POST',
                body: JSON.stringify({ shares: qty })
            })

            if (response.ok) {
                const payload = await response.json()
                if (payload?.abaRequest) {
                    addToast('success', 'Order placed. Complete payment to settle.')
                } else {
                    addToast('success', 'Buy order placed.')
                }
            } else {
                const error = await response.json()
                addToast('error', error?.error || 'Unable to place order')
            }
        } catch (error) {
            console.error('Failed to submit order', error)
            addToast('error', 'Unable to place order')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/trading/markets" className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Markets
                        </Link>
                        <h1 className="text-3xl font-bold text-white mt-2">
                            {listing?.deal?.sme?.name || 'Trading Pair'}/USDT
                        </h1>
                        <p className="text-gray-400 mt-1">{listing?.deal?.title || 'Tokenized SME market'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-sm">Last Price</p>
                        <p className="text-2xl text-white font-semibold">${Number(listing?.pricePerShare || 0).toFixed(2)}</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-10 text-center text-gray-400">Loading terminal...</div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="xl:col-span-2 space-y-4">
                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-white font-semibold">Price Action</h2>
                                    <span className="text-xs text-gray-400">Synthetic intraday bars for market preview</span>
                                </div>
                                <div className="h-64 grid grid-cols-24 gap-1 items-end">
                                    {Array.from({ length: 24 }).map((_, i) => {
                                        const base = Number(listing?.pricePerShare || 1)
                                        const height = 20 + Math.abs(Math.sin(i * 0.9) * 80)
                                        const bullish = Math.cos(i * 0.8) > 0
                                        const close = base * (1 + (Math.sin(i * 0.6) * 0.03))
                                        return (
                                            <div key={i} className="flex flex-col items-center justify-end">
                                                <div className={`w-full rounded-sm ${bullish ? 'bg-green-500/90' : 'bg-red-500/90'}`} style={{ height: `${height}%` }} />
                                                {i % 6 === 0 && <span className="text-[10px] text-gray-500 mt-1">${close.toFixed(2)}</span>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                <h2 className="text-white font-semibold mb-3">Recent Trades</h2>
                                <div className="space-y-2 max-h-72 overflow-auto">
                                    {recentTrades.length === 0 ? (
                                        <p className="text-gray-400 text-sm">No completed trades yet for this pair.</p>
                                    ) : recentTrades.map((trade) => (
                                        <div key={trade.id} className="grid grid-cols-3 text-sm border-b border-gray-700 pb-2">
                                            <span className="text-white">${Number(trade.pricePerShare).toFixed(2)}</span>
                                            <span className="text-gray-300 text-right">{Number(trade.shares).toLocaleString()} units</span>
                                            <span className="text-gray-500 text-right">{new Date(trade.executedAt).toLocaleTimeString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                <h2 className="text-white font-semibold mb-3">Order Book</h2>
                                <div className="space-y-1 mb-3">
                                    {depth.asks.slice().reverse().map((level, idx) => (
                                        <div key={`ask-${idx}`} className="grid grid-cols-2 text-xs">
                                            <span className="text-red-400">${level.price.toFixed(2)}</span>
                                            <span className="text-gray-300 text-right">{level.shares.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center py-2 text-white font-semibold border-y border-gray-700 mb-3">
                                    ${Number(listing?.pricePerShare || 0).toFixed(2)}
                                </div>
                                <div className="space-y-1">
                                    {depth.bids.map((level, idx) => (
                                        <div key={`bid-${idx}`} className="grid grid-cols-2 text-xs">
                                            <span className="text-green-400">${level.price.toFixed(2)}</span>
                                            <span className="text-gray-300 text-right">{level.shares.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-4">
                                    <button
                                        className={`flex-1 py-2 ${side === 'BUY' ? 'bg-green-600 text-white' : 'bg-gray-900 text-gray-300'}`}
                                        onClick={() => setSide('BUY')}
                                    >
                                        Buy
                                    </button>
                                    <button
                                        className={`flex-1 py-2 ${side === 'SELL' ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-300'}`}
                                        onClick={() => setSide('SELL')}
                                    >
                                        Sell
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Price (USDT)</label>
                                        <input
                                            readOnly
                                            value={Number(listing?.pricePerShare || 0).toFixed(2)}
                                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Quantity</label>
                                        <input
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Est. Total</span>
                                        <span className="text-white font-medium">${total.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={submitOrder}
                                        disabled={isSubmitting}
                                        className={`w-full py-2 rounded-lg text-white font-medium ${side === 'BUY' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'} disabled:opacity-60`}
                                    >
                                        {isSubmitting ? 'Submitting...' : `${side === 'BUY' ? 'Buy' : 'Sell'} ${listing?.deal?.sme?.name || 'Token'}`}
                                    </button>
                                    <Link href="/investor/portfolio" className="block text-center text-sm text-blue-300 hover:text-blue-200">
                                        Manage positions in portfolio
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                <h3 className="text-white font-medium mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Pair Snapshot</h3>
                                <div className="text-sm space-y-1 text-gray-300">
                                    <p>Sector: {listing?.deal?.sme?.sector || 'General'}</p>
                                    <p>Stage: {listing?.deal?.sme?.stage || 'Active'}</p>
                                    <p>Available Units: {Number(listing?.sharesAvailable || 0).toLocaleString()}</p>
                                    <p>Minimum Order: {Number(listing?.minPurchase || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
