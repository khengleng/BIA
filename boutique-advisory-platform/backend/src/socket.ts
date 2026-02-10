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
                // Allow requests with no origin only in development
                if (!origin) {
                    return isProduction ? callback(new Error('Origin required'), false) : callback(null, true);
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
        const token = socket.handshake.auth.token;
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
        socket.join(`user_${user.id}`);

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
        socket.on('send_message', (data: { conversationId: string; content: string }) => {
            // Broadcast to conversation room (excluding sender)
            socket.to(`conversation_${data.conversationId}`).emit('new_message', {
                conversationId: data.conversationId,
                content: data.content,
                senderId: user.id,
                senderName: user.firstName,
                createdAt: new Date().toISOString()
            });
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
