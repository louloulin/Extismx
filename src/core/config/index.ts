import * as fs from 'fs';
import * as path from 'path';
import { 
  RegistryConfig, 
  ConfigError, 
  ConfigErrorType,
  LogLevel,
  StorageType
} from './types';
import { DEFAULT_CONFIG } from './defaults';

/**
 * 配置管理类
 * 负责加载、验证和提供配置
 */
export class ConfigManager {
  private config: RegistryConfig;
  private filePath?: string;

  /**
   * 构造函数
   * @param configPath 配置文件路径（可选）
   */
  constructor(configPath?: string) {
    this.filePath = configPath;
    this.config = { ...DEFAULT_CONFIG };
  }

  /**
   * 获取当前配置
   */
  getConfig(): RegistryConfig {
    return { ...this.config };
  }

  /**
   * 加载配置
   * 尝试从文件加载，如果失败则使用默认配置加环境变量
   */
  async loadConfig(): Promise<RegistryConfig> {
    try {
      if (this.filePath) {
        await this.loadFromFile(this.filePath);
      } else {
        const envConfigPath = process.env.CONFIG_PATH;
        if (envConfigPath) {
          await this.loadFromFile(envConfigPath);
        }
      }
    } catch (error) {
      // 如果加载失败，记录错误但继续使用环境变量和默认值
      console.warn(
        `Failed to load config file: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'Using default config with environment variables.'
      );
    }

    // 环境变量覆盖
    this.mergeFromEnvironment();
    
    // 验证配置
    this.validateConfig();

    return this.getConfig();
  }

  /**
   * 更新配置
   * @param config 部分配置更新
   */
  updateConfig(config: Partial<RegistryConfig>): RegistryConfig {
    this.config = this.deepMerge(this.config, config) as RegistryConfig;
    this.validateConfig();
    return this.getConfig();
  }

  /**
   * 保存配置到文件
   * @param filePath 保存路径（可选，默认使用构造函数提供的路径）
   */
  async saveConfig(filePath?: string): Promise<void> {
    const savePath = filePath || this.filePath;
    if (!savePath) {
      throw new ConfigError(
        'No file path specified for saving config',
        ConfigErrorType.FILE_NOT_FOUND
      );
    }

    try {
      // 确保目录存在
      const dir = path.dirname(savePath);
      await fs.promises.mkdir(dir, { recursive: true });
      
      // 写入文件
      await fs.promises.writeFile(
        savePath,
        JSON.stringify(this.config, null, 2),
        'utf8'
      );
    } catch (error) {
      throw new ConfigError(
        `Failed to save config to ${savePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ConfigErrorType.FILE_NOT_FOUND,
        error
      );
    }
  }

  /**
   * 重置为默认配置
   */
  resetToDefaults(): RegistryConfig {
    this.config = { ...DEFAULT_CONFIG };
    return this.getConfig();
  }

  /**
   * 从文件加载配置
   * @param filePath 配置文件路径
   */
  private async loadFromFile(filePath: string): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new ConfigError(
          `Config file not found: ${filePath}`,
          ConfigErrorType.FILE_NOT_FOUND
        );
      }

      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      let fileConfig: Partial<RegistryConfig>;

      try {
        fileConfig = JSON.parse(fileContent);
      } catch (error) {
        throw new ConfigError(
          `Invalid JSON in config file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ConfigErrorType.PARSE_ERROR,
          error
        );
      }

      // 合并配置
      this.config = this.deepMerge(DEFAULT_CONFIG, fileConfig) as RegistryConfig;
    } catch (error) {
      if (error instanceof ConfigError) {
        throw error;
      }
      throw new ConfigError(
        `Failed to load config from ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ConfigErrorType.FILE_NOT_FOUND,
        error
      );
    }
  }

  /**
   * 从环境变量合并配置
   */
  private mergeFromEnvironment(): void {
    // 基本配置
    this.setFromEnv('isDevelopment', process.env.NODE_ENV !== 'production');
    this.setFromEnv('logLevel', process.env.LOG_LEVEL as LogLevel);
    this.setFromEnv('baseUrl', process.env.BASE_URL);

    // 存储配置
    this.setFromEnv('storage.type', process.env.STORAGE_TYPE as StorageType);
    // 其他存储选项已在DEFAULT_CONFIG中处理

    // 安全配置
    this.setFromEnv('security.requireSignature', process.env.REQUIRE_SIGNATURE === 'true');
    this.setFromEnv('security.allowUntrustedKeys', process.env.ALLOW_UNTRUSTED_KEYS === 'true');
    // 其他安全选项已在DEFAULT_CONFIG中处理

    // 插件配置
    if (process.env.MAX_PLUGIN_SIZE) {
      this.setFromEnv('plugins.maxSize', parseInt(process.env.MAX_PLUGIN_SIZE, 10));
    }
    // 其他插件选项已在DEFAULT_CONFIG中处理

    // 集成配置
    this.setFromEnv('integrations.enableMastra', process.env.ENABLE_MASTRA !== 'false');
    this.setFromEnv('integrations.enableExtism', process.env.ENABLE_EXTISM !== 'false');
    // 其他集成选项已在DEFAULT_CONFIG中处理
  }

  /**
   * 根据路径设置配置值
   * @param path 配置路径，如 'storage.type'
   * @param value 值
   */
  private setFromEnv(path: string, value: any): void {
    if (value === undefined || value === null) {
      return;
    }

    const parts = path.split('.');
    let current: any = this.config;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }

    return output;
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    // 检查必须的配置字段
    if (!this.config.baseUrl) {
      throw new ConfigError(
        'Missing required config field: baseUrl',
        ConfigErrorType.MISSING_REQUIRED_FIELD
      );
    }

    // 验证存储配置
    if (!Object.values(StorageType).includes(this.config.storage.type)) {
      throw new ConfigError(
        `Invalid storage type: ${this.config.storage.type}`,
        ConfigErrorType.INVALID_CONFIG
      );
    }

    // 根据存储类型验证选项
    switch (this.config.storage.type) {
      case StorageType.DATABASE:
        if (!this.config.storage.options.database?.url) {
          throw new ConfigError(
            'Missing required database URL for database storage',
            ConfigErrorType.MISSING_REQUIRED_FIELD
          );
        }
        break;
      
      case StorageType.S3:
        if (!this.config.storage.options.s3?.bucket) {
          throw new ConfigError(
            'Missing required bucket name for S3 storage',
            ConfigErrorType.MISSING_REQUIRED_FIELD
          );
        }
        break;
    }

    // 验证插件大小限制
    if (this.config.plugins.maxSize <= 0) {
      throw new ConfigError(
        'Plugin max size must be greater than 0',
        ConfigErrorType.INVALID_CONFIG
      );
    }

    // 验证日志级别
    if (!Object.values(LogLevel).includes(this.config.logLevel)) {
      throw new ConfigError(
        `Invalid log level: ${this.config.logLevel}`,
        ConfigErrorType.INVALID_CONFIG
      );
    }
  }
}

/**
 * 检查值是否为对象
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 创建配置管理器实例
 */
export function createConfigManager(configPath?: string): ConfigManager {
  return new ConfigManager(configPath);
}

// 导出类型和配置错误
export * from './types';
export { DEFAULT_CONFIG } from './defaults'; 