// server/service-loader-debug.js
// 🔍 Test which GoogleAdsService the server actually loads

require('dotenv').config();

console.log('🔍 ===== GOOGLE ADS SERVICE LOADER DEBUG =====\n');

// Test 1: Load the service exactly like livePerformanceService does
console.log('🧪 Testing service load from livePerformanceService path...');
try {
  const googleAdsServiceFromLive = require('./src/services/integrations/googleAdsService');
  console.log('✅ Loaded googleAdsService from: ./src/services/integrations/googleAdsService');
  console.log('📊 Service connection status:', googleAdsServiceFromLive.getConnectionStatus());

  // Force a connection test
  googleAdsServiceFromLive.testConnectionLive().then(result => {
    console.log('🔍 Live connection test result:', result);
  }).catch(err => {
    console.error('❌ Live connection test failed:', err.message);
  });

} catch (error) {
  console.error('❌ Failed to load from livePerformanceService path:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Check if there are any OLD imports still active
console.log('🔍 Checking for old service imports...');

// Test the module cache
const moduleCache = require.cache;
const googleAdsModules = Object.keys(moduleCache).filter(key => key.includes('googleAdsService'));

console.log('📦 GoogleAdsService modules in cache:');
googleAdsModules.forEach(module => {
  console.log(`  - ${module}`);
});

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: Manually test the exact initialization logic
console.log('🧪 Testing GoogleAdsService initialization logic manually...');

// Simulate the exact check from the service
const hasClientId = !!process.env.GOOGLE_ADS_CLIENT_ID;
const hasClientSecret = !!process.env.GOOGLE_ADS_CLIENT_SECRET;
const hasDeveloperToken = !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

console.log('Environment Check Results:');
console.log(`  CLIENT_ID: ${hasClientId ? '✅ PRESENT' : '❌ MISSING'}`);
console.log(`  CLIENT_SECRET: ${hasClientSecret ? '✅ PRESENT' : '❌ MISSING'}`);
console.log(`  DEVELOPER_TOKEN: ${hasDeveloperToken ? '✅ PRESENT' : '❌ MISSING'}`);

// This is the exact condition from the service
if (!process.env.GOOGLE_ADS_CLIENT_ID ||
    !process.env.GOOGLE_ADS_CLIENT_SECRET ||
    !process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
  console.log('❌ Service WOULD enter test mode based on this condition');
} else {
  console.log('✅ Service SHOULD work normally based on this condition');
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 4: Check if service is being instantiated multiple times
console.log('🔍 Checking service instantiation...');

// Clear module cache and reload fresh
delete require.cache[require.resolve('./src/services/integrations/googleAdsService')];

console.log('🧪 Loading fresh GoogleAdsService instance...');
const FreshGoogleAdsService = require('./src/services/integrations/googleAdsService');

setTimeout(() => {
  console.log('📊 Fresh service status:', FreshGoogleAdsService.getConnectionStatus());
}, 1000);

console.log('\n🔍 ===== DEBUG COMPLETE =====');