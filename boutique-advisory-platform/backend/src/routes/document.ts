
import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../database';
import { authenticateToken } from '../middleware/jwt-auth';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|xlsx|xls|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, XLSX, XLS, JPG, JPEG, PNG files are allowed'));
        }
    }
});

// Upload document
router.post('/upload', authenticateToken, upload.single('file'), async (req: any, res: Response) => {
    try {
        const { name, type, smeId, dealId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const document = await prisma.document.create({
            data: {
                tenantId: 'default',
                name: name || file.originalname,
                type: type || 'OTHER',
                url: `/uploads/${file.filename}`,
                size: file.size,
                mimeType: file.mimetype,
                smeId: smeId || null,
                dealId: dealId || null,
                uploadedBy: req.user.id
            }
        });

        return res.status(201).json(document);
    } catch (error) {
        console.error('Error uploading document:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get document by ID
router.get('/:id', authenticateToken, async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                sme: { select: { userId: true } },
                deal: { select: { sme: { select: { userId: true } } } }
            }
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // SECURITY: Verify access rights
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Admins and Super Admins can access all documents
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        // User uploaded the document
        const isUploader = document.uploadedBy === userId;

        // User owns the SME that the document belongs to
        const isSmeOwner = document.sme?.userId === userId;

        // User owns the SME associated with the deal
        const isDealSmeOwner = document.deal?.sme?.userId === userId;

        // Check if user is an investor in the deal (would need to query dealInvestors)
        let isInvestorInDeal = false;
        if (document.dealId && userRole === 'INVESTOR') {
            const investor = await prisma.investor.findFirst({
                where: { userId }
            });
            if (investor) {
                const dealInvestor = await prisma.dealInvestor.findFirst({
                    where: {
                        dealId: document.dealId,
                        investorId: investor.id,
                        status: { in: ['APPROVED', 'COMPLETED'] }
                    }
                });
                isInvestorInDeal = !!dealInvestor;
            }
        }

        if (!isAdmin && !isUploader && !isSmeOwner && !isDealSmeOwner && !isInvestorInDeal) {
            return res.status(403).json({ error: 'Access denied to this document' });
        }

        // Return document without internal relations
        const { sme, deal, ...documentData } = document as any;
        return res.json(documentData);
    } catch (error) {
        console.error('Get document error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
