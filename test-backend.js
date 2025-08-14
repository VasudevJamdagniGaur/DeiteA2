// Simple test script to verify backend connectivity
const axios = require('axios');

const BASE_URL = 'https://deite-a2-vasudevjamdagnigaur.repl.co';

async function testBackend() {
  console.log('🧪 Testing Backend Connectivity...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check:', healthResponse.data);
    
    // Test 2: Test RunPod
    console.log('\n2️⃣ Testing RunPod Connection...');
    const runpodResponse = await axios.get(`${BASE_URL}/api/test-runpod`);
    console.log('✅ RunPod Test:', runpodResponse.data);
    
    // Test 3: Chat route ping
    console.log('\n3️⃣ Testing Chat Route...');
    const chatPingResponse = await axios.get(`${BASE_URL}/api/chat/ping`);
    console.log('✅ Chat Route Ping:', chatPingResponse.data);
    
    // Test 4: Chat route simple test
    console.log('\n4️⃣ Testing Chat Route Simple Test...');
    const chatSimpleResponse = await axios.get(`${BASE_URL}/api/chat/test-simple`);
    console.log('✅ Chat Route Simple Test:', chatSimpleResponse.data);
    
    // Test 5: Chat route test with RunPod
    console.log('\n5️⃣ Testing Chat Route with RunPod...');
    const chatTestResponse = await axios.get(`${BASE_URL}/api/chat/test`);
    console.log('✅ Chat Route RunPod Test:', chatTestResponse.data);
    
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    console.log('\n📱 Your APK should now work with RunPod!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testBackend();
