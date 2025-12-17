'use client'
import { API_URL } from '@/lib/api'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Users,
  Handshake,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Bell,
  ArrowLeft,
  Edit,
  Download,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  FileText as DocumentIcon,
  Phone,
  Mail,
  Award,
  PieChart,
  Star,
  Briefcase,
  X,
  Plus
} from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'SME' | 'INVESTOR' | 'ADVISOR' | 'ADMIN'
  tenantId: string
}

export default function InvestorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false)
  const [showInvestmentDetailsModal, setShowInvestmentDetailsModal] = useState(false)
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false)
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null)
  const [addEventForm, setAddEventForm] = useState({
    title: '',
    description: '',
    date: '',
    type: '',
    status: '',
    priority: ''
  })
  const [editForm, setEditForm] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    country: '',
    investorType: '',
    investmentExperience: '',
    investmentRange: '',
    netWorth: '',
    annualIncome: '',
    liquidAssets: '',
    investmentPortfolio: '',
    occupation: '',
    company: '',
    experience: '',
    riskTolerance: '',
    investmentGoals: '',
    status: '',
    preferredSectors: [] as string[]
  })
  const [addInvestmentForm, setAddInvestmentForm] = useState({
    company: '',
    amount: '',
    sector: '',
    stage: '',
    description: '',
    expectedReturn: '',
    timeline: ''
  })

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
    setEditForm({
      name: investor.name,
      title: investor.title,
      email: investor.email,
      phone: investor.phone,
      address: investor.address,
      city: investor.city,
      province: investor.province,
      country: investor.country,
      investorType: investor.investorType,
      investmentExperience: investor.investmentExperience,
      investmentRange: investor.investmentRange,
      netWorth: investor.netWorth,
      annualIncome: investor.annualIncome,
      liquidAssets: investor.liquidAssets,
      investmentPortfolio: investor.investmentPortfolio,
      occupation: investor.occupation,
      company: investor.company,
      experience: investor.experience,
      riskTolerance: investor.riskTolerance,
      investmentGoals: investor.investmentGoals,
      status: investor.status,
      preferredSectors: [...investor.preferredSectors]
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    // Here you would typically make an API call to update the investor
    alert(`Investor "${editForm.name}" updated successfully!`)

    // Update the local investor data to reflect changes
    Object.assign(investor, editForm)

    setShowEditModal(false)

    // Reset form
    setEditForm({
      name: '',
      title: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      country: '',
      investorType: '',
      investmentExperience: '',
      investmentRange: '',
      netWorth: '',
      annualIncome: '',
      liquidAssets: '',
      investmentPortfolio: '',
      occupation: '',
      company: '',
      experience: '',
      riskTolerance: '',
      investmentGoals: '',
      status: '',
      preferredSectors: []
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSectorToggle = (sector: string) => {
    setEditForm(prev => ({
      ...prev,
      preferredSectors: prev.preferredSectors.includes(sector)
        ? prev.preferredSectors.filter(s => s !== sector)
        : [...prev.preferredSectors, sector]
    }))
  }

  const handleAddInvestmentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAddInvestmentForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddInvestment = () => {
    // Here you would typically make an API call to add the investment
    alert(`Investment in "${addInvestmentForm.company}" added successfully!`)
    setShowAddInvestmentModal(false)
    setAddInvestmentForm({
      company: '',
      amount: '',
      sector: '',
      stage: '',
      description: '',
      expectedReturn: '',
      timeline: ''
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewInvestmentDetails = (investment: any) => {
    setSelectedInvestment(investment)
    setShowInvestmentDetailsModal(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewPerformance = (investment: any) => {
    setSelectedInvestment(investment)
    setShowPerformanceModal(true)
  }

  const handleUploadDocument = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/auth/login'
        return
      }

      // In a real implementation, this would handle file upload
      console.log('Document uploaded successfully!')
      setShowUploadDocumentModal(false)
    } catch (error) {
      console.error('Error uploading document:', error)
    }
  }

  const handleViewDocument = async (docName: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/auth/login'
        return
      }

      const response = await fetch(`${API_URL}/api/documents/${encodeURIComponent(docName)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Open document in new tab with token
        window.open(`${API_URL}/api/documents/${encodeURIComponent(docName)}?token=${token}`, '_blank')
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

      const response = await fetch(`${API_URL}/api/documents/${encodeURIComponent(docName)}/download`, {
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



  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditTimelineEvent = (event: any) => {
    // In a real implementation, this would open an edit modal for the timeline event
    console.log(`Edit event: ${event.title}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDeleteTimelineEvent = (event: any) => {
    // In a real implementation, this would delete the timeline event
    console.log(`Delete event: ${event.title}`)
  }

  // Mock Investor data - dynamically based on ID
  const getInvestorData = (id: string) => {
    const investors = {
      '1': {
        id: '1',
        name: 'John Smith',
        title: 'Angel Investor',
        email: 'john.smith@email.com',
        phone: '+855 12 345 678',
        address: '456 Investment Avenue',
        city: 'Phnom Penh',
        province: 'Phnom Penh',
        country: 'Cambodia',
        investorType: 'Angel Investor',
        investmentExperience: 'Advanced',
        preferredSectors: ['Technology', 'Fintech', 'E-commerce', 'Healthcare'],
        investmentRange: '$100K - $500K',
        netWorth: '$2,500,000',
        annualIncome: '$300,000',
        liquidAssets: '$800,000',
        investmentPortfolio: '$1,200,000',
        occupation: 'Entrepreneur',
        company: 'Smith Ventures',
        experience: '15+ years',
        riskTolerance: 'Moderate',
        investmentGoals: 'Diversified portfolio with focus on high-growth technology companies in emerging markets.',
        status: 'Active',
        rating: 4.8,
        reviews: 12,
        completedInvestments: 8,
        activeInvestments: 3,
        totalReturns: '+18.5%',
        documents: [
          { name: 'Identification Document', type: 'PDF', size: '1.2 MB', uploaded: '2024-01-15' },
          { name: 'Proof of Funds', type: 'PDF', size: '2.1 MB', uploaded: '2024-01-10' },
          { name: 'Professional References', type: 'PDF', size: '0.8 MB', uploaded: '2024-01-05' }
        ],
        investments: [
          { id: 1, company: 'Tech Startup A', amount: '$200K', status: 'Active', returns: '+25%', date: '2023-06-15' },
          { id: 2, company: 'Fintech Co', amount: '$150K', status: 'Active', returns: '+12%', date: '2023-09-20' },
          { id: 3, company: 'E-commerce Platform', amount: '$300K', status: 'Pending', returns: 'N/A', date: '2024-01-10' }
        ],
        metrics: {
          totalInvested: '$650K',
          averageReturn: '+18.5%',
          successRate: '87%',
          portfolioGrowth: '+22%'
        },
        timelineEvents: [
          {
            id: 1,
            title: 'Initial Contact Made',
            description: 'First contact established through LinkedIn outreach',
            date: '2023-01-15',
            type: 'Contact',
            status: 'Completed',
            priority: 'High'
          },
          {
            id: 2,
            title: 'Due Diligence Started',
            description: 'Comprehensive due diligence process initiated',
            date: '2023-02-20',
            type: 'Due Diligence',
            status: 'In Progress',
            priority: 'High'
          },
          {
            id: 3,
            title: 'Investment Agreement Signed',
            description: 'Final investment agreement signed and executed',
            date: '2023-03-10',
            type: 'Legal',
            status: 'Completed',
            priority: 'Critical'
          },
          {
            id: 4,
            title: 'First Investment Made',
            description: 'Initial investment of $200K transferred to Tech Startup A',
            date: '2023-06-15',
            type: 'Investment',
            status: 'Completed',
            priority: 'Critical'
          },
          {
            id: 5,
            title: 'Quarterly Review Meeting',
            description: 'Scheduled quarterly performance review meeting',
            date: '2023-09-15',
            type: 'Review',
            status: 'Scheduled',
            priority: 'Medium'
          }
        ]
      },
      '2': {
        id: '2',
        name: 'Sarah Johnson',
        title: 'Venture Capital Partner',
        email: 'sarah.johnson@vc.com',
        phone: '+65 9 876 543',
        address: '789 Venture Street',
        city: 'Singapore',
        province: 'Singapore',
        country: 'Singapore',
        investorType: 'Venture Capital',
        investmentExperience: 'Expert',
        preferredSectors: ['Technology', 'Fintech', 'Healthcare', 'AI/ML'],
        investmentRange: '$500K - $5M',
        netWorth: '$15,000,000',
        annualIncome: '$800,000',
        liquidAssets: '$3,000,000',
        investmentPortfolio: '$8,500,000',
        occupation: 'VC Partner',
        company: 'Southeast Asia Ventures',
        experience: '20+ years',
        riskTolerance: 'Aggressive',
        investmentGoals: 'Focus on Series A and B investments in high-growth technology companies across Southeast Asia.',
        status: 'Active',
        rating: 4.9,
        reviews: 18,
        completedInvestments: 12,
        activeInvestments: 5,
        totalReturns: '+25.3%',
        documents: [
          { name: 'Professional License', type: 'PDF', size: '0.9 MB', uploaded: '2024-01-20' },
          { name: 'Investment Track Record', type: 'PDF', size: '3.2 MB', uploaded: '2024-01-18' },
          { name: 'Due Diligence Report', type: 'PDF', size: '1.5 MB', uploaded: '2024-01-12' }
        ],
        investments: [
          { id: 1, company: 'AI Health Tech', amount: '$1M', status: 'Active', returns: '+35%', date: '2023-08-10' },
          { id: 2, company: 'Fintech Platform', amount: '$2M', status: 'Active', returns: '+18%', date: '2023-11-15' },
          { id: 3, company: 'E-commerce Solution', amount: '$800K', status: 'Active', returns: '+22%', date: '2024-01-05' }
        ],
        metrics: {
          totalInvested: '$3.8M',
          averageReturn: '+25.3%',
          successRate: '92%',
          portfolioGrowth: '+28%'
        },
        timelineEvents: [
          {
            id: 1,
            title: 'VC Partnership Established',
            description: 'Formal partnership agreement signed with Southeast Asia Ventures',
            date: '2023-03-01',
            type: 'Partnership',
            status: 'Completed',
            priority: 'Critical'
          },
          {
            id: 2,
            title: 'Investment Committee Review',
            description: 'Investment committee approved Series A funding strategy',
            date: '2023-04-15',
            type: 'Review',
            status: 'Completed',
            priority: 'High'
          },
          {
            id: 3,
            title: 'AI Health Tech Investment',
            description: 'Successfully closed $1M Series A investment in AI Health Tech',
            date: '2023-08-10',
            type: 'Investment',
            status: 'Completed',
            priority: 'Critical'
          },
          {
            id: 4,
            title: 'Board Meeting Scheduled',
            description: 'Scheduled board meeting for portfolio company review',
            date: '2023-11-20',
            type: 'Meeting',
            status: 'Scheduled',
            priority: 'Medium'
          },
          {
            id: 5,
            title: 'Exit Strategy Planning',
            description: 'Initiated exit strategy planning for mature investments',
            date: '2024-01-10',
            type: 'Strategy',
            status: 'In Progress',
            priority: 'High'
          }
        ]
      },
      '3': {
        id: '3',
        name: 'Michael Chen',
        title: 'Private Equity Investor',
        email: 'michael.chen@pe.com',
        phone: '+852 5 555 555',
        address: '321 Private Equity Road',
        city: 'Hong Kong',
        province: 'Hong Kong',
        country: 'Hong Kong',
        investorType: 'Private Equity',
        investmentExperience: 'Expert',
        preferredSectors: ['Manufacturing', 'Logistics', 'Real Estate', 'Technology'],
        investmentRange: '$5M - $50M',
        netWorth: '$50,000,000',
        annualIncome: '$2,000,000',
        liquidAssets: '$15,000,000',
        investmentPortfolio: '$25,000,000',
        occupation: 'PE Managing Director',
        company: 'Asia Pacific Capital',
        experience: '25+ years',
        riskTolerance: 'Moderate',
        investmentGoals: 'Growth-stage investments in established companies with strong fundamentals and expansion potential.',
        status: 'Active',
        rating: 4.7,
        reviews: 15,
        completedInvestments: 5,
        activeInvestments: 2,
        totalReturns: '+12.8%',
        documents: [
          { name: 'Investment Certificate', type: 'PDF', size: '2.8 MB', uploaded: '2024-01-25' },
          { name: 'Financial Statements', type: 'PDF', size: '4.1 MB', uploaded: '2024-01-22' },
          { name: 'Regulatory Compliance', type: 'PDF', size: '1.7 MB', uploaded: '2024-01-19' }
        ],
        investments: [
          { id: 1, company: 'Manufacturing Corp', amount: '$10M', status: 'Active', returns: '+15%', date: '2023-05-20' },
          { id: 2, company: 'Logistics Platform', amount: '$8M', status: 'Active', returns: '+8%', date: '2023-10-12' },
          { id: 3, company: 'Real Estate Fund', amount: '$15M', status: 'Pending', returns: 'N/A', date: '2024-01-15' }
        ],
        metrics: {
          totalInvested: '$33M',
          averageReturn: '+12.8%',
          successRate: '95%',
          portfolioGrowth: '+18%'
        },
        timelineEvents: [
          {
            id: 1,
            title: 'PE Fund Launch',
            description: 'Successfully launched Asia Pacific Capital PE Fund',
            date: '2023-01-10',
            type: 'Fund Launch',
            status: 'Completed',
            priority: 'Critical'
          },
          {
            id: 2,
            title: 'Manufacturing Corp Investment',
            description: 'Closed $10M growth investment in Manufacturing Corp',
            date: '2023-05-20',
            type: 'Investment',
            status: 'Completed',
            priority: 'Critical'
          },
          {
            id: 3,
            title: 'Operational Review',
            description: 'Conducted comprehensive operational review of portfolio companies',
            date: '2023-08-15',
            type: 'Review',
            status: 'Completed',
            priority: 'High'
          },
          {
            id: 4,
            title: 'Exit Negotiations',
            description: 'Initiated exit negotiations for Logistics Platform investment',
            date: '2023-12-01',
            type: 'Exit',
            status: 'In Progress',
            priority: 'High'
          },
          {
            id: 5,
            title: 'New Fund Planning',
            description: 'Started planning for Fund II launch in 2024',
            date: '2024-01-05',
            type: 'Planning',
            status: 'In Progress',
            priority: 'Medium'
          }
        ]
      }
    }

    return investors[id as keyof typeof investors] || investors['1']
  }

  const investor = getInvestorData(params.id as string)

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'portfolio', name: 'Portfolio', icon: PieChart },
    { id: 'investments', name: 'Investments', icon: DollarSign },
    { id: 'timeline', name: 'Timeline', icon: Calendar },
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
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <Building2 className="w-5 h-5 mr-3" />
                SMEs
              </Link>

              <Link
                href="/investors"
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg"
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
                href="/investors"
                className="flex items-center text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Investors
              </Link>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white">{investor.name}</h1>
                <p className="text-gray-400 mt-2">{investor.title} • {investor.investorType} • {investor.city}, {investor.country}</p>
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
                  onClick={() => router.push('/deals/create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Handshake className="w-4 h-4 mr-2" />
                  Create Deal
                </button>
              </div>
            </div>
          </div>

          {/* Status and Rating */}
          <div className="mb-8 flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${investor.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
              {investor.status}
            </span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(investor.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-400'
                    }`}
                />
              ))}
              <span className="text-gray-400 text-sm ml-2">
                {investor.rating} ({investor.reviews} reviews)
              </span>
            </div>
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
                          <span className="text-gray-400">Investor Type:</span>
                          <span className="text-white">{investor.investorType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Experience:</span>
                          <span className="text-white">{investor.investmentExperience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Investment Range:</span>
                          <span className="text-white">{investor.investmentRange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Risk Tolerance:</span>
                          <span className="text-white">{investor.riskTolerance}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Completed Investments:</span>
                          <span className="text-white">{investor.completedInvestments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Active Investments:</span>
                          <span className="text-white">{investor.activeInvestments}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-white">{investor.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-white">{investor.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-white">{investor.address}, {investor.city}, {investor.province}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-white">{investor.company}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Financial Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{investor.netWorth}</div>
                        <div className="text-sm text-gray-400">Net Worth</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{investor.annualIncome}</div>
                        <div className="text-sm text-gray-400">Annual Income</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{investor.liquidAssets}</div>
                        <div className="text-sm text-gray-400">Liquid Assets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{investor.investmentPortfolio}</div>
                        <div className="text-sm text-gray-400">Investment Portfolio</div>
                      </div>
                    </div>
                  </div>

                  {/* Investment Preferences */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Investment Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Preferred Sectors</h4>
                        <div className="flex flex-wrap gap-2">
                          {investor.preferredSectors.map((sector, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full"
                            >
                              {sector}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Investment Goals</h4>
                        <p className="text-gray-300">{investor.investmentGoals}</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Investment Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{investor.metrics.totalInvested}</div>
                        <div className="text-sm text-gray-400">Total Invested</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{investor.metrics.averageReturn}</div>
                        <div className="text-sm text-gray-400">Average Return</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{investor.metrics.successRate}</div>
                        <div className="text-sm text-gray-400">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{investor.metrics.portfolioGrowth}</div>
                        <div className="text-sm text-gray-400">Portfolio Growth</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Investment Portfolio</h3>
                    <button
                      onClick={() => setShowAddInvestmentModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Add Investment
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">Total Portfolio Value</h4>
                          <p className="text-gray-400">Current market value</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">$1,200,000</div>
                          <div className="text-sm text-green-400">+18.5%</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Initial Investment:</span>
                          <span className="text-white">$650,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Returns:</span>
                          <span className="text-green-400">$550,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">ROI:</span>
                          <span className="text-blue-400">84.6%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Portfolio Allocation</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Technology:</span>
                          <span className="text-white">45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fintech:</span>
                          <span className="text-white">30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">E-commerce:</span>
                          <span className="text-white">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Healthcare:</span>
                          <span className="text-white">10%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Risk Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Portfolio Beta:</span>
                          <span className="text-white">1.2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sharpe Ratio:</span>
                          <span className="text-green-400">1.8</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Drawdown:</span>
                          <span className="text-red-400">-8.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Volatility:</span>
                          <span className="text-yellow-400">12.3%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'investments' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Investment History</h3>
                    <button
                      onClick={() => router.push('/deals')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      View All Deals
                    </button>
                  </div>

                  <div className="space-y-4">
                    {investor.investments.map((investment) => (
                      <div key={investment.id} className="bg-gray-700 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{investment.company}</h4>
                            <p className="text-gray-400">Invested: {investment.amount} • Date: {investment.date}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${investment.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                              {investment.status}
                            </span>
                            <div className="text-lg font-bold text-green-400 mt-1">{investment.returns}</div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewInvestmentDetails(investment)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleViewPerformance(investment)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Performance
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Timeline Events</h3>
                    <button
                      onClick={() => setShowAddEventModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </button>
                  </div>

                  <div className="space-y-4">
                    {investor.timelineEvents.map((event) => (
                      <div key={event.id} className="bg-gray-700 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                event.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                {event.priority}
                              </span>
                            </div>
                            <p className="text-gray-300 mb-2">{event.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {event.date}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.type === 'Investment' ? 'bg-green-500/20 text-green-400' :
                                event.type === 'Legal' ? 'bg-purple-500/20 text-purple-400' :
                                  event.type === 'Due Diligence' ? 'bg-blue-500/20 text-blue-400' :
                                    event.type === 'Review' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-gray-500/20 text-gray-400'
                                }`}>
                                {event.type}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                event.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {event.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditTimelineEvent(event)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTimelineEvent(event)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Delete
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
                      onClick={() => setShowUploadDocumentModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Upload Document
                    </button>
                  </div>

                  <div className="space-y-4">
                    {investor.documents.map((doc, index) => (
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
                      <h3 className="text-lg font-semibold text-white mb-4">Investment Performance</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Return</span>
                          <span className="text-green-400">+18.5%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Annualized Return</span>
                          <span className="text-blue-400">+22.3%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Best Investment</span>
                          <span className="text-green-400">+45%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Worst Investment</span>
                          <span className="text-red-400">-12%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Investment Activity</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Deals Reviewed</span>
                          <span className="text-white">24</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Deals Invested</span>
                          <span className="text-blue-400">8</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Due Diligence Completed</span>
                          <span className="text-green-400">12</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Average Time to Decision</span>
                          <span className="text-yellow-400">18 days</span>
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
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Investor</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={editForm.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Province</label>
                  <input
                    type="text"
                    name="province"
                    value={editForm.province}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={editForm.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Investment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Investor Type</label>
                  <select
                    name="investorType"
                    value={editForm.investorType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Angel Investor">Angel Investor</option>
                    <option value="Venture Capital">Venture Capital</option>
                    <option value="Private Equity">Private Equity</option>
                    <option value="Institutional">Institutional</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Family Office">Family Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Investment Experience</label>
                  <select
                    name="investmentExperience"
                    value={editForm.investmentExperience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Experience</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Investment Range</label>
                  <input
                    type="text"
                    name="investmentRange"
                    value={editForm.investmentRange}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="$100K - $500K"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Risk Tolerance</label>
                  <select
                    name="riskTolerance"
                    value={editForm.riskTolerance}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Risk Tolerance</option>
                    <option value="Conservative">Conservative</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Aggressive">Aggressive</option>
                  </select>
                </div>
              </div>

              {/* Financial Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Net Worth</label>
                  <input
                    type="text"
                    name="netWorth"
                    value={editForm.netWorth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="$1,000,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Annual Income</label>
                  <input
                    type="text"
                    name="annualIncome"
                    value={editForm.annualIncome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="$200,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Liquid Assets</label>
                  <input
                    type="text"
                    name="liquidAssets"
                    value={editForm.liquidAssets}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="$500,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Investment Portfolio</label>
                  <input
                    type="text"
                    name="investmentPortfolio"
                    value={editForm.investmentPortfolio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="$800,000"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={editForm.occupation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={editForm.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={editForm.experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10+ years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Preferred Sectors */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Sectors</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Technology', 'Fintech', 'E-commerce', 'Healthcare', 'Manufacturing', 'Education', 'AI/ML', 'Real Estate', 'Logistics', 'Agriculture'].map((sector) => (
                    <label key={sector} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.preferredSectors.includes(sector)}
                        onChange={() => handleSectorToggle(sector)}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                      />
                      <span className="text-sm text-gray-300">{sector}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Investment Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Investment Goals</label>
                <textarea
                  name="investmentGoals"
                  value={editForm.investmentGoals}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe investment goals and preferences..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Investment Modal */}
      {showAddInvestmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Add New Investment</h3>
              <button
                onClick={() => setShowAddInvestmentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={addInvestmentForm.company}
                    onChange={handleAddInvestmentInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Investment Amount</label>
                  <input
                    type="text"
                    name="amount"
                    value={addInvestmentForm.amount}
                    onChange={handleAddInvestmentInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="$100,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sector</label>
                  <select
                    name="sector"
                    value={addInvestmentForm.sector}
                    onChange={handleAddInvestmentInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Sector</option>
                    <option value="Technology">Technology</option>
                    <option value="Fintech">Fintech</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
                  <select
                    name="stage"
                    value={addInvestmentForm.stage}
                    onChange={handleAddInvestmentInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Stage</option>
                    <option value="Pre-seed">Pre-seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Growth">Growth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Expected Return</label>
                  <input
                    type="text"
                    name="expectedReturn"
                    value={addInvestmentForm.expectedReturn}
                    onChange={handleAddInvestmentInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+25%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timeline</label>
                  <input
                    type="text"
                    name="timeline"
                    value={addInvestmentForm.timeline}
                    onChange={handleAddInvestmentInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3-5 years"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={addInvestmentForm.description}
                  onChange={handleAddInvestmentInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the investment opportunity..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddInvestmentModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInvestment}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add Investment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Investment Details Modal */}
      {showInvestmentDetailsModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Investment Details</h3>
              <button
                onClick={() => setShowInvestmentDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">{selectedInvestment.company}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Investment Amount:</span>
                    <div className="text-white font-semibold">{selectedInvestment.amount}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <div className="text-white font-semibold">{selectedInvestment.status}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Returns:</span>
                    <div className="text-green-400 font-semibold">{selectedInvestment.returns}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Investment Date:</span>
                    <div className="text-white font-semibold">{selectedInvestment.date}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Company Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Sector:</span>
                    <div className="text-white">Technology</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Stage:</span>
                    <div className="text-white">Series A</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Location:</span>
                    <div className="text-white">Phnom Penh, Cambodia</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Description:</span>
                    <div className="text-white">Innovative fintech solution for digital payments and financial inclusion.</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Investment Timeline</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Initial Investment:</span>
                    <span className="text-white">{selectedInvestment.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected Exit:</span>
                    <span className="text-white">2026-2028</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Valuation:</span>
                    <span className="text-green-400">$2.5M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target IRR:</span>
                    <span className="text-blue-400">25-35%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowInvestmentDetailsModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => router.push('/deals')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                View All Deals
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {showPerformanceModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Investment Performance</h3>
              <button
                onClick={() => setShowPerformanceModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">{selectedInvestment.company}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{selectedInvestment.returns}</div>
                    <div className="text-sm text-gray-400">Total Return</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">+18.5%</div>
                    <div className="text-sm text-gray-400">Annualized Return</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Initial Investment:</span>
                    <span className="text-white">{selectedInvestment.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Value:</span>
                    <span className="text-green-400">$250,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Unrealized Gain:</span>
                    <span className="text-green-400">$50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Invested:</span>
                    <span className="text-white">8 months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ROI:</span>
                    <span className="text-blue-400">25%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Performance Chart</h4>
                <div className="h-32 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Performance chart would be displayed here</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPerformanceModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => handleViewInvestmentDetails(selectedInvestment)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Upload Document</h3>
              <button
                onClick={() => setShowUploadDocumentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Document Type</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Document Type</option>
                  <option value="identification">Identification Document</option>
                  <option value="proof_of_funds">Proof of Funds</option>
                  <option value="professional_references">Professional References</option>
                  <option value="financial_statement">Financial Statement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Document Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload File</label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <div className="text-gray-400 mb-2">Click to upload or drag and drop</div>
                  <div className="text-sm text-gray-500">PDF, DOC, DOCX up to 10MB</div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowUploadDocumentModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDocument}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
