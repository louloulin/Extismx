export * from './types';
export * from './signing';
export * from './verification';
export * from './keystore';

import { KeyStore } from './keystore';
import { PluginSigner } from './signing';
import { PluginVerifier } from './verification';
import { SecurityConfig, SignatureAlgorithm } from './types';

/**
 * Create a security module instance
 */
export function createSecurityModule(config: SecurityConfig = {}) {
  const keyStore = new KeyStore();
  const signer = new PluginSigner(keyStore, config.defaultAlgorithm || SignatureAlgorithm.RSA_SHA256);
  const verifier = new PluginVerifier(
    config.trustedKeys || [],
    {
      requireSignature: config.requireSignature,
      allowUntrustedKeys: config.allowUntrustedKeys
    }
  );

  return {
    keyStore,
    signer,
    verifier
  };
} 