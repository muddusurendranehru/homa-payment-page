# 🔍 Check Database in Replit3 - SQL Steps

## 🎯 **How to Check Your Database Tables in Replit3**

---

## **METHOD 1: Use Replit Shell (Recommended)**

### **STEP 1: Open Replit Shell**
Click on the **Shell** tab in Replit (bottom of the screen)

### **STEP 2: Connect to Database**
```bash
psql "postgresql://neondb_owner:npg_KgY1jcShHne2@ep-cold-wildflower-adibenmi-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### **STEP 3: Run SQL Commands**

#### ✅ **Check All Tables**
```sql
\dt
```

**Expected Output:**
```
         List of relations
 Schema |   Name   | Type  |    Owner    
--------+----------+-------+-------------
 public | users    | table | neondb_owner
 public | payments | table | neondb_owner
```

#### ✅ **Check Users Table Structure**
```sql
\d users
```

**Expected Output:**
```
                            Table "public.users"
   Column   |           Type           | Nullable |              Default              
------------+--------------------------+----------+-----------------------------------
 id         | integer                  | not null | nextval('users_id_seq'::regclass)
 email      | character varying(255)   | not null | 
 password   | character varying(255)   | not null | 
 created_at | timestamp                |          | CURRENT_TIMESTAMP
```

#### ✅ **Check Payments Table Structure**
```sql
\d payments
```

**Expected Output:**
```
                              Table "public.payments"
   Column    |           Type           | Nullable |                Default                
-------------+--------------------------+----------+---------------------------------------
 id          | integer                  | not null | nextval('payments_id_seq'::regclass)
 user_id     | integer                  |          | 
 amount      | numeric(10,2)            | not null | 
 description | text                     |          | 
 status      | character varying(50)    |          | 'completed'::character varying
 created_at  | timestamp                |          | CURRENT_TIMESTAMP
```

#### ✅ **Check All Users**
```sql
SELECT * FROM users;
```

#### ✅ **Check All Payments**
```sql
SELECT * FROM payments;
```

#### ✅ **Check Users with Payment Count**
```sql
SELECT u.id, u.email, COUNT(p.id) as payment_count
FROM users u
LEFT JOIN payments p ON u.id = p.user_id
GROUP BY u.id, u.email;
```

#### ✅ **Exit psql**
```sql
\q
```

---

## **METHOD 2: Create a Check Script**

### **Create `check-db.js` file in Replit:**

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');

    // Check if tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📊 TABLES:');
    tables.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

    // Check users table
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 USERS: ${usersCount.rows[0].count} users`);

    const users = await pool.query('SELECT id, email, created_at FROM users');
    users.rows.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}`);
    });

    // Check payments table
    const paymentsCount = await pool.query('SELECT COUNT(*) FROM payments');
    console.log(`\n💳 PAYMENTS: ${paymentsCount.rows[0].count} payments`);

    const payments = await pool.query(`
      SELECT p.id, p.amount, p.description, p.status, u.email 
      FROM payments p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    
    payments.rows.forEach(payment => {
      console.log(`  - Payment #${payment.id}: $${payment.amount} - ${payment.description} (${payment.email})`);
    });

    console.log('\n✅ Database check complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
```

### **Run the script:**
```bash
node check-db.js
```

---

## **METHOD 3: Using Neon Dashboard**

### **STEP 1: Go to Neon Console**
1. Visit https://console.neon.tech
2. Login to your account
3. Select your database

### **STEP 2: Open SQL Editor**
Click on **SQL Editor** tab

### **STEP 3: Run Queries**

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check users
SELECT * FROM users;

-- Check payments
SELECT * FROM payments;

-- Check users with payment summary
SELECT 
  u.id,
  u.email,
  COUNT(p.id) as total_payments,
  COALESCE(SUM(p.amount), 0) as total_amount
FROM users u
LEFT JOIN payments p ON u.id = p.user_id
GROUP BY u.id, u.email
ORDER BY u.id;
```

---

## **METHOD 4: Quick Verify via API**

### **Check Users Count**
Create `test-db.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function quickCheck() {
  // Check tables exist
  const tables = await pool.query(`
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'payments')
  `);
  
  console.log(`Tables found: ${tables.rows[0].count}/2`);
  
  // Check users
  const users = await pool.query('SELECT COUNT(*) FROM users');
  console.log(`Users: ${users.rows[0].count}`);
  
  // Check payments
  const payments = await pool.query('SELECT COUNT(*) FROM payments');
  console.log(`Payments: ${payments.rows[0].count}`);
  
  await pool.end();
}

quickCheck();
```

Run:
```bash
node test-db.js
```

---

## **USEFUL SQL QUERIES FOR REPLIT3**

### **1. Check if Tables Exist**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### **2. Count All Users**
```sql
SELECT COUNT(*) as total_users FROM users;
```

### **3. Count All Payments**
```sql
SELECT COUNT(*) as total_payments FROM payments;
```

### **4. Show Recent Users**
```sql
SELECT id, email, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```

### **5. Show Recent Payments with User Info**
```sql
SELECT 
  p.id,
  p.amount,
  p.description,
  p.status,
  u.email as user_email,
  p.created_at
FROM payments p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
```

### **6. Total Revenue per User**
```sql
SELECT 
  u.email,
  COUNT(p.id) as payment_count,
  SUM(p.amount) as total_amount
FROM users u
LEFT JOIN payments p ON u.id = p.user_id
GROUP BY u.email
ORDER BY total_amount DESC;
```

### **7. Check Database Schema**
```sql
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

### **8. Check Indexes**
```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public';
```

### **9. Delete All Data (CAREFUL!)**
```sql
-- Delete all payments first (foreign key)
DELETE FROM payments;

-- Then delete all users
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
```

### **10. Drop All Tables (CAREFUL!)**
```sql
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

---

## **QUICK VERIFICATION CHECKLIST**

After deploying to Replit3, verify:

```bash
# 1. Connect to database
psql "YOUR_DATABASE_URL"

# 2. Check tables exist
\dt

# Should show:
#  - users
#  - payments

# 3. Check users table
\d users

# Should have columns:
#  - id (serial primary key)
#  - email (varchar unique)
#  - password (varchar)
#  - created_at (timestamp)

# 4. Check payments table
\d payments

# Should have columns:
#  - id (serial primary key)
#  - user_id (integer references users)
#  - amount (decimal)
#  - description (text)
#  - status (varchar default 'completed')
#  - created_at (timestamp)

# 5. Check data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM payments;

# 6. Exit
\q
```

---

## **TROUBLESHOOTING**

### **Problem: "psql: command not found"**

**Solution 1:** Install psql in Replit Shell:
```bash
nix-env -iA nixpkgs.postgresql
```

**Solution 2:** Use Node.js script instead (create `check-db.js` above)

### **Problem: "No tables found"**

**Solution:** Tables not created yet. Make sure your server ran at least once.
```bash
# In Replit Shell:
node server.js

# Should see: "✅ Database ready!"
```

### **Problem: "Connection refused"**

**Solution:** Check your DATABASE_URL in Secrets:
1. Must include `?sslmode=require`
2. Must be from Neon PostgreSQL
3. Must be valid connection string

---

## **EXPECTED OUTPUT AFTER DEPLOYMENT**

### **Tables:**
```
✅ users
✅ payments
```

### **Users table columns:**
```
✅ id (serial)
✅ email (varchar)
✅ password (varchar - hashed)
✅ created_at (timestamp)
```

### **Payments table columns:**
```
✅ id (serial)
✅ user_id (integer - foreign key)
✅ amount (decimal)
✅ description (text)
✅ status (varchar - default: 'completed')
✅ created_at (timestamp)
```

---

## **SUMMARY**

**Easiest way to check database in Replit3:**

1. **Open Shell**
2. **Run:** `psql "YOUR_DATABASE_URL"`
3. **Check tables:** `\dt`
4. **Check data:** `SELECT * FROM users;`
5. **Exit:** `\q`

**That's it!** 🎉

---

**Now you can verify your database is working correctly!** ✅

