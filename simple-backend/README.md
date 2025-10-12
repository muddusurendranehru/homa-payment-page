# 🏥 Simple Healthcare Payment System

**Single-file backend** - Easy to deploy, easy to understand!

## ✨ Features

- ✅ User Registration (email + password + confirm)
- ✅ User Login (email + password)
- ✅ JWT Authentication
- ✅ Add Payment Records
- ✅ View Payment History
- ✅ PostgreSQL Database (2 tables)
- ✅ Auto-creates tables on startup

## 🚀 Deploy to Replit3

### **STEP 1: Create Replit Project**
1. Go to https://replit.com
2. Click "+ Create Repl"
3. Select "Node.js"
4. Name: `simple-healthcare`
5. Click "Create Repl"

### **STEP 2: Upload Files**
Upload these 3 files:
- `server.js`
- `package.json`
- `.replit`

### **STEP 3: Add Secrets**
Click 🔒 Secrets and add:

```
DATABASE_URL
postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET
simple-healthcare-secret-key-2024

PORT
3000
```

### **STEP 4: Click Run ▶️**

Done! Your API is live.

## 📱 API Endpoints

### **Register User**
```http
POST /api/register

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response:
{
  "message": "Registration successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### **Login**
```http
POST /api/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### **Add Payment** (Requires auth)
```http
POST /api/payments
Authorization: Bearer YOUR_TOKEN

Body:
{
  "amount": 500,
  "description": "Consultation fee"
}

Response:
{
  "message": "✅ Payment successful!",
  "payment": {
    "id": 1,
    "user_id": 1,
    "amount": "500.00",
    "description": "Consultation fee",
    "status": "completed",
    "created_at": "2024-12-10T10:30:00.000Z"
  }
}
```

### **Get Payment History** (Requires auth)
```http
GET /api/payments
Authorization: Bearer YOUR_TOKEN

Response:
[
  {
    "id": 1,
    "user_id": 1,
    "amount": "500.00",
    "description": "Consultation fee",
    "status": "completed",
    "created_at": "2024-12-10T10:30:00.000Z"
  }
]
```

### **Get User Info** (Requires auth)
```http
GET /api/user
Authorization: Bearer YOUR_TOKEN

Response:
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2024-12-10T10:00:00.000Z"
}
```

### **Health Check**
```http
GET /health

Response:
{
  "status": "OK"
}
```

## 🗄️ Database Tables

### **users**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### **payments**
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## 🔐 Authentication

Uses JWT (JSON Web Tokens):
1. Register or Login to get token
2. Include token in Authorization header: `Bearer YOUR_TOKEN`
3. Token expires in 7 days

## 🛠️ Tech Stack

- **Node.js** + Express
- **PostgreSQL** (Neon)
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT auth
- **5 dependencies only!**

## ✅ What This Has

✅ Sign Up page (email, password, confirm)
✅ Login page (email, password)
✅ Authentication with JWT
✅ Insert payments (with auth)
✅ Fetch payments (with auth)
✅ 2 database tables (users, payments)
✅ Auto-creates tables
✅ Secure password hashing
✅ Token-based authentication

## 📝 Testing

### Using cURL:

**Register:**
```bash
curl -X POST https://your-repl-url.repl.co/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","confirmPassword":"test123"}'
```

**Login:**
```bash
curl -X POST https://your-repl-url.repl.co/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Add Payment:**
```bash
curl -X POST https://your-repl-url.repl.co/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":500,"description":"Test payment"}'
```

**Get Payments:**
```bash
curl https://your-repl-url.repl.co/api/payments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Perfect For

- ✅ Quick prototypes
- ✅ Learning projects
- ✅ MVP deployments
- ✅ Simple payment tracking
- ✅ User authentication demo

## 📦 One File = Easy Deployment

Everything in `server.js`:
- Database connection
- Table creation
- Authentication middleware
- All API endpoints
- Server startup

**No complex folder structure. Just works!** 🚀

## 🔧 Environment Variables

```
DATABASE_URL - Your Neon PostgreSQL connection string
JWT_SECRET - Secret key for JWT tokens (optional, has default)
PORT - Server port (optional, defaults to 3000)
```

## ⚡ Deploy Anywhere

Works on:
- ✅ Replit
- ✅ Railway
- ✅ Render
- ✅ Heroku
- ✅ Any Node.js host

## 💡 Extend It

Easy to add:
- More user fields (name, phone)
- Payment status updates
- User dashboard
- Admin panel
- Email notifications
- Payment methods (Stripe, etc.)

## 🎉 That's It!

Simple, clean, production-ready backend in **one file**.

**Deploy it now and start building your frontend!** 💻✨

