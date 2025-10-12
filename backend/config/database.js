const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration - use DATABASE_URL for Neon
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

// Test database connection
const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
        
        // NOTE: Tables are created via setup-database.js
        // No auto-sync to avoid schema conflicts
        console.log('✅ Using existing database schema (run setup-database.js if tables are missing)');
        
        return sequelize;
    } catch (error) {
        console.error('❌ Unable to connect to database:', error);
        throw error;
    }
};

// Close database connection
const closeDatabase = async () => {
    try {
        await sequelize.close();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    connectDatabase,
    closeDatabase
};
