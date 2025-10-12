# 🏥 HOMA HEALTHCARE PAYMENT SYSTEM - COMPLETE ARCHITECTURE

## 📋 SYSTEM OVERVIEW
**Complete Healthcare Payment Management System with UPI Integration**

## 🗄️ DATABASE ARCHITECTURE (NEON DATABASE)

### 🎯 CORE TABLES STRUCTURE

#### 1. **USERS TABLE** (Primary User Management)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. **PATIENT_PROFILES TABLE** (Patient Details)
```sql
CREATE TABLE patient_profiles (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    emergency_contact VARCHAR(15),
    medical_history TEXT,
    allergies TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 3. **APPOINTMENTS TABLE** (Appointment Management)
```sql
CREATE TABLE appointments (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER,
    appointment_date DATETIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    consultation_type ENUM('online', 'offline') DEFAULT 'online',
    symptoms TEXT,
    diagnosis TEXT,
    prescription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### 4. **PAYMENTS TABLE** (Payment Management - HEART OF SYSTEM)
```sql
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    patient_id INTEGER NOT NULL,
    appointment_id INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method ENUM('upi', 'card', 'netbanking', 'wallet') DEFAULT 'upi',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    upi_transaction_id VARCHAR(255),
    gateway_response TEXT,
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);
```

#### 5. **PAYMENT_SESSIONS TABLE** (UPI Session Management)
```sql
CREATE TABLE payment_sessions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    upi_link TEXT NOT NULL,
    status ENUM('active', 'completed', 'expired') DEFAULT 'active',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🏗️ BACKEND ARCHITECTURE

### 📁 FOLDER STRUCTURE
```
backend/
├── server.js                 # Main server file
├── config/
│   ├── database.js          # Database connection (Neon)
│   └── auth.js              # JWT configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── validation.js        # Input validation
│   └── rateLimiter.js       # Rate limiting
├── routes/
│   ├── auth.js              # Signup/Login routes
│   ├── users.js             # User management
│   ├── appointments.js      # Appointment routes
│   ├── payments.js          # Payment processing
│   └── dashboard.js         # Dashboard data
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── userController.js    # User management
│   ├── appointmentController.js
│   ├── paymentController.js # Payment processing
│   └── dashboardController.js
├── models/
│   ├── User.js              # User model
│   ├── Appointment.js       # Appointment model
│   ├── Payment.js           # Payment model
│   └── PaymentSession.js    # Payment session model
└── utils/
    ├── generateUPI.js       # UPI link generation
    ├── sendSMS.js           # SMS notifications
    └── sendEmail.js         # Email notifications
```

## 🎨 FRONTEND ARCHITECTURE (React + TypeScript)

### 📁 FOLDER STRUCTURE
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignUp.tsx
│   │   │   ├── Login.tsx
│   │   │   └── AuthWrapper.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PaymentCard.tsx
│   │   │   ├── AppointmentCard.tsx
│   │   │   └── ProfileCard.tsx
│   │   ├── payments/
│   │   │   ├── UPIPayment.tsx
│   │   │   ├── PaymentHistory.tsx
│   │   │   └── PaymentStatus.tsx
│   │   └── common/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Loading.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Appointments.tsx
│   │   ├── Payments.tsx
│   │   └── Profile.tsx
│   ├── services/
│   │   ├── api.ts           # API calls
│   │   ├── auth.ts          # Auth service
│   │   └── payments.ts      # Payment service
│   ├── context/
│   │   └── AuthContext.tsx  # Global auth state
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
```

## 🔄 USER FLOW

### 1. **AUTHENTICATION FLOW**
```
Sign Up → Email Verification → Login → Dashboard
```

### 2. **PAYMENT FLOW** (Main Process)
```
Dashboard → Click "Pay Now" → Generate UPI Link → 
Patient pays via UPI → Webhook confirmation → 
Update payment status → Send confirmation
```

## 🔧 TECHNICAL STACK

### Backend:
- **Node.js + Express.js**
- **Neon Database** (PostgreSQL)
- **Sequelize ORM**
- **JWT Authentication**
- **Razorpay/Stripe Integration**
- **Twilio SMS**
- **Telegram Bot**

### Frontend:
- **React 18 + TypeScript**
- **Tailwind CSS**
- **React Router**
- **Axios**
- **Context API**

## 🚀 DEPLOYMENT
- **Backend**: Railway/Render
- **Frontend**: Vercel/Netlify
- **Database**: Neon (Primary)

## 🔐 SECURITY FEATURES
- JWT Token Authentication
- Password Hashing (bcrypt)
- Rate Limiting
- Input Validation
- CORS Protection
- Helmet Security Headers
