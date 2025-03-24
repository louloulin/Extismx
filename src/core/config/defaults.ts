import { LogLevel, RegistryConfig, StorageType } from './types';

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: RegistryConfig = {
  // 基本配置
  isDevelopment: process.env.NODE_ENV !== 'production',
  env: process.env as Record<string, string>,
  logLevel: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',

  // 存储配置
  storage: {
    type: (process.env.STORAGE_TYPE as StorageType) || StorageType.MEMORY,
    options: {
      // 内存存储选项
      memory: {
        persistToFile: process.env.MEMORY_PERSIST === 'true',
        persistPath: process.env.MEMORY_PERSIST_PATH || './data/registry.json',
      },
      // 文件存储选项
      file: {
        basePath: process.env.FILE_STORAGE_PATH || './data/plugins',
      },
      // 数据库存储选项
      database: {
        url: process.env.DATABASE_URL || '',
        ssl: process.env.DATABASE_SSL === 'true',
        poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
      },
      // S3存储选项
      s3: {
        bucket: process.env.S3_BUCKET || '',
        region: process.env.S3_REGION || '',
        prefix: process.env.S3_PREFIX || 'plugins',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || '',
          secretAccessKey: process.env.S3_SECRET_KEY || '',
        },
      },
    },
    cache: {
      enabled: process.env.CACHE_ENABLED !== 'false',
      ttl: parseInt(process.env.CACHE_TTL || '300', 10),
      maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
    },
  },

  // 安全配置
  security: {
    requireSignature: process.env.REQUIRE_SIGNATURE === 'true',
    allowUntrustedKeys: process.env.ALLOW_UNTRUSTED_KEYS === 'true',
    defaultAlgorithm: process.env.DEFAULT_ALGORITHM || 'RSA-SHA256',
    trustedKeys: process.env.TRUSTED_KEYS ? 
      process.env.TRUSTED_KEYS.split(',') : [],
  },

  // 插件配置
  plugins: {
    maxSize: parseInt(process.env.MAX_PLUGIN_SIZE || '10485760', 10), // 默认10MB
    requiredMetadata: ['name', 'version'],
    defaultVisibility: process.env.DEFAULT_VISIBILITY || 'public',
    restrictedTags: process.env.RESTRICTED_TAGS ? 
      process.env.RESTRICTED_TAGS.split(',') : ['system', 'admin'],
  },

  // 集成配置
  integrations: {
    enableMastra: process.env.ENABLE_MASTRA !== 'false',
    enableExtism: process.env.ENABLE_EXTISM !== 'false',
    options: {
      mastra: {
        apiKey: process.env.MASTRA_API_KEY || '',
        endpoint: process.env.MASTRA_ENDPOINT || '',
      },
      extism: {
        allowNetwork: process.env.EXTISM_ALLOW_NETWORK === 'true',
        maxMemory: parseInt(process.env.EXTISM_MAX_MEMORY || '100', 10),
      },
    },
  },
}; 