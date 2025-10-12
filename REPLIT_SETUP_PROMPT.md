# 🚀 REPLIT DEPLOYMENT PROMPT - Complete Healthcare Payment System

## 🔐 COPY THESE CREDENTIALS TO REPLIT SECRETS

### 1. NEON DATABASE CREDENTIALS
```
DATABASE_URL (Required):
postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

DB_HOST: ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech
DB_PORT: 5432
DB_NAME: neondb
DB_USER: neondb_owner
DB_PASSWORD: npg_KgY1jcShHne2
```

### 2. JWT SECRET (Required for Authentication)
```
JWT_SECRET: homa-healthcare-super-secret-key-2024-change-in-production
JWT_EXPIRES_IN: 24h
```

### 3. SERVER CONFIG
```
PORT: 3000
NODE_ENV: production
```

### 4. UPI PAYMENT (Optional)
```
UPI_ID: homahealthcare@paytm
MERCHANT_NAME: Homa Healthcare
```

### HOW TO ADD IN REPLIT:
1. Click 🔒 "Secrets" tab (padlock icon)
2. Add each variable:
   - Key: DATABASE_URL
   - Value: postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   
   - Key: JWT_SECRET
   - Value: homa-healthcare-super-secret-key-2024-change-in-production
   
   - Key: PORT
   - Value: 3000
3. Click "Add Secret" for each

---

## Copy and paste this to Replit AI Agent:

---

```
Build a complete Healthcare Payment System with the following specifications:

PROJECT NAME: Homa Healthcare Payment System

TECH STACK:
- Backend: Node.js + Express.js
- Database: Neon PostgreSQL (Serverless)
- Frontend: React + TypeScript
- Authentication: JWT tokens
- Payment: UPI Integration

PAIN POINTS TO SOLVE:
1. Manual payment tracking - Automate with database
2. No digital payment links - Generate UPI links automatically  
3. No patient records - Store all data in Neon database
4. Manual confirmation - Automated SMS/email notifications

DATABASE CONNECTION (NEON):
- Connection String: postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
- Use Sequelize ORM
- INTEGER primary keys (not UUID)
- Auto-create tables on startup

REQUIRED FEATURES:

1. AUTHENTICATION SYSTEM:
   - Sign Up with:
     * Email (validation required)
     * Password (min 6 characters)
     * Confirm Password (must match!)
     * Full Name (min 2 characters)
     * Phone Number (10 digits, Indian format)
   - Login with:
     * Email
     * Password
   - JWT token generation
   - Auto-redirect to dashboard after login

2. DATABASE SCHEMA (8 Tables):
   
   A. USERS TABLE (Core):
      - id: INTEGER PRIMARY KEY AUTO_INCREMENT
      - email: VARCHAR(255) UNIQUE NOT NULL
      - password_hash: VARCHAR(255) NOT NULL (bcrypt hashed)
      - full_name: VARCHAR(255) NOT NULL
      - phone: VARCHAR(15) NOT NULL
      - role: VARCHAR(20) DEFAULT 'patient'
      - is_verified: BOOLEAN DEFAULT FALSE
      - created_at: TIMESTAMP
      - updated_at: TIMESTAMP
   
   B. PAYMENTS TABLE (Heart of System):
      - id: INTEGER PRIMARY KEY AUTO_INCREMENT
      - patient_id: INTEGER (FK to users.id)
      - amount: DECIMAL(10,2) NOT NULL
      - currency: VARCHAR(3) DEFAULT 'INR'
      - payment_method: VARCHAR(20) DEFAULT 'upi'
      - status: VARCHAR(20) DEFAULT 'pending'
      - transaction_id: VARCHAR(255) UNIQUE
      - upi_transaction_id: VARCHAR(255)
      - payment_date: TIMESTAMP
      - created_at: TIMESTAMP
   
   C. PAYMENT_SESSIONS TABLE:
      - id: INTEGER PRIMARY KEY AUTO_INCREMENT
      - session_id: VARCHAR(255) UNIQUE
      - patient_id: INTEGER (FK to users.id)
      - amount: DECIMAL(10,2)
      - upi_link: TEXT
      - status: VARCHAR(20) DEFAULT 'active'
      - expires_at: TIMESTAMP
      - created_at: TIMESTAMP
   
   D. APPOINTMENTS TABLE:
      - id: INTEGER PRIMARY KEY AUTO_INCREMENT
      - patient_id: INTEGER (FK to users.id)
      - doctor_id: INTEGER (FK to users.id)
      - appointment_date: TIMESTAMP
      - status: VARCHAR(20) DEFAULT 'scheduled'
      - consultation_type: VARCHAR(20) DEFAULT 'online'
      - symptoms: TEXT
      - diagnosis: TEXT
      - prescription: TEXT
      - created_at: TIMESTAMP
   
   E. PATIENT_PROFILES TABLE:
      - id: INTEGER PRIMARY KEY AUTO_INCREMENT
      - user_id: INTEGER (FK to users.id)
      - date_of_birth: DATE
      - gender: VARCHAR(10)
      - address: TEXT
      - blood_group: VARCHAR(5)
      - allergies: TEXT
      - medical_history: TEXT
   
   F. DOCTORS TABLE:
      - id: INTEGER PRIMARY KEY AUTO_INCREMENT
      - user_id: INTEGER (FK to users.id)
      - specialization: VARCHAR(255)
      - experience_years: INTEGER
      - consultation_fee: DECIMAL(10,2)
      - is_available: BOOLEAN DEFAULT TRUE
   
   G. NOTIFICATIONS TABLE:
      - id: INTEGER PRIMARY KEY AUTO_INCREMENT
      - user_id: INTEGER (FK to users.id)
      - title: VARCHAR(255)
      - message: TEXT
      - type: VARCHAR(20)
      - is_read: BOOLEAN DEFAULT FALSE
      - created_at: TIMESTAMP
   
   H. PAYMENT_WEBHOOKS TABLE:
      - id: INTEGER PRIMARY KEY AUTO_INCREMENT
      - payment_id: INTEGER (FK to payments.id)
      - webhook_data: TEXT
      - processed: BOOLEAN DEFAULT FALSE
      - created_at: TIMESTAMP

3. API ENDPOINTS:

   AUTH:
   - POST /api/auth/register - Register new user
   - POST /api/auth/login - Login user
   - GET /api/auth/me - Get current user
   
   DASHBOARD:
   - GET /api/dashboard/stats - Get patient statistics
     * Total payments count
     * Total amount paid
     * Pending payments
     * Upcoming appointments
     * Recent payment history (last 5)
   
   PAYMENTS:
   - POST /api/payments/generate-upi - Generate UPI payment link
   - POST /api/payments/confirm-payment - Confirm payment completion
   - GET /api/payments/history - Get payment history
   - GET /api/payments/:id - Get specific payment
   
   USERS:
   - GET /api/users/profile - Get user profile
   - PUT /api/users/profile - Update profile
   
   APPOINTMENTS:
   - POST /api/appointments - Create appointment
   - GET /api/appointments - Get user appointments
   - GET /api/appointments/:id - Get specific appointment
   - PUT /api/appointments/:id - Update appointment

4. CRITICAL USER FLOW:

   STEP 1 - SIGN UP:
   Frontend → Backend → Database
   User fills form → POST /api/auth/register → INSERT INTO users
   Returns JWT token → Save to localStorage → Redirect to dashboard
   
   STEP 2 - LOGIN:
   Frontend → Backend → Database
   User enters credentials → POST /api/auth/login → SELECT FROM users
   Compare password hash → Return JWT → Redirect to dashboard
   
   STEP 3 - DASHBOARD (FETCH DATA):
   Frontend loads → GET /api/dashboard/stats → Multiple SELECT queries:
   - SELECT COUNT(*) FROM payments WHERE patient_id = ? AND status = 'completed'
   - SELECT SUM(amount) FROM payments WHERE patient_id = ? AND status = 'completed'
   - SELECT * FROM payments WHERE patient_id = ? ORDER BY created_at DESC LIMIT 5
   Display: Total Paid, Payment Count, Recent History
   
   STEP 4 - GENERATE PAYMENT (INSERT DATA):
   User clicks "Pay Now" → Enters amount → POST /api/payments/generate-upi
   Backend: INSERT INTO payments (...) VALUES (...)
   Backend: INSERT INTO payment_sessions (...) VALUES (...)
   Generate UPI link: upi://pay?pa=homahealthcare@paytm&am=500&tn=...
   Return link to frontend → Open in new tab
   
   STEP 5 - CONFIRM PAYMENT (UPDATE DATA):
   User pays via UPI → Clicks "I have paid" → POST /api/payments/confirm-payment
   Backend: UPDATE payments SET status='completed', payment_date=NOW() WHERE id=?
   Backend: UPDATE payment_sessions SET status='completed' WHERE session_id=?
   Send SMS confirmation → Update dashboard

5. FRONTEND REQUIREMENTS:

   - SignUp Page (SignUp.tsx):
     * Email input with validation
     * Password input (type="password")
     * Confirm Password input (must match password)
     * Full Name input
     * Phone input (10 digits)
     * Submit button
     * Link to Login page
     * Real-time validation feedback
   
   - Login Page (Login.tsx):
     * Email input
     * Password input
     * Show/hide password toggle
     * Remember me checkbox
     * Submit button
     * Link to Sign Up page
   
   - Dashboard (Dashboard.tsx):
     * Welcome message with user name
     * Statistics cards:
       - Total Paid (₹ symbol)
       - Total Payments count
       - Pending Payments count
       - Upcoming Appointments
     * "Pay Now" button (prominent)
     * Payment history table
     * Quick actions section
   
   - Payment Modal:
     * Amount input field
     * Generate UPI Link button
     * Display UPI link when generated
     * "I have paid" confirmation button
     * Success/error messages

6. SECURITY REQUIREMENTS:
   - All passwords hashed with bcryptjs (12 salt rounds)
   - JWT tokens with secret key
   - Rate limiting on API endpoints
   - Input validation on all forms
   - SQL injection prevention (use parameterized queries)
   - CORS enabled for frontend
   - Authentication required for protected routes

7. UPI PAYMENT INTEGRATION:
   - UPI ID: homahealthcare@paytm
   - Merchant Name: Homa Healthcare
   - Format: upi://pay?pa={UPI_ID}&pn={MERCHANT_NAME}&am={AMOUNT}&cu=INR&tn={DESCRIPTION}&tr={TRANSACTION_ID}
   - Auto-generate transaction IDs using UUID
   - 15-minute expiry for payment sessions

8. ENVIRONMENT VARIABLES (.env):
   ```
   # NEON DATABASE CREDENTIALS (COPY EXACTLY)
   DATABASE_URL=postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   DB_HOST=ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech
   DB_PORT=5432
   DB_NAME=neondb
   DB_USER=neondb_owner
   DB_PASSWORD=npg_KgY1jcShHne2
   
   # JWT AUTHENTICATION
   JWT_SECRET=homa-healthcare-secret-key-2024
   JWT_EXPIRES_IN=24h
   
   # SERVER CONFIG
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-repl-name.repl.co
   
   # UPI PAYMENT
   UPI_ID=homahealthcare@paytm
   MERCHANT_NAME=Homa Healthcare
   MERCHANT_CODE=HOMA001
   ```

9. STARTUP SEQUENCE:
   1. Connect to Neon database
   2. Sync Sequelize models (auto-create tables)
   3. Start Express server on port 3000
   4. Log: "✅ Database connected"
   5. Log: "🚀 Server running on port 3000"
   6. Log: "📊 Health check: http://localhost:3000/health"

10. TESTING FLOW:
    - Health check: GET /health (should return "OK")
    - Register user: POST /api/auth/register
    - Login: POST /api/auth/login (returns token)
    - Dashboard: GET /api/dashboard/stats (with token)
    - Generate payment: POST /api/payments/generate-upi (with token)
    - Confirm payment: POST /api/payments/confirm-payment (with token)

11. ERROR HANDLING:
    - All API errors return JSON: { success: false, message: "Error message" }
    - Frontend shows toast notifications for errors
    - Database errors logged to console
    - Validation errors returned with field details

12. DATA ALIGNMENT (CRITICAL!):
    Frontend fields → Backend model → Database column
    - user.email → User.email → users.email
    - user.full_name → User.full_name → users.full_name
    - user.phone → User.phone → users.phone
    - payment.amount → Payment.amount → payments.amount
    - payment.status → Payment.status → payments.status
    ALL MUST MATCH EXACTLY!

13. PACKAGE DEPENDENCIES:
    Backend:
    - express, cors, helmet, morgan
    - sequelize, pg, pg-hstore
    - bcryptjs, jsonwebtoken
    - express-validator, express-rate-limit
    - uuid, dotenv
    - twilio (optional for SMS)
    
    Frontend:
    - react, react-dom, react-router-dom
    - axios
    - typescript
    - tailwindcss
    - lucide-react (for icons)
    - react-hot-toast (for notifications)

14. FILE STRUCTURE:
    ```
    /
    ├── backend/
    │   ├── server.js (main entry)
    │   ├── config/
    │   │   └── database.js
    │   ├── models/
    │   │   ├── index.js (exports all)
    │   │   ├── User.js
    │   │   ├── Payment.js
    │   │   ├── PaymentSession.js
    │   │   └── Appointment.js
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── dashboard.js
    │   │   ├── payments.js
    │   │   ├── users.js
    │   │   └── appointments.js
    │   ├── middleware/
    │   │   ├── auth.js
    │   │   └── errorHandler.js
    │   └── utils/
    │       └── paymentUtils.js
    ├── frontend/
    │   └── src/
    │       ├── components/
    │       │   ├── auth/
    │       │   │   ├── SignUp.tsx
    │       │   │   └── Login.tsx
    │       │   └── dashboard/
    │       │       └── Dashboard.tsx
    │       ├── services/
    │       │   └── api.ts
    │       └── context/
    │           └── AuthContext.tsx
    ├── package.json
    └── .env
    ```

CREATE A COMPLETE, WORKING, PRODUCTION-READY HEALTHCARE PAYMENT SYSTEM THAT:
✅ Connects to Neon database with the provided connection string
✅ Has complete sign up with password confirmation
✅ Has working login that redirects to dashboard
✅ Dashboard fetches and displays real data from database
✅ Can generate UPI payment links and store in database
✅ Can confirm payments and update database
✅ Has perfect alignment between frontend, backend, and database
✅ Uses INTEGER primary keys for better performance
✅ All tables auto-created on first run
✅ Ready to deploy and use immediately

START BUILDING NOW!
```

---

## 🎯 HOW TO USE THIS PROMPT IN REPLIT:

1. Go to Replit.com
2. Create new Repl or import from GitHub
3. Open Replit AI Agent
4. Copy the entire prompt above
5. Paste into Replit AI
6. Wait for it to build
7. Click Run!

**Your complete healthcare payment system will be live in minutes!** 🚀
