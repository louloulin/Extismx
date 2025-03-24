/**
 * Integration-specific errors
 */
import { BaseError, createErrorCode } from './index';
import { ErrorCategory, ErrorDetails, ErrorMetadata, ErrorSeverity } from './types';

/**
 * Integration error codes
 */
export enum IntegrationErrorCode {
  INITIALIZATION_FAILED = 1,
  PLUGIN_LOAD_FAILED = 2,
  PLUGIN_EXECUTION_FAILED = 3,
  INVALID_PLUGIN_FORMAT = 4,
  COMMUNICATION_FAILED = 5,
  TIMEOUT = 6,
  UNSUPPORTED_OPERATION = 7,
  HOST_ERROR = 8,
  PLUGIN_INTERNAL_ERROR = 9,
  TOOL_INVOCATION_FAILED = 10,
  CALLBACK_ERROR = 11,
  MISSING_TOOL_DEFINITION = 12
}

/**
 * Integration error class for integration-related errors
 */
export class IntegrationError extends BaseError {
  /**
   * Create a new IntegrationError
   * 
   * @param message - Error message
   * @param code - Integration error code
   * @param severity - Error severity
   * @param details - Additional error details
   */
  constructor(
    message: string,
    code: IntegrationErrorCode,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    details?: ErrorDetails
  ) {
    const metadata: ErrorMetadata = {
      code: createErrorCode(ErrorCategory.INTEGRATION, code),
      severity,
      category: ErrorCategory.INTEGRATION,
      retryable: code === IntegrationErrorCode.COMMUNICATION_FAILED || code === IntegrationErrorCode.TIMEOUT
    };
    
    // Add recommendations based on error code
    switch (code) {
      case IntegrationErrorCode.INITIALIZATION_FAILED:
        metadata.action = 'Check integration configuration and ensure all dependencies are installed';
        break;
      case IntegrationErrorCode.PLUGIN_LOAD_FAILED:
        metadata.action = 'Verify that the plugin exists and is compatible with the current system';
        break;
      case IntegrationErrorCode.PLUGIN_EXECUTION_FAILED:
        metadata.action = 'Check plugin logs for details on the failure';
        break;
      case IntegrationErrorCode.COMMUNICATION_FAILED:
        metadata.action = 'Check network connectivity and try again';
        break;
      case IntegrationErrorCode.TIMEOUT:
        metadata.action = 'Increase the timeout value or optimize the operation';
        break;
    }
    
    super(message, metadata, details);
  }
  
  /**
   * Create an "Initialization failed" error
   * 
   * @param reason - The reason why initialization failed
   * @param details - Additional error details
   */
  static initializationFailed(reason?: string, details?: ErrorDetails): IntegrationError {
    const message = reason
      ? `Integration initialization failed: ${reason}`
      : 'Integration initialization failed';
      
    return new IntegrationError(
      message,
      IntegrationErrorCode.INITIALIZATION_FAILED,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Plugin load failed" error
   * 
   * @param pluginId - The ID of the plugin that failed to load
   * @param reason - The reason why the plugin failed to load
   * @param details - Additional error details
   */
  static pluginLoadFailed(
    pluginId: string,
    reason?: string,
    details?: ErrorDetails
  ): IntegrationError {
    const reasonText = reason ? `: ${reason}` : '';
    
    return new IntegrationError(
      `Failed to load plugin ${pluginId}${reasonText}`,
      IntegrationErrorCode.PLUGIN_LOAD_FAILED,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Plugin execution failed" error
   * 
   * @param pluginId - The ID of the plugin that failed to execute
   * @param operation - The operation that was being executed
   * @param error - The error that occurred during execution
   * @param details - Additional error details
   */
  static pluginExecutionFailed(
    pluginId: string,
    operation: string,
    error?: Error,
    details?: ErrorDetails
  ): IntegrationError {
    const errorText = error ? `: ${error.message}` : '';
    
    return new IntegrationError(
      `Plugin ${pluginId} failed to execute operation "${operation}"${errorText}`,
      IntegrationErrorCode.PLUGIN_EXECUTION_FAILED,
      ErrorSeverity.ERROR,
      { ...details, cause: error }
    );
  }
  
  /**
   * Create a "Communication failed" error
   * 
   * @param system - The system that communication failed with
   * @param reason - The reason why communication failed
   * @param details - Additional error details
   */
  static communicationFailed(
    system: string,
    reason?: string,
    details?: ErrorDetails
  ): IntegrationError {
    const reasonText = reason ? `: ${reason}` : '';
    
    return new IntegrationError(
      `Communication with ${system} failed${reasonText}`,
      IntegrationErrorCode.COMMUNICATION_FAILED,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Timeout" error
   * 
   * @param operation - The operation that timed out
   * @param timeout - The timeout value in milliseconds
   * @param details - Additional error details
   */
  static timeout(
    operation: string,
    timeout: number,
    details?: ErrorDetails
  ): IntegrationError {
    return new IntegrationError(
      `Operation "${operation}" timed out after ${timeout}ms`,
      IntegrationErrorCode.TIMEOUT,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Tool invocation failed" error
   * 
   * @param toolName - The name of the tool that failed
   * @param reason - The reason why the tool invocation failed
   * @param details - Additional error details
   */
  static toolInvocationFailed(
    toolName: string,
    reason?: string,
    details?: ErrorDetails
  ): IntegrationError {
    const reasonText = reason ? `: ${reason}` : '';
    
    return new IntegrationError(
      `Tool invocation failed for "${toolName}"${reasonText}`,
      IntegrationErrorCode.TOOL_INVOCATION_FAILED,
      ErrorSeverity.ERROR,
      details
    );
  }
} 