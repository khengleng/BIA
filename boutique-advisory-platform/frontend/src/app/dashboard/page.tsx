'use client'

import { useState, useEffect } from 'react'
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
  Clock
} from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'SME' | 'INVESTOR' | 'ADVISOR' | 'ADMIN'
  tenantId: string
}

export default function DashboardPage() {

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user data from localStorage
    const fetchUser = async () => {
      try {
        const userData = localStorage.getItem('user')

        if (userData) {
          const user = JSON.parse(userData)
          setUser(user)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const getDashboardContent = () => {
    if (!user) return null

    switch (user.role) {
      case 'SME':
        return <SMEDashboard user={user} />
      case 'INVESTOR':
        return <InvestorDashboard />
      case 'ADVISOR':
        return <AdvisorDashboard />
      case 'ADMIN':
        return <AdminDashboard />
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
function SMEDashboard({ user }: { user: User }) {
  const stats = [
    { label: 'Profile Completion', value: '85%', icon: Target, color: 'text-blue-500' },
    { label: 'Funding Required', value: '$500K', icon: DollarSign, color: 'text-green-500' },
    { label: 'Certification Status', value: 'Pending', icon: CheckCircle, color: 'text-yellow-500' },
    { label: 'Active Deals', value: '2', icon: TrendingUp, color: 'text-purple-500' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Welcome back, {user.firstName}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
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
          <h2 className="text-xl font-semibold text-white mb-4">Next Steps</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-white">Complete KYC verification</p>
                <p className="text-sm text-gray-400">Due in 3 days</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-white">Upload financial statements</p>
                <p className="text-sm text-gray-400">Required for certification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Investor Dashboard Component
function InvestorDashboard() {
  const stats = [
    { label: 'Portfolio Value', value: '$2.5M', icon: DollarSign, color: 'text-green-500' },
    { label: 'Active Investments', value: '8', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Total Returns', value: '+15.2%', icon: BarChart3, color: 'text-purple-500' },
    { label: 'Pending Deals', value: '3', icon: Clock, color: 'text-yellow-500' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Investment Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
          <h2 className="text-xl font-semibold text-white mb-4">Recent Investments</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Tech Startup A</p>
                <p className="text-sm text-gray-400">$500K invested</p>
              </div>
              <span className="text-green-500 text-sm">+8.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Manufacturing Co</p>
                <p className="text-sm text-gray-400">$300K invested</p>
              </div>
              <span className="text-green-500 text-sm">+12.3%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Market Opportunities</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-white font-medium">New SME in FinTech</p>
              <p className="text-sm text-gray-400">Seeking $750K investment</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-white font-medium">Green Energy Startup</p>
              <p className="text-sm text-gray-400">Seeking $1.2M investment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Advisor Dashboard Component
function AdvisorDashboard() {
  const stats = [
    { label: 'Active Cases', value: '12', icon: FileText, color: 'text-blue-500' },
    { label: 'SMEs Certified', value: '45', icon: CheckCircle, color: 'text-green-500' },
    { label: 'Pending Reviews', value: '5', icon: Clock, color: 'text-yellow-500' },
    { label: 'Success Rate', value: '92%', icon: TrendingUp, color: 'text-purple-500' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Advisor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
          <h2 className="text-xl font-semibold text-white mb-4">Recent Certifications</h2>
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
          <h2 className="text-xl font-semibold text-white mb-4">Pending Reviews</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-white font-medium">Manufacturing SME</p>
              <p className="text-sm text-gray-400">Documents pending review</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-white font-medium">FinTech Startup</p>
              <p className="text-sm text-gray-400">KYC verification required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin Dashboard Component
function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: 'text-blue-500' },
    { label: 'Active Tenants', value: '45', icon: Building2, color: 'text-green-500' },
    { label: 'Total Deals', value: '89', icon: Handshake, color: 'text-purple-500' },
    { label: 'System Health', value: '99.9%', icon: CheckCircle, color: 'text-green-500' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
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
