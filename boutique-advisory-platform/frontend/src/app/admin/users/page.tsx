'use client'

import { useState, useEffect } from 'react'
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Shield,
    UserPlus,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    UserCheck,
    UserX,
    MoreHorizontal
} from 'lucide-react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import { authorizedRequest } from '../../../lib/api'
import { useToast } from '../../../contexts/ToastContext'

export default function UserManagementPage() {
    const { addToast } = useToast()
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('ALL')
    const [statusFilter, setStatusFilter] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [statusFilter])

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const queryParams = new URLSearchParams()
            if (statusFilter) queryParams.append('status', statusFilter)

            const response = await authorizedRequest(`/api/admin/users?${queryParams.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setUsers(data.users || [])
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            addToast('error', 'Failed to load users')
        } finally {
            setIsLoading(false)
        }
    }

    const updateStatus = async (userId: string, status: string) => {
        try {
            const response = await authorizedRequest(`/api/admin/users/${userId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            })
            if (response.ok) {
                addToast('success', `User status updated to ${status}`)
                fetchUsers()
            }
        } catch (error) {
            addToast('error', 'Failed to update status')
        }
    }

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
        return matchesSearch && matchesRole
    })

    const getRoleBadge = (role: string) => {
        const styles: any = {
            SUPER_ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
            ADMIN: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            ADVISOR: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            INVESTOR: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            SME: 'bg-green-500/10 text-green-400 border-green-500/20',
        }
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[role] || 'bg-gray-500/10 text-gray-400'}`}>
                {role}
            </span>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-400" />
                            User Management
                        </h1>
                        <p className="text-gray-400 mt-1">Manage global user accounts, roles, and access status.</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-900/40">
                        <UserPlus className="w-5 h-5" />
                        Add New User
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-gray-900 border-gray-700 rounded-xl pl-10 text-white focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex bg-gray-900 p-1 rounded-xl">
                            {['ALL', 'ACTIVE', 'SUSPENDED', 'DELETED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status === 'ALL' ? '' : status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${(statusFilter === status || (status === 'ALL' && statusFilter === ''))
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>

                        <select
                            className="bg-gray-900 border-gray-700 rounded-xl text-white px-4 py-2 focus:ring-blue-500"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="ALL">All Roles</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="ADMIN">Admin</option>
                            <option value="ADVISOR">Advisor</option>
                            <option value="INVESTOR">Investor</option>
                            <option value="SME">SME</option>
                        </select>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-900/50 border-b border-gray-700">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                                                        <p className="text-gray-500 text-xs">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1.5 text-xs font-medium ${user.status === 'ACTIVE' ? 'text-green-400' :
                                                    user.status === 'SUSPENDED' ? 'text-red-400' : 'text-gray-400'
                                                    }`}>
                                                    <span className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-400' :
                                                        user.status === 'SUSPENDED' ? 'bg-red-400' : 'bg-gray-400'
                                                        }`} />
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {user.status === 'ACTIVE' ? (
                                                        <button
                                                            onClick={() => updateStatus(user.id, 'SUSPENDED')}
                                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                            title="Suspend User"
                                                        >
                                                            <UserX className="w-5 h-5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => updateStatus(user.id, 'ACTIVE')}
                                                            className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all"
                                                            title="Activate User"
                                                        >
                                                            <UserCheck className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
