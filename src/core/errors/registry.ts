/**
 * Registry-specific errors
 */
import { BaseError, createErrorCode } from './index';
import { ErrorCategory, ErrorDetails, ErrorMetadata, ErrorSeverity } from './types';

/**
 * Registry error codes
 */
export enum RegistryErrorCode {
  PLUGIN_NOT_FOUND = 1,
  PLUGIN_ALREADY_EXISTS = 2,
  INVALID_PLUGIN_METADATA = 3,
  INVALID_PLUGIN_CONTENT = 4,
  PLUGIN_TOO_LARGE = 5,
  PLUGIN_VERIFICATION_FAILED = 6,
  STORAGE_ERROR = 7,
  INVALID_QUERY = 8,
  UNAUTHORIZED_ACCESS = 9,
  INVALID_STATUS_TRANSITION = 10,
  PLUGIN_SIGNING_FAILED = 11,
  MISSING_REQUIRED_TAG = 12,
  INVALID_PLUGIN_VISIBILITY = 13
}

/**
 * Registry error class for registry-related errors
 */
export class RegistryError extends BaseError {
  /**
   * Create a new RegistryError
   * 
   * @param message - Error message
   * @param code - Registry error code
   * @param severity - Error severity
   * @param details - Additional error details
   */
  constructor(
    message: string,
    code: RegistryErrorCode,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    details?: ErrorDetails
  ) {
    const metadata: ErrorMetadata = {
      code: createErrorCode(ErrorCategory.REGISTRY, code),
      severity,
      category: ErrorCategory.REGISTRY,
      retryable: false
    };
    
    // Add recommendations based on error code
    switch (code) {
      case RegistryErrorCode.PLUGIN_NOT_FOUND:
        metadata.action = 'Check that the plugin ID is correct and that the plugin exists';
        break;
      case RegistryErrorCode.PLUGIN_ALREADY_EXISTS:
        metadata.action = 'Use a different name or version for your plugin';
        break;
      case RegistryErrorCode.INVALID_PLUGIN_METADATA:
        metadata.action = 'Ensure plugin metadata follows the required format and contains all required fields';
        break;
      case RegistryErrorCode.PLUGIN_TOO_LARGE:
        metadata.action = 'Reduce the size of your plugin or request a size limit increase';
        break;
      case RegistryErrorCode.STORAGE_ERROR:
        metadata.retryable = true;
        metadata.action = 'Retry the operation. If the problem persists, contact support';
        break;
      case RegistryErrorCode.INVALID_QUERY:
        metadata.action = 'Check the query parameters and ensure they are valid';
        break;
      case RegistryErrorCode.MISSING_REQUIRED_TAG:
        metadata.action = 'Add the required tag to your plugin metadata';
        break;
    }
    
    super(message, metadata, details);
  }
  
  /**
   * Create a "Plugin not found" error
   * 
   * @param pluginId - The ID of the plugin that was not found
   * @param details - Additional error details
   */
  static pluginNotFound(pluginId: string, details?: ErrorDetails): RegistryError {
    return new RegistryError(
      `Plugin not found: ${pluginId}`,
      RegistryErrorCode.PLUGIN_NOT_FOUND,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Plugin already exists" error
   * 
   * @param name - Plugin name
   * @param version - Plugin version
   * @param details - Additional error details
   */
  static pluginAlreadyExists(name: string, version: string, details?: ErrorDetails): RegistryError {
    return new RegistryError(
      `Plugin already exists: ${name}@${version}`,
      RegistryErrorCode.PLUGIN_ALREADY_EXISTS,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create an "Invalid plugin metadata" error
   * 
   * @param reason - The reason why the metadata is invalid
   * @param details - Additional error details
   */
  static invalidMetadata(reason?: string, details?: ErrorDetails): RegistryError {
    const message = reason 
      ? `Invalid plugin metadata: ${reason}`
      : 'Invalid plugin metadata';
      
    return new RegistryError(
      message,
      RegistryErrorCode.INVALID_PLUGIN_METADATA,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Plugin too large" error
   * 
   * @param size - The size of the plugin
   * @param maxSize - The maximum allowed size
   * @param details - Additional error details
   */
  static pluginTooLarge(size: number, maxSize: number, details?: ErrorDetails): RegistryError {
    return new RegistryError(
      `Plugin size (${size} bytes) exceeds maximum allowed size (${maxSize} bytes)`,
      RegistryErrorCode.PLUGIN_TOO_LARGE,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Storage error" error
   * 
   * @param operation - The storage operation that failed
   * @param cause - The underlying error that caused this error
   * @param details - Additional error details
   */
  static storageError(operation: string, cause?: Error, details?: ErrorDetails): RegistryError {
    return new RegistryError(
      `Storage operation failed: ${operation}`,
      RegistryErrorCode.STORAGE_ERROR,
      ErrorSeverity.ERROR,
      { ...details, cause }
    );
  }
  
  /**
   * Create an "Invalid query" error
   * 
   * @param reason - The reason why the query is invalid
   * @param details - Additional error details
   */
  static invalidQuery(reason?: string, details?: ErrorDetails): RegistryError {
    const message = reason 
      ? `Invalid query: ${reason}`
      : 'Invalid query';
      
    return new RegistryError(
      message,
      RegistryErrorCode.INVALID_QUERY,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Missing required tag" error
   * 
   * @param tag - The tag that is required
   * @param details - Additional error details
   */
  static missingRequiredTag(tag: string, details?: ErrorDetails): RegistryError {
    return new RegistryError(
      `Missing required tag: ${tag}`,
      RegistryErrorCode.MISSING_REQUIRED_TAG,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create an "Invalid plugin visibility" error
   * 
   * @param visibility - The invalid visibility value
   * @param details - Additional error details
   */
  static invalidVisibility(visibility: string, details?: ErrorDetails): RegistryError {
    return new RegistryError(
      `Invalid plugin visibility: ${visibility}`,
      RegistryErrorCode.INVALID_PLUGIN_VISIBILITY,
      ErrorSeverity.ERROR,
      details
    );
  }
} 