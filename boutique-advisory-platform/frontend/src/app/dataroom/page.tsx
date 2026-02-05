'use client'

import { useState, useEffect } from 'react'
import {
    FolderLock,
    FileText,
    Download,
    Eye,
    Upload,
    Search,
    Filter,
    Clock,
    User,
    Shield,
    BarChart3,
    File,
    FileSpreadsheet,
    Folder,
    Activity,
    Lock,
    ChevronRight
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useToast } from '../../contexts/ToastContext'
import { API_URL } from '@/lib/api'

interface DataRoomDocument {
    id: string
    name: string
    category: string
    size: string
    uploadedBy: string
    uploadedAt: string
    accessCount: number
    lastAccessedBy: string | null
    lastAccessedAt: string | null
}

interface DataRoom {
    id: string
    dealId: string
    name: string
    status: string
    createdBy: string
    accessList: string[]
    documents: DataRoomDocument[]
    activityLog: { action: string; documentId: string; userId: string; timestamp: string }[]
    createdAt: string
}

interface User {
    id: string
    userId: string
    role: string
}

export default function DataRoomPage() {
    const { addToast } = useToast()
    const [user, setUser] = useState<User | null>(null)
    const [dataRooms, setDataRooms] = useState<DataRoom[]>([])
    const [selectedRoom, setSelectedRoom] = useState<DataRoom | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploadForm, setUploadForm] = useState({ name: '', category: 'General', size: '1.0 MB' })

    useEffect(() => {
        const fetchDataRooms = async () => {
            try {
                const token = localStorage.getItem('token')
                const userData = localStorage.getItem('user')

                if (!token || !userData) {
                    window.location.href = '/auth/login'
                    return
                }

                setUser(JSON.parse(userData))

                const response = await fetch(`${API_URL}/api/dataroom`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setDataRooms(Array.isArray(data) ? data : [])
                    if (Array.isArray(data) && data.length > 0) {
                        setSelectedRoom(data[0])
                    }
                }
            } catch (error) {
                console.error('Error fetching data rooms:', error)
                addToast('error', 'Failed to load data rooms')
            } finally {
                setIsLoading(false)
            }
        }

        fetchDataRooms()
    }, [addToast])

    const handleViewDocument = async (doc: DataRoomDocument) => {
        if (!selectedRoom) return

        try {
            const token = localStorage.getItem('token')
            await fetch(`${API_URL}/api/dataroom/${selectedRoom.dealId}/documents/${doc.id}/access`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'VIEWED' })
            })

            addToast('success', `Viewing: ${doc.name}`)

            // Update local state
            setSelectedRoom(prev => {
                if (!prev) return prev
                return {
                    ...prev,
                    documents: prev.documents.map(d =>
                        d.id === doc.id
                            ? { ...d, accessCount: d.accessCount + 1, lastAccessedAt: new Date().toISOString() }
                            : d
                    )
                }
            })
        } catch (error) {
            console.error('Error logging view:', error)
        }
    }

    const handleDownloadDocument = async (doc: DataRoomDocument) => {
        if (!selectedRoom) return

        try {
            const token = localStorage.getItem('token')
            await fetch(`${API_URL}/api/dataroom/${selectedRoom.dealId}/documents/${doc.id}/access`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'DOWNLOADED' })
            })

            addToast('success', `Downloading: ${doc.name}`)
        } catch (error) {
            console.error('Error logging download:', error)
        }
    }

    const handleUploadDocument = async () => {
        if (!selectedRoom || !uploadForm.name) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/dataroom/${selectedRoom.dealId}/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(uploadForm)
            })

            if (response.ok) {
                const newDoc = await response.json()
                setSelectedRoom(prev => {
                    if (!prev) return prev
                    return { ...prev, documents: [...prev.documents, newDoc] }
                })
                addToast('success', 'Document uploaded successfully')
                setShowUploadModal(false)
                setUploadForm({ name: '', category: 'General', size: '1.0 MB' })
            }
        } catch (error) {
            console.error('Error uploading document:', error)
            addToast('error', 'Failed to upload document')
        }
    }

    const getCategories = () => {
        if (!selectedRoom) return []
        const categories = [...new Set(selectedRoom.documents.map(d => d.category))]
        return categories
    }

    const getFileIcon = (name: string) => {
        const ext = name?.split('.').pop()?.toLowerCase()
        if (ext === 'pdf') return <File className="w-8 h-8 text-red-400" />
        if (['xlsx', 'xls', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-8 h-8 text-green-400" />
        return <FileText className="w-8 h-8 text-blue-400" />
    }

    const filteredDocuments = selectedRoom?.documents.filter(doc => {
        const matchesSearch = (doc.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
        return matchesSearch && matchesCategory
    }) || []

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FolderLock className="w-8 h-8 text-yellow-400" />
                        Virtual Data Room
                    </h1>
                    <p className="text-gray-400 mt-1">Secure document sharing and tracking for due diligence</p>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'ADVISOR') && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Document
                    </button>
                )}
            </div>

            <div className="flex gap-6">
                {/* Data Room Selector */}
                <div className="w-72 bg-gray-800 rounded-xl p-4 border border-gray-700 h-fit">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Folder className="w-5 h-5 text-yellow-400" />
                        Data Rooms
                    </h3>
                    <div className="space-y-2">
                        {dataRooms.map(room => (
                            <div
                                key={room.id}
                                onClick={() => setSelectedRoom(room)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedRoom?.id === room.id
                                    ? 'bg-blue-600/20 border border-blue-500/30'
                                    : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-white font-medium text-sm line-clamp-2">{room.name}</h4>
                                        <p className="text-gray-400 text-xs mt-1">{room.documents.length} documents</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs ${room.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {room.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {dataRooms.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <FolderLock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No data rooms available</p>
                        </div>
                    )}
                </div>

                {/* Documents Area */}
                <div className="flex-1">
                    {selectedRoom ? (
                        <>
                            {/* Room Header */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{selectedRoom.name}</h2>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Created {formatDate(selectedRoom.createdAt)} • {selectedRoom.documents.length} documents
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-sm">{selectedRoom.accessList.length} authorized users</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Activity className="w-4 h-4" />
                                            <span className="text-sm">{selectedRoom.activityLog.length} activities</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Search and Filter */}
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search documents..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Categories</option>
                                        {getCategories().map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Documents Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredDocuments.map(doc => (
                                    <div
                                        key={doc.id}
                                        className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-gray-700 rounded-lg">
                                                {getFileIcon(doc.name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-white truncate">{doc.name}</h4>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                                                        {doc.category}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{doc.size}</span>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-700 space-y-1 text-xs text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <Upload className="w-3 h-3" />
                                                        <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Eye className="w-3 h-3" />
                                                        <span>{doc.accessCount} views</span>
                                                    </div>
                                                    {doc.lastAccessedAt && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-3 h-3" />
                                                            <span>Last accessed {formatDate(doc.lastAccessedAt)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                                            <button
                                                onClick={() => handleViewDocument(doc)}
                                                className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDownloadDocument(doc)}
                                                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredDocuments.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">No documents found</p>
                                    <p className="text-sm mt-1">Try adjusting your search or filter</p>
                                </div>
                            )}

                            {/* Activity Log */}
                            {selectedRoom.activityLog.length > 0 && (
                                <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
                                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-400" />
                                        Recent Activity
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedRoom.activityLog.slice(0, 5).map((log, index) => (
                                            <div key={index} className="flex items-center gap-3 text-sm">
                                                <div className={`p-1.5 rounded ${log.action === 'DOWNLOADED' ? 'bg-green-500/20' : 'bg-blue-500/20'
                                                    }`}>
                                                    {log.action === 'DOWNLOADED' ? (
                                                        <Download className="w-3 h-3 text-green-400" />
                                                    ) : log.action === 'UPLOADED' ? (
                                                        <Upload className="w-3 h-3 text-purple-400" />
                                                    ) : (
                                                        <Eye className="w-3 h-3 text-blue-400" />
                                                    )}
                                                </div>
                                                <span className="text-gray-300">
                                                    {(log.action || '').charAt(0) + (log.action || '').slice(1).toLowerCase()} document
                                                </span>
                                                <span className="text-gray-500">•</span>
                                                <span className="text-gray-400">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-800 rounded-xl border border-gray-700 min-h-[400px]">
                            <div className="text-center text-gray-500">
                                <FolderLock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">Select a data room to view documents</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-4">Upload Document</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Document Name</label>
                                <input
                                    type="text"
                                    value={uploadForm.name}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Financial Statements Q4 2024"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                <select
                                    value={uploadForm.category}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="General">General</option>
                                    <option value="Financials">Financials</option>
                                    <option value="Legal">Legal</option>
                                    <option value="Strategy">Strategy</option>
                                    <option value="Overview">Overview</option>
                                    <option value="Technical">Technical</option>
                                </select>
                            </div>

                            <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg text-center">
                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-400">Drag and drop or click to upload</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, DOCX, XLSX up to 10MB</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadDocument}
                                disabled={!uploadForm.name}
                                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
