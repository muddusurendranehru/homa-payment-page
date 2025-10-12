const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Payment, PaymentSession, User, Appointment } = require('../models');
const { generateUPILink, sendPaymentSMS, sendPaymentEmail } = require('../utils/paymentUtils');

const router = express.Router();

// @route   POST /api/payments/generate-upi
// @desc    Generate UPI payment link for patient
// @access  Private (Patient only)
router.post('/generate-upi', [
    authenticateToken,
    requireRole(['patient']),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least ₹1'),
    body('appointment_id').optional().isInt().withMessage('Invalid appointment ID'),
    body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { amount, appointment_id, description } = req.body;
        const patient_id = req.user.id;

        // Create payment record
        const payment = await Payment.create({
            patient_id,
            appointment_id,
            amount,
            currency: 'INR',
            payment_method: 'upi',
            status: 'pending',
            transaction_id: uuidv4()
        });

        // Generate UPI link
        const upiLink = generateUPILink({
            amount,
            description: description || `Payment for Homa Healthcare - Patient: ${req.user.full_name}`,
            transaction_id: payment.transaction_id
        });

        // Create payment session
        const sessionId = uuidv4();
        const paymentSession = await PaymentSession.create({
            session_id: sessionId,
            patient_id,
            amount,
            upi_link: upiLink,
            status: 'active',
            expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        });

        // Send SMS notification
        await sendPaymentSMS(req.user.phone, {
            amount,
            upiLink,
            patientName: req.user.full_name
        });

        res.json({
            success: true,
            message: 'UPI payment link generated successfully',
            data: {
                payment_id: payment.id,
                session_id: sessionId,
                amount,
                upi_link: upiLink,
                expires_at: paymentSession.expires_at,
                payment: {
                    id: payment.id,
                    amount: payment.amount,
                    status: payment.status,
                    transaction_id: payment.transaction_id,
                    created_at: payment.created_at
                }
            }
        });

    } catch (error) {
        console.error('Generate UPI error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate UPI payment link',
            error: error.message
        });
    }
});

// @route   POST /api/payments/confirm-payment
// @desc    Confirm payment completion
// @access  Private (Patient only)
router.post('/confirm-payment', [
    authenticateToken,
    requireRole(['patient']),
    body('session_id').isUUID().withMessage('Valid session ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { session_id } = req.body;
        const patient_id = req.user.id;

        // Find payment session
        const paymentSession = await PaymentSession.findOne({
            where: {
                session_id,
                patient_id,
                status: 'active'
            }
        });

        if (!paymentSession) {
            return res.status(404).json({
                success: false,
                message: 'Payment session not found or expired'
            });
        }

        // Check if session is expired
        if (new Date() > paymentSession.expires_at) {
            paymentSession.status = 'expired';
            await paymentSession.save();
            
            return res.status(400).json({
                success: false,
                message: 'Payment session has expired'
            });
        }

        // Find associated payment
        const payment = await Payment.findOne({
            where: {
                patient_id,
                amount: paymentSession.amount,
                status: 'pending'
            },
            order: [['created_at', 'DESC']]
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        // Update payment status
        payment.status = 'completed';
        payment.payment_date = new Date();
        payment.upi_transaction_id = `UPI_${payment.transaction_id}`;
        await payment.save();

        // Update payment session
        paymentSession.status = 'completed';
        await paymentSession.save();

        // Send confirmation SMS and email
        await sendPaymentSMS(req.user.phone, {
            amount: payment.amount,
            status: 'completed',
            patientName: req.user.full_name,
            transactionId: payment.transaction_id
        });

        if (req.user.email) {
            await sendPaymentEmail(req.user.email, {
                amount: payment.amount,
                status: 'completed',
                patientName: req.user.full_name,
                transactionId: payment.transaction_id
            });
        }

        res.json({
            success: true,
            message: 'Payment confirmed successfully',
            data: {
                payment: {
                    id: payment.id,
                    amount: payment.amount,
                    status: payment.status,
                    transaction_id: payment.transaction_id,
                    payment_date: payment.payment_date
                }
            }
        });

    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to confirm payment',
            error: error.message
        });
    }
});

// @route   GET /api/payments/history
// @desc    Get payment history for patient
// @access  Private (Patient only)
router.get('/history', [
    authenticateToken,
    requireRole(['patient'])
], async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const payments = await Payment.findAndCountAll({
            where: { patient_id: req.user.id },
            include: [
                {
                    model: Appointment,
                    as: 'appointment',
                    attributes: ['id', 'appointment_date', 'status', 'consultation_type']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                payments: payments.rows,
                pagination: {
                    total: payments.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(payments.count / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment history',
            error: error.message
        });
    }
});

// @route   GET /api/payments/:id
// @desc    Get specific payment details
// @access  Private (Patient only)
router.get('/:id', [
    authenticateToken,
    requireRole(['patient'])
], async (req, res) => {
    try {
        const payment = await Payment.findOne({
            where: {
                id: req.params.id,
                patient_id: req.user.id
            },
            include: [
                {
                    model: Appointment,
                    as: 'appointment',
                    attributes: ['id', 'appointment_date', 'status', 'consultation_type', 'symptoms']
                }
            ]
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: { payment }
        });

    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment details',
            error: error.message
        });
    }
});

// @route   POST /api/payments/webhook
// @desc    Handle payment gateway webhooks
// @access  Public (Webhook endpoint)
router.post('/webhook', async (req, res) => {
    try {
        const webhookData = req.body;
        
        // Log webhook data
        console.log('Payment webhook received:', webhookData);
        
        // TODO: Implement webhook verification and processing
        // This would typically involve:
        // 1. Verify webhook signature
        // 2. Process payment status update
        // 3. Update database records
        // 4. Send notifications
        
        res.status(200).json({
            success: true,
            message: 'Webhook received'
        });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed'
        });
    }
});

module.exports = router;
