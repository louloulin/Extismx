import { MemoryStorage } from '../../src/core/registry/storage';
import { Plugin, PluginMetadata, PluginStatus, PluginVisibility } from '../../src/core/registry/types';

describe('MemoryStorage Integration', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  describe('Plugin CRUD Operations', () => {
    const testPlugin: Plugin = {
      id: 'test-plugin-1',
      metadata: {
        name: 'test-plugin',
        version: '1.0.0',
        runtime: {
          node: true
        },
        dependencies: {},
      },
      hash: 'test-hash',
      signature: 'test-signature',
      createdAt: new Date(),
      updatedAt: new Date(),
      downloads: 0,
      status: PluginStatus.DRAFT,
      visibility: PluginVisibility.PUBLIC,
    };

    it('should save and retrieve a plugin', async () => {
      await storage.savePlugin(testPlugin);
      const retrieved = await storage.getPlugin(testPlugin.id);
      
      expect(retrieved).not.toBeNull();
      if (retrieved) {
        expect(retrieved.id).toBe(testPlugin.id);
        expect(retrieved.metadata).toEqual(testPlugin.metadata);
      }
    });

    it('should delete a plugin', async () => {
      await storage.savePlugin(testPlugin);
      await storage.deletePlugin(testPlugin.id);
      
      const retrieved = await storage.getPlugin(testPlugin.id);
      expect(retrieved).toBeNull();
    });

    it('should update plugin status', async () => {
      await storage.savePlugin(testPlugin);
      await storage.updateStatus(testPlugin.id, PluginStatus.DISABLED);
      
      const updated = await storage.getPlugin(testPlugin.id);
      expect(updated).not.toBeNull();
      if (updated) {
        expect(updated.status).toBe(PluginStatus.DISABLED);
      }
    });

    it('should update plugin visibility', async () => {
      await storage.savePlugin(testPlugin);
      await storage.updateVisibility(testPlugin.id, PluginVisibility.PRIVATE);
      
      const updated = await storage.getPlugin(testPlugin.id);
      expect(updated).not.toBeNull();
      if (updated) {
        expect(updated.visibility).toBe(PluginVisibility.PRIVATE);
      }
    });

    it('should increment download count', async () => {
      await storage.savePlugin(testPlugin);
      await storage.incrementDownloads(testPlugin.id);
      
      const updated = await storage.getPlugin(testPlugin.id);
      expect(updated).not.toBeNull();
      if (updated) {
        expect(updated.downloads).toBe(1);
      }
    });
  });

  describe('Plugin Querying', () => {
    beforeEach(async () => {
      const plugins: Plugin[] = [
        {
          id: 'plugin-1',
          metadata: {
            name: 'plugin-1',
            version: '1.0.0',
            runtime: {
              node: true
            },
            dependencies: {},
            tags: ['test', 'demo'],
          },
          hash: 'hash-1',
          signature: 'sig-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          downloads: 10,
          status: PluginStatus.DRAFT,
          visibility: PluginVisibility.PUBLIC,
        },
        {
          id: 'plugin-2',
          metadata: {
            name: 'plugin-2',
            version: '2.0.0',
            runtime: {
              node: true
            },
            dependencies: {},
            tags: ['test', 'production'],
          },
          hash: 'hash-2',
          signature: 'sig-2',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          downloads: 20,
          status: PluginStatus.DRAFT,
          visibility: PluginVisibility.PRIVATE,
        },
      ];

      for (const plugin of plugins) {
        await storage.savePlugin(plugin);
      }
    });

    it('should query plugins with filters', async () => {
      const results = await storage.queryPlugins({
        tags: ['production'],
        visibility: PluginVisibility.PRIVATE,
      });

      expect(results.plugins).toHaveLength(1);
      expect(results.plugins[0].metadata.name).toBe('plugin-2');
    });

    it('should sort plugins by downloads', async () => {
      const results = await storage.queryPlugins({
        sort: {
          field: 'downloads',
          order: 'desc'
        }
      });

      expect(results.plugins).toHaveLength(2);
      expect(results.plugins[0].downloads).toBe(20);
      expect(results.plugins[1].downloads).toBe(10);
    });

    it('should paginate results', async () => {
      const results = await storage.queryPlugins({
        pagination: {
          page: 2,
          limit: 1
        }
      });

      expect(results.plugins).toHaveLength(1);
      expect(results.total).toBe(2);
      expect(results.plugins[0].metadata.name).toBe('plugin-2');
    });
  });
}); 