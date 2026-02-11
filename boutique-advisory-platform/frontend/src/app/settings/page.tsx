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
  User,
  Shield,
  Bell as BellIcon,
  Globe,
  Save
} from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'SME' | 'INVESTOR' | 'ADVISOR' | 'ADMIN'
  tenantId: string
  twoFactorEnabled?: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 2FA State
  const [is2faEnabled, setIs2faEnabled] = useState(false)
  const [show2faModal, setShow2faModal] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false)

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (newPassword.length < 12) {
      alert('Password must be at least 12 characters long')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        alert(data.error || 'Failed to update password')
      }
    } catch (error) {
      console.error('Error updating password:', error)
      alert('An error occurred while updating password')
    }
  }

  const handleEnable2FA = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (response.ok) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setShow2faModal(true)
      } else {
        alert(data.error || 'Failed to start 2FA setup')
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error)
    }
  }

  const handleVerify2FA = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/auth/2fa/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: verificationCode, secret })
      })

      const data = await response.json()

      if (response.ok) {
        setIs2faEnabled(true)
        setShow2faModal(false)
        setVerificationCode('')

        if (data.backupCodes) {
          setBackupCodes(data.backupCodes)
          setShowBackupCodesModal(true)
        } else {
          alert('Two-Factor Authentication Enabled Successfully!')
        }

        // Update local user object
        if (user) {
          const updatedUser = { ...user, twoFactorEnabled: true }
          setUser(updatedUser)
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      } else {
        alert(data.error || 'Invalid code')
      }
    } catch (error) {
      console.error('Error activating 2FA:', error)
    }
  }

  const handleDisable2FA = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: disablePassword })
      })

      if (response.ok) {
        setIs2faEnabled(false)
        setShowDisableModal(false)
        setDisablePassword('')
        alert('Two-Factor Authentication Disabled')

        // Update local user object
        if (user) {
          const updatedUser = { ...user, twoFactorEnabled: false }
          setUser(updatedUser)
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }

      } else {
        const data = await response.json()
        alert(data.error || 'Failed to disable 2FA')
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      return
    }

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Show success message
        alert('Your account has been successfully deleted.')

        // Clear local storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // Build URL relative to window location if possible, or just redirect
        window.location.href = '/'
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete account')
        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('An error occurred while deleting your account')
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    // Get user data from localStorage
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
          window.location.href = '/auth/login'
          return
        }

        // Parse user data from localStorage
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Fetch fresh status including 2FA
        const meResponse = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (meResponse.ok) {
          const meData = await meResponse.json()
          if (meData.user?.twoFactorEnabled !== undefined) {
            setIs2faEnabled(meData.user.twoFactorEnabled)
          } else {
            setIs2faEnabled(!!parsedUser.twoFactorEnabled)
          }
        } else {
          setIs2faEnabled(!!parsedUser.twoFactorEnabled)
        }

      } catch (error) {
        console.error('Error fetching user:', error)
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

  const handleSaveProfile = async () => {
    // Placeholder for profile save
    alert('Profile update placeholder')
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'preferences', name: 'Preferences', icon: Globe }
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
                href="/reports"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <FileText className="w-5 h-5 mr-3" />
                Reports
              </Link>

              <Link
                href="/settings"
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </div>
          </nav>

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-2">Manage your account settings and preferences</p>
          </div>

          <div className="bg-gray-800 rounded-lg">
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
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                      <input
                        type="text"
                        defaultValue={user?.firstName}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                      <input
                        type="text"
                        defaultValue={user?.lastName}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                      <input
                        type="text"
                        defaultValue={user?.role}
                        disabled
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveProfile()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Security Settings</h2>

                  {/* Password Section */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={handleUpdatePassword}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* 2FA Section */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      Two-Factor Authentication (2FA)
                    </h3>

                    {is2faEnabled ? (
                      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-full">
                            <Shield className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">2FA is Enabled</p>
                            <p className="text-sm text-gray-400">Your account is secured with an authenticator app.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowDisableModal(true)}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors"
                        >
                          Disable
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-700/30 p-4 rounded-lg">
                        <div>
                          <p className="text-gray-300">Protect your account with an extra layer of security.</p>
                          <p className="text-sm text-gray-500">Require a code from your mobile device to sign in.</p>
                        </div>
                        <button
                          onClick={handleEnable2FA}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Enable 2FA
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Danger Zone - Delete Account */}
                  <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-lg mt-8">
                    <h3 className="text-lg font-medium text-red-400 mb-2 flex items-center gap-2">
                      <LogOut className="w-5 h-5" />
                      Danger Zone
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Delete Account</p>
                        <p className="text-sm text-gray-500">Permanently remove your account and all of its content.</p>
                      </div>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
                  <div className="text-gray-400">Notification settings content...</div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">General Preferences</h2>
                  <div className="text-gray-400">Preference settings content...</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Enable 2FA Modal */}
      {show2faModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Set up 2FA</h3>

            <div className="space-y-6">
              <div className="flex justify-center bg-white p-4 rounded-xl">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-gray-300 text-sm">1. Scan this QR code with your authenticator app</p>
                <p className="text-gray-300 text-sm">2. Enter the 6-digit code below to verify.</p>
              </div>

              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center text-3xl tracking-[0.5em] py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-600"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShow2faModal(false)}
                  className="flex-1 py-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify2FA}
                  disabled={verificationCode.length !== 6}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl max-w-sm w-full border border-gray-700 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Disable 2FA?</h3>
            <p className="text-gray-400 text-sm mb-6">Are you sure? This will decrease your account security.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisableModal(false)}
                  className="flex-1 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisable2FA}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  Disable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Codes Modal */}
      {showBackupCodesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Backup Codes</h3>
            <p className="text-gray-300 text-sm mb-4">
              Save these backup codes in a safe place. You can use them to log in if you lose access to your authenticator app.
              Each code can only be used once.
            </p>
            <div className="bg-gray-900 p-4 rounded-lg grid grid-cols-2 gap-2 mb-6">
              {backupCodes.map((code, index) => (
                <code key={index} className="text-blue-400 font-mono text-center block bg-gray-800/50 p-1 rounded">
                  {code}
                </code>
              ))}
            </div>
            <button
              onClick={() => setShowBackupCodesModal(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              I have saved these codes
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-red-500/30 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <LogOut className="w-6 h-6" />
              <h3 className="text-xl font-bold">Delete Account?</h3>
            </div>

            <p className="text-gray-300 text-sm mb-6">
              This action cannot be undone. This will permanently delete your account,
              remove your data from our servers, and cancel your active subscriptions.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type <span className="font-mono font-bold text-white">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmation('')
                  }}
                  disabled={isDeleting}
                  className="flex-1 py-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
