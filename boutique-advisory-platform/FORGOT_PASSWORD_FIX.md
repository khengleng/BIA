# 🔐 Forgot Password Fix

I have updated the backend code to ensure that password reset links point to the correct production URL (`https://www.cambobia.com`) instead of localhost.

## ✅ What I Fixed:

1.  **Backend Email Utility**: Updated `FRONTEND_URL` default to `https://www.cambobia.com`.
2.  **CORS Configuration**: Updated allowed origins to include the production domain by default.
3.  **URL Construction**: Added safety checks to prevent double slashes in email links (e.g., `...com//auth...`).

## 🚀 Required Action: Update Railway Variables

For the fix to work in production, you **MUST** add/verify the following environment variable in your **Backend Service** on Railway:

1.  Go to **Railway Dashboard** > **Backend Service** > **Variables**.
2.  Add or Update:
    *   `FRONTEND_URL`: `https://www.cambobia.com`
    *   `EMAIL_FROM`: `contact@cambobia.com` (Ensure this matches your verified domain)

## 🧪 How to Test:

1.  **Deploy** the latest changes to Railway (automatic if connected to GitHub).
2.  Go to `https://www.cambobia.com/auth/login`.
3.  Click **"Forgot password?"**.
4.  Enter your email address.
5.  Check your email for the reset link.
6.  The link should now start with `https://www.cambobia.com/...`.
7.  Click the link and verify you can reset your password.
