import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'contact@cambobia.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3005';

/**
 * Email Templates
 */

// Welcome email for new users
export async function sendWelcomeEmail(to: string, userName: string, userRole: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: 'Welcome to Boutique Advisory Platform!',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to BIA Platform!</h1>
              </div>
              <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>Thank you for joining the Boutique Advisory Platform as a <strong>${userRole}</strong>.</p>
                <p>We're excited to have you on board. Our platform connects SMEs with investors through expert advisory services.</p>
                <p>Here's what you can do next:</p>
                <ul>
                  <li>Complete your profile</li>
                  <li>Explore available opportunities</li>
                  <li>Connect with other members</li>
                </ul>
                <a href="${FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
                <p>If you have any questions, feel free to reach out to our support team.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Boutique Advisory Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Error sending welcome email:', error);
            return { success: false, error };
        }

        console.log('✅ Welcome email sent to:', to);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        return { success: false, error };
    }
}

// New match notification
export async function sendMatchNotification(
    to: string,
    userName: string,
    matchName: string,
    matchType: 'SME' | 'INVESTOR',
    matchScore: number
) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: `New Match Found: ${matchName}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .match-score { font-size: 48px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎯 New Match Found!</h1>
              </div>
              <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>We found a great match for you:</p>
                <h3>${matchName}</h3>
                <p>Type: <strong>${matchType}</strong></p>
                <div class="match-score">${matchScore}% Match</div>
                <p>This match was identified based on your preferences and profile. We think you'll find this opportunity interesting!</p>
                <a href="${FRONTEND_URL}/matchmaking" class="button">View Match Details</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Boutique Advisory Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Error sending match notification:', error);
            return { success: false, error };
        }

        console.log('✅ Match notification sent to:', to);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send match notification:', error);
        return { success: false, error };
    }
}

// Deal update notification
export async function sendDealUpdateNotification(
    to: string,
    userName: string,
    dealTitle: string,
    updateType: 'PUBLISHED' | 'FUNDED' | 'CLOSED' | 'DOCUMENT_UPLOADED'
) {
    const updateMessages = {
        PUBLISHED: 'A new deal has been published',
        FUNDED: 'has been successfully funded',
        CLOSED: 'has been closed',
        DOCUMENT_UPLOADED: 'New document uploaded to',
    };

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: `Deal Update: ${dealTitle}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Deal Update</h1>
              </div>
              <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>${updateMessages[updateType]}: <strong>${dealTitle}</strong></p>
                <a href="${FRONTEND_URL}/deals" class="button">View Deal</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Boutique Advisory Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Error sending deal update notification:', error);
            return { success: false, error };
        }

        console.log('✅ Deal update notification sent to:', to);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send deal update notification:', error);
        return { success: false, error };
    }
}

// Booking confirmation
export async function sendBookingConfirmation(
    to: string,
    userName: string,
    serviceName: string,
    advisorName: string,
    bookingDate: Date
) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: `Booking Confirmed: ${serviceName}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Booking Confirmed</h1>
              </div>
              <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>Your booking has been confirmed:</p>
                <div class="booking-details">
                  <p><strong>Service:</strong> ${serviceName}</p>
                  <p><strong>Advisor:</strong> ${advisorName}</p>
                  <p><strong>Date:</strong> ${bookingDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
                </div>
                <a href="${FRONTEND_URL}/calendar" class="button">View in Calendar</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Boutique Advisory Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Error sending booking confirmation:', error);
            return { success: false, error };
        }

        console.log('✅ Booking confirmation sent to:', to);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send booking confirmation:', error);
        return { success: false, error };
    }
}

// Password reset email
export async function sendPasswordResetEmail(to: string, resetToken: string) {
    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: 'Reset Your Password',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset</h1>
              </div>
              <div class="content">
                <p>You requested to reset your password.</p>
                <p>Click the button below to create a new password:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <div class="warning">
                  <p><strong>⚠️ Security Notice:</strong></p>
                  <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Boutique Advisory Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Error sending password reset email:', error);
            return { success: false, error };
        }

        console.log('✅ Password reset email sent to:', to);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        return { success: false, error };
    }
}

// Generic notification email
export async function sendNotificationEmail(
    to: string,
    subject: string,
    message: string,
    actionUrl?: string,
    actionText?: string
) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: subject,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📬 Notification</h1>
              </div>
              <div class="content">
                <p>${message}</p>
                ${actionUrl && actionText ? `<a href="${actionUrl}" class="button">${actionText}</a>` : ''}
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Boutique Advisory Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Error sending notification email:', error);
            return { success: false, error };
        }

        console.log('✅ Notification email sent to:', to);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send notification email:', error);
        return { success: false, error };
    }
}
