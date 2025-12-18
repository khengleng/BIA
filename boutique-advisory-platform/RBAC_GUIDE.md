# Role-Based Access Control (RBAC) Guide

## Overview
The Boutique Advisory Platform implements a comprehensive Role-Based Access Control (RBAC) system with 6 distinct user roles, each with specific permissions and capabilities.

---

## User Roles & Permissions

### 1. **SUPER_ADMIN** (System Operator)
**Purpose:** Full system administration and operations management

**Capabilities:**
- ✅ Full access to ALL system features and data
- ✅ Manage all users (create, edit, delete, suspend)
- ✅ Manage all SMEs, Investors, and Advisors
- ✅ Manage all Deals and Transactions
- ✅ Access system configuration and settings
- ✅ View all audit logs and analytics
- ✅ Manage tenants (multi-tenancy)
- ✅ Manage workflows and certifications
- ✅ Access all reports and dashboards
- ✅ Export all data
- ✅ Manage system integrations (DID, Redis, etc.)

**Default Credentials:**
```
Email: superadmin@boutique-advisory.com
Password: SuperAdmin123!
```

---

### 2. **SUPPORT** (Helpdesk Support)
**Purpose:** Customer support and assistance with read-only access

**Capabilities:**
- ✅ View all SMEs (read-only)
- ✅ View all Investors (read-only)
- ✅ View all Deals (read-only)
- ✅ View user profiles (read-only)
- ✅ View documents (read-only)
- ✅ View workflows and certification status
- ✅ Access basic reports
- ❌ **CANNOT** create, edit, or delete any data
- ❌ **CANNOT** access sensitive financial information
- ❌ **CANNOT** manage users or system settings

**Default Credentials:**
```
Email: support@boutique-advisory.com
Password: Support123!
```

---

### 3. **ADMIN** (Platform Administrator)
**Purpose:** Platform management and operations

**Capabilities:**
- ✅ Manage SMEs (create, edit, delete)
- ✅ Manage Investors (create, edit, delete)
- ✅ Manage Advisors (create, edit, delete)
- ✅ Manage Deals (create, edit, delete, approve)
- ✅ View all users (but cannot manage system users)
- ✅ Access all reports and analytics
- ✅ Manage documents
- ✅ Manage workflows
- ✅ Manage certifications
- ❌ **CANNOT** manage system configuration
- ❌ **CANNOT** manage tenants

**Default Credentials:**
```
Email: admin@boutique-advisory.com
Password: Admin123!
```

---

### 4. **ADVISOR** (Advisory User)
**Purpose:** Provide advisory services, certify SMEs, manage deals

**Capabilities:**
- ✅ **View all SMEs** - Browse all registered SMEs
- ✅ **Create SMEs** - Register new SME clients
- ✅ **Edit SMEs** - Update SME profiles and information
- ✅ **Delete SMEs** - Remove SME profiles
- ✅ **Certify SMEs** - Conduct certification assessments
- ✅ **View all Investors** - Browse investor profiles
- ✅ **Create Investors** - Onboard new investors
- ✅ **Edit Investors** - Update investor information
- ✅ **Delete Investors** - Remove investor profiles
- ✅ **View all Deals** - Browse all investment deals
- ✅ **Create Deals** - Create new investment opportunities
- ✅ **Edit Deals** - Update deal information
- ✅ **Delete Deals** - Remove deals
- ✅ **Manage Documents** - Upload/view/delete documents
- ✅ **Access Reports** - View platform analytics and reports
- ✅ **Manage Workflows** - Initiate and manage certification workflows
- ❌ **CANNOT** manage users or system settings

**Default Credentials:**
```
Email: advisor@boutique-advisory.com
Password: Advisor123!
```

**Use Cases:**
- Advisory firms providing business consulting
- Financial advisors helping SMEs prepare for investment
- Certification officers assessing SME readiness
- Deal facilitators managing investor-SME matchmaking

---

### 5. **SME** (SME Owner)
**Purpose:** Manage own SME profile and seek investment opportunities

**Capabilities:**
- ✅ **View own SME profile** - Access and review own business information
- ✅ **Edit own SME profile** - Update business details, financials, etc.
- ✅ **Upload Documents** - Upload pitch decks, financials, business plans
- ✅ **View Investors** - Browse potential investors
- ✅ **View Deals** - View investment opportunities (especially those involving their SME)
- ✅ **Track Certification Status** - Monitor certification progress
- ✅ **View own Workflows** - Track onboarding and certification workflows
- ✅ **Dashboard Access** - View personalized SME dashboard
- ❌ **CANNOT** view other SME profiles
- ❌ **CANNOT** create or edit investors
- ❌ **CANNOT** delete deals
- ❌ **CANNOT** access system-wide reports

**Default Credentials:**
```
Email: sme@boutique-advisory.com
Password: SME123!
```

**Use Cases:**
- Small business owners seeking investment
- Startups looking for funding
- Growing enterprises seeking expansion capital
- Businesses completing certification process

---

### 6. **INVESTOR** (Investor User)
**Purpose:** Discover investment opportunities and manage portfolio

**Capabilities:**
- ✅ **View all certified SMEs** - Browse investment-ready businesses
- ✅ **View SME Details** - Access detailed SME profiles, financials, documents
- ✅ **View all Investors** - Browse other investors (for syndication)
- ✅ **View all Deals** - Browse investment opportunities
- ✅ **Create Deals** - Propose investment deals
- ✅ **Express Interest** - Show interest in specific SMEs/deals
- ✅ **Access Reports** - View investment analytics
- ✅ **Manage own Profile** - Update investor preferences and portfolio
- ✅ **Download Documents** - Access SME pitch decks and financials
- ❌ **CANNOT** create or edit SME profiles
- ❌ **CANNOT** edit deals created by others
- ❌ **CANNOT** access certification workflows

**Default Credentials:**
```
Email: investor@boutique-advisory.com
Password: Investor123!
```

**Use Cases:**
- Angel investors seeking early-stage opportunities
- Venture capital firms managing deal pipelines
- Private equity investors looking for growth companies
- Corporate investors seeking strategic partnerships

---

## API Endpoint Permissions

### SME Endpoints
| Endpoint | Method | SUPER_ADMIN | ADMIN | ADVISOR | SME | INVESTOR | SUPPORT |
|----------|--------|-------------|-------|---------|-----|----------|---------|
| `/api/smes` | GET | ✅ | ✅ | ✅ | ✅ (own only) | ✅ | ✅ |
| `/api/smes/:id` | GET | ✅ | ✅ | ✅ | ✅ (own only) | ✅ | ✅ |
| `/api/smes` | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/api/smes/:id` | PUT | ✅ | ✅ | ✅ | ✅ (own only) | ❌ | ❌ |
| `/api/smes/:id` | DELETE | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### Investor Endpoints
| Endpoint | Method | SUPER_ADMIN | ADMIN | ADVISOR | SME | INVESTOR | SUPPORT |
|----------|--------|-------------|-------|---------|-----|----------|---------|
| `/api/investors` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/investors/:id` | GET | ✅ | ✅ | ✅ | ✅ | ✅ (own only) | ✅ |
| `/api/investors` | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/api/investors/:id` | PUT | ✅ | ✅ | ✅ | ❌ | ✅ (own only) | ❌ |
| `/api/investors/:id` | DELETE | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### Deal Endpoints
| Endpoint | Method | SUPER_ADMIN | ADMIN | ADVISOR | SME | INVESTOR | SUPPORT |
|----------|--------|-------------|-------|---------|-----|----------|---------|
| `/api/deals` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/deals/:id` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/deals` | POST | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `/api/deals/:id` | PUT | ✅ | ✅ | ✅ | ❌ | ✅ (own only) | ❌ |
| `/api/deals/:id` | DELETE | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### Document Endpoints
| Endpoint | Method | SUPER_ADMIN | ADMIN | ADVISOR | SME | INVESTOR | SUPPORT |
|----------|--------|-------------|-------|---------|-----|----------|---------|
| `/api/documents` | GET | ✅ | ✅ | ✅ | ✅ (own only) | ✅ | ✅ |
| `/api/documents/upload` | POST | ✅ | ✅ | ✅ | ✅ (own only) | ❌ | ❌ |
| `/api/documents/:id` | DELETE | ✅ | ✅ | ✅ | ✅ (own only) | ❌ | ❌ |

---

## Default System Users

All default users are automatically created when the backend starts. You can use these credentials to test different roles:

### System Operations
```
Role: SUPER_ADMIN
Email: superadmin@boutique-advisory.com
Password: SuperAdmin123!
Purpose: Full system administration
```

### Support Team
```
Role: SUPPORT
Email: support@boutique-advisory.com
Password: Support123!
Purpose: Customer support and helpdesk
```

### Platform Management
```
Role: ADMIN
Email: admin@boutique-advisory.com
Password: Admin123!
Purpose: Platform operations and management
```

### Advisory Services
```
Role: ADVISOR
Email: advisor@boutique-advisory.com
Password: Advisor123!
Purpose: SME advisory and certification
```

### SME Testing
```
Role: SME
Email: sme@boutique-advisory.com
Password: SME123!
Purpose: SME owner perspective
```

### Investor Testing
```
Role: INVESTOR
Email: investor@boutique-advisory.com
Password: Investor123!
Purpose: Investor perspective
```

---

## Role Hierarchy

```
SUPER_ADMIN (Highest Privilege)
    ↓
  ADMIN
    ↓
  ADVISOR
    ↓
  SUPPORT (Read-only)
    ↓
INVESTOR / SME (Limited to own data)
```

---

## Security Features

### Authentication
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Token expiration (24 hours)
- ✅ Secure HTTP-only cookies (optional)

### Authorization
- ✅ Role-based middleware
- ✅ Resource-level access control
- ✅ Ownership verification (users can only edit their own data)
- ✅ Tenant isolation (multi-tenancy support)

### Additional Security
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation
- ✅ SQL injection prevention (Prisma ORM)

---

## Typical User Workflows

### ADVISOR Workflow
1. Login with advisor credentials
2. Browse SMEs requiring certification
3. Review SME documentation and financials
4. Conduct certification assessment
5. Approve or reject certification
6. Create investment deals for certified SMEs
7. Match SMEs with suitable investors
8. Monitor deal progress

### SME Workflow
1. Register and create account
2. Complete SME profile (business details, financials)
3. Upload required documents (pitch deck, business plan)
4. Submit for certification
5. Wait for advisor review
6. Receive certification approval
7. Browse potential investors
8. Review investment offers
9. Accept deal terms

### INVESTOR Workflow
1. Register and complete KYC
2. Set investment preferences
3. Browse certified SMEs
4. Review SME profiles and documents
5. Express interest in opportunities
6. Create deal proposals
7. Negotiate terms
8. Complete investment
9. Track portfolio performance

---

## Production Deployment

### Environment Variables Required
```bash
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# API Configuration
PORT=4000
NODE_ENV=production
```

### Testing RBAC
1. Use the default credentials above to test each role
2. Verify permissions are correctly enforced
3. Test resource ownership (SME can only edit their own profile)
4. Test workflow transitions (certification, KYC, deals)

---

## Support

For questions or issues with RBAC:
- Contact: support@boutique-advisory.com
- Documentation: See `/DATABASE_INTEGRATION_COMPLETE.md`
- API Documentation: See backend `/src/index.ts`
