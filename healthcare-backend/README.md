# 🏥 Homa Healthcare Payment System - Backend API

Complete healthcare payment portal with appointment booking, Stripe payment integration, role-based authentication, and automated email notifications.

## 🌟 Features

### ✅ **Authentication & Authorization**
- User registration and JWT-based login
- Role-based access control (Admin, Doctor, Patient)
- Secure password hashing with bcrypt
- Profile management with medical information

### 📅 **Appointment System**
- Doctor listing with specializations
- Book appointments with date/time selection
- Appointment status management
- Conflict prevention for double-booking
- Email confirmations

### 💳 **Payment Processing**
- Stripe checkout integration
- Support for UPI, Card, and Net Banking
- Payment status tracking
- Invoice generation
- Digital receipt via email
- Payment history and analytics

### 📊 **Dashboard APIs**
- **Patient Dashboard**: Upcoming appointments, payment history, statistics
- **Doctor Dashboard**: Today's schedule, upcoming appointments, patient stats
- **Admin Dashboard**: System overview, revenue analytics, user management

### 📧 **Email Notifications**
- Appointment confirmations
- Payment receipts
- Professional HTML email templates

## 🚀 Quick Start

### 1. **Prerequisites**
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Stripe account (for payments)
- Gmail/SMTP account (for emails)

### 2. **Installation**

```bash
# Install dependencies
npm install

# Setup environment variables
cp env.example .env
# Edit .env with your credentials

# Create database tables
node setup-database.js

# Start server
npm start
```

### 3. **Environment Variables**

Create a `.env` file:

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# JWT Secret (Required)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Stripe (Required for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email (Optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=Homa Healthcare <noreply@homahealthcare.com>

# Clinic Info
CLINIC_NAME=Homa Healthcare Clinic
CLINIC_EMAIL=info@homahealthcare.com
CLINIC_PHONE=+91-9876543210
CLINIC_ADDRESS=123 Medical Street, Healthcare City
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "9876543210",
  "role": "patient"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Appointment Endpoints

#### Get All Doctors
```http
GET /api/appointments/doctors
```

#### Book Appointment
```http
POST /api/appointments/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor_id": 1,
  "appointment_date": "2024-12-25",
  "appointment_time": "10:30:00",
  "reason": "General checkup"
}
```

#### Get My Appointments
```http
GET /api/appointments/my-appointments
Authorization: Bearer <token>
```

#### Get All Appointments (Admin/Doctor)
```http
GET /api/appointments/all?status=scheduled&date=2024-12-25
Authorization: Bearer <token>
```

#### Update Appointment Status
```http
PATCH /api/appointments/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Patient confirmed attendance"
}
```

#### Cancel Appointment
```http
DELETE /api/appointments/:id
Authorization: Bearer <token>
```

### Payment Endpoints

#### Create Checkout Session
```http
POST /api/payments/create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "appointment_id": 1,
  "amount": 500.00,
  "description": "Consultation fee"
}
```

#### Verify Payment
```http
POST /api/payments/verify-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "session_id": "cs_test_..."
}
```

#### Get My Payments
```http
GET /api/payments/my-payments
Authorization: Bearer <token>
```

#### Get All Payments (Admin)
```http
GET /api/payments/all?status=completed&start_date=2024-01-01
Authorization: Bearer <token>
```

#### Get Payment Statistics
```http
GET /api/payments/stats/overview
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### Patient Dashboard
```http
GET /api/dashboard/patient
Authorization: Bearer <token>
```

#### Doctor Dashboard
```http
GET /api/dashboard/doctor
Authorization: Bearer <token>
```

#### Admin Dashboard
```http
GET /api/dashboard/admin
Authorization: Bearer <token>
```

## 👥 Default Test Accounts

| Role    | Email                      | Password   |
|---------|----------------------------|------------|
| Admin   | admin@homaclinic.com       | admin123   |
| Doctor  | doctor@homaclinic.com      | doctor123  |
| Patient | patient@homaclinic.com     | patient123 |

## 🗄️ Database Schema

### Tables
1. **users** - User accounts (patients, doctors, admins)
2. **doctors** - Doctor profiles with specializations
3. **appointments** - Appointment bookings
4. **payments** - Payment transactions
5. **invoices** - Generated invoices

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt (12 rounds)
- Role-based access control
- Helmet.js for security headers
- SQL injection prevention with parameterized queries
- CORS protection
- Input validation with express-validator

## 📦 Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT + bcrypt
- **Payments**: Stripe
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet.js

## 🚀 Deployment

### Replit Deployment

1. Create new Replit project
2. Upload all files
3. Add Secrets (environment variables)
4. Click "Run"

### Environment Variables for Replit

Add these in Replit Secrets:

```
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_key
PORT=3000
NODE_ENV=production
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev only)"
}
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Setup database
npm run setup-db

# Test API
npm test
```

## 📞 Support

For issues or questions:
- Email: support@homahealthcare.com
- GitHub: [Your Repository]

## 📄 License

MIT License - feel free to use for your healthcare projects!

---

**Built with ❤️ for better healthcare**

