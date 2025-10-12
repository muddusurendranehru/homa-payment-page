const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    appointment_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'scheduled'
    },
    consultation_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'online'
    },
    symptoms: {
        type: DataTypes.TEXT
    },
    diagnosis: {
        type: DataTypes.TEXT
    },
    prescription: {
        type: DataTypes.TEXT
    },
    notes: {
        type: DataTypes.TEXT
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'appointments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['patient_id'] },
        { fields: ['doctor_id'] },
        { fields: ['appointment_date'] },
        { fields: ['status'] }
    ]
});

module.exports = Appointment;
