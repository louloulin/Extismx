/**
 * Security-specific errors
 */
import { BaseError, createErrorCode } from './index';
import { ErrorCategory, ErrorDetails, ErrorMetadata, ErrorSeverity } from './types';

/**
 * Security error codes
 */
export enum SecurityErrorCode {
  SIGNATURE_VERIFICATION_FAILED = 1,
  SIGNATURE_CREATION_FAILED = 2,
  KEY_GENERATION_FAILED = 3,
  INVALID_KEY_FORMAT = 4,
  KEY_NOT_FOUND = 5,
  UNAUTHORIZED_ACCESS = 6,
  UNSUPPORTED_ALGORITHM = 7,
  ENCRYPTION_FAILED = 8,
  DECRYPTION_FAILED = 9,
  INVALID_CERTIFICATE = 10,
  CERTIFICATE_EXPIRED = 11,
  INSUFFICIENT_PERMISSIONS = 12,
  TOKEN_EXPIRED = 13,
  INVALID_TOKEN = 14
}

/**
 * Security error class for security-related errors
 */
export class SecurityError extends BaseError {
  /**
   * Create a new SecurityError
   * 
   * @param message - Error message
   * @param code - Security error code
   * @param severity - Error severity
   * @param details - Additional error details
   */
  constructor(
    message: string,
    code: SecurityErrorCode,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    details?: ErrorDetails
  ) {
    const metadata: ErrorMetadata = {
      code: createErrorCode(ErrorCategory.SECURITY, code),
      severity,
      category: ErrorCategory.SECURITY,
      retryable: false
    };
    
    // Add recommendations based on error code
    switch (code) {
      case SecurityErrorCode.SIGNATURE_VERIFICATION_FAILED:
        metadata.action = 'Check that the content has not been tampered with and the correct public key is being used';
        break;
      case SecurityErrorCode.SIGNATURE_CREATION_FAILED:
        metadata.action = 'Ensure you have a valid private key and the content is not corrupted';
        break;
      case SecurityErrorCode.KEY_NOT_FOUND:
        metadata.action = 'Check that the key ID is correct and that the key exists';
        break;
      case SecurityErrorCode.UNSUPPORTED_ALGORITHM:
        metadata.action = 'Use one of the supported algorithms';
        break;
      case SecurityErrorCode.TOKEN_EXPIRED:
        metadata.action = 'Request a new token';
        metadata.retryable = true;
        break;
    }
    
    super(message, metadata, details);
  }
  
  /**
   * Create a "Signature verification failed" error
   * 
   * @param reason - The reason why verification failed
   * @param details - Additional error details
   */
  static verificationFailed(reason?: string, details?: ErrorDetails): SecurityError {
    const message = reason
      ? `Signature verification failed: ${reason}`
      : 'Signature verification failed';
      
    return new SecurityError(
      message,
      SecurityErrorCode.SIGNATURE_VERIFICATION_FAILED,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Signature creation failed" error
   * 
   * @param reason - The reason why signature creation failed
   * @param details - Additional error details
   */
  static signatureFailed(reason?: string, details?: ErrorDetails): SecurityError {
    const message = reason
      ? `Signature creation failed: ${reason}`
      : 'Signature creation failed';
      
    return new SecurityError(
      message,
      SecurityErrorCode.SIGNATURE_CREATION_FAILED,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Key not found" error
   * 
   * @param keyId - The ID of the key that was not found
   * @param details - Additional error details
   */
  static keyNotFound(keyId: string, details?: ErrorDetails): SecurityError {
    return new SecurityError(
      `Key not found: ${keyId}`,
      SecurityErrorCode.KEY_NOT_FOUND,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create an "Unsupported algorithm" error
   * 
   * @param algorithm - The unsupported algorithm
   * @param supported - List of supported algorithms
   * @param details - Additional error details
   */
  static unsupportedAlgorithm(
    algorithm: string, 
    supported: string[] = [],
    details?: ErrorDetails
  ): SecurityError {
    const supportedText = supported.length > 0
      ? ` Supported algorithms: ${supported.join(', ')}`
      : '';
      
    return new SecurityError(
      `Unsupported algorithm: ${algorithm}.${supportedText}`,
      SecurityErrorCode.UNSUPPORTED_ALGORITHM,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Token expired" error
   * 
   * @param details - Additional error details
   */
  static tokenExpired(details?: ErrorDetails): SecurityError {
    return new SecurityError(
      'Token has expired',
      SecurityErrorCode.TOKEN_EXPIRED,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create an "Invalid token" error
   * 
   * @param reason - The reason why the token is invalid
   * @param details - Additional error details
   */
  static invalidToken(reason?: string, details?: ErrorDetails): SecurityError {
    const message = reason
      ? `Invalid token: ${reason}`
      : 'Invalid token';
      
    return new SecurityError(
      message,
      SecurityErrorCode.INVALID_TOKEN,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create an "Insufficient permissions" error
   * 
   * @param resource - The resource that was being accessed
   * @param action - The action that was being attempted
   * @param details - Additional error details
   */
  static insufficientPermissions(
    resource: string,
    action: string,
    details?: ErrorDetails
  ): SecurityError {
    return new SecurityError(
      `Insufficient permissions to ${action} ${resource}`,
      SecurityErrorCode.INSUFFICIENT_PERMISSIONS,
      ErrorSeverity.ERROR,
      details
    );
  }
} 