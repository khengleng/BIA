# Boutique Advisory Platform - Backend

## Overview

This is the backend API for the Boutique Advisory Platform, a system connecting SMEs with investors through a comprehensive advisory and matchmaking platform.

## Database Configuration

**IMPORTANT:** This application **ALWAYS uses PostgreSQL** for data persistence. In-memory mode has been disabled to ensure data is never lost.

### Database Requirements

- **PostgreSQL 16+** (required)
- **Redis 7+** (for caching and sessions)

### Database Setup

#### Option 1: Using Docker Compose (Recommended)

The easiest way to run the application with all dependencies:

```bash
# From the project root directory
docker-compose up -d

# This will start:
# - PostgreSQL on port 1002 (mapped from 5432)
# - Redis on port 1003 (mapped from 6379)
# - PgAdmin on port 1004 (for database management)
# - Backend API on port 1000 (mapped from 4000)
# - Frontend on port 1001 (mapped from 3000)
```

#### Option 2: Local PostgreSQL Installation

If you prefer to run PostgreSQL locally:

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql@16
   brew services start postgresql@16
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-16
   sudo systemctl start postgresql
   ```

2. **Create Database:**
   ```bash
   psql -U postgres
   CREATE DATABASE boutique_advisory;
   \q
   ```

3. **Update .env file:**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/boutique_advisory?schema=public"
   ```

### Database Migration

The application **automatically runs migrations** on startup if the database is empty. You can also run migrations manually:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Seed database with test data
npm run db:seed
```

### Prisma Studio

To view and edit database data using Prisma Studio:

```bash
npm run db:studio
```

This will open a web interface at `http://localhost:5555`

## Environment Variables

Copy the example environment file and update with your values:

```bash
cp env.example .env
```

### Required Environment Variables

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration (REQUIRED)
DATABASE_URL="postgresql://postgres:password@localhost:5432/boutique_advisory?schema=public"

# Redis Configuration (REQUIRED)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# AWS S3 Configuration (for document storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=boutique-advisory-documents
```

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Build the application
npm run build
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with hot-reload on `http://localhost:4000`

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout (clear session)
- `GET /api/auth/me` - Get current user profile

### Migration Management
- `GET /api/migration/status` - Check migration status
- `POST /api/migration/perform` - Manually trigger migration

### SME Management
- `GET /api/smes` - List all SMEs
- `POST /api/smes` - Create new SME profile
- `GET /api/smes/:id` - Get SME details
- `PUT /api/smes/:id` - Update SME profile
- `DELETE /api/smes/:id` - Delete SME profile

### Investor Management
- `GET /api/investors` - List all investors
- `POST /api/investors` - Create investor profile
- `GET /api/investors/:id` - Get investor details
- `PUT /api/investors/:id` - Update investor profile

### Deal Management
- `GET /api/deals` - List all deals
- `POST /api/deals` - Create new deal
- `GET /api/deals/:id` - Get deal details
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

### Advanced Features
- `GET /api/syndicates` - Investor syndicates
- `GET /api/due-diligence` - Due diligence assessments
- `GET /api/community` - Community posts and discussions
- `GET /api/secondary-trading` - Secondary market listings
- `GET /api/notifications` - User notifications
- `GET /api/dashboard` - Dashboard analytics

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

- **Tenant** - Multi-tenant support
- **User** - User accounts with role-based access
- **SME** - Small and Medium Enterprise profiles
- **Investor** - Investor profiles with preferences
- **Advisor** - Advisory professionals
- **Deal** - Investment deals and opportunities
- **Syndicate** - Investor syndicates (like AngelList)
- **DueDiligence** - Due diligence assessments
- **CommunityPost** - Community engagement
- **SecondaryListing** - Secondary market trading

See `prisma/schema.prisma` for the complete schema.

## Test Users

After migration, the following test users are available:

| Email | Password | Role |
|-------|----------|------|
| admin@boutique-advisory.com | admin123 | ADMIN |
| advisor@boutique-advisory.com | admin123 | ADVISOR |
| investor@boutique-advisory.com | admin123 | INVESTOR |
| sme@boutique-advisory.com | admin123 | SME |

## Architecture

### Technology Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 16+ with Prisma ORM
- **Cache:** Redis 7+
- **Authentication:** JWT with secure cookies
- **Security:** Helmet, CORS, CSRF protection, Rate limiting
- **File Upload:** Multer with AWS S3 integration

### Key Features
- Multi-tenant architecture
- Role-based access control (RBAC)
- Investor-SME matchmaking algorithm
- Virtual data rooms
- Deal pipeline management
- Messaging system
- Calendar and scheduling
- Document management
- Notification system

## Troubleshooting

### Database Connection Issues

If you see errors about database connection:

1. **Check if PostgreSQL is running:**
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   
   # Docker
   docker ps | grep postgres
   ```

2. **Verify DATABASE_URL in .env:**
   - Ensure the connection string is correct
   - Check username, password, host, and port
   - Test connection: `psql $DATABASE_URL`

3. **Check database exists:**
   ```bash
   psql -U postgres -l | grep boutique_advisory
   ```

### Migration Issues

If migrations fail:

1. **Reset database (development only):**
   ```bash
   npx prisma migrate reset
   ```

2. **Force push schema:**
   ```bash
   npx prisma db push --force-reset
   ```

3. **Check Prisma logs:**
   ```bash
   DEBUG="prisma:*" npm run dev
   ```

## Development

### Code Structure

```
backend/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── database.ts           # Prisma client initialization
│   ├── migration-manager.ts  # Database migration logic
│   └── routes/               # API route handlers
│       ├── syndicates.ts
│       ├── duediligence.ts
│       ├── community.ts
│       ├── secondary-trading.ts
│       ├── notifications.ts
│       └── dashboard.ts
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding script
├── uploads/                  # Local file uploads (temp)
└── dist/                     # Compiled JavaScript output
```

### Adding New Features

1. Update Prisma schema in `prisma/schema.prisma`
2. Run `npm run db:generate` to update Prisma Client
3. Create migration: `npm run db:migrate`
4. Add route handlers in `src/routes/`
5. Register routes in `src/index.ts`

## Deployment

### Environment-Specific Configuration

The application supports multiple environments:

- **Development:** `.env`
- **Staging:** `.env.staging`
- **Production:** Set environment variables in your hosting platform

### Docker Deployment

```bash
# Build image
docker build -t boutique-advisory-backend .

# Run container
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  boutique-advisory-backend
```

### Railway/Heroku Deployment

1. Set environment variables in platform dashboard
2. Ensure DATABASE_URL is set (usually auto-configured)
3. Deploy from Git repository
4. Migrations run automatically on startup

## Security Considerations

- **JWT Secrets:** Always use strong, random secrets in production
- **Database Credentials:** Never commit credentials to version control
- **CORS:** Configure allowed origins for production
- **Rate Limiting:** Adjust limits based on your needs
- **CSRF Protection:** Enabled by default with secure cookies
- **Helmet:** Security headers configured

## License

MIT

## Support

For issues and questions, please contact the development team or create an issue in the repository.
