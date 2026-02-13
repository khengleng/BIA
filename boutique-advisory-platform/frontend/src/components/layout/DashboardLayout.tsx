'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Building2,
    Users,
    Handshake,
    BarChart3,
    ClipboardCheck,
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
    ArrowLeftRight,
    LayoutDashboard,
    UserCog,
    History,
    Briefcase,
    Palette,
    RefreshCw
} from 'lucide-react'
import { useTranslations } from '../../hooks/useTranslations'
import { User } from '../../types'
import { API_URL, authorizedRequest } from '@/lib/api'
import NotificationCenter from '../NotificationCenter'
import LanguageSwitcher from '../LanguageSwitcher'
import Chatbot from '../Chatbot'
import BottomNavigation from '../BottomNavigation'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { t } = useTranslations()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            // Don't fetch if we're on a public page to avoid infinite redirect loops
            if (pathname?.startsWith('/auth/')) {
                setIsLoading(false);
                return;
            }

            // Optimistic load for instant navigation
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser))
                    setIsLoading(false)
                } catch (e) {
                    // Invalid JSON, ignore
                }
            }

            try {
                // Check if token exists before making request
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No session');
                }

                // Try to get user from API (checks Authorization header)
                const response = await authorizedRequest('/api/auth/me')

                if (response.ok) {
                    const data = await response.json()
                    setUser(data.user)
                    localStorage.setItem('user', JSON.stringify(data.user))
                } else {
                    // Session invalid
                    throw new Error('Session invalid')
                }
            } catch (error: any) {
                // Only log unexpected errors, not standard "no session" redirects
                if (error?.message !== 'No session' && error?.message !== 'Session invalid') {
                    console.error('Error fetching user:', error);
                }

                localStorage.removeItem('token')
                localStorage.removeItem('user')
                // Only redirect if we're not already on the login page
                if (pathname !== '/auth/login' && pathname !== '/auth/register') {
                    router.push('/auth/login')
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [router, pathname])

    const handleSwitchRole = async () => {
        if (!user) return;
        const targetRole = user.role === 'SME' ? 'INVESTOR' : 'SME';

        try {
            const response = await authorizedRequest('/api/auth/switch-role', {
                method: 'POST',
                body: JSON.stringify({ targetRole })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to switch role', error);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/')
    }

    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(`${path}/`)
    }

    const navItems = [
        { href: '/dashboard', label: t('navigation.dashboard'), icon: BarChart3, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/analytics', label: t('home.features.analytics.title'), icon: TrendingUp, roles: ['ADMIN', 'ADVISOR', 'INVESTOR'] },
        { href: '/smes', label: t('navigation.smes'), icon: Building2, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/investors', label: t('navigation.investors'), icon: Users, roles: ['ADMIN', 'ADVISOR', 'SME'] },
        { href: '/sme-pipeline', label: t('advisory.pipeline'), icon: ClipboardCheck, roles: ['ADMIN', 'ADVISOR'] },
        { href: '/pipeline', label: t('navigation.deals'), icon: KanbanSquare, roles: ['ADMIN', 'ADVISOR'] },
        { href: '/matchmaking', label: 'AI Matching', icon: Sparkles, roles: ['ADMIN', 'ADVISOR'] },
        { href: '/messages', label: 'Messages', icon: MessageSquare, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/calendar', label: 'Calendar', icon: Calendar, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/dataroom', label: 'Data Room', icon: FolderLock, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/advisory', label: t('navigation.advisory'), icon: Award, roles: ['ADMIN', 'SME', 'INVESTOR'] },
        { href: '/advisory/manage', label: 'Manage Services', icon: Settings, roles: ['ADMIN', 'ADVISOR'] },
        { href: '/reports', label: t('navigation.reports'), icon: FileText, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/investor/portfolio', label: 'My Portfolio', icon: Briefcase, roles: ['ADMIN', 'ADVISOR', 'INVESTOR'] },
        // Admin Section
        { href: '', label: '― Administration ―', icon: null, divider: true, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { href: '/admin/dashboard', label: 'Admin Panel', icon: LayoutDashboard, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { href: '/admin/users', label: 'User Management', icon: UserCog, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { href: '/admin/settings/branding', label: 'Platform Branding', icon: Palette, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { href: '/admin/audit', label: 'System Audit', icon: History, roles: ['ADMIN', 'SUPER_ADMIN'] },
        // New Features Section
        { href: '', label: '― New Features ―', icon: null, divider: true, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/syndicates', label: 'Syndicates', icon: UsersRound, isNew: true, roles: ['ADMIN', 'ADVISOR', 'INVESTOR'] },
        { href: '/due-diligence', label: t('advisory.assessment'), icon: Shield, isNew: true, roles: ['ADMIN', 'ADVISOR'] },
        { href: '/community', label: 'Community', icon: MessagesSquare, isNew: true, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
        { href: '/secondary-trading', label: 'Trading', icon: ArrowLeftRight, isNew: true, roles: ['INVESTOR'] },
        // Settings at the end
        { href: '/settings', label: t('navigation.settings'), icon: Settings, roles: ['ADMIN', 'ADVISOR', 'INVESTOR', 'SME'] },
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
            {/* Mobile Header - Glassmorphism */}
            <div className="md:hidden sticky top-0 z-40 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 p-4 flex justify-between items-center px-6">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-white text-lg tracking-tight">BIA Platform</span>
                </div>
                <div className="flex items-center space-x-3">
                    <LanguageSwitcher />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-gray-400 hover:text-white p-1"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:min-h-screen
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="hidden md:flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">Boutique Advisory</h1>
                    </div>
                    <LanguageSwitcher />
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
                            {(user?.role === 'SME' || user?.role === 'INVESTOR') && (
                                <button
                                    onClick={handleSwitchRole}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 mt-1 flex items-center gap-1 transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Switch to {user.role === 'SME' ? 'Investor' : 'SME'}
                                </button>
                            )}
                        </div>
                        <NotificationCenter />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        {t('navigation.logout')}
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
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-24 md:pb-0">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {/* AI Chatbot Widget */}
            <Chatbot />
        </div>
    )
}
