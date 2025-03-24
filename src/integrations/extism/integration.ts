/**
 * Mock MCP (Model Context Protocol) integration for Extism plugins
 * This simulates how Extism plugins would integrate with Mastra via MCP
 */

import { 
  IntegrationServer, 
  IntegrationClient, 
  ToolDefinition, 
  ToolResult, 
  ToolParameters,
  IntegrationError,
  IntegrationErrorType
} from '../common/types';
import { Host } from './pdk';

/**
 * Extism MCP Server implementation for hosting plugins
 */
export class ExtismMCPServer implements IntegrationServer {
  private plugins: Map<string, Function> = new Map();
  private toolDefinitions: Map<string, ToolDefinition> = new Map();
  
  /**
   * Register a plugin function as an MCP tool
   * @param name Tool name
   * @param description Tool description
   * @param handler Plugin function to execute
   */
  registerTool(name: string, description: string, handler: Function): void {
    this.plugins.set(name, handler);
    
    // Create MCP tool definition
    const toolDef: ToolDefinition = {
      name,
      description,
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'string',
            description: 'Input to the plugin'
          }
        },
        required: ['input']
      }
    };
    
    this.toolDefinitions.set(name, toolDef);
    console.log(`Registered Extism plugin as tool: ${name}`);
  }
  
  /**
   * Execute a tool by name
   * @param name Tool name to execute
   * @param params Parameters for the tool
   * @returns Result of the tool execution
   */
  executeTool(name: string, params: ToolParameters): ToolResult {
    console.log(`Executing Extism tool: ${name} with params:`, params);
    
    const handler = this.plugins.get(name);
    if (!handler) {
      return {
        output: '',
        error: `Tool '${name}' not found`
      };
    }
    
    try {
      // Reset state for a clean execution
      Host.resetMockState();
      
      // Set input for the plugin
      Host.setMockInput(params.input || '');
      
      // Execute the plugin function
      const result = handler();
      
      // Get output from the plugin
      const output = Host.getMockOutput();
      
      if (result !== 0) {
        return {
          output: '',
          error: `Plugin execution failed with code: ${result}`
        };
      }
      
      return { output };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        output: '',
        error: `Error executing tool: ${errorMsg}`
      };
    }
  }
  
  /**
   * List all available tools
   * @returns Object mapping tool names to their definitions
   */
  listTools(): Record<string, ToolDefinition> {
    const tools: Record<string, ToolDefinition> = {};
    
    for (const [name, def] of this.toolDefinitions.entries()) {
      tools[name] = def;
    }
    
    return tools;
  }
}

/**
 * Configuration options for Extism MCP client
 */
export interface ExtismMCPClientOptions {
  serverUrl: string;
  timeout?: number;
}

/**
 * Extism MCP client for Mastra integration
 */
export class ExtismMCPClient implements IntegrationClient {
  private serverUrl: string;
  private timeout: number;
  private server: ExtismMCPServer | null = null;
  
  /**
   * Create a new MCP client
   * @param options Configuration options
   */
  constructor(options: ExtismMCPClientOptions) {
    this.serverUrl = options.serverUrl || 'extism://local';
    this.timeout = options.timeout || 30000; // Default 30s timeout
  }
  
  /**
   * Connect to the MCP server
   * @param server Server instance to connect to
   */
  connect(server: IntegrationServer): void {
    if (!(server instanceof ExtismMCPServer)) {
      throw new IntegrationError(
        'Invalid server type: only ExtismMCPServer is supported',
        IntegrationErrorType.CONNECTION_ERROR
      );
    }
    
    this.server = server;
    console.log(`Connected to Extism MCP server at ${this.serverUrl}`);
  }
  
  /**
   * Disconnect from the MCP server
   */
  disconnect(): void {
    this.server = null;
    console.log('Disconnected from Extism MCP server');
  }
  
  /**
   * List available tools from the server
   * @returns Object mapping tool names to their definitions
   */
  listTools(): Record<string, ToolDefinition> {
    if (!this.server) {
      throw new IntegrationError(
        'Not connected to an MCP server',
        IntegrationErrorType.CONNECTION_ERROR
      );
    }
    
    return this.server.listTools();
  }
  
  /**
   * Execute a tool by name
   * @param name Tool name to execute
   * @param params Parameters for the tool
   * @returns Promise with the result of the tool execution
   */
  async executeTool(name: string, params: ToolParameters): Promise<ToolResult> {
    if (!this.server) {
      throw new IntegrationError(
        'Not connected to an MCP server',
        IntegrationErrorType.CONNECTION_ERROR
      );
    }
    
    const server = this.server; // Create a non-null reference
    
    return new Promise((resolve, reject) => {
      // Set timeout for execution
      const timeoutId = setTimeout(() => {
        reject(new IntegrationError(
          `Tool execution timed out after ${this.timeout}ms`,
          IntegrationErrorType.EXECUTION_ERROR
        ));
      }, this.timeout);
      
      try {
        const result = server.executeTool(name, params);
        clearTimeout(timeoutId);
        
        if (result.error) {
          reject(new IntegrationError(
            result.error,
            IntegrationErrorType.EXECUTION_ERROR
          ));
        } else {
          resolve(result);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        const errorMsg = error instanceof Error ? error.message : String(error);
        reject(new IntegrationError(
          `Failed to execute tool: ${errorMsg}`,
          IntegrationErrorType.EXECUTION_ERROR
        ));
      }
    });
  }
} 