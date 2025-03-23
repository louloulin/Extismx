// Simple implementation of the Extism plugin registry

import {
  PluginMetadata,
  PluginPackage,
  PluginSearchParams,
  PluginSearchResults,
  PluginVersion,
  PluginDependencyResolution,
  PluginDependencyGraph,
  PluginPublishResult,
  PluginDownloadInfo
} from './registry-types';
import * as crypto from 'crypto';

/**
 * In-memory storage for the plugin registry
 */
interface RegistryStorage {
  packages: Map<string, PluginPackage>;
  versions: Map<string, Map<string, PluginPackage>>;
  tags: Map<string, Set<string>>;
  authors: Map<string, Set<string>>;
  languages: Map<string, Set<string>>;
}

/**
 * Simple Extism Plugin Registry implementation
 * This registry stores plugins in memory - for a real implementation, 
 * this would use a database and file storage system
 */
export class ExtismRegistry {
  private storage: RegistryStorage;
  private baseUrl: string;

  /**
   * Create a new registry
   * @param baseUrl Base URL for plugin downloads
   */
  constructor(baseUrl: string = 'https://registry.extism-plugins.io') {
    this.baseUrl = baseUrl;
    this.storage = {
      packages: new Map(),
      versions: new Map(),
      tags: new Map(),
      authors: new Map(),
      languages: new Map()
    };
  }

  /**
   * Generate a hash for a plugin
   * @param content Plugin content
   * @returns SHA-256 hash of the content
   */
  private generateHash(content: Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Generate a unique ID for a plugin
   * @param name Plugin name
   * @param author Plugin author
   * @returns Unique ID
   */
  private generateId(name: string, author: string): string {
    return `${author}/${name}`.toLowerCase();
  }

  /**
   * Validate plugin metadata
   * @param metadata Plugin metadata
   * @returns Validation result
   */
  private validateMetadata(metadata: PluginMetadata): { valid: boolean, errors: string[] } {
    const errors: string[] = [];

    if (!metadata.name || metadata.name.trim() === '') {
      errors.push('Plugin name is required');
    }

    if (!metadata.version || !/^\d+\.\d+\.\d+/.test(metadata.version)) {
      errors.push('Plugin version must be in semver format (e.g., 1.0.0)');
    }

    if (!metadata.author || metadata.author.trim() === '') {
      errors.push('Plugin author is required');
    }

    if (!metadata.license || metadata.license.trim() === '') {
      errors.push('Plugin license is required');
    }

    if (!metadata.exports || metadata.exports.length === 0) {
      errors.push('Plugin must export at least one function');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Publish a new plugin to the registry
   * @param metadata Plugin metadata
   * @param content Plugin content as Buffer
   * @param signature Optional signature for verification
   * @returns Publish result
   */
  public publishPlugin(
    metadata: PluginMetadata,
    content: Buffer,
    signature?: string
  ): PluginPublishResult {
    // Validate metadata
    const validation = this.validateMetadata(metadata);
    if (!validation.valid) {
      return {
        success: false,
        package: null as any,
        message: 'Invalid plugin metadata',
        warnings: validation.errors
      };
    }

    // Generate plugin ID and check for duplicates
    const id = this.generateId(metadata.name, metadata.author);
    const existingVersions = this.storage.versions.get(id);
    
    if (existingVersions && existingVersions.has(metadata.version)) {
      return {
        success: false,
        package: null as any,
        message: `Plugin version ${metadata.version} already exists`
      };
    }

    // Create package entry
    const hash = this.generateHash(content);
    const now = new Date().toISOString();
    
    const packageInfo: PluginPackage = {
      metadata,
      id,
      created: now,
      updated: now,
      downloads: 0,
      size: content.length,
      hash,
      signature,
      verified: !!signature // A real implementation would verify the signature
    };

    // Store the package
    this.storage.packages.set(id, packageInfo);
    
    // Store version info
    if (!this.storage.versions.has(id)) {
      this.storage.versions.set(id, new Map());
    }
    this.storage.versions.get(id)!.set(metadata.version, packageInfo);
    
    // Index by tags
    metadata.keywords.forEach(tag => {
      if (!this.storage.tags.has(tag)) {
        this.storage.tags.set(tag, new Set());
      }
      this.storage.tags.get(tag)!.add(id);
    });
    
    // Index by author
    if (!this.storage.authors.has(metadata.author)) {
      this.storage.authors.set(metadata.author, new Set());
    }
    this.storage.authors.get(metadata.author)!.add(id);
    
    // Index by language
    if (!this.storage.languages.has(metadata.language)) {
      this.storage.languages.set(metadata.language, new Set());
    }
    this.storage.languages.get(metadata.language)!.add(id);

    return {
      success: true,
      package: packageInfo,
      message: 'Plugin published successfully'
    };
  }

  /**
   * Search for plugins in the registry
   * @param params Search parameters
   * @returns Search results
   */
  public searchPlugins(params: PluginSearchParams): PluginSearchResults {
    let matchingIds = new Set<string>();
    
    // Start with all packages
    this.storage.packages.forEach((_, id) => {
      matchingIds.add(id);
    });
    
    // Filter by query (search in name and description)
    if (params.query) {
      const query = params.query.toLowerCase();
      const filteredIds = new Set<string>();
      
      matchingIds.forEach(id => {
        const pkg = this.storage.packages.get(id)!;
        if (
          pkg.metadata.name.toLowerCase().includes(query) ||
          pkg.metadata.description.toLowerCase().includes(query)
        ) {
          filteredIds.add(id);
        }
      });
      
      matchingIds = filteredIds;
    }
    
    // Filter by language
    if (params.language) {
      const languageIds = this.storage.languages.get(params.language) || new Set();
      const filteredIds = new Set<string>();
      
      matchingIds.forEach(id => {
        if (languageIds.has(id)) {
          filteredIds.add(id);
        }
      });
      
      matchingIds = filteredIds;
    }
    
    // Filter by author
    if (params.author) {
      const authorIds = this.storage.authors.get(params.author) || new Set();
      const filteredIds = new Set<string>();
      
      matchingIds.forEach(id => {
        if (authorIds.has(id)) {
          filteredIds.add(id);
        }
      });
      
      matchingIds = filteredIds;
    }
    
    // Filter by tags
    if (params.tags && params.tags.length > 0) {
      const taggedIds = new Set<string>();
      
      params.tags.forEach(tag => {
        const tagIds = this.storage.tags.get(tag) || new Set();
        tagIds.forEach(id => {
          if (matchingIds.has(id)) {
            taggedIds.add(id);
          }
        });
      });
      
      matchingIds = taggedIds;
    }
    
    // Convert matching IDs to packages
    const matchingPackages = Array.from(matchingIds)
      .map(id => this.storage.packages.get(id)!)
      .sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
    
    // Handle pagination
    const limit = params.limit || 10;
    const offset = params.offset || 0;
    const paginatedPackages = matchingPackages.slice(offset, offset + limit);
    
    return {
      total: matchingPackages.length,
      items: paginatedPackages,
      nextOffset: offset + limit < matchingPackages.length ? offset + limit : undefined
    };
  }

  /**
   * Get information about a specific plugin
   * @param id Plugin ID
   * @param version Optional version, defaults to latest
   * @returns Plugin package or null if not found
   */
  public getPlugin(id: string, version?: string): PluginPackage | null {
    // Normalize ID
    id = id.toLowerCase();
    
    // Check if the plugin exists
    if (!this.storage.packages.has(id)) {
      return null;
    }
    
    if (!version) {
      // Return the latest version
      return this.storage.packages.get(id)!;
    }
    
    // Check if the version exists
    const versions = this.storage.versions.get(id);
    if (!versions || !versions.has(version)) {
      return null;
    }
    
    return versions.get(version)!;
  }

  /**
   * Get all versions of a plugin
   * @param id Plugin ID
   * @returns Array of version information
   */
  public getPluginVersions(id: string): PluginVersion[] {
    // Normalize ID
    id = id.toLowerCase();
    
    // Check if the plugin exists
    if (!this.storage.packages.has(id)) {
      return [];
    }
    
    const versions = this.storage.versions.get(id);
    if (!versions) {
      return [];
    }
    
    return Array.from(versions.entries()).map(([version, pkg]) => ({
      version,
      created: pkg.created,
      hash: pkg.hash,
      size: pkg.size
    }));
  }

  /**
   * Get plugin download information
   * @param id Plugin ID
   * @param version Optional version, defaults to latest
   * @returns Download information or null if not found
   */
  public getDownloadInfo(id: string, version?: string): PluginDownloadInfo | null {
    const plugin = this.getPlugin(id, version);
    if (!plugin) {
      return null;
    }
    
    return {
      downloadUrl: `${this.baseUrl}/download/${plugin.id}/${plugin.metadata.version}`,
      size: plugin.size,
      hash: plugin.hash,
      signature: plugin.signature
    };
  }

  /**
   * Resolve dependencies for a plugin
   * @param id Plugin ID
   * @param version Optional version, defaults to latest
   * @returns Dependency graph or null if plugin not found
   */
  public resolveDependencies(id: string, version?: string): PluginDependencyGraph | null {
    const plugin = this.getPlugin(id, version);
    if (!plugin) {
      return null;
    }
    
    const dependencies: Record<string, PluginDependencyResolution> = {};
    
    // Resolve direct dependencies
    const deps = plugin.metadata.dependencies || {};
    for (const [depId, versionRange] of Object.entries(deps)) {
      const resolvedPlugin = this.getPlugin(depId);
      
      if (resolvedPlugin) {
        dependencies[depId] = {
          requested: versionRange,
          resolved: resolvedPlugin.metadata.version,
          package: resolvedPlugin
        };
      }
    }
    
    return {
      root: plugin,
      dependencies
    };
  }
}

// Export a default instance for convenience
export const defaultRegistry = new ExtismRegistry(); 