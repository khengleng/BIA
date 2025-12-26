/**
 * Notifications Routes
 * 
 * Provides user notifications functionality
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma, prismaReplica } from '../database';
import { shouldUseDatabase } from '../migration-manager';

const router = Router();

// Get user notifications
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            // For now, return sample notifications
            const notifications = [
                {
                    id: 'notif_1',
                    type: 'info',
                    title: 'Welcome to Boutique Advisory',
                    message: 'Start exploring investment opportunities and connect with SMEs.',
                    read: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'notif_2',
                    type: 'deal',
                    title: 'New Deal Available',
                    message: 'TechCorp Cambodia is seeking Series A funding.',
                    read: false,
                    createdAt: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: 'notif_3',
                    type: 'system',
                    title: 'Profile Complete',
                    message: 'Your investor profile has been verified.',
                    read: true,
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                }
            ];

            res.json({
                notifications,
                unreadCount: notifications.filter(n => !n.read).length
            });
            return;
        }

        // Use Replica for reading notifications (High traffic endpoint)
        const notifications = await prismaReplica.notification.findMany({
            where: {
                userId: req.user?.id,
                tenantId: req.tenantId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50 // Limit to recent 50
        });

        const unreadCount = await prismaReplica.notification.count({
            where: {
                userId: req.user?.id,
                tenantId: req.tenantId,
                read: false
            }
        });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.json({ success: true, message: 'Notification marked as read (mock)' });
            return;
        }

        const notificationId = req.params.id;

        // Use Primary for write update
        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: req.user?.id // Security: ensure user owns notification
            },
            data: {
                read: true
            }
        });

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// Mark all as read
router.put('/read-all', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.json({ success: true, message: 'All notifications marked as read (mock)' });
            return;
        }

        // Use Primary for batch update
        await prisma.notification.updateMany({
            where: {
                userId: req.user?.id,
                tenantId: req.tenantId,
                read: false
            },
            data: {
                read: true
            }
        });

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});

export default router;
