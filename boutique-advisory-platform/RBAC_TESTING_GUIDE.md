# RBAC Testing Guide

**Date:** 2025-12-18
**Changes:** Frontend RBAC Permission Fixes

---

## 🎯 What Was Fixed

1. **Investor Edit Permission** - Only owners, ADMIN, or ADVISOR can edit
2. **Investor Save API Integration** - Real API calls instead of mock alerts
3. **SME Create Page Protection** - Only ADMIN and ADVISOR can access
4. **TypeScript Support** - Proper interfaces and types

---

## 📋 Testing Checklist

### Test 1: Investor Edit as NON-Owner INVESTOR ❌ Should FAIL
**Scenario:** INVESTOR role trying to edit someone else's profile

1. Login as: `investor@boutique-advisory.com` / `Investor123!`
2. Navigate to **Investors** page
3. Click on any investor profile (e.g., investor ID 2 or 3)
4. **Expected:** Edit button should be **DISABLED** (grayed out)
5. **Tooltip:** "You do not have permission to edit this investor"

✅ **Pass Criteria:** Cannot click Edit button on other investors' profiles

---

### Test 2: Investor Edit as Owner INVESTOR ✅ Should SUCCEED
**Scenario:** INVESTOR role editing their own profile

**Note:** With current mock data, you need to test with an investor whose `userId` matches the logged-in user's ID.

1. Login as: `investor@boutique-advisory.com` / `Investor123!`
2. Navigate to **Investors** page
3. Find investor with `userId: 'investor_1'` (should match your user ID)
4. **Expected:** Edit button should be **ENABLED**
5. Click Edit, make changes, and Save
6. **Expected:** Success message, no 403 error

✅ **Pass Criteria:** Can edit own profile successfully

---

### Test 3: Investor Edit as ADMIN ✅ Should SUCCEED
**Scenario:** ADMIN role can edit any investor

1. Login as: `admin@boutique-advisory.com` / `Admin123!`
2. Navigate to **Investors** page
3. Click on **ANY** investor profile
4. **Expected:** Edit button should be **ENABLED**
5. Click Edit, change "Name" field, and Save
6. **Expected:** 
   - API call to `PUT /api/investors/:id`
   - Success alert appears
   - Changes are reflected (may need page refresh)

✅ **Pass Criteria:** Can edit any investor profile successfully

---

### Test 4: Investor Edit as ADVISOR ✅ Should SUCCEED
**Scenario:** ADVISOR role can edit any investor

1. Login as: `advisor@boutique-advisory.com` / `Advisor123!`
2. Navigate to **Investors** page
3. Click on any investor profile
4. **Expected:** Edit button should be **ENABLED**
5. Click Edit, make changes, and Save
6. **Expected:** Success message, changes saved

✅ **Pass Criteria:** Can edit any investor profile successfully

---

### Test 5: SME Create as INVESTOR ❌ Should FAIL
**Scenario:** INVESTOR role trying to create SME

1. Login as: `investor@boutique-advisory.com` / `Investor123!`
2. Try to navigate to `/smes/add` (type in URL bar or click Add button)
3. **Expected:** 
   - Alert: "You do not have permission to create SMEs. Only ADMIN and ADVISOR roles can create SMEs."
   - Redirect to `/smes` page

✅ **Pass Criteria:** Cannot access SME create page

---

### Test 6: SME Create as ADMIN ✅ Should SUCCEED
**Scenario:** ADMIN role creating a new SME

1. Login as: `admin@boutique-advisory.com` / `Admin123!`
2. Navigate to **SMEs** page
3. Click **Add New SME** button
4. **Expected:** Form loads successfully
5. Fill out required fields:
   - Company Name: "Test SME"
   - Sector: "Technology"
   - Business Description: "Test description"
6. Click **Create SME**
7. **Expected:**
   - API call to `POST /api/smes`
   - Success, redirects to `/smes`
   - New SME appears in list

✅ **Pass Criteria:** Can create SME successfully

---

### Test 7: SME Create as ADVISOR ✅ Should SUCCEED
**Scenario:** ADVISOR role creating a new SME

1. Login as: `advisor@boutique-advisory.com` / `Advisor123!`
2. Navigate to `/smes/add`
3. **Expected:** Form loads successfully
4. Fill out and submit form
5. **Expected:** SME created successfully

✅ **Pass Criteria:** Can create SME successfully

---

### Test 8: SME Create as SME Role ❌ Should FAIL
**Scenario:** SME role trying to create another SME

1. Login as: `sme@boutique-advisory.com` / `SME123!`
2. Try to navigate to `/smes/add`
3. **Expected:** 
   - Alert: "You do not have permission to create SMEs..."
   - Redirect to `/smes`

✅ **Pass Criteria:** Cannot access SME create page

---

## 🔍 How to Check API Calls

### Browser DevTools Method:
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to **Network** tab
3. Filter by "Fetch/XHR"
4. Perform the action (e.g., click Save)
5. Look for the API call:
   - URL: `/api/investors/:id` (PUT method)
   - Status: Should be `200 OK` on success, `403 Forbidden` if no permission
   - Response body: Check for error messages

---

## 🚨 Common Issues to Watch For

### Issue 1: Mock Data userId Mismatch
**Problem:** Investor profile's `userId` doesn't match logged-in user's ID
**Solution:** 
- Check mock data in `/frontend/src/app/investors/[id]/page.tsx`
- Investor 1 has `userId: 'investor_1'`
- Make sure your test user has matching ID

### Issue 2: 403 Forbidden on Save
**Problem:** Edit button is enabled but save fails with 403
**Symptom:** This means frontend RBAC is wrong!
**Check:** 
1. Look at button permission logic
2. Verify backend allows the operation
3. Check browser console for error details

### Issue 3: Token Expired
**Problem:** 401 Unauthorized errors
**Solution:** Logout and login again to get fresh token

---

## 📊 Testing Results Template

Copy and fill out:

```
## Test Results - [Your Name] - [Date]

### Test 1: Investor Edit as NON-Owner INVESTOR
- [ ] PASS / [ ] FAIL
- Notes: _____

### Test 2: Investor Edit as Owner INVESTOR  
- [ ] PASS / [ ] FAIL
- Notes: _____

### Test 3: Investor Edit as ADMIN
- [ ] PASS / [ ] FAIL
- Notes: _____

### Test 4: Investor Edit as ADVISOR
- [ ] PASS / [ ] FAIL
- Notes: _____

### Test 5: SME Create as INVESTOR
- [ ] PASS / [ ] FAIL
- Notes: _____

### Test 6: SME Create as ADMIN
- [ ] PASS / [ ] FAIL
- Notes: _____

### Test 7: SME Create as ADVISOR
- [ ] PASS / [ ] FAIL
- Notes: _____

### Test 8: SME Create as SME Role
- [ ] PASS / [ ] FAIL
- Notes: _____

## Summary
- Total Tests: 8
- Passed: ___
- Failed: ___
- Issues Found: ___
```

---

## 🚀 Deployment Required

**IMPORTANT:** These fixes are currently **LOCAL ONLY**. To test in production:

1. Commit changes:
   ```bash
   git add .
   git commit -m "fix: RBAC consistency - match frontend permissions with backend"
   ```

2. Push to deploy:
   ```bash
   git push
   ```

3. Wait for Railway deployment to complete

4. Test on production URL: https://frontend-production-deae.up.railway.app

---

## 🎯 Success Criteria

All 8 tests should PASS:
- ✅ Tests 2, 3, 4, 6, 7 should SUCCEED (user can perform action)
- ✅ Tests 1, 5, 8 should FAIL gracefully (user blocked from action)

If ANY test shows wrong behavior, report it immediately!

---

**Happy Testing! 🧪**
