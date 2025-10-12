const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { sendPaymentReceipt } = require('../utils/email');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Initialize Stripe (only if configured)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized');
} else {
    console.log('⚠️  Stripe not configured - payment processing disabled');
}

// Create Stripe checkout session
router.post('/create-checkout-session', verifyToken,
    [
        body('appointment_id').optional().isInt(),
        body('amount').isFloat({ min: 1 }),
        body('description').optional().trim()
    ],
    async (req, res) => {
        try {
            if (!stripe) {
                return res.status(503).json({
                    success: false,
                    message: 'Payment service not configured'
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const { appointment_id, amount, description } = req.body;
            const patient_id = req.user.id;

            // Get patient details
            const patientResult = await pool.query(
                'SELECT full_name, email FROM users WHERE id = $1',
                [patient_id]
            );
            const patient = patientResult.rows[0];

            // Create transaction ID
            const transaction_id = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

            // Create payment record
            const paymentResult = await pool.query(
                `INSERT INTO payments (patient_id, appointment_id, amount, transaction_id, payment_status, description)
                 VALUES ($1, $2, $3, $4, 'pending', $5)
                 RETURNING id`,
                [patient_id, appointment_id, amount, transaction_id, description || 'Healthcare consultation payment']
            );
            const payment_id = paymentResult.rows[0].id;

            // Create Stripe checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                customer_email: patient.email,
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: description || 'Healthcare Consultation',
                                description: `Payment for ${patient.full_name}`
                            },
                            unit_amount: Math.round(amount * 100) // Convert to paise
                        },
                        quantity: 1
                    }
                ],
                metadata: {
                    payment_id: payment_id.toString(),
                    patient_id: patient_id.toString(),
                    transaction_id: transaction_id
                },
                success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
            });

            // Update payment with Stripe session ID
            await pool.query(
                'UPDATE payments SET stripe_session_id = $1 WHERE id = $2',
                [session.id, payment_id]
            );

            res.json({
                success: true,
                data: {
                    sessionId: session.id,
                    url: session.url,
                    payment_id,
                    transaction_id
                }
            });

        } catch (error) {
            console.error('Create checkout session error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create checkout session',
                error: error.message
            });
        }
    }
);

// Verify payment after Stripe checkout
router.post('/verify-session', verifyToken,
    [
        body('session_id').notEmpty()
    ],
    async (req, res) => {
        try {
            if (!stripe) {
                return res.status(503).json({
                    success: false,
                    message: 'Payment service not configured'
                });
            }

            const { session_id } = req.body;

            // Retrieve session from Stripe
            const session = await stripe.checkout.sessions.retrieve(session_id);

            if (session.payment_status === 'paid') {
                const payment_id = session.metadata.payment_id;

                // Generate invoice number
                const invoice_number = `INV${Date.now()}`;

                // Update payment status
                const result = await pool.query(
                    `UPDATE payments 
                     SET payment_status = 'completed', 
                         payment_date = CURRENT_TIMESTAMP,
                         stripe_payment_intent_id = $1,
                         invoice_number = $2,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $3
                     RETURNING *`,
                    [session.payment_intent, invoice_number, payment_id]
                );

                const payment = result.rows[0];

                // Create invoice
                const invoiceResult = await pool.query(`
                    INSERT INTO invoices (
                        payment_id, invoice_number, patient_name, patient_email, patient_phone,
                        service_description, amount, total_amount, issue_date, payment_status
                    )
                    SELECT 
                        p.id, p.invoice_number, u.full_name, u.email, u.phone,
                        p.description, p.amount, p.amount, CURRENT_DATE, 'paid'
                    FROM payments p
                    JOIN users u ON p.patient_id = u.id
                    WHERE p.id = $1
                    RETURNING *
                `, [payment_id]);

                const invoice = invoiceResult.rows[0];

                // Get patient details for email
                const patientResult = await pool.query(
                    'SELECT email, full_name FROM users WHERE id = $1',
                    [payment.patient_id]
                );
                const patient = patientResult.rows[0];

                // Send payment receipt email
                await sendPaymentReceipt({
                    patientEmail: patient.email,
                    patientName: patient.full_name,
                    amount: payment.amount,
                    transactionId: payment.transaction_id,
                    paymentDate: new Date().toLocaleDateString(),
                    invoiceNumber: payment.invoice_number
                });

                res.json({
                    success: true,
                    message: 'Payment verified successfully',
                    data: {
                        payment,
                        invoice
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Payment not completed'
                });
            }

        } catch (error) {
            console.error('Verify session error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify payment',
                error: error.message
            });
        }
    }
);

// Get payment history (Patient)
router.get('/my-payments', verifyToken, authorizeRoles('patient'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, a.appointment_date, a.appointment_time,
                   d.specialization, u.full_name as doctor_name
            FROM payments p
            LEFT JOIN appointments a ON p.appointment_id = a.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN users u ON d.user_id = u.id
            WHERE p.patient_id = $1
            ORDER BY p.created_at DESC
        `, [req.user.id]);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Fetch payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payments',
            error: error.message
        });
    }
});

// Get all payments (Admin only)
router.get('/all', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { status, start_date, end_date } = req.query;
        
        let query = `
            SELECT p.*, u.full_name as patient_name, u.email as patient_email, u.phone as patient_phone
            FROM payments p
            JOIN users u ON p.patient_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            params.push(status);
            query += ` AND p.payment_status = $${params.length}`;
        }

        if (start_date) {
            params.push(start_date);
            query += ` AND p.created_at >= $${params.length}`;
        }

        if (end_date) {
            params.push(end_date);
            query += ` AND p.created_at <= $${params.length}`;
        }

        query += ' ORDER BY p.created_at DESC';

        const result = await pool.query(query, params);

        // Calculate total revenue
        const totalRevenue = result.rows
            .filter(p => p.payment_status === 'completed')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        res.json({
            success: true,
            count: result.rows.length,
            totalRevenue: totalRevenue.toFixed(2),
            data: result.rows
        });

    } catch (error) {
        console.error('Fetch all payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payments',
            error: error.message
        });
    }
});

// Get payment by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        let query;
        let params;

        if (req.user.role === 'patient') {
            query = `
                SELECT p.*, u.full_name as patient_name
                FROM payments p
                JOIN users u ON p.patient_id = u.id
                WHERE p.id = $1 AND p.patient_id = $2
            `;
            params = [id, req.user.id];
        } else {
            query = `
                SELECT p.*, u.full_name as patient_name, u.email as patient_email
                FROM payments p
                JOIN users u ON p.patient_id = u.id
                WHERE p.id = $1
            `;
            params = [id];
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Fetch payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment',
            error: error.message
        });
    }
});

// Get invoice for payment
router.get('/:id/invoice', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT i.*, p.patient_id
            FROM invoices i
            JOIN payments p ON i.payment_id = p.id
            WHERE p.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        const invoice = result.rows[0];

        // Check authorization
        if (req.user.role === 'patient' && invoice.patient_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: invoice
        });

    } catch (error) {
        console.error('Fetch invoice error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice',
            error: error.message
        });
    }
});

// Payment statistics (Admin only)
router.get('/stats/overview', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        // Total revenue
        const revenueResult = await pool.query(`
            SELECT SUM(amount) as total_revenue, COUNT(*) as total_transactions
            FROM payments
            WHERE payment_status = 'completed'
        `);

        // Today's revenue
        const todayResult = await pool.query(`
            SELECT SUM(amount) as today_revenue, COUNT(*) as today_transactions
            FROM payments
            WHERE payment_status = 'completed' AND DATE(payment_date) = CURRENT_DATE
        `);

        // Monthly revenue
        const monthlyResult = await pool.query(`
            SELECT SUM(amount) as monthly_revenue, COUNT(*) as monthly_transactions
            FROM payments
            WHERE payment_status = 'completed' 
            AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        `);

        // Pending payments
        const pendingResult = await pool.query(`
            SELECT COUNT(*) as pending_count, SUM(amount) as pending_amount
            FROM payments
            WHERE payment_status = 'pending'
        `);

        res.json({
            success: true,
            data: {
                total: {
                    revenue: parseFloat(revenueResult.rows[0].total_revenue || 0).toFixed(2),
                    transactions: parseInt(revenueResult.rows[0].total_transactions || 0)
                },
                today: {
                    revenue: parseFloat(todayResult.rows[0].today_revenue || 0).toFixed(2),
                    transactions: parseInt(todayResult.rows[0].today_transactions || 0)
                },
                monthly: {
                    revenue: parseFloat(monthlyResult.rows[0].monthly_revenue || 0).toFixed(2),
                    transactions: parseInt(monthlyResult.rows[0].monthly_transactions || 0)
                },
                pending: {
                    count: parseInt(pendingResult.rows[0].pending_count || 0),
                    amount: parseFloat(pendingResult.rows[0].pending_amount || 0).toFixed(2)
                }
            }
        });

    } catch (error) {
        console.error('Fetch payment stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment statistics',
            error: error.message
        });
    }
});

module.exports = router;

