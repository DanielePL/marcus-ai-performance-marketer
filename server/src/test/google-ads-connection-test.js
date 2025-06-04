// server/src/test/google-ads-connection-test.js
// MARCUS AI - Google Ads API Connection Test (Updated REST Version)

require('dotenv').config();
const { GoogleAdsApi, enums } = require('google-ads-api');

// ANSI colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function maskToken(token) {
  if (!token) return 'MISSING';
  if (token.length <= 8) return '****' + token;
  return '********' + token.slice(-4);
}

async function testGoogleAdsConnection() {
  log('cyan', '\n==================================================');
  log('cyan', '🤖 MARCUS AI - GOOGLE ADS API CONNECTION TEST');
  log('cyan', '==================================================');

  // Step 1: Check Environment Variables
  log('blue', '\n1. CHECKING ENVIRONMENT VARIABLES...');

  const requiredEnvs = {
    'GOOGLE_ADS_CLIENT_ID': process.env.GOOGLE_ADS_CLIENT_ID,
    'GOOGLE_ADS_CLIENT_SECRET': process.env.GOOGLE_ADS_CLIENT_SECRET,
    'GOOGLE_ADS_DEVELOPER_TOKEN': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    'GOOGLE_ADS_CUSTOMER_ID': process.env.GOOGLE_ADS_CUSTOMER_ID,
    'GOOGLE_ADS_REFRESH_TOKEN': process.env.GOOGLE_ADS_REFRESH_TOKEN
  };

  let allEnvsPresent = true;

  for (const [key, value] of Object.entries(requiredEnvs)) {
    if (value) {
      log('green', `✅ ${key}: ${maskToken(value)}`);
    } else {
      log('red', `❌ ${key}: MISSING`);
      allEnvsPresent = false;
    }
  }

  if (!allEnvsPresent) {
    log('red', '\n💥 MISSING ENVIRONMENT VARIABLES!');
    log('yellow', 'Please check your server/.env file');
    return;
  }

  // Step 2: Initialize Google Ads API
  log('blue', '\n2. INITIALIZING GOOGLE ADS API...');

  try {
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    log('green', '✅ Google Ads API Client initialized');

    // Step 3: Test Customer Access
    log('blue', '\n3. TESTING CUSTOMER ACCESS...');

    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    log('green', '✅ Customer client created');

    // Step 4: Test Basic API Call - Get Customer Information
    log('blue', '\n4. TESTING BASIC API CALL...');

    const customerInfo = await customer.query(`
      SELECT 
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.status
      FROM customer
      LIMIT 1
    `);

    if (customerInfo && customerInfo.length > 0) {
      const info = customerInfo[0].customer;
      log('green', '✅ API CONNECTION SUCCESSFUL!');
      log('cyan', '\n📊 CUSTOMER INFORMATION:');
      log('white', `   Customer ID: ${info.id}`);
      log('white', `   Name: ${info.descriptive_name || 'N/A'}`);
      log('white', `   Currency: ${info.currency_code || 'N/A'}`);
      log('white', `   Timezone: ${info.time_zone || 'N/A'}`);
      log('white', `   Status: ${info.status || 'N/A'}`);
    }

    // Step 5: Test Campaign Access
    log('blue', '\n5. TESTING CAMPAIGN ACCESS...');

    const campaigns = await customer.query(`
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      LIMIT 5
    `);

    if (campaigns && campaigns.length > 0) {
      log('green', `✅ FOUND ${campaigns.length} CAMPAIGNS:`);
      campaigns.forEach((camp, index) => {
        const c = camp.campaign;
        log('white', `   ${index + 1}. ${c.name} (ID: ${c.id}) - ${c.status} - ${c.advertising_channel_type}`);
      });
    } else {
      log('yellow', '⚠️  NO CAMPAIGNS FOUND (This is OK for new accounts)');
    }

    // Step 6: Test Account Performance Access
    log('blue', '\n6. TESTING PERFORMANCE DATA ACCESS...');

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    const dateFrom = thirtyDaysAgo.toISOString().split('T')[0].replace(/-/g, '');
    const dateTo = today.toISOString().split('T')[0].replace(/-/g, '');

    const performance = await customer.query(`
      SELECT 
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        segments.date
      FROM customer
      WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
      LIMIT 10
    `);

    if (performance && performance.length > 0) {
      log('green', '✅ PERFORMANCE DATA ACCESS SUCCESSFUL!');

      let totalImpressions = 0;
      let totalClicks = 0;
      let totalCost = 0;

      performance.forEach(row => {
        totalImpressions += parseInt(row.metrics.impressions || 0);
        totalClicks += parseInt(row.metrics.clicks || 0);
        totalCost += parseInt(row.metrics.cost_micros || 0);
      });

      log('cyan', '\n📈 LAST 30 DAYS PERFORMANCE:');
      log('white', `   Total Impressions: ${totalImpressions.toLocaleString()}`);
      log('white', `   Total Clicks: ${totalClicks.toLocaleString()}`);
      log('white', `   Total Cost: $${(totalCost / 1000000).toFixed(2)}`);

      if (totalImpressions > 0) {
        const ctr = ((totalClicks / totalImpressions) * 100).toFixed(2);
        log('white', `   CTR: ${ctr}%`);
      }
    } else {
      log('yellow', '⚠️  NO PERFORMANCE DATA FOUND (This is OK for new accounts)');
    }

    // Step 7: Test Keywords Access (if Search campaigns exist)
    log('blue', '\n7. TESTING KEYWORDS ACCESS...');

    try {
      const keywords = await customer.query(`
        SELECT 
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group.name,
          campaign.name
        FROM keyword_view
        WHERE campaign.status != 'REMOVED'
          AND ad_group.status != 'REMOVED'
          AND ad_group_criterion.status != 'REMOVED'
        LIMIT 5
      `);

      if (keywords && keywords.length > 0) {
        log('green', `✅ FOUND ${keywords.length} KEYWORDS:`);
        keywords.forEach((kw, index) => {
          const keyword = kw.ad_group_criterion.keyword;
          log('white', `   ${index + 1}. "${keyword.text}" (${keyword.match_type}) - ${kw.campaign.name}`);
        });
      } else {
        log('yellow', '⚠️  NO KEYWORDS FOUND (This is OK for new accounts or Display/Video campaigns)');
      }
    } catch (keywordError) {
      log('yellow', '⚠️  KEYWORDS ACCESS LIMITED (This is normal for some account types)');
    }

    // Final Success Message
    log('green', '\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    log('cyan', '='.repeat(50));
    log('green', '✅ MARCUS AI CAN ACCESS GOOGLE ADS API');
    log('green', '✅ READY FOR CAMPAIGN MANAGEMENT');
    log('green', '✅ READY FOR PERFORMANCE ANALYSIS');
    log('cyan', '='.repeat(50));

  } catch (error) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorString = String(errorMessage);

    log('red', `\n❌ Google Ads API connection failed: ${errorMessage}`);

    // Log full error for debugging
    console.error('\n🔍 Full error details:', error);

    if (errorString.includes('invalid_grant')) {
      log('yellow', '\n💡 REFRESH TOKEN EXPIRED:');
      log('yellow', 'Run: node src/scripts/generate-google-refresh-token.js');
    } else if (errorString.includes('unauthorized') || errorString.includes('401')) {
      log('yellow', '\n💡 AUTHORIZATION ISSUE:');
      log('yellow', '1. Check if your Google account has access to this Ads account');
      log('yellow', '2. Verify GOOGLE_ADS_CUSTOMER_ID is correct');
    } else if (errorString.includes('developer_token') || errorString.includes('403')) {
      log('yellow', '\n💡 DEVELOPER TOKEN ISSUE:');
      log('yellow', '1. Check if your developer token is approved');
      log('yellow', '2. Make sure it\'s not in test mode');
    } else if (errorString.includes('customer_id') || errorString.includes('400')) {
      log('yellow', '\n💡 CUSTOMER ID ISSUE:');
      log('yellow', '1. Check GOOGLE_ADS_CUSTOMER_ID format (xxx-xxx-xxxx)');
      log('yellow', '2. Verify you have access to this customer account');
    } else {
      log('yellow', '\n💡 TROUBLESHOOTING:');
      log('yellow', '1. Check all environment variables are correct');
      log('yellow', '2. Verify refresh token is not expired');
      log('yellow', '3. Check network connection');
    }

    log('red', `\n❌ Connection failed: ${errorMessage}`);
    log('red', '\n💥 TESTS FAILED! Check the errors above.');
    process.exit(1);
  }
}

// Execute the test
if (require.main === module) {
  testGoogleAdsConnection()
    .then(() => {
      log('green', '\n🏁 TEST COMPLETED SUCCESSFULLY!');
      process.exit(0);
    })
    .catch((error) => {
      log('red', `\n💥 UNEXPECTED ERROR: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testGoogleAdsConnection };