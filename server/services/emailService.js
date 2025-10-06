const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send transaction receipt
const sendTransactionReceipt = async (userEmail, transactionData) => {
  const { orderId, amount, network, phoneNumber, package, status, date } = transactionData;

  const mailOptions = {
    from: `"UnlimitedData GH" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Transaction Receipt - Order #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .receipt-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .receipt-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .status-completed { background: #10b981; color: white; }
          .status-pending { background: #f59e0b; color: white; }
          .status-failed { background: #ef4444; color: white; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Transaction Receipt</h1>
            <p>Thank you for your purchase!</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your transaction has been processed successfully. Here are the details:</p>
            
            <div class="receipt-box">
              <div class="receipt-row">
                <span class="label">Order ID:</span>
                <span class="value">#${orderId}</span>
              </div>
              <div class="receipt-row">
                <span class="label">Date:</span>
                <span class="value">${new Date(date).toLocaleString()}</span>
              </div>
              <div class="receipt-row">
                <span class="label">Network:</span>
                <span class="value">${network}</span>
              </div>
              <div class="receipt-row">
                <span class="label">Phone Number:</span>
                <span class="value">${phoneNumber}</span>
              </div>
              <div class="receipt-row">
                <span class="label">Package:</span>
                <span class="value">${package}</span>
              </div>
              <div class="receipt-row">
                <span class="label">Amount:</span>
                <span class="value">GHS ${amount.toFixed(2)}</span>
              </div>
              <div class="receipt-row">
                <span class="label">Status:</span>
                <span class="value">
                  <span class="status status-${status.toLowerCase()}">${status}</span>
                </span>
              </div>
            </div>

            <p>Your data bundle will be delivered within 5 minutes. If you don't receive it, please contact support.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'https://unlimiteddata.gh'}/myorders" class="button">View My Orders</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 UnlimitedData GH. All rights reserved.</p>
            <p>Need help? Contact us at ${process.env.SUPPORT_EMAIL || 'support@unlimiteddata.gh'}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Receipt sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending receipt:', error);
    return { success: false, error: error.message };
  }
};

// Send withdrawal confirmation
const sendWithdrawalConfirmation = async (userEmail, withdrawalData) => {
  const { amount, bankAccount, status, date, reference } = withdrawalData;

  const mailOptions = {
    from: `"UnlimitedData GH" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Withdrawal ${status} - ${reference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Withdrawal ${status}</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your withdrawal request has been ${status.toLowerCase()}.</p>
            
            <div class="info-box">
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Amount:</strong> GHS ${amount.toFixed(2)}</p>
              <p><strong>Bank Account:</strong> ${bankAccount}</p>
              <p><strong>Date:</strong> ${new Date(date).toLocaleString()}</p>
              <p><strong>Status:</strong> ${status}</p>
            </div>

            <p>${status === 'Approved' ? 'Your funds will be transferred within 24-48 hours.' : 'If you have any questions, please contact support.'}</p>
          </div>
          <div class="footer">
            <p>© 2025 UnlimitedData GH. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Withdrawal confirmation sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending withdrawal confirmation:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email for new agents
const sendAgentWelcomeEmail = async (userEmail, agentData) => {
  const { name, agentCode, storeUrl } = agentData;

  const mailOptions = {
    from: `"UnlimitedData GH" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Welcome to UnlimitedData GH Agent Program! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .agent-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 2px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome, Agent ${name}!</h1>
            <p>You're now part of the UnlimitedData GH family</p>
          </div>
          <div class="content">
            <p>Congratulations! Your agent account has been activated.</p>
            
            <div class="code-box">
              <p>Your Agent Code:</p>
              <div class="agent-code">${agentCode}</div>
            </div>

            <p><strong>Your Store URL:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all;">
              ${storeUrl}
            </p>

            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Customize your store settings</li>
              <li>Add products to your catalog</li>
              <li>Share your store link with customers</li>
              <li>Track your earnings in the dashboard</li>
            </ul>

            <div style="text-align: center;">
              <a href="${storeUrl}" class="button">Visit Your Store</a>
              <a href="${process.env.CLIENT_URL || 'https://unlimiteddata.gh'}/agent/dashboard" class="button" style="background: #10b981;">Go to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 UnlimitedData GH. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send 2FA code
const send2FACode = async (userEmail, code, userName) => {
  const mailOptions = {
    from: `"UnlimitedData GH" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Your Login Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .code { font-size: 48px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Login Verification</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Someone is trying to sign in to your account. Use the code below to complete your login:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
              <p style="color: #666; margin-top: 15px;">This code expires in 10 minutes</p>
            </div>

            <div class="warning">
              <p><strong>⚠️ Security Alert:</strong></p>
              <p>If you didn't request this code, someone may be trying to access your account. Please change your password immediately.</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 UnlimitedData GH. All rights reserved.</p>
            <p>Never share this code with anyone.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`2FA code sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending 2FA code:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendTransactionReceipt,
  sendWithdrawalConfirmation,
  sendAgentWelcomeEmail,
  send2FACode,
};

