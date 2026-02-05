import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';
import { prisma } from '../database';

const router = Router();

// Get conversations
router.get('/conversations', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const userName = `${req.user?.firstName} ${req.user?.lastName}`;

        // Mock conversations matching frontend interface
        // We tailor these based on who is logged in
        const conversations = [];

        if (userRole === 'SME') {
            conversations.push({
                id: 'conv-1',
                participants: [userId, 'investor_1'],
                participantDetails: [
                    { id: userId, type: 'SME', name: userName },
                    { id: 'investor_1', type: 'INVESTOR', name: 'John Smith' }
                ],
                dealId: 'deal_1',
                lastMessage: 'I am interested in your Series A proposal.',
                lastMessageAt: new Date().toISOString(),
                unreadCount: { [userId || '']: 2 },
                createdAt: new Date(Date.now() - 86400000).toISOString()
            });
            conversations.push({
                id: 'conv-2',
                participants: [userId, 'advisor_1'],
                participantDetails: [
                    { id: userId, type: 'SME', name: userName },
                    { id: 'advisor_1', type: 'ADVISOR', name: 'Sarah Johnson' }
                ],
                dealId: null,
                lastMessage: 'The financial statements have been uploaded.',
                lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
                unreadCount: { [userId || '']: 0 },
                createdAt: new Date(Date.now() - 172800000).toISOString()
            });
        } else if (userRole === 'INVESTOR') {
            conversations.push({
                id: 'conv-1',
                participants: [userId, 'sme_1'],
                participantDetails: [
                    { id: userId, type: 'INVESTOR', name: userName },
                    { id: 'sme_1', type: 'SME', name: 'Tech Startup' }
                ],
                dealId: 'deal_1',
                lastMessage: 'I am interested in your Series A proposal.',
                lastMessageAt: new Date().toISOString(),
                unreadCount: { [userId || '']: 2 },
                createdAt: new Date(Date.now() - 86400000).toISOString()
            });
        } else if (userRole === 'ADVISOR') {
            conversations.push({
                id: 'conv-2',
                participants: [userId, 'sme_1'],
                participantDetails: [
                    { id: userId, type: 'ADVISOR', name: userName },
                    { id: 'sme_1', type: 'SME', name: 'Tech Startup' }
                ],
                dealId: null,
                lastMessage: 'The financial statements have been uploaded.',
                lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
                unreadCount: { [userId || '']: 0 },
                createdAt: new Date(Date.now() - 172800000).toISOString()
            });
        }

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get messages for a conversation
router.get('/conversations/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const userName = `${req.user?.firstName} ${req.user?.lastName}`;

        // Determine the other participant based on conversation ID and user role
        let otherId = 'system';
        let otherName = 'System';
        let otherType = 'ADMIN';

        if (id === 'conv-1') {
            if (userRole === 'SME') {
                otherId = 'investor_1';
                otherName = 'John Smith';
                otherType = 'INVESTOR';
            } else {
                otherId = 'sme_1';
                otherName = 'Tech Startup';
                otherType = 'SME';
            }
        } else if (id === 'conv-2') {
            if (userRole === 'SME') {
                otherId = 'advisor_1';
                otherName = 'Sarah Johnson';
                otherType = 'ADVISOR';
            } else {
                otherId = 'sme_1';
                otherName = 'Tech Startup';
                otherType = 'SME';
            }
        }

        const messages = [
            {
                id: 'm1',
                conversationId: id,
                senderId: otherId,
                senderName: otherName,
                senderType: otherType,
                content: 'Hello! I am reviewing the project details.',
                read: true,
                createdAt: new Date(Date.now() - 7200000).toISOString()
            },
            {
                id: 'm2',
                conversationId: id,
                senderId: userId,
                senderName: userName,
                senderType: userRole,
                content: 'Hi, thank you for your time. Let me know if you have any questions.',
                read: true,
                createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 'm3',
                conversationId: id,
                senderId: otherId,
                senderName: otherName,
                senderType: otherType,
                content: id === 'conv-1' ? 'I am interested in your Series A proposal.' : 'The financial statements have been uploaded.',
                read: false,
                createdAt: new Date().toISOString()
            }
        ];

        res.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send a message
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { conversationId, content } = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const userName = `${req.user?.firstName} ${req.user?.lastName}`;

        const newMessage = {
            id: `m-${Date.now()}`,
            conversationId,
            senderId: userId,
            senderName: userName,
            senderType: userRole,
            content,
            read: false,
            createdAt: new Date().toISOString()
        };

        res.json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
