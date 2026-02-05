'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Sparkles,
    Users,
    Building2,
    Heart,
    HeartHandshake,
    TrendingUp,
    Filter,
    Search,
    Eye,
    MessageSquare,
    CheckCircle,
    XCircle,
    Clock,
    BarChart3,
    ArrowRight,
    Star,
    Target
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useToast } from '../../contexts/ToastContext'
import { API_URL } from '@/lib/api'

interface Match {
    investor: {
        id: string
        name: string
        type: string
    }
    sme: {
        id: string
        name: string
        sector: string
        stage: string
    }
    matchScore: number
    factors: {
        sector: { score: number; match: boolean; details: string }
        stage: { score: number; match: boolean; details: string }
        amount: { score: number; match: boolean; details: string }
        geography: { score: number; match: boolean; details: string }
        certification: { score: number; match: boolean; details: string }
    }
    interestStatus: {
        investorExpressedInterest: boolean
        smeExpressedInterest: boolean
        mutualInterest: boolean
    }
}

interface MatchStats {
    totalPossibleMatches: number
    highScoreMatches: number
    mediumScoreMatches: number
    lowScoreMatches: number
    mutualInterests: number
    pendingInterests: number
}

interface User {
    id: string
    role: string
    firstName: string
    lastName: string
}

export default function MatchmakingPage() {
    const { addToast } = useToast()
    const [user, setUser] = useState<User | null>(null)
    const [matches, setMatches] = useState<Match[]>([])
    const [stats, setStats] = useState<MatchStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'mutual'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                const userData = localStorage.getItem('user')

                if (!token || !userData) {
                    window.location.href = '/auth/login'
                    return
                }

                setUser(JSON.parse(userData))

                // Fetch all matches
                const response = await fetch(`${API_URL}/api/matches`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setMatches(data.matches || [])
                    setStats(data.stats || null)
                } else {
                    addToast('error', 'Failed to fetch matches')
                }
            } catch (error) {
                console.error('Error fetching matches:', error)
                addToast('error', 'Error loading matchmaking data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [addToast])

    const handleExpressInterest = async (match: Match, type: 'INVESTOR_TO_SME' | 'SME_TO_INVESTOR') => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const response = await fetch(`${API_URL}/api/interests`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    investorId: match.investor.id,
                    smeId: match.sme.id,
                    type,
                    message: `Interest expressed via matchmaking dashboard`
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.mutualInterest) {
                    addToast('success', '🎉 Mutual Interest! Both parties are interested!')
                } else {
                    addToast('success', 'Interest expressed successfully!')
                }
                // Refresh matches
                window.location.reload()
            } else {
                const errorData = await response.json()
                addToast('error', errorData.error || 'Failed to express interest')
            }
        } catch (error) {
            console.error('Error expressing interest:', error)
            addToast('error', 'Error expressing interest')
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-400'
        if (score >= 40) return 'text-yellow-400'
        return 'text-red-400'
    }

    const getScoreBgColor = (score: number) => {
        if (score >= 70) return 'bg-green-500/20'
        if (score >= 40) return 'bg-yellow-500/20'
        return 'bg-red-500/20'
    }

    const filteredMatches = (matches || []).filter(match => {
        // Apply score filter
        if (filter === 'high' && match.matchScore < 70) return false
        if (filter === 'medium' && (match.matchScore < 40 || match.matchScore >= 70)) return false
        if (filter === 'mutual' && !match.interestStatus?.mutualInterest) return false

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                (match.investor?.name?.toLowerCase() || '').includes(query) ||
                (match.sme?.name?.toLowerCase() || '').includes(query) ||
                (match.sme?.sector?.toLowerCase() || '').includes(query)
            )
        }

        return true
    })

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
                        <Sparkles className="w-8 h-8 text-purple-400" />
                        Smart Matchmaking
                    </h1>
                    <p className="text-gray-400 mt-2">AI-powered SME and Investor matching based on preferences and compatibility</p>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'ADVISOR') && (
                    <button
                        onClick={() => {
                            // In a real implementation, this would open a modal to select SME and Investor
                            addToast('info', 'Opening manual match creator...')
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                    >
                        <HeartHandshake className="w-4 h-4 mr-2" />
                        Create Manual Match
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-6 border border-purple-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-300 text-sm">Total Matches</p>
                                <p className="text-3xl font-bold text-white">{stats.totalPossibleMatches}</p>
                            </div>
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <Target className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-6 border border-green-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-300 text-sm">High Compatibility</p>
                                <p className="text-3xl font-bold text-white">{stats.highScoreMatches}</p>
                            </div>
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 rounded-xl p-6 border border-pink-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-pink-300 text-sm">Mutual Interests</p>
                                <p className="text-3xl font-bold text-white">{stats.mutualInterests}</p>
                            </div>
                            <div className="p-3 bg-pink-500/20 rounded-lg">
                                <HeartHandshake className="w-6 h-6 text-pink-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-6 border border-blue-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-300 text-sm">Pending Interests</p>
                                <p className="text-3xl font-bold text-white">{stats.pendingInterests}</p>
                            </div>
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filter */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by investor name, SME name, or sector..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('high')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'high'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            High Match
                        </button>
                        <button
                            onClick={() => setFilter('medium')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'medium'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Medium
                        </button>
                        <button
                            onClick={() => setFilter('mutual')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'mutual'
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            <HeartHandshake className="w-4 h-4 inline mr-1" />
                            Mutual
                        </button>
                    </div>
                </div>
            </div>

            {/* Matches Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMatches.map((match, index) => (
                    <div
                        key={`${match.investor.id}-${match.sme.id}`}
                        className={`bg-gray-800 rounded-xl p-6 border transition-all hover:shadow-lg ${match.interestStatus.mutualInterest
                            ? 'border-pink-500/50 bg-gradient-to-br from-pink-900/10 to-gray-800'
                            : 'border-gray-700 hover:border-purple-500/50'
                            }`}
                    >
                        {/* Match Score Badge */}
                        <div className="flex justify-between items-start mb-4">
                            <div className={`px-3 py-1 rounded-full ${getScoreBgColor(match.matchScore)}`}>
                                <span className={`font-bold ${getScoreColor(match.matchScore)}`}>
                                    {match.matchScore}% Match
                                </span>
                            </div>
                            {match.interestStatus.mutualInterest && (
                                <div className="flex items-center gap-1 text-pink-400">
                                    <HeartHandshake className="w-5 h-5" />
                                    <span className="text-sm font-medium">Mutual</span>
                                </div>
                            )}
                        </div>

                        {/* Investor Info */}
                        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{match.investor.name}</p>
                                    <p className="text-gray-400 text-sm">{match.investor.type}</p>
                                </div>
                            </div>
                            {match.interestStatus.investorExpressedInterest && (
                                <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
                                    <Heart className="w-4 h-4 fill-current" />
                                    Investor expressed interest
                                </div>
                            )}
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center my-2">
                            <ArrowRight className="w-5 h-5 text-purple-400 rotate-90" />
                        </div>

                        {/* SME Info */}
                        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Building2 className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{match.sme.name}</p>
                                    <p className="text-gray-400 text-sm">{match.sme.sector} • {match.sme.stage}</p>
                                </div>
                            </div>
                            {match.interestStatus.smeExpressedInterest && (
                                <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
                                    <Heart className="w-4 h-4 fill-current" />
                                    SME expressed interest
                                </div>
                            )}
                        </div>

                        {/* Match Factors */}
                        <div className="mb-4">
                            <p className="text-gray-400 text-sm mb-2">Match Factors:</p>
                            <div className="flex flex-wrap gap-2">
                                {match.factors.sector.match && (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                        ✓ Sector
                                    </span>
                                )}
                                {match.factors.stage.match && (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                        ✓ Stage
                                    </span>
                                )}
                                {match.factors.amount.match && (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                        ✓ Amount
                                    </span>
                                )}
                                {match.factors.geography.match && (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                        ✓ Location
                                    </span>
                                )}
                                {match.factors.certification.match && (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                        ✓ Certified
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                            <Link
                                href={`/smes/${match.sme.id}`}
                                className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                View SME
                            </Link>
                            <Link
                                href={`/investors/${match.investor.id}`}
                                className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                View Investor
                            </Link>
                            {(user?.role === 'ADMIN' || user?.role === 'ADVISOR') && !match.interestStatus.mutualInterest && (
                                <button
                                    onClick={() => setSelectedMatch(match)}
                                    className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                                >
                                    <Heart className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredMatches.length === 0 && (
                <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No matches found for the selected filter.</p>
                    <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria.</p>
                </div>
            )}

            {/* Express Interest Modal */}
            {selectedMatch && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-4">Express Interest</h3>
                        <p className="text-gray-400 mb-6">
                            Who is expressing interest in this match?
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    handleExpressInterest(selectedMatch, 'INVESTOR_TO_SME')
                                    setSelectedMatch(null)
                                }}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Users className="w-5 h-5" />
                                {selectedMatch.investor.name} → {selectedMatch.sme.name}
                            </button>

                            <button
                                onClick={() => {
                                    handleExpressInterest(selectedMatch, 'SME_TO_INVESTOR')
                                    setSelectedMatch(null)
                                }}
                                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Building2 className="w-5 h-5" />
                                {selectedMatch.sme.name} → {selectedMatch.investor.name}
                            </button>
                        </div>

                        <button
                            onClick={() => setSelectedMatch(null)}
                            className="w-full mt-4 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
