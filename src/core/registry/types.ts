/**
 * Plugin metadata interface
 */
export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository?: string;
  homepage?: string;
  keywords: string[];
  language: string;
  runtime: string;
  exports: string[];
  imports?: string[];
  dependencies?: Record<string, string>;
}

/**
 * Plugin package interface
 */
export interface Plugin {
  metadata: PluginMetadata;
  id: string;
  created: string;
  updated: string;
  downloads: number;
  size: number;
  hash: string;
  signature?: string;
  verified: boolean;
}

/**
 * Plugin search parameters
 */
export interface PluginSearchParams {
  query?: string;
  language?: string;
  author?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Plugin search results
 */
export interface PluginSearchResults {
  total: number;
  items: Plugin[];
  nextOffset?: number;
}

/**
 * Plugin version information
 */
export interface PluginVersion {
  version: string;
  created: string;
  hash: string;
  size: number;
}

/**
 * Registry configuration
 */
export interface RegistryConfig {
  baseUrl: string;
  storage: StorageConfig;
  security: SecurityConfig;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  type: 'memory' | 'database';
  options?: Record<string, any>;
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  enableSignatureVerification: boolean;
  publicKeyPath?: string;
} 