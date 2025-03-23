// Plugin signing and verification module
// This provides functions for signing and verifying plugin packages

import * as crypto from 'crypto';

/**
 * Key pair for signing and verification
 */
export interface KeyPair {
  privateKey: string;
  publicKey: string;
}

/**
 * Generate a new key pair for plugin signing
 * @returns A new key pair
 */
export function generateKeyPair(): KeyPair {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { privateKey, publicKey };
}

/**
 * Sign a plugin package
 * @param content Plugin content as Buffer
 * @param privateKey Private key in PEM format
 * @returns Signature of the plugin
 */
export function signPlugin(content: Buffer, privateKey: string): string {
  const sign = crypto.createSign('SHA256');
  sign.update(content);
  sign.end();
  
  const signature = sign.sign(privateKey, 'base64');
  return signature;
}

/**
 * Verify a plugin signature
 * @param content Plugin content as Buffer
 * @param signature Signature to verify
 * @param publicKey Public key in PEM format
 * @returns Whether the signature is valid
 */
export function verifyPlugin(content: Buffer, signature: string, publicKey: string): boolean {
  const verify = crypto.createVerify('SHA256');
  verify.update(content);
  verify.end();
  
  return verify.verify(publicKey, signature, 'base64');
}

/**
 * Create a certificate for a plugin
 * @param pluginId Plugin ID
 * @param authorName Author name
 * @param privateKey Private key in PEM format
 * @returns Certificate in PEM format
 */
export function createCertificate(pluginId: string, authorName: string, privateKey: string): string {
  // This is a simplified implementation
  // A real implementation would use a proper certificate library
  
  const payload = {
    subject: pluginId,
    issuer: authorName,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  };
  
  const payloadStr = JSON.stringify(payload);
  const sign = crypto.createSign('SHA256');
  sign.update(payloadStr);
  sign.end();
  
  const signature = sign.sign(privateKey, 'base64');
  
  return `-----BEGIN PLUGIN CERTIFICATE-----
${Buffer.from(payloadStr).toString('base64')}
${signature}
-----END PLUGIN CERTIFICATE-----`;
}

/**
 * Verify a plugin certificate
 * @param certificate Certificate in PEM format
 * @param publicKey Public key in PEM format
 * @returns Whether the certificate is valid and the payload
 */
export function verifyCertificate(certificate: string, publicKey: string): { valid: boolean, payload?: any } {
  try {
    // Extract payload and signature
    const parts = certificate
      .replace('-----BEGIN PLUGIN CERTIFICATE-----', '')
      .replace('-----END PLUGIN CERTIFICATE-----', '')
      .trim()
      .split('\n');
    
    if (parts.length !== 2) {
      return { valid: false };
    }
    
    const payloadBase64 = parts[0];
    const signature = parts[1];
    
    // Decode payload
    const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadStr);
    
    // Verify signature
    const verify = crypto.createVerify('SHA256');
    verify.update(payloadStr);
    verify.end();
    
    const valid = verify.verify(publicKey, signature, 'base64');
    
    // Check expiration
    const now = Date.now();
    if (valid && payload.expiresAt < now) {
      return { valid: false, payload };
    }
    
    return { valid, payload };
  } catch (error) {
    return { valid: false };
  }
} 