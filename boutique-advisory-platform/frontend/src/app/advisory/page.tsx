'use client'
import { API_URL } from '@/lib/api'

import { useState, useEffect } from 'react'
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
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  Star,
  Award,
  BookOpen
} from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'SME' | 'INVESTOR' | 'ADVISOR' | 'ADMIN'
  tenantId: string
}

export default function AdvisoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('services')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
          window.location.href = '/auth/login'
          return
        }

        const user = JSON.parse(userData)
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBookService = async (service: any) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/auth/login'
        return
      }

      const response = await fetch(`${API_URL}/api/advisory/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          advisorName: service.advisor,
          preferredDate: new Date().toISOString().split('T')[0],
          notes: `Booking request for ${service.name}`
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Booking successful:', result)
      } else {
        console.error('Booking failed')
      }
    } catch (error) {
      console.error('Error booking service:', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBookAdvisorSession = async (advisor: any) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/auth/login'
        return
      }

      const response = await fetch(`${API_URL}/api/advisory/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: 'advisor-session',
          serviceName: 'Advisor Consultation',
          advisorName: advisor.name,
          preferredDate: new Date().toISOString().split('T')[0],
          notes: `Booking session with ${advisor.name}`
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Advisor session booked successfully:', result)
      } else {
        console.error('Advisor session booking failed')
      }
    } catch (error) {
      console.error('Error booking advisor session:', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewAdvisorProfile = (advisor: any) => {
    // Navigate to advisor profile page or open modal
    console.log('Viewing advisor profile:', advisor.name)
    // In a real implementation, you would navigate to a detailed advisor profile page
  }

  // Mock Advisory Services data
  const services = [
    {
      id: 1,
      name: 'Business Strategy Consulting',
      category: 'Strategy',
      description: 'Comprehensive business strategy development and implementation',
      duration: '2-4 weeks',
      price: '$5,000 - $15,000',
      advisor: 'Dr. Sarah Johnson',
      rating: 4.8,
      reviews: 24,
      features: ['Market Analysis', 'Competitive Positioning', 'Growth Strategy', 'Implementation Plan']
    },
    {
      id: 2,
      name: 'Financial Planning & Analysis',
      category: 'Finance',
      description: 'Financial modeling, forecasting, and investment analysis',
      duration: '1-3 weeks',
      price: '$3,000 - $10,000',
      advisor: 'Michael Chen',
      rating: 4.9,
      reviews: 31,
      features: ['Financial Modeling', 'Cash Flow Analysis', 'Investment Planning', 'Risk Assessment']
    },
    {
      id: 3,
      name: 'Investment Due Diligence',
      category: 'Investment',
      description: 'Comprehensive due diligence for investment opportunities',
      duration: '3-6 weeks',
      price: '$8,000 - $25,000',
      advisor: 'Emily Rodriguez',
      rating: 4.7,
      reviews: 18,
      features: ['Market Research', 'Financial Analysis', 'Legal Review', 'Risk Assessment']
    },
    {
      id: 4,
      name: 'Digital Transformation',
      category: 'Technology',
      description: 'Technology strategy and digital transformation consulting',
      duration: '4-8 weeks',
      price: '$10,000 - $30,000',
      advisor: 'David Kim',
      rating: 4.6,
      reviews: 22,
      features: ['Technology Assessment', 'Digital Strategy', 'Implementation Roadmap', 'Change Management']
    }
  ]

  const advisors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      title: 'Senior Strategy Consultant',
      specialization: ['Business Strategy', 'Market Analysis', 'Growth Planning'],
      experience: '15+ years',
      education: 'PhD in Business Administration',
      rating: 4.8,
      reviews: 45,
      completedProjects: 127,
      availability: 'Available',
      hourlyRate: '$250'
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Financial Advisor',
      specialization: ['Financial Planning', 'Investment Analysis', 'Risk Management'],
      experience: '12+ years',
      education: 'MBA in Finance',
      rating: 4.9,
      reviews: 38,
      completedProjects: 89,
      availability: 'Available',
      hourlyRate: '$200'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      title: 'Investment Specialist',
      specialization: ['Due Diligence', 'Investment Strategy', 'Portfolio Management'],
      experience: '10+ years',
      education: 'CFA, MBA',
      rating: 4.7,
      reviews: 29,
      completedProjects: 67,
      availability: 'Limited',
      hourlyRate: '$300'
    }
  ]

  const tabs = [
    { id: 'services', name: 'Services', icon: BookOpen },
    { id: 'advisors', name: 'Advisors', icon: Users },
    { id: 'bookings', name: 'Bookings', icon: Calendar }
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
                href="/advisory"
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg"
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
            <h1 className="text-3xl font-bold text-white">Advisory Services</h1>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Book Consultation
            </button>
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
            </div>

            <div className="p-6">
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div className="flex space-x-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search services..."
                          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service) => (
                      <div key={service.id} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                            <p className="text-gray-400 text-sm">{service.category}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                            {service.category}
                          </span>
                        </div>

                        <p className="text-gray-300 text-sm mb-4">{service.description}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-white">{service.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Price:</span>
                            <span className="text-white font-semibold">{service.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Advisor:</span>
                            <span className="text-white">{service.advisor}</span>
                          </div>
                        </div>

                        <div className="flex items-center mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(service.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-400'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-400 text-sm ml-2">
                            {service.rating} ({service.reviews} reviews)
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Features:</h4>
                          <div className="flex flex-wrap gap-2">
                            {service.features.map((feature, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBookService(service)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Book Now
                          </button>
                          <button
                            onClick={() => alert(`Viewing details for: ${service.name}`)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'advisors' && (
                <div className="space-y-6">
                  <div className="flex space-x-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search advisors..."
                          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {advisors.map((advisor) => (
                      <div key={advisor.id} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{advisor.name}</h3>
                            <p className="text-gray-400 text-sm">{advisor.title}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${advisor.availability === 'Available'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {advisor.availability}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Experience:</span>
                            <span className="text-white">{advisor.experience}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Education:</span>
                            <span className="text-white text-sm">{advisor.education}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Hourly Rate:</span>
                            <span className="text-white font-semibold">{advisor.hourlyRate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Projects:</span>
                            <span className="text-white">{advisor.completedProjects}</span>
                          </div>
                        </div>

                        <div className="flex items-center mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(advisor.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-400'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-400 text-sm ml-2">
                            {advisor.rating} ({advisor.reviews} reviews)
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Specializations:</h4>
                          <div className="flex flex-wrap gap-2">
                            {advisor.specialization.map((spec, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBookAdvisorSession(advisor)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Book Session
                          </button>
                          <button
                            onClick={() => handleViewAdvisorProfile(advisor)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Your Bookings</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-600 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Business Strategy Consultation</h3>
                          <p className="text-gray-400 text-sm">Dr. Sarah Johnson</p>
                          <p className="text-gray-400 text-sm">March 15, 2024 at 2:00 PM</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                            Scheduled
                          </span>
                          <button
                            onClick={() => alert('Joining meeting: Business Strategy Consultation')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Join Meeting
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-600 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Financial Planning Session</h3>
                          <p className="text-gray-400 text-sm">Michael Chen</p>
                          <p className="text-gray-400 text-sm">March 20, 2024 at 10:00 AM</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                            Confirmed
                          </span>
                          <button
                            onClick={() => alert('Rescheduling: Financial Planning Session')}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Reschedule
                          </button>
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
    </div>
  )
}
