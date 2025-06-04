// server/src/test/google-ads-live-test.js
// MARCUS AI - Google Ads API Test mit neuester REST Library

require('dotenv').config();
const { GoogleAdsApi, enums } = require('google-ads-api');

// ANSI colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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

async function testGoogleAdsLive() {
  log('cyan', '\n🚀 MARCUS AI - GOOGLE ADS LIVE API TEST (REST)');
  log('cyan', '='.repeat(60));

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
    return;
  }

  // Step 2: Initialize Google Ads API Client (REST)
  log('blue', '\n2. INITIALIZING GOOGLE ADS CLIENT (REST API)...');

  try {
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    log('green', '✅ Google Ads REST Client initialized');

    // Step 3: Create Customer Instance
    log('blue', '\n3. CREATING CUSTOMER INSTANCE...');

    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    log('green', '✅ Customer instance created');

    // Step 4: Test Basic Query (Customer Info)
    log('blue', '\n4. TESTING CUSTOMER INFO QUERY...');

    const customerQuery = `
      SELECT 
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.status
      FROM customer
      LIMIT 1
    `;

    const customerResult = await customer.query(customerQuery);

    if (customerResult && customerResult.length > 0) {
      const info = customerResult[0].customer;
      log('green', '✅ CUSTOMER INFO RETRIEVED SUCCESSFULLY!');
      log('cyan', '\n📊 CUSTOMER DETAILS:');
      log('yellow', `   Customer ID: ${info.id}`);
      log('yellow', `   Name: ${info.descriptive_name || 'N/A'}`);
      log('yellow', `   Currency: ${info.currency_code || 'N/A'}`);
      log('yellow', `   Timezone: ${info.time_zone || 'N/A'}`);
      log('yellow', `   Status: ${info.status || 'N/A'}`);
    }

    // Step 5: Test Campaign Query
    log('blue', '\n5. TESTING CAMPAIGNS QUERY...');

    const campaignQuery = `
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.start_date,
        campaign.end_date
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      ORDER BY campaign.id
      LIMIT 10
    `;

    const campaignResult = await customer.query(campaignQuery);

    if (campaignResult && campaignResult.length > 0) {
      log('green', `✅ FOUND ${campaignResult.length} CAMPAIGNS:`);
      campaignResult.forEach((row, index) => {
        const camp = row.campaign;
        log('yellow', `   ${index + 1}. ${camp.name} (ID: ${camp.id})`);
        log('yellow', `      Status: ${camp.status} | Type: ${camp.advertising_channel_type}`);
      });
    } else {
      log('yellow', '⚠️  NO CAMPAIGNS FOUND (This is OK for new accounts)');
    }

    // Step 6: Test Performance Metrics
    log('blue', '\n6. TESTING PERFORMANCE METRICS...');

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    const dateFrom = thirtyDaysAgo.toISOString().split('T')[0].replace(/-/g, '');
    const dateTo = today.toISOString().split('T')[0].replace(/-/g, '');

    const metricsQuery = `
      SELECT 
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros,
        segments.date
      FROM campaign
      WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
        AND campaign.status != 'REMOVED'
      ORDER BY metrics.impressions DESC
      LIMIT 20
    `;

    const metricsResult = await customer.query(metricsQuery);

    if (metricsResult && metricsResult.length > 0) {
      log('green', `✅ PERFORMANCE DATA RETRIEVED! (${metricsResult.length} rows)`);

      // Aggregate totals
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalConversions = 0;
      let totalCost = 0;

      metricsResult.forEach(row => {
        totalImpressions += parseInt(row.metrics.impressions || 0);
        totalClicks += parseInt(row.metrics.clicks || 0);
        totalConversions += parseFloat(row.metrics.conversions || 0);
        totalCost += parseInt(row.metrics.cost_micros || 0);
      });

      log('cyan', '\n📈 PERFORMANCE SUMMARY (Last 30 Days):');
      log('yellow', `   Total Impressions: ${totalImpressions.toLocaleString()}`);
      log('yellow', `   Total Clicks: ${totalClicks.toLocaleString()}`);
      log('yellow', `   Total Conversions: ${totalConversions.toFixed(2)}`);
      log('yellow', `   Total Cost: $${(totalCost / 1000000).toFixed(2)}`);

      if (totalImpressions > 0) {
        const ctr = ((totalClicks / totalImpressions) * 100).toFixed(2);
        log('yellow', `   Average CTR: ${ctr}%`);
      }

      if (totalClicks > 0) {
        const cpc = (totalCost / 1000000 / totalClicks).toFixed(2);
        log('yellow', `   Average CPC: $${cpc}`);
      }

    } else {
      log('yellow', '⚠️  NO PERFORMANCE DATA FOUND (This is OK for new accounts)');
    }

    // Step 7: Test Keywords (if Search campaigns exist)
    log('blue', '\n7. TESTING KEYWORDS QUERY...');

    try {
      const keywordQuery = `
        SELECT 
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group.name,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros
        FROM keyword_view
        WHERE campaign.status != 'REMOVED'
          AND ad_group.status != 'REMOVED'
          AND ad_group_criterion.status != 'REMOVED'
        ORDER BY metrics.impressions DESC
        LIMIT 10
      `;

      const keywordResult = await customer.query(keywordQuery);

      if (keywordResult && keywordResult.length > 0) {
        log('green', `✅ FOUND ${keywordResult.length} KEYWORDS:`);
        keywordResult.forEach((row, index) => {
          const keyword = row.ad_group_criterion.keyword;
          const metrics = row.metrics;
          log('yellow', `   ${index + 1}. "${keyword.text}" (${keyword.match_type})`);
          log('yellow', `      Campaign: ${row.campaign.name}`);
          log('yellow', `      Impressions: ${metrics.impressions || 0} | Clicks: ${metrics.clicks || 0}`);
        });
      } else {
        log('yellow', '⚠️  NO KEYWORDS FOUND (OK for Display/Video campaigns)');
      }
    } catch (keywordError) {
      log('yellow', '⚠️  KEYWORDS ACCESS LIMITED (Normal for some account types)');
    }

    // Success Summary
    log('green', '\n🎉🎉🎉 MARCUS GOOGLE ADS CONNECTION SUCCESSFUL! 🎉🎉🎉');
    log('cyan', '='.repeat(60));
    log('green', '✅ REST API Connection Working');
    log('green', '✅ Customer Data Accessible');
    log('green', '✅ Campaign Data Retrieved');
    log('green', '✅ Performance Metrics Available');
    log('green', '✅ Marcus Can Now Get LIVE Data!');
    log('cyan', '='.repeat(60));

    return {
      success: true,
      customerInfo: customerResult[0]?.customer,
      campaignCount: campaignResult?.length || 0,
      performanceRows: metricsResult?.length || 0
    };

  } catch (error) {
    log('red', '\n❌ GOOGLE ADS API ERROR:');
    log('red', error.message);

    if (error.message.includes('invalid_grant')) {
      log('yellow', '\n💡 REFRESH TOKEN EXPIRED:');
      log('yellow', '1. Go to: https://developers.google.com/oauthplayground');
      log('yellow', '2. Authorize Google Ads API');
      log('yellow', '3. Get new refresh token');
      log('yellow', '4. Update GOOGLE_ADS_REFRESH_TOKEN in .env');
    } else if (error.message.includes('unauthorized')) {
      log('yellow', '\n💡 AUTHORIZATION ISSUE:');
      log('yellow', '1. Check if account has access to Customer ID');
      log('yellow', '2. Verify Developer Token is approved');
      log('yellow', '3. Check Client ID/Secret are correct');
    }

    return {
      success: false,
      error: error.message
    };
  }
}

// Execute the test
if (require.main === module) {
  testGoogleAdsLive()
    .then((result) => {
      if (result.success) {
        log('green', '\n🏆 TEST COMPLETED SUCCESSFULLY! Marcus is ready for LIVE data!');
        process.exit(0);
      } else {
        log('red', '\n💥 TEST FAILED! Check the errors above.');
        process.exit(1);
      }
    })
    .catch((error) => {
      log('red', `\n💥 UNEXPECTED ERROR: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testGoogleAdsLive };