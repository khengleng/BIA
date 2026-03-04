'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Search, Star } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { authorizedRequest } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Listing {
    id: string
    sharesAvailable: number
    pricePerShare: number
    minPurchase: number
    listedAt: string
    status: string
    deal: {
        id: string
        title: string
        sme: {
            id: string
            name: string
            sector?: string
            stage?: string
            score?: number
        }
    }
}

export default function TradingMarketsPage() {
    const { addToast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [listings, setListings] = useState<Listing[]>([])
    const [watchlistIds, setWatchlistIds] = useState<string[]>([])

    useEffect(() => {
        const load = async () => {
            try {
                const [listingsRes, watchlistRes] = await Promise.all([
                    authorizedRequest('/api/secondary-trading/listings'),
                    authorizedRequest('/api/secondary-trading/watchlist')
                ])

                if (listingsRes.ok) {
                    const data = await listingsRes.json()
                    setListings(Array.isArray(data) ? data : [])
                }

                if (watchlistRes.ok) {
                    const data = await watchlistRes.json()
                    setWatchlistIds(Array.isArray(data.listingIds) ? data.listingIds : [])
                }
            } catch (error) {
                console.error('Failed to load trading markets', error)
                addToast('error', 'Failed to load market data')
            } finally {
                setIsLoading(false)
            }
        }

        load()
    }, [addToast])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return listings
        return listings.filter((listing) => {
            const name = listing.deal?.sme?.name?.toLowerCase() || ''
            const title = listing.deal?.title?.toLowerCase() || ''
            const sector = listing.deal?.sme?.sector?.toLowerCase() || ''
            return name.includes(q) || title.includes(q) || sector.includes(q)
        })
    }, [listings, query])

    const topVolume = useMemo(() => {
        return [...filtered].sort((a, b) => (b.sharesAvailable * b.pricePerShare) - (a.sharesAvailable * a.pricePerShare)).slice(0, 5)
    }, [filtered])

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Markets</h1>
                        <p className="text-gray-400 mt-1">Browse tradable tokenized SME units with live liquidity snapshots.</p>
                    </div>
                    <Link
                        href="/secondary-trading"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-300 hover:bg-blue-500/10"
                    >
                        Open Marketplace
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by SME, deal, or sector"
                            className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                            <h2 className="text-white font-semibold">All Markets</h2>
                            <span className="text-sm text-gray-400">{filtered.length} pairs</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-900 text-gray-400">
                                    <tr>
                                        <th className="text-left px-4 py-3">Market</th>
                                        <th className="text-right px-4 py-3">Price</th>
                                        <th className="text-right px-4 py-3">Liquidity</th>
                                        <th className="text-right px-4 py-3">Min Order</th>
                                        <th className="text-right px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="text-center text-gray-400 py-10">Loading markets...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center text-gray-400 py-10">No markets found</td></tr>
                                    ) : filtered.map((listing) => (
                                        <tr key={listing.id} className="border-t border-gray-700">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white font-medium">{listing.deal?.sme?.name || 'SME'}/USDT</p>
                                                    {watchlistIds.includes(listing.id) && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                                                </div>
                                                <p className="text-xs text-gray-400">{listing.deal?.sme?.sector || 'General'} • {listing.deal?.sme?.stage || 'Active'}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right text-white">${Number(listing.pricePerShare || 0).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right text-gray-300">${(listing.sharesAvailable * listing.pricePerShare).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-gray-300">{Number(listing.minPurchase || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/trading/terminal/${listing.id}`}
                                                    className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white"
                                                >
                                                    Trade
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-xl">
                        <div className="px-4 py-3 border-b border-gray-700">
                            <h2 className="text-white font-semibold">Top Liquidity</h2>
                        </div>
                        <div className="p-4 space-y-3">
                            {topVolume.length === 0 ? (
                                <p className="text-gray-400 text-sm">No active listings.</p>
                            ) : topVolume.map((listing) => (
                                <Link
                                    key={listing.id}
                                    href={`/trading/terminal/${listing.id}`}
                                    className="block rounded-lg border border-gray-700 hover:border-gray-500 p-3"
                                >
                                    <p className="text-white font-medium">{listing.deal?.sme?.name || 'SME'}/USDT</p>
                                    <p className="text-xs text-gray-400 mt-1">Depth ${(listing.sharesAvailable * listing.pricePerShare).toLocaleString()}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
