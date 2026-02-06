'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface Service {
    id: string
    name: string
    category: string
    description: string
    price: number
    duration: string
    features: string[]
    status: string
}

export default function ManageServicesPage() {
    const [services, setServices] = useState<Service[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        duration: '',
        features: ''
    })

    useEffect(() => {
        fetchMyServices()
    }, [])

    const fetchMyServices = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/advisory/my-services`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setServices(data)
            }
        } catch (error) {
            console.error('Error fetching services:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem('token')

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            features: formData.features.split(',').map(f => f.trim()).filter(f => f)
        }

        try {
            if (editingId) {
                // Update existing service
                const response = await fetch(`${API_URL}/api/advisory/services/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                })

                if (response.ok) {
                    alert('Service updated successfully!')
                    setEditingId(null)
                    resetForm()
                    fetchMyServices()
                }
            } else {
                // Create new service
                const response = await fetch(`${API_URL}/api/advisory/services`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                })

                if (response.ok) {
                    alert('Service created successfully!')
                    setIsCreating(false)
                    resetForm()
                    fetchMyServices()
                }
            }
        } catch (error) {
            console.error('Error saving service:', error)
            alert('Failed to save service')
        }
    }

    const handleEdit = (service: Service) => {
        setEditingId(service.id)
        setFormData({
            name: service.name,
            category: service.category,
            description: service.description,
            price: service.price.toString(),
            duration: service.duration,
            features: service.features.join(', ')
        })
        setIsCreating(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/advisory/services/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                alert('Service deleted successfully!')
                fetchMyServices()
            }
        } catch (error) {
            console.error('Error deleting service:', error)
            alert('Failed to delete service')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            description: '',
            price: '',
            duration: '',
            features: ''
        })
    }

    const handleCancel = () => {
        setIsCreating(false)
        setEditingId(null)
        resetForm()
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Manage Advisory Services</h1>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Service
                        </button>
                    )}
                </div>

                {/* Create/Edit Form */}
                {isCreating && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingId ? 'Edit Service' : 'Create New Service'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Service Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., M&A Advisory"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Financial"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Describe your service..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Price (USD)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 5000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Duration
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 4 weeks"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Features (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Due diligence, Valuation, Deal structuring"
                                />
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingId ? 'Update Service' : 'Create Service'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Services List */}
                <div className="space-y-4">
                    {services.map((service) => (
                        <div key={service.id} className="bg-gray-800 rounded-lg p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-xl font-bold text-white">{service.name}</h3>
                                        <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                                            {service.category}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded ${service.status === 'ACTIVE'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-600 text-gray-300'
                                            }`}>
                                            {service.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 mb-3">{service.description}</p>
                                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                                        <span className="font-semibold text-blue-400">${service.price.toLocaleString()}</span>
                                        <span>⏱️ {service.duration}</span>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-500 mb-1">Features:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {service.features.map((feature, idx) => (
                                                <span key={idx} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {services.length === 0 && !isCreating && (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-lg mb-4">No services yet</p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Service
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
