import { Command, CliConfig } from './types';
import { Registry } from '../core/registry';
import { PublishCommand } from './commands/publish';
import { MemoryStorage } from '../core/registry/storage';

/**
 * CLI main class
 */
export class CLI {
  private commands: Map<string, Command>;
  private registry: Registry;

  constructor(private config: CliConfig) {
    // Initialize registry with memory storage (can be changed to other storage implementations)
    this.registry = new Registry(
      new MemoryStorage(),
      {
        baseUrl: config.registryUrl,
        storage: { type: 'memory' },
        security: { enableSignatureVerification: true }
      }
    );

    // Register commands
    this.commands = new Map();
    this.registerCommands();
  }

  /**
   * Register available commands
   */
  private registerCommands(): void {
    const commands: Command[] = [
      new PublishCommand(this.registry),
      // Add more commands here
    ];

    commands.forEach(cmd => {
      this.commands.set(cmd.name, cmd);
    });
  }

  /**
   * Get help text
   */
  private getHelp(): string {
    let help = 'Available commands:\n\n';
    
    this.commands.forEach(cmd => {
      help += `${cmd.name.padEnd(15)} - ${cmd.description}\n`;
    });

    return help;
  }

  /**
   * Run CLI with arguments
   */
  async run(args: string[]): Promise<void> {
    try {
      const [commandName, ...commandArgs] = args;

      if (!commandName || commandName === '--help' || commandName === '-h') {
        console.log(this.getHelp());
        return;
      }

      const command = this.commands.get(commandName);
      if (!command) {
        console.error(`Unknown command: ${commandName}`);
        console.log(this.getHelp());
        process.exit(1);
      }

      await command.execute(commandArgs);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
  }
}

/**
 * Create CLI instance with default configuration
 */
export function createCLI(config?: Partial<CliConfig>): CLI {
  const defaultConfig: CliConfig = {
    registryUrl: 'http://localhost:3000',
    configPath: './.extism/config.json',
    cachePath: './.extism/cache'
  };

  return new CLI({
    ...defaultConfig,
    ...config
  });
} 