# 🧪 Manual Testing Guide - Step by Step

## 🎯 **Complete Function Testing Instructions**

This guide will help you test ALL functions manually in the browser. Follow each step carefully and verify the expected results.

---

## 📋 **Pre-Testing Checklist**

### **✅ Verify Services are Running:**
1. Open terminal and run: `docker-compose ps`
2. Ensure both backend and frontend are "Up"
3. Open `http://localhost:1001` in your browser
4. You should see the login page

---

## 🔐 **SECTION 1: Authentication Testing**

### **Test 1.1: Login with All Test Users**

**Step-by-Step Instructions:**

#### **Admin Login Test:**
1. Go to `http://localhost:1001/auth/login`
2. Enter: `admin@boutique-advisory.com` / `admin123`
3. Click "Login"
4. **Expected Result:** ✅ Dashboard loads with full navigation menu
5. **Verify:** You can see Dashboard, SMEs, Investors, Deals, Reports, Settings

#### **Advisor Login Test:**
1. Click "Logout" (top right)
2. Enter: `advisor@boutique-advisory.com` / `advisor123`
3. Click "Login"
4. **Expected Result:** ✅ Dashboard loads with advisory access
5. **Verify:** You can see Dashboard, SMEs, Investors, Deals, Reports, Settings

#### **Investor Login Test:**
1. Click "Logout"
2. Enter: `investor@boutique-advisory.com` / `investor123`
3. Click "Login"
4. **Expected Result:** ✅ Dashboard loads with investor access
5. **Verify:** You can see Dashboard, SMEs, Investors, Deals, Reports, Settings

#### **SME Login Test:**
1. Click "Logout"
2. Enter: `sme@boutique-advisory.com` / `sme123`
3. Click "Login"
4. **Expected Result:** ✅ Dashboard loads with limited access
5. **Verify:** You can see Dashboard, Investors, Deals, Settings (NO SMEs, NO Reports)

---

## 🏢 **SECTION 2: SME Management Testing**

### **Test 2.1: SME Listing - Role-Based Access**

#### **As Admin:**
1. Login as Admin
2. Click "SMEs" in navigation
3. **Expected Result:** ✅ SME listing page loads
4. **Verify:** You see "Add SME" button, "Edit" buttons, "Delete" buttons, "View" buttons
5. **Verify:** You see 2 pre-loaded SMEs: "Tech Startup A" and "E-commerce Platform B"

#### **As Advisor:**
1. Logout and login as Advisor
2. Click "SMEs" in navigation
3. **Expected Result:** ✅ SME listing page loads
4. **Verify:** You see "Add SME" button, "Edit" buttons, "Delete" buttons, "View" buttons
5. **Verify:** Same 2 SMEs are visible

#### **As Investor:**
1. Logout and login as Investor
2. Click "SMEs" in navigation
3. **Expected Result:** ✅ SME listing page loads
4. **Verify:** You see ONLY "View" buttons (NO Add, Edit, Delete buttons)
5. **Verify:** Same 2 SMEs are visible

#### **As SME:**
1. Logout and login as SME
2. **Expected Result:** ❌ "SMEs" should NOT be in navigation menu
3. **Verify:** You cannot access SME listing

### **Test 2.2: SME Creation (Admin/Advisor Only)**

#### **As Admin:**
1. Login as Admin
2. Go to `/smes`
3. Click "Add SME" button
4. Fill out the form:
   - Company Name: "Test Company Admin"
   - Sector: "Technology"
   - Business Description: "Test company created by admin"
   - All other required fields
5. Click "Create SME"
6. **Expected Result:** ✅ Form submits successfully
7. **Verify:** Redirects to `/smes` listing
8. **Verify:** New SME appears in the list

#### **As Advisor:**
1. Logout and login as Advisor
2. Repeat the same process with "Test Company Advisor"
3. **Expected Result:** ✅ Form submits successfully

#### **As Investor (Should Fail):**
1. Logout and login as Investor
2. Try to access `/smes/add` directly in browser
3. **Expected Result:** ❌ Access denied or redirect to login

### **Test 2.3: SME Editing (Admin/Advisor Only)**

#### **As Admin:**
1. Login as Admin
2. Go to `/smes`
3. Click "Edit" button on any SME
4. Modify some fields (e.g., change description)
5. Click "Save Changes"
6. **Expected Result:** ✅ Changes are saved
7. **Verify:** Updated data displays correctly

#### **As Advisor:**
1. Logout and login as Advisor
2. Repeat the same process
3. **Expected Result:** ✅ Changes are saved

#### **As Investor (Should Fail):**
1. Logout and login as Investor
2. Go to `/smes`
3. **Expected Result:** ❌ No "Edit" buttons visible

### **Test 2.4: SME Deletion (Admin/Advisor Only)**

#### **As Admin:**
1. Login as Admin
2. Go to `/smes`
3. Click "Delete" button on any SME
4. **Expected Result:** ✅ Delete confirmation modal appears
5. Click "Confirm Delete"
6. **Expected Result:** ✅ SME is removed from listing

#### **As Advisor:**
1. Logout and login as Advisor
2. Repeat the same process
3. **Expected Result:** ✅ SME is deleted successfully

#### **As Investor (Should Fail):**
1. Logout and login as Investor
2. Go to `/smes`
3. **Expected Result:** ❌ No "Delete" buttons visible

### **Test 2.5: SME Detail View**

#### **As Admin/Advisor/Investor:**
1. Login as any role that can view SMEs
2. Go to `/smes`
3. Click "View" button on any SME
4. **Expected Result:** ✅ SME detail page loads
5. **Verify:** All SME details are displayed correctly
6. **Verify:** All buttons on detail page work

---

## 💼 **SECTION 3: Investor Management Testing**

### **Test 3.1: Investor Listing - Role-Based Access**

#### **As Admin:**
1. Login as Admin
2. Click "Investors" in navigation
3. **Expected Result:** ✅ Investor listing page loads
4. **Verify:** You see "Add Investor" button (if available), "Edit" buttons, "Delete" buttons, "View" buttons
5. **Verify:** You see pre-loaded investor: "John Smith"

#### **As Advisor:**
1. Logout and login as Advisor
2. Click "Investors" in navigation
3. **Expected Result:** ✅ Same access as Admin

#### **As Investor:**
1. Logout and login as Investor
2. Click "Investors" in navigation
3. **Expected Result:** ✅ Investor listing page loads
4. **Verify:** You see ONLY "View" buttons (NO Add, Edit, Delete buttons)

#### **As SME:**
1. Logout and login as SME
2. Click "Investors" in navigation
3. **Expected Result:** ✅ Investor listing page loads
4. **Verify:** You see ONLY "View" buttons

### **Test 3.2: Investor Detail View**

#### **As Any Role:**
1. Login as any role
2. Go to `/investors`
3. Click "View" button on any investor
4. **Expected Result:** ✅ Investor detail page loads
5. **Test all buttons:**
   - Edit button (Admin/Advisor only)
   - Add Timeline Event (Admin/Advisor only)
   - View Documents
   - Download Documents
   - Upload Documents (Admin/Advisor only)

---

## 🤝 **SECTION 4: Deal Management Testing**

### **Test 4.1: Deal Listing - Role-Based Access**

#### **As Admin:**
1. Login as Admin
2. Click "Deals" in navigation
3. **Expected Result:** ✅ Deal listing page loads
4. **Verify:** You see "Add Deal" button, "Edit" buttons, "Delete" buttons, "View" buttons
5. **Verify:** You see pre-loaded deal: "Tech Startup A Series A Funding"

#### **As Advisor:**
1. Logout and login as Advisor
2. Click "Deals" in navigation
3. **Expected Result:** ✅ Same access as Admin

#### **As Investor:**
1. Logout and login as Investor
2. Click "Deals" in navigation
3. **Expected Result:** ✅ Deal listing page loads
4. **Verify:** You see "Add Deal" button, "View" buttons (NO Edit, Delete buttons)

#### **As SME:**
1. Logout and login as SME
2. Click "Deals" in navigation
3. **Expected Result:** ✅ Deal listing page loads
4. **Verify:** You see ONLY "View" buttons (NO Add, Edit, Delete buttons)

### **Test 4.2: Deal Creation**

#### **As Admin/Advisor/Investor:**
1. Login as any role that can create deals
2. Go to `/deals`
3. Click "Add Deal" button (if available)
4. Fill out the deal form
5. Submit the form
6. **Expected Result:** ✅ Deal is created successfully

### **Test 4.3: Deal Detail View**

#### **As Any Role:**
1. Login as any role
2. Go to `/deals`
3. Click "View" button on any deal
4. **Expected Result:** ✅ Deal detail page loads
5. **Test all buttons:**
   - Edit button (Admin/Advisor only)
   - View Documents
   - Download Documents
   - All other buttons

---

## 📊 **SECTION 5: Reports & Analytics Testing**

### **Test 5.1: Reports Access**

#### **As Admin/Advisor/Investor:**
1. Login as any role that can access reports
2. Click "Reports" in navigation
3. **Expected Result:** ✅ Reports page loads
4. **Test functionality:**
   - Generate Report button
   - Download Report button
   - View analytics

#### **As SME:**
1. Logout and login as SME
2. **Expected Result:** ❌ "Reports" should NOT be in navigation menu
3. **Verify:** You cannot access reports

---

## ⚙️ **SECTION 6: Settings & Profile Testing**

### **Test 6.1: Profile Management**

#### **As Any Role:**
1. Login as any user
2. Click "Settings" in navigation
3. **Expected Result:** ✅ Settings page loads
4. **Test functionality:**
   - Update profile information
   - Save changes
   - Verify changes are applied

---

## 🔧 **SECTION 7: Navigation Testing**

### **Test 7.1: Navigation Menu**

#### **Test with Each Role:**
1. Login as each role
2. **Verify navigation menu shows correct items:**

| Role | Dashboard | SMEs | Investors | Deals | Reports | Settings |
|------|-----------|------|-----------|-------|---------|----------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Advisor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Investor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SME | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |

### **Test 7.2: Breadcrumb Navigation**
1. Navigate through different pages
2. **Verify:** Breadcrumbs update correctly
3. **Test:** Breadcrumb links work properly

---

## 📱 **SECTION 8: Responsive Design Testing**

### **Test 8.1: Mobile Responsiveness**
1. Open browser dev tools (F12)
2. Set to mobile viewport (e.g., iPhone 12)
3. **Test all pages:**
   - Dashboard
   - SMEs listing
   - Investors listing
   - Deals listing
   - Reports
   - Settings
4. **Verify:** All pages are mobile-friendly
5. **Verify:** All buttons are touch-friendly
6. **Verify:** Forms work on mobile

---

## 🔒 **SECTION 9: Security Testing**

### **Test 9.1: Direct URL Access**
1. Logout completely
2. Try to access these URLs directly:
   - `http://localhost:1001/smes`
   - `http://localhost:1001/investors`
   - `http://localhost:1001/deals`
   - `http://localhost:1001/reports`
3. **Expected Result:** ❌ All redirect to login page

### **Test 9.2: Role-Based URL Access**
1. Login as Investor
2. Try to access `/smes/add` directly
3. **Expected Result:** ❌ Access denied or redirect

---

## 🎯 **SECTION 10: Error Handling Testing**

### **Test 10.1: Form Validation**
1. Go to any form (SME creation, etc.)
2. **Test with invalid data:**
   - Submit empty form
   - Enter invalid email formats
   - Enter invalid phone numbers
3. **Expected Result:** ✅ Proper validation messages appear
4. **Expected Result:** ✅ Forms don't submit invalid data

### **Test 10.2: Network Error Handling**
1. Stop backend container: `docker-compose stop boutique-advisory-backend`
2. Try to perform actions in frontend
3. **Expected Result:** ✅ Graceful error handling
4. **Expected Result:** ✅ User-friendly error messages
5. Restart backend: `docker-compose start boutique-advisory-backend`
6. **Expected Result:** ✅ Recovery after service restart

---

## 📝 **Testing Checklist**

### **Authentication:**
- [ ] Login with all 4 test users works
- [ ] Logout functionality works
- [ ] Session management works
- [ ] Registration flow works (if available)

### **SME Management:**
- [ ] SME listing displays correctly for all roles
- [ ] Role-based button visibility works
- [ ] SME creation works (Admin/Advisor only)
- [ ] SME editing works (Admin/Advisor only)
- [ ] SME deletion works (Admin/Advisor only)
- [ ] SME detail view works
- [ ] Access restrictions work (Investor/SME)

### **Investor Management:**
- [ ] Investor listing displays correctly
- [ ] Role-based button visibility works
- [ ] Investor detail view works
- [ ] Timeline events functionality works
- [ ] Document management works

### **Deal Management:**
- [ ] Deal listing displays correctly
- [ ] Role-based button visibility works
- [ ] Deal creation works (Admin/Advisor/Investor)
- [ ] Deal editing works (Admin/Advisor only)
- [ ] Deal detail view works
- [ ] Document management works

### **Reports & Analytics:**
- [ ] Reports access works (Admin/Advisor/Investor)
- [ ] Report generation works
- [ ] Download functionality works
- [ ] Access restrictions work (SME)

### **Settings & Profile:**
- [ ] Profile management works
- [ ] Settings updates work

### **Navigation:**
- [ ] Navigation menu shows correct items per role
- [ ] All links work correctly
- [ ] Breadcrumb navigation works

### **Responsive Design:**
- [ ] All pages are mobile-friendly
- [ ] Buttons are touch-friendly
- [ ] Forms work on mobile

### **Security:**
- [ ] Direct URL access protection works
- [ ] Role-based URL access works
- [ ] Session security works

### **Error Handling:**
- [ ] Form validation works
- [ ] Network error handling works
- [ ] User-friendly error messages appear

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
- Console errors in browser dev tools
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

---

## 🆘 **Troubleshooting**

### **If Login Fails:**
- Check if backend is running: `docker-compose ps`
- Clear browser cache and localStorage
- Check browser console for errors

### **If Permissions Don't Work:**
- Check browser console for errors
- Verify user role is properly set
- Check backend logs: `docker-compose logs boutique-advisory-backend`

### **If UI Elements Missing:**
- Clear browser cache and localStorage
- Check if user role is properly set in localStorage
- Verify frontend is running: `http://localhost:1001`
