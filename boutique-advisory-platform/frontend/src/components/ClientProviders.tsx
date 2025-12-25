'use client'

import ErrorBoundary from './ErrorBoundary'
import { ToastProvider } from '../contexts/ToastContext'

interface Props {
    children: React.ReactNode
}

export default function ClientProviders({ children }: Props) {
    return (
        <ErrorBoundary>
            <ToastProvider>
                {children}
            </ToastProvider>
        </ErrorBoundary>
    )
}
