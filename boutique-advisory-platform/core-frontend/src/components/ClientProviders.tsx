'use client'

// Initialize i18next once, at the client root. Nothing imported this module
// before, so i18n was never initialized with the translation resources and
// every t() call fell back to the raw key — the app was English regardless of
// the Khmer/Chinese dictionaries. This side-effect import fixes that and
// registers the language detection + persistence wired in the module.
import '@/i18n'
import { useEffect, useState } from 'react'
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
    const [mounted, setMounted] = useState(false)
    const [isTradingRuntime, setIsTradingRuntime] = useState(false)

    useEffect(() => {
        setMounted(true)
        setIsTradingRuntime(false)

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

        // One-time SW reset on production domains to clear stale cached bundles after deploys.
        if (typeof window !== 'undefined') {
            const host = window.location.hostname;
            const shouldResetSw = host === 'trade.cambobia.com' || host === 'www.cambobia.com' || host === 'cambobia.com' || host === 'bia.cambobia.com';

            if (shouldResetSw) {
                const resetKey = `${host}-sw-reset-v6`;
                const hasReset = window.localStorage.getItem(resetKey);

                if (!hasReset && 'serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then((registrations) => {
                        Promise.all(registrations.map((registration) => registration.unregister()))
                            .then(async () => {
                                if ('caches' in window) {
                                    const cacheKeys = await window.caches.keys();
                                    await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
                                }
                            })
                            .finally(() => {
                                window.localStorage.setItem(resetKey, '1');
                                window.location.reload();
                            });
                    });
                }
            }
        }
    }, [])

    return (
        <ErrorBoundary>
            <ToastProvider>
                <SocketProvider>
                    {children}
                    {mounted && (
                        <>
                            <PWAInstallPrompt />
                            <PushNotifications />
                            <BottomNavigation />
                        </>
                    )}
                </SocketProvider>
            </ToastProvider>
        </ErrorBoundary>
    )
}
