import * as crypto from 'crypto';
import { KeyPair, SignatureAlgorithm, SecurityError, SecurityErrorType } from './types';

/**
 * Key store implementation for managing cryptographic keys
 */
export class KeyStore {
  private keys: Map<string, KeyPair>;

  constructor() {
    this.keys = new Map();
  }

  /**
   * Generate a new key pair
   */
  async generateKeyPair(algorithm: SignatureAlgorithm): Promise<KeyPair> {
    try {
      let keyPair: KeyPair;

      switch (algorithm) {
        case SignatureAlgorithm.RSA_SHA256:
          keyPair = await this.generateRsaKeyPair();
          break;

        case SignatureAlgorithm.ED25519:
          keyPair = await this.generateEd25519KeyPair();
          break;

        case SignatureAlgorithm.ECDSA_P256:
          keyPair = await this.generateEcdsaKeyPair();
          break;

        default:
          throw new SecurityError(
            `Unsupported algorithm: ${algorithm}`,
            SecurityErrorType.ALGORITHM_NOT_SUPPORTED
          );
      }

      const keyId = this.generateKeyId(keyPair.publicKey);
      this.keys.set(keyId, keyPair);
      return keyPair;
    } catch (error) {
      throw new SecurityError(
        `Failed to generate key pair: ${error instanceof Error ? error.message : 'Unknown error'}`,
        SecurityErrorType.KEY_NOT_FOUND,
        error
      );
    }
  }

  /**
   * Store a key pair
   */
  storeKeyPair(keyPair: KeyPair): string {
    const keyId = this.generateKeyId(keyPair.publicKey);
    this.keys.set(keyId, keyPair);
    return keyId;
  }

  /**
   * Get a key pair by ID
   */
  getKeyPair(keyId: string): KeyPair | undefined {
    return this.keys.get(keyId);
  }

  /**
   * Delete a key pair by ID
   */
  deleteKeyPair(keyId: string): boolean {
    return this.keys.delete(keyId);
  }

  /**
   * List all stored key pairs
   */
  listKeyPairs(): KeyPair[] {
    return Array.from(this.keys.values());
  }

  /**
   * Generate a key ID from public key
   */
  private generateKeyId(publicKey: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(publicKey);
    return hash.digest('hex').slice(0, 16);
  }

  /**
   * Generate RSA key pair
   */
  private async generateRsaKeyPair(): Promise<KeyPair> {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair(
        'rsa',
        {
          modulusLength: 2048,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
          }
        },
        (err, publicKey, privateKey) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            publicKey,
            privateKey,
            algorithm: SignatureAlgorithm.RSA_SHA256
          });
        }
      );
    });
  }

  /**
   * Generate Ed25519 key pair
   */
  private async generateEd25519KeyPair(): Promise<KeyPair> {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair(
        'ed25519',
        {
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
          }
        },
        (err, publicKey, privateKey) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            publicKey,
            privateKey,
            algorithm: SignatureAlgorithm.ED25519
          });
        }
      );
    });
  }

  /**
   * Generate ECDSA key pair
   */
  private async generateEcdsaKeyPair(): Promise<KeyPair> {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair(
        'ec',
        {
          namedCurve: 'P-256',
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
          }
        },
        (err, publicKey, privateKey) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            publicKey,
            privateKey,
            algorithm: SignatureAlgorithm.ECDSA_P256
          });
        }
      );
    });
  }
} 