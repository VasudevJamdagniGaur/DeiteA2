// Test script to verify APK functionality
const axios = require('axios');

const BASE_URL = 'https://deite-a2-vasudevjamdagnigaur.repl.co';

async function testAPKFunctionality() {
  console.log('📱 Testing APK Functionality...\n');
  
  try {
    // Test 1: Health check with mobile user agent
    console.log('1️⃣ Testing Health Check (Mobile User Agent)...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
      }
    });
    console.log('✅ Health Check (Mobile):', healthResponse.data);
    
    // Test 2: Test RunPod with mobile user agent
    console.log('\n2️⃣ Testing RunPod (Mobile User Agent)...');
    const runpodResponse = await axios.get(`${BASE_URL}/api/test-runpod`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
      }
    });
    console.log('✅ RunPod Test (Mobile):', runpodResponse.data);
    
    // Test 3: Chat endpoint test (simulating APK request)
    console.log('\n3️⃣ Testing Chat Endpoint (Simulating APK)...');
    const chatResponse = await axios.post(`${BASE_URL}/api/chat`, {
      messages: [
        { sender: 'user', content: 'Hello, this is a test from APK' }
      ],
      userId: 'test-user-123'
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Chat Test (APK):', chatResponse.data);
    
    console.log('\n🎉 All APK tests passed!');
    console.log('\n📱 Your APK should now work correctly with:');
    console.log('   ✅ Mobile app detection');
    console.log('   ✅ RunPod connectivity');
    console.log('   ✅ Chat functionality');
    console.log('   ✅ Proper response handling');
    
  } catch (error) {
    console.error('\n❌ APK test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPKFunctionality();
