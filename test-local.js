/**
 * Local Test Script for SMS Server
 * 
 * Usage: node test-local.js
 * 
 * This script tests the SMS server running on your local machine
 */

const axios = require('axios');

// Your local IP address (from ipconfig)
const LOCAL_IP = '192.168.1.3';
const PORT = process.env.SMS_SERVER_PORT || 8081;
const SMS_SERVER_URL = `http://${LOCAL_IP}:${PORT}`;

console.log('🧪 Testing SMS Server locally...');
console.log(`📍 Server URL: ${SMS_SERVER_URL}\n`);

// Test 1: Health Check
async function testHealthCheck() {
  try {
    console.log('Test 1: Health Check');
    const response = await axios.get(`${SMS_SERVER_URL}/health`);
    console.log('✅ Health Check Passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return false;
  }
}

// Test 2: Root Endpoint
async function testRootEndpoint() {
  try {
    console.log('\nTest 2: Root Endpoint');
    const response = await axios.get(`${SMS_SERVER_URL}/`);
    console.log('✅ Root Endpoint Passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Root Endpoint Failed:', error.message);
    return false;
  }
}

// Test 3: OTP Generation
async function testOtpGeneration() {
  try {
    console.log('\nTest 3: OTP Generation');
    const testData = {
      entity_type: 'user',
      entity_id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID string
      phone_code: '91', // No + sign, just digits
      phone_number: '9876543210',
      purpose: 'registration'
    };
    
    console.log('Request Body:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${SMS_SERVER_URL}/otp/generate`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ OTP Generation Passed:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    if (error.response) {
      console.error('❌ OTP Generation Failed:', error.response.status, error.response.data);
    } else {
      console.error('❌ OTP Generation Failed:', error.message);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('='.repeat(50));
  console.log('SMS Server Local Testing');
  console.log('='.repeat(50));
  console.log(`Server: ${SMS_SERVER_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  const results = [];
  results.push(await testHealthCheck());
  results.push(await testRootEndpoint());
  results.push(await testOtpGeneration());
  
  console.log('\n' + '='.repeat(50));
  console.log('Test Summary:');
  console.log(`✅ Passed: ${results.filter(r => r).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r).length}`);
  console.log('='.repeat(50));
}

// Run tests
runTests().catch(console.error);

