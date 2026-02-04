# 🛠️ Running Locally (Without Full Docker)

If you prefer to run the application directly on your machine using `npm` instead of Docker Compose, follow these steps.

## 1. Prerequisites
- **Node.js** (v20+ recommended)
- **PostgreSQL** running locally (or use the helper script below to run only the database in Docker)

## 2. Setup Database
If you don't have PostgreSQL installed on your Mac, you can run just the database using Docker:
```bash
# From the root directory:
docker run --name bia-postgres -e POSTGRES_USER=bia_user -e POSTGRES_PASSWORD=bia_secret_password -e POSTGRES_DB=bia_development -p 5432:5432 -d postgres:15-alpine
```

## 3. Install Dependencies
```bash
npm run install:all
```

## 4. Prepare Database
```bash
npm run db:setup
```

## 5. Start Development Servers
```bash
npm run dev
```

The platform will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:3001](http://localhost:3001)

---

## 👤 Login Credentials
All demo accounts use the default password: `BIA_Local_Admin_123!` (or whatever is in `backend/src/migration-manager.ts`).

- **Admin**: admin@boutique-advisory.com
- **Advisor**: advisor@boutique-advisory.com
- **Investor**: investor@boutique-advisory.com
- **SME**: sme@boutique-advisory.com
