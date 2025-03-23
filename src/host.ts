// Mock host application for Extism plugin
// This simulates loading and executing a plugin

import { hello } from './hello-plugin';
import { Host } from './extism-pdk';

/**
 * Simple host function to run the plugin with a given input
 * @param input Input string to pass to the plugin
 * @returns The output from the plugin
 */
function runPlugin(input: string): string {
  console.log(`Running plugin with input: "${input}"`);
  
  // Set the mock input
  Host.setMockInput(input);
  
  // Call the plugin function
  const result = hello();
  
  // Get the mock output
  const output = Host.getMockOutput();
  
  console.log(`Plugin returned: ${result}`);
  console.log(`Plugin output: "${output}"`);
  
  return output;
}

// Run some tests
console.log('\n=== Testing Plugin ===\n');

// Test with name
const output1 = runPlugin('Alice');
console.log(`Test 1 result: ${output1}`);

// Test with empty input
const output2 = runPlugin('');
console.log(`Test 2 result: ${output2}`);

// Test with another name
const output3 = runPlugin('Bob');
console.log(`Test 3 result: ${output3}`);

console.log('\n=== Tests Complete ===\n'); 