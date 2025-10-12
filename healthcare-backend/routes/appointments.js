const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { sendAppointmentConfirmation } = require('../utils/email');

const router = express.Router();

// Get all doctors
router.get('/doctors', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.id, d.specialization, d.qualification, d.experience_years, d.consultation_fee,
                   d.available_days, d.available_time_start, d.available_time_end, d.bio, d.rating,
                   d.total_reviews, d.is_available, u.full_name, u.email, u.phone, u.gender
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE d.is_available = TRUE AND u.is_active = TRUE
            ORDER BY d.rating DESC
        `);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Fetch doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctors',
            error: error.message
        });
    }
});

// Get doctor by ID
router.get('/doctors/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT d.*, u.full_name, u.email, u.phone, u.gender
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Fetch doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctor',
            error: error.message
        });
    }
});

// Book appointment (Patient only)
router.post('/book', verifyToken, authorizeRoles('patient'),
    [
        body('doctor_id').isInt(),
        body('appointment_date').isISO8601(),
        body('appointment_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
        body('reason').optional().trim()
    ],
    async (req, res) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const { doctor_id, appointment_date, appointment_time, reason } = req.body;
            const patient_id = req.user.id;

            // Check if doctor exists and is available
            const doctorCheck = await pool.query(
                'SELECT id FROM doctors WHERE id = $1 AND is_available = TRUE',
                [doctor_id]
            );

            if (doctorCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not available'
                });
            }

            // Check for conflicting appointments
            const conflictCheck = await pool.query(
                `SELECT id FROM appointments 
                 WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 
                 AND status NOT IN ('cancelled', 'completed')`,
                [doctor_id, appointment_date, appointment_time]
            );

            if (conflictCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'This time slot is already booked'
                });
            }

            // Create appointment
            const result = await pool.query(
                `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
                 VALUES ($1, $2, $3, $4, $5, 'scheduled')
                 RETURNING *`,
                [patient_id, doctor_id, appointment_date, appointment_time, reason]
            );

            const appointment = result.rows[0];

            // Get patient and doctor details for email
            const detailsResult = await pool.query(`
                SELECT 
                    u1.full_name as patient_name, u1.email as patient_email,
                    u2.full_name as doctor_name
                FROM appointments a
                JOIN users u1 ON a.patient_id = u1.id
                JOIN doctors d ON a.doctor_id = d.id
                JOIN users u2 ON d.user_id = u2.id
                WHERE a.id = $1
            `, [appointment.id]);

            const details = detailsResult.rows[0];

            // Send confirmation email
            await sendAppointmentConfirmation({
                patientEmail: details.patient_email,
                patientName: details.patient_name,
                doctorName: details.doctor_name,
                appointmentDate: appointment_date,
                appointmentTime: appointment_time,
                appointmentId: appointment.id
            });

            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully',
                data: appointment
            });

        } catch (error) {
            console.error('Book appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to book appointment',
                error: error.message
            });
        }
    }
);

// Get patient's appointments
router.get('/my-appointments', verifyToken, authorizeRoles('patient'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, d.specialization, d.consultation_fee, u.full_name as doctor_name
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = $1
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `, [req.user.id]);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Fetch appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments',
            error: error.message
        });
    }
});

// Get all appointments (Admin/Doctor)
router.get('/all', verifyToken, authorizeRoles('admin', 'doctor'), async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = `
            SELECT a.*, 
                   u1.full_name as patient_name, u1.phone as patient_phone, u1.email as patient_email,
                   d.specialization, u2.full_name as doctor_name
            FROM appointments a
            JOIN users u1 ON a.patient_id = u1.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u2 ON d.user_id = u2.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            params.push(status);
            query += ` AND a.status = $${params.length}`;
        }

        if (date) {
            params.push(date);
            query += ` AND a.appointment_date = $${params.length}`;
        }

        query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Fetch all appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments',
            error: error.message
        });
    }
});

// Update appointment status (Admin/Doctor)
router.patch('/:id/status', verifyToken, authorizeRoles('admin', 'doctor'),
    [
        body('status').isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])
    ],
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;

            const result = await pool.query(
                `UPDATE appointments 
                 SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3
                 RETURNING *`,
                [status, notes, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            res.json({
                success: true,
                message: 'Appointment status updated',
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Update appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update appointment',
                error: error.message
            });
        }
    }
);

// Cancel appointment (Patient can cancel their own)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        let query;
        let params;

        if (req.user.role === 'patient') {
            // Patients can only cancel their own appointments
            query = 'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND patient_id = $3 RETURNING *';
            params = ['cancelled', id, req.user.id];
        } else {
            // Admin/Doctor can cancel any appointment
            query = 'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
            params = ['cancelled', id];
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found or you do not have permission'
            });
        }

        res.json({
            success: true,
            message: 'Appointment cancelled successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel appointment',
            error: error.message
        });
    }
});

module.exports = router;

