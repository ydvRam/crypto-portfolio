const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Create transporter based on available credentials
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      // Gmail configuration (when credentials are provided)
      console.log('📧 Using Gmail SMTP configuration');
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD
        }
      });
    } else {
      // Ethereal configuration (for testing when Gmail credentials are not available)
      console.log('📧 Using Ethereal SMTP configuration for testing');
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
          pass: process.env.ETHEREAL_PASS || 'ethereal.pass'
        }
      });
    }
  }

  async sendNotificationEmail(user, notification) {
    try {
      console.log('📧 Attempting to send email to:', user.email);
      console.log('📧 Email configuration check:', {
        hasTransporter: !!this.transporter,
        emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
        emailPass: process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'PortfolioTracker <noreply@portfoliotracker.com>',
        to: user.email,
        subject: `🔔 ${notification.title}`,
        html: this.generateEmailTemplate(notification, user)
      };

      console.log('📧 Mail options:', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: result.previewUrl || null
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        stack: error.stack
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateEmailTemplate(notification, user) {
    const priorityColors = {
      low: '#10B981',
      medium: '#3B82F6',
      high: '#F59E0B',
      urgent: '#EF4444'
    };

    const priorityColor = priorityColors[notification.priority] || '#3B82F6';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portfolio Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0b0a22 0%, #0426de 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .priority-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; text-transform: uppercase; background-color: ${priorityColor}; }
          .message { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${priorityColor}; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Portfolio Notification</h1>
            <p>Hello ${user.username || 'User'}!</p>
          </div>
          
          <div class="content">
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="priority-badge">${notification.priority}</span>
            </div>
            
            <div class="message">
              <h2>${notification.title}</h2>
              <p>${notification.message}</p>
              
              ${notification.data.oldValue && notification.data.newValue ? `
                <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                  <strong>Change Details:</strong><br>
                  Previous: ${notification.data.oldValue}<br>
                  Current: ${notification.data.newValue}
                </div>
              ` : ''}
              
              ${notification.relatedAsset ? `
                <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                  <strong>Asset:</strong> ${notification.relatedAsset.name} (${notification.relatedAsset.symbol})
                </div>
              ` : ''}
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
            </div>
            
            <div class="footer">
              <p>This notification was sent because you have notifications enabled for this type of update.</p>
              <p>You can manage your notification preferences in your <a href="${process.env.FRONTEND_URL}/settings?tab=notifications">account settings</a>.</p>
              <p>&copy; 2025 PortfolioTracker. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(user) {
    const notification = {
      title: 'Welcome to PortfolioTracker!',
      message: 'Thank you for joining PortfolioTracker. Start tracking your investments and never miss important updates.',
      priority: 'medium',
      type: 'system_notification'
    };

    return await this.sendNotificationEmail(user, notification);
  }

  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'PortfolioTracker <noreply@portfoliotracker.com>',
        to: user.email,
        subject: '🔐 Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Hello ${user.username},</p>
            <p>You requested a password reset for your PortfolioTracker account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Password reset email failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
