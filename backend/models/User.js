const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [2, 255]
        }
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        validate: {
            is: /^[6-9]\d{9}$/ // Indian mobile number format
        }
    },
    role: {
        type: DataTypes.ENUM('patient', 'doctor', 'admin'),
        defaultValue: 'patient',
        allowNull: false
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['email']
        },
        {
            fields: ['phone']
        },
        {
            fields: ['role']
        }
    ]
});

// Instance methods
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    return values;
};

// Class methods
User.beforeCreate(async (user) => {
    if (user.password_hash && !user.password_hash.startsWith('$2b$')) {
        const saltRounds = 12;
        user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('password_hash') && !user.password_hash.startsWith('$2b$')) {
        const saltRounds = 12;
        user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
    }
});

// Associations
User.associate = (models) => {
    // User has many appointments as patient
    User.hasMany(models.Appointment, {
        foreignKey: 'patient_id',
        as: 'patientAppointments'
    });
    
    // User has many appointments as doctor
    User.hasMany(models.Appointment, {
        foreignKey: 'doctor_id',
        as: 'doctorAppointments'
    });
    
    // User has many payments
    User.hasMany(models.Payment, {
        foreignKey: 'patient_id',
        as: 'payments'
    });
    
    // User has many payment sessions
    User.hasMany(models.PaymentSession, {
        foreignKey: 'patient_id',
        as: 'paymentSessions'
    });
    
    // User has one patient profile
    User.hasOne(models.PatientProfile, {
        foreignKey: 'user_id',
        as: 'patientProfile'
    });
    
    // User has many notifications
    User.hasMany(models.Notification, {
        foreignKey: 'user_id',
        as: 'notifications'
    });
};

module.exports = User;
