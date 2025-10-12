# 🏥 Homa Healthcare Payment System - Complete Solution

## 📋 Overview
A comprehensive healthcare payment management system with UPI integration, built with Node.js, React, TypeScript, and Neon Database. This system handles patient registration, authentication, appointment management, and secure UPI payments.

## 🎯 Key Features

### ✅ **Complete Authentication System**
- User registration and login
- JWT token-based authentication
- Role-based access control (Patient, Doctor, Admin)
- Password hashing with bcrypt

### ✅ **Database Architecture (Neon PostgreSQL)**
- **Users Table**: Core user management with INTEGER primary keys
- **Patient Profiles**: Extended patient information
- **Appointments**: Appointment scheduling and management
- **Payments Table**: Heart of the system - payment tracking
- **Payment Sessions**: UPI session management
- **Doctors**: Doctor profiles and specializations
- **Notifications**: System notifications

### ✅ **UPI Payment Integration**
- Generate UPI payment links
- Real-time payment confirmation
- SMS and email notifications
- Payment history tracking
- Webhook support for payment gateways

### ✅ **Modern Frontend (React + TypeScript)**
- Responsive dashboard
- Authentication pages (Login/Signup)
- Payment management interface
- Real-time updates
- Modern UI with Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React TS)    │◄──►│   (Node.js)     │◄──►│   (Neon PG)     │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • Express API   │    │ • Users         │
│ • Auth Pages    │    │ • JWT Auth      │    │ • Payments      │
│ • Payment UI    │    │ • UPI Integration│   │ • Appointments  │
│ • TypeScript    │    │ • SMS/Email     │    │ • Sessions      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. **Setup Backend**
```bash
cd homa-healthcare-complete
npm install
```

### 2. **Configure Environment**
```bash
cp env.example .env
# Edit .env with your database and API credentials
```

### 3. **Setup Database**
```bash
# Create Neon database and run schema
psql your-database-url < database/schema.sql
```

### 4. **Start Backend**
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 5. **Setup Frontend**
```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3001
```

## 📊 Database Schema (Visual)

### **USERS Table** (Primary)
```sql
┌─────────────┬─────────────────┬──────────────┐
│     id      │    email        │  password_hash│
├─────────────┼─────────────────┼──────────────┤
│ INTEGER PK  │ VARCHAR(255)    │ VARCHAR(255) │
│ AUTO_INCREMENT│ UNIQUE        │ NOT NULL     │
└─────────────┴─────────────────┴──────────────┘
│ full_name   │ phone           │ role         │
│ VARCHAR(255)│ VARCHAR(15)     │ ENUM         │
│ NOT NULL    │ UNIQUE          │ patient/doctor│
└─────────────┴─────────────────┴──────────────┘
```

### **PAYMENTS Table** (Heart of System)
```sql
┌─────────────┬─────────────────┬──────────────┐
│     id      │  patient_id     │   amount     │
├─────────────┼─────────────────┼──────────────┤
│ INTEGER PK  │ INTEGER FK      │ DECIMAL(10,2)│
│ AUTO_INCREMENT│ REFERENCES users│ NOT NULL    │
└─────────────┴─────────────────┴──────────────┘
│ status      │ transaction_id  │ upi_link     │
│ ENUM        │ VARCHAR(255)    │ TEXT         │
│ pending/    │ UNIQUE          │ UPI PAYMENT  │
│ completed   │                 │ LINK         │
└─────────────┴─────────────────┴──────────────┘
```

## 🔄 User Flow

### **Authentication Flow**
```
Sign Up → Email Verification → Login → Dashboard
```

### **Payment Flow** (Main Process)
```
Dashboard → Click "Pay Now" → Generate UPI Link → 
Patient pays via UPI → Webhook confirmation → 
Update payment status → Send confirmation SMS/Email
```

## 🛠️ API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### **Payments**
- `POST /api/payments/generate-upi` - Generate UPI link
- `POST /api/payments/confirm-payment` - Confirm payment
- `GET /api/payments/history` - Payment history
- `POST /api/payments/webhook` - Payment webhook

### **Dashboard**
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/quick-actions` - Quick actions
- `POST /api/dashboard/generate-payment` - Quick payment

## 🔐 Security Features

- ✅ JWT Token Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ CORS Protection
- ✅ Helmet Security Headers
- ✅ Environment Variables for Secrets

## 📱 UPI Integration

### **UPI Link Format**
```
upi://pay?pa=your-upi-id@paytm&pn=Homa%20Healthcare&am=500&cu=INR&tn=Payment%20for%20consultation&tr=TXN123456
```

### **Supported UPI Apps**
- Google Pay
- PhonePe
- Paytm
- BHIM
- Any UPI-enabled app

## 🔔 Notifications

### **SMS Notifications (Twilio)**
- Payment link generation
- Payment confirmation
- Appointment reminders

### **Email Notifications**
- Payment receipts
- Appointment confirmations
- System updates

### **Telegram Bot**
- Admin notifications
- Payment alerts
- System monitoring

## 🚀 Deployment

### **Backend Deployment**
- **Railway**: Easy deployment with PostgreSQL
- **Render**: Free tier available
- **Heroku**: Traditional PaaS option

### **Frontend Deployment**
- **Vercel**: Optimized for React
- **Netlify**: Great for static sites
- **GitHub Pages**: Free hosting

### **Database**
- **Neon**: Serverless PostgreSQL (Recommended)
- **Supabase**: Open source alternative
- **PlanetScale**: MySQL alternative

## 📋 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db
DB_HOST=your-neon-host
DB_USER=your-username
DB_PASSWORD=your-password

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# UPI
UPI_ID=your-upi-id@paytm
MERCHANT_NAME=Homa Healthcare
```

## 🧪 Testing

```bash
# Backend tests
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration
```

## 📈 Monitoring

- Health check endpoint: `/health`
- Payment webhook logs
- Database query monitoring
- Error tracking and logging

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Email: support@homaclinic.com
- Telegram: @homaclinic_support
- GitHub Issues: Create an issue

---

**Built with ❤️ for Homa Healthcare by Dr. Nehru**
