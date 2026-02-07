'use client'

import { useState, useEffect } from 'react'
import {
    Users,
    Building2,
    Handshake,
    BarChart3,
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import { authorizedRequest } from '../../../lib/api'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await authorizedRequest('/api/admin/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data.stats)
                }
            } catch (error) {
                console.error('Error fetching admin stats:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        )
    }

    const statCards = [
        { label: 'Total Users', value: stats?.users || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Active SMEs', value: stats?.smes || 0, icon: Building2, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Verified Investors', value: stats?.investors || 0, icon: Handshake, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Total Deals', value: stats?.deals || 0, icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ]

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">System Administration</h1>
                    <p className="text-gray-400 mt-2">Global platform overview and management.</p>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, i) => (
                        <div key={i} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`${card.bg} p-3 rounded-xl`}>
                                    <card.icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                                <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                    <ArrowUpRight className="w-3 h-3" />
                                    12%
                                </span>
                            </div>
                            <h3 className="text-gray-400 text-sm font-medium">{card.label}</h3>
                            <p className="text-3xl font-bold text-white mt-1">{card.value.toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-400" />
                                System Health
                            </h2>
                            <button className="text-sm text-blue-400 hover:text-blue-300">View Logs</button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-500/20 p-2 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Database Latency</p>
                                        <p className="text-gray-400 text-xs text-uppercase">Normal Operation</p>
                                    </div>
                                </div>
                                <span className="text-green-400 font-bold">12ms</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-500/20 p-2 rounded-lg">
                                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Auth Verification</p>
                                        <p className="text-gray-400 text-xs">99.9% Success Rate</p>
                                    </div>
                                </div>
                                <span className="text-blue-400 font-bold">Stable</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-500/20 p-2 rounded-lg">
                                        <BarChart3 className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Platform Volume</p>
                                        <p className="text-gray-400 text-xs">Total Transaction Value</p>
                                    </div>
                                </div>
                                <span className="text-purple-400 font-bold">${(stats?.totalVolume || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Alerts/Status */}
                    <div className="space-y-6">
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
                            <h3 className="text-orange-400 font-bold flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5" />
                                Attention Required
                            </h3>
                            <div className="space-y-4">
                                <div className="text-sm bg-gray-900/50 p-3 rounded-lg border border-orange-500/20">
                                    <p className="text-white font-medium">12 KYC Requests</p>
                                    <p className="text-gray-400 text-xs mt-1">Investors waiting for verification</p>
                                </div>
                                <div className="text-sm bg-gray-900/50 p-3 rounded-lg border border-orange-500/20">
                                    <p className="text-white font-medium">3 Deal Disputes</p>
                                    <p className="text-gray-400 text-xs mt-1">Requires manual mediation</p>
                                </div>
                            </div>
                            <button className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl transition-all">
                                Action Center
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
