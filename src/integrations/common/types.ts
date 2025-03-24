/**
 * Common integration types for plugin execution environments
 */

/**
 * Definition of a tool for integration systems
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties?: Record<string, {
      type: string;
      description: string;
      required?: boolean;
    }>;
    required?: string[];
  };
}

/**
 * Result of a tool execution
 */
export interface ToolResult {
  output: string;
  error?: string;
}

/**
 * Parameters passed to a tool during execution
 */
export interface ToolParameters {
  [key: string]: any;
}

/**
 * Base interface for integration clients
 */
export interface IntegrationClient {
  /**
   * Connect to the integration server
   */
  connect(server: IntegrationServer): void;
  
  /**
   * Disconnect from the integration server
   */
  disconnect(): void;
  
  /**
   * List available tools from the server
   */
  listTools(): Record<string, ToolDefinition>;
  
  /**
   * Execute a tool by name
   */
  executeTool(name: string, params: ToolParameters): Promise<ToolResult>;
}

/**
 * Base interface for integration servers
 */
export interface IntegrationServer {
  /**
   * Register a plugin function as a tool
   */
  registerTool(name: string, description: string, handler: Function): void;
  
  /**
   * Execute a tool by name
   */
  executeTool(name: string, params: ToolParameters): ToolResult;
  
  /**
   * List all available tools
   */
  listTools(): Record<string, ToolDefinition>;
}

/**
 * Error types for integration operations
 */
export enum IntegrationErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TOOL_NOT_FOUND = 'TOOL_NOT_FOUND',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Integration error class for handling exceptions
 */
export class IntegrationError extends Error {
  type: IntegrationErrorType;

  constructor(message: string, type: IntegrationErrorType = IntegrationErrorType.UNKNOWN_ERROR) {
    super(message);
    this.name = 'IntegrationError';
    this.type = type;
  }
} 