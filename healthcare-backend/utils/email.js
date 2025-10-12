const nodemailer = require('nodemailer');
require('dotenv').config();

// Email transporter setup
let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    console.log('✅ Email service initialized');
} else {
    console.log('⚠️  Email service not configured - skipping email notifications');
}

// Send appointment confirmation email
const sendAppointmentConfirmation = async (appointmentData) => {
    if (!transporter) {
        console.log('📧 Email skipped (not configured):', appointmentData.patientEmail);
        return;
    }

    const { patientEmail, patientName, doctorName, appointmentDate, appointmentTime, appointmentId } = appointmentData;

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'Homa Healthcare <noreply@homahealthcare.com>',
        to: patientEmail,
        subject: '✅ Appointment Confirmation - Homa Healthcare',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; color: #777; padding: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏥 Appointment Confirmed</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${patientName}</strong>,</p>
                        <p>Your appointment has been successfully confirmed at Homa Healthcare.</p>
                        
                        <div class="appointment-details">
                            <h3>Appointment Details</h3>
                            <div class="detail-row">
                                <span><strong>Appointment ID:</strong></span>
                                <span>#${appointmentId}</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Doctor:</strong></span>
                                <span>${doctorName}</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Date:</strong></span>
                                <span>${appointmentDate}</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Time:</strong></span>
                                <span>${appointmentTime}</span>
                            </div>
                        </div>
                        
                        <p><strong>Important Reminders:</strong></p>
                        <ul>
                            <li>Please arrive 10 minutes before your scheduled time</li>
                            <li>Bring your medical records if available</li>
                            <li>Wear a mask for safety</li>
                        </ul>
                        
                        <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
                        
                        <p>Thank you for choosing Homa Healthcare!</p>
                    </div>
                    <div class="footer">
                        <p>${process.env.CLINIC_NAME || 'Homa Healthcare Clinic'}<br>
                        ${process.env.CLINIC_ADDRESS || ''}<br>
                        ${process.env.CLINIC_PHONE || ''}</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Appointment confirmation email sent to ${patientEmail}`);
    } catch (error) {
        console.error('Email sending error:', error);
    }
};

// Send payment receipt email
const sendPaymentReceipt = async (paymentData) => {
    if (!transporter) {
        console.log('📧 Email skipped (not configured):', paymentData.patientEmail);
        return;
    }

    const { patientEmail, patientName, amount, transactionId, paymentDate, invoiceNumber } = paymentData;

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'Homa Healthcare <noreply@homahealthcare.com>',
        to: patientEmail,
        subject: '💳 Payment Receipt - Homa Healthcare',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .amount { font-size: 32px; color: #11998e; font-weight: bold; text-align: center; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; color: #777; padding: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💳 Payment Successful</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${patientName}</strong>,</p>
                        <p>Your payment has been successfully processed.</p>
                        
                        <div class="amount">₹${amount}</div>
                        
                        <div class="receipt">
                            <h3>Payment Details</h3>
                            <div class="detail-row">
                                <span><strong>Transaction ID:</strong></span>
                                <span>${transactionId}</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Invoice Number:</strong></span>
                                <span>${invoiceNumber}</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Payment Date:</strong></span>
                                <span>${paymentDate}</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Status:</strong></span>
                                <span style="color: #11998e;">✅ Completed</span>
                            </div>
                        </div>
                        
                        <p>This email serves as your payment receipt. Please keep it for your records.</p>
                        
                        <p>Thank you for your payment!</p>
                    </div>
                    <div class="footer">
                        <p>${process.env.CLINIC_NAME || 'Homa Healthcare Clinic'}<br>
                        ${process.env.CLINIC_ADDRESS || ''}<br>
                        ${process.env.CLINIC_PHONE || ''}</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Payment receipt email sent to ${patientEmail}`);
    } catch (error) {
        console.error('Email sending error:', error);
    }
};

module.exports = {
    sendAppointmentConfirmation,
    sendPaymentReceipt
};

