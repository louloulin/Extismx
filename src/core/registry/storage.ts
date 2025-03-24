import { Plugin, PluginSearchParams, PluginSearchResults, PluginVersion } from './types';

/**
 * Registry storage interface
 */
export interface IRegistryStorage {
  savePlugin(plugin: Plugin): Promise<void>;
  getPlugin(id: string, version?: string): Promise<Plugin | null>;
  deletePlugin(id: string, version?: string): Promise<boolean>;
  searchPlugins(params: PluginSearchParams): Promise<PluginSearchResults>;
  getPluginVersions(id: string): Promise<PluginVersion[]>;
  incrementDownloads(id: string): Promise<void>;
}

/**
 * In-memory storage implementation
 */
export class MemoryStorage implements IRegistryStorage {
  private packages: Map<string, Plugin> = new Map();
  private versions: Map<string, Map<string, Plugin>> = new Map();
  private tags: Map<string, Set<string>> = new Map();
  private authors: Map<string, Set<string>> = new Map();
  private languages: Map<string, Set<string>> = new Map();

  async savePlugin(plugin: Plugin): Promise<void> {
    // Store main package
    this.packages.set(plugin.id, plugin);

    // Store version
    if (!this.versions.has(plugin.id)) {
      this.versions.set(plugin.id, new Map());
    }
    this.versions.get(plugin.id)!.set(plugin.metadata.version, plugin);

    // Index by tags
    plugin.metadata.keywords.forEach(tag => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag)!.add(plugin.id);
    });

    // Index by author
    if (!this.authors.has(plugin.metadata.author)) {
      this.authors.set(plugin.metadata.author, new Set());
    }
    this.authors.get(plugin.metadata.author)!.add(plugin.id);

    // Index by language
    if (!this.languages.has(plugin.metadata.language)) {
      this.languages.set(plugin.metadata.language, new Set());
    }
    this.languages.get(plugin.metadata.language)!.add(plugin.id);
  }

  async getPlugin(id: string, version?: string): Promise<Plugin | null> {
    if (version) {
      return this.versions.get(id)?.get(version) || null;
    }
    return this.packages.get(id) || null;
  }

  async deletePlugin(id: string, version?: string): Promise<boolean> {
    if (version) {
      const versionMap = this.versions.get(id);
      if (versionMap?.has(version)) {
        versionMap.delete(version);
        return true;
      }
      return false;
    }

    const plugin = this.packages.get(id);
    if (plugin) {
      this.packages.delete(id);
      this.versions.delete(id);
      
      // Remove from indexes
      plugin.metadata.keywords.forEach(tag => {
        this.tags.get(tag)?.delete(id);
      });
      this.authors.get(plugin.metadata.author)?.delete(id);
      this.languages.get(plugin.metadata.language)?.delete(id);
      
      return true;
    }
    return false;
  }

  async searchPlugins(params: PluginSearchParams): Promise<PluginSearchResults> {
    let matchingIds = new Set<string>();
    
    // Start with all packages
    this.packages.forEach((_, id) => matchingIds.add(id));

    // Apply filters
    if (params.query) {
      const query = params.query.toLowerCase();
      matchingIds = new Set(
        Array.from(matchingIds).filter(id => {
          const pkg = this.packages.get(id)!;
          return (
            pkg.metadata.name.toLowerCase().includes(query) ||
            pkg.metadata.description.toLowerCase().includes(query)
          );
        })
      );
    }

    if (params.language) {
      const languageIds = this.languages.get(params.language) || new Set();
      matchingIds = new Set(
        Array.from(matchingIds).filter(id => languageIds.has(id))
      );
    }

    if (params.author) {
      const authorIds = this.authors.get(params.author) || new Set();
      matchingIds = new Set(
        Array.from(matchingIds).filter(id => authorIds.has(id))
      );
    }

    if (params.tags && params.tags.length > 0) {
      params.tags.forEach(tag => {
        const tagIds = this.tags.get(tag) || new Set();
        matchingIds = new Set(
          Array.from(matchingIds).filter(id => tagIds.has(id))
        );
      });
    }

    // Apply pagination
    const items = Array.from(matchingIds)
      .map(id => this.packages.get(id)!)
      .slice(params.offset || 0, (params.offset || 0) + (params.limit || 10));

    return {
      total: matchingIds.size,
      items,
      nextOffset: items.length < matchingIds.size ? (params.offset || 0) + items.length : undefined
    };
  }

  async getPluginVersions(id: string): Promise<PluginVersion[]> {
    const versionMap = this.versions.get(id);
    if (!versionMap) {
      return [];
    }

    return Array.from(versionMap.values()).map(plugin => ({
      version: plugin.metadata.version,
      created: plugin.created,
      hash: plugin.hash,
      size: plugin.size
    }));
  }

  async incrementDownloads(id: string): Promise<void> {
    const plugin = this.packages.get(id);
    if (plugin) {
      plugin.downloads++;
    }
  }
} 