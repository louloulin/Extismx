import { PublishOptions, PublishResult, PluginManifest } from './types';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Abstract plugin publisher
 */
export abstract class PluginPublisher {
  /**
   * Constructor
   * 
   * @param projectPath - Path to the plugin project
   * @param manifest - Plugin manifest
   * @param options - Publish options
   */
  constructor(
    protected projectPath: string,
    protected manifest: PluginManifest,
    protected options: PublishOptions = {}
  ) {}

  /**
   * Publish plugin
   */
  abstract publish(): Promise<PublishResult>;

  /**
   * Get distribution directory
   */
  protected getDistDir(): string {
    return path.join(this.projectPath, 'dist');
  }

  /**
   * Ensure distribution directory exists
   */
  protected async ensureDistDir(): Promise<void> {
    const distDir = this.getDistDir();
    try {
      await fs.access(distDir);
    } catch {
      await fs.mkdir(distDir, { recursive: true });
    }
  }

  /**
   * Create success result
   */
  protected createSuccessResult(message: string, details: Record<string, any> = {}): PublishResult {
    return {
      success: true,
      message,
      details
    };
  }

  /**
   * Create error result
   */
  protected createErrorResult(message: string, details: Record<string, any> = {}): PublishResult {
    return {
      success: false,
      message,
      details
    };
  }
}

/**
 * Plugin publisher factory
 */
export class PluginPublisherFactory {
  private static publishers = new Map<string, typeof PluginPublisher>();

  /**
   * Register publisher for language
   */
  static registerPublisher(language: string, publisher: typeof PluginPublisher): void {
    this.publishers.set(language, publisher);
  }

  /**
   * Create publisher for language
   */
  static createPublisher(
    language: string,
    projectPath: string,
    manifest: PluginManifest,
    options?: PublishOptions
  ): PluginPublisher {
    const PublisherClass = this.publishers.get(language);
    if (!PublisherClass) {
      throw new Error(`No publisher registered for language: ${language}`);
    }
    return new PublisherClass(projectPath, manifest, options);
  }
} 