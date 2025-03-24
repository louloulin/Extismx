/**
 * CLI command interface
 */
export interface Command {
  name: string;
  description: string;
  execute(args: string[]): Promise<void>;
}

/**
 * CLI configuration
 */
export interface CliConfig {
  registryUrl: string;
  configPath: string;
  cachePath: string;
}

/**
 * Command options
 */
export interface CommandOptions {
  config: CliConfig;
  verbose?: boolean;
}

/**
 * Command result
 */
export interface CommandResult {
  success: boolean;
  message?: string;
  error?: Error;
}

/**
 * Plugin publish options
 */
export interface PublishOptions {
  path: string;
  tag?: string;
  access?: 'public' | 'private';
  ignoreScripts?: boolean;
}

/**
 * Plugin install options
 */
export interface InstallOptions {
  name: string;
  version?: string;
  global?: boolean;
  save?: boolean;
  saveDev?: boolean;
}

/**
 * Plugin search options
 */
export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  language?: string;
  tags?: string[];
} 