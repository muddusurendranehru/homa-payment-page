const { Client } = require('pg');
require('dotenv').config();

// Your Neon database connection string from environment
const connectionString = process.env.DATABASE_URL;

const client = new Client({
    connectionString: connectionString,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    try {
        console.log('🔌 Connecting to Neon database...');
        await client.connect();
        console.log('✅ Connected successfully!');

        console.log('\n📊 Creating tables...');

        // Drop existing tables if they exist (for fresh setup)
        console.log('Dropping existing tables if any...');
        await client.query(`
            DROP TABLE IF EXISTS payment_webhooks CASCADE;
            DROP TABLE IF EXISTS notifications CASCADE;
            DROP TABLE IF EXISTS payment_sessions CASCADE;
            DROP TABLE IF EXISTS payments CASCADE;
            DROP TABLE IF EXISTS appointments CASCADE;
            DROP TABLE IF EXISTS doctors CASCADE;
            DROP TABLE IF EXISTS patient_profiles CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);
        console.log('✅ Old tables dropped');

        // Create users table
        console.log('\n1️⃣ Creating users table...');
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(15) NOT NULL,
                role VARCHAR(20) DEFAULT 'patient',
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_users_email ON users(email);
            CREATE INDEX idx_users_phone ON users(phone);
            CREATE INDEX idx_users_role ON users(role);
        `);
        console.log('✅ Users table created');

        // Create patient_profiles table
        console.log('2️⃣ Creating patient_profiles table...');
        await client.query(`
            CREATE TABLE patient_profiles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                date_of_birth DATE,
                gender VARCHAR(10),
                address TEXT,
                emergency_contact VARCHAR(15),
                medical_history TEXT,
                allergies TEXT,
                blood_group VARCHAR(5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_patient_user_id ON patient_profiles(user_id);
        `);
        console.log('✅ Patient profiles table created');

        // Create doctors table
        console.log('3️⃣ Creating doctors table...');
        await client.query(`
            CREATE TABLE doctors (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                specialization VARCHAR(255),
                experience_years INTEGER,
                consultation_fee DECIMAL(10,2),
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_doctor_user_id ON doctors(user_id);
        `);
        console.log('✅ Doctors table created');

        // Create appointments table
        console.log('4️⃣ Creating appointments table...');
        await client.query(`
            CREATE TABLE appointments (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                appointment_date TIMESTAMP NOT NULL,
                status VARCHAR(20) DEFAULT 'scheduled',
                consultation_type VARCHAR(20) DEFAULT 'online',
                symptoms TEXT,
                diagnosis TEXT,
                prescription TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_appt_patient ON appointments(patient_id);
            CREATE INDEX idx_appt_doctor ON appointments(doctor_id);
            CREATE INDEX idx_appt_date ON appointments(appointment_date);
        `);
        console.log('✅ Appointments table created');

        // Create payments table (HEART OF THE SYSTEM!)
        console.log('5️⃣ Creating payments table (HEART OF SYSTEM!)...');
        await client.query(`
            CREATE TABLE payments (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'INR',
                payment_method VARCHAR(20) DEFAULT 'upi',
                status VARCHAR(20) DEFAULT 'pending',
                transaction_id VARCHAR(255),
                upi_transaction_id VARCHAR(255),
                gateway_response TEXT,
                payment_date TIMESTAMP,
                refund_amount DECIMAL(10,2) DEFAULT 0.00,
                refund_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_payment_patient ON payments(patient_id);
            CREATE INDEX idx_payment_status ON payments(status);
            CREATE INDEX idx_payment_txn ON payments(transaction_id);
        `);
        console.log('✅ Payments table created');

        // Create payment_sessions table
        console.log('6️⃣ Creating payment_sessions table...');
        await client.query(`
            CREATE TABLE payment_sessions (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) UNIQUE NOT NULL,
                patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                amount DECIMAL(10,2) NOT NULL,
                upi_link TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'active',
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_session_id ON payment_sessions(session_id);
            CREATE INDEX idx_session_patient ON payment_sessions(patient_id);
        `);
        console.log('✅ Payment sessions table created');

        // Create notifications table
        console.log('7️⃣ Creating notifications table...');
        await client.query(`
            CREATE TABLE notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(20) DEFAULT 'general',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_notif_user ON notifications(user_id);
        `);
        console.log('✅ Notifications table created');

        // Create payment_webhooks table
        console.log('8️⃣ Creating payment_webhooks table...');
        await client.query(`
            CREATE TABLE payment_webhooks (
                id SERIAL PRIMARY KEY,
                payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
                webhook_data TEXT,
                signature VARCHAR(255),
                processed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_webhook_payment ON payment_webhooks(payment_id);
        `);
        console.log('✅ Payment webhooks table created');

        // Insert sample admin user
        console.log('\n👤 Creating sample admin user...');
        const bcrypt = require('bcryptjs');
        const adminPassword = await bcrypt.hash('admin123', 12);
        
        await client.query(`
            INSERT INTO users (email, password_hash, full_name, phone, role, is_verified)
            VALUES ('admin@homaclinic.com', $1, 'Dr. Nehru Admin', '9876543210', 'admin', TRUE)
            ON CONFLICT (email) DO NOTHING;
        `, [adminPassword]);
        console.log('✅ Admin user created (email: admin@homaclinic.com, password: admin123)');

        console.log('\n🎉 DATABASE SETUP COMPLETE!');
        console.log('\n📊 Summary:');
        console.log('  ✅ 8 tables created');
        console.log('  ✅ All indexes created');
        console.log('  ✅ Sample admin user added');
        console.log('\n🚀 Your healthcare payment system is ready!');
        console.log('\n📝 Next steps:');
        console.log('  1. Run: npm install');
        console.log('  2. Run: npm start');
        console.log('  3. Test at: http://localhost:3000/health');

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        console.error('Error details:', error.message);
    } finally {
        await client.end();
        console.log('\n🔌 Database connection closed');
    }
}

setupDatabase();
