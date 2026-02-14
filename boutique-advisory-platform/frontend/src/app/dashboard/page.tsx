'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '../../components/layout/DashboardLayout'
import {
  Building2,
  Users,
  Handshake,
  BarChart3,
  FileText,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  UserX
} from 'lucide-react'
import { useTranslations } from '../../hooks/useTranslations'
import { authorizedRequest } from '../../lib/api'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'SME' | 'INVESTOR' | 'ADVISOR' | 'ADMIN'
  tenantId: string
}

export default function DashboardPage() {
  const { t } = useTranslations()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)

          const response = await authorizedRequest('/api/dashboard/stats')
          if (response.ok) {
            const data = await response.json()
            setStats(data.stats)
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getDashboardContent = () => {
    if (!user) return null

    switch (user.role) {
      case 'SME':
        return <SMEDashboard user={user} t={t} stats={stats} />
      case 'INVESTOR':
        return <InvestorDashboard t={t} stats={stats} />
      case 'ADVISOR':
        return <AdvisorDashboard t={t} stats={stats} />
      case 'ADMIN':
        return <AdminDashboard t={t} stats={stats} />
      default:
        return <div>Unknown role</div>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      {getDashboardContent()}
    </DashboardLayout>
  )
}

// SME Dashboard Component
function SMEDashboard({ user, t, stats }: { user: User; t: any; stats: any }) {
  const dashboardStats = [
    { label: t('navigation.profile'), value: stats?.profileCompleteness ? `${stats.profileCompleteness}%` : '75%', icon: Target, color: 'text-blue-500' },
    { label: t('advisory.fundingRequired'), value: stats?.fundingGoal ? `$${(stats.fundingGoal / 1000).toFixed(0)}K` : '$0K', icon: DollarSign, color: 'text-green-500' },
    { label: t('advisory.certified'), value: stats?.activeBookings > 0 ? 'In Review' : 'Pending', icon: CheckCircle, color: 'text-yellow-500' },
    { label: t('navigation.deals'), value: stats?.totalDeals || '0', icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Active Disputes', value: stats?.activeDisputes || '0', icon: AlertCircle, color: 'text-red-500' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">{t('dashboard.welcome')}, {user.firstName}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat: any, index: number) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-gray-700 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{t('dashboard.recentActivity')}</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-white">Profile updated</p>
                <p className="text-sm text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-white">Document uploaded</p>
                <p className="text-sm text-gray-400">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{t('dashboard.nextSteps')}</h2>
          <div className="space-y-4">
            <Link href="/kyc" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors group">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-white group-hover:text-blue-400">Complete KYC verification</p>
                <p className="text-sm text-gray-400">Due in 3 days</p>
              </div>
            </Link>
            <Link href="/documents" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors group">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-white group-hover:text-blue-400">Upload financial statements</p>
                <p className="text-sm text-gray-400">Required for certification</p>
              </div>
            </Link>
            {stats?.activeDisputes > 0 && (
              <Link href="/payments" className="flex items-center space-x-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors group">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-white font-bold">Unresolved Disputes Found</p>
                  <p className="text-sm text-red-400/80">Check payment history for details</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Investor Dashboard Component
function InvestorDashboard({ t, stats }: { t: any; stats: any }) {
  const dashboardStats = [
    { label: t('dashboard.portfolioValue') || 'Portfolio Value', value: stats?.portfolioValue ? `$${(stats.portfolioValue / 1000).toFixed(0)}K` : '$0', icon: DollarSign, color: 'text-green-500', link: '/investor/portfolio' },
    { label: t('dashboard.activeInvestments') || 'Active Investments', value: stats?.activeInvestments || '0', icon: TrendingUp, color: 'text-blue-500', link: '/investor/portfolio' },
    { label: 'Match Score', value: stats?.avgMatchScore ? `${stats.avgMatchScore}%` : '0%', icon: BarChart3, color: 'text-purple-500', link: '/matches' },
    { label: 'Pending Offers', value: stats?.pendingOffers || '0', icon: Clock, color: 'text-yellow-500', link: '/deals' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">{t('dashboard.investorTitle')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat: any, index: number) => (
          <Link href={stat.link} key={index} className="block group">
            <div className="bg-gray-800 rounded-lg p-6 group-hover:bg-gray-700 transition-colors cursor-pointer border border-transparent group-hover:border-gray-600">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-gray-700 ${stat.color} group-hover:bg-gray-600`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{t('dashboard.recentActivity')}</h2>
          <div className="space-y-4">
            {stats?.recentInvestments && stats.recentInvestments.length > 0 ? (
              stats.recentInvestments.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between border-b border-gray-700/50 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-white font-medium">{inv.name}</p>
                    <p className="text-sm text-gray-400">
                      ${(inv.amount || 0).toLocaleString()} {inv.type === 'SYNDICATE' ? 'syndicate' : ''} invested
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'COMPLETED' || inv.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {inv.status}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(inv.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No recent investment activity</p>
                <Link href="/deals" className="text-blue-400 text-xs hover:underline mt-2 inline-block">
                  Browse opportunities
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Market Opportunities</h2>
          <div className="space-y-4">
            {stats?.marketOpportunities && stats.marketOpportunities.length > 0 ? (
              stats.marketOpportunities.map((opportunity: any) => (
                <Link key={opportunity.id} href={`/deals/${opportunity.id}`} className="block border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-700 transition-colors">
                  <p className="text-white font-medium">{opportunity.name}</p>
                  <p className="text-sm text-gray-400">
                    Seeking ${(opportunity.amount || 0).toLocaleString()} investment {opportunity.sector ? `in ${opportunity.sector}` : ''}
                  </p>
                </Link>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No new opportunities available</p>
                <Link href="/matchmaking" className="text-blue-400 text-xs hover:underline mt-2 inline-block">
                  Update your preferences
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Advisor Dashboard Component
function AdvisorDashboard({ t, stats }: { t: any; stats: any }) {
  const dashboardStats = [
    { label: 'Active Projects', value: stats?.clients || '0', icon: FileText, color: 'text-blue-500' },
    { label: 'Total Earnings', value: stats?.earnings ? `$${stats.earnings}` : '$0', icon: DollarSign, color: 'text-green-500' },
    { label: 'Pending Reviews', value: stats?.pendingCertifications || '0', icon: Clock, color: 'text-yellow-500' },
    { label: 'Rating', value: stats?.rating ? `${stats.rating}/5` : 'N/A', icon: TrendingUp, color: 'text-purple-500' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">{t('dashboard.advisorTitle')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat: any, index: number) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-gray-700 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{t('dashboard.recentActivity')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">E-commerce Platform</p>
                <p className="text-sm text-gray-400">Certified 2 days ago</p>
              </div>
              <span className="text-green-500 text-sm">Score: 8.5/10</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">AI Startup</p>
                <p className="text-sm text-gray-400">Certified 1 week ago</p>
              </div>
              <span className="text-green-500 text-sm">Score: 9.2/10</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{t('dashboard.pendingReviews')}</h2>
          <div className="space-y-4">
            <Link href="/advisory/certifications" className="block border-l-4 border-yellow-500 pl-4 py-2 hover:bg-gray-700 transition-colors">
              <p className="text-white font-medium">Manufacturing SME</p>
              <p className="text-sm text-gray-400">Documents pending review</p>
            </Link>
            <Link href="/advisory/certifications" className="block border-l-4 border-red-500 pl-4 py-2 hover:bg-gray-700 transition-colors">
              <p className="text-white font-medium">FinTech Startup</p>
              <p className="text-sm text-gray-400">KYC verification required</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin Dashboard Component
function AdminDashboard({ t, stats }: { t: any; stats: any }) {
  const dashboardStats = [
    { label: 'Total Users', value: stats?.totalUsers || '0', icon: Users, color: 'text-blue-500' },
    { label: 'SMEs', value: stats?.totalSMEs || '0', icon: Building2, color: 'text-green-500' },
    { label: 'Active Deals', value: stats?.activeDeals || '0', icon: Handshake, color: 'text-purple-500' },
    { label: 'Active Disputes', value: stats?.activeDisputes || '0', icon: AlertCircle, color: 'text-red-500' },
    { label: 'Revenue', value: stats?.platformRevenue ? `$${stats.platformRevenue}` : '$0', icon: CheckCircle, color: 'text-green-500' },
    { label: 'Deleted Users', value: stats?.deletedUsers || '0', icon: UserX, color: 'text-red-500' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">{t('dashboard.adminTitle')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat: any, index: number) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-gray-700 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">DID Infrastructure</p>
                <p className="text-sm text-gray-400">API Gateway</p>
              </div>
              <span className="text-green-500 text-sm">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">CM Infrastructure</p>
                <p className="text-sm text-gray-400">Case Management</p>
              </div>
              <span className="text-green-500 text-sm">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">RWA Infrastructure</p>
                <p className="text-sm text-gray-400">Tokenization</p>
              </div>
              <span className="text-green-500 text-sm">Online</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{t('dashboard.recentActivity')}</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-white">New tenant registered</p>
                <p className="text-sm text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-white">System backup completed</p>
                <p className="text-sm text-gray-400">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
