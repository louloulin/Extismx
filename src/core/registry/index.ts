import { createHash } from 'crypto';
import { IRegistryStorage, Plugin, PluginMetadata, PluginQueryOptions, PluginQueryResult, PluginStatus, PluginVisibility, RegistryError, RegistryErrorType } from './types';
import { PackageManager } from './package-manager';
import { DependencyResolver } from './dependency-resolver';
import { DependencyVisualizer } from './dependency-visualizer';
import { DocGenerator, DocFormat } from './doc-generator';

// Export package manager, dependency resolver, dependency visualizer, and doc generator
export { PackageManager, DependencyResolver, DependencyVisualizer, DocGenerator, DocFormat };

/**
 * Plugin registry implementation
 */
export class Registry {
  constructor(
    private storage: IRegistryStorage,
    private config: {
      allowPrivatePlugins?: boolean;
      allowOrganizationPlugins?: boolean;
      maxPluginSize?: number;
      requiredTags?: string[];
      validateMetadata?: (metadata: PluginMetadata) => Promise<void>;
      validatePlugin?: (plugin: Plugin) => Promise<void>;
    } = {}
  ) {}

  /**
   * Register a new plugin
   */
  async registerPlugin(
    metadata: PluginMetadata,
    content: Buffer,
    options: {
      visibility?: PluginVisibility;
      signature?: string;
    } = {}
  ): Promise<Plugin> {
    // Validate plugin size
    if (this.config.maxPluginSize && content.length > this.config.maxPluginSize) {
      throw new RegistryError(
        `Plugin size exceeds maximum allowed size of ${this.config.maxPluginSize} bytes`,
        RegistryErrorType.VALIDATION_ERROR
      );
    }

    // Validate metadata
    if (this.config.validateMetadata) {
      await this.config.validateMetadata(metadata);
    }

    // Validate required tags
    if (this.config.requiredTags) {
      const missingTags = this.config.requiredTags.filter(
        tag => !metadata.tags?.includes(tag)
      );
      if (missingTags.length > 0) {
        throw new RegistryError(
          `Missing required tags: ${missingTags.join(', ')}`,
          RegistryErrorType.VALIDATION_ERROR
        );
      }
    }

    // Validate visibility
    const visibility = options.visibility || PluginVisibility.PUBLIC;
    if (visibility === PluginVisibility.PRIVATE && !this.config.allowPrivatePlugins) {
      throw new RegistryError(
        'Private plugins are not allowed',
        RegistryErrorType.PERMISSION_DENIED
      );
    }
    if (visibility === PluginVisibility.ORGANIZATION && !this.config.allowOrganizationPlugins) {
      throw new RegistryError(
        'Organization plugins are not allowed',
        RegistryErrorType.PERMISSION_DENIED
      );
    }

    // Create plugin object
    const plugin: Plugin = {
      id: this.generatePluginId(metadata),
      metadata,
      hash: this.calculateHash(content),
      signature: options.signature,
      createdAt: new Date(),
      updatedAt: new Date(),
      downloads: 0,
      status: PluginStatus.DRAFT,
      visibility
    };

    // Validate plugin
    if (this.config.validatePlugin) {
      await this.config.validatePlugin(plugin);
    }

    // Save plugin
    await this.storage.savePlugin(plugin);

    return plugin;
  }

  /**
   * Get plugin by ID
   */
  async getPlugin(id: string): Promise<Plugin> {
    const plugin = await this.storage.getPlugin(id);
    if (!plugin) {
      throw new RegistryError(
        `Plugin with ID ${id} not found`,
        RegistryErrorType.PLUGIN_NOT_FOUND
      );
    }
    return plugin;
  }

  /**
   * Delete plugin by ID
   */
  async deletePlugin(id: string): Promise<void> {
    await this.storage.deletePlugin(id);
  }

  /**
   * Query plugins
   */
  async queryPlugins(options: PluginQueryOptions): Promise<PluginQueryResult> {
    return this.storage.queryPlugins(options);
  }

  /**
   * Update plugin status
   */
  async updatePluginStatus(id: string, status: PluginStatus): Promise<void> {
    await this.storage.updateStatus(id, status);
  }

  /**
   * Update plugin visibility
   */
  async updatePluginVisibility(id: string, visibility: PluginVisibility): Promise<void> {
    // Validate visibility
    if (visibility === PluginVisibility.PRIVATE && !this.config.allowPrivatePlugins) {
      throw new RegistryError(
        'Private plugins are not allowed',
        RegistryErrorType.PERMISSION_DENIED
      );
    }
    if (visibility === PluginVisibility.ORGANIZATION && !this.config.allowOrganizationPlugins) {
      throw new RegistryError(
        'Organization plugins are not allowed',
        RegistryErrorType.PERMISSION_DENIED
      );
    }

    await this.storage.updateVisibility(id, visibility);
  }

  /**
   * Record plugin download
   */
  async recordDownload(id: string): Promise<void> {
    await this.storage.incrementDownloads(id);
  }

  /**
   * Generate plugin ID from metadata
   */
  private generatePluginId(metadata: PluginMetadata): string {
    return `${metadata.name}@${metadata.version}`;
  }

  /**
   * Calculate hash of plugin content
   */
  private calculateHash(content: Buffer): string {
    return createHash('sha256').update(content).digest('hex');
  }
} 