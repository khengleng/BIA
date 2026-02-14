import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// --- Provider Selection Logic ---
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_SERVICE_ACCOUNT_JSON ? 'GCS' : 'S3');

// --- S3 Configuration ---
const s3Client = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT, // For Cloudflare R2 or custom S3 endpoint
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
});

// --- GCS Configuration ---
let gcsClient: Storage | null = null;
if (STORAGE_PROVIDER === 'GCS') {
    try {
        // Option 1: Using a JSON key file path
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
            gcsClient = new Storage();
        }
        // Option 2: Using JSON content directly from env (useful for Railway)
        else if (process.env.GCP_SERVICE_ACCOUNT_JSON) {
            const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);
            gcsClient = new Storage({
                projectId: credentials.project_id,
                credentials
            });
        }
        console.log('✅ Google Cloud Storage initialized');
    } catch (error) {
        console.error('❌ Failed to initialize GCS:', error);
    }
}

const BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'bia-documents';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // Increased to 50MB for business documents
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
 * Upload file to GCS or S3
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

    if (STORAGE_PROVIDER === 'GCS' && gcsClient) {
        // --- GCS UPLOAD ---
        const bucket = gcsClient.bucket(BUCKET_NAME);
        const gcsFile = bucket.file(key);

        await gcsFile.save(file.buffer, {
            contentType: file.mimetype,
            metadata: {
                originalName: encodeURIComponent(file.originalname),
                uploadedAt: new Date().toISOString(),
            }
        });

        // Make public if configured (GCS standard is usually private, so we use publicUrl env)
        const publicUrl = process.env.STORAGE_PUBLIC_BASE_URL
            ? `${process.env.STORAGE_PUBLIC_BASE_URL}/${key}`
            : `https://storage.googleapis.com/${BUCKET_NAME}/${key}`;

        return { url: publicUrl, key, size: file.size };
    } else {
        // --- S3 UPLOAD ---
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            Metadata: {
                originalName: encodeURIComponent(file.originalname),
                uploadedAt: new Date().toISOString(),
            },
        });

        await s3Client.send(command);

        const publicUrl = process.env.S3_PUBLIC_URL
            ? `${process.env.S3_PUBLIC_URL}/${key}`
            : `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

        return { url: publicUrl, key, size: file.size };
    }
}

/**
 * Delete file
 */
export async function deleteFile(key: string): Promise<void> {
    if (STORAGE_PROVIDER === 'GCS' && gcsClient) {
        await gcsClient.bucket(BUCKET_NAME).file(key).delete();
    } else {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        await s3Client.send(command);
    }
}

/**
 * Generate a presigned URL
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (STORAGE_PROVIDER === 'GCS' && gcsClient) {
        const [url] = await gcsClient.bucket(BUCKET_NAME).file(key).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + expiresIn * 1000,
        });
        return url;
    } else {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        return await getSignedUrl(s3Client, command, { expiresIn });
    }
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
