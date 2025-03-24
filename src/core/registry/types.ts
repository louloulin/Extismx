/**
 * Plugin metadata interface
 */
export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  dependencies?: Record<string, string>;
  tags?: string[];
  runtime?: {
    wasm?: boolean;
    node?: boolean;
    browser?: boolean;
  };
}

/**
 * Plugin interface
 */
export interface Plugin {
  id: string;
  metadata: PluginMetadata;
  hash: string;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
  downloads: number;
  status: PluginStatus;
  visibility: PluginVisibility;
}

/**
 * Plugin status enum
 */
export enum PluginStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DEPRECATED = 'deprecated',
  DISABLED = 'disabled'
}

/**
 * Plugin visibility enum
 */
export enum PluginVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  ORGANIZATION = 'organization'
}

/**
 * Plugin query options
 */
export interface PluginQueryOptions {
  status?: PluginStatus;
  visibility?: PluginVisibility;
  tags?: string[];
  author?: string;
  runtime?: {
    wasm?: boolean;
    node?: boolean;
    browser?: boolean;
  };
  sort?: {
    field: keyof Plugin;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

/**
 * Plugin query result
 */
export interface PluginQueryResult {
  plugins: Plugin[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Storage interface for registry
 */
export interface IRegistryStorage {
  /**
   * Save plugin to storage
   */
  savePlugin(plugin: Plugin): Promise<void>;

  /**
   * Get plugin by ID
   */
  getPlugin(id: string): Promise<Plugin | null>;

  /**
   * Delete plugin by ID
   */
  deletePlugin(id: string): Promise<void>;

  /**
   * Query plugins with options
   */
  queryPlugins(options: PluginQueryOptions): Promise<PluginQueryResult>;

  /**
   * Increment plugin download count
   */
  incrementDownloads(id: string): Promise<void>;

  /**
   * Update plugin status
   */
  updateStatus(id: string, status: PluginStatus): Promise<void>;

  /**
   * Update plugin visibility
   */
  updateVisibility(id: string, visibility: PluginVisibility): Promise<void>;
}

/**
 * Registry error types
 */
export enum RegistryErrorType {
  PLUGIN_NOT_FOUND = 'PLUGIN_NOT_FOUND',
  PLUGIN_ALREADY_EXISTS = 'PLUGIN_ALREADY_EXISTS',
  INVALID_PLUGIN = 'INVALID_PLUGIN',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

/**
 * Registry error class
 */
export class RegistryError extends Error {
  constructor(
    message: string,
    public type: RegistryErrorType,
    public details?: any
  ) {
    super(message);
    this.name = 'RegistryError';
  }
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