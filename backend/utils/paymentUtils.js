const nodemailer = require('nodemailer');

// Email transporter setup (only if SMTP is configured)
let emailTransporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
        emailTransporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } catch (error) {
        console.log('⚠️  Email transporter initialization skipped - SMTP not configured');
    }
}

/**
 * Generate UPI payment link
 * @param {Object} params - Payment parameters
 * @returns {string} UPI link
 */
const generateUPILink = (params) => {
    const {
        amount,
        description,
        transaction_id,
        upi_id = process.env.UPI_ID || 'homahealthcare@paytm'
    } = params;

    // Create UPI link with all required parameters
    const upiLink = `upi://pay?pa=${upi_id}&pn=${encodeURIComponent(process.env.MERCHANT_NAME || 'Homa Healthcare')}&am=${amount}&cu=INR&tn=${encodeURIComponent(description)}&tr=${transaction_id}`;
    
    return upiLink;
};

/**
 * Send payment SMS notification (SMS service disabled)
 * @param {string} phoneNumber - Recipient phone number
 * @param {Object} paymentData - Payment information
 */
const sendPaymentSMS = async (phoneNumber, paymentData) => {
    console.log('📱 SMS notification disabled');
    console.log(`Would send SMS to ${phoneNumber}:`, paymentData);
    return;
};

/**
 * Send payment email notification
 * @param {string} email - Recipient email
 * @param {Object} paymentData - Payment information
 */
const sendPaymentEmail = async (email, paymentData) => {
    try {
        if (!emailTransporter || !email) {
            console.log('Email not sent - SMTP not configured or email missing');
            return;
        }

        let subject = '';
        let htmlContent = '';

        if (paymentData.status === 'completed') {
            subject = '✅ Payment Confirmed - Homa Healthcare';
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #059669;">Payment Confirmed!</h2>
                    <p>Dear ${paymentData.patientName},</p>
                    <p>Your payment has been successfully processed:</p>
                    <ul>
                        <li><strong>Amount:</strong> ₹${paymentData.amount}</li>
                        <li><strong>Transaction ID:</strong> ${paymentData.transactionId}</li>
                        <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
                    </ul>
                    <p>Thank you for choosing Homa Healthcare!</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from Homa Healthcare Payment System.
                    </p>
                </div>
            `;
        } else {
            subject = '💳 Payment Link - Homa Healthcare';
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Payment Required</h2>
                    <p>Dear ${paymentData.patientName},</p>
                    <p>Please complete your payment of ₹${paymentData.amount} using the UPI link below:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${paymentData.upiLink}" 
                           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 6px; display: inline-block;">
                            💳 Pay Now with UPI
                        </a>
                    </div>
                    <p>Or copy this link: ${paymentData.upiLink}</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This payment link will expire in 15 minutes.
                    </p>
                </div>
            `;
        }

        await emailTransporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: subject,
            html: htmlContent
        });

        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
};

/**
 * Send Telegram notification to admin
 * @param {Object} paymentData - Payment information
 */
const sendTelegramNotification = async (paymentData) => {
    try {
        if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_ADMIN_CHAT_ID) {
            console.log('Telegram notification not sent - Bot not configured');
            return;
        }

        const TelegramBot = require('node-telegram-bot-api');
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

        let message = '';
        
        if (paymentData.status === 'completed') {
            message = `✅ Payment Received!\n\n` +
                     `Patient: ${paymentData.patientName}\n` +
                     `Amount: ₹${paymentData.amount}\n` +
                     `Transaction ID: ${paymentData.transactionId}\n` +
                     `Time: ${new Date().toLocaleString()}`;
        } else {
            message = `💳 New Payment Request\n\n` +
                     `Patient: ${paymentData.patientName}\n` +
                     `Amount: ₹${paymentData.amount}\n` +
                     `Time: ${new Date().toLocaleString()}`;
        }

        await bot.sendMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, message);
        console.log('Telegram notification sent to admin');
    } catch (error) {
        console.error('Telegram notification failed:', error);
    }
};

/**
 * Validate UPI ID format
 * @param {string} upiId - UPI ID to validate
 * @returns {boolean} Is valid UPI ID
 */
const isValidUPIId = (upiId) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiRegex.test(upiId);
};

/**
 * Format amount for UPI
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(2);
};

module.exports = {
    generateUPILink,
    sendPaymentSMS, // Disabled
    sendPaymentEmail,
    sendTelegramNotification,
    isValidUPIId,
    formatAmount
};
