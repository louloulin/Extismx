import { IRegistryStorage, Plugin, PluginQueryOptions, PluginQueryResult, PluginStatus, PluginVisibility, RegistryError, RegistryErrorType } from './types';

/**
 * Registry storage interface
 */
export interface IRegistryStorage {
  savePlugin(plugin: Plugin): Promise<void>;
  getPlugin(id: string): Promise<Plugin | null>;
  deletePlugin(id: string): Promise<void>;
  queryPlugins(options: PluginQueryOptions): Promise<PluginQueryResult>;
  incrementDownloads(id: string): Promise<void>;
  updateStatus(id: string, status: PluginStatus): Promise<void>;
  updateVisibility(id: string, visibility: PluginVisibility): Promise<void>;
}

/**
 * In-memory storage implementation
 */
export class MemoryStorage implements IRegistryStorage {
  private plugins: Map<string, Plugin> = new Map();

  async savePlugin(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new RegistryError(
        `Plugin with ID ${plugin.id} already exists`,
        RegistryErrorType.PLUGIN_ALREADY_EXISTS
      );
    }
    this.plugins.set(plugin.id, { ...plugin });
  }

  async getPlugin(id: string): Promise<Plugin | null> {
    const plugin = this.plugins.get(id);
    return plugin ? { ...plugin } : null;
  }

  async deletePlugin(id: string): Promise<void> {
    if (!this.plugins.has(id)) {
      throw new RegistryError(
        `Plugin with ID ${id} not found`,
        RegistryErrorType.PLUGIN_NOT_FOUND
      );
    }
    this.plugins.delete(id);
  }

  async queryPlugins(options: PluginQueryOptions): Promise<PluginQueryResult> {
    let plugins = Array.from(this.plugins.values());

    // Apply filters
    if (options.status) {
      plugins = plugins.filter(p => p.status === options.status);
    }
    if (options.visibility) {
      plugins = plugins.filter(p => p.visibility === options.visibility);
    }
    if (options.tags) {
      plugins = plugins.filter(p => 
        options.tags!.every(tag => p.metadata.tags?.includes(tag))
      );
    }
    if (options.author) {
      plugins = plugins.filter(p => p.metadata.author === options.author);
    }
    if (options.runtime) {
      plugins = plugins.filter(p => {
        const runtime = p.metadata.runtime || {};
        return Object.entries(options.runtime!).every(
          ([key, value]) => runtime[key as keyof typeof runtime] === value
        );
      });
    }

    // Apply sorting
    if (options.sort) {
      const { field, order } = options.sort;
      plugins.sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];
        if (aValue === undefined || bValue === undefined) {
          return 0;
        }
        const orderMultiplier = order === 'asc' ? 1 : -1;
        return aValue < bValue ? -orderMultiplier : aValue > bValue ? orderMultiplier : 0;
      });
    }

    // Apply pagination
    const pagination = options.pagination || { page: 1, limit: 10 };
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    const paginatedPlugins = plugins.slice(start, end);

    return {
      plugins: paginatedPlugins,
      total: plugins.length,
      page: pagination.page,
      limit: pagination.limit,
      hasMore: end < plugins.length
    };
  }

  async incrementDownloads(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new RegistryError(
        `Plugin with ID ${id} not found`,
        RegistryErrorType.PLUGIN_NOT_FOUND
      );
    }
    plugin.downloads++;
    this.plugins.set(id, plugin);
  }

  async updateStatus(id: string, status: PluginStatus): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new RegistryError(
        `Plugin with ID ${id} not found`,
        RegistryErrorType.PLUGIN_NOT_FOUND
      );
    }
    plugin.status = status;
    plugin.updatedAt = new Date();
    this.plugins.set(id, plugin);
  }

  async updateVisibility(id: string, visibility: PluginVisibility): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new RegistryError(
        `Plugin with ID ${id} not found`,
        RegistryErrorType.PLUGIN_NOT_FOUND
      );
    }
    plugin.visibility = visibility;
    plugin.updatedAt = new Date();
    this.plugins.set(id, plugin);
  }
} 