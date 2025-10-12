const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Patient Dashboard
router.get('/patient', verifyToken, authorizeRoles('patient'), async (req, res) => {
    try {
        const patient_id = req.user.id;

        // Get upcoming appointments
        const appointmentsResult = await pool.query(`
            SELECT a.*, d.specialization, d.consultation_fee, u.full_name as doctor_name
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = $1 
            AND a.status IN ('scheduled', 'confirmed')
            AND a.appointment_date >= CURRENT_DATE
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
            LIMIT 5
        `, [patient_id]);

        // Get recent payments
        const paymentsResult = await pool.query(`
            SELECT * FROM payments
            WHERE patient_id = $1
            ORDER BY created_at DESC
            LIMIT 5
        `, [patient_id]);

        // Get payment statistics
        const paymentStatsResult = await pool.query(`
            SELECT 
                SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_paid,
                SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as total_pending,
                COUNT(*) as total_transactions
            FROM payments
            WHERE patient_id = $1
        `, [patient_id]);

        // Get appointment statistics
        const appointmentStatsResult = await pool.query(`
            SELECT 
                COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
            FROM appointments
            WHERE patient_id = $1
        `, [patient_id]);

        res.json({
            success: true,
            data: {
                upcomingAppointments: appointmentsResult.rows,
                recentPayments: paymentsResult.rows,
                paymentStats: paymentStatsResult.rows[0],
                appointmentStats: appointmentStatsResult.rows[0]
            }
        });

    } catch (error) {
        console.error('Patient dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard',
            error: error.message
        });
    }
});

// Doctor Dashboard
router.get('/doctor', verifyToken, authorizeRoles('doctor'), async (req, res) => {
    try {
        const doctor_user_id = req.user.id;

        // Get doctor ID from user ID
        const doctorResult = await pool.query(
            'SELECT id FROM doctors WHERE user_id = $1',
            [doctor_user_id]
        );

        if (doctorResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        const doctor_id = doctorResult.rows[0].id;

        // Get today's appointments
        const todayAppointmentsResult = await pool.query(`
            SELECT a.*, u.full_name as patient_name, u.phone as patient_phone, u.email as patient_email
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = $1 
            AND a.appointment_date = CURRENT_DATE
            AND a.status NOT IN ('cancelled')
            ORDER BY a.appointment_time ASC
        `, [doctor_id]);

        // Get upcoming appointments
        const upcomingAppointmentsResult = await pool.query(`
            SELECT a.*, u.full_name as patient_name, u.phone as patient_phone
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = $1 
            AND a.appointment_date > CURRENT_DATE
            AND a.status IN ('scheduled', 'confirmed')
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
            LIMIT 10
        `, [doctor_id]);

        // Get appointment statistics
        const appointmentStatsResult = await pool.query(`
            SELECT 
                COUNT(CASE WHEN appointment_date = CURRENT_DATE THEN 1 END) as today_total,
                COUNT(CASE WHEN appointment_date = CURRENT_DATE AND status = 'completed' THEN 1 END) as today_completed,
                COUNT(CASE WHEN DATE_TRUNC('month', appointment_date) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as monthly_total,
                COUNT(CASE WHEN DATE_TRUNC('month', appointment_date) = DATE_TRUNC('month', CURRENT_DATE) AND status = 'completed' THEN 1 END) as monthly_completed
            FROM appointments
            WHERE doctor_id = $1
        `, [doctor_id]);

        // Get patient statistics
        const patientStatsResult = await pool.query(`
            SELECT COUNT(DISTINCT patient_id) as total_patients
            FROM appointments
            WHERE doctor_id = $1
        `, [doctor_id]);

        res.json({
            success: true,
            data: {
                todayAppointments: todayAppointmentsResult.rows,
                upcomingAppointments: upcomingAppointmentsResult.rows,
                appointmentStats: appointmentStatsResult.rows[0],
                patientStats: patientStatsResult.rows[0]
            }
        });

    } catch (error) {
        console.error('Doctor dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard',
            error: error.message
        });
    }
});

// Admin Dashboard
router.get('/admin', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        // Total users by role
        const usersStatsResult = await pool.query(`
            SELECT 
                COUNT(CASE WHEN role = 'patient' THEN 1 END) as total_patients,
                COUNT(CASE WHEN role = 'doctor' THEN 1 END) as total_doctors,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
                COUNT(*) as total_users
            FROM users
            WHERE is_active = TRUE
        `);

        // Appointment statistics
        const appointmentStatsResult = await pool.query(`
            SELECT 
                COUNT(CASE WHEN appointment_date = CURRENT_DATE THEN 1 END) as today_appointments,
                COUNT(CASE WHEN appointment_date > CURRENT_DATE THEN 1 END) as upcoming_appointments,
                COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(*) as total_appointments
            FROM appointments
        `);

        // Payment statistics
        const paymentStatsResult = await pool.query(`
            SELECT 
                SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_revenue,
                SUM(CASE WHEN payment_status = 'completed' AND DATE(payment_date) = CURRENT_DATE THEN amount ELSE 0 END) as today_revenue,
                SUM(CASE WHEN payment_status = 'completed' AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END) as monthly_revenue,
                COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
                COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments
            FROM payments
        `);

        // Recent appointments
        const recentAppointmentsResult = await pool.query(`
            SELECT a.*, 
                   u1.full_name as patient_name, 
                   u2.full_name as doctor_name,
                   d.specialization
            FROM appointments a
            JOIN users u1 ON a.patient_id = u1.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u2 ON d.user_id = u2.id
            ORDER BY a.created_at DESC
            LIMIT 10
        `);

        // Recent payments
        const recentPaymentsResult = await pool.query(`
            SELECT p.*, u.full_name as patient_name
            FROM payments p
            JOIN users u ON p.patient_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 10
        `);

        // Monthly revenue trend (last 6 months)
        const monthlyTrendResult = await pool.query(`
            SELECT 
                TO_CHAR(payment_date, 'Mon YYYY') as month,
                SUM(amount) as revenue
            FROM payments
            WHERE payment_status = 'completed'
            AND payment_date >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY TO_CHAR(payment_date, 'Mon YYYY'), DATE_TRUNC('month', payment_date)
            ORDER BY DATE_TRUNC('month', payment_date) ASC
        `);

        res.json({
            success: true,
            data: {
                userStats: usersStatsResult.rows[0],
                appointmentStats: appointmentStatsResult.rows[0],
                paymentStats: paymentStatsResult.rows[0],
                recentAppointments: recentAppointmentsResult.rows,
                recentPayments: recentPaymentsResult.rows,
                monthlyTrend: monthlyTrendResult.rows
            }
        });

    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard',
            error: error.message
        });
    }
});

// Get system overview (Admin only)
router.get('/system/overview', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        // Active users today
        const activeUsersResult = await pool.query(`
            SELECT COUNT(DISTINCT patient_id) as active_patients
            FROM appointments
            WHERE appointment_date = CURRENT_DATE
        `);

        // Average consultation fee
        const avgFeeResult = await pool.query(`
            SELECT AVG(consultation_fee) as avg_fee
            FROM doctors
            WHERE is_available = TRUE
        `);

        // Completion rate
        const completionRateResult = await pool.query(`
            SELECT 
                ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2) as completion_rate
            FROM appointments
            WHERE appointment_date >= CURRENT_DATE - INTERVAL '30 days'
        `);

        res.json({
            success: true,
            data: {
                activePatients: activeUsersResult.rows[0].active_patients,
                avgConsultationFee: parseFloat(avgFeeResult.rows[0].avg_fee || 0).toFixed(2),
                completionRate: parseFloat(completionRateResult.rows[0].completion_rate || 0)
            }
        });

    } catch (error) {
        console.error('System overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load system overview',
            error: error.message
        });
    }
});

module.exports = router;

