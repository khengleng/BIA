# Boutique Advisory Platform

A comprehensive multi-tenant platform that connects SMEs with investors through boutique advisory services.

## 🚀 Quick Start (Local Docker)

```bash
# Start all services locally
docker-compose up --build

# Access the platform
# Frontend: http://localhost:3002
# Backend:  http://localhost:3003
```

## 🛠️ Local Development & GCP Readiness

This platform is configured to run in Docker containers, making it easy to deploy to any cloud provider like **Google Cloud Platform (GCP)**, AWS, or Azure.

### Local Setup
1. Ensure Docker Desktop is installed and running.
2. Clone the repository and run `docker-compose up --build`.

### GCP Porting Plan (Coming Soon)
1. Build frontend and backend Docker images.
2. Push images to **Google Artifact Registry**.
3. Deploy to **Cloud Run** or **Google Kubernetes Engine (GKE)**.
4. Use **Cloud SQL** (PostgreSQL) for the database.

---

## 👤 Demo Accounts

After deployment, the database is automatically seeded. All initial accounts use the `INITIAL_ADMIN_PASSWORD` set in `docker-compose.yml`.

**Default Password:** `BIA_Local_Admin_123!`

| Role | Email |
|------|-------|
| Admin | admin@boutique-advisory.com |
| Advisor | advisor@boutique-advisory.com |
| Investor | investor@boutique-advisory.com |
| SME | sme@boutique-advisory.com |


## 📊 Features

### Core Modules
- **SME Management** - Registration, certification, scoring
- **Investor Portal** - KYC, portfolio management
- **Advisory Dashboard** - Pipeline management, workflows
- **Deal Room** - Matchmaking, deal structuring

### Advanced Features
- **Syndicates** - Group investing (AngelList-style)
- **Due Diligence** - Scoring and risk assessment
- **Community** - Posts, comments, engagement
- **Secondary Trading** - Share marketplace

### Platform Features
- Multi-tenant architecture
- Role-based access control (6 roles)
- Multi-language support (EN, KM, ZH)
- PWA support (Service Workers & Offline access)
- **Cloud File Storage** - S3/R2 integration for documents
- **Secure Downloads** - Presigned URLs with access control
- **Email Notifications** - Automated emails via Resend (welcome, password reset, notifications)

## 📁 Project Structure

```
boutique-advisory-platform/
├── backend/              # Node.js + Express API
│   ├── src/              # Source code
│   ├── prisma/           # Database schema & migrations
│   └── Dockerfile        # Production Docker config
├── frontend/             # Next.js web app
│   ├── src/              # Source code
│   └── Dockerfile        # Production Docker config
└── docker-compose.yml    # Local multi-container setup
```

## 🔧 Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 3001) |
| `NODE_ENV` | Yes | `production` for cloud, `development` for local |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | JWT signing key (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token key |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `INITIAL_ADMIN_PASSWORD` | Yes | Password for local admin creation |
| `S3_ENDPOINT` | Optional | S3/R2 endpoint URL for file storage |
| `S3_REGION` | Optional | S3 region (use 'auto' for Cloudflare R2) |
| `S3_ACCESS_KEY_ID` | Optional | S3/R2 access key |
| `S3_SECRET_ACCESS_KEY` | Optional | S3/R2 secret key |
| `S3_BUCKET_NAME` | Optional | S3/R2 bucket name |
| `RESEND_API_KEY` | Optional | Resend API key for email notifications |
| `EMAIL_FROM` | Optional | Sender email address (default: contact@cambobia.com) |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (passed as build arg) |

## 🔐 Security Notes

- Change demo account passwords after first setup.
- Use strong, unique JWT secrets in production.
- Review CORS settings in `docker-compose.yml` or cloud config.
- Databases should always use SSL in production (`sslmode=require`).

### Encryption & Data Protection

The platform implements **AES-256-GCM** encryption for sensitive Personally Identifiable Information (PII) at rest.

- **Algorithm**: AES-256-GCM (Galois/Counter Mode) gives both confidentiality and integrity.
- **Key Management**: Uses `ENCRYPTION_KEY` environment variable (32-byte hex string).
- **Implementation**:
    - Random 12-byte IV (Initialization Vector) generated for every encryption.
    - Authentication Tag stored with cipher text to prevent tampering.
- **Scope**:
    - **Investor KYC Data**: Identity Numbers (National ID/Passport) are encrypted before storage.
    - **API Responses**: Sensitive PII is automatically decrypted for authorized owners/admins but masked or omitted for others.

### Data Masking

- **List Views**: Sensitive fields (like ID numbers, phone numbers) are stripped from all list API responses.
- **Role-Based Access**:
    - **Investors**: Can only view/decrypt their own data.
    - **Admins**: Can view/decrypt all user data for compliance.
    - **Public/Other Users**: Receive sanitized objects with sensitive fields removed.

---

**Boutique Advisory Platform** → Connecting SMEs and Investors
