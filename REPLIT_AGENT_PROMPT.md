# 🏥 SIMPLE HEALTHCARE PAYMENT SYSTEM - REPLIT DEPLOYMENT PROMPT

Copy and paste this ENTIRE prompt to Replit Agent:

---

## 📋 BUILD REQUEST:

Create a **simple healthcare payment system** with Node.js backend and React frontend.

## 🎯 REQUIREMENTS:

### **Backend (Express + PostgreSQL + Razorpay):**

1. **User Authentication:**
   - POST `/api/register` - Sign up with email, password, confirmPassword
   - POST `/api/login` - Login with email, password
   - Returns JWT token (valid 7 days)

2. **Payment Endpoints:**
   - POST `/api/create-order` - Create Razorpay order (requires auth)
   - POST `/api/payments` - Save payment to database (requires auth)
   - GET `/api/payments` - Get user's payment history (requires auth)

3. **User Endpoints:**
   - GET `/api/user` - Get user info (requires auth)

4. **Database Tables:**
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE payments (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id),
     amount DECIMAL(10, 2) NOT NULL,
     description TEXT,
     razorpay_order_id VARCHAR(255),
     razorpay_payment_id VARCHAR(255),
     payment_method VARCHAR(50) DEFAULT 'razorpay',
     status VARCHAR(50) DEFAULT 'completed',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### **Frontend (React):**

1. **Three Views:**
   - **Registration Page**: Email, Password, Confirm Password fields + "Sign Up" button
   - **Login Page**: Email, Password fields + "Login" button
   - **Dashboard**: Payment form (amount, description) + "Pay Now" button + Payment history list

2. **Features:**
   - Professional healthcare theme (blue/cyan gradient)
   - Responsive design
   - Error/success messages
   - Loading states
   - Logout button

### **Environment Variables (Set in Replit Secrets):**
```
DATABASE_URL = postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-a86benmi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET = simple-healthcare-secret-key-2024

PORT = 3000

RAZORPAY_KEY_ID = rzp_test_RSamXhQljWw5Pi

RAZORPAY_KEY_SECRET = [Get from Razorpay dashboard]
```

### **Key Technical Details:**

1. **Password Hashing**: Use bcryptjs (10 salt rounds)
2. **JWT**: Sign with JWT_SECRET, expire in 7 days
3. **CORS**: Enable for all origins in development
4. **Razorpay Integration**: 
   - Create order with amount in paise (amount * 100)
   - Currency: INR
   - Save razorpay_order_id and razorpay_payment_id to database
   - Handle successful payment verification
5. **Database**: Auto-create tables on server startup if they don't exist
6. **Authentication Middleware**: Verify JWT token from Authorization header

### **Backend Dependencies:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "razorpay": "^2.9.2",
    "dotenv": "^16.3.1"
  }
}
```

### **Frontend Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0"
  }
}
```

### **API Response Examples:**

**Registration Success:**
```json
{
  "message": "Registration successful!",
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Login Success:**
```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Create Order Success:**
```json
{
  "orderId": "order_xxxxx",
  "amount": 50000,
  "currency": "INR",
  "key": "rzp_test_RSamXhQljWw5Pi"
}
```

**Payment Save Success:**
```json
{
  "message": "✅ Payment successful!",
  "payment": {
    "id": 1,
    "user_id": 1,
    "amount": "500.00",
    "description": "Consultation fee",
    "razorpay_order_id": "order_xxxxx",
    "razorpay_payment_id": "pay_xxxxx",
    "status": "completed",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Payment History:**
```json
[
  {
    "id": 1,
    "amount": "500.00",
    "description": "Consultation fee",
    "razorpay_order_id": "order_xxxxx",
    "razorpay_payment_id": "pay_xxxxx",
    "payment_method": "razorpay",
    "status": "completed",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
]
```

### **Error Handling:**
- Validation errors: 400 Bad Request
- Authentication errors: 401 Unauthorized  
- Database errors: 500 Internal Server Error
- Missing fields: Return specific error message
- All errors return: `{ "error": "Error message" }`

### **UI/UX Requirements:**
- Clean, modern healthcare design
- Blue/cyan gradient color scheme (#667eea to #764ba2)
- Mobile responsive (works on all screen sizes)
- Clear error messages (red color)
- Success notifications (green color)
- Professional medical feel (use ❤️ or 🏥 icons)
- Loading spinners during API calls
- Smooth transitions and animations

### **Security Requirements:**
- Password must be 6+ characters
- Confirm password must match
- JWT token stored in localStorage
- Protected routes require valid token
- Passwords hashed before storing
- SQL injection prevention with parameterized queries

---

## 🎯 WHAT THIS APP DOES:

1. User signs up with email/password/confirmPassword
2. User logs in → Receives JWT token → Redirects to dashboard
3. Dashboard shows payment form and history
4. User enters payment amount (in rupees) and description
5. User clicks "Pay Now" → Creates Razorpay order
6. Razorpay checkout modal opens (TEST mode)
7. User completes payment with test card
8. Payment saves to PostgreSQL database with Razorpay IDs
9. User sees updated payment history
10. User can logout anytime

---

## 🧪 TEST CREDENTIALS (Razorpay Test Mode):

**Test Card:**
- Card Number: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Test UPI:**
- UPI ID: success@razorpay

---

## ✅ SUCCESS CRITERIA:

The app should:
- ✅ Allow user registration with email validation
- ✅ Allow user login with password verification
- ✅ Show dashboard only when authenticated
- ✅ Create Razorpay payment orders
- ✅ Open Razorpay checkout modal
- ✅ Save completed payments to database
- ✅ Display payment history with all details
- ✅ Handle errors gracefully with user-friendly messages
- ✅ Work in Razorpay TEST mode
- ✅ Be mobile responsive
- ✅ Have logout functionality
- ✅ Store JWT securely in localStorage
- ✅ Validate all inputs
- ✅ Be production-ready for deployment

---

## 📁 PROJECT STRUCTURE:

```
project/
├── server.js              (Backend - Express server)
├── package.json           (Backend dependencies)
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx        (Main React component)
│   │   ├── index.jsx      (React entry point)
│   │   └── index.css      (Global styles)
│   └── package.json       (Frontend dependencies)
└── .env                   (Use Replit Secrets instead)
```

---

## 🚀 IMPLEMENTATION STEPS:

1. **Create Backend:**
   - Initialize Express server
   - Connect to PostgreSQL database
   - Create tables if they don't exist
   - Implement authentication endpoints
   - Implement Razorpay integration
   - Implement payment endpoints
   - Add CORS and error handling

2. **Create Frontend:**
   - Setup React app
   - Create Registration component
   - Create Login component
   - Create Dashboard component
   - Integrate Razorpay checkout
   - Handle authentication state
   - Display payment history

3. **Test Everything:**
   - Test user registration
   - Test user login
   - Test payment creation
   - Test Razorpay checkout
   - Test payment saving
   - Test payment history display
   - Test logout

---

## 💡 IMPORTANT NOTES:

1. **Keep it SIMPLE** - Focus on core functionality only
2. **Use Replit Secrets** - Don't hardcode credentials
3. **Razorpay TEST mode** - Use test keys only
4. **Auto-create tables** - Check and create on startup
5. **Professional UI** - Healthcare-themed, clean design
6. **Mobile-friendly** - Responsive on all devices
7. **Error handling** - User-friendly error messages
8. **Loading states** - Show spinners during API calls
9. **Input validation** - Validate all user inputs
10. **Security first** - Hash passwords, validate JWT

---

## 🎨 UI COLOR SCHEME:

```css
/* Primary Colors */
--primary-blue: #667eea
--primary-purple: #764ba2
--gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* Status Colors */
--success-green: #10b981
--error-red: #ef4444
--warning-yellow: #f59e0b

/* Neutral Colors */
--white: #ffffff
--light-gray: #f3f4f6
--dark-gray: #1f2937
--text-gray: #6b7280
```

---

## 🚀 START BUILDING NOW!

Create this simple, functional healthcare payment system. Make it:
- ✅ Clean and professional
- ✅ Easy to use
- ✅ Production-ready
- ✅ Mobile responsive
- ✅ Secure and reliable

**Build the complete application with both backend and frontend!**

---

## 🔧 REPLIT-SPECIFIC INSTRUCTIONS:

1. **Use Replit Secrets** for all environment variables
2. **Backend runs on port 3000**
3. **Frontend proxies to backend** via Replit's built-in proxy
4. **Database connection** uses SSL with Neon PostgreSQL
5. **Razorpay script** loads from CDN in frontend
6. **Auto-reload** enabled for development

---

**READY? START BUILDING THIS HEALTHCARE PAYMENT SYSTEM NOW!** 🏥💳🚀

