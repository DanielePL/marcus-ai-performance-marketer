// server/server-env-debug.js
// 🔍 Debug Environment Variables in Server Context

// Test 1: Load dotenv exactly like the server does
require('dotenv').config();

console.log('🔍 ===== SERVER ENVIRONMENT DEBUG =====\n');

// Test 2: Show working directory
console.log('📁 Current Working Directory:', process.cwd());
console.log('📁 __dirname:', __dirname);
console.log('');

// Test 3: Check all Google Ads environment variables
console.log('📋 Google Ads Environment Check:');
console.log('GOOGLE_ADS_DEVELOPER_TOKEN:', process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_ADS_CLIENT_ID:', process.env.GOOGLE_ADS_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_ADS_CLIENT_SECRET:', process.env.GOOGLE_ADS_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_ADS_REFRESH_TOKEN:', process.env.GOOGLE_ADS_REFRESH_TOKEN ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_ADS_CUSTOMER_ID:', process.env.GOOGLE_ADS_CUSTOMER_ID ? '✅ Set' : '❌ Missing');
console.log('');

// Test 4: Show actual values (first few characters)
console.log('📊 Actual Values Preview:');
console.log('GOOGLE_ADS_DEVELOPER_TOKEN:', process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.substring(0, 10) + '...' || 'MISSING');
console.log('GOOGLE_ADS_CLIENT_ID:', process.env.GOOGLE_ADS_CLIENT_ID?.substring(0, 15) + '...' || 'MISSING');
console.log('GOOGLE_ADS_CLIENT_SECRET:', process.env.GOOGLE_ADS_CLIENT_SECRET?.substring(0, 10) + '...' || 'MISSING');
console.log('GOOGLE_ADS_REFRESH_TOKEN:', process.env.GOOGLE_ADS_REFRESH_TOKEN?.substring(0, 15) + '...' || 'MISSING');
console.log('GOOGLE_ADS_CUSTOMER_ID:', process.env.GOOGLE_ADS_CUSTOMER_ID || 'MISSING');
console.log('');

// Test 5: Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPaths = [
  '.env',
  './server/.env',
  '../.env',
  path.join(__dirname, '.env'),
  path.join(__dirname, '../.env')
];

console.log('📁 .env File Search:');
envPaths.forEach(envPath => {
  const exists = fs.existsSync(envPath);
  console.log(`${exists ? '✅' : '❌'} ${envPath} ${exists ? 'EXISTS' : 'NOT FOUND'}`);
});
console.log('');

// Test 6: Test Google Ads Service directly
console.log('🧪 Testing GoogleAdsService directly...');
try {
  const GoogleAdsService = require('./src/services/integrations/googleAdsService');
  console.log('✅ GoogleAdsService loaded successfully');

  // Test the exact check that causes test mode
  if (!process.env.GOOGLE_ADS_CLIENT_ID ||
      !process.env.GOOGLE_ADS_CLIENT_SECRET ||
      !process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    console.log('❌ GoogleAdsService would enter test mode - missing credentials');
  } else {
    console.log('✅ GoogleAdsService should work - all credentials present');
  }

} catch (error) {
  console.error('❌ Error loading GoogleAdsService:', error.message);
}

console.log('\n🔍 ===== DEBUG COMPLETE =====');