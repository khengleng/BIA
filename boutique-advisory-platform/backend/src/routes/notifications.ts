/**
 * Notifications Routes
 * 
 * Provides user notifications functionality
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/auth';
import { prisma, prismaReplica } from '../database';
import { shouldUseDatabase } from '../migration-manager';
import { NotificationType } from '@prisma/client';

const router = Router();

// Create notification (Admin/Advisor only)
router.post('/', authorize(['ADMIN', 'ADVISOR']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { userId, type, title, message, actionUrl } = req.body;

        if (!shouldUseDatabase()) {
            const newNotification = {
                id: `notif_${Date.now()}`,
                userId,
                type: type || 'SYSTEM',
                title,
                message,
                read: false,
                actionUrl: actionUrl || null,
                createdAt: new Date().toISOString()
            };
            // In a real mock scenario, we'd push to a global store, but here we just echo back
            res.status(201).json(newNotification);
            return;
        }

        // Validate notification type
        let notifType: NotificationType = NotificationType.SYSTEM;
        if (type && Object.values(NotificationType).includes(type as NotificationType)) {
            notifType = type as NotificationType;
        }

        const notification = await prisma.notification.create({
            data: {
                tenantId: req.tenantId!, // Assumes middleware sets this
                userId, // Target user
                type: notifType,
                title,
                message,
                actionUrl: actionUrl || null,
            }
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

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
