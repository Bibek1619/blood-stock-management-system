/**
 * Simple Authentication API Test Script
 * Run with: node test-auth.js
 */

const BASE_URL = 'http://localhost:3001';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n📊 Testing Health Check...', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      log('✅ Health check passed', 'green');
      console.log(data);
      return true;
    } else {
      log('❌ Health check failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Server not reachable: ${error.message}`, 'red');
    log('Make sure the server is running on port 3001', 'yellow');
    return false;
  }
}

async function testRegister() {
  log('\n📝 Testing User Registration...', 'blue');
  
  const userData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    phone: '1234567890'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Registration successful', 'green');
      console.log('User:', data.data.user);
      console.log('Token:', data.data.token.substring(0, 20) + '...');
      return { success: true, email: userData.email, password: userData.password, token: data.data.token };
    } else {
      log('❌ Registration failed', 'red');
      console.log(data);
      return { success: false };
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testLogin(email, password) {
  log('\n🔐 Testing User Login...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Login successful', 'green');
      console.log('User:', data.data.user);
      console.log('Token:', data.data.token.substring(0, 20) + '...');
      return { success: true, token: data.data.token };
    } else {
      log('❌ Login failed', 'red');
      console.log(data);
      return { success: false };
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testGetProfile(token) {
  log('\n👤 Testing Get Profile...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Get profile successful', 'green');
      console.log('User:', data.data.user);
      return { success: true };
    } else {
      log('❌ Get profile failed', 'red');
      console.log(data);
      return { success: false };
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testUpdateProfile(token) {
  log('\n✏️  Testing Update Profile...', 'blue');
  
  const updateData = {
    name: 'Updated Test User',
    phone: '9876543210'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Update profile successful', 'green');
      console.log('Updated User:', data.data.user);
      return { success: true };
    } else {
      log('❌ Update profile failed', 'red');
      console.log(data);
      return { success: false };
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testWrongMethod() {
  log('\n⚠️  Testing Wrong HTTP Method (GET instead of POST)...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'GET'
    });
    
    const data = await response.json();
    
    if (response.status === 405) {
      log('✅ Correctly rejected with 405 Method Not Allowed', 'green');
      console.log(data);
      return { success: true };
    } else {
      log('❌ Should have returned 405', 'red');
      return { success: false };
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function runAllTests() {
  log('='.repeat(60), 'blue');
  log('🧪 Authentication API Test Suite', 'blue');
  log('='.repeat(60), 'blue');
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test 1: Health Check
  const healthCheck = await testHealthCheck();
  if (!healthCheck) {
    log('\n❌ Server is not running. Please start the server first.', 'red');
    log('Run: npm run dev', 'yellow');
    return;
  }
  results.passed++;
  
  // Test 2: Register
  const registerResult = await testRegister();
  if (registerResult.success) {
    results.passed++;
  } else {
    results.failed++;
    log('\n⚠️  Skipping remaining tests due to registration failure', 'yellow');
    printSummary(results);
    return;
  }
  
  // Test 3: Login
  const loginResult = await testLogin(registerResult.email, registerResult.password);
  if (loginResult.success) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 4: Get Profile
  if (loginResult.success) {
    const profileResult = await testGetProfile(loginResult.token);
    if (profileResult.success) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Test 5: Update Profile
    const updateResult = await testUpdateProfile(loginResult.token);
    if (updateResult.success) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // Test 6: Wrong Method
  const wrongMethodResult = await testWrongMethod();
  if (wrongMethodResult.success) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  printSummary(results);
}

function printSummary(results) {
  log('\n' + '='.repeat(60), 'blue');
  log('📊 Test Summary', 'blue');
  log('='.repeat(60), 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`📈 Total: ${results.passed + results.failed}`, 'blue');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the output above for details.', 'yellow');
  }
  log('='.repeat(60), 'blue');
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
});
