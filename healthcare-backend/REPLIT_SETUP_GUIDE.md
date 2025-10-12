# 🚀 Replit3 Deployment Guide - Homa Healthcare System

## 📋 **STEP-BY-STEP DEPLOYMENT**

Follow these steps exactly to deploy your healthcare payment system on Replit3.

---

## **STEP 1: Create New Replit Project**

1. Go to https://replit.com
2. Click **"+ Create Repl"**
3. Select **"Node.js"** template
4. Name it: `homa-healthcare-system`
5. Click **"Create Repl"**

---

## **STEP 2: Upload Files**

Upload ALL these files to your Replit project:

```
healthcare-backend/
├── package.json
├── server.js
├── setup-database.js
├── .replit
├── env.example
├── config/
│   └── database.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── appointments.js
│   ├── payments.js
│   └── dashboard.js
└── utils/
    └── email.js
```

---

## **STEP 3: Add Environment Variables (Secrets)**

Click **🔒 Secrets** (padlock icon) and add these:

### **Required Secrets:**

```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

```
Key: JWT_SECRET
Value: homa-healthcare-super-secret-jwt-key-minimum-32-characters-long-2024
```

```
Key: PORT
Value: 3000
```

```
Key: NODE_ENV
Value: production
```

### **Optional Secrets (For Stripe Payments):**

```
Key: STRIPE_SECRET_KEY
Value: sk_test_your_stripe_secret_key_here
```

```
Key: STRIPE_PUBLISHABLE_KEY
Value: pk_test_your_stripe_publishable_key_here
```

### **Optional Secrets (For Email Notifications):**

```
Key: SMTP_HOST
Value: smtp.gmail.com
```

```
Key: SMTP_PORT
Value: 587
```

```
Key: SMTP_USER
Value: your-email@gmail.com
```

```
Key: SMTP_PASS
Value: your-app-specific-password
```

---

## **STEP 4: Click Run ▶️**

1. Click the green **Run** button
2. Wait for installation (this may take 1-2 minutes)
3. Watch the console for success messages

### **Expected Output:**

```
🔌 Connecting to Neon PostgreSQL database...
✅ Connected successfully!

📊 Creating database tables...

1️⃣  Creating users table...
   ✅ Users table created

2️⃣  Creating doctors table...
   ✅ Doctors table created

3️⃣  Creating appointments table...
   ✅ Appointments table created

4️⃣  Creating payments table...
   ✅ Payments table created

5️⃣  Creating invoices table...
   ✅ Invoices table created

👥 Creating sample users...

6️⃣  Creating admin user...
   ✅ Admin user created (admin@homaclinic.com / admin123)

7️⃣  Creating doctor user...
   ✅ Doctor user created (doctor@homaclinic.com / doctor123)

8️⃣  Creating patient user...
   ✅ Patient user created (patient@homaclinic.com / patient123)

🎉 DATABASE SETUP COMPLETE!

✅ Database connected successfully

═══════════════════════════════════════════════════════════════
🏥 HOMA HEALTHCARE PAYMENT SYSTEM
═══════════════════════════════════════════════════════════════
🚀 Server running on port 3000
📊 Environment: production
🔗 API Base URL: http://localhost:3000/api

📍 Available Endpoints:
   Health Check:     http://localhost:3000/health
   Authentication:   http://localhost:3000/api/auth
   Appointments:     http://localhost:3000/api/appointments
   Payments:         http://localhost:3000/api/payments
   Dashboard:        http://localhost:3000/api/dashboard

👥 Test Accounts:
   Admin:    admin@homaclinic.com / admin123
   Doctor:   doctor@homaclinic.com / doctor123
   Patient:  patient@homaclinic.com / patient123

═══════════════════════════════════════════════════════════════
```

---

## **STEP 5: Test Your API**

Your Replit will give you a URL like: `https://homa-healthcare-system.your-username.repl.co`

### **Test Health Check:**

```bash
GET https://your-repl-url.repl.co/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "🏥 Homa Healthcare Payment System API is running",
  "timestamp": "2024-12-10T10:30:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### **Test Login:**

```bash
POST https://your-repl-url.repl.co/api/auth/login
Content-Type: application/json

{
  "email": "admin@homaclinic.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@homaclinic.com",
      "full_name": "Dr. Admin Nehru",
      "role": "admin",
      "is_verified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## **STEP 6: Test All Features**

Use the token from login to test protected endpoints:

### **1. Get My Profile:**
```bash
GET https://your-repl-url.repl.co/api/auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

### **2. Get All Doctors:**
```bash
GET https://your-repl-url.repl.co/api/appointments/doctors
```

### **3. Patient Dashboard:**
```bash
GET https://your-repl-url.repl.co/api/dashboard/patient
Authorization: Bearer PATIENT_TOKEN_HERE
```

### **4. Admin Dashboard:**
```bash
GET https://your-repl-url.repl.co/api/dashboard/admin
Authorization: Bearer ADMIN_TOKEN_HERE
```

---

## **🔧 Troubleshooting**

### **Problem: "npm: command not found"**

**Solution:**
Run this in Replit Shell:
```bash
nix-env -iA nixpkgs.nodejs-20_x nixpkgs.npm
```

### **Problem: "You don't have any tables"**

**Solution:**
Run this in Replit Shell:
```bash
node setup-database.js
```

### **Problem: "Database connection failed"**

**Solution:**
1. Check your DATABASE_URL in Secrets
2. Make sure it includes `?sslmode=require`
3. Test connection to Neon database

### **Problem: "Port already in use"**

**Solution:**
1. Stop the server (Ctrl+C in Shell)
2. Kill any running processes:
```bash
pkill -f node
```
3. Click Run again

---

## **📱 API Endpoints Summary**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/profile` | Get profile | Yes |
| GET | `/api/appointments/doctors` | List doctors | No |
| POST | `/api/appointments/book` | Book appointment | Yes (Patient) |
| GET | `/api/appointments/my-appointments` | My appointments | Yes (Patient) |
| GET | `/api/appointments/all` | All appointments | Yes (Admin/Doctor) |
| POST | `/api/payments/create-checkout-session` | Create payment | Yes |
| GET | `/api/payments/my-payments` | My payments | Yes (Patient) |
| GET | `/api/payments/all` | All payments | Yes (Admin) |
| GET | `/api/dashboard/patient` | Patient dashboard | Yes (Patient) |
| GET | `/api/dashboard/doctor` | Doctor dashboard | Yes (Doctor) |
| GET | `/api/dashboard/admin` | Admin dashboard | Yes (Admin) |

---

## **👥 Test Accounts**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@homaclinic.com | admin123 |
| Doctor | doctor@homaclinic.com | doctor123 |
| Patient | patient@homaclinic.com | patient123 |

---

## **✅ Success Checklist**

- [ ] Replit project created
- [ ] All files uploaded
- [ ] All secrets added
- [ ] Server started successfully
- [ ] Database tables created
- [ ] Health check returns OK
- [ ] Login works and returns token
- [ ] Protected endpoints work with token
- [ ] Email notifications configured (optional)
- [ ] Stripe payments configured (optional)

---

## **🎉 You're Done!**

Your complete healthcare payment system is now live on Replit with:

✅ **Authentication** - JWT-based login with role-based access
✅ **Appointments** - Complete booking system
✅ **Payments** - Stripe integration ready
✅ **Dashboards** - Patient, Doctor, and Admin dashboards
✅ **Emails** - Automated notifications
✅ **Database** - PostgreSQL with 5 tables
✅ **Security** - Encrypted passwords, protected routes

**Your API is ready to integrate with any frontend!**

---

## **📞 Need Help?**

If you encounter any issues:
1. Check the Console tab in Replit for error messages
2. Verify all environment variables are set correctly
3. Make sure database connection string is correct
4. Test individual endpoints one by one

**Happy Coding! 🚀**

