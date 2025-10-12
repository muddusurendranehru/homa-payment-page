# 🚀 Neon SQL Quick Start Guide

## 📍 How to Access Neon SQL Editor

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project: **neondb**
3. Click **SQL Editor** tab
4. Copy and paste queries below

---

## ✅ ESSENTIAL QUERIES TO RUN

### 1️⃣ Check All Tables (Should show 8-9 tables)

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected Result:**
- appointments
- doctors
- notifications
- patient_profiles
- payment_sessions
- payment_webhooks
- payments ⭐ (HEART OF SYSTEM)
- users

---

### 2️⃣ View Users Table Schema

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Expected Columns:**
- id (integer, PRIMARY KEY)
- email (varchar, UNIQUE, NOT NULL)
- password_hash (varchar, NOT NULL)
- full_name (varchar, NOT NULL)
- phone (varchar, NOT NULL)
- role (varchar, DEFAULT 'patient')
- is_verified (boolean, DEFAULT false)
- created_at (timestamp)
- updated_at (timestamp)

---

### 3️⃣ Check Existing Users

```sql
SELECT 
    id,
    email,
    full_name,
    phone,
    role,
    is_verified,
    created_at
FROM users
ORDER BY created_at DESC;
```

**Expected:** At least 1 admin user (admin@homaclinic.com)

---

### 4️⃣ Count Records in All Tables

```sql
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'doctors', COUNT(*) FROM doctors;
```

---

## 🧪 TEST USER CREATION

### 5️⃣ Create a Test Patient User

```sql
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
    'test@patient.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYVbV0WKS',
    'Test Patient',
    '9876543299',
    'patient',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email, full_name, role;
```

**Password for this user:** `password123`

---

### 6️⃣ Verify Test User Was Created

```sql
SELECT 
    id,
    email,
    full_name,
    role,
    is_verified,
    LEFT(password_hash, 20) as hash_preview
FROM users
WHERE email = 'test@patient.com';
```

---

## 🔐 AUTHENTICATION TESTING

### 7️⃣ Simulate Login - Find User by Email

```sql
SELECT 
    id,
    email,
    password_hash,
    full_name,
    role,
    is_verified
FROM users
WHERE email = 'admin@homaclinic.com';
```

**Admin Password:** `admin123`

---

### 8️⃣ Check Email Availability (for Sign Up)

```sql
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'Email Already Exists ❌'
        ELSE 'Email Available ✅'
    END as status
FROM users
WHERE email = 'newuser@example.com';
```

---

### 9️⃣ Verify Password Hash Format

```sql
SELECT 
    email,
    CASE 
        WHEN password_hash LIKE '$2b$%' THEN 'Valid BCrypt ✅'
        ELSE 'Invalid Format ❌'
    END as hash_status,
    LENGTH(password_hash) as hash_length
FROM users;
```

**Expected:** All should show "Valid BCrypt ✅" with length 60

---

## 📊 DATABASE HEALTH CHECK

### 🔟 Complete Health Check

```sql
SELECT 
    'Total Tables' as metric,
    COUNT(*)::text as value
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 'Total Users', COUNT(*)::text FROM users
UNION ALL
SELECT 'Admin Users', COUNT(*)::text FROM users WHERE role = 'admin'
UNION ALL
SELECT 'Patient Users', COUNT(*)::text FROM users WHERE role = 'patient'
UNION ALL
SELECT 'Verified Users', COUNT(*)::text FROM users WHERE is_verified = true
UNION ALL
SELECT 'Total Payments', COUNT(*)::text FROM payments;
```

---

## 🧹 CLEANUP QUERIES (Use Carefully!)

### ⚠️ Delete Test User

```sql
DELETE FROM users 
WHERE email = 'test@patient.com';
```

### ⚠️ Delete All Non-Admin Users

```sql
-- DANGEROUS! Uncomment only if you want to delete all test users
-- DELETE FROM users WHERE role != 'admin';
```

### ⚠️ Reset Entire Users Table (Keep Only Admin)

```sql
-- VERY DANGEROUS! Only use for complete reset
-- DELETE FROM users WHERE id > 1;
```

---

## 🎯 TESTING CHECKLIST

Run these queries in order to verify your database:

- [ ] Query #1 - Verify 8-9 tables exist
- [ ] Query #2 - Check users table has correct structure
- [ ] Query #3 - Confirm admin user exists
- [ ] Query #5 - Create test patient user
- [ ] Query #6 - Verify test user was created
- [ ] Query #9 - Confirm password hashes are valid
- [ ] Query #10 - Run complete health check

---

## 📝 QUICK REFERENCE

### Test Credentials

| Email | Password | Role | Use Case |
|-------|----------|------|----------|
| admin@homaclinic.com | admin123 | admin | Pre-created admin |
| test@patient.com | password123 | patient | Test patient (create with Query #5) |

### Password Hashes

If you need to create users directly in SQL:

- **Password:** `password123`  
  **Hash:** `$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYVbV0WKS`

- **Password:** `admin123`  
  **Hash:** (Check existing admin user)

---

## 🔗 Next Steps

After testing in Neon SQL Editor:

1. ✅ Verify all tables exist
2. ✅ Create test users
3. ✅ Test login via your Node.js API
4. ✅ Build frontend sign-up/login forms

**Your backend API endpoints:**
- POST `/api/auth/register` - Sign up
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get profile (requires token)

---

## 💡 Pro Tips

1. **Always use ON CONFLICT** when inserting test data to avoid duplicate errors
2. **Never store plain passwords** - always use bcrypt hashes
3. **Use RETURNING** clause to see what was inserted/updated
4. **Test email/phone uniqueness** before attempting to register

---

**✨ Your database is ready for authentication!**

