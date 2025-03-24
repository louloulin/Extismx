import { Registry } from '../../src/core/registry';
import { MemoryStorage } from '../../src/core/registry/storage';
import { Plugin, PluginMetadata, PluginStatus, PluginVisibility } from '../../src/core/registry/types';

describe('Registry', () => {
  let registry: Registry;
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    registry = new Registry(storage);
  });

  describe('registerPlugin', () => {
    const validMetadata: PluginMetadata = {
      name: 'test-plugin',
      version: '1.0.0',
      runtime: 'node16',
      dependencies: {},
    };

    it('should register a valid plugin', async () => {
      const plugin = await registry.registerPlugin(
        Buffer.from('test-content'),
        validMetadata,
        PluginVisibility.PUBLIC
      );

      expect(plugin).toBeDefined();
      expect(plugin.metadata).toEqual(validMetadata);
      expect(plugin.visibility).toBe(PluginVisibility.PUBLIC);
      expect(plugin.status).toBe(PluginStatus.ACTIVE);
    });

    it('should reject invalid metadata', async () => {
      const invalidMetadata = { ...validMetadata, name: '' };
      
      await expect(
        registry.registerPlugin(
          Buffer.from('test-content'),
          invalidMetadata,
          PluginVisibility.PUBLIC
        )
      ).rejects.toThrow('Invalid plugin metadata');
    });

    it('should generate unique plugin IDs', async () => {
      const plugin1 = await registry.registerPlugin(
        Buffer.from('content-1'),
        validMetadata,
        PluginVisibility.PUBLIC
      );

      const plugin2 = await registry.registerPlugin(
        Buffer.from('content-2'),
        { ...validMetadata, version: '1.0.1' },
        PluginVisibility.PUBLIC
      );

      expect(plugin1.id).not.toBe(plugin2.id);
    });
  });

  describe('getPlugin', () => {
    it('should retrieve a registered plugin', async () => {
      const content = Buffer.from('test-content');
      const metadata: PluginMetadata = {
        name: 'test-plugin',
        version: '1.0.0',
        runtime: 'node16',
        dependencies: {},
      };

      const registered = await registry.registerPlugin(
        content,
        metadata,
        PluginVisibility.PUBLIC
      );

      const retrieved = await registry.getPlugin(registered.id);
      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(registered.id);
      expect(retrieved.metadata).toEqual(metadata);
    });

    it('should throw error for non-existent plugin', async () => {
      await expect(registry.getPlugin('non-existent-id')).rejects.toThrow(
        'Plugin not found'
      );
    });
  });

  describe('queryPlugins', () => {
    beforeEach(async () => {
      // Register multiple test plugins
      const plugins = [
        {
          content: Buffer.from('plugin-1'),
          metadata: {
            name: 'plugin-1',
            version: '1.0.0',
            runtime: 'node16',
            dependencies: {},
            tags: ['test', 'demo'],
          },
          visibility: PluginVisibility.PUBLIC,
        },
        {
          content: Buffer.from('plugin-2'),
          metadata: {
            name: 'plugin-2',
            version: '2.0.0',
            runtime: 'node16',
            dependencies: {},
            tags: ['test', 'production'],
          },
          visibility: PluginVisibility.PRIVATE,
        },
      ];

      for (const plugin of plugins) {
        await registry.registerPlugin(
          plugin.content,
          plugin.metadata,
          plugin.visibility
        );
      }
    });

    it('should filter plugins by tag', async () => {
      const results = await registry.queryPlugins({
        tags: ['production'],
      });

      expect(results.items).toHaveLength(1);
      expect(results.items[0].metadata.name).toBe('plugin-2');
    });

    it('should filter plugins by visibility', async () => {
      const results = await registry.queryPlugins({
        visibility: PluginVisibility.PUBLIC,
      });

      expect(results.items).toHaveLength(1);
      expect(results.items[0].metadata.name).toBe('plugin-1');
    });

    it('should support pagination', async () => {
      const results = await registry.queryPlugins({
        limit: 1,
        offset: 0,
      });

      expect(results.items).toHaveLength(1);
      expect(results.total).toBe(2);
    });
  });
}); 