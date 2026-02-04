import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';
import { prisma } from '../database';

const router = Router();

// Get conversations
router.get('/conversations', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // Mock conversations matching frontend interface
        const conversations = [
            {
                id: '1',
                participants: [userId || 'current-user', 'investor-1'],
                participantDetails: [
                    { id: userId || 'current-user', type: 'SME', name: 'My Company' },
                    { id: 'investor-1', type: 'INVESTOR', name: 'Alice Johnson' }
                ],
                dealId: 'deal-123',
                lastMessage: 'I am interested in your Series A proposal.',
                lastMessageAt: new Date().toISOString(),
                unreadCount: { [userId || 'current-user']: 2 },
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: '2',
                participants: [userId || 'current-user', 'sme-2'],
                participantDetails: [
                    { id: userId || 'current-user', type: 'ADVISOR', name: 'My Advisor Account' },
                    { id: 'sme-2', type: 'SME', name: 'TechCorp Solutions' }
                ],
                dealId: null,
                lastMessage: 'The financial statements have been uploaded.',
                lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
                unreadCount: { [userId || 'current-user']: 0 },
                createdAt: new Date(Date.now() - 172800000).toISOString()
            }
        ];

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

        const messages = [
            {
                id: 'm1',
                conversationId: id,
                senderId: 'investor-1',
                senderName: 'Alice Johnson',
                senderType: 'INVESTOR',
                content: 'Hello! I saw your recent pitch and I am very interested.',
                read: true,
                createdAt: new Date(Date.now() - 7200000).toISOString()
            },
            {
                id: 'm2',
                conversationId: id,
                senderId: userId || 'current-user',
                senderName: 'You',
                senderType: req.user?.role || 'SME',
                content: 'Hi Alice, thanks for reaching out. Let me know if you need more details.',
                read: true,
                createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 'm3',
                conversationId: id,
                senderId: 'investor-1',
                senderName: 'Alice Johnson',
                senderType: 'INVESTOR',
                content: 'I am interested in your Series A proposal.',
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

        const newMessage = {
            id: `m-${Date.now()}`,
            conversationId,
            senderId: userId || 'current-user',
            senderName: 'You',
            senderType: req.user?.role || 'SME',
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
