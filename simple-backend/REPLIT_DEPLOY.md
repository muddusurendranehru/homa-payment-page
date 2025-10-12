# 🚀 Deploy to Replit3 in 3 Steps

## 📁 **Your Project Structure:**

```
your-replit-project/
├── server.js          ← Main backend code
├── package.json       ← Dependencies
└── .env              ← Environment variables (use Replit Secrets instead)
```

---

## ⚡ **3-STEP DEPLOYMENT**

### **STEP 1: Upload Files to Replit**

1. Go to https://replit.com
2. Click **"+ Create Repl"**
3. Select **"Node.js"**
4. Name: `healthcare-payment`
5. Click **"Create Repl"**

**Upload these 2 files:**
- `server.js` (from `simple-backend/server.js`)
- `package.json` (from `simple-backend/package.json`)

---

### **STEP 2: Add Environment Variables**

Click **🔒 Secrets** (left sidebar) and add these 3:

#### **Secret 1: DATABASE_URL**
```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### **Secret 2: JWT_SECRET**
```
Key: JWT_SECRET
Value: simple-healthcare-secret-key-2024
```

#### **Secret 3: PORT**
```
Key: PORT
Value: 3000
```

---

### **STEP 3: Click Run ▶️**

That's it! Wait 30 seconds and your API is LIVE!

---

## ✅ **Success Output:**

You should see:
```
🚀 Server running on port 3000
✅ Database ready!
```

---

## 🧪 **Test Your API:**

### **Your API URL:**
```
https://healthcare-payment.your-username.repl.co
```

### **Test 1: Health Check**
```http
GET /health

Response:
{
  "status": "OK"
}
```

### **Test 2: Register User**
```http
POST /api/register
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "test123",
  "confirmPassword": "test123"
}

Response:
{
  "message": "Registration successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@test.com"
  }
}
```

### **Test 3: Login**
```http
POST /api/login
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "test123"
}

Response:
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@test.com"
  }
}
```

### **Test 4: Add Payment** (Use token from login)
```http
POST /api/payments
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

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

### **Test 5: View Payments** (Use token from login)
```http
GET /api/payments
Authorization: Bearer YOUR_TOKEN_HERE

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

---

## 🎯 **What You Get:**

✅ **Sign Up** - email + password + confirmPassword  
✅ **Login** - email + password  
✅ **Authentication** - JWT tokens (7-day expiry)  
✅ **Add Payments** - with authentication  
✅ **View Payments** - user's payment history  
✅ **2 Database Tables** - users & payments  
✅ **Auto-creates tables** - on first run  

---

## 📱 **6 API Endpoints:**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| POST | `/api/register` | Sign up | No |
| POST | `/api/login` | Login | No |
| POST | `/api/payments` | Add payment | Yes |
| GET | `/api/payments` | View payments | Yes |
| GET | `/api/user` | Get user info | Yes |

---

## 🗄️ **Database Tables (Auto-Created):**

### **users**
- id (auto-increment)
- email (unique)
- password (hashed with bcrypt)
- created_at (timestamp)

### **payments**
- id (auto-increment)
- user_id (foreign key to users)
- amount (decimal)
- description (text)
- status (default: "completed")
- created_at (timestamp)

---

## 🔐 **Authentication Flow:**

1. **Register** → Get token
2. **Login** → Get token
3. **Use token** → Add `Authorization: Bearer TOKEN` header
4. **Access protected routes** → payments, user info

---

## 🚨 **Troubleshooting:**

### **Problem: "npm not found"**
```bash
# In Replit Shell:
nix-env -iA nixpkgs.nodejs-20_x nixpkgs.npm
```

### **Problem: "Connection failed"**
- Check `DATABASE_URL` in Secrets
- Make sure it ends with `?sslmode=require`

### **Problem: "Port already in use"**
```bash
# In Replit Shell:
pkill -f node
# Then click Run again
```

---

## 💡 **Pro Tips:**

1. **Save your token** - Copy the token from login response for testing
2. **Use Postman** - Easy way to test APIs with authentication
3. **Check Console** - Replit console shows all server logs
4. **Test incrementally** - Test register → login → add payment → view payments

---

## 🎉 **You're Done!**

Your healthcare payment backend is:
- ✅ Live on Replit
- ✅ Connected to PostgreSQL database
- ✅ Tables auto-created
- ✅ Ready to accept requests
- ✅ Secured with JWT

**Now build your frontend and connect to this API!** 🚀

---

## 📞 **Quick Reference:**

**Files needed:**
- `server.js`
- `package.json`

**Secrets needed:**
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`

**Endpoints:**
- Register: `POST /api/register`
- Login: `POST /api/login`
- Payments: `POST /api/payments` & `GET /api/payments`

**That's all you need!** ✨

---

**Deploy now and start testing!** 🏥💻

