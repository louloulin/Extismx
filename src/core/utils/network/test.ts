/**
 * Network Utilities Tests
 * 
 * This file contains manual tests for the network utility module.
 * These tests can be run directly without Jest.
 */

import { request, get, post, put, del, patch, isReachable, fetchJSON } from './index';

/**
 * Run a series of tests for the network utility functions
 */
async function runNetworkTests() {
  console.log('🧪 Starting network utilities tests...');
  
  // Collection to track test results
  const results: Record<string, boolean> = {};
  
  // Test isReachable
  try {
    console.log('\n📡 Testing isReachable...');
    const isGoogleReachable = await isReachable('https://www.google.com');
    console.log(`Is Google reachable: ${isGoogleReachable}`);
    results['isReachable.google'] = isGoogleReachable === true;
    
    const isNonExistentReachable = await isReachable('https://this-domain-does-not-exist-12345.com');
    console.log(`Is non-existent domain reachable: ${isNonExistentReachable}`);
    results['isReachable.nonExistent'] = isNonExistentReachable === false;
  } catch (error) {
    console.error('❌ Error testing isReachable:', error);
    results['isReachable'] = false;
  }
  
  // Test GET request
  try {
    console.log('\n📡 Testing GET request...');
    const response = await get('https://jsonplaceholder.typicode.com/todos/1');
    console.log('GET response status:', response.status);
    console.log('GET response data:', response.data);
    results['get'] = response.status === 200 && response.data && typeof response.data === 'object';
  } catch (error) {
    console.error('❌ Error testing GET request:', error);
    results['get'] = false;
  }
  
  // Test POST request
  try {
    console.log('\n📡 Testing POST request...');
    const postData = { title: 'foo', body: 'bar', userId: 1 };
    const response = await post('https://jsonplaceholder.typicode.com/posts', postData);
    console.log('POST response status:', response.status);
    console.log('POST response data:', response.data);
    results['post'] = response.status === 201 && response.data && typeof response.data === 'object';
  } catch (error) {
    console.error('❌ Error testing POST request:', error);
    results['post'] = false;
  }
  
  // Test PUT request
  try {
    console.log('\n📡 Testing PUT request...');
    const putData = { id: 1, title: 'Updated title', body: 'Updated body', userId: 1 };
    const response = await put('https://jsonplaceholder.typicode.com/posts/1', putData);
    console.log('PUT response status:', response.status);
    console.log('PUT response data:', response.data);
    results['put'] = response.status === 200 && response.data && typeof response.data === 'object';
  } catch (error) {
    console.error('❌ Error testing PUT request:', error);
    results['put'] = false;
  }
  
  // Test PATCH request
  try {
    console.log('\n📡 Testing PATCH request...');
    const patchData = { title: 'Patched title' };
    const response = await patch('https://jsonplaceholder.typicode.com/posts/1', patchData);
    console.log('PATCH response status:', response.status);
    console.log('PATCH response data:', response.data);
    results['patch'] = response.status === 200 && response.data && typeof response.data === 'object';
  } catch (error) {
    console.error('❌ Error testing PATCH request:', error);
    results['patch'] = false;
  }
  
  // Test DELETE request
  try {
    console.log('\n📡 Testing DELETE request...');
    const response = await del('https://jsonplaceholder.typicode.com/posts/1');
    console.log('DELETE response status:', response.status);
    console.log('DELETE response data:', response.data);
    results['delete'] = response.status === 200;
  } catch (error) {
    console.error('❌ Error testing DELETE request:', error);
    results['delete'] = false;
  }
  
  // Test fetchJSON
  try {
    console.log('\n📡 Testing fetchJSON...');
    const jsonData = await fetchJSON('https://jsonplaceholder.typicode.com/users/1');
    console.log('fetchJSON result:', jsonData);
    results['fetchJSON'] = jsonData && typeof jsonData === 'object';
  } catch (error) {
    console.error('❌ Error testing fetchJSON:', error);
    results['fetchJSON'] = false;
  }
  
  // Test request with custom options
  try {
    console.log('\n📡 Testing request with custom options...');
    const response = await request('https://jsonplaceholder.typicode.com/users/1', {
      headers: {
        'X-Custom-Header': 'test-value',
        'Accept': 'application/json',
      },
      timeout: 5000,
    });
    console.log('Custom request status:', response.status);
    console.log('Custom request data:', response.data);
    results['requestCustom'] = response.status === 200 && response.data && typeof response.data === 'object';
  } catch (error) {
    console.error('❌ Error testing request with custom options:', error);
    results['requestCustom'] = false;
  }
  
  // Test request with retry (this will likely succeed on first try)
  try {
    console.log('\n📡 Testing request with retry options...');
    const response = await request('https://jsonplaceholder.typicode.com/users/1', {
      retry: {
        attempts: 3,
        delay: 1000,
        backoffFactor: 2,
      },
    });
    console.log('Retry request status:', response.status);
    results['requestRetry'] = response.status === 200;
  } catch (error) {
    console.error('❌ Error testing request with retry options:', error);
    results['requestRetry'] = false;
  }
  
  // Display test results summary
  console.log('\n📊 Network Utilities Test Results:');
  let passedCount = 0;
  let totalCount = 0;
  
  for (const [testName, passed] of Object.entries(results)) {
    totalCount++;
    if (passed) {
      passedCount++;
      console.log(`✅ ${testName}: PASSED`);
    } else {
      console.log(`❌ ${testName}: FAILED`);
    }
  }
  
  const passPercentage = (passedCount / totalCount) * 100;
  console.log(`\n📈 Summary: ${passedCount}/${totalCount} tests passed (${passPercentage.toFixed(2)}%)`);
  
  return {
    passed: passedCount,
    total: totalCount,
    success: passedCount === totalCount,
  };
}

// Run the tests if executed directly
if (require.main === module) {
  console.log('Running network utility tests...');
  runNetworkTests()
    .then(results => {
      console.log('Tests completed.');
      if (!results.success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error running tests:', error);
      process.exit(1);
    });
} 