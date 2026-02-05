import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useSocket = (token: string | null) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastNotification, setLastNotification] = useState<any>(null);

    useEffect(() => {
        if (!token) return;

        // Initialize socket connection
        const socket = io(API_URL, {
            auth: { token },
            transports: ['websocket']
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('📡 Connected to WebSocket');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('📡 Disconnected from WebSocket');
            setIsConnected(false);
        });

        socket.on('notification', (notification) => {
            console.log('🔔 New notification:', notification);
            setLastNotification(notification);
        });

        socket.on('system_alert', (alert) => {
            console.log('⚠️ System alert:', alert.message);
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    const sendMessage = (conversationId: string, content: string) => {
        if (socketRef.current) {
            socketRef.current.emit('send_message', { conversationId, content });
        }
    };

    const joinConversation = (conversationId: string) => {
        if (socketRef.current) {
            socketRef.current.emit('join_conversation', conversationId);
        }
    };

    const leaveConversation = (conversationId: string) => {
        if (socketRef.current) {
            socketRef.current.emit('leave_conversation', conversationId);
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        lastNotification,
        sendMessage,
        joinConversation,
        leaveConversation
    };
};
