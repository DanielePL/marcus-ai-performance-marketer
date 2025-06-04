// server/src/scripts/generate-google-refresh-token.js
// Script to generate fresh Google Ads API Refresh Token

require('dotenv').config();
const { google } = require('googleapis');

// ANSI colors for console
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

function generateGoogleAdsRefreshToken() {
  log('cyan', '\n🔐 GOOGLE ADS REFRESH TOKEN GENERATOR');
  log('cyan', '='.repeat(50));

  // Check required environment variables
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    log('red', '\n❌ MISSING REQUIRED CREDENTIALS!');
    log('red', 'Please add to your server/.env file:');
    log('yellow', 'GOOGLE_ADS_CLIENT_ID=your-client-id');
    log('yellow', 'GOOGLE_ADS_CLIENT_SECRET=your-client-secret');
    log('yellow', 'GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token');
    return;
  }

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'urn:ietf:wg:oauth:2.0:oob' // For installed applications
  );

  // Generate auth URL
  const scopes = ['https://www.googleapis.com/auth/adwords'];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Force consent screen to get refresh token
  });

  log('green', '\n✅ STEPS TO GET REFRESH TOKEN:');
  log('blue', '\n1. Open this URL in your browser:');
  log('cyan', authUrl);

  log('blue', '\n2. Sign in with your Google Ads account');
  log('blue', '3. Grant permissions to your application');
  log('blue', '4. Copy the authorization code from the page');
  log('blue', '5. Run this command with the code:');

  log('yellow', '\nnode src/scripts/exchange-auth-code.js YOUR_AUTH_CODE_HERE');

  log('green', '\n📝 SAVE THIS AUTH URL:');
  log('cyan', authUrl);
  log('green', '\n🔄 Then run the exchange script with your auth code!');
}

// Run the generator
if (require.main === module) {
  generateGoogleAdsRefreshToken();
}

module.exports = { generateGoogleAdsRefreshToken };