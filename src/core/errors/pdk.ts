/**
 * PDK-specific errors
 */
import { BaseError, createErrorCode } from './index';
import { ErrorCategory, ErrorDetails, ErrorMetadata, ErrorSeverity } from './types';

/**
 * PDK error codes
 */
export enum PDKErrorCode {
  BUILD_FAILED = 1,
  TEMPLATE_GENERATION_FAILED = 2,
  TEST_FAILED = 3,
  PUBLISH_FAILED = 4,
  UNSUPPORTED_LANGUAGE = 5,
  MISSING_DEPENDENCY = 6,
  INVALID_PROJECT_STRUCTURE = 7,
  COMPILATION_ERROR = 8,
  TYPE_CHECK_FAILED = 9,
  OUTPUT_DIR_CREATION_FAILED = 10,
  FILE_READ_ERROR = 11,
  FILE_WRITE_ERROR = 12
}

/**
 * PDK error class for PDK-related errors
 */
export class PDKError extends BaseError {
  /**
   * Create a new PDKError
   * 
   * @param message - Error message
   * @param code - PDK error code
   * @param severity - Error severity
   * @param details - Additional error details
   */
  constructor(
    message: string,
    code: PDKErrorCode,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    details?: ErrorDetails
  ) {
    const metadata: ErrorMetadata = {
      code: createErrorCode(ErrorCategory.PDK, code),
      severity,
      category: ErrorCategory.PDK,
      retryable: false
    };
    
    // Add recommendations based on error code
    switch (code) {
      case PDKErrorCode.BUILD_FAILED:
        metadata.action = 'Check the build logs for errors and ensure all dependencies are installed';
        break;
      case PDKErrorCode.UNSUPPORTED_LANGUAGE:
        metadata.action = 'Use one of the supported programming languages';
        break;
      case PDKErrorCode.MISSING_DEPENDENCY:
        metadata.action = 'Install the required dependency';
        break;
      case PDKErrorCode.COMPILATION_ERROR:
        metadata.action = 'Fix the compilation errors and try again';
        break;
      case PDKErrorCode.TYPE_CHECK_FAILED:
        metadata.action = 'Fix the type errors and try again';
        break;
    }
    
    super(message, metadata, details);
  }
  
  /**
   * Create a "Build failed" error
   * 
   * @param reason - The reason why the build failed
   * @param details - Additional error details
   */
  static buildFailed(reason?: string, details?: ErrorDetails): PDKError {
    const message = reason
      ? `Build failed: ${reason}`
      : 'Build failed';
      
    return new PDKError(
      message,
      PDKErrorCode.BUILD_FAILED,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create an "Unsupported language" error
   * 
   * @param language - The unsupported language
   * @param supported - List of supported languages
   * @param details - Additional error details
   */
  static unsupportedLanguage(
    language: string,
    supported: string[] = [],
    details?: ErrorDetails
  ): PDKError {
    const supportedText = supported.length > 0
      ? ` Supported languages: ${supported.join(', ')}`
      : '';
      
    return new PDKError(
      `Unsupported language: ${language}.${supportedText}`,
      PDKErrorCode.UNSUPPORTED_LANGUAGE,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Missing dependency" error
   * 
   * @param dependency - The missing dependency
   * @param installCommand - The command to install the dependency
   * @param details - Additional error details
   */
  static missingDependency(
    dependency: string,
    installCommand?: string,
    details?: ErrorDetails
  ): PDKError {
    const installText = installCommand
      ? ` Install it with: ${installCommand}`
      : '';
      
    return new PDKError(
      `Missing dependency: ${dependency}.${installText}`,
      PDKErrorCode.MISSING_DEPENDENCY,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Compilation error" error
   * 
   * @param errors - The compilation errors
   * @param details - Additional error details
   */
  static compilationError(errors: string[], details?: ErrorDetails): PDKError {
    const errorsText = errors.length > 0
      ? `\n${errors.join('\n')}`
      : '';
      
    return new PDKError(
      `Compilation failed with ${errors.length} error(s):${errorsText}`,
      PDKErrorCode.COMPILATION_ERROR,
      ErrorSeverity.ERROR,
      details
    );
  }
  
  /**
   * Create a "Type check failed" error
   * 
   * @param errors - The type errors
   * @param details - Additional error details
   */
  static typeCheckFailed(errors: string[], details?: ErrorDetails): PDKError {
    const errorsText = errors.length > 0
      ? `\n${errors.join('\n')}`
      : '';
      
    return new PDKError(
      `Type check failed with ${errors.length} error(s):${errorsText}`,
      PDKErrorCode.TYPE_CHECK_FAILED,
      ErrorSeverity.ERROR,
      details
    );
  }
} 