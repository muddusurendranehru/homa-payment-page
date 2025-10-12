# 🚀 COMPLETE REPLIT SETUP GUIDE
## Homa Healthcare Payment System

---

## STEP 1: Add Environment Variables to Replit

### 📍 **How to Add Secrets in Replit:**
1. Click the **🔒 Secrets** tab (padlock icon in left sidebar)
2. For each variable below, click "New Secret"
3. Enter the **Key** and **Value** exactly as shown
4. Click "Add Secret"

---

### ✅ **COPY THESE SECRETS TO REPLIT:**

#### 1. DATABASE_URL (Most Important!)
```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### 2. JWT_SECRET (Required for Authentication)
```
Key: JWT_SECRET
Value: homa-healthcare-super-secret-jwt-key-minimum-32-characters-long-2024
```

#### 3. JWT_EXPIRES_IN
```
Key: JWT_EXPIRES_IN
Value: 24h
```

#### 4. PORT
```
Key: PORT
Value: 3000
```

#### 5. NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### 6. DB_HOST
```
Key: DB_HOST
Value: ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech
```

#### 7. DB_PORT
```
Key: DB_PORT
Value: 5432
```

#### 8. DB_NAME
```
Key: DB_NAME
Value: neondb
```

#### 9. DB_USER
```
Key: DB_USER
Value: neondb_owner
```

#### 10. DB_PASSWORD
```
Key: DB_PASSWORD
Value: npg_KgY1jcShHne2
```

#### 11. UPI_ID (Optional - for payments)
```
Key: UPI_ID
Value: homahealthcare@paytm
```

#### 12. MERCHANT_NAME (Optional)
```
Key: MERCHANT_NAME
Value: Homa Healthcare
```

#### 13. MERCHANT_CODE (Optional)
```
Key: MERCHANT_CODE
Value: HOMA001
```

---

## STEP 2: Upload Your Project to Replit

### Option A: Import from GitHub
1. Go to https://replit.com
2. Click "+ Create Repl"
3. Select "Import from GitHub"
4. Paste your GitHub repository URL
5. Click "Import from GitHub"

### Option B: Upload Files
1. Create new Node.js Repl
2. Upload all your project files
3. Make sure `backend/` folder structure is maintained

---

## STEP 3: Verify Files Are Present

Make sure these files exist in your Replit:

```
✅ backend/server.js
✅ backend/config/database.js
✅ backend/models/User.js
✅ backend/routes/auth.js
✅ package.json
✅ .replit (created automatically)
✅ replit.nix
```

---

## STEP 4: Run Your Project

1. Click the green **▶ Run** button
2. Wait for npm install to complete
3. Server should start on port 3000
4. Look for these success messages:
   ```
   ✅ Database connection established successfully
   ✅ Database connected successfully
   🚀 Homa Healthcare Server running on port 3000
   ```

---

## STEP 5: Test Your API

### Test Health Endpoint:
Click the URL that appears (something like `https://your-repl-name.repl.co`)

Add `/health` to the URL:
```
https://your-repl-name.repl.co/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Homa Healthcare Payment System is running",
  "timestamp": "2025-10-12T...",
  "port": "3000"
}
```

### Test Login:
Use Thunder Client or Postman:

**Endpoint:** `POST https://your-repl-name.repl.co/api/auth/login`

**Body (JSON):**
```json
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
      "full_name": "Dr. Nehru Admin",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🔧 TROUBLESHOOTING

### Problem: "Cannot connect to database"
**Solution:** 
- Check that `DATABASE_URL` secret is added correctly
- Verify no extra spaces in the connection string
- Make sure Neon database is active (check Neon console)

### Problem: "Port 3000 already in use"
**Solution:** 
- Replit will handle this automatically
- Your app will be accessible via the Replit URL

### Problem: "Module not found"
**Solution:** 
- Click "Shell" tab
- Run: `npm install`
- Click Run again

### Problem: "JWT Secret not found"
**Solution:** 
- Verify `JWT_SECRET` is added to Secrets
- Restart the Repl

---

## 📝 QUICK COPY-PASTE FOR REPLIT SECRETS

**Copy this entire block and paste each line into Replit Secrets:**

```
DATABASE_URL = postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET = homa-healthcare-super-secret-jwt-key-minimum-32-characters-long-2024

JWT_EXPIRES_IN = 24h

PORT = 3000

NODE_ENV = production

DB_HOST = ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech

DB_PORT = 5432

DB_NAME = neondb

DB_USER = neondb_owner

DB_PASSWORD = npg_KgY1jcShHne2

UPI_ID = homahealthcare@paytm

MERCHANT_NAME = Homa Healthcare

MERCHANT_CODE = HOMA001
```

---

## 🎯 TEST CREDENTIALS

### Admin User (Pre-created in Database):
```
Email: admin@homaclinic.com
Password: admin123
Role: admin
```

### Test Patient User (Create via Sign Up):
```
Email: test@patient.com
Password: password123
Full Name: Test Patient
Phone: 9876543299
Role: patient
```

---

## 📊 YOUR API ENDPOINTS

Base URL: `https://your-repl-name.repl.co`

### Authentication:
- `POST /api/auth/register` - Sign up new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Dashboard:
- `GET /api/dashboard/stats` - Get user statistics

### Payments:
- `POST /api/payments/generate-upi` - Generate UPI link
- `POST /api/payments/confirm-payment` - Confirm payment
- `GET /api/payments/history` - Get payment history

### Users:
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile

### Appointments:
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get appointments

---

## ✅ SUCCESS CHECKLIST

- [ ] All 13 environment variables added to Replit Secrets
- [ ] Project uploaded to Replit
- [ ] Clicked Run button
- [ ] Server started successfully (check console for ✅ messages)
- [ ] Health endpoint returns "OK" status
- [ ] Login with admin credentials works
- [ ] JWT token received

---

## 🚀 YOU'RE DONE!

Your Homa Healthcare Payment System is now live on Replit!

**Share your app URL:** `https://your-repl-name.repl.co`

---

## 📱 NEXT STEPS

1. **Test Sign Up** - Create a new patient account
2. **Test Login** - Login with new account
3. **Test Dashboard** - View statistics
4. **Test Payments** - Generate UPI link
5. **Build Frontend** - Create React UI (optional)
6. **Share with Users** - Your system is ready!

---

## 🔗 IMPORTANT LINKS

- Neon Console: https://console.neon.tech
- Your Database: `neondb`
- Connection String: Already added to secrets ✅
- Admin Email: admin@homaclinic.com
- Admin Password: admin123

---

## 💡 PRO TIPS

1. **Always keep your Repl running** - Enable "Always On" in Replit settings (paid feature)
2. **Monitor logs** - Check the Console tab for any errors
3. **Test regularly** - Use the health endpoint to verify uptime
4. **Backup database** - Export data from Neon console regularly
5. **Change passwords** - Update JWT_SECRET and admin password in production

---

**🎉 Your healthcare payment system is production-ready!**

