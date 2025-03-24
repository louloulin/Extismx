import * as crypto from 'crypto';
import { 
  Plugin, 
  PluginMetadata, 
  PluginSearchParams, 
  PluginSearchResults,
  PluginVersion,
  RegistryConfig 
} from './types';
import { IRegistryStorage } from './storage';

/**
 * Core registry implementation
 */
export class Registry {
  constructor(
    private storage: IRegistryStorage,
    private config: RegistryConfig
  ) {}

  /**
   * Generate a hash for plugin content
   */
  private generateHash(content: Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Generate a unique ID for a plugin
   */
  private generateId(name: string, author: string): string {
    return `${author}/${name}`.toLowerCase();
  }

  /**
   * Validate plugin metadata
   */
  private validateMetadata(metadata: PluginMetadata): { valid: boolean; errors: string[] } {
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
   * Publish a new plugin
   */
  async publishPlugin(
    metadata: PluginMetadata,
    content: Buffer,
    signature?: string
  ): Promise<{ success: boolean; message: string; plugin?: Plugin }> {
    // Validate metadata
    const validation = this.validateMetadata(metadata);
    if (!validation.valid) {
      return {
        success: false,
        message: `Invalid plugin metadata: ${validation.errors.join(', ')}`
      };
    }

    const id = this.generateId(metadata.name, metadata.author);
    const existingPlugin = await this.storage.getPlugin(id, metadata.version);

    if (existingPlugin) {
      return {
        success: false,
        message: `Plugin version ${metadata.version} already exists`
      };
    }

    const hash = this.generateHash(content);
    const now = new Date().toISOString();

    const plugin: Plugin = {
      metadata,
      id,
      created: now,
      updated: now,
      downloads: 0,
      size: content.length,
      hash,
      signature,
      verified: this.config.security.enableSignatureVerification ? !!signature : true
    };

    await this.storage.savePlugin(plugin);

    return {
      success: true,
      message: 'Plugin published successfully',
      plugin
    };
  }

  /**
   * Get a plugin by ID and optional version
   */
  async getPlugin(id: string, version?: string): Promise<Plugin | null> {
    return this.storage.getPlugin(id, version);
  }

  /**
   * Delete a plugin by ID and optional version
   */
  async deletePlugin(id: string, version?: string): Promise<boolean> {
    return this.storage.deletePlugin(id, version);
  }

  /**
   * Search for plugins
   */
  async searchPlugins(params: PluginSearchParams): Promise<PluginSearchResults> {
    return this.storage.searchPlugins(params);
  }

  /**
   * Get all versions of a plugin
   */
  async getPluginVersions(id: string): Promise<PluginVersion[]> {
    return this.storage.getPluginVersions(id);
  }

  /**
   * Increment plugin download count
   */
  async incrementDownloads(id: string): Promise<void> {
    await this.storage.incrementDownloads(id);
  }
} 