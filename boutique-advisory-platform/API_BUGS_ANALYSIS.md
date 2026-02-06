# 🐛 API Endpoint Bugs - IDENTIFIED & SOLUTIONS

## ✅ **Issues Found:**

### 1. **`GET /api/deal` → 404 Not Found**

**Problem:**
- Backend route registered as: `/api/deals` (plural)
- Frontend calling: `/api/deal` (singular)
- **Mismatch!**

**Location:**
- Backend: `backend/src/index.ts` line 262
- Route file: `backend/src/routes/deal.ts`

**Solution Options:**

#### Option A: Fix Backend (Change route to singular)
```typescript
// backend/src/index.ts line 262
// Change from:
app.use('/api/deals', authenticateToken, dealRoutes);

// To:
app.use('/api/deal', authenticateToken, dealRoutes);
```

#### Option B: Fix Frontend (Change calls to plural)
```typescript
// Find all instances of '/api/deal' in frontend
// Change to: '/api/deals'
```

**Recommendation:** Use **Option B** (plural `/api/deals`) because:
- RESTful convention uses plurals for collections
- More standard API design
- Less confusing

---

### 2. **`POST /api/payments/create-payment-intent` → 500 Internal Server Error**

**Problem:**
- Stripe is using mock/placeholder key: `sk_test_mock`
- When called, Stripe API rejects the mock key
- Causes 500 error

**Location:**
- `backend/src/utils/stripe.ts` line 3
- `.env` has placeholder: `STRIPE_SECRET_KEY=sk_test_...`

**Solution:**

#### Get Real Stripe Test Key:
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy "Secret key" (starts with `sk_test_...`)
3. Add to `backend/.env`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_actual_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

#### Or Disable Payments Temporarily:
- Comment out payment routes in `index.ts`
- Or add error handling to gracefully fail

---

## 🔧 **Recommended Fixes:**

### Fix 1: Update API Route to Plural

**File:** `backend/src/index.ts`

```typescript
// Line 262 - Change from:
app.use('/api/deals', authenticateToken, dealRoutes);

// Keep as is (already correct!)
```

**File:** Frontend files calling `/api/deal`

Find and replace:
- `/api/deal` → `/api/deals`

**Files to check:**
- `frontend/src/app/syndicate/create/page.tsx` (line 53)
- Any other files calling the deal API

---

### Fix 2: Add Stripe Keys or Disable

**Option A: Add Real Stripe Keys**

1. Get keys from: https://dashboard.stripe.com/test/apikeys
2. Update `backend/.env`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_51...
   STRIPE_PUBLISHABLE_KEY=pk_test_51...
   ```

**Option B: Graceful Fallback**

Update `backend/src/utils/stripe.ts`:

```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2023-10-16' as any,
});

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
        // Check if using mock key
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_...') {
            throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to .env');
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        return paymentIntent;
    } catch (error) {
        console.error('Stripe error:', error);
        throw error;
    }
}
```

---

## 📋 **Implementation Checklist:**

### High Priority:
- [ ] Fix `/api/deal` → `/api/deals` in frontend
- [ ] Add Stripe keys OR add graceful error handling
- [ ] Test both endpoints

### Medium Priority:
- [ ] Add better error messages for missing Stripe keys
- [ ] Update frontend to handle payment errors gracefully

### Low Priority:
- [ ] Add Stripe webhook signature verification
- [ ] Add payment status tracking in database

---

## 🧪 **Testing:**

### Test Deal Endpoint:
```bash
# After fixing, test with:
curl -X GET http://localhost:3001/api/deals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Payment Endpoint:
```bash
# After adding Stripe keys:
curl -X POST http://localhost:3001/api/payments/create-payment-intent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

---

## 🎯 **Next Steps:**

1. **Fix deal endpoint** (quick - just update frontend)
2. **Decide on Stripe**:
   - Get test keys (5 minutes)
   - OR add graceful error handling (2 minutes)
3. **Test both endpoints**
4. **Move to next feature**

---

**Would you like me to implement these fixes now?** 🚀
