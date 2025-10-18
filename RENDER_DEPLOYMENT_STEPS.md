# 🚀 Render Deployment Guide

## **Step 1: Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

## **Step 2: Deploy Backend**
1. **Click**: "New +" → "Web Service"
2. **Connect Repository**: Select your GitHub repo
3. **Configure**:
   - **Name**: `payment-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node working-backend.js`
   - **Plan**: Free

## **Step 3: Environment Variables**
Add these in Render dashboard:
```
DATABASE_URL=postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/payment-system-clean?sslmode=require&channel_binding=require
PORT=10000
NODE_ENV=production
```

## **Step 4: Deploy Frontend**
1. **Click**: "New +" → "Static Site"
2. **Connect Repository**: Same GitHub repo
3. **Configure**:
   - **Name**: `payment-frontend`
   - **Build Command**: `echo "Static site"`
   - **Publish Directory**: `/`
   - **Root Directory**: `/`

## **Step 5: Update Frontend URLs**
Update `test-frontend.html` to use your Render backend URL:
```javascript
// Change from:
'http://localhost:3037/api/signup'

// To:
'https://your-backend-name.onrender.com/api/signup'
```

## **Step 6: Test Deployment**
1. **Backend URL**: `https://your-backend-name.onrender.com`
2. **Frontend URL**: `https://your-frontend-name.onrender.com`
3. **Test**: Complete payment flow

## **🎯 Render Advantages:**
- ✅ **Free Tier**: No cost for small apps
- ✅ **Auto Deploy**: GitHub integration
- ✅ **SSL**: HTTPS by default
- ✅ **Custom Domains**: Available
- ✅ **Easy Setup**: 5 minutes deployment
- ✅ **Node.js Support**: Perfect for your stack

## **📱 Mobile Testing:**
1. Open frontend URL on mobile
2. Test signup/login
3. Create payment
4. Scan QR code
5. Test UPI link
6. Mark as paid

## **🔧 Troubleshooting:**
- **Build Fails**: Check package.json
- **Database Error**: Verify DATABASE_URL
- **CORS Error**: Check frontend URL
- **Port Error**: Use PORT=10000

## **🚀 Production Ready:**
- **HTTPS**: Secure connections
- **Database**: Neon PostgreSQL
- **Mobile**: Responsive design
- **UPI**: Working payment links
- **QR Code**: Mobile scanning
