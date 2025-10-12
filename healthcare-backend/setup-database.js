const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    try {
        console.log('🔌 Connecting to Neon PostgreSQL database...');
        await client.connect();
        console.log('✅ Connected successfully!\n');

        console.log('📊 Creating database tables...\n');

        // 1. Create users table (Patients, Doctors, Admins)
        console.log('1️⃣  Creating users table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(15) NOT NULL,
                role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
                date_of_birth DATE,
                gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
                blood_group VARCHAR(5),
                address TEXT,
                emergency_contact VARCHAR(15),
                medical_history TEXT,
                is_verified BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Users table created\n');

        // 2. Create doctors table (Doctor profiles with specialization)
        console.log('2️⃣  Creating doctors table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS doctors (
                id SERIAL PRIMARY KEY,
                user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                specialization VARCHAR(255) NOT NULL,
                qualification VARCHAR(255) NOT NULL,
                experience_years INTEGER NOT NULL,
                consultation_fee DECIMAL(10,2) NOT NULL,
                available_days VARCHAR(255) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
                available_time_start TIME DEFAULT '09:00:00',
                available_time_end TIME DEFAULT '17:00:00',
                bio TEXT,
                rating DECIMAL(3,2) DEFAULT 0.00,
                total_reviews INTEGER DEFAULT 0,
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Doctors table created\n');

        // 3. Create appointments table
        console.log('3️⃣  Creating appointments table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
                reason TEXT,
                notes TEXT,
                prescription TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Appointments table created\n');

        // 4. Create payments table (Stripe integration)
        console.log('4️⃣  Creating payments table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'INR',
                payment_method VARCHAR(50) DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'upi', 'card', 'netbanking', 'cash')),
                payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
                stripe_payment_intent_id VARCHAR(255),
                stripe_session_id VARCHAR(255),
                transaction_id VARCHAR(255) UNIQUE,
                payment_date TIMESTAMP,
                description TEXT,
                invoice_number VARCHAR(50) UNIQUE,
                receipt_url TEXT,
                refund_amount DECIMAL(10,2) DEFAULT 0.00,
                refund_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Payments table created\n');

        // 5. Create invoices table
        console.log('5️⃣  Creating invoices table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS invoices (
                id SERIAL PRIMARY KEY,
                payment_id INTEGER UNIQUE NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
                invoice_number VARCHAR(50) UNIQUE NOT NULL,
                patient_name VARCHAR(255) NOT NULL,
                patient_email VARCHAR(255) NOT NULL,
                patient_phone VARCHAR(15) NOT NULL,
                doctor_name VARCHAR(255),
                service_description TEXT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                tax_amount DECIMAL(10,2) DEFAULT 0.00,
                total_amount DECIMAL(10,2) NOT NULL,
                issue_date DATE NOT NULL,
                due_date DATE,
                payment_status VARCHAR(20) DEFAULT 'unpaid',
                pdf_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Invoices table created\n');

        console.log('👥 Creating sample users...\n');

        const bcrypt = require('bcryptjs');

        // Create Admin user
        console.log('6️⃣  Creating admin user...');
        const adminPassword = await bcrypt.hash('admin123', 12);
        await client.query(`
            INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, is_active)
            VALUES ('admin@homaclinic.com', $1, 'Dr. Admin Nehru', '9876543210', 'admin', TRUE, TRUE)
            ON CONFLICT (email) DO NOTHING;
        `, [adminPassword]);
        console.log('   ✅ Admin user created (admin@homaclinic.com / admin123)\n');

        // Create Doctor user
        console.log('7️⃣  Creating doctor user...');
        const doctorPassword = await bcrypt.hash('doctor123', 12);
        const doctorResult = await client.query(`
            INSERT INTO users (email, password_hash, full_name, phone, role, gender, is_verified, is_active)
            VALUES ('doctor@homaclinic.com', $1, 'Dr. Sarah Johnson', '9876543211', 'doctor', 'female', TRUE, TRUE)
            ON CONFLICT (email) DO NOTHING
            RETURNING id;
        `, [doctorPassword]);
        
        if (doctorResult.rows.length > 0) {
            const doctorUserId = doctorResult.rows[0].id;
            await client.query(`
                INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, bio)
                VALUES ($1, 'General Medicine', 'MBBS, MD', 10, 500.00, 'Experienced general physician with 10 years of practice')
                ON CONFLICT (user_id) DO NOTHING;
            `, [doctorUserId]);
        }
        console.log('   ✅ Doctor user created (doctor@homaclinic.com / doctor123)\n');

        // Create Patient user
        console.log('8️⃣  Creating patient user...');
        const patientPassword = await bcrypt.hash('patient123', 12);
        await client.query(`
            INSERT INTO users (email, password_hash, full_name, phone, role, gender, date_of_birth, blood_group, is_verified, is_active)
            VALUES ('patient@homaclinic.com', $1, 'John Doe', '9876543212', 'patient', 'male', '1990-01-15', 'O+', TRUE, TRUE)
            ON CONFLICT (email) DO NOTHING;
        `, [patientPassword]);
        console.log('   ✅ Patient user created (patient@homaclinic.com / patient123)\n');

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎉 DATABASE SETUP COMPLETE!\n');
        console.log('✅ 5 tables created successfully:');
        console.log('   • users (Patients, Doctors, Admins)');
        console.log('   • doctors (Doctor profiles)');
        console.log('   • appointments (Booking system)');
        console.log('   • payments (Stripe integration)');
        console.log('   • invoices (Invoice generation)\n');
        console.log('👥 3 sample users created:');
        console.log('   • Admin: admin@homaclinic.com / admin123');
        console.log('   • Doctor: doctor@homaclinic.com / doctor123');
        console.log('   • Patient: patient@homaclinic.com / patient123\n');
        console.log('🚀 Your healthcare payment system is ready!');
        console.log('═══════════════════════════════════════════════════════════════');

    } catch (error) {
        console.error('\n❌ Error setting up database:', error);
        throw error;
    } finally {
        await client.end();
    }
}

setupDatabase();

