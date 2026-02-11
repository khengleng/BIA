'use client'
import { API_URL } from '@/lib/api'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText as DocumentIcon,
  X,
  MapPin,
  User,
  Sparkles as SparklesIcon,
  ClipboardCheck,
  Wallet
} from 'lucide-react'
import DueDiligenceChecklist from '@/components/DueDiligenceChecklist'
import DealFunding from '@/components/DealFunding'
import DealAnalysis from '@/components/DealAnalysis'
import DataroomChat from '@/components/DataroomChat'
import TemplateGenerator from '@/components/TemplateGenerator'
import FileDisputeModal from '@/components/FileDisputeModal'
import { ShieldAlert } from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'SME' | 'INVESTOR' | 'ADVISOR' | 'ADMIN'
  tenantId: string
}

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showAddTimelineModal, setShowAddTimelineModal] = useState(false)
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false)
  const [showAddActivityModal, setShowAddActivityModal] = useState(false)
  const [showAiChat, setShowAiChat] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    amount: '',
    equity: '',
    stage: '',
    status: '',
    progress: 0,
    startDate: '',
    expectedCloseDate: '',
    location: '',
    sector: '',
    industry: '',
    dealType: '',
    valuation: '',
    expectedROI: '',
    dueDiligenceScore: '',
    marketSize: '',
    riskAssessment: '',
    competitiveAdvantage: ''
  })
  const [statusForm, setStatusForm] = useState({
    status: '',
    stage: '',
    progress: 0,
    notes: ''
  })
  const [addTimelineForm, setAddTimelineForm] = useState({
    event: '',
    date: '',
    status: '',
    description: ''
  })
  const [addActivityForm, setAddActivityForm] = useState({
    type: '',
    title: '',
    date: '',
    status: '',
    description: ''
  })
  const [uploadDocumentForm, setUploadDocumentForm] = useState({
    documentType: '',
    documentName: '',
    file: null as File | null
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

  useEffect(() => {
    if (!isLoading && user && searchParams.get('edit') === 'true') {
      handleEdit()
    }
  }, [isLoading, user, searchParams])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleEdit = () => {
    setEditForm({
      title: deal.title,
      description: deal.description,
      amount: deal.amount,
      equity: deal.equity,
      stage: deal.stage,
      status: deal.status,
      progress: deal.progress,
      startDate: deal.startDate,
      expectedCloseDate: deal.expectedCloseDate,
      location: deal.location,
      sector: deal.sector,
      industry: deal.industry,
      dealType: deal.dealType,
      valuation: deal.valuation,
      expectedROI: deal.metrics?.expectedROI || '',
      dueDiligenceScore: deal.metrics?.dueDiligenceScore || '',
      marketSize: deal.metrics?.marketSize || '',
      riskAssessment: deal.metrics?.riskAssessment || '',
      competitiveAdvantage: deal.metrics?.competitiveAdvantage || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateStatus = () => {
    setStatusForm({
      status: deal.status,
      stage: deal.stage,
      progress: deal.progress,
      notes: ''
    })
    setShowStatusModal(true)
  }

  const handleSaveEdit = () => {
    // Here you would typically make an API call to update the deal
    // For now, we'll just update the local data and close the modal
    Object.assign(deal, editForm)
    setShowEditModal(false)

    // Reset the form
    setEditForm({
      title: '',
      description: '',
      amount: '',
      equity: '',
      stage: '',
      status: '',
      progress: 0,
      startDate: '',
      expectedCloseDate: '',
      location: '',
      sector: '',
      industry: '',
      dealType: '',
      valuation: '',
      expectedROI: '',
      dueDiligenceScore: '',
      marketSize: '',
      riskAssessment: '',
      competitiveAdvantage: ''
    })
  }

  const handleSaveStatus = () => {
    // Here you would typically make an API call to update the deal status
    // For now, we'll just update the local data and close the modal
    Object.assign(deal, statusForm)
    setShowStatusModal(false)

    // Reset the form
    setStatusForm({
      status: '',
      stage: '',
      progress: 0,
      notes: ''
    })
  }

  const handleAddTimeline = () => {
    // Here you would typically make an API call to add timeline event
    // For now, we'll just add to the local timeline and close the modal
    const newEvent = {
      date: addTimelineForm.date,
      event: addTimelineForm.event,
      status: addTimelineForm.status
    }
    deal.timeline.push(newEvent)
    setShowAddTimelineModal(false)
    setAddTimelineForm({
      event: '',
      date: '',
      status: '',
      description: ''
    })
  }

  const handleUploadDocument = async () => {
    try {
      if (!uploadDocumentForm.documentName || !uploadDocumentForm.documentType || !uploadDocumentForm.file) {
        console.error('Missing required fields for document upload')
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token')
        return
      }

      const formData = new FormData()
      formData.append('name', uploadDocumentForm.documentName)
      formData.append('type', uploadDocumentForm.documentType)
      formData.append('dealId', params.id as string)
      formData.append('file', uploadDocumentForm.file)

      const response = await fetch(`${API_URL}/api/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Document uploaded successfully:', result)
        // Refresh the deal data to show the new document
        // In a real implementation, you would refetch the deal data
      } else {
        console.error('Document upload failed')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
    }

    setShowUploadDocumentModal(false)
    setUploadDocumentForm({
      documentType: '',
      documentName: '',
      file: null
    })
  }

  const handleAddActivity = () => {
    // Here you would typically make an API call to add activity
    // For now, we'll just add to the local activities and close the modal
    const newActivity = {
      id: deal.activities.length + 1,
      type: addActivityForm.type,
      title: addActivityForm.title,
      date: addActivityForm.date,
      status: addActivityForm.status
    }
    deal.activities.push(newActivity)
    setShowAddActivityModal(false)
    setAddActivityForm({
      type: '',
      title: '',
      date: '',
      status: '',
      description: ''
    })
  }

  const handleViewDocument = (docName: string) => {
    // Here you would typically open the document in a new tab or modal
    // For now, we'll simulate opening a PDF viewer
    window.open(`/api/documents/${docName}`, '_blank')
  }

  const handleDownloadDocument = (docName: string) => {
    // Here you would typically trigger a download
    // For now, we'll simulate downloading
    const link = document.createElement('a')
    link.href = `/api/documents/${docName}/download`
    link.download = docName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value) || 0 : value
    }))
  }

  const handleStatusInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setStatusForm(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value) || 0 : value
    }))
  }

  const handleTimelineInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAddTimelineForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleActivityInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAddActivityForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUploadDocumentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUploadDocumentForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setUploadDocumentForm(prev => ({
      ...prev,
      file
    }))
  }

  // Mock Deal data
  const deal = {
    id: params.id,
    title: 'Series A Funding Round',
    description: 'Strategic investment in innovative fintech solution for digital payments and financial inclusion in Cambodia.',
    sme: {
      name: 'Tech Startup A',
      id: '1',
      sector: 'Technology',
      stage: 'Series A',
      location: 'Phnom Penh, Cambodia'
    },
    investor: {
      name: 'John Smith',
      id: '1',
      type: 'Angel Investor',
      location: 'Phnom Penh, Cambodia'
    },
    amount: '$500,000',
    equity: '15%',
    stage: 'Due Diligence',
    status: 'Active',
    progress: 75,
    startDate: '2024-01-15',
    expectedCloseDate: '2024-03-15',
    actualCloseDate: null,
    location: 'Phnom Penh, Cambodia',
    sector: 'Technology',
    industry: 'Fintech',
    dealType: 'Equity Investment',
    valuation: '$3,333,333',
    documents: [
      { name: 'Term Sheet', type: 'PDF', size: '1.5 MB', uploaded: '2024-01-20', status: 'Signed' },
      { name: 'Due Diligence Report', type: 'PDF', size: '2.8 MB', uploaded: '2024-02-01', status: 'In Review' },
      { name: 'Financial Model', type: 'XLSX', size: '0.8 MB', uploaded: '2024-01-25', status: 'Approved' },
      { name: 'Legal Documents', type: 'PDF', size: '3.2 MB', uploaded: '2024-02-10', status: 'Pending' }
    ],
    timeline: [
      { date: '2024-01-15', event: 'Deal Initiated', status: 'Completed' },
      { date: '2024-01-20', event: 'Term Sheet Signed', status: 'Completed' },
      { date: '2024-02-01', event: 'Due Diligence Started', status: 'Completed' },
      { date: '2024-02-15', event: 'Due Diligence Review', status: 'In Progress' },
      { date: '2024-03-01', event: 'Legal Documentation', status: 'Pending' },
      { date: '2024-03-15', event: 'Deal Close', status: 'Pending' }
    ],
    metrics: {
      timeToClose: '60 days',
      dueDiligenceScore: '85%',
      riskAssessment: 'Medium',
      expectedROI: '25%',
      marketSize: '$2.5B',
      competitiveAdvantage: 'High'
    },
    activities: [
      { id: 1, type: 'Meeting', title: 'Initial Pitch Meeting', date: '2024-01-15', status: 'Completed' },
      { id: 2, type: 'Document', title: 'Term Sheet Review', date: '2024-01-18', status: 'Completed' },
      { id: 3, type: 'Meeting', title: 'Due Diligence Kickoff', date: '2024-02-01', status: 'Completed' },
      { id: 4, type: 'Review', title: 'Financial Model Analysis', date: '2024-02-10', status: 'In Progress' },
      { id: 5, type: 'Meeting', title: 'Legal Structure Discussion', date: '2024-02-20', status: 'Scheduled' }
    ]
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'timeline', name: 'Timeline', icon: Clock },
    { id: 'documents', name: 'Documents', icon: DocumentIcon },
    { id: 'due-diligence', name: 'Due Diligence', icon: ClipboardCheck },
    { id: 'funding', name: 'Funding', icon: Wallet },
    { id: 'activities', name: 'Activities', icon: Calendar },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 text-green-400'
      case 'In Progress': return 'bg-blue-500/20 text-blue-400'
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'Signed': return 'bg-green-500/20 text-green-400'
      case 'In Review': return 'bg-blue-500/20 text-blue-400'
      case 'Approved': return 'bg-green-500/20 text-green-400'
      default: return 'bg-gray-500/20 text-gray-400'
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
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <Users className="w-5 h-5 mr-3" />
                Investors
              </Link>

              <Link
                href="/deals"
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg"
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
                href="/deals"
                className="flex items-center text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deals
              </Link>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white">{deal.title}</h1>
                <p className="text-gray-400 mt-2">{deal.sme.name} ↔ {deal.investor.name} • {deal.location}</p>
              </div>
              <div className="flex space-x-3">
                {/* Edit and Update Status buttons - only for ADMIN and ADVISOR */}
                {(user?.role === 'ADMIN' || user?.role === 'ADVISOR') && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={handleUpdateStatus}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Status
                    </button>
                  </>
                )}

                {/* File Dispute button - for SME and INVESTOR */}
                {(user?.role === 'SME' || user?.role === 'INVESTOR') && (
                  <button
                    onClick={() => setShowDisputeModal(true)}
                    className="bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 px-4 py-2 rounded-lg flex items-center transition-all"
                  >
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    File Dispute
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status and Progress */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${deal.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                {deal.status}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{deal.stage}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{deal.progress}% Complete</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${deal.progress}%` }}
              ></div>
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
                  {/* Deal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Deal Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount:</span>
                          <span className="text-white font-semibold">{deal.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Equity:</span>
                          <span className="text-white">{deal.equity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Valuation:</span>
                          <span className="text-white">{deal.valuation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Deal Type:</span>
                          <span className="text-white">{deal.dealType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sector:</span>
                          <span className="text-white">{deal.sector}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Industry:</span>
                          <span className="text-white">{deal.industry}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Start Date:</span>
                          <span className="text-white">{deal.startDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expected Close:</span>
                          <span className="text-white">{deal.expectedCloseDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Actual Close:</span>
                          <span className="text-gray-400">{deal.actualCloseDate || 'Pending'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time to Close:</span>
                          <span className="text-white">{deal.metrics.timeToClose}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parties Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">SME (Company)</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Name:</span>
                          <Link href={`/smes/${deal.sme.id}`} className="text-blue-400 hover:text-blue-300">
                            {deal.sme.name}
                          </Link>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sector:</span>
                          <span className="text-white">{deal.sme.sector}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Stage:</span>
                          <span className="text-white">{deal.sme.stage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Location:</span>
                          <span className="text-white">{deal.sme.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Investor</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Name:</span>
                          <Link href={`/investors/${deal.investor.id}`} className="text-blue-400 hover:text-blue-300">
                            {deal.investor.name}
                          </Link>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white">{deal.investor.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Location:</span>
                          <span className="text-white">{deal.investor.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deal Description */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Deal Description</h3>
                    <p className="text-gray-300">{deal.description}</p>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{deal.metrics.expectedROI}</div>
                        <div className="text-sm text-gray-400">Expected ROI</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{deal.metrics.dueDiligenceScore}</div>
                        <div className="text-sm text-gray-400">Due Diligence Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{deal.metrics.marketSize}</div>
                        <div className="text-sm text-gray-400">Market Size</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Integration */}
                  <div className="mt-8">
                    <DealAnalysis dealId={params.id as string} />
                  </div>
                </div>
              )}

              {activeTab === 'due-diligence' && (
                <DueDiligenceChecklist
                  dealId={params.id as string}
                  userRole={user?.role}
                />
              )}

              {activeTab === 'funding' && (
                <DealFunding
                  dealId={params.id as string}
                  userRole={user?.role}
                />
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Deal Timeline</h3>
                    <button
                      onClick={() => setShowAddTimelineModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Add Event
                    </button>
                  </div>

                  <div className="space-y-4">
                    {deal.timeline.map((event, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${event.status === 'Completed' ? 'bg-green-400' :
                              event.status === 'In Progress' ? 'bg-blue-400' : 'bg-yellow-400'
                              }`}></div>
                            <div>
                              <h4 className="text-white font-medium">{event.event}</h4>
                              <p className="text-gray-400 text-sm">{event.date}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  {/* Digital Document Foundation */}
                  <div className="mb-8">
                    <TemplateGenerator />
                  </div>

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
                    {deal.documents.map((doc, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <DocumentIcon className="w-8 h-8 text-blue-400" />
                          <div>
                            <h4 className="text-white font-medium">{doc.name}</h4>
                            <p className="text-gray-400 text-sm">{doc.type} • {doc.size} • Uploaded {doc.uploaded}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
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

              {activeTab === 'activities' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
                    <button
                      onClick={() => setShowAddActivityModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Add Activity
                    </button>
                  </div>

                  <div className="space-y-4">
                    {deal.activities.map((activity) => (
                      <div key={activity.id} className="bg-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${activity.type === 'Meeting' ? 'bg-blue-500/20' :
                              activity.type === 'Document' ? 'bg-green-500/20' :
                                'bg-yellow-500/20'
                              }`}>
                              {activity.type === 'Meeting' ? <Calendar className="w-4 h-4 text-blue-400" /> :
                                activity.type === 'Document' ? <DocumentIcon className="w-4 h-4 text-green-400" /> :
                                  <Eye className="w-4 h-4 text-yellow-400" />}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{activity.title}</h4>
                              <p className="text-gray-400 text-sm">{activity.date}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
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
                      <h3 className="text-lg font-semibold text-white mb-4">Deal Performance</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Progress vs Timeline</span>
                          <span className="text-green-400">On Track</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Risk Level</span>
                          <span className={`${deal.metrics?.riskAssessment === 'High' ? 'text-red-400' : deal.metrics?.riskAssessment === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                            {deal.metrics?.riskAssessment || 'Low'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Due Diligence Score</span>
                          <span className="text-blue-400">{deal.metrics?.dueDiligenceScore || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Expected ROI</span>
                          <span className="text-green-400">{deal.metrics?.expectedROI || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Market Analysis</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Market Size</span>
                          <span className="text-white">{deal.metrics?.marketSize || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Competitive Advantage</span>
                          <span className="text-green-400">{deal.metrics?.competitiveAdvantage || 'N/A'}</span>
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

      {/* Edit Deal Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Deal</h3>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deal Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <input
                    type="text"
                    name="amount"
                    value={editForm.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="$500,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Equity</label>
                  <input
                    type="text"
                    name="equity"
                    value={editForm.equity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Valuation</label>
                  <input
                    type="text"
                    name="valuation"
                    value={editForm.valuation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="$3,333,333"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
                  <select
                    name="stage"
                    value={editForm.stage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Stage</option>
                    <option value="Initial Contact">Initial Contact</option>
                    <option value="Term Sheet">Term Sheet</option>
                    <option value="Due Diligence">Due Diligence</option>
                    <option value="Legal Documentation">Legal Documentation</option>
                    <option value="Closing">Closing</option>
                    <option value="Completed">Completed</option>
                  </select>
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
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Progress (%)</label>
                  <input
                    type="number"
                    name="progress"
                    value={editForm.progress}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deal Type</label>
                  <select
                    name="dealType"
                    value={editForm.dealType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Deal Type</option>
                    <option value="Equity Investment">Equity Investment</option>
                    <option value="Debt Financing">Debt Financing</option>
                    <option value="Convertible Note">Convertible Note</option>
                    <option value="SAFE">SAFE</option>
                    <option value="Merger">Merger</option>
                    <option value="Acquisition">Acquisition</option>
                  </select>
                </div>
              </div>

              {/* Dates and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={editForm.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Expected Close Date</label>
                  <input
                    type="date"
                    name="expectedCloseDate"
                    value={editForm.expectedCloseDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sector</label>
                  <input
                    type="text"
                    name="sector"
                    value={editForm.sector}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={editForm.industry}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Fintech"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the deal..."
                />
              </div>

              {/* Advisor Insights: Metrics & Performance */}
              {(user?.role === 'ADMIN' || user?.role === 'ADVISOR') && (
                <div className="mt-8 pt-8 border-t border-gray-700">
                  <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Advisor Insights (Performance Metrics)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Expected ROI</label>
                      <input
                        type="text"
                        name="expectedROI"
                        value={editForm.expectedROI}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="25%"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Due Diligence Score</label>
                      <input
                        type="text"
                        name="dueDiligenceScore"
                        value={editForm.dueDiligenceScore}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8.5/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Market Size</label>
                      <input
                        type="text"
                        name="marketSize"
                        value={editForm.marketSize}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="$2.5B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Risk Assessment</label>
                      <select
                        name="riskAssessment"
                        value={editForm.riskAssessment}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Risk</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Competitive Advantage</label>
                      <select
                        name="competitiveAdvantage"
                        value={editForm.competitiveAdvantage}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Advantage</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
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

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Update Deal Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={statusForm.status}
                  onChange={handleStatusInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
                <select
                  name="stage"
                  value={statusForm.stage}
                  onChange={handleStatusInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Stage</option>
                  <option value="Initial Contact">Initial Contact</option>
                  <option value="Term Sheet">Term Sheet</option>
                  <option value="Due Diligence">Due Diligence</option>
                  <option value="Legal Documentation">Legal Documentation</option>
                  <option value="Closing">Closing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Progress (%)</label>
                <input
                  type="number"
                  name="progress"
                  value={statusForm.progress}
                  onChange={handleStatusInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={statusForm.notes}
                  onChange={handleStatusInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about the status update..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Timeline Event Modal */}
      {showAddTimelineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Add Timeline Event</h3>
              <button
                onClick={() => setShowAddTimelineModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
                <input
                  type="text"
                  name="event"
                  value={addTimelineForm.event}
                  onChange={handleTimelineInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={addTimelineForm.date}
                  onChange={handleTimelineInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={addTimelineForm.status}
                  onChange={handleTimelineInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={addTimelineForm.description}
                  onChange={handleTimelineInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the event..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddTimelineModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTimeline}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add Event
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
                <select
                  name="documentType"
                  value={uploadDocumentForm.documentType}
                  onChange={handleUploadDocumentInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Document Type</option>
                  <option value="term_sheet">Term Sheet</option>
                  <option value="due_diligence">Due Diligence Report</option>
                  <option value="financial_model">Financial Model</option>
                  <option value="legal_documents">Legal Documents</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Document Name</label>
                <input
                  type="text"
                  name="documentName"
                  value={uploadDocumentForm.documentName}
                  onChange={handleUploadDocumentInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload File</label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <div className="text-gray-400 mb-2">Click to upload or drag and drop</div>
                  <div className="text-sm text-gray-500">PDF, DOC, DOCX, XLSX up to 10MB</div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xlsx"
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

      {/* Add Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Add Activity</h3>
              <button
                onClick={() => setShowAddActivityModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Activity Type</label>
                <select
                  name="type"
                  value={addActivityForm.type}
                  onChange={handleActivityInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Document">Document</option>
                  <option value="Review">Review</option>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Activity Title</label>
                <input
                  type="text"
                  name="title"
                  value={addActivityForm.title}
                  onChange={handleActivityInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter activity title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={addActivityForm.date}
                  onChange={handleActivityInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={addActivityForm.status}
                  onChange={handleActivityInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={addActivityForm.description}
                  onChange={handleActivityInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the activity..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddActivityModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddActivity}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating AI Assistant Toggle */}
      <div className="fixed bottom-8 right-8 z-50">
        {!showAiChat ? (
          <button
            onClick={() => setShowAiChat(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl shadow-blue-900/40 border border-blue-400/30 flex items-center gap-2 group transition-all"
          >
            <SparklesIcon className="w-6 h-6 animate-pulse" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">
              Ask Dataroom AI
            </span>
          </button>
        ) : (
          <div className="w-96 animate-in slide-in-from-bottom-8 duration-300">
            <DataroomChat dealId={params.id as string} onClose={() => setShowAiChat(false)} />
          </div>
        )}
      </div>

      {showDisputeModal && (
        <FileDisputeModal
          dealId={params.id as string}
          dealTitle={deal.title}
          onClose={() => setShowDisputeModal(false)}
          onSuccess={() => { }}
        />
      )}
    </div>
  )
}

