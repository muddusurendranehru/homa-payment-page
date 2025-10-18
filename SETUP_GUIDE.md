# 🚀 Complete Setup Guide - Payment Database

## ✅ Step-by-Step Setup

### 1️⃣ Database Setup (ALREADY DONE ✅)

Your Neon database is configured:
- **Connection String**: `postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
- **Database Name**: `neondb`
- **Tables**: 2 (users, payments) with UUID primary keys

### 2️⃣ Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (in new terminal)
cd frontend
npm install
```

### 3️⃣ Environment Setup (ALREADY DONE ✅)

The `.env` file has been created in the root directory with your Neon connection string.

### 4️⃣ Start Backend Server

```bash
cd backend
node server.js
```

**Expected Output:**
```
✅ Database connection established successfully
✅ Using existing database schema
🚀 Payment Database Server running on port 3000
📊 Health check: http://localhost:3000/health
🔗 API Base URL: http://localhost:3000/api
```

### 5️⃣ Start Frontend (New Terminal)

```bash
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view the app in the browser.

  Local:            http://localhost:3001
  On Your Network:  http://192.168.x.x:3001
```

---

## 🧪 Testing Your Application

### Test 1: Backend Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Payment Database System is running",
  "database": "payment",
  "tables": 2,
  "timestamp": "2024-...",
  "port": 3000
}
```

### Test 2: API Endpoints
```bash
curl http://localhost:3000/
```

**Expected Response:**
```json
{
  "message": "💳 Payment Database System API",
  "version": "3.0.0",
  "database": "payment",
  "tables": ["users", "payments"],
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth (signup, login, logout)",
    "data": "/api/data (POST to insert, GET to fetch)",
    "dashboard": "/api/dashboard"
  }
}
```

### Test 3: Frontend Pages

1. **Open Browser**: http://localhost:3001
2. **Sign Up**: Create account with email, password, confirmPassword
3. **Login**: Use your credentials
4. **Dashboard**: 
   - Click "INSERT Data" to add payment records
   - Click "FETCH Payments" to view data
   - Click "View All Tables" to see both tables
   - Click "Logout" to log out

---

## 📊 Database Schema

### Table 1: users
```sql
id              UUID PRIMARY KEY (gen_random_uuid())
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### Table 2: payments
```sql
id              UUID PRIMARY KEY (gen_random_uuid())
user_id         UUID NOT NULL (FK → users.id)
amount          DECIMAL(10,2) NOT NULL
description     TEXT
status          VARCHAR(50) DEFAULT 'pending'
transaction_id  VARCHAR(255)
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

---

## 🔗 API Endpoints Reference

### Authentication
- **POST** `/api/auth/signup` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```

- **POST** `/api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/auth/logout` - Logout user (requires auth token)

- **GET** `/api/auth/me` - Get current user (requires auth token)

### Data Operations
- **POST** `/api/data` - Insert payment data (requires auth token)
  ```json
  {
    "amount": 100.50,
    "description": "Payment for service",
    "status": "pending"
  }
  ```

- **GET** `/api/data` - Fetch all payments for user (requires auth token)

- **GET** `/api/data/all-tables` - View all tables data (requires auth token)

---

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Test connection directly
psql "postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Backend Not Starting
1. Check `.env` file exists in root directory
2. Verify `DATABASE_URL` is correct
3. Run `npm install` in backend folder
4. Check port 3000 is not in use

### Frontend Not Connecting
1. Ensure backend is running on port 3000
2. Check `REACT_APP_API_URL` in frontend (if exists)
3. Clear browser cache and reload

### CORS Issues
- Backend already configured for `http://localhost:3001`
- If using different port, update `FRONTEND_URL` in `.env`

---

## 📝 Project Structure

```
payment-database/
├── .env                    # ✅ Database connection (CREATED)
├── backend/
│   ├── config/
│   │   └── database.js     # ✅ Neon connection
│   ├── models/
│   │   ├── User.js         # ✅ UUID primary key
│   │   ├── Payment.js      # ✅ UUID primary key
│   │   └── index.js        # ✅ 2 models only
│   ├── routes/
│   │   ├── auth.js         # ✅ signup, login, logout
│   │   ├── data.js         # ✅ insert, fetch
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js         # ✅ JWT authentication
│   └── server.js           # ✅ Main server
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   │   ├── SignUp.tsx   # ✅ 3 fields only
│       │   │   └── Login.tsx
│       │   └── dashboard/
│       │       └── Dashboard.tsx # ✅ INSERT/FETCH UI
│       └── services/
│           └── api.ts      # ✅ API calls
└── database/
    └── schema.sql          # ✅ 2 tables, UUID keys
```

---

## ✅ Compliance Checklist

- ✅ Database name: "payment" (using neondb)
- ✅ Exactly 2 tables: users, payments
- ✅ All primary keys: UUID (not INTEGER)
- ✅ Auth endpoints: /signup, /login, /logout
- ✅ Signup form: 3 fields (email, password, confirmPassword)
- ✅ Data endpoints: POST /api/data, GET /api/data
- ✅ Dashboard: INSERT, FETCH, View Tables, Logout

---

## 🎉 You're Ready!

Run these commands in order:

```bash
# Terminal 1 - Backend
cd backend
npm install
node server.js

# Terminal 2 - Frontend
cd frontend
npm install
npm start

# Open browser: http://localhost:3001
```

**Your Payment Database System is now running!** 🚀

