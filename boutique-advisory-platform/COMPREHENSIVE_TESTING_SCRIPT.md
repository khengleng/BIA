# 🧪 Comprehensive Function Testing Script

## 🎯 **Complete Platform Testing Guide**

This script will help you test ALL functions systematically. Follow each section step-by-step to ensure everything works perfectly.

---

## 📋 **Pre-Testing Setup**

### **1. Verify Services are Running:**
```bash
# Check if all containers are running
docker-compose ps

# Expected output should show:
# - bia-boutique-advisory-backend (running)
# - bia-boutique-advisory-frontend (running)
```

### **2. Verify Backend Health:**
```bash
curl http://localhost:1000/health
# Should return: {"service":"boutique-advisory-platform","status":"healthy",...}
```

### **3. Get Test Tokens:**
```bash
curl http://localhost:1000/api/test/tokens
# Should return tokens for all 4 test users
```

---

## 🔐 **SECTION 1: Authentication Testing**

### **Test 1.1: Login with All Roles**

**Steps:**
1. Open `http://localhost:1001/auth/login`
2. Test each user:

| User | Email | Password | Expected Result |
|------|-------|----------|-----------------|
| Admin | `admin@boutique-advisory.com` | `admin123` | ✅ Dashboard with full access |
| Advisor | `advisor@boutique-advisory.com` | `advisor123` | ✅ Dashboard with advisory access |
| Investor | `investor@boutique-advisory.com` | `investor123` | ✅ Dashboard with investor access |
| SME | `sme@boutique-advisory.com` | `sme123` | ✅ Dashboard with SME access |

**✅ Success Criteria:**
- All logins work without errors
- Each user sees appropriate dashboard
- Navigation menu shows correct options
- User role is displayed correctly

### **Test 1.2: Registration Flow**

**Steps:**
1. Go to `http://localhost:1001/auth/register`
2. Register a new user with each role
3. Verify role-based permissions after registration

**✅ Success Criteria:**
- Registration completes successfully
- New user can login immediately
- Role-based permissions are applied correctly

### **Test 1.3: Logout Functionality**

**Steps:**
1. Login with any user
2. Click logout button
3. Verify redirect to login page
4. Try to access protected pages - should redirect to login

**✅ Success Criteria:**
- Logout clears session
- Redirects to login page
- Cannot access protected pages after logout

---

## 🏢 **SECTION 2: SME Management Testing**

### **Test 2.1: SME Listing (All Roles)**

**Steps:**
1. Login as each role
2. Navigate to `/smes`
3. Verify what buttons are visible:

| Role | Add Button | Edit Buttons | Delete Buttons | View Buttons |
|------|------------|--------------|----------------|--------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Advisor | ✅ | ✅ | ✅ | ✅ |
| Investor | ❌ | ❌ | ❌ | ✅ |
| SME | ❌ | ❌ | ❌ | ❌ |

**✅ Success Criteria:**
- Correct buttons show/hide based on role
- SME data displays correctly
- No JavaScript errors in console

### **Test 2.2: SME Creation (Admin/Advisor Only)**

**Steps:**
1. Login as Admin
2. Go to `/smes/add`
3. Fill out the complete form:
   - Company Name: "Test Company A"
   - Sector: "Technology"
   - Business Description: "Test description"
   - All other required fields
4. Submit the form
5. Verify creation and redirect to `/smes`

**Repeat with Advisor role**

**✅ Success Criteria:**
- Form submits successfully
- New SME appears in listing
- Redirects to SME listing page
- No console errors

### **Test 2.3: SME Creation (Investor/SME - Should Fail)**

**Steps:**
1. Login as Investor
2. Try to access `/smes/add` directly
3. Try to create SME via API:
```bash
curl -X POST "http://localhost:1000/api/smes" \
  -H "Authorization: Bearer [INVESTOR_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Test", "sector": "Tech"}'
```

**✅ Success Criteria:**
- Access is denied (403 error)
- Investor cannot create SMEs
- UI doesn't show Add button

### **Test 2.4: SME Editing (Admin/Advisor Only)**

**Steps:**
1. Login as Admin
2. Go to `/smes`
3. Click "Edit" on any SME
4. Modify some fields
5. Save changes
6. Verify changes are applied

**✅ Success Criteria:**
- Edit modal opens
- Changes save successfully
- Updated data displays correctly

### **Test 2.5: SME Deletion (Admin/Advisor Only)**

**Steps:**
1. Login as Admin
2. Go to `/smes`
3. Click "Delete" on any SME
4. Confirm deletion
5. Verify SME is removed from listing

**✅ Success Criteria:**
- Delete confirmation modal appears
- SME is removed after confirmation
- No errors in console

### **Test 2.6: SME Detail View**

**Steps:**
1. Login as any role that can view SMEs
2. Go to `/smes`
3. Click "View" on any SME
4. Verify all details display correctly
5. Test all buttons on detail page

**✅ Success Criteria:**
- All SME details display correctly
- Buttons work as expected
- No missing data

---

## 💼 **SECTION 3: Investor Management Testing**

### **Test 3.1: Investor Listing (All Roles)**

**Steps:**
1. Login as each role
2. Navigate to `/investors`
3. Verify button visibility:

| Role | Add Button | Edit Buttons | Delete Buttons | View Buttons |
|------|------------|--------------|----------------|--------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Advisor | ✅ | ✅ | ✅ | ✅ |
| Investor | ❌ | ❌ | ❌ | ✅ |
| SME | ❌ | ❌ | ❌ | ✅ |

**✅ Success Criteria:**
- Correct buttons show/hide based on role
- Investor data displays correctly

### **Test 3.2: Investor Creation (Admin/Advisor Only)**

**Steps:**
1. Login as Admin
2. Go to `/investors/add` (if available) or create via API
3. Fill out investor form
4. Submit and verify creation

**✅ Success Criteria:**
- Investor is created successfully
- Appears in listing

### **Test 3.3: Investor Detail View**

**Steps:**
1. Login as any role
2. Go to `/investors`
3. Click "View" on any investor
4. Test all functionality:
   - Edit button
   - Add Timeline Event
   - View Documents
   - Download Documents
   - Upload Documents

**✅ Success Criteria:**
- All investor details display
- All buttons work correctly
- Timeline events can be added/edited
- Document functions work

---

## 🤝 **SECTION 4: Deal Management Testing**

### **Test 4.1: Deal Listing (All Roles)**

**Steps:**
1. Login as each role
2. Navigate to `/deals`
3. Verify button visibility:

| Role | Add Button | Edit Buttons | Delete Buttons | View Buttons |
|------|------------|--------------|----------------|--------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Advisor | ✅ | ✅ | ✅ | ✅ |
| Investor | ✅ | ❌ | ❌ | ✅ |
| SME | ❌ | ❌ | ❌ | ✅ |

**✅ Success Criteria:**
- Correct buttons show/hide based on role
- Deal data displays correctly

### **Test 4.2: Deal Creation (Admin/Advisor/Investor)**

**Steps:**
1. Login as Admin
2. Create a new deal
3. Fill out all required fields
4. Submit and verify creation

**Repeat with Advisor and Investor roles**

**✅ Success Criteria:**
- Deals can be created by authorized roles
- New deals appear in listing

### **Test 4.3: Deal Detail View**

**Steps:**
1. Login as any role
2. Go to `/deals`
3. Click "View" on any deal
4. Test all functionality:
   - Edit button
   - View Documents
   - Download Documents
   - All other buttons

**✅ Success Criteria:**
- All deal details display
- All buttons work correctly
- Document functions work

---

## 📊 **SECTION 5: Reports & Analytics Testing**

### **Test 5.1: Reports Access**

**Steps:**
1. Login as each role
2. Navigate to `/reports`
3. Verify access:

| Role | Can Access | Can Generate Reports | Can Download |
|------|------------|---------------------|--------------|
| Admin | ✅ | ✅ | ✅ |
| Advisor | ✅ | ✅ | ✅ |
| Investor | ✅ | ✅ | ✅ |
| SME | ❌ | ❌ | ❌ |

**✅ Success Criteria:**
- Correct access based on role
- Report generation works
- Download functionality works

### **Test 5.2: Report Generation**

**Steps:**
1. Login as Admin
2. Go to `/reports`
3. Click "Generate Report"
4. Verify report is created
5. Test download functionality

**✅ Success Criteria:**
- Reports generate successfully
- Download works correctly
- No errors in console

---

## ⚙️ **SECTION 6: Settings & Profile Testing**

### **Test 6.1: Profile Management**

**Steps:**
1. Login as any user
2. Go to `/settings`
3. Update profile information
4. Save changes
5. Verify changes are applied

**✅ Success Criteria:**
- Profile updates save successfully
- Changes are reflected immediately
- No errors in console

---

## 🔧 **SECTION 7: API Endpoint Testing**

### **Test 7.1: Authentication Required Endpoints**

**Steps:**
1. Test each endpoint without token:
```bash
curl -X GET "http://localhost:1000/api/smes"
curl -X GET "http://localhost:1000/api/investors"
curl -X GET "http://localhost:1000/api/deals"
```

**✅ Success Criteria:**
- All return 401 (Unauthorized)

### **Test 7.2: Role-Based API Access**

**Steps:**
1. Test SME creation with different roles:
```bash
# Should succeed (Admin)
curl -X POST "http://localhost:1000/api/smes" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Test", "sector": "Tech"}'

# Should fail (Investor)
curl -X POST "http://localhost:1000/api/smes" \
  -H "Authorization: Bearer [INVESTOR_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Test", "sector": "Tech"}'
```

**✅ Success Criteria:**
- Admin/Advisor can create SMEs
- Investor gets 403 (Forbidden)

---

## 🌐 **SECTION 8: Frontend Navigation Testing**

### **Test 8.1: Navigation Menu**

**Steps:**
1. Login as each role
2. Verify navigation menu shows correct items:

| Role | Dashboard | SMEs | Investors | Deals | Reports | Settings |
|------|-----------|------|-----------|-------|---------|----------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Advisor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Investor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SME | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |

**✅ Success Criteria:**
- Correct menu items show/hide based on role
- All links work correctly

### **Test 8.2: Breadcrumb Navigation**

**Steps:**
1. Navigate through different pages
2. Verify breadcrumbs update correctly
3. Test breadcrumb links

**✅ Success Criteria:**
- Breadcrumbs display correctly
- Links work properly

---

## 📱 **SECTION 9: Responsive Design Testing**

### **Test 9.1: Mobile Responsiveness**

**Steps:**
1. Open browser dev tools
2. Set to mobile viewport
3. Test all pages on mobile size
4. Verify all buttons and forms work

**✅ Success Criteria:**
- All pages are mobile-friendly
- Buttons are touch-friendly
- Forms work on mobile

---

## 🔒 **SECTION 10: Security Testing**

### **Test 10.1: Direct URL Access**

**Steps:**
1. Logout
2. Try to access protected pages directly:
   - `http://localhost:1001/smes`
   - `http://localhost:1001/investors`
   - `http://localhost:1001/deals`
   - `http://localhost:1001/reports`

**✅ Success Criteria:**
- All redirect to login page
- Cannot access protected content

### **Test 10.2: Role-Based URL Access**

**Steps:**
1. Login as Investor
2. Try to access `/smes/add` directly
3. Try to access `/reports` directly

**✅ Success Criteria:**
- Access is denied appropriately
- Proper error messages shown

---

## 🎯 **SECTION 11: Error Handling Testing**

### **Test 11.1: Network Error Handling**

**Steps:**
1. Stop backend container
2. Try to perform actions in frontend
3. Verify error messages are user-friendly
4. Restart backend and verify recovery

**✅ Success Criteria:**
- Graceful error handling
- User-friendly error messages
- Proper recovery after service restart

### **Test 11.2: Form Validation**

**Steps:**
1. Test all forms with invalid data
2. Submit empty forms
3. Test with malformed data

**✅ Success Criteria:**
- Proper validation messages
- Forms don't submit invalid data
- User-friendly error messages

---

## 📝 **Testing Checklist**

### **Authentication:**
- [ ] Login with all 4 test users
- [ ] Registration flow works
- [ ] Logout functionality
- [ ] Session management

### **SME Management:**
- [ ] SME listing displays correctly
- [ ] Role-based button visibility
- [ ] SME creation (Admin/Advisor)
- [ ] SME editing (Admin/Advisor)
- [ ] SME deletion (Admin/Advisor)
- [ ] SME detail view
- [ ] Access restrictions (Investor/SME)

### **Investor Management:**
- [ ] Investor listing displays correctly
- [ ] Role-based button visibility
- [ ] Investor creation (Admin/Advisor)
- [ ] Investor editing (Admin/Advisor)
- [ ] Investor detail view
- [ ] Timeline events functionality
- [ ] Document management

### **Deal Management:**
- [ ] Deal listing displays correctly
- [ ] Role-based button visibility
- [ ] Deal creation (Admin/Advisor/Investor)
- [ ] Deal editing (Admin/Advisor)
- [ ] Deal detail view
- [ ] Document management

### **Reports & Analytics:**
- [ ] Reports access (Admin/Advisor/Investor)
- [ ] Report generation
- [ ] Download functionality
- [ ] Access restrictions (SME)

### **Settings & Profile:**
- [ ] Profile management
- [ ] Settings updates

### **API Endpoints:**
- [ ] Authentication required
- [ ] Role-based access control
- [ ] Proper error responses

### **Frontend:**
- [ ] Navigation menu
- [ ] Responsive design
- [ ] Error handling
- [ ] Form validation

### **Security:**
- [ ] Direct URL access protection
- [ ] Role-based URL access
- [ ] Session security

---

## 🚨 **Expected Results Summary**

### **✅ All Tests Should Pass:**
- No JavaScript console errors
- All buttons work as expected
- Role-based access control works perfectly
- Data displays correctly
- Forms submit successfully
- Navigation works smoothly
- Security is properly enforced

### **❌ Common Issues to Watch For:**
- Console errors
- Missing buttons for authorized roles
- Unauthorized access to restricted areas
- Form submission failures
- Navigation issues
- Responsive design problems

---

## 🎉 **Testing Complete!**

Once you've completed all sections and checked all items in the checklist, your platform is ready for:

1. **Database Migration**
2. **Production Deployment**
3. **User Training**

**Happy Testing! 🚀**
