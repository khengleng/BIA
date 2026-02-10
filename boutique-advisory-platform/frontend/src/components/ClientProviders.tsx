'use client'

import { useEffect } from 'react'
import ErrorBoundary from './ErrorBoundary'
import { ToastProvider } from '../contexts/ToastContext'
import PWAInstallPrompt from './PWAInstallPrompt'
import BottomNavigation from './BottomNavigation'
import PushNotifications from './PushNotifications'
import { SocketProvider } from '../contexts/SocketContext'

interface Props {
    children: React.ReactNode
}

export default function ClientProviders({ children }: Props) {
    useEffect(() => {
        // Force unregister service workers on localhost to prevent "no-response" errors
        if (typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                        registration.unregister();
                        console.log('🧹 Unregistered stale service worker on localhost');
                    }
                });
            }
        }
    }, []);

    return (
        <ErrorBoundary>
            <ToastProvider>
                <SocketProvider>
                    {children}
                    <PWAInstallPrompt />
                    <PushNotifications />
                    <BottomNavigation />
                </SocketProvider>
            </ToastProvider>
        </ErrorBoundary>
    )
}
