const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Appointment, User } = require('../models');

const router = express.Router();

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private (Patient)
router.post('/', [
    authenticateToken,
    requireRole(['patient']),
    body('appointment_date').isISO8601().withMessage('Valid date required'),
    body('symptoms').optional().isString()
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

        const { appointment_date, doctor_id, consultation_type, symptoms } = req.body;

        const appointment = await Appointment.create({
            patient_id: req.user.id,
            doctor_id,
            appointment_date,
            consultation_type: consultation_type || 'online',
            symptoms,
            status: 'scheduled'
        });

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: { appointment }
        });

    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create appointment',
            error: error.message
        });
    }
});

// @route   GET /api/appointments
// @desc    Get all appointments for user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
    try {
        const whereClause = req.user.role === 'doctor' 
            ? { doctor_id: req.user.id }
            : { patient_id: req.user.id };

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'patient',
                    attributes: ['id', 'full_name', 'phone', 'email']
                },
                {
                    model: User,
                    as: 'doctor',
                    attributes: ['id', 'full_name', 'phone', 'email']
                }
            ],
            order: [['appointment_date', 'DESC']]
        });

        res.json({
            success: true,
            data: { appointments }
        });

    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get appointments',
            error: error.message
        });
    }
});

// @route   GET /api/appointments/:id
// @desc    Get specific appointment
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'patient',
                    attributes: ['id', 'full_name', 'phone', 'email']
                },
                {
                    model: User,
                    as: 'doctor',
                    attributes: ['id', 'full_name', 'phone', 'email']
                }
            ]
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization
        if (appointment.patient_id !== req.user.id && appointment.doctor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this appointment'
            });
        }

        res.json({
            success: true,
            data: { appointment }
        });

    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get appointment',
            error: error.message
        });
    }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization
        if (appointment.patient_id !== req.user.id && appointment.doctor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this appointment'
            });
        }

        const { status, diagnosis, prescription, notes } = req.body;

        if (status) appointment.status = status;
        if (diagnosis) appointment.diagnosis = diagnosis;
        if (prescription) appointment.prescription = prescription;
        if (notes) appointment.notes = notes;

        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment updated successfully',
            data: { appointment }
        });

    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update appointment',
            error: error.message
        });
    }
});

module.exports = router;