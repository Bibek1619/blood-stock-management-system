// Simple test script to verify analytics routes are loaded
const http = require('http');

const testEndpoints = [
  '/api/analytics/overview',
  '/api/analytics/donor-retention',
  '/api/analytics/donor-activity',
];

console.log('🧪 Testing Analytics Routes...\n');

testEndpoints.forEach((endpoint) => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: endpoint,
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    console.log(`${endpoint}: ${res.statusCode === 200 ? '✅' : '❌'} Status ${res.statusCode}`);
  });

  req.on('error', (error) => {
    console.log(`${endpoint}: ❌ Error - ${error.message}`);
  });

  req.end();
});

console.log('\nIf you see 404 errors, the backend needs to be restarted!');
console.log('Stop the backend (Ctrl+C) and run: npm run dev\n');
