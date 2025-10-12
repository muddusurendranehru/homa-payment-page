// Central model exports
const { sequelize } = require('../config/database');
const User = require('./User');
const Payment = require('./Payment');
const PaymentSession = require('./PaymentSession');
const Appointment = require('./Appointment');

// Define associations
User.hasMany(Payment, { foreignKey: 'patient_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });

User.hasMany(PaymentSession, { foreignKey: 'patient_id', as: 'paymentSessions' });
PaymentSession.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });

User.hasMany(Appointment, { foreignKey: 'patient_id', as: 'patientAppointments' });
User.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

Payment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });
Appointment.hasMany(Payment, { foreignKey: 'appointment_id', as: 'payments' });

module.exports = {
    sequelize,
    User,
    Payment,
    PaymentSession,
    Appointment
};
