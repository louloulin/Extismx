/**
 * Mastra integration module for connecting to plugin systems
 * Provides a unified interface for interacting with various plugin systems
 */

import {
  IntegrationClient,
  IntegrationServer,
  ToolDefinition,
  ToolParameters,
  ToolResult,
  IntegrationError,
  IntegrationErrorType
} from '../common/types';

/**
 * Interface for handling processing requests from Mastra to plugins
 */
export interface MastraProcessingHandler {
  /**
   * Process a request using available tools
   * @param input User input to process
   * @param availableTools Tools available for processing
   * @returns The processed result
   */
  processRequest(
    input: string, 
    availableTools: Record<string, ToolDefinition>
  ): Promise<MastraProcessingResult>;
}

/**
 * Result of processing a request through Mastra
 */
export interface MastraProcessingResult {
  response: string;
  toolUsage?: {
    toolName: string;
    input: ToolParameters;
    output: string;
  }[];
  error?: string;
}

/**
 * Configuration options for Mastra agent
 */
export interface MastraAgentOptions {
  /**
   * Name of the agent
   */
  name: string;
  
  /**
   * Description of the agent's capabilities
   */
  description?: string;
  
  /**
   * Processing handler for handling requests
   */
  processingHandler: MastraProcessingHandler;
  
  /**
   * Timeout in milliseconds for request processing
   */
  timeout?: number;
}

/**
 * Mock implementation of a Mastra Agent that can use plugins via integration clients
 */
export class MastraAgent {
  private name: string;
  private description: string;
  private processingHandler: MastraProcessingHandler;
  private timeout: number;
  private integrationClients: IntegrationClient[] = [];
  
  /**
   * Create a new Mastra agent
   * @param options Configuration options
   */
  constructor(options: MastraAgentOptions) {
    this.name = options.name;
    this.description = options.description || `${options.name} Agent`;
    this.processingHandler = options.processingHandler;
    this.timeout = options.timeout || 60000; // Default 60s timeout
  }
  
  /**
   * Add an integration client to the agent
   * @param client Integration client to add
   */
  addIntegrationClient(client: IntegrationClient): void {
    this.integrationClients.push(client);
    console.log(`Added integration client to ${this.name} agent`);
  }
  
  /**
   * Get all available tools from connected integration clients
   * @returns Combined map of all available tools
   */
  getAvailableTools(): Record<string, ToolDefinition> {
    const tools: Record<string, ToolDefinition> = {};
    
    for (const client of this.integrationClients) {
      try {
        const clientTools = client.listTools();
        
        // Merge tools, potentially prefixing with client name if there are conflicts
        for (const [name, def] of Object.entries(clientTools)) {
          if (tools[name]) {
            // If tool name already exists, prefix with something unique
            const uniqueName = `${name}_${Object.keys(tools).length}`;
            tools[uniqueName] = def;
          } else {
            tools[name] = def;
          }
        }
      } catch (error) {
        console.warn(`Error getting tools from integration client: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return tools;
  }
  
  /**
   * Process a user request using available tools
   * @param input User input to process
   * @returns Processing result
   */
  async processRequest(input: string): Promise<MastraProcessingResult> {
    console.log(`${this.name} processing request: "${input}"`);
    
    const availableTools = this.getAvailableTools();
    
    try {
      // Use timeout to prevent hanging
      const timeoutPromise = new Promise<MastraProcessingResult>((_, reject) => {
        setTimeout(() => {
          reject(new IntegrationError(
            `Request processing timed out after ${this.timeout}ms`,
            IntegrationErrorType.EXECUTION_ERROR
          ));
        }, this.timeout);
      });
      
      // Process the request using the handler
      const processingPromise = this.processingHandler.processRequest(
        input,
        availableTools
      );
      
      // Race the processing against the timeout
      const result = await Promise.race([processingPromise, timeoutPromise]);
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        response: `Error processing request: ${errorMsg}`,
        error: errorMsg
      };
    }
  }
  
  /**
   * Execute a specific tool by name
   * @param name Name of the tool to execute
   * @param params Parameters for the tool
   * @returns Result of the tool execution
   */
  async executeTool(name: string, params: ToolParameters): Promise<ToolResult> {
    for (const client of this.integrationClients) {
      try {
        const tools = client.listTools();
        
        if (Object.keys(tools).includes(name)) {
          console.log(`${this.name} executing tool: ${name}`);
          return await client.executeTool(name, params);
        }
      } catch (error) {
        // Skip this client and try the next one
        continue;
      }
    }
    
    throw new IntegrationError(
      `Tool '${name}' not found in any integration client`,
      IntegrationErrorType.TOOL_NOT_FOUND
    );
  }
}

/**
 * Simple mock implementation of MastraProcessingHandler
 * In a real implementation, this would likely use an LLM to decide when to use tools
 */
export class SimpleMastraProcessingHandler implements MastraProcessingHandler {
  /**
   * Process a request by looking for keywords that match tool names
   * @param input User input to process
   * @param availableTools Tools available for processing
   * @returns The processed result with tool usage if applicable
   */
  async processRequest(
    input: string, 
    availableTools: Record<string, ToolDefinition>
  ): Promise<MastraProcessingResult> {
    console.log('Simple processing handler analyzing input...');
    
    // Check if input contains any tool names
    const toolUsage: MastraProcessingResult['toolUsage'] = [];
    const inputLower = input.toLowerCase();
    
    for (const [name, tool] of Object.entries(availableTools)) {
      if (inputLower.includes(name.toLowerCase())) {
        try {
          // Extract a potential parameter from the input
          // This is a very simplistic approach, a real system would use NLP
          const regex = new RegExp(`${name}\\s+([\\w]+)`, 'i');
          const match = input.match(regex);
          const param = match ? match[1] : 'World';
          
          // Mock the agent's decision to use this tool
          console.log(`Agent decided to use the ${name} tool with parameter: ${param}`);
          
          // Construct tool parameters based on the tool's definition
          const params: ToolParameters = { input: param };
          
          // This would be the actual call to execute the tool in a real system
          // But for now, we'll just mock it with a timeout
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock a tool result
          const toolResult = {
            output: `${name} result for ${param}`
          };
          
          // Record the tool usage
          toolUsage.push({
            toolName: name,
            input: params,
            output: toolResult.output
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          return {
            response: `I tried to use the ${name} tool but encountered an error: ${errorMsg}`,
            error: errorMsg
          };
        }
      }
    }
    
    // Generate a response based on tool usage
    if (toolUsage.length > 0) {
      const toolOutputs = toolUsage.map(usage => `${usage.toolName}: ${usage.output}`).join('\n');
      return {
        response: `I processed your request using the following tools:\n${toolOutputs}`,
        toolUsage
      };
    }
    
    // Default response if no tools were used
    return {
      response: `I received your request: "${input}" but didn't need to use any tools to process it.`
    };
  }
} 