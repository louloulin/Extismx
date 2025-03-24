/**
 * 基础配置接口
 */
export interface BaseConfig {
  /**
   * 是否在开发模式下运行
   */
  isDevelopment: boolean;

  /**
   * 环境变量
   */
  env: Record<string, string>;

  /**
   * 日志级别
   */
  logLevel: LogLevel;
}

/**
 * 注册表配置接口
 */
export interface RegistryConfig extends BaseConfig {
  /**
   * 基础URL
   */
  baseUrl: string;
  
  /**
   * 存储配置
   */
  storage: StorageConfig;
  
  /**
   * 安全配置
   */
  security: SecurityConfig;

  /**
   * 插件配置
   */
  plugins: PluginConfig;

  /**
   * 集成配置
   */
  integrations: IntegrationsConfig;
}

/**
 * 存储配置接口
 */
export interface StorageConfig {
  /**
   * 存储类型
   */
  type: StorageType;
  
  /**
   * 存储连接选项
   */
  options: Record<string, any>;
  
  /**
   * 存储缓存设置
   */
  cache?: CacheConfig;
}

/**
 * 安全配置接口
 */
export interface SecurityConfig {
  /**
   * 是否要求插件签名
   */
  requireSignature: boolean;
  
  /**
   * 是否允许不受信任的密钥
   */
  allowUntrustedKeys: boolean;
  
  /**
   * 默认签名算法
   */
  defaultAlgorithm: string;
  
  /**
   * 受信任的密钥列表
   */
  trustedKeys: string[];
}

/**
 * 插件配置接口
 */
export interface PluginConfig {
  /**
   * 最大插件大小（字节）
   */
  maxSize: number;
  
  /**
   * 必需的元数据字段
   */
  requiredMetadata: string[];
  
  /**
   * 默认插件可见性
   */
  defaultVisibility: string;
  
  /**
   * 限制标签
   */
  restrictedTags: string[];
}

/**
 * 集成配置接口
 */
export interface IntegrationsConfig {
  /**
   * 是否启用Mastra集成
   */
  enableMastra: boolean;
  
  /**
   * 是否启用Extism集成
   */
  enableExtism: boolean;
  
  /**
   * 集成特定选项
   */
  options: Record<string, any>;
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /**
   * 是否启用缓存
   */
  enabled: boolean;
  
  /**
   * 缓存生存时间（秒）
   */
  ttl: number;
  
  /**
   * 最大缓存项数
   */
  maxItems: number;
}

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SILENT = 'silent'
}

/**
 * 存储类型枚举
 */
export enum StorageType {
  MEMORY = 'memory',
  FILE = 'file',
  DATABASE = 'database',
  S3 = 's3',
  CUSTOM = 'custom'
}

/**
 * 配置错误类型枚举
 */
export enum ConfigErrorType {
  INVALID_CONFIG = 'INVALID_CONFIG',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  TYPE_ERROR = 'TYPE_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PARSE_ERROR = 'PARSE_ERROR'
}

/**
 * 配置错误类
 */
export class ConfigError extends Error {
  constructor(
    message: string,
    public readonly type: ConfigErrorType,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ConfigError';
  }
} 