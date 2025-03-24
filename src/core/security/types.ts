/**
 * Supported signature algorithms
 */
export enum SignatureAlgorithm {
  RSA_SHA256 = 'RSA-SHA256',
  ED25519 = 'ED25519',
  ECDSA_P256 = 'ECDSA-P256'
}

/**
 * Key pair interface
 */
export interface KeyPair {
  publicKey: string;
  privateKey: string;
  algorithm: SignatureAlgorithm;
}

/**
 * Signature options interface
 */
export interface SignatureOptions {
  algorithm?: SignatureAlgorithm;
  keyId?: string;
}

/**
 * Signature result interface
 */
export interface SignatureResult {
  signature: string;
  algorithm: SignatureAlgorithm;
  keyId?: string;
}

/**
 * Verification options interface
 */
export interface VerificationOptions {
  algorithm: SignatureAlgorithm;
  publicKey?: string;
  keyId?: string;
}

/**
 * Verification result interface
 */
export interface VerificationResult {
  valid: boolean;
  keyId?: string;
}

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  requireSignature?: boolean;
  allowUntrustedKeys?: boolean;
  defaultAlgorithm?: SignatureAlgorithm;
  trustedKeys?: string[];
}

/**
 * Security error types
 */
export enum SecurityErrorType {
  ALGORITHM_NOT_SUPPORTED = 'ALGORITHM_NOT_SUPPORTED',
  KEY_NOT_FOUND = 'KEY_NOT_FOUND',
  UNTRUSTED_KEY = 'UNTRUSTED_KEY',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  SIGNATURE_REQUIRED = 'SIGNATURE_REQUIRED'
}

/**
 * Security error class
 */
export class SecurityError extends Error {
  constructor(
    message: string,
    public type: SecurityErrorType,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'SecurityError';
  }
} 