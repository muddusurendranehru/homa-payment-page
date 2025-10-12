# 📊 NEON DATABASE VISUAL GUIDE

## Complete Database Structure - From Table Names to Content

---

## 🎯 Table 1: USERS (Core Table)

### **Purpose**: Store all user accounts (patients, doctors, admins)

### **Table Structure:**
```sql
CREATE TABLE users (
    id              INTEGER PRIMARY KEY AUTO_INCREMENT,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(15) NOT NULL,
    role            VARCHAR(20) DEFAULT 'patient',
    is_verified     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Sample Content:**
| id | email | password_hash | full_name | phone | role | is_verified | created_at |
|----|-------|---------------|-----------|-------|------|-------------|------------|
| 1 | admin@homaclinic.com | $2b$12$xyz... | Dr. Nehru Admin | 9876543210 | admin | TRUE | 2024-10-12 |
| 2 | patient1@test.com | $2b$12$abc... | Rajesh Kumar | 9876543211 | patient | TRUE | 2024-10-12 |
| 3 | doctor@homaclinic.com | $2b$12$def... | Dr. Sarah Wilson | 9876543212 | doctor | TRUE | 2024-10-12 |

### **Example Queries:**
```sql
-- View all users
SELECT id, email, full_name, phone, role FROM users;

-- Find specific patient
SELECT * FROM users WHERE email = 'patient1@test.com';

-- Count patients
SELECT COUNT(*) FROM users WHERE role = 'patient';
```

---

## 💳 Table 2: PAYMENTS (HEART OF SYSTEM!)

### **Purpose**: Track all payment transactions

### **Table Structure:**
```sql
CREATE TABLE payments (
    id                  INTEGER PRIMARY KEY AUTO_INCREMENT,
    patient_id          INTEGER NOT NULL,
    appointment_id      INTEGER,
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'INR',
    payment_method      VARCHAR(20) DEFAULT 'upi',
    status              VARCHAR(20) DEFAULT 'pending',
    transaction_id      VARCHAR(255),
    upi_transaction_id  VARCHAR(255),
    gateway_response    TEXT,
    payment_date        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Sample Content:**
| id | patient_id | amount | currency | payment_method | status | transaction_id | payment_date |
|----|------------|--------|----------|----------------|--------|----------------|--------------|
| 1 | 2 | 500.00 | INR | upi | completed | TXN001-2024 | 2024-10-12 10:30 |
| 2 | 2 | 1000.00 | INR | upi | completed | TXN002-2024 | 2024-10-11 15:20 |
| 3 | 2 | 750.00 | INR | upi | pending | TXN003-2024 | NULL |

### **Example Queries:**
```sql
-- View all payments for a patient
SELECT * FROM payments WHERE patient_id = 2 ORDER BY created_at DESC;

-- Total amount paid by patient
SELECT SUM(amount) as total_paid 
FROM payments 
WHERE patient_id = 2 AND status = 'completed';

-- Today's completed payments
SELECT COUNT(*) as today_payments, SUM(amount) as today_revenue
FROM payments 
WHERE DATE(payment_date) = CURRENT_DATE AND status = 'completed';

-- Pending payments
SELECT p.id, u.full_name, p.amount, p.created_at
FROM payments p
JOIN users u ON p.patient_id = u.id
WHERE p.status = 'pending';
```

---

## 🔗 Table 3: PAYMENT_SESSIONS (UPI Link Management)

### **Purpose**: Track active UPI payment links

### **Table Structure:**
```sql
CREATE TABLE payment_sessions (
    id          INTEGER PRIMARY KEY AUTO_INCREMENT,
    session_id  VARCHAR(255) UNIQUE NOT NULL,
    patient_id  INTEGER NOT NULL,
    amount      DECIMAL(10,2) NOT NULL,
    upi_link    TEXT NOT NULL,
    status      VARCHAR(20) DEFAULT 'active',
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Sample Content:**
| id | session_id | patient_id | amount | upi_link | status | expires_at |
|----|------------|------------|--------|----------|--------|------------|
| 1 | abc-123-def | 2 | 500.00 | upi://pay?pa=homa@paytm&am=500... | completed | 2024-10-12 10:45 |
| 2 | xyz-456-ghi | 2 | 750.00 | upi://pay?pa=homa@paytm&am=750... | active | 2024-10-12 15:30 |

### **Example Queries:**
```sql
-- Active payment sessions
SELECT * FROM payment_sessions 
WHERE status = 'active' AND expires_at > NOW();

-- Session details for patient
SELECT ps.*, u.full_name, u.phone
FROM payment_sessions ps
JOIN users u ON ps.patient_id = u.id
WHERE ps.session_id = 'abc-123-def';
```

---

## 📅 Table 4: APPOINTMENTS

### **Purpose**: Manage doctor appointments

### **Table Structure:**
```sql
CREATE TABLE appointments (
    id                  INTEGER PRIMARY KEY AUTO_INCREMENT,
    patient_id          INTEGER NOT NULL,
    doctor_id           INTEGER,
    appointment_date    TIMESTAMP NOT NULL,
    status              VARCHAR(20) DEFAULT 'scheduled',
    consultation_type   VARCHAR(20) DEFAULT 'online',
    symptoms            TEXT,
    diagnosis           TEXT,
    prescription        TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Sample Content:**
| id | patient_id | doctor_id | appointment_date | status | consultation_type | symptoms |
|----|------------|-----------|------------------|--------|-------------------|----------|
| 1 | 2 | 3 | 2024-10-15 10:00 | scheduled | online | Fever, headache |
| 2 | 2 | 3 | 2024-10-10 14:00 | completed | online | Cold, cough |

### **Example Queries:**
```sql
-- Upcoming appointments for patient
SELECT a.*, u.full_name as doctor_name
FROM appointments a
JOIN users u ON a.doctor_id = u.id
WHERE a.patient_id = 2 
  AND a.status = 'scheduled' 
  AND a.appointment_date > NOW()
ORDER BY a.appointment_date;

-- Today's appointments
SELECT a.*, 
       p.full_name as patient_name,
       d.full_name as doctor_name
FROM appointments a
JOIN users p ON a.patient_id = p.id
JOIN users d ON a.doctor_id = d.id
WHERE DATE(a.appointment_date) = CURRENT_DATE;
```

---

## 👤 Table 5: PATIENT_PROFILES

### **Purpose**: Store detailed patient information

### **Table Structure:**
```sql
CREATE TABLE patient_profiles (
    id                  INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id             INTEGER NOT NULL,
    date_of_birth       DATE,
    gender              VARCHAR(10),
    address             TEXT,
    emergency_contact   VARCHAR(15),
    medical_history     TEXT,
    allergies           TEXT,
    blood_group         VARCHAR(5),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Sample Content:**
| id | user_id | date_of_birth | gender | address | emergency_contact | blood_group | allergies |
|----|---------|---------------|--------|---------|-------------------|-------------|-----------|
| 1 | 2 | 1990-05-15 | male | 123 MG Road, Bangalore | 9876543299 | O+ | Penicillin |

### **Example Queries:**
```sql
-- Get complete patient info
SELECT u.*, pp.*
FROM users u
LEFT JOIN patient_profiles pp ON u.id = pp.user_id
WHERE u.id = 2;

-- Patients with specific allergies
SELECT u.full_name, u.phone, pp.allergies
FROM users u
JOIN patient_profiles pp ON u.id = pp.user_id
WHERE pp.allergies IS NOT NULL;
```

---

## 👨‍⚕️ Table 6: DOCTORS

### **Purpose**: Store doctor profiles and consultation fees

### **Table Structure:**
```sql
CREATE TABLE doctors (
    id                  INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id             INTEGER NOT NULL,
    specialization      VARCHAR(255),
    experience_years    INTEGER,
    consultation_fee    DECIMAL(10,2),
    is_available        BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Sample Content:**
| id | user_id | specialization | experience_years | consultation_fee | is_available |
|----|---------|----------------|------------------|------------------|--------------|
| 1 | 3 | General Medicine | 10 | 500.00 | TRUE |

### **Example Queries:**
```sql
-- Available doctors
SELECT u.full_name, d.specialization, d.consultation_fee
FROM doctors d
JOIN users u ON d.user_id = u.id
WHERE d.is_available = TRUE;
```

---

## 🔔 Table 7: NOTIFICATIONS

### **Purpose**: System notifications for users

### **Table Structure:**
```sql
CREATE TABLE notifications (
    id          INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id     INTEGER NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    type        VARCHAR(20) DEFAULT 'general',
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Sample Content:**
| id | user_id | title | message | type | is_read | created_at |
|----|---------|-------|---------|------|---------|------------|
| 1 | 2 | Payment Confirmed | Your payment of ₹500 is confirmed | payment | FALSE | 2024-10-12 |
| 2 | 2 | Appointment Reminder | Your appointment is tomorrow | appointment | TRUE | 2024-10-11 |

### **Example Queries:**
```sql
-- Unread notifications
SELECT * FROM notifications 
WHERE user_id = 2 AND is_read = FALSE
ORDER BY created_at DESC;

-- Mark as read
UPDATE notifications 
SET is_read = TRUE 
WHERE id = 1;
```

---

## 🔄 Table 8: PAYMENT_WEBHOOKS

### **Purpose**: Track payment gateway webhook responses

### **Table Structure:**
```sql
CREATE TABLE payment_webhooks (
    id              INTEGER PRIMARY KEY AUTO_INCREMENT,
    payment_id      INTEGER NOT NULL,
    webhook_data    TEXT,
    signature       VARCHAR(255),
    processed       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔗 RELATIONSHIPS BETWEEN TABLES

### **Visual Relationship Map:**
```
┌─────────────┐
│    USERS    │ (id)
└──────┬──────┘
       │
       ├──────────────┬───────────────┬──────────────┬──────────────┐
       │              │               │              │              │
       ▼              ▼               ▼              ▼              ▼
┌────────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐
│ PAYMENTS   │  │APPOINTMENTS│  │PAY_SESSIONS│  │ PATIENT_ │  │ NOTIF... │
│(patient_id)│  │(patient_id)│  │(patient_id)│  │ PROFILES │  │(user_id) │
└────────────┘  └──────────┘  └────────────┘  │(user_id) │  └──────────┘
                                               └──────────┘
```

---

## 📈 USEFUL DASHBOARD QUERIES

### **1. Patient Dashboard Statistics:**
```sql
SELECT 
    (SELECT COUNT(*) FROM payments WHERE patient_id = 2 AND status = 'completed') as total_payments,
    (SELECT SUM(amount) FROM payments WHERE patient_id = 2 AND status = 'completed') as total_paid,
    (SELECT COUNT(*) FROM payments WHERE patient_id = 2 AND status = 'pending') as pending_payments,
    (SELECT COUNT(*) FROM appointments WHERE patient_id = 2) as total_appointments,
    (SELECT COUNT(*) FROM appointments WHERE patient_id = 2 AND status = 'scheduled' AND appointment_date > NOW()) as upcoming_appointments;
```

### **2. Recent Payment History:**
```sql
SELECT 
    p.id,
    p.amount,
    p.status,
    p.payment_method,
    p.payment_date,
    p.transaction_id,
    a.appointment_date,
    a.consultation_type
FROM payments p
LEFT JOIN appointments a ON p.appointment_id = a.id
WHERE p.patient_id = 2
ORDER BY p.created_at DESC
LIMIT 10;
```

### **3. Today's Revenue:**
```sql
SELECT 
    COUNT(*) as total_transactions,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_transaction
FROM payments
WHERE DATE(payment_date) = CURRENT_DATE 
  AND status = 'completed';
```

---

## 🎯 SAMPLE DATA INSERT

```sql
-- Insert test patient
INSERT INTO users (email, password_hash, full_name, phone, role) 
VALUES ('test@patient.com', '$2b$12$hash...', 'Test Patient', '9999999999', 'patient');

-- Insert patient profile
INSERT INTO patient_profiles (user_id, date_of_birth, gender, blood_group) 
VALUES (2, '1990-01-01', 'male', 'O+');

-- Insert payment
INSERT INTO payments (patient_id, amount, currency, payment_method, status, transaction_id, payment_date)
VALUES (2, 500.00, 'INR', 'upi', 'completed', 'TXN-' || NOW(), NOW());

-- Insert appointment
INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, symptoms)
VALUES (2, 3, NOW() + INTERVAL '1 day', 'scheduled', 'General checkup');
```

---

## 📊 VIEW ALL TABLE CONTENTS

```sql
-- Users
SELECT * FROM users ORDER BY id;

-- Payments (with patient names)
SELECT p.*, u.full_name as patient_name
FROM payments p
JOIN users u ON p.patient_id = u.id
ORDER BY p.created_at DESC;

-- Payment Sessions (active)
SELECT * FROM payment_sessions 
WHERE status = 'active' AND expires_at > NOW();

-- Appointments (with names)
SELECT 
    a.id,
    p.full_name as patient_name,
    d.full_name as doctor_name,
    a.appointment_date,
    a.status,
    a.symptoms
FROM appointments a
JOIN users p ON a.patient_id = p.id
LEFT JOIN users d ON a.doctor_id = d.id
ORDER BY a.appointment_date DESC;

-- Patient profiles
SELECT u.full_name, u.email, pp.*
FROM patient_profiles pp
JOIN users u ON pp.user_id = u.id;

-- Notifications (unread)
SELECT n.*, u.full_name
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.is_read = FALSE
ORDER BY n.created_at DESC;
```

---

## 🔍 DATABASE HEALTH CHECK

```sql
-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'payment_sessions', COUNT(*) FROM payment_sessions
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'patient_profiles', COUNT(*) FROM patient_profiles
UNION ALL
SELECT 'doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'payment_webhooks', COUNT(*) FROM payment_webhooks;
```

---

## 🎉 YOUR DATABASE IS THE HEART OF THE SYSTEM!

All payment data flows through these tables with INTEGER primary keys for maximum performance! 🚀
