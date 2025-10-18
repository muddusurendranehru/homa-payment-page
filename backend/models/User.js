const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
    // User has many payments
    User.hasMany(models.Payment, {
        foreignKey: 'user_id',
        as: 'payments'
    });
};

module.exports = User;
