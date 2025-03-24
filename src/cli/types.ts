/**
 * CLI配置接口
 */
export interface CliConfig {
  /**
   * 注册表URL
   */
  registryUrl: string;
  
  /**
   * 配置文件路径
   */
  configPath: string;
  
  /**
   * 缓存目录路径
   */
  cachePath: string;
  
  /**
   * 是否启用详细日志
   */
  verbose?: boolean;
  
  /**
   * 首选存储类型
   */
  storageType?: string;
}

/**
 * CLI命令基础接口
 */
export interface Command {
  /**
   * 命令名称
   */
  name: string;
  
  /**
   * 命令简短描述
   */
  description: string;
  
  /**
   * 命令用法说明
   */
  usage: string;
  
  /**
   * 命令执行函数
   * @param args 命令行参数
   * @returns 命令执行结果的Promise
   */
  execute(args: string[]): Promise<CommandResult>;
}

/**
 * 命令执行结果接口
 */
export interface CommandResult {
  /**
   * 是否执行成功
   */
  success: boolean;
  
  /**
   * 结果消息
   */
  message?: string;
  
  /**
   * 错误对象（如果失败）
   */
  error?: Error;
  
  /**
   * 结果数据
   */
  data?: any;
}

/**
 * 插件发布选项
 */
export interface PublishOptions {
  /**
   * 插件文件路径
   */
  path: string;
  
  /**
   * 标签（如latest, beta等）
   */
  tag?: string;
  
  /**
   * 访问级别
   */
  access?: 'public' | 'private' | 'organization';
  
  /**
   * 是否忽略构建脚本
   */
  ignoreScripts?: boolean;
  
  /**
   * 是否跳过验证
   */
  skipValidation?: boolean;
}

/**
 * 插件安装选项
 */
export interface InstallOptions {
  /**
   * 插件名称
   */
  name: string;
  
  /**
   * 版本号
   */
  version?: string;
  
  /**
   * 是否全局安装
   */
  global?: boolean;
  
  /**
   * 是否保存到依赖项
   */
  save?: boolean;
  
  /**
   * 是否保存到开发依赖项
   */
  saveDev?: boolean;
  
  /**
   * 安装目录路径
   */
  directory?: string;
}

/**
 * 插件搜索选项
 */
export interface SearchOptions {
  /**
   * 搜索关键词
   */
  query: string;
  
  /**
   * 结果数量限制
   */
  limit?: number;
  
  /**
   * 分页偏移量
   */
  offset?: number;
  
  /**
   * 按语言筛选
   */
  language?: string;
  
  /**
   * 按标签筛选
   */
  tags?: string[];
  
  /**
   * 排序字段
   */
  sortBy?: string;
  
  /**
   * 排序方向
   */
  sortDirection?: 'asc' | 'desc';
}

/**
 * 命令选项
 */
export interface CommandOptions {
  /**
   * CLI配置
   */
  config: CliConfig;
  
  /**
   * 是否启用详细日志
   */
  verbose?: boolean;
}

/**
 * CLI错误类型
 */
export enum CliErrorType {
  INVALID_ARGS = 'INVALID_ARGS',
  COMMAND_NOT_FOUND = 'COMMAND_NOT_FOUND',
  EXECUTION_FAILED = 'EXECUTION_FAILED',
  CONFIG_ERROR = 'CONFIG_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  REGISTRY_ERROR = 'REGISTRY_ERROR'
}

/**
 * CLI错误类
 */
export class CliError extends Error {
  constructor(
    message: string, 
    public type: CliErrorType, 
    public cause?: Error
  ) {
    super(message);
    this.name = 'CliError';
  }
} 