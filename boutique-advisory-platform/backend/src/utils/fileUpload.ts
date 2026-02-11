import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// Initialize S3 Client (works with both AWS S3 and Cloudflare R2)
const s3Client = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT, // For Cloudflare R2 or custom S3 endpoint
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'bia-documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/csv',
];

/**
 * Generate a unique filename to prevent collisions
 */
function generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');

    return `${sanitizedName}_${timestamp}_${randomString}${ext}`;
}

/**
 * Validate file before upload
 */
export function validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return { valid: false, error: 'File type not allowed' };
    }

    return { valid: true };
}

/**
 * Upload file to S3/R2
 */
export async function uploadFile(
    file: Express.Multer.File,
    folder: string = 'documents'
): Promise<{ url: string; key: string; size: number }> {
    const validation = validateFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const filename = generateUniqueFilename(file.originalname);
    const key = `${folder}/${filename}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
            // Sanitize original name to avoid non-ASCII metadata issues
            originalName: encodeURIComponent(file.originalname),
            uploadedAt: new Date().toISOString(),
        },
    });

    await s3Client.send(command);

    // Generate public URL (adjust based on your S3/R2 configuration)
    const publicUrl = process.env.S3_PUBLIC_URL
        ? `${process.env.S3_PUBLIC_URL}/${key}`
        : `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

    return {
        url: publicUrl,
        key: key,
        size: file.size,
    };
}

/**
 * Delete file from S3/R2
 */
export async function deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await s3Client.send(command);
}

/**
 * Generate a presigned URL for temporary file access
 * Useful for private files that need temporary access
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
    const mimeMap: Record<string, string> = {
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'text/csv': '.csv',
    };

    return mimeMap[mimeType] || '';
}
