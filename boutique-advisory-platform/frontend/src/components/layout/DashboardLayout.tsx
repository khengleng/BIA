'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Building2,
    Users,
    Handshake,
    BarChart3,
    FileText,
    Settings,
    LogOut,
    Award,
    Menu,
    X,
    Sparkles,
    MessageSquare,
    KanbanSquare,
    FolderLock,
    TrendingUp,
    Calendar,
    // New feature icons
    UsersRound,
    Shield,
    MessagesSquare,
    ArrowLeftRight
} from 'lucide-react'
import { User } from '../../types'
import NotificationCenter from '../NotificationCenter'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(`${path}/`)
    }

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: BarChart3, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/analytics', label: 'Analytics', icon: TrendingUp, roles: ['ADMIN', 'ADVISOR', 'INVESTOR'] },
        { href: '/smes', label: 'SMEs', icon: Building2, roles: ['ADMIN', 'ADVISOR', 'INVESTOR'] },
        { href: '/investors', label: 'Investors', icon: Users, roles: ['ADMIN', 'ADVISOR', 'SME'] },
        { href: '/deals', label: 'Deals', icon: Handshake, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/pipeline', label: 'Pipeline', icon: KanbanSquare, roles: ['ADMIN', 'ADVISOR'] },
        { href: '/matchmaking', label: 'Matchmaking', icon: Sparkles, roles: ['ADMIN', 'ADVISOR'] },
        { href: '/messages', label: 'Messages', icon: MessageSquare, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/calendar', label: 'Calendar', icon: Calendar, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/dataroom', label: 'Data Room', icon: FolderLock, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/advisory', label: 'Advisory', icon: Award, roles: ['ADMIN', 'ADVISOR'] },
        { href: '/reports', label: 'Reports', icon: FileText, roles: ['ADMIN', 'ADVISOR'] },
        // New Features Section
        { href: '', label: '― New Features ―', icon: null, divider: true, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/syndicates', label: 'Syndicates', icon: UsersRound, isNew: true, roles: ['ADMIN', 'ADVISOR', 'INVESTOR'] },
        { href: '/due-diligence', label: 'Due Diligence', icon: Shield, isNew: true, roles: ['ADMIN', 'ADVISOR'] },
        { href: '/community', label: 'Community', icon: MessagesSquare, isNew: true, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/secondary-trading', label: 'Trading', icon: ArrowLeftRight, isNew: true, roles: ['ADMIN', 'ADVISOR', 'INVESTOR'] },
        // Settings at the end
        { href: '/settings', label: 'Settings', icon: Settings, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
    ]

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true;
        return user && item.roles.includes(user.role);
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-white">Boutique Advisory</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-gray-400 hover:text-white"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:min-h-screen
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="hidden md:flex items-center space-x-4 p-6 border-b border-gray-700">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-white">Boutique Advisory</h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {filteredNavItems.map((item, index) => {
                        // Handle divider items
                        if ((item as any).divider) {
                            return (
                                <div
                                    key={`divider-${index}`}
                                    className="text-xs text-gray-500 px-4 py-2 mt-4 font-medium"
                                >
                                    {item.label}
                                </div>
                            )
                        }

                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isActive(item.href)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {Icon && <Icon className="w-5 h-5 mr-3" />}
                                <span className="flex-1">{item.label}</span>
                                {(item as any).isNew && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded">
                                        NEW
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center mb-4 px-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-400 capitalize truncate">
                                {user?.role.toLowerCase()}
                            </p>
                        </div>
                        <NotificationCenter />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header for Desktop (User info is in sidebar now for cleaner layout, but let's keep it consistent or clean)
             Actually, let's keep the content area clean.
             The design in original code had a top header.
             I moved user info to sidebar bottom for better mobile/desktop parity or keep it top?
             Original had top header.
             Let's stick to a clean top bar or just padded content.
             I'll add a simple top bar for breadcrumbs or title if needed, but for now just the content container.
         */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
