/**
 * A simple Extism plugin that generates greetings
 * This is a plugin implementation in TypeScript using the mock PDK
 */

import { Host } from './pdk';

/**
 * The hello function takes a name input and returns a greeting
 * @returns 0 for success, non-zero for error
 */
export function hello(): number {
  // Read the input string
  const input = Host.inputString();
  
  // Generate greeting
  const greeting = `Hello, ${input || 'World'}! This is a simple Extism plugin.`;
  
  // Log the operation for debugging
  Host.logString(`Generating greeting for: ${input || 'World'}`);
  
  // Return the greeting as output
  Host.outputString(greeting);
  
  // Return 0 to indicate success
  return 0;
} 