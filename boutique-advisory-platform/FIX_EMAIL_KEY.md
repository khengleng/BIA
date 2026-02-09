# 📧 Email Service Fix: Invalid API Key

The email service is failing because the **Resend API Key is invalid** (Error 401).

You need to generate a new API key and update it in Railway.

## 1. Get a New API Key
1.  Go to [Resend Dashboard](https://resend.com/api-keys).
2.  Click **Create API Key**.
3.  Name it: `Production Key` (or similar).
4.  Permission: **Full Access** (or Sending access).
5.  **Copy the new key**. (It starts with `re_...`)

## 2. Update Railway (Production)
1.  Go to your **Railway Dashboard**.
2.  Select your **Backend Service**.
3.  Go to the **Variables** tab.
4.  Find `RESEND_API_KEY` and update the value with your **new key**.
5.  **Redeploy** the backend service.

## 3. Verify Sender
Ensure your `EMAIL_FROM` variable matches your verified domain:
-   **Correct:** `contact@cambobia.com` (If `cambobia.com` is verified)
-   **If not verified yet:** You can only send to your own email using `onboarding@resend.dev` as sender.

## 4. Test
Once redeployed:
1.  Go to `https://www.cambobia.com/auth/forgot-password`.
2.  Enter your email.
3.  You should now receive the reset link.
