import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';
import { prisma } from '../database';

const router = Router();

// Get all advisory services
router.get('/services', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const services = await prisma.advisoryService.findMany({
            where: { status: 'ACTIVE' },
            include: {
                advisor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true
                    }
                }
            }
        });

        // Fallback to mock data if DB is empty
        if (services.length === 0) {
            return res.json([
                { id: '1', name: 'M&A Advisory', description: 'Expert guidance through mergers and acquisitions.', price: 5000, category: 'Financial', duration: '4 weeks' },
                { id: '2', name: 'Financial Modeling', description: 'Comprehensive financial forecasting and modeling.', price: 2500, category: 'Financial', duration: '1 week' }
            ]);
        }

        return res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        return res.status(500).json({ error: 'Failed to fetch advisory services' });
    }
});

// Get all advisors
router.get('/advisors', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const advisors = await prisma.advisor.findMany({
            where: { status: 'ACTIVE' },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                services: true
            }
        });

        if (advisors.length === 0) {
            return res.json([
                { id: '1', name: 'James Wilson', role: 'Financial Expert', specialization: ['M&A', 'Valuation'], rating: 4.9, image: 'https://i.pravatar.cc/150?u=james' },
                { id: '2', name: 'Sarah Chen', role: 'Strategic Consultant', specialization: ['Market Entry', 'Ops'], rating: 4.8, image: 'https://i.pravatar.cc/150?u=sarah' }
            ]);
        }

        return res.json(advisors);
    } catch (error) {
        console.error('Error fetching advisors:', error);
        return res.status(500).json({ error: 'Failed to fetch advisors' });
    }
});

// Book a service or session
router.post('/book', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { serviceId, advisorId, preferredDate, notes, amount } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const booking = await prisma.booking.create({
            data: {
                userId,
                tenantId: 'default', // Using default tenant for now
                serviceId: serviceId || null,
                advisorId: advisorId || null,
                preferredDate: new Date(preferredDate),
                notes,
                amount: amount ? parseFloat(amount) : null,
                status: 'PENDING'
            },
            include: {
                service: true,
                advisor: true
            }
        });

        return res.status(201).json({
            message: 'Booking successful',
            booking
        });
    } catch (error) {
        console.error('Booking error:', error);
        return res.status(500).json({ error: 'Failed to process booking' });
    }
});

// Get my bookings
router.get('/my-bookings', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                service: true,
                advisor: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

export default router;
