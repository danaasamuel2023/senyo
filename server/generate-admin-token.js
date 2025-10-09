#!/usr/bin/env node

// Generate Admin Token Script
// This script creates a new admin token for testing

const jwt = require('jsonwebtoken');

// Use the same JWT secret as the server
const JWT_SECRET = process.env.JWT_SECRET || 'DatAmArt';

// Admin user ID (you may need to update this)
const ADMIN_USER_ID = '68dc62fe523abdb9abca4641';

// Generate token
const token = jwt.sign(
  { 
    userId: ADMIN_USER_ID,
    role: 'admin' 
  },
  JWT_SECRET,
  { expiresIn: "7d" }
);

console.log('🔑 New Admin Token Generated:');
console.log('');
console.log(token);
console.log('');
console.log('📋 Token Details:');
console.log(`   User ID: ${ADMIN_USER_ID}`);
console.log(`   Role: admin`);
console.log(`   Expires: 7 days`);
console.log(`   Secret: ${JWT_SECRET.substring(0, 10)}...`);
console.log('');
console.log('✅ Use this token in your admin dashboard tests');
