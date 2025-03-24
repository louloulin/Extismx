/**
 * Core error handling system
 */
import { 
  ErrorCategory, 
  ErrorDetails, 
  ErrorMetadata, 
  ErrorSeverity, 
  SerializedError,
  ERROR_CODE_PREFIXES
} from './types';

/**
 * Base error class for all application errors
 */
export class BaseError extends Error {
  /**
   * Error code (e.g., "ERR-REG-001")
   */
  public readonly code: string;
  
  /**
   * Error severity level
   */
  public readonly severity: ErrorSeverity;
  
  /**
   * Error category
   */
  public readonly category: ErrorCategory;
  
  /**
   * Additional error details
   */
  public readonly details?: ErrorDetails;
  
  /**
   * Whether the error is retryable
   */
  public readonly retryable: boolean;
  
  /**
   * Recommended action to fix the error
   */
  public readonly action?: string;
  
  /**
   * Documentation URL for more information
   */
  public readonly docs?: string;
  
  /**
   * Timestamp when the error occurred
   */
  public readonly timestamp: Date;

  /**
   * Create a new BaseError
   * 
   * @param message - Error message
   * @param metadata - Error metadata including code, severity, category
   * @param details - Additional error details
   */
  constructor(
    message: string, 
    metadata: ErrorMetadata, 
    details?: ErrorDetails
  ) {
    super(message);
    
    // Set error name to the constructor name for better debugging
    this.name = this.constructor.name;
    
    // Assign metadata
    this.code = metadata.code;
    this.severity = metadata.severity;
    this.category = metadata.category;
    this.retryable = metadata.retryable ?? false;
    this.action = metadata.action;
    this.docs = metadata.docs;
    
    // Assign details
    this.details = details;
    
    // Capture stack trace
    if (details?.stack) {
      this.stack = details.stack;
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    // Set timestamp
    this.timestamp = new Date();
  }

  /**
   * Convert the error to a plain object for serialization
   */
  public toJSON(): SerializedError {
    return {
      message: this.message,
      code: this.code,
      name: this.name,
      severity: this.severity,
      category: this.category,
      details: this.details,
      stack: this.stack,
      timestamp: this.timestamp.toISOString()
    };
  }

  /**
   * Create a formatted string representation of the error
   */
  public toString(): string {
    return `[${this.code}] ${this.severity.toUpperCase()}: ${this.message}`;
  }
}

/**
 * Factory function to create error codes with the correct prefix
 * 
 * @param category - Error category
 * @param code - Numeric error code
 * @returns Formatted error code
 */
export function createErrorCode(category: ErrorCategory, code: number): string {
  const prefix = ERROR_CODE_PREFIXES[category] || 'UNK';
  return `ERR-${prefix}-${code.toString().padStart(3, '0')}`;
}

/**
 * Create a new error with the specified metadata
 * 
 * @param message - Error message
 * @param metadata - Error metadata
 * @param details - Additional error details
 * @returns BaseError instance
 */
export function createError(
  message: string,
  metadata: ErrorMetadata,
  details?: ErrorDetails
): BaseError {
  return new BaseError(message, metadata, details);
}

// Re-export types
export * from './types';

// Export specific error modules
export * from './registry';
export * from './security';
export * from './config';
export * from './pdk';
export * from './integration'; 