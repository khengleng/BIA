import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export let io: Server;

export function initSocket(server: HttpServer) {
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const allowedOrigins = [
        frontendUrl,
        frontendUrl.replace(/\/$/, ''),
    ];

    if (!isProduction) {
        allowedOrigins.push(
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003',
            'http://localhost:3005'
        );
    }

    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                // Requests without an Origin header can still be valid for non-browser
                // clients and certain same-origin/proxy scenarios.
                if (!origin) {
                    return callback(null, true);
                }

                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    console.warn('Blocked by Socket CORS:', origin);
                    callback(new Error('Not allowed by CORS'), false);
                }
            },
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication Middleware for Sockets
    io.use((socket, next) => {
        let token = socket.handshake.auth.token;

        // If no token in auth, check cookies
        if (!token && socket.handshake.headers.cookie) {
            const cookieMatch = socket.handshake.headers.cookie.match(/token=([^;]+)/);
            if (cookieMatch) {
                token = cookieMatch[1];
            }
        }

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) return next(new Error('Authentication error: Invalid token'));
            (socket as any).user = decoded;
            next();
        });
    });

    io.on('connection', (socket: Socket) => {
        const user = (socket as any).user;
        console.log(`👤 User connected: ${user.email} (${socket.id})`);

        // Join user-specific room for targeted notifications
        socket.join(`user_${user.userId}`);

        // Join role-specific rooms
        socket.join(`role_${user.role}`);

        socket.on('disconnect', () => {
            console.log(`👤 User disconnected: ${user.email}`);
        });

        // Handle joining conversation rooms
        socket.on('join_conversation', (conversationId: string) => {
            socket.join(`conversation_${conversationId}`);
            console.log(`💬 User ${user.email} joined conversation ${conversationId}`);
        });

        // Handle leaving conversation rooms
        socket.on('leave_conversation', (conversationId: string) => {
            socket.leave(`conversation_${conversationId}`);
        });

        // Handle sending messages
        socket.on('send_message', async (data: {
            conversationId: string;
            content: string;
            type?: string;
            attachments?: any[]
        }) => {
            try {
                // Find all participants for this conversation
                const { prisma } = await import('./database');
                const conversation = await (prisma as any).conversation.findUnique({
                    where: { id: data.conversationId },
                    include: { participants: true }
                });

                if (!conversation) return;

                const messagePayload = {
                    conversationId: data.conversationId,
                    content: data.content,
                    type: data.type || 'TEXT',
                    attachments: data.attachments || [],
                    senderId: user.userId,
                    senderName: user.firstName,
                    createdAt: new Date().toISOString()
                };

                // Broadcast to all other participants in their personal rooms
                // We fetch participant details to ensure we don't send to DELETED users
                const participants = await (prisma as any).user.findMany({
                    where: {
                        id: { in: conversation.participants.map((p: any) => p.userId) },
                        status: 'ACTIVE'
                    }
                });

                participants.forEach((p: any) => {
                    if (p.id === user.userId) return; // Skip sender to avoid duplicates
                    io.to(`user_${p.id}`).emit('new_message', messagePayload);
                });

                console.log(`📡 Message broadcast to ${conversation.participants.length} participants in conversation ${data.conversationId}`);
            } catch (error) {
                console.error('Error broadcasting message:', error);
            }
        });
    });

    return io;
}

// Helper to send notifications
export function sendNotification(userId: string, notification: any) {
    if (io) {
        io.to(`user_${userId}`).emit('notification', notification);
    }
}

// Helper to broadcast system alerts
export function broadcastSystemAlert(message: string) {
    if (io) {
        io.emit('system_alert', { message, timestamp: new Date() });
    }
}
