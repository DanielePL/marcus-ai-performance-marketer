// server/src/test/network-diagnostic.js
// MARCUS AI - Network & Google API Diagnostic Test

const https = require('https');
const http = require('http');

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

function testHttpConnection(url, name) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    log('blue', `\n🔍 Testing ${name}...`);
    log('cyan', `   URL: ${url}`);

    const request = https.get(url, (response) => {
      const duration = Date.now() - startTime;
      log('green', `✅ ${name}: ${response.statusCode} (${duration}ms)`);
      log('cyan', `   Headers: ${Object.keys(response.headers).join(', ')}`);
      resolve({ success: true, status: response.statusCode, duration });
    });

    request.on('error', (error) => {
      const duration = Date.now() - startTime;
      log('red', `❌ ${name}: FAILED (${duration}ms)`);
      log('red', `   Error: ${error.message}`);
      log('red', `   Code: ${error.code || 'UNKNOWN'}`);
      resolve({ success: false, error: error.message, duration });
    });

    request.setTimeout(10000, () => {
      log('yellow', `⏰ ${name}: TIMEOUT (10s)`);
      request.destroy();
      resolve({ success: false, error: 'TIMEOUT', duration: 10000 });
    });
  });
}

async function runNetworkDiagnostics() {
  log('cyan', '\n🌐 MARCUS AI - NETWORK DIAGNOSTIC TEST');
  log('cyan', '='.repeat(50));

  // Test 1: Basic Internet Connection
  log('blue', '\n1. TESTING BASIC INTERNET CONNECTION...');
  await testHttpConnection('https://www.google.com', 'Google.com');

  // Test 2: Google APIs Domain
  log('blue', '\n2. TESTING GOOGLE APIS DOMAIN...');
  await testHttpConnection('https://googleapis.com', 'Google APIs');

  // Test 3: OAuth Endpoint
  log('blue', '\n3. TESTING GOOGLE OAUTH ENDPOINT...');
  await testHttpConnection('https://oauth2.googleapis.com', 'Google OAuth2');

  // Test 4: Google Ads API Endpoint
  log('blue', '\n4. TESTING GOOGLE ADS API ENDPOINT...');
  await testHttpConnection('https://googleads.googleapis.com', 'Google Ads API');

  // Test 5: Check Environment for Proxy
  log('blue', '\n5. CHECKING PROXY SETTINGS...');
  const proxyVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY'];
  let proxyFound = false;

  proxyVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      log('yellow', `⚠️  PROXY DETECTED: ${varName} = ${value}`);
      proxyFound = true;
    }
  });

  if (!proxyFound) {
    log('green', '✅ NO PROXY VARIABLES DETECTED');
  }

  // Test 6: Check VPN (.venv detected)
  log('blue', '\n6. CHECKING VPN STATUS...');
  log('cyan', '   Terminal shows (.venv) - Virtual environment or VPN?');

  if (process.env.VIRTUAL_ENV) {
    log('green', `✅ Python Virtual Environment: ${process.env.VIRTUAL_ENV}`);
  } else {
    log('yellow', '⚠️  (.venv) detected but no VIRTUAL_ENV variable');
    log('yellow', '   This might be a VPN or custom shell prompt');
  }

  // Test 7: DNS Resolution Test
  log('blue', '\n7. TESTING DNS RESOLUTION...');
  const dns = require('dns');

  try {
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve4('oauth2.googleapis.com', (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });

    log('green', `✅ DNS RESOLUTION: oauth2.googleapis.com -> ${addresses.join(', ')}`);
  } catch (dnsError) {
    log('red', `❌ DNS RESOLUTION FAILED: ${dnsError.message}`);
  }

  // Test 8: System Info
  log('blue', '\n8. SYSTEM INFORMATION...');
  log('cyan', `   Node.js Version: ${process.version}`);
  log('cyan', `   Platform: ${process.platform}`);
  log('cyan', `   Architecture: ${process.arch}`);
  log('cyan', `   Working Directory: ${process.cwd()}`);

  // Test 9: Network Interface Check (macOS specific)
  if (process.platform === 'darwin') {
    log('blue', '\n9. CHECKING NETWORK INTERFACES (macOS)...');
    const { execSync } = require('child_process');

    try {
      const interfaces = execSync('ifconfig | grep "inet " | grep -v 127.0.0.1', { encoding: 'utf8' });
      log('cyan', '   Active Network Interfaces:');
      interfaces.split('\n').forEach(line => {
        if (line.trim()) {
          log('cyan', `     ${line.trim()}`);
        }
      });
    } catch (execError) {
      log('yellow', '⚠️  Could not check network interfaces');
    }
  }

  // Recommendations
  log('cyan', '\n💡 TROUBLESHOOTING RECOMMENDATIONS:');
  log('cyan', '='.repeat(50));

  log('yellow', '\n🔧 IF TESTS FAILED:');
  log('white', '1. Check if you\'re behind a corporate firewall');
  log('white', '2. Try disabling VPN temporarily');
  log('white', '3. Check if antivirus is blocking Node.js');
  log('white', '4. Try from a different network (mobile hotspot)');

  log('yellow', '\n🔧 IF USING VPN:');
  log('white', '1. Try connecting through VPN server in US/EU');
  log('white', '2. Check if VPN allows Google API access');
  log('white', '3. Try split-tunneling for Google domains');

  log('yellow', '\n🔧 IF DNS ISSUES:');
  log('white', '1. Try using Google DNS: 8.8.8.8, 8.8.4.4');
  log('white', '2. Flush DNS cache: sudo dscacheutil -flushcache (macOS)');
  log('white', '3. Check /etc/hosts file for conflicts');

  log('green', '\n🏁 NETWORK DIAGNOSTIC COMPLETED!');
}

// Execute the diagnostic
if (require.main === module) {
  runNetworkDiagnostics()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      log('red', `\n💥 DIAGNOSTIC ERROR: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runNetworkDiagnostics };