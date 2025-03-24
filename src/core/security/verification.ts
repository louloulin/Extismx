import * as crypto from 'crypto';
import { SignatureAlgorithm, VerificationOptions, VerificationResult, SecurityError, SecurityErrorType } from './types';
import { PluginSignature, KeyStoreEntry } from './types';

/**
 * Plugin signature verifier
 */
export class SignatureVerifier {
  constructor(private trustedKeys: Map<string, KeyStoreEntry>) {}

  /**
   * Verify plugin signature
   */
  async verifySignature(
    content: Buffer,
    signature: PluginSignature,
    options: VerificationOptions = {}
  ): Promise<VerificationResult> {
    try {
      // Check if key is trusted when required
      if (options.requireTrustedKey) {
        const keyEntry = this.trustedKeys.get(signature.keyId);
        if (!keyEntry) {
          return {
            valid: false,
            error: `Key ${signature.keyId} is not trusted`
          };
        }
        if (keyEntry.trust === 'revoked') {
          return {
            valid: false,
            error: `Key ${signature.keyId} has been revoked`
          };
        }
      }

      // Check signature algorithm
      if (options.allowedAlgorithms && !options.allowedAlgorithms.includes(signature.algorithm)) {
        return {
          valid: false,
          error: `Algorithm ${signature.algorithm} is not allowed`
        };
      }

      // Check timestamp if required
      if (options.checkTimestamp) {
        const signatureAge = Date.now() - new Date(signature.created).getTime();
        if (options.maxAge && signatureAge > options.maxAge) {
          return {
            valid: false,
            error: 'Signature has expired'
          };
        }
      }

      // Get public key
      const keyEntry = this.trustedKeys.get(signature.keyId);
      if (!keyEntry) {
        return {
          valid: false,
          error: `Key ${signature.keyId} not found`
        };
      }

      // Verify signature
      const verify = crypto.createVerify(signature.algorithm);
      verify.update(content);
      const isValid = verify.verify(keyEntry.publicKey, signature.signature, 'base64');

      return {
        valid: isValid,
        error: isValid ? undefined : 'Invalid signature'
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Add trusted key
   */
  addTrustedKey(entry: KeyStoreEntry): void {
    this.trustedKeys.set(entry.keyId, entry);
  }

  /**
   * Remove trusted key
   */
  removeTrustedKey(keyId: string): void {
    this.trustedKeys.delete(keyId);
  }

  /**
   * Get trusted key
   */
  getTrustedKey(keyId: string): KeyStoreEntry | undefined {
    return this.trustedKeys.get(keyId);
  }

  /**
   * List all trusted keys
   */
  listTrustedKeys(): KeyStoreEntry[] {
    return Array.from(this.trustedKeys.values());
  }
}

/**
 * Plugin verifier implementation
 */
export class PluginVerifier {
  constructor(
    private trustedKeys: string[],
    private config: {
      requireSignature?: boolean;
      allowUntrustedKeys?: boolean;
    } = {}
  ) {}

  /**
   * Verify plugin signature
   */
  async verify(
    content: Buffer,
    signature: string,
    options: VerificationOptions
  ): Promise<VerificationResult> {
    // Check if signature is required
    if (!signature && this.config.requireSignature) {
      throw new SecurityError(
        'Plugin signature is required',
        SecurityErrorType.SIGNATURE_REQUIRED
      );
    }

    // If no signature and not required, return valid
    if (!signature && !this.config.requireSignature) {
      return { valid: true };
    }

    try {
      // Get public key
      const publicKey = options.publicKey || this.findTrustedKey(options.keyId);
      
      if (!publicKey) {
        throw new SecurityError(
          'No public key available for verification',
          SecurityErrorType.KEY_NOT_FOUND
        );
      }

      // Check if key is trusted
      if (!this.config.allowUntrustedKeys && !this.isTrustedKey(publicKey)) {
        throw new SecurityError(
          'Untrusted public key',
          SecurityErrorType.UNTRUSTED_KEY
        );
      }

      // Verify signature
      const valid = this.verifySignature(content, signature, publicKey, options.algorithm);

      return {
        valid,
        keyId: options.keyId
      };
    } catch (error) {
      if (error instanceof SecurityError) {
        throw error;
      }
      throw new SecurityError(
        `Failed to verify signature: ${error instanceof Error ? error.message : 'Unknown error'}`,
        SecurityErrorType.INVALID_SIGNATURE,
        error
      );
    }
  }

  /**
   * Find trusted key by ID
   */
  private findTrustedKey(keyId?: string): string | undefined {
    if (!keyId) {
      return this.trustedKeys[0];
    }
    return this.trustedKeys.find(key => key.includes(keyId));
  }

  /**
   * Check if key is trusted
   */
  private isTrustedKey(key: string): boolean {
    return this.trustedKeys.includes(key);
  }

  /**
   * Verify signature using specified algorithm
   */
  private verifySignature(
    content: Buffer,
    signature: string,
    publicKey: string,
    algorithm: SignatureAlgorithm
  ): boolean {
    switch (algorithm) {
      case SignatureAlgorithm.RSA_SHA256:
        return this.verifyRsaSignature(content, signature, publicKey);
      
      case SignatureAlgorithm.ED25519:
        return this.verifyEd25519Signature(content, signature, publicKey);
      
      case SignatureAlgorithm.ECDSA_P256:
        return this.verifyEcdsaSignature(content, signature, publicKey);
      
      default:
        throw new SecurityError(
          `Unsupported signature algorithm: ${algorithm}`,
          SecurityErrorType.ALGORITHM_NOT_SUPPORTED
        );
    }
  }

  /**
   * Verify RSA signature
   */
  private verifyRsaSignature(content: Buffer, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(content);
    return verify.verify(publicKey, signature, 'base64');
  }

  /**
   * Verify Ed25519 signature
   */
  private verifyEd25519Signature(content: Buffer, signature: string, publicKey: string): boolean {
    const keyBuffer = Buffer.from(publicKey, 'base64');
    const verify = crypto.createVerify('SHA512');
    verify.update(content);
    return verify.verify({
      key: keyBuffer,
      format: 'der',
      type: 'spki'
    }, Buffer.from(signature, 'base64'));
  }

  /**
   * Verify ECDSA signature
   */
  private verifyEcdsaSignature(content: Buffer, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(content);
    return verify.verify({
      key: publicKey,
      dsaEncoding: 'der'
    }, signature, 'base64');
  }
} 