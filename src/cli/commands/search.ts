import { 
  Command, 
  CommandResult, 
  SearchOptions, 
  CliError, 
  CliErrorType 
} from '../types';
import { Registry } from '../../core/registry';
import { 
  PluginQueryOptions, 
  PluginStatus, 
  PluginVisibility 
} from '../../core/registry/types';

/**
 * 插件搜索命令实现
 */
export class SearchCommand implements Command {
  name = 'search';
  description = '搜索注册表中的插件';
  usage = 'search [options]';

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
      
      // 转换为查询选项
      const queryOptions: PluginQueryOptions = {
        tags: options.query ? [options.query] : options.tags,
        status: PluginStatus.PUBLISHED,
        visibility: PluginVisibility.PUBLIC,
        pagination: {
          page: Math.floor((options.offset || 0) / (options.limit || 10)) + 1,
          limit: options.limit || 10
        }
      };

      // 添加排序
      if (options.sortBy) {
        queryOptions.sort = {
          field: options.sortBy as any,
          order: options.sortDirection === 'desc' ? 'desc' : 'asc'
        };
      }

      try {
        // 执行查询
        const result = await this.registry.queryPlugins(queryOptions);
        
        return {
          success: true,
          message: `找到 ${result.total} 个匹配的插件`,
          data: result
        };
      } catch (error: any) {
        return {
          success: false,
          message: `搜索插件失败: ${error.message}`,
          error: new CliError(
            `搜索插件失败: ${error.message}`,
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
   * @returns 解析后的搜索选项
   */
  private parseOptions(args: string[]): SearchOptions {
    const options: SearchOptions = {
      query: args[0] || '',
      limit: 10,
      offset: 0,
      tags: []
    };

    // 处理选项
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--limit' || arg === '-l') {
        const limit = parseInt(args[++i], 10);
        if (isNaN(limit) || limit <= 0) {
          throw new CliError(
            `无效的限制数量: ${args[i]}，必须是正整数`,
            CliErrorType.INVALID_ARGS
          );
        }
        options.limit = limit;
      } else if (arg === '--offset' || arg === '-o') {
        const offset = parseInt(args[++i], 10);
        if (isNaN(offset) || offset < 0) {
          throw new CliError(
            `无效的偏移量: ${args[i]}，必须是非负整数`,
            CliErrorType.INVALID_ARGS
          );
        }
        options.offset = offset;
      } else if (arg === '--tag' || arg === '-t') {
        options.tags!.push(args[++i]);
      } else if (arg === '--language' || arg === '-L') {
        options.language = args[++i];
      } else if (arg === '--sort-by' || arg === '-s') {
        options.sortBy = args[++i];
      } else if (arg === '--sort-direction' || arg === '-d') {
        const direction = args[++i];
        if (direction !== 'asc' && direction !== 'desc') {
          throw new CliError(
            `无效的排序方向: ${direction}，有效值: asc, desc`,
            CliErrorType.INVALID_ARGS
          );
        }
        options.sortDirection = direction;
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