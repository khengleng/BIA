'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Briefcase,
  Download,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Handshake,
  LogOut,
  Bell,
  FileText,
  Settings
} from 'lucide-react'
import { API_URL } from '@/lib/api'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'SME' | 'INVESTOR' | 'ADVISOR' | 'ADMIN'
  tenantId: string
}

interface Report {
  id: number
  title: string
  type: string
  date: string
  status: string
  size: string
  description: string
}

interface Stat {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: typeof Handshake
}

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
          window.location.href = '/auth/login'
          return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Fetch reports from API
        const reportsResponse = await fetch(`${API_URL}/api/reports`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json()
          setReports(reportsData)
        }

        // Fetch stats from API
        const statsResponse = await fetch(`${API_URL}/api/reports/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          // Map API stats to include icons
          const iconMap: { [key: string]: typeof Handshake } = {
            'Total Deals': Handshake,
            'Active SMEs': Building2,
            'Total Investment': DollarSign,
            'Success Rate': TrendingUp
          }
          const mappedStats = (statsData.stats || []).map((stat: { title: string; value: string; change: string; trend: string }) => ({
            ...stat,
            icon: iconMap[stat.title] || Handshake
          }))
          setStats(mappedStats)
        } else {
          // Fallback to default stats if API fails
          setStats([
            { title: 'Total Deals', value: '0', change: '+0%', trend: 'up', icon: Handshake },
            { title: 'Active SMEs', value: '0', change: '+0%', trend: 'up', icon: Building2 },
            { title: 'Total Investment', value: '$0M', change: '+0%', trend: 'up', icon: DollarSign },
            { title: 'Success Rate', value: '0%', change: '0%', trend: 'up', icon: TrendingUp }
          ])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDownloadReport = async (report: any) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/auth/login'
        return
      }

      // Download report as PDF
      console.log(`Downloading report: ${report.title}`)
      const blob = new Blob([`${report.title}\n\n${report.description}\n\nGenerated: ${report.date}`], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.title.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/auth/login'
        return
      }

      setIsGenerating(true)

      const response = await fetch(`${API_URL}/api/reports/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reportType: 'Monthly Summary' })
      })

      if (response.ok) {
        const data = await response.json()
        // Add the new report to the list
        setReports(prev => [data.report, ...prev])
        console.log('Report generated successfully!')
      } else {
        const errorData = await response.json()
        console.error('Error generating report:', errorData.error)
        alert(errorData.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsGenerating(false)
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Boutique Advisory</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-white">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {user?.role?.toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-screen flex flex-col">
          <nav className="mt-8 flex-1">
            <div className="px-4 space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Dashboard
              </Link>

              <Link
                href="/smes"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <Building2 className="w-5 h-5 mr-3" />
                SMEs
              </Link>

              <Link
                href="/investors"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <Users className="w-5 h-5 mr-3" />
                Investors
              </Link>

              <Link
                href="/deals"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <Handshake className="w-5 h-5 mr-3" />
                Deals
              </Link>

              <Link
                href="/reports"
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg"
              >
                <FileText className="w-5 h-5 mr-3" />
                Reports
              </Link>

              <Link
                href="/settings"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </div>
          </nav>

          {/* Logout Button at Bottom of Sidebar */}
          <div className="px-4 pb-8">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Reports</h1>
            {/* Only ADMIN and ADVISOR can generate reports */}
            {(user?.role === 'ADMIN' || user?.role === 'ADVISOR') && (
              <button
                onClick={() => handleGenerateReport()}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.trend === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <stat.icon className={`w-6 h-6 ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                  )}
                  <span className={`text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change} from last month
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Reports List */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Reports</h2>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{report.title}</h3>
                      <p className="text-gray-400 text-sm">{report.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-gray-500 text-xs">{report.type}</span>
                        <span className="text-gray-500 text-xs">{report.size}</span>
                        <span className="text-gray-500 text-xs">{report.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'Generated' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {report.status}
                    </span>
                    <button
                      onClick={() => handleDownloadReport(report)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
