// A simple Extism plugin that says hello
// This is a plugin implementation in TypeScript

import { Host } from './extism-pdk';

// The hello function takes a name input and returns a greeting
export function hello(): number {
  // Read the input string
  const input = Host.inputString();
  
  // Generate greeting
  const greeting = `Hello, ${input || 'World'}! This is a simple Extism plugin.`;
  
  // Return the greeting as output
  Host.outputString(greeting);
  
  // Return 0 to indicate success
  return 0;
} 