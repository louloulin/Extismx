/**
 * Configuration-specific errors
 */
import { BaseError, createErrorCode } from './index';
import { ErrorCategory, ErrorDetails, ErrorMetadata, ErrorSeverity } from './types';

/**
 * Configuration error codes
 */
export enum ConfigErrorCode {
  CONFIG_NOT_FOUND = 1,
  INVALID_CONFIG = 2,
  MISSING_REQUIRED_FIELD = 3,
  TYPE_MISMATCH = 4,
  INVALID_VALUE = 5,
  CONFIG_LOAD_FAILED = 6,
  CONFIG_SAVE_FAILED = 7,
  ENV_LOAD_FAILED = 8,
  INVALID_PATH = 9,
  PERMISSION_DENIED = 10,
  CONFIG_LOCKED = 11
}

/**
 * Configuration error class for configuration-related errors
 */
export class ConfigError extends BaseError {
  /**
   * Create a new ConfigError
   * 
   * @param message - Error message
   * @param code - Configuration error code
   * @param severity - Error severity
   * @param details - Additional error details
   */
  constructor(
    message: string,
    code: ConfigErrorCode,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    details?: ErrorDetails
  ) {
    const metadata: ErrorMetadata = {
      code: createErrorCode(ErrorCategory.CONFIG, code),
      severity,
      category: ErrorCategory.CONFIG,
      retryable: false
    };
    
    // Add recommendations based on error code
    switch (code) {
      case ConfigErrorCode.CONFIG_NOT_FOUND:
        metadata.action = 'Create a new configuration file or specify a different path';
        break;
      case ConfigErrorCode.INVALID_CONFIG:
        metadata.action = 'Check the configuration format and ensure it is valid';
        break;
      case ConfigErrorCode.MISSING_REQUIRED_FIELD:
        metadata.action = 'Add the required field to the configuration';
        break;
      case ConfigErrorCode.PERMISSION_DENIED:
        metadata.action = 'Check file permissions and ensure you have access to the configuration file';
        break;
      case ConfigErrorCode.CONFIG_LOAD_FAILED:
        metadata.action = 'Check that the configuration file exists and is readable';
        break;
      case ConfigErrorCode.CONFIG_SAVE_FAILED:
        metadata.action = 'Check that the destination is writable and has sufficient space';
        break;
    }
    
    super(message, metadata, details);
  }
  
  /**
   * Create a "Configuration not found" error
   * 
   * @param path - The path that was being accessed
   * @param details - Additional error details
   */
  static configNotFound(path: string, details?: ErrorDetails): ConfigError {
    return new ConfigError(
      `Configuration not found at: ${path}`,
      ConfigErrorCode.CONFIG_NOT_FOUND,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create an "Invalid configuration" error
   * 
   * @param reason - The reason why the configuration is invalid
   * @param details - Additional error details
   */
  static invalidConfig(reason?: string, details?: ErrorDetails): ConfigError {
    const message = reason
      ? `Invalid configuration: ${reason}`
      : 'Invalid configuration';
      
    return new ConfigError(
      message,
      ConfigErrorCode.INVALID_CONFIG,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Missing required field" error
   * 
   * @param field - The name of the required field
   * @param details - Additional error details
   */
  static missingRequiredField(field: string, details?: ErrorDetails): ConfigError {
    return new ConfigError(
      `Missing required configuration field: ${field}`,
      ConfigErrorCode.MISSING_REQUIRED_FIELD,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Type mismatch" error
   * 
   * @param field - The field with the wrong type
   * @param expectedType - The expected type
   * @param actualType - The actual type
   * @param details - Additional error details
   */
  static typeMismatch(
    field: string,
    expectedType: string,
    actualType: string,
    details?: ErrorDetails
  ): ConfigError {
    return new ConfigError(
      `Type mismatch for field "${field}": expected ${expectedType}, got ${actualType}`,
      ConfigErrorCode.TYPE_MISMATCH,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create an "Invalid value" error
   * 
   * @param field - The field with the invalid value
   * @param value - The invalid value
   * @param reason - The reason why the value is invalid
   * @param details - Additional error details
   */
  static invalidValue(
    field: string,
    value: any,
    reason?: string,
    details?: ErrorDetails
  ): ConfigError {
    const reasonText = reason ? `: ${reason}` : '';
    
    return new ConfigError(
      `Invalid value for field "${field}": ${JSON.stringify(value)}${reasonText}`,
      ConfigErrorCode.INVALID_VALUE,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Configuration load failed" error
   * 
   * @param path - The path that was being loaded
   * @param cause - The underlying error that caused this error
   * @param details - Additional error details
   */
  static loadFailed(path: string, cause?: Error, details?: ErrorDetails): ConfigError {
    return new ConfigError(
      `Failed to load configuration from: ${path}`,
      ConfigErrorCode.CONFIG_LOAD_FAILED,
      ErrorSeverity.ERROR,
      { ...details, cause }
    );
  }
  
  /**
   * Create a "Configuration save failed" error
   * 
   * @param path - The path that was being saved to
   * @param cause - The underlying error that caused this error
   * @param details - Additional error details
   */
  static saveFailed(path: string, cause?: Error, details?: ErrorDetails): ConfigError {
    return new ConfigError(
      `Failed to save configuration to: ${path}`,
      ConfigErrorCode.CONFIG_SAVE_FAILED,
      ErrorSeverity.ERROR,
      { ...details, cause }
    );
  }
} 