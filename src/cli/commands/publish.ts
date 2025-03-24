import { 
  Command, 
  CommandResult, 
  PublishOptions, 
  CliError, 
  CliErrorType 
} from '../types';
import { Registry } from '../../core/registry';
import { PluginMetadata, PluginVisibility } from '../../core/registry/types';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 插件发布命令实现
 */
export class PublishCommand implements Command {
  name = 'publish';
  description = '发布插件到注册表';
  usage = 'publish <plugin-file> [options]';

  /**
   * 构造函数
   * @param registry 注册表实例
   */
  constructor(private registry: Registry) {}

  /**
   * 执行命令
   * @param args 命令行参数
   * @returns 命令执行结果
   */
  async execute(args: string[]): Promise<CommandResult> {
    try {
      // 解析选项
      const options = this.parseOptions(args);
      
      // 验证必需参数
      if (!options.path) {
        return {
          success: false,
          message: '缺少必需的插件文件路径',
          error: new CliError(
            '请指定要发布的插件文件路径',
            CliErrorType.INVALID_ARGS
          )
        };
      }

      // 读取插件文件
      const pluginPath = path.resolve(options.path);
      let content: Buffer;
      try {
        content = await fs.readFile(pluginPath);
      } catch (error: any) {
        return {
          success: false,
          message: `无法读取插件文件: ${error.message}`,
          error: new CliError(
            `无法读取插件文件: ${error.message}`,
            CliErrorType.EXECUTION_FAILED,
            error instanceof Error ? error : new Error(String(error))
          )
        };
      }

      // 读取元数据文件
      const metadataPath = path.join(path.dirname(pluginPath), 'package.json');
      let metadata: PluginMetadata;
      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        const parsedMetadata = JSON.parse(metadataContent);
        
        // 确保包含必要的元数据字段
        if (!parsedMetadata.name || !parsedMetadata.version) {
          throw new Error('元数据缺少必需的name或version字段');
        }
        
        metadata = parsedMetadata as PluginMetadata;
      } catch (error: any) {
        return {
          success: false,
          message: `无法读取或解析元数据文件: ${error.message}`,
          error: new CliError(
            `无法读取或解析元数据文件: ${error.message}`,
            CliErrorType.EXECUTION_FAILED,
            error instanceof Error ? error : new Error(String(error))
          )
        };
      }

      // 获取访问级别
      let visibility: PluginVisibility | undefined;
      if (options.access === 'public') {
        visibility = PluginVisibility.PUBLIC;
      } else if (options.access === 'private') {
        visibility = PluginVisibility.PRIVATE;
      } else if (options.access === 'organization') {
        visibility = PluginVisibility.ORGANIZATION;
      }

      // 发布插件
      try {
        const result = await this.registry.registerPlugin(
          metadata,
          content,
          { visibility }
        );

        return {
          success: true,
          message: `插件发布成功: ${result.id}`,
          data: result
        };
      } catch (error: any) {
        return {
          success: false,
          message: `插件发布失败: ${error.message}`,
          error: new CliError(
            `插件发布失败: ${error.message}`,
            CliErrorType.REGISTRY_ERROR,
            error instanceof Error ? error : new Error(String(error))
          )
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `命令执行失败: ${error.message}`,
        error: new CliError(
          `命令执行失败: ${error.message}`,
          CliErrorType.EXECUTION_FAILED,
          error instanceof Error ? error : new Error(String(error))
        )
      };
    }
  }

  /**
   * 解析命令行选项
   * @param args 命令行参数
   * @returns 解析后的发布选项
   */
  private parseOptions(args: string[]): PublishOptions {
    const options: PublishOptions = {
      path: args[0] || '',
      tag: 'latest',
      ignoreScripts: false,
      skipValidation: false
    };

    // 处理选项
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--tag' || arg === '-t') {
        options.tag = args[++i] || 'latest';
      } else if (arg === '--access' || arg === '-a') {
        const access = args[++i];
        if (access === 'public' || access === 'private' || access === 'organization') {
          options.access = access;
        } else {
          throw new CliError(
            `无效的访问级别: ${access}。有效值: public, private, organization`,
            CliErrorType.INVALID_ARGS
          );
        }
      } else if (arg === '--ignore-scripts') {
        options.ignoreScripts = true;
      } else if (arg === '--skip-validation') {
        options.skipValidation = true;
      } else if (arg.startsWith('--')) {
        throw new CliError(
          `未知选项: ${arg}`,
          CliErrorType.INVALID_ARGS
        );
      }
    }

    return options;
  }
} 