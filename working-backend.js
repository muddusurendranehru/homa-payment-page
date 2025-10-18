// Simple working backend for payment system
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');

const app = express();
const PORT = 3037;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sequelize = new Sequelize('postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/payment-system-clean?sslmode=require&channel_binding=require');

// Simple User model
const User = sequelize.define('User', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Simple Payment model
const Payment = sequelize.define('Payment', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.UUID,
        allowNull: false
    },
    amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'pending'
    },
    transaction_id: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Simple Payment System - Working!', status: 'OK' });
});

// Signup
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = await User.create({
            email,
            password_hash: hashedPassword
        });
        
        // Generate token
        const token = jwt.sign({ userId: user.id }, 'simple-secret', { expiresIn: '24h' });
        
        res.json({ 
            success: true, 
            message: 'User created successfully',
            token,
            user: { id: user.id, email: user.email }
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = jwt.sign({ userId: user.id }, 'simple-secret', { expiresIn: '24h' });
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create payment
app.post('/api/payment', async (req, res) => {
    try {
        const { amount, description, userId } = req.body;
        
        // Generate transaction ID
        const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        const payment = await Payment.create({
            user_id: userId,
            amount,
            description,
            status: 'pending',
            transaction_id: transactionId
        });
        
        res.json({ 
            success: true, 
            message: 'Payment created',
            payment: { 
                id: payment.id, 
                amount, 
                description, 
                status: 'pending',
                transaction_id: transactionId
            }
        });
        
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get payments
app.get('/api/payments/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const payments = await Payment.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
        
        res.json({ success: true, payments });
        
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update payment status
app.put('/api/payment/:paymentId/status', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;
        
        const payment = await Payment.findByPk(paymentId);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        await payment.update({ status });
        
        res.json({ 
            success: true, 
            message: 'Payment status updated',
            payment: {
                id: payment.id,
                amount: payment.amount,
                description: payment.description,
                status: payment.status,
                transaction_id: payment.transaction_id
            }
        });
        
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        await sequelize.sync();
        console.log('✅ Database synced');
        
        app.listen(PORT, () => {
            console.log(`🚀 Simple Payment System running on port ${PORT}`);
            console.log(`📊 Health: http://localhost:${PORT}`);
        });
        
    } catch (error) {
        console.error('❌ Server error:', error);
    }
}

startServer();
