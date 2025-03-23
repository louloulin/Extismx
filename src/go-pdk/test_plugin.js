// Test script for the Go hello plugin

const { Plugin } = require('@extism/extism');
const fs = require('fs');
const path = require('path');

async function testGoPlugin() {
  console.log('=== Testing Go Hello Plugin ===\n');
  
  // Check if plugin exists
  const pluginPath = path.join(__dirname, 'hello_plugin.wasm');
  if (!fs.existsSync(pluginPath)) {
    console.error('Error: Plugin file not found at', pluginPath);
    console.error('Please build the plugin first with `cd src/go-pdk && make hello`');
    process.exit(1);
  }
  
  // Read plugin wasm file
  const wasmBytes = fs.readFileSync(pluginPath);
  
  // Create plugin instance
  const plugin = new Plugin(wasmBytes, {
    useWasi: true
  });
  
  console.log('Plugin loaded successfully');
  
  // Test with different inputs
  const inputs = ['World', 'Extism', 'Go Plugin'];
  
  for (const input of inputs) {
    console.log(`\n--- Testing with input: "${input}" ---`);
    
    // Call plugin
    const result = plugin.call('hello', Buffer.from(input));
    
    // Convert result to string
    const output = Buffer.from(result).toString();
    
    console.log('Output:', output);
  }
  
  // Test with empty input (should default to "World")
  console.log('\n--- Testing with empty input ---');
  const emptyResult = plugin.call('hello', Buffer.from(''));
  console.log('Output:', Buffer.from(emptyResult).toString());
  
  // Clean up
  plugin.free();
  
  console.log('\n=== Go Plugin Test Completed ===');
}

// Run the test
testGoPlugin().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}); 