'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
    lastNotification: any
    sendMessage: (conversationId: string, content: string) => void
    joinConversation: (conversationId: string) => void
    leaveConversation: (conversationId: string) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export const useSocketContext = () => {
    const context = useContext(SocketContext)
    if (!context) {
        throw new Error('useSocketContext must be used within a SocketProvider')
    }
    return context
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socketRef = useRef<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [lastNotification, setLastNotification] = useState<any>(null)
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        // Initial token check
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
            setToken(storedToken)
        }

        // Listen for storage events (login/logout from other tabs)
        const handleStorageChange = () => {
            const currentToken = localStorage.getItem('token')
            setToken(currentToken)
        }

        // Custom event for same-tab login/logout
        window.addEventListener('storage', handleStorageChange)
        // You might want to dispatch a custom event on login/logout if not already doing so

        // Poll for token change (fallback if no events)
        const interval = setInterval(() => {
            const currentToken = localStorage.getItem('token')
            if (currentToken !== token) {
                setToken(currentToken)
            }
        }, 1000)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            clearInterval(interval)
        }
    }, [token])

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

        if (!token) {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
                setIsConnected(false)
            }
            return
        }

        // Initialize socket connection
        if (!socketRef.current) {
            const socket = io(API_URL, {
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            })

            socketRef.current = socket

            socket.on('connect', () => {
                console.log('📡 Connected to WebSocket')
                setIsConnected(true)
            })

            socket.on('disconnect', () => {
                console.log('📡 Disconnected from WebSocket')
                setIsConnected(false)
            })

            socket.on('notification', (notification) => {
                console.log('🔔 New notification:', notification)
                setLastNotification(notification)
            })

            socket.on('system_alert', (alert) => {
                console.log('⚠️ System alert:', alert.message)
            })
        } else {
            // Update token if it changed? Requires reconnection usually.
            // Socket.io doesn't support dynamic auth update easily without reconnect.
            if (socketRef.current.auth && (socketRef.current.auth as any).token !== token) {
                socketRef.current.disconnect()
                socketRef.current.auth = { token }
                socketRef.current.connect()
            }
        }

        return () => {
            // cleanup on unmount? 
            // Since this provider is at root, it unmounts only on app close.
            // But if token changes (logout), we disconnect.
        }
    }, [token])

    const sendMessage = (conversationId: string, content: string) => {
        if (socketRef.current) {
            socketRef.current.emit('send_message', { conversationId, content })
        }
    }

    const joinConversation = (conversationId: string) => {
        if (socketRef.current) {
            socketRef.current.emit('join_conversation', conversationId)
        }
    }

    const leaveConversation = (conversationId: string) => {
        if (socketRef.current) {
            socketRef.current.emit('leave_conversation', conversationId)
        }
    }

    return (
        <SocketContext.Provider value={{
            socket: socketRef.current,
            isConnected,
            lastNotification,
            sendMessage,
            joinConversation,
            leaveConversation
        }}>
            {children}
        </SocketContext.Provider>
    )
}
