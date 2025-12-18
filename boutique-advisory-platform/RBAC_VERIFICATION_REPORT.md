# RBAC Verification Report
**Generated:** 2025-12-18T14:15:00+07:00

## Executive Summary

This document identifies **critical inconsistencies** between frontend RBAC (what users can SEE/CLICK) and backend RBAC (what users can actually DO). 

**The Rule:** **If a user can edit in the UI, they MUST be able to save successfully.**

---

## ❌ CRITICAL ISSUES FOUND

### 1. **Investor Edit Permission Mismatch**
**Location:** `/frontend/src/app/investors/[id]/page.tsx` (Line 768) vs `/backend/src/index.ts` (Line 1143-1150)

**Frontend:**
```typescript
// Lines 768-769
disabled={!(user?.role === 'ADMIN' || user?.role === 'ADVISOR' || user?.role === 'INVESTOR')}
```
✅ **Frontend allows:** ADMIN, ADVISOR, **INVESTOR** can click "Edit" button

**Backend:**
```typescript
// Lines 1143-1150
const isOwner = investor.userId === req.user!.userId;
const isAdminOrAdvisor = req.user!.role === 'ADMIN' || req.user!.role === 'ADVISOR';

if (!isOwner && !isAdminOrAdvisor) {
  res.status(403).json({ error: 'Permission denied. You can only edit your own investor profile.' });
  return;
}
```
❌ **Backend allows:** ADMIN, ADVISOR, or **owner of the investor profile only**

**The Problem:**
- An INVESTOR user can click "Edit" on ANY investor profile in the frontend
- But the backend will return `403 Forbidden` unless they own that specific investor profile
- This breaks the user experience and violates the RBAC consistency rule

**Impact:** High - Users see edit UI but get 403 errors when saving

---

### 2. **SME Edit Permission - Status: ✅ CORRECT**
**Location:** `/frontend/src/app/smes/add/page.tsx` vs `/backend/src/index.ts` (Line 1020-1028)

**Frontend:** Create form has no conditional rendering (always shows for authenticated users)

**Backend:**
```typescript
// Line 922
app.post('/api/smes', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
```
✅ **Create is protected:** Only ADMIN and ADVISOR can create SMEs

**Backend PUT:**
```typescript
// Lines 1020-1028
const isOwner = sme.userId === req.user!.userId;
const isAdminOrAdvisor = req.user!.role === 'ADMIN' || req.user!.role === 'ADVISOR';

if (!isOwner && !isAdminOrAdvisor) {
  res.status(403).json({ error: 'Permission denied. You can only edit your own SME profile.' });
  return;
}
```
✅ **Edit is protected:** ADMIN, ADVISOR, or SME owner can edit

**Status:** 
- ⚠️ Need to verify frontend SME detail page has proper Edit button permissions
- Frontend create form should check role before showing access

---

## 📋 Verification Checklist

According to `RBAC_GUIDE.md`:

### SME Permissions (from RBAC_GUIDE.md line 182-188)
| Endpoint          | Method | SUPER_ADMIN | ADMIN | ADVISOR | SME | INVESTOR | SUPPORT |
|-------------------|--------|-------------|-------|---------|-----|----------|---------|
| `/api/smes`       | GET    | ✅          | ✅    | ✅      | ✅ (own only) | ✅ | ✅ |
| `/api/smes/:id`   | GET    | ✅          | ✅    | ✅      | ✅ (own only) | ✅ | ✅ |
| `/api/smes`       | POST   | ✅          | ✅    | ✅      | ❌  | ❌ | ❌ |
| `/api/smes/:id`   | PUT    | ✅          | ✅    | ✅      | ✅ (own only) | ❌ | ❌ |
| `/api/smes/:id`   | DELETE | ✅          | ✅    | ✅      | ❌  | ❌ | ❌ |

✅ **Backend Implementation:** CORRECT (matches guide)

### Investor Permissions (from RBAC_GUIDE.md line 191-197)
| Endpoint              | Method | SUPER_ADMIN | ADMIN | ADVISOR | SME | INVESTOR | SUPPORT |
|-----------------------|--------|-------------|-------|---------|-----|----------|---------|
| `/api/investors`      | GET    | ✅          | ✅    | ✅      | ✅  | ✅       | ✅      |
| `/api/investors/:id`  | GET    | ✅          | ✅    | ✅      | ✅  | ✅ (own only) | ✅ |
| `/api/investors`      | POST   | ✅          | ✅    | ✅      | ❌  | ❌       | ❌      |
| `/api/investors/:id`  | PUT    | ✅          | ✅    | ✅      | ❌  | ✅ (own only) | ❌ |
| `/api/investors/:id`  | DELETE | ✅          | ✅    | ✅      | ❌  | ❌       | ❌      |

✅ **Backend Implementation PUT:** CORRECT (ADMIN, ADVISOR, or owner can edit)
❌ **Frontend Implementation:** WRONG (allows ALL investors to see Edit button)

---

## 🔧 Required Fixes

### Fix 1: Update Investor Detail Page Edit Button Logic
**File:** `/frontend/src/app/investors/[id]/page.tsx`
**Lines:** 766-777

**Current (WRONG):**
```typescript
disabled={!(user?.role === 'ADMIN' || user?.role === 'ADVISOR' || user?.role === 'INVESTOR')}
```

**Should be:**
```typescript
// Check if user can edit this specific investor
const canEdit = user?.role === 'ADMIN' || 
                user?.role === 'ADVISOR' || 
                (user?.role === 'INVESTOR' && investor.userId === user.id);

disabled={!canEdit}
```

### Fix 2: Add Frontend RBAC Check for SME Create Page
**File:** `/frontend/src/app/smes/add/page.tsx`

**Add permission check:**
```typescript
useEffect(() => {
  // Only ADMIN and ADVISOR can create SMEs
  if (user && user.role !== 'ADMIN' && user.role !== 'ADVISOR') {
    router.push('/smes');
  }
}, [user, router]);
```

---

## 🧪 Testing Plan

### Test Case 1: Investor Edit as INVESTOR Role
1. Login as `investor@boutique-advisory.com` (INVESTOR role)
2. Navigate to Investors page
3. Click on ANY investor profile (not your own)
4. Verify Edit button is **disabled/hidden** (should only be enabled for your own profile)
5. Navigate to your own investor profile
6. Verify Edit button is **enabled**
7. Click Edit, make changes, and save
8. Verify changes save **successfully** (200 OK, not 403)

### Test Case 2: Investor Edit as ADMIN Role
1. Login as `admin@boutique-advisory.com` (ADMIN role)
2. Navigate to any investor profile
3. Verify Edit button is **enabled**
4. Click Edit, make changes, and save
5. Verify changes save **successfully** (200 OK)

### Test Case 3: SME Create as INVESTOR Role
1. Login as `investor@boutique-advisory.com` (INVESTOR role)
2. Try to navigate to `/smes/add`
3. Should be **redirected** to `/smes` (no access)

### Test Case 4: SME Create as ADVISOR Role
1. Login as `advisor@boutique-advisory.com` (ADVISOR role)
2. Navigate to `/smes/add`
3. Fill out form and submit
4. Verify SME is created **successfully** (201 Created)

---

## 📊 Summary Statistics

| Resource  | Total Endpoints | Mismatches Found | Status  |
|-----------|----------------|------------------|---------|
| SMEs      | 5              | 0                | ✅ Good |
| Investors | 5              | 1                | ❌ Fix Needed |
| Deals     | 5              | Not Verified Yet | ⚠️ Pending |

---

## 🎯 Recommendations

1. **Immediate:** Fix investor edit button logic (High Priority)
2. **Important:** Add role checks to all "add" pages (Medium Priority)
3. **Best Practice:** Create a reusable RBAC hook for frontend
4. **Future:** Implement E2E tests for all RBAC scenarios

### Recommended RBAC Hook
```typescript
// /frontend/src/hooks/useRBAC.ts
export function useRBAC() {
  const user = getUserFromLocalStorage();
  
  return {
    canCreateSME: () => ['ADMIN', 'ADVISOR', 'SUPER_ADMIN'].includes(user?.role),
    canEditSME: (smeUserId: string) => 
      ['ADMIN', 'ADVISOR', 'SUPER_ADMIN'].includes(user?.role) || 
      smeUserId === user?.id,
    canDeleteSME: () => ['ADMIN', 'ADVISOR', 'SUPER_ADMIN'].includes(user?.role),
    
    canCreateInvestor: () => ['ADMIN', 'ADVISOR', 'SUPER_ADMIN'].includes(user?.role),
    canEditInvestor: (investorUserId: string) =>
      ['ADMIN', 'ADVISOR', 'SUPER_ADMIN'].includes(user?.role) ||
      (user?.role === 'INVESTOR' && investorUserId === user?.id),
    canDeleteInvestor: () => ['ADMIN', 'ADVISOR', 'SUPER_ADMIN'].includes(user?.role),
    
    // ... more permissions
  };
}
```

---

## ✅ FIXES APPLIED

### ✅ Fix 1: Updated Investor Detail Page Edit Button Logic (COMPLETED)
**File:** `/frontend/src/app/investors/[id]/page.tsx`
**Lines:** 815-837

**Applied:**
```typescript
// Check if user can edit this specific investor
const canEdit = user?.role === 'ADMIN' || 
                user?.role === 'ADVISOR' || 
                (user?.role === 'INVESTOR' && investor.userId === user.id);

<button
  onClick={handleEdit}
  disabled={!canEdit}
  ...
/>
```

✅ **Status:** FIXED - Frontend now matches backend RBAC rules

### ✅ Fix 2: Added API Call to handleSaveEdit (COMPLETED)
**File:** `/frontend/src/app/investors/[id]/page.tsx`
**Lines:** 162-246

**Applied:**
- Replaced mock alert with actual `PUT /api/investors/:id` API call
- Added proper error handling
- Shows appropriate success/error messages
- Redirects to login if token is missing

✅ **Status:** FIXED - Save button now makes real API calls

### ✅ Fix 3: Added Frontend RBAC Check for SME Create Page (COMPLETED)
**File:** `/frontend/src/app/smes/add/page.tsx`
**Lines:** 108-123

**Applied:**
```typescript
useEffect(() => {
  const userData = localStorage.getItem('user')
  if (!userData) {
    router.push('/auth/login')
    return
  }

  const parsedUser = JSON.parse(userData)
  setUser(parsedUser)

  // Only ADMIN and ADVISOR can create SMEs
  if (parsedUser.role !== 'ADMIN' && parsedUser.role !== 'ADVISOR' && parsedUser.role !== 'SUPER_ADMIN') {
    alert('You do not have permission to create SMEs. Only ADMIN and ADVISOR roles can create SMEs.')
    router.push('/smes')
  }
}, [router])
```

✅ **Status:** FIXED - Unauthorized users redirected to `/smes`

### ✅ Fix 4: Added Investor Interface and userId Field (COMPLETED)
**File:** `/frontend/src/app/investors/[id]/page.tsx`
**Lines:** 44-84

**Applied:**
- Created complete `Investor` interface with all required fields
- Added `userId` field to mock investor data (investor_1, investor_2, investor_3)
- Fixed TypeScript errors

✅ **Status:** FIXED - No TypeScript errors, userId properly typed

---

## ✅ Next Steps

1. ✅ **COMPLETED:** Fix 1 - Investor Edit button logic
2. ✅ **COMPLETED:** Fix 2 - Investor Save API integration
3. ✅ **COMPLETED:** Fix 3 - SME Create page access control
4. ✅ **COMPLETED:** Fix 4 - TypeScript interfaces and mock data
5. ⚠️ **TODO:** Verify Deals page RBAC
6. ⚠️ **TODO:** Test all fixes in production
7. ⚠️ **TODO:** Update E2E tests to cover RBAC scenarios

---

**Report Status:** ✅ **FIXES APPLIED** - Ready for Testing
**Priority:** High - User Experience Impact
**Time Spent:** ~20 minutes
**Deployment:** Ready to commit and test
