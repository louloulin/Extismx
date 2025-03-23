// Mock MCP (Model Context Protocol) integration for Extism plugins
// This simulates how Extism plugins would integrate with Mastra via MCP

import { Host } from './extism-pdk';

/**
 * Tool definition for MCP schema
 */
interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties?: Record<string, {
      type: string;
      description: string;
    }>;
    required?: string[];
  };
}

/**
 * Result of a tool execution
 */
interface ToolResult {
  output: string;
  error?: string;
}

/**
 * MCP server implementation for Extism plugins
 */
export class ExtismMCPServer {
  private plugins: Map<string, Function> = new Map();
  private toolDefinitions: Map<string, MCPTool> = new Map();
  
  /**
   * Register a plugin function as an MCP tool
   * @param name Tool name
   * @param description Tool description
   * @param fn Plugin function to execute
   */
  registerTool(name: string, description: string, fn: Function): void {
    this.plugins.set(name, fn);
    
    // Create MCP tool definition
    const toolDef: MCPTool = {
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
    console.log(`Registered tool: ${name}`);
  }
  
  /**
   * Execute a tool by name
   * @param name Tool name to execute
   * @param params Parameters for the tool
   * @returns Result of the tool execution
   */
  executeTool(name: string, params: any): ToolResult {
    console.log(`Executing tool: ${name} with params:`, params);
    
    const fn = this.plugins.get(name);
    if (!fn) {
      return {
        output: '',
        error: `Tool '${name}' not found`
      };
    }
    
    try {
      // Set input for the plugin
      Host.setMockInput(params.input || '');
      
      // Execute the plugin function
      const result = fn();
      
      // Get output from the plugin
      const output = Host.getMockOutput();
      
      return { output };
    } catch (error) {
      return {
        output: '',
        error: `Error executing tool: ${error}`
      };
    }
  }
  
  /**
   * List all available tools
   * @returns Object mapping tool names to their definitions
   */
  listTools(): Record<string, MCPTool> {
    const tools: Record<string, MCPTool> = {};
    
    for (const [name, def] of this.toolDefinitions.entries()) {
      tools[name] = def;
    }
    
    return tools;
  }
}

/**
 * MCP client implementation for Mastra
 */
export class MastraMCPClient {
  private serverUrl: string;
  private server: ExtismMCPServer | null = null;
  
  /**
   * Create a new MCP client
   * @param serverUrl URL of the MCP server (mock in this case)
   */
  constructor(serverUrl: string = 'extism://local') {
    this.serverUrl = serverUrl;
  }
  
  /**
   * Connect to the MCP server
   * @param server Server instance to connect to
   */
  connect(server: ExtismMCPServer): void {
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
  listTools(): Record<string, MCPTool> {
    if (!this.server) {
      throw new Error('Not connected to an MCP server');
    }
    
    return this.server.listTools();
  }
  
  /**
   * Execute a tool by name
   * @param name Tool name to execute
   * @param params Parameters for the tool
   * @returns Result of the tool execution
   */
  executeTool(name: string, params: any): ToolResult {
    if (!this.server) {
      throw new Error('Not connected to an MCP server');
    }
    
    return this.server.executeTool(name, params);
  }
} 