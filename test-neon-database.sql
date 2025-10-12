-- ========================================
-- NEON DATABASE TEST QUERIES
-- Run these in Neon SQL Editor
-- ========================================

-- 1. CHECK ALL TABLES
-- Shows all tables in your database
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. CHECK USERS TABLE STRUCTURE
-- Shows all columns in users table
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. COUNT ROWS IN EACH TABLE
-- Shows how many records are in each table
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'patient_profiles', COUNT(*) FROM patient_profiles
UNION ALL
SELECT 'doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'payment_sessions', COUNT(*) FROM payment_sessions
UNION ALL
SELECT 'payment_webhooks', COUNT(*) FROM payment_webhooks
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- 4. VIEW ALL USERS (without passwords)
-- Shows all registered users
SELECT 
    id,
    email,
    full_name,
    phone,
    role,
    is_verified,
    created_at,
    updated_at
FROM users
ORDER BY created_at DESC;

-- 5. CHECK ADMIN USER
-- Verify admin user exists
SELECT 
    id,
    email,
    full_name,
    role,
    is_verified
FROM users
WHERE role = 'admin';

-- 6. CHECK CONSTRAINTS ON USERS TABLE
-- Shows primary keys, unique constraints, etc.
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users'
ORDER BY tc.constraint_type, kcu.column_name;

-- 7. CHECK INDEXES ON USERS TABLE
-- Shows all indexes for performance
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'users';

-- ========================================
-- TEST DATA INSERTION (Sign Up Simulation)
-- ========================================

-- 8. INSERT A TEST PATIENT USER
-- This simulates a sign-up (password is hashed 'password123')
INSERT INTO users (
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    is_verified,
    created_at,
    updated_at
) VALUES (
    'patient1@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYVbV0WKS', -- 'password123'
    'John Doe Patient',
    '9876543212',
    'patient',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email, full_name, role;

-- 9. INSERT A TEST DOCTOR USER
INSERT INTO users (
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    is_verified,
    created_at,
    updated_at
) VALUES (
    'doctor1@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYVbV0WKS', -- 'password123'
    'Dr. Sarah Wilson',
    '9876543213',
    'doctor',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email, full_name, role;

-- ========================================
-- LOGIN SIMULATION QUERIES
-- ========================================

-- 10. CHECK IF USER EXISTS (Login Step 1)
-- Replace 'patient1@example.com' with the email you want to check
SELECT 
    id,
    email,
    password_hash,
    full_name,
    phone,
    role,
    is_verified
FROM users
WHERE email = 'patient1@example.com';

-- 11. CHECK IF EMAIL IS UNIQUE (Sign Up Validation)
SELECT COUNT(*) as email_exists
FROM users
WHERE email = 'newuser@example.com';
-- If count = 0, email is available
-- If count > 0, email already exists

-- 12. CHECK IF PHONE IS UNIQUE (Sign Up Validation)
SELECT COUNT(*) as phone_exists
FROM users
WHERE phone = '9876543214';
-- If count = 0, phone is available
-- If count > 0, phone already exists

-- ========================================
-- VERIFICATION & SECURITY CHECKS
-- ========================================

-- 13. CHECK PASSWORD HASH FORMAT
-- Verify passwords are properly hashed (bcrypt format)
SELECT 
    id,
    email,
    LEFT(password_hash, 10) as hash_prefix,
    LENGTH(password_hash) as hash_length,
    CASE 
        WHEN password_hash LIKE '$2b$%' THEN 'Valid BCrypt Hash'
        ELSE 'Invalid Hash Format'
    END as hash_status
FROM users;

-- 14. CHECK USER ROLES DISTRIBUTION
-- Shows how many users of each type
SELECT 
    role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count
FROM users
GROUP BY role
ORDER BY role;

-- ========================================
-- TESTING SPECIFIC SCENARIOS
-- ========================================

-- 15. FIND USER BY ID (Session Validation)
SELECT 
    id,
    email,
    full_name,
    phone,
    role,
    is_verified
FROM users
WHERE id = 1;

-- 16. UPDATE USER VERIFICATION STATUS
-- Mark a user as verified
UPDATE users
SET 
    is_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'patient1@example.com'
RETURNING id, email, is_verified;

-- 17. SEARCH USERS BY NAME
-- Find users by partial name match
SELECT 
    id,
    email,
    full_name,
    role
FROM users
WHERE full_name ILIKE '%doe%'
ORDER BY created_at DESC;

-- 18. GET RECENTLY REGISTERED USERS
-- Last 10 registered users
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- CLEANUP QUERIES (Use with caution!)
-- ========================================

-- 19. DELETE TEST USERS (Uncomment to use)
-- DELETE FROM users WHERE email = 'patient1@example.com';
-- DELETE FROM users WHERE email = 'doctor1@example.com';

-- 20. DELETE ALL NON-ADMIN USERS (Uncomment to use)
-- DELETE FROM users WHERE role != 'admin';

-- ========================================
-- ADVANCED TESTING
-- ========================================

-- 21. CHECK FOREIGN KEY RELATIONSHIPS
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'payments';

-- 22. CHECK DATABASE SIZE
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size;

-- 23. CHECK TABLE SIZES
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ========================================
-- QUICK HEALTH CHECK
-- ========================================

-- 24. COMPLETE DATABASE HEALTH CHECK
SELECT 
    'Total Tables' as metric,
    COUNT(*)::text as value
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'Total Users',
    COUNT(*)::text
FROM users

UNION ALL

SELECT 
    'Admin Users',
    COUNT(*)::text
FROM users WHERE role = 'admin'

UNION ALL

SELECT 
    'Verified Users',
    COUNT(*)::text
FROM users WHERE is_verified = true

UNION ALL

SELECT 
    'Total Payments',
    COUNT(*)::text
FROM payments;

-- ========================================
-- NOTES:
-- ========================================
-- 
-- Test Password Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYVbV0WKS
-- This hash represents the password: "password123"
-- 
-- Admin Credentials (created by setup):
-- Email: admin@homaclinic.com
-- Password: admin123
--
-- To test authentication in your app:
-- 1. Use query #8 to create test patient
-- 2. Use query #9 to create test doctor
-- 3. Login with email and password "password123"
-- ========================================

