const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize(
    process.env.DATABASE_URL || process.env.DB_NAME || 'homa_healthcare',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    }
);

// Test database connection
const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
        
        // Sync database (create tables if they don't exist)
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized successfully');
        
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
