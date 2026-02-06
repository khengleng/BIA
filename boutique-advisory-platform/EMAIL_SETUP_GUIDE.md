# 📧 Email Notifications Implementation Guide

## ✅ What's Implemented

The platform now has **full email notification system** using Resend for reliable email delivery.

### Email Templates Available:
- ✅ **Welcome Email** - Sent when users register
- ✅ **Match Notification** - Sent when SME-Investor matches are found
- ✅ **Deal Updates** - Published, funded, closed, document uploaded
- ✅ **Booking Confirmation** - Advisory service bookings
- ✅ **Password Reset** - Secure password reset links
- ✅ **Generic Notifications** - Flexible template for any notification

---

## 🚀 Setup Instructions

### Step 1: Create Resend Account

1. **Go to Resend**: https://resend.com/
2. **Sign up** (free tier: 100 emails/day, 3,000/month)
3. **Verify your email**

### Step 2: Add Your Domain

1. **Go to Domains**: https://resend.com/domains
2. **Click "Add Domain"**
3. **Enter your domain**: `cambobia.com`
4. **Add DNS Records**:
   - Copy the DNS records shown
   - Add them to your domain's DNS settings (Cloudflare, GoDaddy, etc.)
   - Wait for verification (usually 5-15 minutes)

### Step 3: Create API Key

1. **Go to API Keys**: https://resend.com/api-keys
2. **Click "Create API Key"**
3. **Name**: "BIA Platform"
4. **Permission**: "Sending access"
5. **Domain**: Select `cambobia.com`
6. **Copy the API key** (starts with `re_...`)

### Step 4: Update Environment Variables

Add to `backend/.env`:

```bash
# Email Configuration (Resend)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=contact@cambobia.com
```

### Step 5: Restart Backend

```bash
cd backend
npm run dev
```

---

## 🧪 Testing

### Test Welcome Email

Register a new user:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "INVESTOR"
  }'
```

Check the email inbox for `test@example.com` - you should receive a welcome email!

### Test Password Reset

```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

---

## 📝 Email Templates

### 1. Welcome Email
**Sent when**: User registers
**Triggers**: `POST /api/auth/register`
**Function**: `sendWelcomeEmail(email, userName, userRole)`

### 2. Match Notification
**Sent when**: New SME-Investor match found
**Triggers**: Matchmaking algorithm
**Function**: `sendMatchNotification(email, userName, matchName, matchType, matchScore)`

### 3. Deal Update
**Sent when**: Deal status changes or document uploaded
**Triggers**: Deal updates
**Function**: `sendDealUpdateNotification(email, userName, dealTitle, updateType)`

### 4. Booking Confirmation
**Sent when**: Advisory service booked
**Triggers**: `POST /api/bookings`
**Function**: `sendBookingConfirmation(email, userName, serviceName, advisorName, bookingDate)`

### 5. Password Reset
**Sent when**: User requests password reset
**Triggers**: `POST /api/auth/forgot-password`
**Function**: `sendPasswordResetEmail(email, resetToken)`

### 6. Generic Notification
**Sent when**: Any custom notification needed
**Function**: `sendNotificationEmail(email, subject, message, actionUrl?, actionText?)`

---

## 🎨 Customizing Email Templates

Edit `backend/src/utils/email.ts` to customize:

- **Colors**: Change gradient colors in the header
- **Logo**: Add your logo image URL
- **Content**: Modify the HTML templates
- **Styling**: Update inline CSS

Example:
```typescript
.header { 
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%); 
}
```

---

## 🔧 Adding New Email Types

1. **Create new function** in `backend/src/utils/email.ts`:

```typescript
export async function sendYourNewEmail(to: string, data: any) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Your Subject',
      html: `
        <!-- Your HTML template -->
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('✅ Email sent to:', to);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
```

2. **Import and use** in your route:

```typescript
import { sendYourNewEmail } from '../utils/email';

// In your route handler
sendYourNewEmail(user.email, data)
  .catch(error => console.error('Failed to send email:', error));
```

---

## 📊 Email Delivery Monitoring

### Resend Dashboard

View email stats at: https://resend.com/emails

- **Delivery status**: Sent, delivered, bounced
- **Open rates**: Track email opens
- **Click rates**: Track link clicks
- **Logs**: View detailed delivery logs

---

## 🔒 Security Best Practices

1. ✅ **Never log email content** - Emails may contain sensitive info
2. ✅ **Use environment variables** - Never hardcode API keys
3. ✅ **Validate email addresses** - Prevent spam/abuse
4. ✅ **Rate limit** - Prevent email bombing
5. ✅ **Don't block requests** - Send emails asynchronously

---

## 🐛 Troubleshooting

### Email not sending

**Check**:
1. Is `RESEND_API_KEY` set in `.env`?
2. Is the domain verified in Resend?
3. Check backend logs for errors
4. Verify email address is valid

### Email goes to spam

**Solutions**:
1. Add SPF, DKIM, DMARC records (Resend provides these)
2. Warm up your domain (start with low volume)
3. Avoid spam trigger words
4. Include unsubscribe link

### Domain not verifying

**Check**:
1. DNS records are correctly added
2. Wait 15-30 minutes for propagation
3. Use DNS checker: https://dnschecker.org/
4. Contact Resend support if issues persist

---

## 💰 Pricing

### Resend Free Tier:
- ✅ 100 emails/day
- ✅ 3,000 emails/month
- ✅ All features included

### Paid Plans (if needed):
- **Pro**: $20/month - 50,000 emails/month
- **Business**: Custom pricing

---

## 🚀 Production Deployment

### Railway Environment Variables

Add to Railway dashboard:

```
RESEND_API_KEY=re_your_production_key
EMAIL_FROM=contact@cambobia.com
FRONTEND_URL=https://www.cambobia.com
```

### Domain Setup

1. Verify `cambobia.com` in Resend
2. Add DNS records to your domain
3. Test email sending from production

---

## 📈 Next Steps

### Optional Enhancements:

1. **Email Templates Library**: Use React Email for better templates
2. **Batch Emails**: Send bulk notifications
3. **Email Preferences**: Let users choose notification types
4. **Unsubscribe**: Add unsubscribe functionality
5. **Analytics**: Track email performance

---

## 📚 Resources

- **Resend Docs**: https://resend.com/docs
- **React Email**: https://react.email/ (for better templates)
- **Email Testing**: https://mailtrap.io/ (test emails without sending)

---

## ✅ Status: COMPLETE

Email notifications are **fully implemented** and ready to use!

**Next**: Just add your Resend API key and start sending emails! 🎉
