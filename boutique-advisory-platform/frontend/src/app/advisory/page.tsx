'use client'
import { API_URL } from '@/lib/api'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import StripePaymentModal from '@/components/advisory/StripePaymentModal'
import ServiceDetailsModal from '@/components/advisory/ServiceDetailsModal'

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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('services')
  const [advisoryServices, setAdvisoryServices] = useState<any[]>([])

  const [availableAdvisors, setAvailableAdvisors] = useState<any[]>([])
  const [myBookings, setMyBookings] = useState<any[]>([])
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [pendingBookingData, setPendingBookingData] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<any>(null)

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

  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true)
      try {
        const token = localStorage.getItem('token')
        const [servicesRes, advisorsRes, bookingsRes] = await Promise.all([
          fetch(`${API_URL}/api/advisory/services`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/api/advisory/advisors`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/api/advisory/my-bookings`, { headers: { 'Authorization': `Bearer ${token}` } })
        ])

        if (servicesRes.ok) setAdvisoryServices(await servicesRes.json())
        if (advisorsRes.ok) setAvailableAdvisors(await advisorsRes.json())
        if (bookingsRes.ok) setMyBookings(await bookingsRes.json())
      } catch (error) {
        console.error('Error fetching advisory data:', error)
      } finally {
        setIsDataLoading(false)
      }
    }

    if (user) fetchData()
  }, [user])

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

      // Step 1: Create Payment Intent
      const amount = typeof service.price === 'string'
        ? parseFloat(service.price.replace(/[^0-9.]/g, '')) || 0
        : service.price || 0;

      const paymentRes = await fetch(`${API_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, serviceId: service.id })
      })

      if (paymentRes.ok) {
        const { clientSecret } = await paymentRes.json()
        setPaymentClientSecret(clientSecret)
        setPaymentAmount(amount)
        setPendingBookingData({
          serviceId: service.id,
          serviceName: service.name,
          advisorName: service.advisor,
          preferredDate: new Date().toISOString().split('T')[0],
          notes: `Booking request for ${service.name}`
        })
        setShowPaymentModal(true)
      }
    } catch (error) {
      console.error('Error starting booking process:', error)
    }
  }

  const handleBookingSuccess = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/advisory/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...pendingBookingData,
          amount: paymentAmount
        })
      })

      if (response.ok) {
        alert('Booking and Payment Successful!')
        setShowPaymentModal(false)
        setPaymentClientSecret(null)
      }
    } catch (error) {
      console.error('Error finalizing booking:', error)
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

      const amount = typeof advisor.hourlyRate === 'string'
        ? parseFloat(advisor.hourlyRate.replace(/[^0-9.]/g, '')) || 250
        : 250;

      const paymentRes = await fetch(`${API_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, advisorId: advisor.id })
      })

      if (paymentRes.ok) {
        const { clientSecret } = await paymentRes.json()
        setPaymentClientSecret(clientSecret)
        setPaymentAmount(amount)
        setPendingBookingData({
          serviceId: 'advisor-session',
          serviceName: 'Advisor Consultation',
          advisorName: advisor.name,
          preferredDate: new Date().toISOString().split('T')[0],
          notes: `Booking session with ${advisor.name}`
        })
        setShowPaymentModal(true)
      }
    } catch (error) {
      console.error('Error starting session booking:', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewAdvisorProfile = (advisor: any) => {
    router.push(`/advisory/advisor/${advisor.id}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewDetails = async (service: any) => {
    try {
      const token = localStorage.getItem('token')
      // Optimistically set the selected service with available data
      setSelectedService(service)

      // Fetch full details
      if (token) {
        const res = await fetch(`${API_URL}/api/advisory/services/${service.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const fullService = await res.json()
          setSelectedService(fullService)
        }
      }
    } catch (error) {
      console.error('Error fetching service details:', error)
    }
  }

  const servicesToDisplay = advisoryServices.length > 0 ? advisoryServices : [
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
    }
  ]

  const advisorsToDisplay = availableAdvisors.length > 0 ? availableAdvisors : [
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
            <button
              onClick={() => setActiveTab('services')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
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
                    {servicesToDisplay.map((service) => (
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


                        {service.features && service.features.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Features:</h4>
                            <div className="flex flex-wrap gap-2">
                              {service.features.map((feature: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBookService(service)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Book Now
                          </button>
                          <button
                            onClick={() => handleViewDetails(service)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center transition-colors"
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
                    {advisorsToDisplay.map((advisor) => (
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


                        {advisor.specialization && advisor.specialization.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Specializations:</h4>
                            <div className="flex flex-wrap gap-2">
                              {advisor.specialization.map((spec: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

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
                      {myBookings.length > 0 ? (
                        myBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-600 rounded-lg">
                            <div>
                              <h3 className="text-white font-medium">
                                {booking.service?.name || 'Advisory Session'}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {booking.advisor?.user?.firstName ? `${booking.advisor.user.firstName} ${booking.advisor.user.lastName}` : (booking.advisor?.name || 'Advisor')}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {new Date(booking.preferredDate).toLocaleDateString()}
                              </p>
                              {booking.notes && <p className="text-gray-500 text-xs mt-1 truncate max-w-xs">{booking.notes}</p>}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                                booking.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                {booking.status}
                              </span>
                              {booking.status === 'CONFIRMED' && (
                                <button
                                  onClick={() => alert(`Join Link: ${booking.meetingLink || '#'}`)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                                >
                                  Join
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <p>No bookings found.</p>
                          <button onClick={() => setActiveTab('services')} className="text-blue-400 hover:underline mt-2">Book a service</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {showPaymentModal && paymentClientSecret && (
        <StripePaymentModal
          amount={paymentAmount}
          clientSecret={paymentClientSecret}
          onSuccess={handleBookingSuccess}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}

      {selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onBook={() => {
            setSelectedService(null)
            handleBookService(selectedService)
          }}
        />
      )}
    </div>
  )
}
