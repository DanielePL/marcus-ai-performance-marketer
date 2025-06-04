// server/src/test/google-ads-manager-test.js
// MARCUS AI - Manager Account Test - Find Client Accounts

require('dotenv').config();
const { GoogleAdsApi } = require('google-ads-api');

// ANSI colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function findClientAccounts() {
  log('cyan', '\n🏢 MARCUS AI - MANAGER ACCOUNT TEST');
  log('cyan', '='.repeat(50));

  try {
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    const manager = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    log('blue', '\n1. GETTING MANAGER ACCOUNT INFO...');

    const managerInfo = await manager.query(`
      SELECT 
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.test_account,
        customer.manager
      FROM customer
      LIMIT 1
    `);

    const info = managerInfo[0].customer;
    log('green', '✅ MANAGER ACCOUNT DETAILS:');
    log('yellow', `   Manager ID: ${info.id}`);
    log('yellow', `   Name: ${info.descriptive_name}`);
    log('yellow', `   Currency: ${info.currency_code}`);
    log('yellow', `   Is Manager: ${info.manager ? 'YES' : 'NO'}`);
    log('yellow', `   Test Account: ${info.test_account ? 'YES' : 'NO'}`);

    // Step 2: Find Client Accounts
    log('blue', '\n2. FINDING CLIENT ACCOUNTS...');

    const clientAccounts = await manager.query(`
      SELECT 
        customer_client.client_customer,
        customer_client.descriptive_name,
        customer_client.currency_code,
        customer_client.time_zone,
        customer_client.test_account,
        customer_client.manager,
        customer_client.level,
        customer_client.status
      FROM customer_client
      WHERE customer_client.level <= 1
      ORDER BY customer_client.descriptive_name
    `);

    if (clientAccounts && clientAccounts.length > 0) {
      log('green', `✅ FOUND ${clientAccounts.length} CLIENT ACCOUNTS:`);

      clientAccounts.forEach((account, index) => {
        const client = account.customer_client;
        log('cyan', `\n   ${index + 1}. ${client.descriptive_name}`);
        log('yellow', `      Client ID: ${client.client_customer}`);
        log('yellow', `      Currency: ${client.currency_code}`);
        log('yellow', `      Status: ${client.status}`);
        log('yellow', `      Test Account: ${client.test_account ? 'YES' : 'NO'}`);
        log('yellow', `      Is Manager: ${client.manager ? 'YES' : 'NO'}`);
      });

      // Step 3: Test accessing a client account
      log('blue', '\n3. TESTING CLIENT ACCOUNT ACCESS...');

      // Use the first non-manager, non-test account
      const targetClient = clientAccounts.find(acc =>
        !acc.customer_client.manager &&
        !acc.customer_client.test_account &&
        acc.customer_client.status === 2 // ENABLED
      );

      if (targetClient) {
        const clientId = targetClient.customer_client.client_customer;
        log('blue', `\n   Testing access to: ${targetClient.customer_client.descriptive_name} (${clientId})`);

        // Create client instance
        const clientCustomer = client.Customer({
          customer_id: clientId,
          refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
          login_customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID // Important for manager access!
        });

        // Test campaigns
        try {
          const campaigns = await clientCustomer.query(`
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
            log('green', `✅ FOUND ${campaigns.length} CAMPAIGNS IN CLIENT ACCOUNT:`);
            campaigns.forEach((camp, idx) => {
              const c = camp.campaign;
              log('yellow', `      ${idx + 1}. ${c.name} (${c.status})`);
            });
          } else {
            log('yellow', '⚠️  NO CAMPAIGNS IN THIS CLIENT ACCOUNT');
          }

          // Test performance data
          const today = new Date();
          const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
          const dateFrom = sevenDaysAgo.toISOString().split('T')[0].replace(/-/g, '');
          const dateTo = today.toISOString().split('T')[0].replace(/-/g, '');

          const performance = await clientCustomer.query(`
            SELECT 
              metrics.impressions,
              metrics.clicks,
              metrics.cost_micros
            FROM customer
            WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
            LIMIT 5
          `);

          if (performance && performance.length > 0) {
            let totalImpressions = 0;
            let totalClicks = 0;
            let totalCost = 0;

            performance.forEach(row => {
              totalImpressions += parseInt(row.metrics.impressions || 0);
              totalClicks += parseInt(row.metrics.clicks || 0);
              totalCost += parseInt(row.metrics.cost_micros || 0);
            });

            log('green', '✅ PERFORMANCE DATA ACCESSIBLE!');
            log('yellow', `      Impressions (7d): ${totalImpressions.toLocaleString()}`);
            log('yellow', `      Clicks (7d): ${totalClicks.toLocaleString()}`);
            log('yellow', `      Cost (7d): $${(totalCost / 1000000).toFixed(2)}`);
          }

        } catch (clientError) {
          log('red', `❌ Error accessing client account: ${clientError.message || clientError}`);
        }

      } else {
        log('yellow', '⚠️  NO SUITABLE CLIENT ACCOUNTS FOUND');
        log('yellow', '   (Looking for non-manager, non-test, enabled accounts)');
      }

      // Step 4: Provide recommendations
      log('blue', '\n4. RECOMMENDATIONS FOR MARCUS...');

      log('green', '\n✅ MARCUS SETUP RECOMMENDATIONS:');
      log('cyan', '   Your account structure:');
      log('yellow', `   └── Manager Account: ${info.descriptive_name} (${info.id})`);

      clientAccounts.forEach(account => {
        const client = account.customer_client;
        const icon = client.manager ? '🏢' : '📊';
        const type = client.manager ? 'Manager' : 'Client';
        const status = client.test_account ? '[TEST]' : client.status === 2 ? '[ACTIVE]' : '[INACTIVE]';
        log('yellow', `       ├── ${icon} ${type}: ${client.descriptive_name} (${client.client_customer}) ${status}`);
      });

      const productionAccounts = clientAccounts.filter(acc =>
        !acc.customer_client.test_account &&
        acc.customer_client.status === 2
      );

      if (productionAccounts.length > 0) {
        log('green', '\n🎯 FOR MARCUS CONFIGURATION:');
        log('cyan', '   Use one of these PRODUCTION accounts as GOOGLE_ADS_CUSTOMER_ID:');
        productionAccounts.forEach(acc => {
          const client = acc.customer_client;
          log('yellow', `   • ${client.client_customer} - ${client.descriptive_name}`);
        });

        log('cyan', '\n   Keep current MANAGER ID for login_customer_id:');
        log('yellow', `   • ${info.id} - ${info.descriptive_name} (Manager)`);
      }

    } else {
      log('yellow', '⚠️  NO CLIENT ACCOUNTS FOUND');
      log('yellow', '   This manager account has no client accounts yet.');
    }

    log('green', '\n🎉 MANAGER ACCOUNT ANALYSIS COMPLETE!');
    log('cyan', '='.repeat(50));

  } catch (error) {
    log('red', `\n❌ Error: ${error.message || error}`);
    console.error('Full error:', error);
  }
}

// Execute the test
if (require.main === module) {
  findClientAccounts()
    .then(() => {
      log('green', '\n🏁 MANAGER ANALYSIS COMPLETED!');
      process.exit(0);
    })
    .catch((error) => {
      log('red', `\n💥 ERROR: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { findClientAccounts };