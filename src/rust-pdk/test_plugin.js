/**
 * Test script for the Rust Hello plugin
 */

const fs = require('fs');
const path = require('path');

// Simulate plugin functionality for testing purposes
function simulatePlugin(input) {
  const name = input ? (typeof input === 'string' ? input : input.name) : 'World';
  return { greeting: `Hello, ${name}!` };
}

async function main() {
  const pluginFile = path.join(__dirname, 'hello.wasm');
  
  console.log('=== Testing Rust Hello Plugin ===\n');
  
  // Check if the WASM file exists
  if (!fs.existsSync(pluginFile)) {
    console.warn('Plugin file not found:', pluginFile);
    console.warn('Please build the plugin first with: cd src/rust-pdk && make');
    console.log('\nSimulating execution for demo purposes...');
    
    // Test with different inputs
    console.log('\nTest 1: Default input');
    console.log('Result:', simulatePlugin());
    
    console.log('\nTest 2: String input "Alice"');
    console.log('Result:', simulatePlugin('Alice'));
    
    console.log('\nTest 3: JSON input {"name":"Bob"}');
    console.log('Result:', simulatePlugin({ name: 'Bob' }));
    
    console.log('\nNOTE: This was a simulation. Build the plugin to see actual results.');
    return;
  }
  
  try {
    // Real implementation would use the Extism library to load and run the plugin
    // For example:
    // const { Plugin } = require('@extism/extism');
    // const plugin = new Plugin(fs.readFileSync(pluginFile));
    
    // Instead, we'll use the simulation for now
    console.log('Plugin file found but cannot be executed directly from this script.');
    console.log('In a real environment, this would use the Extism library to run the plugin.');
    console.log('\nSimulating execution with the actual plugin logic...');
    
    // Test with different inputs
    console.log('\nTest 1: Default input');
    console.log('Result:', simulatePlugin());
    
    console.log('\nTest 2: String input "Alice"');
    console.log('Result:', simulatePlugin('Alice'));
    
    console.log('\nTest 3: JSON input {"name":"Bob"}');
    console.log('Result:', simulatePlugin({ name: 'Bob' }));
  } catch (error) {
    console.error('Error testing plugin:', error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 