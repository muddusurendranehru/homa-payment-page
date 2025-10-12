const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
    appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'appointments',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'INR'
    },
    payment_method: {
        type: DataTypes.STRING(20),
        defaultValue: 'upi'
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending'
    },
    transaction_id: {
        type: DataTypes.STRING(255),
        unique: true
    },
    upi_transaction_id: {
        type: DataTypes.STRING(255)
    },
    gateway_response: {
        type: DataTypes.TEXT
    },
    payment_date: {
        type: DataTypes.DATE
    },
    refund_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    refund_date: {
        type: DataTypes.DATE
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
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['patient_id'] },
        { fields: ['status'] },
        { fields: ['transaction_id'] }
    ]
});

module.exports = Payment;
