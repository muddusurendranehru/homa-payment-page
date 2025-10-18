// Central model exports - Payment Database (2 tables only)
const { sequelize } = require('../config/database');
const User = require('./User');
const Payment = require('./Payment');

// Define associations
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
    sequelize,
    User,
    Payment
};
