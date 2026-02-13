import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize, requireRole } from '../middleware/authorize';
import { prisma } from '../database';
import { sendNewBookingNotification, sendBookingConfirmation, sendPaymentReceiptEmail } from '../utils/email';

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

// Get single advisory service
router.get('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Handle mock IDs
        if (id === '1') {
            return res.json({ id: '1', name: 'M&A Advisory', description: 'Expert guidance through mergers and acquisitions.', price: 5000, category: 'Financial', duration: '4 weeks', advisor: { name: 'James Wilson' } });
        }
        if (id === '2') {
            return res.json({ id: '2', name: 'Financial Modeling', description: 'Comprehensive financial forecasting and modeling.', price: 2500, category: 'Financial', duration: '1 week', advisor: { name: 'Sarah Chen' } });
        }

        const service = await prisma.advisoryService.findUnique({
            where: { id },
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

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        return res.json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        return res.status(500).json({ error: 'Failed to fetch advisory service' });
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

// Get single advisor
router.get('/advisors/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Mock fallback
        if (id === '1') {
            return res.json({
                id: '1',
                name: 'James Wilson',
                role: 'Financial Expert',
                specialization: ['M&A', 'Valuation'],
                rating: 4.9,
                image: 'https://i.pravatar.cc/150?u=james',
                bio: 'Senior financial advisor with over 15 years of experience in mergers and acquisitions.',
                services: [
                    { id: '1', name: 'M&A Advisory', price: 5000, duration: '4 weeks', category: 'Financial' }
                ]
            });
        }
        if (id === '2') {
            return res.json({
                id: '2',
                name: 'Sarah Chen',
                role: 'Strategic Consultant',
                specialization: ['Market Entry', 'Ops'],
                rating: 4.8,
                image: 'https://i.pravatar.cc/150?u=sarah',
                bio: 'Expert in market entry strategies for Southeast Asia.',
                services: [
                    { id: '2', name: 'Financial Modeling', price: 2500, duration: '1 week', category: 'Financial' }
                ]
            });
        }

        const advisor = await prisma.advisor.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                services: {
                    where: { status: 'ACTIVE' }
                }
            }
        });

        if (!advisor) {
            return res.status(404).json({ error: 'Advisor not found' });
        }

        // Format response
        const formattedAdvisor = {
            ...advisor,
            name: `${advisor.user.firstName} ${advisor.user.lastName}`,
            email: advisor.user.email,
            // Mock additional fields that Schema doesn't have yet
            role: 'Professional Advisor',
            rating: 4.5, // Placeholder
            image: `https://ui-avatars.com/api/?name=${advisor.user.firstName}+${advisor.user.lastName}`,
            bio: 'Experienced advisor on the Boutique Advisory Platform.'
        };

        return res.json(formattedAdvisor);
    } catch (error) {
        console.error('Error fetching advisor:', error);
        return res.status(500).json({ error: 'Failed to fetch advisor' });
    }
});

// Book a service or session
router.post('/book', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { serviceId, serviceName, advisorId, preferredDate, notes, amount } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if service exists in DB, if not, create booking without foreign key
        let actualServiceId = null;
        let actualAdvisorId = null;

        if (serviceId) {
            const serviceExists = await prisma.advisoryService.findUnique({
                where: { id: serviceId }
            });
            if (serviceExists) {
                actualServiceId = serviceId;
            }
        }

        if (advisorId) {
            const advisorExists = await prisma.advisor.findUnique({
                where: { id: advisorId }
            });
            if (advisorExists) {
                actualAdvisorId = advisorId;
            }
        }

        // Enhanced notes with service info if using mock data
        const enhancedNotes = actualServiceId
            ? notes
            : `Service: ${serviceName || 'Consultation'}\n${notes || ''}`;

        // Check availability (prevent double booking)
        if (actualAdvisorId) {
            const bookingDate = new Date(preferredDate);
            const durationMs = 60 * 60 * 1000; // Default 1 hour
            const endTime = new Date(bookingDate.getTime() + durationMs);

            const conflicts = await prisma.booking.findMany({
                where: {
                    advisorId: actualAdvisorId,
                    status: { in: ['CONFIRMED', 'PENDING'] },
                    preferredDate: {
                        gte: new Date(bookingDate.getTime() - durationMs + 1), // Overlap check
                        lt: endTime
                    }
                }
            });

            if (conflicts.length > 0) {
                return res.status(409).json({ error: 'Advisor is not available at this time. Please choose another slot.' });
            }
        }

        const booking = await prisma.booking.create({
            data: {
                userId,
                tenantId: 'default',
                serviceId: actualServiceId,
                advisorId: actualAdvisorId,
                preferredDate: new Date(preferredDate),
                notes: enhancedNotes,
                amount: amount ? parseFloat(amount) : null,
                status: amount ? 'CONFIRMED' : 'PENDING'
            },
            include: {
                service: true,
                advisor: {
                    include: {
                        user: true
                    }
                },
                user: true
            }
        });

        // Send emails
        if (booking.advisor && booking.advisor.user) {
            const clientName = `${booking.user.firstName} ${booking.user.lastName}`;
            const serviceName = booking.service?.name || 'Consultation Session';

            // Notify Advisor
            await sendNewBookingNotification(
                booking.advisor.user.email,
                `${booking.advisor.user.firstName} ${booking.advisor.user.lastName}`,
                clientName,
                serviceName,
                booking.preferredDate,
                enhancedNotes
            );

            // If confirmed (paid), notify User
            if (booking.status === 'CONFIRMED') {
                await sendBookingConfirmation(
                    booking.user.email,
                    clientName,
                    serviceName,
                    `${booking.advisor.user.firstName} ${booking.advisor.user.lastName}`,
                    booking.preferredDate
                );

                if (amount) {
                    await sendPaymentReceiptEmail(
                        booking.user.email,
                        clientName,
                        parseFloat(amount),
                        `Booking: ${serviceName}`,
                        `txn_${Date.now()}` // Mock transaction ID
                    );
                }
            }
        }

        return res.status(201).json({
            message: 'Booking successful',
            booking
        });
    } catch (error) {
        console.error('Booking error:', error);
        return res.status(500).json({ error: 'Failed to process booking' });
    }
});

// Get my bookings (Anyone authenticated can see their own)
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

// ==================== SERVICE MANAGEMENT (For Advisors/Admins) ====================

// Create a new advisory service (Advisor/Admin only)
router.post('/services', authorize('advisory_service.create'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        const { name, category, description, price, duration, features } = req.body;

        // Get advisor profile
        const advisor = await prisma.advisor.findUnique({
            where: { userId }
        });

        if (!advisor) {
            return res.status(403).json({ error: 'Only registered Advisors can create advisory services' });
        }

        const advisorId = advisor.id;

        const service = await prisma.advisoryService.create({
            data: {
                tenantId: 'default',
                advisorId,
                name,
                category,
                description,
                price: parseFloat(price),
                duration,
                features: Array.isArray(features) ? features : [features],
                status: 'ACTIVE'
            },
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

        return res.status(201).json({
            message: 'Service created successfully',
            service
        });
    } catch (error) {
        console.error('Error creating service:', error);
        return res.status(500).json({ error: 'Failed to create service' });
    }
});

// Update an advisory service
router.put('/services/:id', authorize('advisory_service.manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const { id } = req.params;

        // Get the service to check ownership
        const existingService = await prisma.advisoryService.findUnique({
            where: { id },
            include: { advisor: true }
        });

        if (!existingService) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // Check if user owns this service or is admin
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && existingService.advisor.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this service' });
        }

        const { name, category, description, price, duration, features, status } = req.body;

        const service = await prisma.advisoryService.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(category && { category }),
                ...(description && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(duration && { duration }),
                ...(features && { features: Array.isArray(features) ? features : [features] }),
                ...(status && { status })
            },
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

        return res.json({
            message: 'Service updated successfully',
            service
        });
    } catch (error) {
        console.error('Error updating service:', error);
        return res.status(500).json({ error: 'Failed to update service' });
    }
});

// Delete an advisory service
router.delete('/services/:id', authorize('advisory_service.delete'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const { id } = req.params;

        // Get the service to check ownership
        const existingService = await prisma.advisoryService.findUnique({
            where: { id },
            include: { advisor: true }
        });

        if (!existingService) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // Check if user owns this service or is admin
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && existingService.advisor.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this service' });
        }

        // Soft delete by setting status to INACTIVE
        await prisma.advisoryService.update({
            where: { id },
            data: { status: 'INACTIVE' }
        });

        return res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        return res.status(500).json({ error: 'Failed to delete service' });
    }
});

// Get my services (for advisors) - Admins see all
router.get('/my-services', authorize('advisory_service.manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // If Admin, return all services
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
            const allServices = await prisma.advisoryService.findMany({
                include: { advisor: true },
                orderBy: { createdAt: 'desc' }
            });
            return res.json(allServices);
        }

        const advisor = await prisma.advisor.findUnique({
            where: { userId }
        });

        if (!advisor) {
            return res.status(404).json({ error: 'Advisor profile not found' });
        }

        const services = await prisma.advisoryService.findMany({
            where: { advisorId: advisor.id },
            orderBy: { createdAt: 'desc' }
        });

        return res.json(services);
    } catch (error) {
        console.error('Error fetching my services:', error);
        return res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// ==================== CERTIFICATION MANAGEMENT ====================

// Get certification requests (for Advisors/Admins)
router.get('/certifications', authorize('certification.list'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const certifications = await prisma.certification.findMany({
            include: {
                sme: {
                    select: {
                        name: true,
                        sector: true,
                        stage: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ certifications });
    } catch (error) {
        console.error('Error fetching certifications:', error);
        return res.status(500).json({ error: 'Failed to fetch certifications' });
    }
});

// Update certification status
router.patch('/certifications/:id', authorize('certification.approve'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, comments, score } = req.body;

        const certification = await prisma.certification.update({
            where: { id },
            data: {
                status,
                ...(comments && { comments }),
                ...(score && { score: parseFloat(score) })
            },
            include: { sme: true }
        });

        // If approved, update SME status
        if (status === 'APPROVED') {
            await prisma.sME.update({
                where: { id: certification.smeId },
                data: {
                    certified: true,
                    certificationDate: new Date(),
                    status: 'CERTIFIED'
                }
            });
        }

        return res.json({ message: 'Certification updated', certification });
    } catch (error) {
        console.error('Error updating certification:', error);
        return res.status(500).json({ error: 'Failed to update certification' });
    }
});

export default router;
