// server/src/scripts/exchange-auth-code.js
// Exchange authorization code for refresh token

require('dotenv').config();
const { google } = require('googleapis');

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

async function exchangeAuthCode(authCode) {
  log('cyan', '\n🔄 EXCHANGING AUTH CODE FOR REFRESH TOKEN');
  log('cyan', '='.repeat(50));

  if (!authCode) {
    log('red', '\n❌ NO AUTH CODE PROVIDED!');
    log('yellow', 'Usage: node src/scripts/exchange-auth-code.js YOUR_AUTH_CODE');
    return;
  }

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    log('red', '\n❌ MISSING CLIENT CREDENTIALS!');
    return;
  }

  try {
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'urn:ietf:wg:oauth:2.0:oob'
    );

    log('blue', '\n🔄 Exchanging authorization code...');

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(authCode);

    log('green', '\n✅ SUCCESS! TOKENS RECEIVED:');
    log('blue', '\n📋 ADD THESE TO YOUR server/.env FILE:');
    log('cyan', '='.repeat(50));

    if (tokens.refresh_token) {
      log('green', `GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
      log('yellow', '\n⚠️  NO REFRESH TOKEN RECEIVED!');
      log('yellow', 'This might happen if you already have a token.');
      log('yellow', 'Try revoking access and running the generator again.');
    }

    if (tokens.access_token) {
      log('blue', `\n# Access Token (expires in ${tokens.expiry_date ? 'about 1 hour' : 'unknown time'}):`);
      log('blue', `# ACCESS_TOKEN=${tokens.access_token}`);
    }

    log('cyan', '='.repeat(50));
    log('green', '\n🎉 COPY THE REFRESH TOKEN TO YOUR .env FILE!');
    log('blue', '\nThen run: npm run test:google-ads');

    // Test the refresh token immediately
    if (tokens.refresh_token) {
      log('blue', '\n🧪 TESTING REFRESH TOKEN...');

      oauth2Client.setCredentials(tokens);

      try {
        await oauth2Client.refreshAccessToken();
        log('green', '✅ REFRESH TOKEN WORKS!');
      } catch (testError) {
        log('red', `❌ REFRESH TOKEN TEST FAILED: ${testError.message}`);
      }
    }

  } catch (error) {
    log('red', '\n❌ TOKEN EXCHANGE FAILED!');
    log('red', `Error: ${error.message}`);

    if (error.message.includes('invalid_grant')) {
      log('yellow', '\n💡 TROUBLESHOOTING:');
      log('yellow', '1. Make sure the auth code is correct and recent (expires in 10 minutes)');
      log('yellow', '2. Check that Client ID and Secret are correct');
      log('yellow', '3. Try generating a new auth URL');
    }
  }
}

// Get auth code from command line argument
const authCode = process.argv[2];

if (require.main === module) {
  exchangeAuthCode(authCode);
}

module.exports = { exchangeAuthCode };