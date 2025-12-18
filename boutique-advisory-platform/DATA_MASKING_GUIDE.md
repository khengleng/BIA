# Data Masking & Privacy Protection Guide

## Overview
The Boutique Advisory Platform implements comprehensive **role-based data masking** to protect sensitive information. Different user roles see different levels of detail based on their permissions and data ownership.

---

## 🔒 What Gets Masked?

### 1. **Email Addresses**
**Original:** `john.doe@example.com`  
**Masked:** `j***@example.com`

**Who sees full email:**
- ✅ SUPER_ADMIN
- ✅ ADMIN
- ✅ ADVISOR
- ✅ Data owner (their own email)
- ❌ SUPPORT (masked)
- ❌ Other SMEs/Investors (masked)

---

### 2. **Phone Numbers**
**Original:** `+855-12-345-678`  
**Masked:** `+855-**-***-678`

**Who sees full phone:**
- ✅ SUPER_ADMIN
- ✅ ADMIN
- ✅ ADVISOR
- ✅ Data owner
- ❌ SUPPORT (masked)
- ❌ Other users (masked)

---

### 3. **Financial Information**

#### Funding/Investment Amounts
**Original:** `$1,000,000`  
**Masked:** `$1,XXX,XXX` or `~$1M` (approximate)

**Who sees exact amounts:**
- ✅ SUPER_ADMIN
- ✅ ADMIN
- ✅ ADVISOR (needs for advisory)
- ✅ Deal parties (SME owner + participating investors)
- ❌ SUPPORT (masked)
- ❌ Other users (approximate only)

#### Equity Percentages
**Original:** `25.5%`  
**Masked:** `~25%` (rounded to nearest 5%)

#### Revenue/Valuation
**Original:** `$5,234,567`  
**Masked:** `$***,***,***` or `$5M+`

**Who sees exact values:**
- ✅ SUPER_ADMIN
- ✅ ADMIN
- ✅ ADVISOR
- ✅ SME owner (their own data)
- ❌ SUPPORT (fully masked)
- ❌ Investors (approximate only until deal participation)

---

### 4. **Personal Identification Numbers**

#### National ID / Tax ID
**Original:** `123-456-7890`  
**Masked:** `***-***-7890` (last 4 digits only)

**Who sees full numbers:**
- ✅ SUPER_ADMIN
- ✅ Data owner only
- ❌ ADMIN (masked)
- ❌ ADVISOR (masked)
- ❌ SUPPORT (masked)
- ❌ All other users (masked)

#### Passport Numbers
**Original:** `P1234567`  
**Masked:** `P***4567`

---

### 5. **Bank Account Details**
**Original:** `1234567890`  
**Masked:** `******7890` (last 4 digits only)

**Who sees full account:**
- ✅ SUPER_ADMIN
- ✅ Data owner only
- ❌ Everyone else (masked)

---

### 6. **Document IDs / Reference Numbers**
**Original:** `DOC-2024-001234`  
**Masked:** `DOC-****-**1234`

**Who sees full IDs:**
- ✅ SUPER_ADMIN
- ✅ ADMIN
- ✅ ADVISOR
- ✅ Document owner
- ❌ SUPPORT (masked)
- ❌ Other users (masked)

---

### 7. **IP Addresses (Audit Logs)**
**Original:** `192.168.1.100`  
**Masked:** `192.***.***.100`

**Who sees full IPs:**
- ✅ SUPER_ADMIN only
- ❌ Everyone else (masked)

---

## 📊 Masking Rules by Role

### SUPER_ADMIN
```
✅ NO MASKING - Full access to all data
```
- Sees all sensitive information without any masking
- Required for system operations and compliance

---

### ADMIN
```
⚠️ MINIMAL MASKING
✅ Email, Phone, Financial data (unmasked)
❌ Personal IDs (masked)
❌ Bank accounts (masked)
```

**Example:** Can see full financial data for platform management but not personal IDs for privacy.

---

### ADVISOR
```
⚠️ BUSINESS-FOCUSED MASKING
✅ Email, Phone, Financial data (unmasked)
❌ Personal IDs (masked)
❌ Bank accounts (masked)
```

**Example:** Needs financial data to provide advisory services, but doesn't need personal IDs.

---

### SUPPORT
```
❌ MAXIMUM MASKING - Read-only with privacy protection
❌ Email (masked)
❌ Phone (masked)
❌ Financial (masked)
❌ Personal IDs (masked)
❌ Bank accounts (masked)
❌ Document URLs (redacted)
```

**Example:** Can help users without accessing sensitive personal or financial information.

---

### SME / INVESTOR
```
✅ Own data: UNMASKED
❌ Others' data: MASKED
```

**Own Data (SME viewing their profile):**
- ✅ Full email, phone, financial, personal IDs

**Others' Data (SME viewing another SME):**
- ❌ Email: `j***@example.com`
- ❌ Phone: `+855-**-***-678`
- ❌ Financial: Approximate values only
- ❌ Personal IDs: Fully masked

---

## 🔄 Dynamic Masking Examples

### Example 1: SME Profile Viewed by Different Roles

**Original Data:**
```json
{
  "name": "Tech Startup Ltd",
  "email": "contact@techstartup.com",
  "phone": "+855-12-345-678",
  "fundingRequired": 1000000,
  "revenue": 250000,
  "taxId": "KH-123-456-789",
  "bankAccount": "1234567890"
}
```

**Viewed by SUPER_ADMIN:**
```json
{
  "name": "Tech Startup Ltd",
  "email": "contact@techstartup.com",
  "phone": "+855-12-345-678",
  "fundingRequired": 1000000,
  "revenue": 250000,
  "taxId": "KH-123-456-789",
  "bankAccount": "1234567890"
}
```

**Viewed by ADVISOR:**
```json
{
  "name": "Tech Startup Ltd",
  "email": "contact@techstartup.com",
  "phone": "+855-12-345-678",
  "fundingRequired": 1000000,
  "revenue": 250000,
  "taxId": "***-***-789",
  "bankAccount": "******7890"
}
```

**Viewed by SUPPORT:**
```json
{
  "name": "Tech Startup Ltd",
  "email": "c***@techstartup.com",
  "phone": "+855-**-***-678",
  "fundingRequired": "$1,XXX,XXX",
  "revenue": "$***,***",
  "taxId": "***-***-***",
  "bankAccount": "******"
}
```

**Viewed by Another SME:**
```json
{
  "name": "Tech Startup Ltd",
  "email": "c***@techstartup.com",
  "phone": "+855-**-***-678",
  "fundingRequired": "~$1M",
  "revenue": "$***,***",
  "taxId": "***-***-***",
  "bankAccount": "***"
}
```

**Viewed by Owner (themselves):**
```json
{
  "name": "Tech Startup Ltd",
  "email": "contact@techstartup.com",
  "phone": "+855-12-345-678",
  "fundingRequired": 1000000,
  "revenue": 250000,
  "taxId": "KH-123-456-789",
  "bankAccount": "1234567890"
}
```

---

### Example 2: Investment Deal

**Original:**
```json
{
  "title": "Series A Funding",
  "amount": 5000000,
  "equity": 25.5,
  "valuation": 20000000,
  "sme": {
    "name": "Tech Startup Ltd",
    "email": "contact@techstartup.com"
  }
}
```

**Viewed by ADVISOR (managing the deal):**
```json
{
  "title": "Series A Funding",
  "amount": 5000000,
  "equity": 25.5,
  "valuation": 20000000,
  "sme": {
    "name": "Tech Startup Ltd",
    "email": "contact@techstartup.com"
  }
}
```

**Viewed by Non-participating Investor:**
```json
{
  "title": "Series A Funding",
  "amount": "~$5M",
  "equity": "~25%",
  "valuation": "$***M",
  "sme": {
    "name": "Tech Startup Ltd",
    "email": "c***@techstartup.com"
  }
}
```

---

## 🛡️ Implementation Details

### Backend (Automatic)
The backend automatically applies masking through middleware:

```typescript
// Middleware automatically masks responses based on user role
app.use(maskResponseData);

// All API responses are automatically masked
app.get('/api/smes', authenticateToken, async (req, res) => {
  const smes = await getAllSMEs();
  // Response is automatically masked based on req.user.role
  res.json(smes);
});
```

### Frontend (Optional)
The frontend can also apply client-side masking for extra security:

```typescript
import { maskEmail, maskFinancial } from '@/utils/dataMasking';

// Mask email in UI
const displayEmail = maskEmail(user.email);

// Mask financial amount
const displayAmount = maskFinancial(sme.fundingRequired);
```

---

## 🔐 Security Benefits

### 1. **Privacy Protection**
- Users only see data they're authorized to access
- Personal information is protected from unauthorized viewing
- Compliance with data protection regulations (GDPR, etc.)

### 2. **Data Minimization**
- Users only receive the minimum data needed for their role
- Reduces risk of data leakage
- Limits exposure in case of account compromise

### 3. **Audit Trail**
- All data access is logged
- Masked data access is tracked separately
- Compliance with audit requirements

### 4. **Flexible Access**
- Data owners always see their own data
- Administrators can grant temporary access
- Role-based access is automatically enforced

---

## ⚙️ Configuration

### Enable/Disable Masking
In `backend/.env`:
```bash
# Enable data masking (default: true)
ENABLE_DATA_MASKING=true

# Masking strictness (strict, moderate, minimal)
DATA_MASKING_LEVEL=strict
```

### Custom Masking Rules
Create custom rules in `backend/src/config/masking.config.ts`:

```typescript
export const customMaskingRules = {
  roles: {
    CUSTOM_ROLE: {
      maskEmail: true,
      maskPhone: false,
      maskFinancial: true,
    }
  }
};
```

---

## 📝 Best Practices

### 1. **Default to Masking**
- Always mask by default
- Only unmask when explicitly needed
- Require strong justification for unmasking

### 2. **Log Access**
- Log all access to unmasked data
- Alert on unusual access patterns
- Regular audit reviews

### 3. **Test Thoroughly**
- Test each role's access
- Verify ownership checks
- Test edge cases (shared resources, etc.)

### 4. **Educate Users**
- Inform users about data masking
- Explain why they see masked data
- Provide clear privacy policies

---

## 🚀 Testing Masking

### Test as Different Roles:

1. **Login as SUPPORT:**
   ```
   Email: support@boutique-advisory.com
   Password: Support123!
   ```
   - View SME profiles → Should see masked data

2. **Login as SME:**
   ```
   Email: sme@boutique-advisory.com
   Password: SME123!
   ```
   - View own profile → Should see full data
   - View other SMEs → Should see masked data

3. **Login as ADVISOR:**
   ```
   Email: advisor@boutique-advisory.com
   Password: Advisor123!
   ```
   - View SMEs → Should see financial data but masked personal IDs

---

## 📈 Future Enhancements

- [ ] Field-level encryption for extra sensitive data
- [ ] Time-based access (temporary unmasking with expiry)
- [ ] Watermarking for downloaded documents
- [ ] Data anonymization for analytics
- [ ] Differential privacy for aggregate queries

---

## 📞 Support

For questions about data masking:
- Documentation: This file
- Technical: See `backend/src/utils/dataMasking.ts`
- Middleware: See `backend/src/middleware/dataMasking.ts`
