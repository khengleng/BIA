import { prisma } from '../database';
import { shouldUseDatabase } from '../migration-manager';
import { NotificationType } from '@prisma/client';
import webpush from 'web-push';

// Configure Web Push
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BO2WrnjdJYmlc9gEeHjYpRn1p7r4TMB33gh70AqQQzIrcBAN_kNQZ-kX2b-G9HQ7Z4GVjGVISUC2NEjGpNBzgkY';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'Inv2_qvKv8rCsnDG2VmoEi99mBExvU0cbecVWCApbTc';
const vapidEmail = 'mailto:contact@cambobia.com';

try {
    webpush.setVapidDetails(
        vapidEmail,
        publicVapidKey,
        privateVapidKey
    );
    console.log('✅ Web Push initialized in NotificationService');
} catch (error) {
    console.error('❌ Failed to initialize Web Push in NotificationService:', error);
}

/**
 * Send a notification to a user (DB + Web Push)
 */
export async function sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'SYSTEM',
    actionUrl?: string,
    tenantId: string = 'default'
) {
    if (!shouldUseDatabase()) {
        console.log(`[Mock Notification] To: ${userId} | ${title}: ${message}`);
        return Promise.resolve();
    }

    try {
        // 1. Create DB Notification
        const notification = await prisma.notification.create({
            data: {
                tenantId,
                userId,
                type,
                title,
                message,
                actionUrl: actionUrl || null,
            }
        });

        // 2. Send Web Push
        await sendPushToUser(userId, title, message, actionUrl);

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        // Don't throw, just log. Notifications shouldn't break the main flow.
        return Promise.resolve();
    }
}

/**
 * Helper to send push notification
 */
async function sendPushToUser(userId: string, title: string, body: string, url?: string) {
    try {
        // Get user subscriptions
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        if (subscriptions.length === 0) return;

        const payload = JSON.stringify({
            title,
            body,
            url,
            icon: '/icons/icon-192x192.png'
        });

        // Send to all user devices
        const promises = subscriptions.map(async (sub) => {
            try {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: sub.keys as any
                };
                await webpush.sendNotification(pushSubscription, payload);
            } catch (error: any) {
                // If 410 Gone or 404, remove subscription
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await prisma.pushSubscription.delete({
                        where: { id: sub.id }
                    });
                } else {
                    console.error('Error sending push to device:', error);
                }
            }
        });

        await Promise.all(promises);
    } catch (error) {
        console.error('Error in sendPushToUser:', error);
    }
}
