const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { Payment } = require('../models');

const router = express.Router();

// @route   POST /api/data
// @desc    Insert data (create payment)
// @access  Private
router.post('/', [
    authenticateToken,
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('description').optional().isString()
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

        const { amount, description, status = 'pending' } = req.body;
        const user_id = req.user.id;

        // Create payment record
        const payment = await Payment.create({
            user_id,
            amount,
            description,
            status,
            transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: payment
        });

    } catch (error) {
        console.error('Insert data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to insert data',
            error: error.message
        });
    }
});

// @route   GET /api/data
// @desc    Fetch data (get all payments for user)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;

        // Get all payments for the user
        const payments = await Payment.findAll({
            where: { user_id },
            order: [['created_at', 'DESC']],
            attributes: ['id', 'amount', 'description', 'status', 'transaction_id', 'created_at', 'updated_at']
        });

        res.json({
            success: true,
            data: payments,
            count: payments.length
        });

    } catch (error) {
        console.error('Fetch data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch data',
            error: error.message
        });
    }
});

// @route   GET /api/data/all-tables
// @desc    Fetch data from all tables (users and payments)
// @access  Private
router.get('/all-tables', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;

        // Get user data
        const user = {
            id: req.user.id,
            email: req.user.email,
            created_at: req.user.created_at
        };

        // Get payments for user
        const payments = await Payment.findAll({
            where: { user_id },
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                users: [user],
                payments: payments
            }
        });

    } catch (error) {
        console.error('Fetch all tables error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch data from all tables',
            error: error.message
        });
    }
});

module.exports = router;

