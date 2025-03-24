import { Command, CommandOptions, PublishOptions, CommandResult } from '../types';
import { Registry } from '../../core/registry';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Plugin publish command
 */
export class PublishCommand implements Command {
  name = 'publish';
  description = 'Publish a plugin to the registry';

  constructor(private registry: Registry) {}

  async execute(args: string[]): Promise<void> {
    const options = this.parseOptions(args);
    
    try {
      // Read plugin metadata and content
      const packagePath = path.resolve(options.path);
      const content = await fs.readFile(packagePath);
      const metadataPath = path.join(path.dirname(packagePath), 'package.json');
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

      // Publish to registry
      const result = await this.registry.publishPlugin(metadata, content);

      if (!result.success) {
        throw new Error(result.message);
      }

      console.log('Plugin published successfully:', result.plugin?.id);
    } catch (error) {
      console.error('Failed to publish plugin:', error.message);
      throw error;
    }
  }

  private parseOptions(args: string[]): PublishOptions {
    // Simple argument parsing, could be enhanced with a proper CLI args parser
    const options: PublishOptions = {
      path: args[0] || '.',
      tag: 'latest'
    };

    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--tag' && args[i + 1]) {
        options.tag = args[++i];
      } else if (arg === '--access' && args[i + 1]) {
        options.access = args[++i] as 'public' | 'private';
      } else if (arg === '--ignore-scripts') {
        options.ignoreScripts = true;
      }
    }

    return options;
  }
} 