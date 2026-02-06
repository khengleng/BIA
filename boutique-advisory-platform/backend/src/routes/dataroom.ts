import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';
import { prisma } from '../database';
import { upload } from '../middleware/upload';
import { uploadFile } from '../utils/fileUpload';

const router = Router();

// Get datarooms (grouped by deal)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Get deals with documents
        const deals = await prisma.deal.findMany({
            where: userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' ? {} : {
                OR: [
                    { sme: { userId } }, // User owns the SME
                    { investors: { some: { investor: { userId } } } } // User is investor
                ]
            },
            include: {
                sme: {
                    select: {
                        id: true,
                        name: true,
                        userId: true
                    }
                },
                documents: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        size: true,
                        mimeType: true,
                        uploadedBy: true,
                        createdAt: true,
                        url: true
                    }
                },
                investors: {
                    select: {
                        investor: {
                            select: {
                                id: true,
                                name: true,
                                userId: true
                            }
                        }
                    }
                }
            }
        });

        // Transform deals into dataroom format
        const dataRooms = deals.map(deal => {
            // Get access list (SME owner + investors)
            const accessList = [
                deal.sme.userId,
                ...deal.investors.map(inv => inv.investor.userId)
            ].filter(Boolean);

            // Format documents
            const documents = deal.documents.map(doc => ({
                id: doc.id,
                name: doc.name,
                category: doc.type,
                size: `${(doc.size / 1024 / 1024).toFixed(2)} MB`,
                uploadedBy: doc.uploadedBy,
                uploadedAt: doc.createdAt.toISOString(),
                accessCount: 0, // TODO: Track in separate table
                lastAccessedBy: null,
                lastAccessedAt: null,
                url: doc.url,
                mimeType: doc.mimeType
            }));

            return {
                id: deal.id,
                dealId: deal.id,
                name: `${deal.title} - Data Room`,
                status: deal.status === 'PUBLISHED' || deal.status === 'NEGOTIATION' ? 'ACTIVE' : 'CLOSED',
                createdBy: deal.sme.name,
                accessList,
                documents,
                activityLog: [], // TODO: Implement activity logging
                createdAt: deal.createdAt.toISOString()
            };
        });

        return res.json(dataRooms);
    } catch (error) {
        console.error('Error fetching data rooms:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Upload document to dataroom (deal)
router.post('/:dealId/documents', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const { name, category } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Verify deal exists and user has access
        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: {
                sme: { select: { userId: true } }
            }
        });

        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        const userId = req.user?.id;
        const userRole = req.user?.role;
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
        const isSmeOwner = deal.sme.userId === userId;

        if (!isAdmin && !isSmeOwner) {
            return res.status(403).json({ error: 'Only the SME owner or admin can upload to this data room' });
        }

        // Upload file to cloud storage
        const uploadResult = await uploadFile(file, `dataroom/${dealId}`);

        // Save document metadata
        const document = await prisma.document.create({
            data: {
                tenantId: req.user?.tenantId || 'default',
                name: name || file.originalname,
                type: category || 'OTHER',
                url: uploadResult.url,
                size: uploadResult.size,
                mimeType: file.mimetype,
                dealId: dealId,
                uploadedBy: req.user!.id
            }
        });

        // Return formatted document
        const formattedDoc = {
            id: document.id,
            name: document.name,
            category: document.type,
            size: `${(document.size / 1024 / 1024).toFixed(2)} MB`,
            uploadedBy: req.user!.id,
            uploadedAt: document.createdAt.toISOString(),
            accessCount: 0,
            lastAccessedBy: null,
            lastAccessedAt: null,
            url: document.url
        };

        return res.status(201).json(formattedDoc);
    } catch (error: any) {
        console.error('Error uploading document to dataroom:', error);
        return res.status(500).json({
            error: 'Failed to upload document',
            details: error.message
        });
    }
});

// Log document access (for tracking)
router.post('/:dealId/documents/:docId/access', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { docId } = req.params;
        const { action } = req.body;

        // Verify document exists
        const document = await prisma.document.findUnique({
            where: { id: docId }
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // TODO: Create ActivityLog table and record access
        // For now, just return success
        console.log(`Document ${docId} ${action} by user ${req.user?.id}`);

        return res.json({
            success: true,
            action,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error logging document access:', error);
        return res.status(500).json({ error: 'Failed to log access' });
    }
});

// Get specific dataroom by deal ID
router.get('/:dealId', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: {
                sme: {
                    select: {
                        id: true,
                        name: true,
                        userId: true
                    }
                },
                documents: {
                    orderBy: { createdAt: 'desc' }
                },
                investors: {
                    select: {
                        investor: {
                            select: {
                                id: true,
                                name: true,
                                userId: true
                            }
                        }
                    }
                }
            }
        });

        if (!deal) {
            return res.status(404).json({ error: 'Data room not found' });
        }

        // Check access
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
        const isSmeOwner = deal.sme.userId === userId;
        const isInvestor = deal.investors.some(inv => inv.investor.userId === userId);

        if (!isAdmin && !isSmeOwner && !isInvestor) {
            return res.status(403).json({ error: 'Access denied to this data room' });
        }

        // Format response
        const accessList = [
            deal.sme.userId,
            ...deal.investors.map(inv => inv.investor.userId)
        ].filter(Boolean);

        const documents = deal.documents.map(doc => ({
            id: doc.id,
            name: doc.name,
            category: doc.type,
            size: `${(doc.size / 1024 / 1024).toFixed(2)} MB`,
            uploadedBy: doc.uploadedBy,
            uploadedAt: doc.createdAt.toISOString(),
            accessCount: 0,
            lastAccessedBy: null,
            lastAccessedAt: null,
            url: doc.url,
            mimeType: doc.mimeType
        }));

        const dataRoom = {
            id: deal.id,
            dealId: deal.id,
            name: `${deal.title} - Data Room`,
            status: deal.status === 'PUBLISHED' || deal.status === 'NEGOTIATION' ? 'ACTIVE' : 'CLOSED',
            createdBy: deal.sme.name,
            accessList,
            documents,
            activityLog: [],
            createdAt: deal.createdAt.toISOString()
        };

        return res.json(dataRoom);
    } catch (error) {
        console.error('Error fetching dataroom:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
