/**
 * Integration demonstration
 * Shows how Mastra can use Extism plugins via the MCP integration
 */

import { ExtismMCPServer, ExtismMCPClient } from './extism/integration';
import { hello } from './extism/hello-plugin';
import { MastraAgent, SimpleMastraProcessingHandler } from './mastra/integration';

/**
 * Run the integration demonstration
 */
async function runDemo() {
  console.log('\n===== Mastra + Extism Integration Demo =====\n');
  
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
  console.log('\nSTEP 3: Creating Extism MCP client...');
  const client = new ExtismMCPClient({
    serverUrl: 'extism://plugins'
  });
  
  // Step 4: Connect client to server
  console.log('\nSTEP 4: Connecting client to server...');
  client.connect(server);
  
  // Step 5: List available tools
  console.log('\nSTEP 5: Listing available tools...');
  const tools = client.listTools();
  console.log('Available tools:', JSON.stringify(tools, null, 2));
  
  // Step 6: Create a Mastra agent with the Simple processing handler
  console.log('\nSTEP 6: Creating Mastra agent...');
  const agent = new MastraAgent({
    name: 'DemoAgent',
    description: 'A demonstration agent that can use Extism plugins',
    processingHandler: new SimpleMastraProcessingHandler()
  });
  
  // Step 7: Add the Extism client to the agent
  console.log('\nSTEP 7: Adding Extism client to agent...');
  agent.addIntegrationClient(client);
  
  // Step 8: Process a request that should trigger the greeting tool
  console.log('\nSTEP 8: Processing a request that uses the greeting tool...');
  const request1 = 'Can you provide a greeting for Alice?';
  console.log(`User: ${request1}`);
  
  try {
    const result1 = await agent.processRequest(request1);
    console.log(`Agent: ${result1.response}`);
    
    if (result1.toolUsage && result1.toolUsage.length > 0) {
      console.log('\nTool usage details:');
      console.log(JSON.stringify(result1.toolUsage, null, 2));
    }
  } catch (error) {
    console.error('Error processing request:', error);
  }
  
  // Step 9: Directly execute a tool
  console.log('\nSTEP 9: Directly executing the greeting tool...');
  try {
    const toolResult = await agent.executeTool('greeting', { input: 'Bob' });
    console.log('Tool result:', toolResult);
  } catch (error) {
    console.error('Error executing tool:', error);
  }
  
  // Step 10: Process a request that doesn't use any tools
  console.log('\nSTEP 10: Processing a request that doesn\'t use any tools...');
  const request2 = 'What is the current weather?';
  console.log(`User: ${request2}`);
  
  try {
    const result2 = await agent.processRequest(request2);
    console.log(`Agent: ${result2.response}`);
  } catch (error) {
    console.error('Error processing request:', error);
  }
  
  // Step 11: Disconnect the client
  console.log('\nSTEP 11: Disconnecting client from server...');
  client.disconnect();
  
  console.log('\n===== Demo Complete =====\n');
}

// Run the demo when file is executed directly
if (require.main === module) {
  runDemo().catch(error => {
    console.error('Error in demo:', error);
    process.exit(1);
  });
}

export { runDemo }; 