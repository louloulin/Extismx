import * as crypto from 'crypto';
import { KeyStore } from './keystore';
import { SignatureOptions, SignatureResult, SignatureAlgorithm, SecurityError, SecurityErrorType } from './types';

/**
 * Plugin signer implementation
 */
export class PluginSigner {
  constructor(
    private keyStore: KeyStore,
    private defaultAlgorithm: SignatureAlgorithm = SignatureAlgorithm.RSA_SHA256
  ) {}

  /**
   * Sign content with a key pair
   */
  async sign(content: Buffer, options: SignatureOptions = {}): Promise<SignatureResult> {
    try {
      const algorithm = options.algorithm || this.defaultAlgorithm;
      const keyPair = options.keyId
        ? this.keyStore.getKeyPair(options.keyId)
        : (await this.keyStore.generateKeyPair(algorithm));

      if (!keyPair) {
        throw new SecurityError(
          'No key pair available for signing',
          SecurityErrorType.KEY_NOT_FOUND
        );
      }

      const signature = this.createSignature(content, keyPair.privateKey, algorithm);
      const keyId = this.keyStore.storeKeyPair(keyPair);

      return {
        signature,
        algorithm,
        keyId
      };
    } catch (error) {
      if (error instanceof SecurityError) {
        throw error;
      }
      throw new SecurityError(
        `Failed to sign content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        SecurityErrorType.INVALID_SIGNATURE,
        error
      );
    }
  }

  /**
   * Create signature using specified algorithm
   */
  private createSignature(
    content: Buffer,
    privateKey: string,
    algorithm: SignatureAlgorithm
  ): string {
    switch (algorithm) {
      case SignatureAlgorithm.RSA_SHA256:
        return this.createRsaSignature(content, privateKey);
      
      case SignatureAlgorithm.ED25519:
        return this.createEd25519Signature(content, privateKey);
      
      case SignatureAlgorithm.ECDSA_P256:
        return this.createEcdsaSignature(content, privateKey);
      
      default:
        throw new SecurityError(
          `Unsupported signature algorithm: ${algorithm}`,
          SecurityErrorType.ALGORITHM_NOT_SUPPORTED
        );
    }
  }

  /**
   * Create RSA signature
   */
  private createRsaSignature(content: Buffer, privateKey: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(content);
    return sign.sign(privateKey, 'base64');
  }

  /**
   * Create Ed25519 signature
   */
  private createEd25519Signature(content: Buffer, privateKey: string): string {
    const keyBuffer = Buffer.from(privateKey, 'base64');
    const sign = crypto.createSign('SHA512');
    sign.update(content);
    return sign.sign({
      key: keyBuffer,
      format: 'der',
      type: 'pkcs8'
    }, 'base64');
  }

  /**
   * Create ECDSA signature
   */
  private createEcdsaSignature(content: Buffer, privateKey: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(content);
    return sign.sign({
      key: privateKey,
      dsaEncoding: 'der'
    }, 'base64');
  }
} 