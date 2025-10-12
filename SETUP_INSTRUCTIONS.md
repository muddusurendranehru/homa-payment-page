# 🚀 Quick Setup Instructions

## Step 1: Set Your Database Connection String

Create a file called `.env` in the `homa-healthcare-complete` folder with this content:

```bash
# Copy your EXACT Neon connection string here
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-cold-wildflower-a16827mi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Other settings
JWT_SECRET=homa-healthcare-secret-key-2024
PORT=3000
NODE_ENV=development

# Your Twilio and Telegram credentials
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
TELEGRAM_BOT_TOKEN=your-telegram-token
TELEGRAM_ADMIN_CHAT_ID=your-chat-id
UPI_ID=homahealthcare@paytm
MERCHANT_NAME=Homa Healthcare
```

## Step 2: Get Your Correct Connection String

1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Click "Connection Details"
4. Copy the FULL connection string (it should look like):
   ```
   postgresql://username:password@host/database?sslmode=require
   ```

## Step 3: Run Database Setup

Once you have the correct connection string in `.env`, run:

```bash
node setup-database.js
```

This will create all 8 tables:
- ✅ Users
- ✅ Patient Profiles  
- ✅ Doctors
- ✅ Appointments
- ✅ Payments (Heart of system!)
- ✅ Payment Sessions
- ✅ Notifications
- ✅ Payment Webhooks

## Step 4: Start the Server

```bash
npm start
```

Server will run on http://localhost:3000

## Step 5: Test the API

```bash
# Health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "password123",
    "full_name": "Test Patient",
    "phone": "9876543210"
  }'
```

## 🚀 Deploy to Vercel

1. Push code to GitHub (already done!)
2. Go to Vercel: https://vercel.com/homa-team/v0-supabase-payment
3. Connect GitHub repo: `homa-payment-page`
4. Add environment variables (DATABASE_URL, JWT_SECRET, etc.)
5. Deploy!

## 📝 Default Admin Login

After setup, you can login with:
- **Email**: admin@homaclinic.com
- **Password**: admin123

---

## ⚠️ Troubleshooting

### "Password authentication failed"
- Make sure you copied the FULL connection string from Neon
- Check that the password is correct (no extra spaces)
- Verify sslmode=require is at the end

### "Cannot find module"
```bash
npm install
```

### "Port already in use"
Change PORT in .env file to 3001 or another port

---

Need help? Check the README.md for full documentation!
