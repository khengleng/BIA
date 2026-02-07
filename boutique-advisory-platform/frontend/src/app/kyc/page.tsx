'use client'

import { useState, useEffect } from 'react'
import {
    ShieldCheck,
    User,
    FileText,
    Upload,
    CheckCircle,
    AlertCircle,
    Lock,
    Globe
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useToast } from '../../contexts/ToastContext'
import { authorizedRequest } from '../../lib/api'

export default function KYCPage() {
    const { addToast } = useToast()
    const [kycStatus, setKycStatus] = useState<string>('PENDING')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        nationality: '',
        idNumber: '',
        investorType: 'ANGEL'
    })

    useEffect(() => {
        const fetchKycStatus = async () => {
            try {
                const response = await authorizedRequest('/api/investors/profile')
                if (response.ok) {
                    const data = await response.json()
                    setKycStatus(data.investor?.kycStatus || 'PENDING')
                    setFormData({
                        fullName: data.user?.firstName + ' ' + data.user?.lastName || '',
                        nationality: data.investor?.preferences?.nationality || '',
                        idNumber: data.investor?.preferences?.idNumber || '',
                        investorType: data.investor?.type || 'ANGEL'
                    })
                }
            } catch (error) {
                console.error('Error fetching KYC status:', error)
            }
        }
        fetchKycStatus()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await authorizedRequest('/api/investors/kyc-submit', {
                method: 'POST',
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                addToast('success', 'KYC details submitted for review')
                setKycStatus('UNDER_REVIEW')
            } else {
                addToast('error', 'Submission failed')
            }
        } catch (error) {
            addToast('error', 'An error occurred during submission')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Lock className="w-8 h-8 text-green-400" />
                        Investor Verification (KYC)
                    </h1>
                    <p className="text-gray-400 mt-2">To comply with financial regulations and access high-value deals, please verify your identity.</p>
                </div>

                {kycStatus === 'VERIFIED' ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">You are Verified!</h2>
                        <p className="text-gray-400">Your account is fully compliant. You have unrestricted access to the deal marketplace.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-8 border border-gray-700 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Legal Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-gray-900 border-gray-700 rounded-xl pl-10 text-white focus:ring-green-500 pr-4 py-2.5"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Nationality</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-gray-900 border-gray-700 rounded-xl pl-10 text-white focus:ring-green-500 pr-4 py-2.5"
                                                value={formData.nationality}
                                                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">ID Number (Passport / National ID)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-900 border-gray-700 rounded-xl text-white focus:ring-green-500 px-4 py-2.5"
                                        value={formData.idNumber}
                                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Investor Classification</label>
                                    <select
                                        className="w-full bg-gray-900 border-gray-700 rounded-xl text-white focus:ring-green-500 px-4 py-2.5"
                                        value={formData.investorType}
                                        onChange={(e) => setFormData({ ...formData, investorType: e.target.value })}
                                    >
                                        <option value="ANGEL">Angel Investor</option>
                                        <option value="VENTURE_CAPITAL">Venture Capitalist</option>
                                        <option value="PRIVATE_EQUITY">Private Equity</option>
                                        <option value="INSTITUTIONAL">Institutional Investor</option>
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <label className="block text-sm font-medium text-gray-400 mb-4">Identity Document Upload</label>
                                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-green-500 transition-all cursor-pointer group">
                                        <Upload className="w-10 h-10 text-gray-600 mx-auto mb-2 group-hover:text-green-500" />
                                        <p className="text-gray-400">Click or drag your ID document here (PDF, JPG, PNG)</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || kycStatus === 'UNDER_REVIEW'}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/40 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : kycStatus === 'UNDER_REVIEW' ? 'Pending Review' : 'Submit for Verification'}
                                </button>
                            </form>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                                    Why Verify?
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-400">
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        Access exclusive deals
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        Participate in Syndicates
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        Direct Messaging with CEOs
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        Priority Support
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6">
                                <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Security Note
                                </h3>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Your data is encrypted using AES-256 standards. We never share your ID details with third parties except for regulatory compliance.
                                    Verification usually takes 24-48 hours.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
