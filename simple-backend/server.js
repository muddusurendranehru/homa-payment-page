// Simple Healthcare Payment Backend
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'simple-secret-key';

// Initialize Database
const initDatabase = async () => {
  try {
    // Users table - just email and password
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments table - simple payment records
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database ready!');
  } catch (error) {
    console.error('Database error:', error);
  }
};

// Middleware - Check token
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Login required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be 6+ characters' });
    }

    // Check if exists
    const exists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and save
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Registration successful!', token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful!', token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ADD PAYMENT
app.post('/api/payments', auth, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const result = await pool.query(
      'INSERT INTO payments (user_id, amount, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, amount, description || 'Payment', 'completed']
    );

    res.json({ 
      message: '✅ Payment successful!', 
      payment: result.rows[0] 
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

// GET ALL PAYMENTS
app.get('/api/payments', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// GET USER INFO
app.get('/api/user', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ================================
// UPI PAYMENT WITH QR CODE
// ================================

const UPI_ID = '99637219992@ybl';
const MERCHANT_NAME = 'Homa Healthcare';

// Generate unique payment ID
function generatePaymentId() {
  return 'PMT' + Date.now() + Math.floor(Math.random() * 1000);
}

// Create UPI payment with QR code
app.post('/api/create-upi-payment', auth, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    // Generate unique payment ID
    const payment_id = generatePaymentId();

    // Create UPI payment link that opens UPI apps
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(description + '-' + payment_id)}`;

    // Generate QR code from UPI link
    const qrCode = await QRCode.toDataURL(upiLink);

    // Save as pending payment in database
    await pool.query(
      'INSERT INTO payments (user_id, amount, description, transaction_id, status) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, amount, description || 'Payment', payment_id, 'pending']
    );

    res.json({
      success: true,
      payment_id: payment_id,
      upi_id: UPI_ID,
      merchant_name: MERCHANT_NAME,
      amount: amount,
      upi_link: upiLink,
      qr_code: qrCode,
      message: '🎯 QR code generated! Scan with any UPI app to pay to ' + UPI_ID,
      instructions: {
        mobile: 'Click the Pay button to open UPI app directly',
        desktop: 'Scan the QR code with your phone camera or UPI app'
      }
    });

  } catch (error) {
    console.error('Create UPI payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Confirm payment after customer pays
app.post('/api/confirm-payment', auth, async (req, res) => {
  try {
    const { payment_id } = req.body;

    if (!payment_id) {
      return res.status(400).json({ error: 'Payment ID required' });
    }

    // Update payment status to pending verification
    const result = await pool.query(
      'UPDATE payments SET status = $1 WHERE transaction_id = $2 AND user_id = $3 RETURNING *',
      ['pending_verification', payment_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      message: '🎉 Thank you! Payment confirmation received. We will verify and update you shortly!',
      payment: result.rows[0],
      next_steps: 'Admin will verify your payment and update the status within 24 hours.'
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get pending payments (for admin)
app.get('/api/pending-payments', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.email as user_email
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.status IN ('pending', 'pending_verification')
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      payments: result.rows
    });

  } catch (error) {
    console.error('Fetch pending payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Verify payment (admin manually verifies)
app.post('/api/verify-payment', auth, async (req, res) => {
  try {
    const { payment_id } = req.body;

    if (!payment_id) {
      return res.status(400).json({ error: 'Payment ID required' });
    }

    const result = await pool.query(
      'UPDATE payments SET status = $1 WHERE transaction_id = $2 RETURNING *',
      ['completed', payment_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      message: '✅ Payment verified successfully',
      payment: result.rows[0]
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// ================================
// DEBUG ENDPOINT
// ================================

// Debug endpoint to check database connection
app.get('/api/debug/check-db', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as pg_version,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM payments) as total_payments
    `);
    
    res.json({
      success: true,
      connected: true,
      connected_to: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0],
      upi_id: UPI_ID,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      connected: false,
      error: error.message,
      hint: 'Make sure DATABASE_URL is set in Replit Secrets and tables exist'
    });
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initDatabase();
});

module.exports = app;

