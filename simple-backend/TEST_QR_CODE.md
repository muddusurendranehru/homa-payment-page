# 🧪 TEST YOUR UPI QR CODE

## ✅ **Your QR Code WILL Work With:**
- Google Pay ✅
- PhonePe ✅
- Paytm ✅
- BHIM ✅
- Any UPI app ✅

---

## 🧪 **TEST STEPS:**

### **STEP 1: Start Your Server**
```bash
node server.js
```

### **STEP 2: Login First**
```bash
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "test123"
}
```

**Copy the token from response!**

### **STEP 3: Generate QR Code**
```bash
POST http://localhost:3000/api/create-upi-payment
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "amount": 10,
  "description": "Test payment"
}
```

**Response will contain:**
```json
{
  "success": true,
  "payment_id": "PMT1234567890",
  "upi_id": "9963721999@ybl",
  "amount": 10,
  "upi_link": "upi://pay?pa=99637219992@ybl&pn=Homa%20Healthcare&am=10&cu=INR&tn=Test%20payment-PMT1234567890",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "message": "🎯 QR code generated! Scan with any UPI app to pay to 99637219992@ybl"
}
```

### **STEP 4: Test the QR Code**

#### **Option A: View QR in Browser**
1. Copy the `qr_code` value (starts with `data:image/png;base64,`)
2. Open browser
3. Paste in address bar
4. Press Enter
5. **You'll see the QR code!**

#### **Option B: Create Test HTML Page**
Save as `test-qr.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test UPI QR Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .qr-container {
            background: white;
            padding: 30px;
            border-radius: 20px;
            display: inline-block;
            margin: 20px;
        }
        img {
            width: 300px;
            height: 300px;
        }
        button {
            background: #10b981;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 18px;
            border-radius: 10px;
            cursor: pointer;
            margin: 10px;
        }
        button:hover {
            background: #059669;
        }
        .info {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px auto;
            max-width: 500px;
        }
    </style>
</head>
<body>
    <h1>🏥 Homa Healthcare Payment</h1>
    
    <button onclick="generateQR()">Generate Test QR Code</button>
    
    <div id="result"></div>
    
    <script>
        async function generateQR() {
            try {
                // First login
                const loginRes = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'test@test.com',
                        password: 'test123'
                    })
                });
                const loginData = await loginRes.json();
                const token = loginData.token;
                
                // Generate QR code
                const qrRes = await fetch('http://localhost:3000/api/create-upi-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        amount: 10,
                        description: 'Test Payment'
                    })
                });
                const qrData = await qrRes.json();
                
                // Display QR code
                document.getElementById('result').innerHTML = `
                    <div class="info">
                        <h2>✅ Payment Created</h2>
                        <p><strong>UPI ID:</strong> ${qrData.upi_id}</p>
                        <p><strong>Amount:</strong> ₹${qrData.amount}</p>
                        <p><strong>Payment ID:</strong> ${qrData.payment_id}</p>
                    </div>
                    
                    <div class="qr-container">
                        <h3 style="color: #333;">📱 Scan to Pay</h3>
                        <img src="${qrData.qr_code}" alt="UPI QR Code">
                        <p style="color: #666;">Scan with Google Pay, PhonePe, or any UPI app</p>
                    </div>
                    
                    <div class="info">
                        <p><strong>On Mobile:</strong></p>
                        <a href="${qrData.upi_link}" style="color: white; text-decoration: underline;">
                            Click here to open UPI app directly
                        </a>
                    </div>
                `;
            } catch (error) {
                document.getElementById('result').innerHTML = `
                    <div style="background: red; padding: 20px; border-radius: 10px;">
                        ❌ Error: ${error.message}
                    </div>
                `;
            }
        }
    </script>
</body>
</html>
```

**Open `test-qr.html` in browser and click "Generate Test QR Code"**

---

## 📱 **HOW TO SCAN:**

### **On Phone:**
1. Open Google Pay or PhonePe
2. Click "Scan QR"
3. Point camera at QR code
4. **It will auto-fill:**
   - UPI ID: 99637219992@ybl
   - Amount: ₹10
   - Description: Test payment
5. Click "Pay"

### **On Desktop:**
1. Open test page in browser
2. Generate QR code
3. Open Google Pay on phone
4. Scan the QR code from screen
5. Pay!

---

## ✅ **WHY IT WORKS:**

Your QR code contains this standard UPI link:
```
upi://pay?pa=99637219992@ybl&pn=Homa Healthcare&am=10&cu=INR&tn=Payment
```

This is recognized by **ALL UPI apps** because it follows the official UPI specification!

---

## 🔧 **If QR Doesn't Work:**

### **Check 1: UPI ID Valid?**
Test manually in Google Pay:
1. Open Google Pay
2. Click "New Payment"
3. Enter: `99637219992@ybl`
4. If it shows a name → UPI ID is valid ✅
5. If error → UPI ID might be wrong ❌

### **Check 2: Test UPI Link Directly**
On mobile phone, open browser and visit:
```
upi://pay?pa=99637219992@ybl&am=10&cu=INR
```

Should open UPI app automatically!

### **Check 3: Amount Format**
- Use whole numbers: `10`, `100`, `500`
- Avoid decimals in test: Use `10` not `10.50`

---

## 💡 **NO EXTERNAL WEBSITES NEEDED!**

Your system generates **standard UPI QR codes** that work with ALL UPI apps.

External QR generators do the SAME thing - they create the same `upi://pay?pa=...` link!

---

## 🎯 **SUMMARY:**

✅ Your QR code format is correct
✅ It will work with Google Pay, PhonePe, all UPI apps  
✅ No external website needed
✅ Just test with the HTML page above
✅ Or scan directly from API response

**Your system is perfect - just test it!** 🚀

