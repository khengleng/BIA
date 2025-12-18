# Boutique Advisory Platform

A comprehensive multi-tenant platform that connects SMEs with investors through boutique advisory services, leveraging existing DID, CM, and RWA infrastructure.

## 🚀 Overview

The Boutique Advisory Platform is designed to bridge the gap between Small & Medium Enterprises (SMEs) and investors by providing:

- **Multi-tenant architecture** with isolated data, branding, and user management
- **Workflow automation** for SME certification, investor onboarding, and deal management
- **Multi-language support** (English, Khmer, Chinese)
- **Integration with existing infrastructure** (DID, CM, RWA)
- **Comprehensive advisory services** including investment readiness and governance support

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js + Express (TypeScript)
- PostgreSQL with Prisma ORM
- Redis for caching
- Temporal for workflow orchestration
- AWS S3 for document storage

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod validation
- React i18next for internationalization

**Infrastructure Integration:**
- **DID Infrastructure**: Verifiable credentials, workflow engine, attestation services
- **CM Infrastructure**: Case management, user management, audit logs
- **RWA Infrastructure**: Tokenization, investment management, compliance

### Multi-Tenant Design

The platform supports multiple organizations with:
- Isolated databases per tenant
- Custom branding and themes
- Role-based access control
- Tenant-specific workflows and configurations

## 🔧 Setup & Installation

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis
- Docker (for existing infrastructure)
- AWS S3 bucket (for document storage)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update environment variables
# Configure database, AWS, and external service URLs

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration

Create `.env` files in both backend and frontend directories:

**Backend (.env):**
```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:password@localhost:1002/boutique_advisory"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=boutique-advisory-documents

# Redis
REDIS_URL=redis://localhost:1003

# External Services
DID_API_GATEWAY_URL=http://localhost:8080
CM_PORTAL_URL=http://localhost:3000
RWA_API_URL=http://localhost:9000

# Multi-language
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,km,zh
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:1000
NEXT_PUBLIC_DID_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_CM_PORTAL_URL=http://localhost:3000
NEXT_PUBLIC_RWA_API_URL=http://localhost:9000
```

## 🔗 Infrastructure Integration

### DID Infrastructure Integration

The platform integrates with the existing DID infrastructure for:

- **Verifiable Credentials**: SME certifications, investor KYC
- **Workflow Engine**: Automated approval processes
- **Attestation Services**: Deal approvals and compliance
- **User Identity**: DID-based user authentication

```typescript
// Example: Creating SME certification credential
const credential = await DIDService.createSMECertificationCredential(
  smeId,
  advisorId,
  certificationData
);
```

### CM Infrastructure Integration

Case management integration provides:

- **User Management**: Centralized user authentication via Keycloak
- **Case Tracking**: SME onboarding and certification workflows
- **Audit Logs**: Comprehensive activity tracking
- **Workflow Orchestration**: Automated task assignments

```typescript
// Example: Creating case for SME onboarding
const case = await CMService.createCase(
  'SME_ONBOARDING',
  smeData,
  assignedAdvisorId
);
```

### RWA Infrastructure Integration

Real World Assets integration enables:

- **Tokenization**: Converting SME equity into digital tokens
- **Investment Management**: Portfolio tracking and reporting
- **Compliance**: Regulatory reporting and monitoring
- **Trading**: Secondary market for SME tokens

```typescript
// Example: Creating RWA token for SME
const token = await RWAService.createToken(smeId, {
  symbol: 'SME001',
  name: 'SME Token',
  totalSupply: 1000000,
  decimals: 18,
  metadata: { smeId, sector, stage }
});
```

## 📊 Core Features

### 1. SME Module
- Registration and onboarding forms
- Document upload (pitch decks, financials, business plans)
- Scoring model (governance, financial health, readiness)
- Certification workflow with advisor validation

### 2. Investor Module
- Registration with KYC/AML integration
- Investment preferences and portfolio management
- Access to certified SMEs
- Secure messaging and Q&A with SMEs

### 3. Advisory Module
- Advisor dashboard with SME pipeline
- Workflow checklists and gap analysis
- Automated reminders and approvals
- Maker-checker logic for certifications

### 4. Deal Room & Matchmaking
- Centralized deal room for certified SMEs
- AI-powered matchmaking engine
- Deal structuring tools and term sheets
- Valuation and due diligence support

### 5. Multi-Language Support
- English, Khmer, and Chinese interfaces
- Dynamic language switching
- Localized notifications and reports
- RTL support for Khmer language

### 6. Workflow Automation
- SME onboarding workflows
- Investor verification processes
- Deal approval workflows
- Compliance monitoring

## 🔐 Security & Compliance

- **Multi-tenant isolation** with strict data boundaries
- **Role-based access control** (SME, Investor, Advisor, Admin)
- **KYC/AML integration** for investor verification
- **Audit logging** for all activities
- **DID-based authentication** for enhanced security
- **Encrypted document storage** in AWS S3

## 📈 Reporting & Analytics

- **Dashboard metrics** for all user types
- **KPI tracking** and performance monitoring
- **Quarterly investor reports** with ROI analysis
- **SME performance tracking**
- **Compliance reporting** for regulatory requirements

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual services
docker build -t boutique-advisory-backend ./backend
docker build -t boutique-advisory-frontend ./frontend
```

### Port Configuration

The platform uses the following ports in the 1000-2000 range:

- **Frontend**: http://localhost:1001
- **Backend API**: http://localhost:1000
- **PostgreSQL Database**: localhost:1002
- **Redis Cache**: localhost:1003
- **PgAdmin**: http://localhost:1004

### Production Considerations

- Use environment-specific configurations
- Set up proper SSL/TLS certificates
- Configure database backups and monitoring
- Set up CI/CD pipelines
- Implement proper logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Blockchain Integration**: Smart contracts for deal execution
- **AI/ML**: Enhanced matchmaking and risk assessment
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Predictive modeling and insights
- **API Marketplace**: Third-party integrations

---

**Boutique Advisory Platform** → Bridging SMEs and Investors with trust, governance, and smart technology.
