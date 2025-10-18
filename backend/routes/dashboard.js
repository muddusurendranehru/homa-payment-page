const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { User, Payment } = require('../models');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics for user
// @access  Private
router.get('/stats', [
    authenticateToken
], async (req, res) => {
    try {
        const patient_id = req.user.id;

        // Get payment statistics
        const totalPayments = await Payment.count({
            where: { patient_id, status: 'completed' }
        });

        const totalAmountPaid = await Payment.sum('amount', {
            where: { patient_id, status: 'completed' }
        }) || 0;

        const pendingPayments = await Payment.count({
            where: { patient_id, status: 'pending' }
        });

        // Get appointment statistics
        const totalAppointments = await Appointment.count({
            where: { patient_id }
        });

        const upcomingAppointments = await Appointment.count({
            where: {
                patient_id,
                status: 'scheduled',
                appointment_date: {
                    [require('sequelize').Op.gte]: new Date()
                }
            }
        });

        // Get recent payments
        const recentPayments = await Payment.findAll({
            where: { patient_id },
            order: [['created_at', 'DESC']],
            limit: 5,
            attributes: ['id', 'amount', 'status', 'payment_date', 'created_at']
        });

        // Get recent appointments
        const recentAppointments = await Appointment.findAll({
            where: { patient_id },
            order: [['appointment_date', 'DESC']],
            limit: 5,
            attributes: ['id', 'appointment_date', 'status', 'consultation_type', 'symptoms']
        });

        // Check for active payment sessions
        const activePaymentSessions = await PaymentSession.count({
            where: {
                patient_id,
                status: 'active',
                expires_at: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        res.json({
            success: true,
            data: {
                stats: {
                    totalPayments,
                    totalAmountPaid,
                    pendingPayments,
                    totalAppointments,
                    upcomingAppointments,
                    activePaymentSessions
                },
                recentPayments,
                recentAppointments
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard statistics',
            error: error.message
        });
    }
});

// @route   GET /api/dashboard/quick-actions
// @desc    Get quick actions for patient dashboard
// @access  Private (Patient only)
router.get('/quick-actions', [
    authenticateToken,
    requireRole(['patient'])
], async (req, res) => {
    try {
        const patient_id = req.user.id;

        // Check if patient has pending payments
        const pendingPayments = await Payment.findAll({
            where: { patient_id, status: 'pending' },
            attributes: ['id', 'amount', 'created_at']
        });

        // Check for active payment sessions
        const activeSessions = await PaymentSession.findAll({
            where: {
                patient_id,
                status: 'active',
                expires_at: {
                    [require('sequelize').Op.gt]: new Date()
                }
            },
            attributes: ['session_id', 'amount', 'expires_at']
        });

        const quickActions = [];

        // Add payment actions if there are pending payments
        if (pendingPayments.length > 0) {
            quickActions.push({
                id: 'pay_pending',
                title: 'Pay Pending Bills',
                description: `You have ${pendingPayments.length} pending payment(s)`,
                action: 'payment',
                icon: '💳',
                priority: 'high',
                data: pendingPayments
            });
        }

        // Add active session actions
        if (activeSessions.length > 0) {
            quickActions.push({
                id: 'active_sessions',
                title: 'Active Payment Links',
                description: `${activeSessions.length} payment link(s) active`,
                action: 'session',
                icon: '🔗',
                priority: 'medium',
                data: activeSessions
            });
        }

        // Add book appointment action
        quickActions.push({
            id: 'book_appointment',
            title: 'Book New Appointment',
            description: 'Schedule a consultation',
            action: 'appointment',
            icon: '📅',
            priority: 'low'
        });

        // Add view history action
        quickActions.push({
            id: 'view_history',
            title: 'View Payment History',
            description: 'Check your payment records',
            action: 'history',
            icon: '📊',
            priority: 'low'
        });

        res.json({
            success: true,
            data: {
                quickActions
            }
        });

    } catch (error) {
        console.error('Quick actions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get quick actions',
            error: error.message
        });
    }
});

// @route   POST /api/dashboard/generate-payment
// @desc    Generate payment link from dashboard
// @access  Private (Patient only)
router.post('/generate-payment', [
    authenticateToken,
    requireRole(['patient']),
    require('express-validator').body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least ₹1')
], async (req, res) => {
    try {
        const { amount, description } = req.body;
        const patient_id = req.user.id;

        // Import payment utilities
        const { generateUPILink } = require('../utils/paymentUtils');
        const { v4: uuidv4 } = require('uuid');

        // Create payment record
        const Payment = require('../models/Payment');
        const PaymentSession = require('../models/PaymentSession');

        const payment = await Payment.create({
            patient_id,
            amount,
            currency: 'INR',
            payment_method: 'upi',
            status: 'pending',
            transaction_id: uuidv4()
        });

        // Generate UPI link
        const upiLink = generateUPILink({
            amount,
            description: description || `Payment for Homa Healthcare - ${req.user.full_name}`,
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

        res.json({
            success: true,
            message: 'Payment link generated successfully',
            data: {
                payment_id: payment.id,
                session_id: sessionId,
                amount,
                upi_link: upiLink,
                expires_at: paymentSession.expires_at
            }
        });

    } catch (error) {
        console.error('Generate payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate payment link',
            error: error.message
        });
    }
});

module.exports = router;
