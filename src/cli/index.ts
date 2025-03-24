import { Command, CliConfig, CliError, CliErrorType } from './types';
import { createConfigManager } from '../core/config';
import { Registry } from '../core/registry';
import { MemoryStorage } from '../core/registry/storage';
import { PublishCommand } from './commands/publish';
import { SearchCommand } from './commands/search';
import * as path from 'path';
import * as fs from 'fs';

/**
 * CLI 主类
 * 负责管理和执行命令
 */
export class CLI {
  private commands: Map<string, Command>;
  private registry: Registry;

  /**
   * 构造函数
   * @param config CLI配置
   */
  constructor(private config: CliConfig) {
    // 初始化注册表
    const storage = new MemoryStorage();
    this.registry = new Registry(
      storage,
      {
        maxPluginSize: 10 * 1024 * 1024, // 10MB
        validateMetadata: undefined,
        validatePlugin: undefined,
        requiredTags: [],
        allowPrivatePlugins: true,
        allowOrganizationPlugins: true
      }
    );

    // 注册命令
    this.commands = new Map();
    this.registerCommands();
  }

  /**
   * 注册可用命令
   */
  private registerCommands(): void {
    const commands: Command[] = [
      new PublishCommand(this.registry),
      new SearchCommand(this.registry),
      // 添加更多命令
    ];

    for (const cmd of commands) {
      this.commands.set(cmd.name, cmd);
    }
  }

  /**
   * 获取帮助文本
   */
  private getHelp(): string {
    let help = '插件注册表命令行工具\n\n';
    help += '用法: registry <命令> [选项]\n\n';
    help += '可用命令:\n\n';
    
    const commandList = Array.from(this.commands.values())
      .sort((a, b) => a.name.localeCompare(b.name));
    
    for (const cmd of commandList) {
      help += `  ${cmd.name.padEnd(15)} - ${cmd.description}\n`;
      help += `    ${cmd.usage}\n\n`;
    }

    help += '全局选项:\n';
    help += '  --help, -h       显示帮助信息\n';
    help += '  --version, -v    显示版本信息\n';
    
    return help;
  }

  /**
   * 运行CLI，处理参数
   * @param args 命令行参数
   * @returns 执行Promise
   */
  async run(args: string[]): Promise<void> {
    try {
      // 没有参数，显示帮助
      if (args.length === 0) {
        console.log(this.getHelp());
        return;
      }

      const [commandName, ...commandArgs] = args;

      // 处理全局标志
      if (commandName === '--help' || commandName === '-h') {
        console.log(this.getHelp());
        return;
      }

      if (commandName === '--version' || commandName === '-v') {
        // 从 package.json 获取版本
        try {
          const packageJsonPath = path.resolve(__dirname, '../../package.json');
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          console.log(`插件注册表CLI 版本 ${packageJson.version || '未知'}`);
        } catch (error) {
          console.log('插件注册表CLI 版本 未知');
        }
        return;
      }

      // 查找并执行命令
      const command = this.commands.get(commandName);
      if (!command) {
        console.error(`未知命令: ${commandName}`);
        console.log(this.getHelp());
        process.exit(1);
      }

      // 执行命令
      const result = await command.execute(commandArgs);
      
      if (result.success) {
        if (result.message) {
          console.log(result.message);
        }
        if (this.config.verbose && result.data) {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } else {
        console.error(`错误: ${result.message}`);
        if (this.config.verbose && result.error) {
          console.error('详细错误:');
          console.error(result.error);
        }
        process.exit(1);
      }
    } catch (error: any) {
      console.error('执行错误:', error.message);
      if (this.config.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  }
}

/**
 * 创建CLI实例
 * @param config 配置选项
 * @returns CLI实例
 */
export function createCLI(config?: Partial<CliConfig>): CLI {
  // 默认配置
  const defaultConfig: CliConfig = {
    registryUrl: process.env.REGISTRY_URL || 'http://localhost:3000',
    configPath: process.env.CONFIG_PATH || './.extism/config.json',
    cachePath: process.env.CACHE_PATH || './.extism/cache',
    verbose: process.env.VERBOSE === 'true',
    storageType: process.env.STORAGE_TYPE || 'memory'
  };

  // 合并配置
  const finalConfig: CliConfig = {
    ...defaultConfig,
    ...config
  };

  return new CLI(finalConfig);
}

// 导出命令类型和其他类型
export * from './types';
export * from './commands/publish';
export * from './commands/search'; 