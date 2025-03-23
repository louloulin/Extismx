// Type definitions for the Extism plugin registry

/**
 * Plugin metadata
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
 * Plugin package information
 */
export interface PluginPackage {
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
 * Plugin search query parameters
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
  items: PluginPackage[];
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
 * Plugin dependency resolution result
 */
export interface PluginDependencyResolution {
  requested: string;
  resolved: string;
  package: PluginPackage;
}

/**
 * Plugin dependency graph
 */
export interface PluginDependencyGraph {
  root: PluginPackage;
  dependencies: Record<string, PluginDependencyResolution>;
}

/**
 * Plugin publish result
 */
export interface PluginPublishResult {
  success: boolean;
  package: PluginPackage;
  message?: string;
  warnings?: string[];
}

/**
 * Plugin download information
 */
export interface PluginDownloadInfo {
  downloadUrl: string;
  size: number;
  hash: string;
  signature?: string;
} 