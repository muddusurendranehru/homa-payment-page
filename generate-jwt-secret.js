// Generate a secure JWT secret
const crypto = require('crypto');

// Generate a random 64-character secret
const secret = crypto.randomBytes(32).toString('hex');
console.log('🔐 Your JWT Secret:');
console.log(secret);
console.log('\n📋 Copy this to your Render environment variables:');
console.log(`JWT_SECRET=${secret}`);
