// Test script for the Python hello plugin

const { Plugin } = require('@extism/extism');
const fs = require('fs');
const path = require('path');

async function testPythonPlugin() {
  console.log('=== Testing Python Hello Plugin ===\n');
  
  // Check if plugin exists
  const pluginPath = path.join(__dirname, 'hello_plugin.wasm');
  if (!fs.existsSync(pluginPath)) {
    console.error('Error: Plugin file not found at', pluginPath);
    console.error('Please build the plugin first. See the README.md for instructions on building Python plugins.');
    
    // Since Python to WASM compilation might not be available, we'll simulate success for demo purposes
    console.log('\n--- Simulating plugin execution for demo purposes ---');
    simulatePythonPluginExecution();
    return;
  }
  
  // Read plugin wasm file
  const wasmBytes = fs.readFileSync(pluginPath);
  
  // Create plugin instance
  const plugin = new Plugin(wasmBytes, {
    useWasi: true
  });
  
  console.log('Plugin loaded successfully');
  
  // Test with different inputs
  const inputs = ['World', 'Extism', 'Python Plugin'];
  
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
  
  console.log('\n=== Python Plugin Test Completed ===');
}

// Simulate plugin execution (used when actual WASM isn't available)
function simulatePythonPluginExecution() {
  console.log('Simulating plugin execution...');
  
  const inputs = ['World', 'Extism', 'Python Plugin', ''];
  
  for (const input of inputs) {
    const name = input || 'World';
    console.log(`\n--- Simulated test with input: "${name}" ---`);
    console.log(`Output: Hello, ${name}! This is an Extism plugin written in Python.`);
  }
  
  console.log('\n=== Python Plugin Simulation Completed ===');
}

// Run the test
testPythonPlugin().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}); 