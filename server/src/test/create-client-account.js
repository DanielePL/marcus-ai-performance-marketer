require('dotenv').config();
const { GoogleAdsApi } = require('google-ads-api');

async function createClientAccount() {
  console.log('🏗️ MARCUS AI - CREATE CLIENT ACCOUNT FOR PERFORMANCE DATA');
  console.log('=========================================================');

  try {
    console.log('1. INITIALIZING GOOGLE ADS API...');
    
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    console.log('✅ Google Ads API Client initialized');

    console.log('2. CONNECTING TO MANAGER ACCOUNT...');
    
    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    console.log('✅ Manager account connection established');

    console.log('3. CREATING NEW CLIENT ACCOUNT...');

    const newAccountRequest = {
      customer_client: {
        descriptive_name: 'DPC Services - Performance Account',
        currency_code: 'CHF',
        time_zone: 'Europe/Zurich'
      }
    };

    try {
      const result = await customer.customerClients.create(newAccountRequest);
      
      console.log('✅ CLIENT ACCOUNT CREATED SUCCESSFULLY!');
      console.log('');
      console.log('📊 NEW ACCOUNT DETAILS:');
      console.log(`   Resource Name: ${result.resource_name}`);
      
      // Extract customer ID from resource name
      const newCustomerId = result.resource_name.split('/')[1];
      console.log(`   Customer ID: ${newCustomerId}`);
      
      console.log('');
      console.log('🔧 UPDATE YOUR .env FILE WITH THESE VALUES:');
      console.log('================================================');
      console.log(`GOOGLE_ADS_CUSTOMER_ID=${newCustomerId}`);
      console.log(`GOOGLE_ADS_LOGIN_CUSTOMER_ID=${process.env.GOOGLE_ADS_CUSTOMER_ID}`);
      console.log('');
      console.log('✅ After updating .env, restart your server and test again!');

    } catch (createError) {
      console.error('❌ Account creation failed:', createError.message);
      
      // Try alternative method
      console.log('');
      console.log('🔄 TRYING ALTERNATIVE METHOD...');
      
      const alternativeRequest = {
        operations: [{
          create: {
            descriptive_name: 'DPC Services - Ads Account',
            currency_code: 'CHF',
            time_zone: 'Europe/Zurich'
          }
        }]
      };

      try {
        const altResult = await customer.mutate({
          mutate_operations: [{
            customer_client_operation: alternativeRequest
          }]
        });

        console.log('✅ ALTERNATIVE METHOD SUCCESSFUL!');
        console.log('New account created:', altResult);

      } catch (altError) {
        console.error('❌ Alternative method also failed:', altError.message);
        console.log('');
        console.log('🔧 MANUAL SOLUTION REQUIRED:');
        console.log('1. Go to https://ads.google.com');
        console.log('2. Sign in with your manager account');
        console.log('3. Click "Create new account"');
        console.log('4. Choose "Experienced mode"');
        console.log('5. Create a standard Google Ads account');
        console.log('6. Note the new Customer ID');
        console.log('7. Update your .env file with the new Customer ID');
      }
    }

  } catch (error) {
    console.error('❌ INITIALIZATION FAILED:', error.message);
    console.log('');
    console.log('🔍 TROUBLESHOOTING:');
    console.log('1. Check all environment variables in .env');
    console.log('2. Verify refresh token is not expired');
    console.log('3. Ensure manager account has permission to create accounts');
    console.log('');
    console.log('🔧 MANUAL ALTERNATIVE:');
    console.log('Create account manually at https://ads.google.com');
  }
}

// Helper function to validate environment
function validateEnvironment() {
  const required = [
    'GOOGLE_ADS_CLIENT_ID',
    'GOOGLE_ADS_CLIENT_SECRET', 
    'GOOGLE_ADS_DEVELOPER_TOKEN',
    'GOOGLE_ADS_CUSTOMER_ID',
    'GOOGLE_ADS_REFRESH_TOKEN'
  ];

  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
    return false;
  }
  
  return true;
}

// Run the account creation
console.log('🚀 MARCUS AI - CLIENT ACCOUNT CREATION STARTING...');

if (validateEnvironment()) {
  createClientAccount();
} else {
  console.log('💥 Environment validation failed. Check your .env file.');
}