# File Upload Implementation Guide

## ✅ What's Implemented

The platform now has **full cloud storage integration** for file uploads using S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.).

### Features:
- ✅ File upload to cloud storage (S3/R2)
- ✅ File validation (type, size)
- ✅ Secure presigned URLs for downloads
- ✅ File deletion
- ✅ Access control
- ✅ Data Room integration
- ✅ Document management

---

## 🔧 Setup Instructions

### Option 1: Cloudflare R2 (Recommended - Free Tier Available)

1. **Create Cloudflare R2 Bucket**:
   - Go to https://dash.cloudflare.com/
   - Navigate to R2 Object Storage
   - Create a new bucket named `bia-documents`

2. **Get API Credentials**:
   - Click "Manage R2 API Tokens"
   - Create a new API token with read/write permissions
   - Copy the Access Key ID and Secret Access Key

3. **Update `.env` file**:
   ```bash
   S3_ENDPOINT=https://YOUR-ACCOUNT-ID.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_ACCESS_KEY_ID=your-r2-access-key-id
   S3_SECRET_ACCESS_KEY=your-r2-secret-access-key
   S3_BUCKET_NAME=bia-documents
   S3_PUBLIC_URL=https://your-custom-domain.com  # Optional
   ```

4. **Custom Domain (Optional)**:
   - In R2 settings, add a custom domain
   - Update `S3_PUBLIC_URL` with your domain

---

### Option 2: AWS S3

1. **Create S3 Bucket**:
   - Go to AWS Console → S3
   - Create bucket named `bia-documents`
   - Set appropriate permissions

2. **Create IAM User**:
   - Go to IAM → Users → Create User
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Generate access keys

3. **Update `.env` file**:
   ```bash
   S3_ENDPOINT=  # Leave empty for AWS S3
   S3_REGION=us-east-1  # Your AWS region
   S3_ACCESS_KEY_ID=your-aws-access-key-id
   S3_SECRET_ACCESS_KEY=your-aws-secret-access-key
   S3_BUCKET_NAME=bia-documents
   S3_PUBLIC_URL=https://bia-documents.s3.us-east-1.amazonaws.com
   ```

---

### Option 3: MinIO (Local Development)

1. **Run MinIO with Docker**:
   ```bash
   docker run -d \
     -p 9000:9000 \
     -p 9001:9001 \
     --name minio \
     -e "MINIO_ROOT_USER=minioadmin" \
     -e "MINIO_ROOT_PASSWORD=minioadmin" \
     minio/minio server /data --console-address ":9001"
   ```

2. **Create Bucket**:
   - Open http://localhost:9001
   - Login with `minioadmin` / `minioadmin`
   - Create bucket named `bia-documents`
   - Set bucket to public (for development)

3. **Update `.env` file**:
   ```bash
   S3_ENDPOINT=http://localhost:9000
   S3_REGION=us-east-1
   S3_ACCESS_KEY_ID=minioadmin
   S3_SECRET_ACCESS_KEY=minioadmin
   S3_BUCKET_NAME=bia-documents
   S3_PUBLIC_URL=http://localhost:9000/bia-documents
   ```

---

## 📝 API Endpoints

### Upload Document
```bash
POST /api/documents/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- file: <file>
- name: "Document Name" (optional)
- type: "PITCH_DECK" | "FINANCIAL_STATEMENT" | "BUSINESS_PLAN" | "LEGAL_DOCUMENT" | "OTHER"
- smeId: <sme-id> (optional)
- dealId: <deal-id> (optional)
```

### Get Document
```bash
GET /api/documents/:id
Authorization: Bearer <token>
```

### Download Document (Presigned URL)
```bash
GET /api/documents/:id/download
Authorization: Bearer <token>

Response:
{
  "url": "https://presigned-url...",
  "expiresIn": 3600,
  "filename": "document.pdf"
}
```

### Delete Document
```bash
DELETE /api/documents/:id
Authorization: Bearer <token>
```

### Upload to Data Room
```bash
POST /api/dataroom/:dealId/documents
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- file: <file>
- name: "Document Name" (optional)
- category: "Financials" | "Legal" | "General" | etc.
```

---

## 🧪 Testing

### Test File Upload (cURL)
```bash
# Login first
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@boutique-advisory.com","password":"BIA_Local_Admin_123!"}' \
  | jq -r '.token')

# Upload file
curl -X POST http://localhost:3001/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/document.pdf" \
  -F "name=Test Document" \
  -F "type=PITCH_DECK"
```

### Test from Frontend
The frontend already has upload UI in:
- `/dataroom` - Data Room page
- Document upload components

---

## 🔒 Security Features

1. **File Type Validation**: Only allows PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, CSV
2. **File Size Limit**: 10MB maximum
3. **Access Control**: Role-based access to documents
4. **Presigned URLs**: Temporary, secure download links
5. **Unique Filenames**: Prevents collisions and overwrites

---

## 📊 File Storage Structure

```
bia-documents/
├── sme/
│   └── <sme-id>/
│       └── document_timestamp_hash.pdf
├── deal/
│   └── <deal-id>/
│       └── document_timestamp_hash.pdf
├── dataroom/
│   └── <deal-id>/
│       └── document_timestamp_hash.pdf
└── general/
    └── document_timestamp_hash.pdf
```

---

## 🚀 Production Deployment

### Railway.com Setup

1. **Add Environment Variables** in Railway:
   ```
   S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_ACCESS_KEY_ID=<your-key>
   S3_SECRET_ACCESS_KEY=<your-secret>
   S3_BUCKET_NAME=bia-documents-prod
   S3_PUBLIC_URL=https://cdn.yourdomain.com
   ```

2. **Deploy**: Push to GitHub, Railway auto-deploys

---

## 🐛 Troubleshooting

### Error: "Failed to upload document"
- Check S3 credentials in `.env`
- Verify bucket exists
- Check bucket permissions

### Error: "Invalid file type"
- Only specific file types are allowed
- Check `ALLOWED_MIME_TYPES` in `fileUpload.ts`

### Error: "File size exceeds limit"
- Current limit is 10MB
- Adjust `MAX_FILE_SIZE` in `fileUpload.ts` if needed

---

## 📈 Next Steps

1. ✅ **File Upload** - COMPLETE
2. 🔄 **Activity Logging** - Track document views/downloads
3. 🔄 **Thumbnails** - Generate previews for images/PDFs
4. 🔄 **Virus Scanning** - Add ClamAV or similar
5. 🔄 **Bulk Upload** - Multiple files at once

---

## 💡 Tips

- **Development**: Use MinIO for free local testing
- **Production**: Cloudflare R2 has generous free tier (10GB storage, 0 egress fees)
- **AWS S3**: More expensive but more features
- **Custom Domain**: Improves branding and SEO

---

**File Upload Implementation: ✅ COMPLETE**
