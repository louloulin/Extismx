// Simulation of Mastra Agent using Extism plugins via MCP
// This demonstrates the integration between Mastra and Extism

import { ExtismMCPServer, MastraMCPClient } from './extism-mcp';
import { hello } from './hello-plugin';

// Main implementation
async function main() {
  console.log('\n=== Mastra + Extism Integration Demo ===\n');
  
  // Step 1: Create an ExtismMCPServer
  console.log('STEP 1: Creating Extism MCP Server...');
  const server = new ExtismMCPServer();
  
  // Step 2: Register the hello plugin as a tool
  console.log('\nSTEP 2: Registering plugin as MCP tool...');
  server.registerTool(
    'greeting',
    'A tool that generates a friendly greeting for a person',
    hello
  );
  
  // Step 3: Create a Mastra MCP client
  console.log('\nSTEP 3: Creating Mastra MCP client...');
  const client = new MastraMCPClient('extism://plugins');
  
  // Step 4: Connect client to server
  console.log('\nSTEP 4: Connecting client to server...');
  client.connect(server);
  
  // Step 5: List available tools
  console.log('\nSTEP 5: Listing available tools...');
  const tools = client.listTools();
  console.log('Available tools:', JSON.stringify(tools, null, 2));
  
  // Step 6: Mock Mastra agent using the tool
  console.log('\nSTEP 6: Mock Mastra agent using the tool...');
  console.log('Agent received query: "Greet the user named Charlie"');
  console.log('Agent identifies need to use the greeting tool');
  
  // Step 7: Execute the tool
  console.log('\nSTEP 7: Agent executing the tool...');
  const result = client.executeTool('greeting', { input: 'Charlie' });
  console.log('Tool result:', result);
  
  // Step 8: Agent uses the tool result in its response
  console.log('\nSTEP 8: Agent response using tool output...');
  console.log(`Agent: I've prepared a greeting for you: "${result.output}"`);
  
  // Step 9: Disconnect
  console.log('\nSTEP 9: Disconnecting client from server...');
  client.disconnect();
  
  console.log('\n=== Demo Complete ===\n');
}

// Run the demo
main().catch(error => {
  console.error('Error in demo:', error);
}); 