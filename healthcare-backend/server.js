const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { pool } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const appointmentsRoutes = require('./routes/appointments');
const paymentsRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: '🏥 Homa Healthcare Payment System API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// API root
app.get('/', (req, res) => {
    res.json({
        message: '🏥 Welcome to Homa Healthcare Payment System API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            appointments: '/api/appointments',
            payments: '/api/payments',
            dashboard: '/api/dashboard'
        },
        documentation: 'https://github.com/your-repo/docs'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Test database connection and start server
async function startServer() {
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully');

        // Start server
        app.listen(PORT, () => {
            console.log('\n═══════════════════════════════════════════════════════════════');
            console.log('🏥 HOMA HEALTHCARE PAYMENT SYSTEM');
            console.log('═══════════════════════════════════════════════════════════════');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
            console.log('\n📍 Available Endpoints:');
            console.log(`   Health Check:     http://localhost:${PORT}/health`);
            console.log(`   Authentication:   http://localhost:${PORT}/api/auth`);
            console.log(`   Appointments:     http://localhost:${PORT}/api/appointments`);
            console.log(`   Payments:         http://localhost:${PORT}/api/payments`);
            console.log(`   Dashboard:        http://localhost:${PORT}/api/dashboard`);
            console.log('\n👥 Test Accounts:');
            console.log('   Admin:    admin@homaclinic.com / admin123');
            console.log('   Doctor:   doctor@homaclinic.com / doctor123');
            console.log('   Patient:  patient@homaclinic.com / patient123');
            console.log('\n═══════════════════════════════════════════════════════════════\n');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;

