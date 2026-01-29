# Boutique Advisory Platform

A comprehensive multi-tenant platform that connects SMEs with investors through boutique advisory services.

## 🚀 Quick Start (Local Docker)

```bash
# Start all services locally
docker-compose up --build

# Access the platform
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

## 🚂 Deploy to Railway

### Step 1: Create Railway Project

1. Go to [Railway.app](https://railway.app) and create a new project
2. Select "Deploy from GitHub repo"
3. Connect your GitHub repository

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway will automatically create a `DATABASE_URL` variable

### Step 3: Deploy Backend

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Set the **Root Directory** to: `backend`
4. Add these **Environment Variables**:

| Variable | Value |
|----------|-------|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (click "Add Reference") |
| `JWT_SECRET` | *Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`* |
| `JWT_REFRESH_SECRET` | *Generate another secure random string* |
| `FRONTEND_URL` | *(Add after frontend deploys)* |

5. Wait for deployment to complete
6. Copy the backend URL (e.g., `https://backend-xxx.up.railway.app`)

### Step 4: Deploy Frontend

1. Click **"+ New"** → **"GitHub Repo"**
2. Select the same repository
3. Set the **Root Directory** to: `frontend`
4. Add these **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://backend-xxx.up.railway.app` *(your backend URL)* |

5. Wait for deployment to complete

### Step 5: Update Backend CORS

1. Go back to your **Backend** service
2. Add/update the `FRONTEND_URL` variable with your frontend URL:
   - Example: `https://frontend-xxx.up.railway.app`

### Step 6: Generate Custom Domain (Optional)

1. In each service, go to **Settings** → **Domains**
2. Click **"Generate Domain"** for a `*.up.railway.app` URL
3. Or add your own custom domain

---

## 👤 Demo Accounts

After deployment, the database is seeded with demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@boutique-advisory.com | admin123 |
| Advisor | advisor@boutique-advisory.com | advisor123 |
| Investor | investor@boutique-advisory.com | investor123 |
| SME | sme@boutique-advisory.com | sme123 |

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
- PWA support

## 📁 Project Structure

```
boutique-advisory-platform/
├── backend/              # Node.js + Express API
│   ├── src/              # Source code
│   ├── prisma/           # Database schema
│   ├── Dockerfile
│   └── railway.toml      # Railway config
├── frontend/             # Next.js web app
│   ├── src/              # Source code
│   ├── Dockerfile
│   └── railway.toml      # Railway config
└── docker-compose.yml    # Local development
```

## 🔧 Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (Railway sets this) |
| `NODE_ENV` | Yes | `production` for Railway |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | JWT signing key (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token key |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |

## 🔐 Security Notes

- Change demo account passwords after deployment
- Use strong, unique JWT secrets
- Enable SSL (Railway provides this automatically)
- Review CORS settings for your domain

---

**Boutique Advisory Platform** → Connecting SMEs and Investors
