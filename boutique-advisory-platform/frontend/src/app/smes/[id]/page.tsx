'use client'
import { API_URL } from '@/lib/api'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Handshake,
  DollarSign,
  TrendingUp,
  FileText as DocumentIcon,
  Eye,
  Settings,
  Phone,
  Mail,
  Globe,
  Award,
  MapPin,
  ArrowLeft,
  Edit,
  Download,
  Building2,
  BarChart3,
  Users,
  LogOut,
  Bell,
  FileText
} from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'SME' | 'INVESTOR' | 'ADVISOR' | 'ADMIN'
  tenantId: string
}

export default function SMEPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
          router.push('/auth/login')
          return
        }

        const user = JSON.parse(userData)
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleEdit = () => {
    setShowEditModal(true)
  }



  const handleCreateDeal = () => {
    router.push('/deals/create')
  }

  const handleViewDocument = async (docName: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/auth/login'
        return
      }

      const response = await fetch(`${API_URL} /api/documents / ${encodeURIComponent(docName)} `, {
        headers: {
          'Authorization': `Bearer ${token} `
        }
      })

      if (response.ok) {
        // Open document in new tab
        window.open(`${API_URL} /api/documents / ${encodeURIComponent(docName)} `, '_blank')
      } else {
        console.error('Document not found')
      }
    } catch (error) {
      console.error('Error viewing document:', error)
    }
  }

  const handleDownloadDocument = async (docName: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/auth/login'
        return
      }

      const response = await fetch(`${API_URL} /api/documents / ${encodeURIComponent(docName)}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = docName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Document download failed')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const handleUploadDocument = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/auth/login'
        return
      }

      // In a real implementation, this would open a file upload modal
      console.log('Upload document functionality')
      // You would typically open a modal with file input and upload form
    } catch (error) {
      console.error('Error uploading document:', error)
    }
  }

  // Mock SME data
  const sme = {
    id: params.id,
    name: 'Tech Startup A',
    registrationNumber: 'REG-2024-001',
    taxId: 'TAX-123456789',
    foundedDate: '2022-03-15',
    website: 'https://techstartupa.com',
    address: '123 Innovation Street',
    city: 'Phnom Penh',
    province: 'Phnom Penh',
    postalCode: '12000',
    phone: '+855 12 345 678',
    email: 'contact@techstartupa.com',
    sector: 'Technology',
    industry: 'Fintech',
    businessStage: 'Series A',
    employeeCount: '11-25',
    annualRevenue: '$500,000',
    fundingRequired: '$1,000,000',
    currentAssets: '$200,000',
    currentLiabilities: '$50,000',
    totalRevenue: '$500,000',
    netProfit: '$75,000',
    businessDescription: 'Innovative fintech solution for digital payments and financial inclusion in Cambodia.',
    valueProposition: 'Secure, fast, and affordable digital payment solutions for SMEs and individuals.',
    targetMarket: 'Small and medium enterprises, individual consumers, and financial institutions in Cambodia.',
    competitiveAdvantage: 'First-mover advantage in the Cambodian fintech market, strong local partnerships, and regulatory compliance.',
    status: 'Active',
    location: 'Phnom Penh, Cambodia',
    documents: [
      { name: 'Business Plan', type: 'PDF', size: '2.3 MB', uploaded: '2024-01-15' },
      { name: 'Financial Statements', type: 'PDF', size: '1.8 MB', uploaded: '2024-01-10' },
      { name: 'Legal Documents', type: 'PDF', size: '3.1 MB', uploaded: '2024-01-05' }
    ],
    deals: [
      { id: 1, title: 'Series A Funding', amount: '$500K', status: 'Active', progress: 75 },
      { id: 2, title: 'Growth Capital', amount: '$750K', status: 'Pending', progress: 25 }
    ],
    metrics: {
      monthlyGrowth: '+15%',
      customerRetention: '92%',
      marketShare: '8%',
      employeeSatisfaction: '4.5/5'
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'financials', name: 'Financials', icon: DollarSign },
    { id: 'deals', name: 'Deals', icon: Handshake },
    { id: 'documents', name: 'Documents', icon: DocumentIcon },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ]

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
                    {user?.role.toLowerCase()}
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
        <aside className="w-64 bg-gray-800 min-h-screen">
          <nav className="mt-8">
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
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg"
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
                href="/advisory"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <Award className="w-5 h-5 mr-3" />
                Advisory Services
              </Link>

              <Link
                href="/reports"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link
                href="/smes"
                className="flex items-center text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to SMEs
              </Link>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white">{sme.name}</h1>
                <p className="text-gray-400 mt-2">{sme.sector} • {sme.businessStage} • {sme.location}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleEdit}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleCreateDeal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Handshake className="w-4 h-4 mr-2" />
                  Create Deal
                </button>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-8">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${sme.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
              {sme.status}
            </span>
          </div>

          {/* Tabs */}
          <div className="bg-gray-800 rounded-lg mb-8">
            <div className="border-b border-gray-700">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                      }`}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Registration Number:</span>
                          <span className="text-white">{sme.registrationNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tax ID:</span>
                          <span className="text-white">{sme.taxId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Founded:</span>
                          <span className="text-white">{sme.foundedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Employees:</span>
                          <span className="text-white">{sme.employeeCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Annual Revenue:</span>
                          <span className="text-white">{sme.annualRevenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Funding Required:</span>
                          <span className="text-white font-semibold text-blue-400">{sme.fundingRequired}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-white">{sme.address}, {sme.city}, {sme.province}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-white">{sme.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-white">{sme.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 text-gray-400 mr-3" />
                          <a href={sme.website} className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">
                            {sme.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Description */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Business Description</h3>
                    <p className="text-gray-300 mb-4">{sme.businessDescription}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Value Proposition</h4>
                        <p className="text-gray-300 text-sm">{sme.valueProposition}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Target Market</h4>
                        <p className="text-gray-300 text-sm">{sme.targetMarket}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Competitive Advantage</h4>
                        <p className="text-gray-300 text-sm">{sme.competitiveAdvantage}</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{sme.metrics.monthlyGrowth}</div>
                        <div className="text-sm text-gray-400">Monthly Growth</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{sme.metrics.customerRetention}</div>
                        <div className="text-sm text-gray-400">Customer Retention</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{sme.metrics.marketShare}</div>
                        <div className="text-sm text-gray-400">Market Share</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{sme.metrics.employeeSatisfaction}</div>
                        <div className="text-sm text-gray-400">Employee Satisfaction</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'financials' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Financial Overview</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current Assets:</span>
                          <span className="text-white">{sme.currentAssets}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current Liabilities:</span>
                          <span className="text-white">{sme.currentLiabilities}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Revenue:</span>
                          <span className="text-white">{sme.totalRevenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Net Profit:</span>
                          <span className="text-green-400">{sme.netProfit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Financial Ratios</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current Ratio:</span>
                          <span className="text-white">4.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Debt-to-Equity:</span>
                          <span className="text-white">0.25</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Profit Margin:</span>
                          <span className="text-green-400">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">ROI:</span>
                          <span className="text-blue-400">22%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'deals' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Active Deals</h3>
                    <button
                      onClick={handleCreateDeal}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Create New Deal
                    </button>
                  </div>

                  <div className="space-y-4">
                    {sme.deals.map((deal) => (
                      <div key={deal.id} className="bg-gray-700 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{deal.title}</h4>
                            <p className="text-gray-400">Amount: {deal.amount}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${deal.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {deal.status}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white">{deal.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${deal.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/deals/${deal.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => router.push(`/deals/${deal.id}/edit`)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Documents</h3>
                    <button
                      onClick={handleUploadDocument}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Upload Document
                    </button>
                  </div>

                  <div className="space-y-4">
                    {sme.documents.map((doc, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <DocumentIcon className="w-8 h-8 text-blue-400" />
                          <div>
                            <h4 className="text-white font-medium">{doc.name}</h4>
                            <p className="text-gray-400 text-sm">{doc.type} • {doc.size} • Uploaded {doc.uploaded}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDocument(doc.name)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(doc.name)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Revenue Growth</span>
                          <span className="text-green-400">+25%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Customer Acquisition</span>
                          <span className="text-blue-400">+18%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Market Expansion</span>
                          <span className="text-purple-400">+12%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Operational Efficiency</span>
                          <span className="text-yellow-400">+8%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Market Risk</span>
                          <span className="text-yellow-400">Medium</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Financial Risk</span>
                          <span className="text-green-400">Low</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Operational Risk</span>
                          <span className="text-yellow-400">Medium</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Regulatory Risk</span>
                          <span className="text-red-400">High</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Edit SME</h3>
            <p className="text-gray-400 mb-4">Edit functionality would be implemented here.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token')
                    if (!token) {
                      window.location.href = '/auth/login'
                      return
                    }

                    // In a real implementation, this would update the SME
                    console.log('SME updated successfully!')
                    setShowEditModal(false)
                  } catch (error) {
                    console.error('Error updating SME:', error)
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Delete SME</h3>
            <p className="text-gray-400 mb-4">Are you sure you want to delete this SME? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token')
                    if (!token) {
                      window.location.href = '/auth/login'
                      return
                    }

                    const response = await fetch(`${API_URL}/api/smes/${params.id}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })

                    if (response.ok) {
                      console.log('SME deleted successfully!')
                      setShowDeleteModal(false)
                      router.push('/smes')
                    } else {
                      console.error('Failed to delete SME')
                    }
                  } catch (error) {
                    console.error('Error deleting SME:', error)
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
