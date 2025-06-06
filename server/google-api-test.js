// 🔍 Google Ads API - Isolated Test
// File: server/google-api-test.js

const { GoogleAdsApi } = require('google-ads-api');
require('dotenv').config();

console.log('🚀 Testing Google Ads API...\n');

// 1. Check Environment Variables
console.log('📋 Environment Check:');
console.log('GOOGLE_ADS_DEVELOPER_TOKEN:', process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_ADS_CLIENT_ID:', process.env.GOOGLE_ADS_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_ADS_CLIENT_SECRET:', process.env.GOOGLE_ADS_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_ADS_REFRESH_TOKEN:', process.env.GOOGLE_ADS_REFRESH_TOKEN ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_ADS_CUSTOMER_ID:', process.env.GOOGLE_ADS_CUSTOMER_ID ? '✅ Set' : '❌ Missing');
console.log('');

// 2. Initialize Client (Basic Test)
try {
  console.log('🔧 Initializing Google Ads Client...');

  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  console.log('✅ Client initialized successfully');

  // 3. Test Authentication
  console.log('🔐 Testing Authentication...');

  const customer = client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });

  console.log('✅ Customer object created');

  // 4. Simple API Call Test
  console.log('📡 Testing API Call...');

  testApiCall(customer);

} catch (error) {
  console.error('❌ Error during initialization:');
  console.error('Error Type:', error.constructor.name);
  console.error('Error Message:', error.message);
  console.error('Error Code:', error.code);
  console.error('Full Error:', error);
}

// Simple API Test Function
async function testApiCall(customer) {
  try {
    // Simplest possible API call
    const response = await customer.query(`
      SELECT customer.id, customer.descriptive_name 
      FROM customer 
      LIMIT 1
    `);

    console.log('✅ API Call successful!');
    console.log('Response:', response);

  } catch (apiError) {
    console.error('❌ API Call failed:');
    console.error('Error Type:', apiError.constructor.name);
    console.error('Error Message:', apiError.message);
    console.error('Error Details:', apiError.details || 'No details');
    console.error('Error Code:', apiError.code || 'No code');

    // Additional debug info
    if (apiError.response) {
      console.error('Response Status:', apiError.response.status);
      console.error('Response Data:', apiError.response.data);
    }
  }
}

// Token Validation Check
function validateTokenFormat() {
  console.log('\n🔍 Token Format Validation:');

  const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  // Developer Token should be format: XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX
  if (devToken && devToken.includes('-')) {
    console.log('✅ Developer token format looks correct');
  } else {
    console.log('❌ Developer token format suspicious');
  }

  // Client ID should end with .googleusercontent.com
  if (clientId && clientId.includes('googleusercontent.com')) {
    console.log('✅ Client ID format looks correct');
  } else {
    console.log('❌ Client ID format suspicious');
  }

  // Refresh token should be long string
  if (refreshToken && refreshToken.length > 50) {
    console.log('✅ Refresh token length looks correct');
  } else {
    console.log('❌ Refresh token seems too short');
  }
}

validateTokenFormat();