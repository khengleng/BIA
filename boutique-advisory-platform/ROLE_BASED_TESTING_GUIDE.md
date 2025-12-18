# 🔐 Role-Based Access Control Testing Guide

## 🚀 **Ready for Testing!**

The role-based system is now fully implemented with test data and proper security controls. Use this guide to test all functionality before migrating to the database.

---

## 📋 **Test User Credentials**

### **🔑 Login Credentials for Testing:**

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **ADMIN** | `admin@boutique-advisory.com` | `admin123` | Full system access |
| **ADVISOR** | `advisor@boutique-advisory.com` | `advisor123` | Advisory and management access |
| **INVESTOR** | `investor@boutique-advisory.com` | `investor123` | Investment-focused access |
| **SME** | `sme@boutique-advisory.com` | `sme123` | Limited SME access |

---

## 🎯 **Role Permissions Matrix**

| Feature | ADMIN | ADVISOR | INVESTOR | SME |
|---------|-------|---------|----------|-----|
| **View SMEs** | ✅ All | ✅ All | ✅ All | ❌ None |
| **Create SMEs** | ✅ | ✅ | ❌ | ❌ |
| **Edit SMEs** | ✅ All | ✅ All | ❌ | ❌ Own Only |
| **Delete SMEs** | ✅ All | ✅ All | ❌ | ❌ |
| **View Investors** | ✅ All | ✅ All | ✅ All | ✅ All |
| **Create Investors** | ✅ | ✅ | ❌ | ❌ |
| **Edit Investors** | ✅ All | ✅ All | ❌ | ❌ |
| **Delete Investors** | ✅ All | ✅ All | ❌ | ❌ |
| **View Deals** | ✅ All | ✅ All | ✅ All | ✅ All |
| **Create Deals** | ✅ | ✅ | ✅ | ❌ |
| **Edit Deals** | ✅ All | ✅ All | ❌ | ❌ |
| **Delete Deals** | ✅ All | ✅ All | ❌ | ❌ |
| **Access Reports** | ✅ | ✅ | ✅ | ❌ |
| **Manage Users** | ✅ | ❌ | ❌ | ❌ |

---

## 🧪 **Testing Scenarios**

### **1. 🔐 Authentication Testing**

#### **Test Login Flow:**
1. Go to `http://localhost:1001/auth/login`
2. Try each test user credential
3. Verify successful login and role-based dashboard access

#### **Test Registration Flow:**
1. Go to `http://localhost:1001/auth/register`
2. Register a new user with different roles
3. Verify role-based permissions after registration

### **2. 🏢 SME Management Testing**

#### **As ADMIN/ADVISOR:**
1. **Create SME:**
   - Navigate to `/smes/add`
   - Fill out the comprehensive form
   - Submit and verify creation
   
2. **Edit SME:**
   - Go to `/smes` listing
   - Click "Edit" button on any SME
   - Modify details and save
   
3. **Delete SME:**
   - Go to `/smes` listing
   - Click "Delete" button
   - Confirm deletion

#### **As INVESTOR:**
1. **View SMEs:**
   - Navigate to `/smes`
   - Verify you can see all SMEs
   - Verify NO "Add", "Edit", or "Delete" buttons
   
2. **SME Details:**
   - Click "View" on any SME
   - Verify detailed view access
   - Verify NO edit/delete options

#### **As SME:**
1. **Access Restrictions:**
   - Try to access `/smes` - should be restricted
   - Try to access `/smes/add` - should be restricted

### **3. 💼 Investor Management Testing**

#### **As ADMIN/ADVISOR:**
1. **Create Investor:**
   - Navigate to `/investors/add`
   - Fill out investor form
   - Submit and verify creation
   
2. **Edit Investor:**
   - Go to `/investors` listing
   - Click "Edit" button
   - Modify details and save
   
3. **Investor Details:**
   - Click "View" on any investor
   - Test all buttons (Edit, Add Timeline Event, etc.)

#### **As INVESTOR:**
1. **View Investors:**
   - Navigate to `/investors`
   - Verify you can see all investors
   - Verify NO "Add", "Edit", or "Delete" buttons

#### **As SME:**
1. **View Investors:**
   - Navigate to `/investors`
   - Verify you can see all investors
   - Verify NO management buttons

### **4. 🤝 Deal Management Testing**

#### **As ADMIN/ADVISOR:**
1. **Create Deal:**
   - Navigate to `/deals/add`
   - Fill out deal form
   - Submit and verify creation
   
2. **Edit Deal:**
   - Go to `/deals` listing
   - Click "Edit" button
   - Modify details and save
   
3. **Deal Details:**
   - Click "View" on any deal
   - Test all buttons and functionality

#### **As INVESTOR:**
1. **View Deals:**
   - Navigate to `/deals`
   - Verify you can see all deals
   - Verify NO "Edit" or "Delete" buttons
   
2. **Create Deal:**
   - Should be able to create new deals
   - Test deal creation flow

#### **As SME:**
1. **View Deals:**
   - Navigate to `/deals`
   - Verify you can see all deals
   - Verify NO management buttons

### **5. 📊 Reports & Analytics Testing**

#### **As ADMIN/ADVISOR/INVESTOR:**
1. **Access Reports:**
   - Navigate to `/reports`
   - Verify access to analytics and reports
   - Test report generation and download

#### **As SME:**
1. **Reports Access:**
   - Try to access `/reports`
   - Should be restricted or show limited data

### **6. ⚙️ Settings & Profile Testing**

#### **All Roles:**
1. **Profile Management:**
   - Navigate to `/settings`
   - Update profile information
   - Verify changes are saved

---

## 🔧 **API Testing Endpoints**

### **Get Test Tokens:**
```bash
curl -X GET "http://localhost:1000/api/test/tokens"
```

### **Test Role-Based Access:**
```bash
# Test Investor accessing SME creation (should fail)
curl -X POST "http://localhost:1000/api/smes" \
  -H "Authorization: Bearer [INVESTOR_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Test", "sector": "Tech"}'

# Test Admin creating SME (should succeed)
curl -X POST "http://localhost:1000/api/smes" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Test", "sector": "Tech"}'
```

---

## 📝 **Test Data Available**

### **Pre-loaded SMEs:**
- **Tech Startup A** (Series A, $500K funding needed)
- **E-commerce Platform B** (Seed, $200K funding needed)

### **Pre-loaded Investors:**
- **John Smith** (Angel Investor, KYC Approved)

### **Pre-loaded Deals:**
- **Tech Startup A Series A Funding** ($500K, 15% equity)

---

## 🚨 **Expected Security Behaviors**

### **✅ What Should Work:**
- Role-based UI elements (buttons showing/hiding correctly)
- API endpoint protection (proper 403/401 responses)
- Data isolation (users only see appropriate data)
- Authentication required for all protected endpoints

### **❌ What Should NOT Work:**
- Investors creating/editing SMEs
- SMEs accessing other SME data
- Unauthorized users accessing admin functions
- Direct API access without proper tokens

---

## 🔄 **Testing Checklist**

- [ ] **Login with all 4 test users**
- [ ] **Test SME creation (Admin/Advisor only)**
- [ ] **Test SME editing (Admin/Advisor only)**
- [ ] **Test SME deletion (Admin/Advisor only)**
- [ ] **Test Investor creation (Admin/Advisor only)**
- [ ] **Test Deal creation (Admin/Advisor/Investor)**
- [ ] **Test Reports access (Admin/Advisor/Investor only)**
- [ ] **Verify UI elements show/hide correctly**
- [ ] **Test API endpoint security**
- [ ] **Test data isolation between roles**

---

## 🎯 **Ready for Database Migration**

Once you've completed all testing scenarios and verified the role-based system works correctly, we can proceed with:

1. **Database Schema Migration**
2. **Prisma Integration**
3. **Persistent Data Storage**
4. **Production Deployment**

---

## 🆘 **Troubleshooting**

### **If Login Fails:**
- Check if backend is running: `docker-compose ps`
- Verify test tokens: `curl http://localhost:1000/api/test/tokens`

### **If Permissions Don't Work:**
- Check browser console for errors
- Verify JWT token is being sent in requests
- Check backend logs: `docker-compose logs boutique-advisory-backend`

### **If UI Elements Missing:**
- Clear browser cache and localStorage
- Check if user role is properly set in localStorage
- Verify frontend is running: `http://localhost:1001`

---

**🎉 Happy Testing! The role-based system is ready for your comprehensive evaluation.**
