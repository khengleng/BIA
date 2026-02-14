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
    ArrowDownRight,
    DollarSign,
    UserX,
    CheckCircle,
    Server,
    Database,
    Coins,
    Clock
} from 'lucide-react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import { authorizedRequest } from '../../../lib/api'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [actionStats, setActionStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const [generalRes, actionRes] = await Promise.all([
                    authorizedRequest('/api/admin/stats'),
                    authorizedRequest('/api/admin/action-center/stats')
                ]);

                if (generalRes.ok) {
                    const data = await generalRes.json();
                    setStats(data.stats || data)
                }

                if (actionRes.ok) {
                    const actionData = await actionRes.json();
                    setActionStats(actionData);
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">System overview and platform management</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Last updated</p>
                        <p className="text-white font-medium">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-blue-400 text-xs mb-2">
                            <Users className="w-4 h-4" />
                            Total Users
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.users || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-green-400 text-xs mb-2">
                            <Building2 className="w-4 h-4" />
                            SMEs
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.smes || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-purple-400 text-xs mb-2">
                            <Handshake className="w-4 h-4" />
                            Active Deals
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.deals || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-red-400 text-xs mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            Active Disputes
                        </div>
                        <p className="text-3xl font-bold text-white">{actionStats?.dealDisputes || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-700/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs mb-2">
                            <DollarSign className="w-4 h-4" />
                            Revenue
                        </div>
                        <p className="text-2xl font-bold text-white">${(stats?.totalVolume || 0).toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-gray-700/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                            <UserX className="w-4 h-4" />
                            Deleted Users
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.deletedUsers || 0}</p>
                    </div>
                </div>

                {/* System Overview & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* System Overview */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Server className="w-5 h-5 text-blue-400" />
                            System Overview
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500/20 p-2 rounded-lg">
                                        <Database className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">DID Infrastructure</p>
                                        <p className="text-xs text-gray-400">API Gateway</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    Online
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-500/20 p-2 rounded-lg">
                                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">CM Infrastructure</p>
                                        <p className="text-xs text-gray-400">Case Management</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    Online
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-500/20 p-2 rounded-lg">
                                        <Coins className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">RWA Infrastructure</p>
                                        <p className="text-xs text-gray-400">Tokenization</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    Online
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <div className="bg-blue-500/20 p-2 rounded-lg mt-0.5">
                                    <Users className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium text-sm">New tenant registered</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        2 hours ago
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <div className="bg-green-500/20 p-2 rounded-lg mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium text-sm">System backup completed</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        1 day ago
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <div className="bg-purple-500/20 p-2 rounded-lg mt-0.5">
                                    <Handshake className="w-4 h-4 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium text-sm">New deal published</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        2 days ago
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Center */}
                <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-700/50 rounded-xl p-6">
                    <h3 className="text-orange-400 font-bold flex items-center gap-2 mb-6 text-xl">
                        <AlertTriangle className="w-6 h-6" />
                        Action Center
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 p-5 rounded-xl border border-orange-500/20 flex justify-between items-center group hover:bg-gray-800 transition-all cursor-pointer">
                            <div>
                                <p className="text-white font-bold text-2xl">{actionStats?.kycRequests || 0}</p>
                                <p className="text-gray-400 text-sm mt-1">Pending KYC Requests</p>
                            </div>
                            <button
                                onClick={() => window.location.href = '/admin/kyc-requests'}
                                className="px-4 py-2 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all font-medium"
                            >
                                Review
                            </button>
                        </div>

                        <div className="bg-gray-900/50 p-5 rounded-xl border border-red-500/20 flex justify-between items-center group hover:bg-gray-800 transition-all cursor-pointer">
                            <div>
                                <p className="text-white font-bold text-2xl">{actionStats?.dealDisputes || 0}</p>
                                <p className="text-gray-400 text-sm mt-1">Open Disputes</p>
                            </div>
                            <button
                                onClick={() => window.location.href = '/admin/disputes'}
                                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all font-medium"
                            >
                                Resolve
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
