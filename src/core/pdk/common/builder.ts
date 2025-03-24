import { BuildConfig, BuildResult, PluginManifest } from './types';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Abstract plugin builder
 */
export abstract class PluginBuilder {
  constructor(
    protected projectPath: string,
    protected manifest: PluginManifest,
    protected config: BuildConfig
  ) {}

  /**
   * Build plugin
   */
  abstract build(): Promise<BuildResult>;

  /**
   * Clean build artifacts
   */
  abstract clean(): Promise<void>;

  /**
   * Get build directory
   */
  protected getBuildDir(): string {
    return path.join(this.projectPath, 'build');
  }

  /**
   * Get output file path
   */
  protected getOutputPath(): string {
    return path.join(this.getBuildDir(), `${this.manifest.name}.wasm`);
  }

  /**
   * Ensure build directory exists
   */
  protected async ensureBuildDir(): Promise<void> {
    const buildDir = this.getBuildDir();
    try {
      await fs.access(buildDir);
    } catch {
      await fs.mkdir(buildDir, { recursive: true });
    }
  }

  /**
   * Get file size
   */
  protected async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  /**
   * Create build result
   */
  protected async createBuildResult(
    success: boolean,
    options: {
      error?: string;
      warnings?: string[];
      buildTime: number;
      optimizationTime?: number;
    }
  ): Promise<BuildResult> {
    const result: BuildResult = {
      success,
      error: options.error,
      warnings: options.warnings,
      stats: {
        buildTime: options.buildTime,
        optimizationTime: options.optimizationTime,
        originalSize: 0,
        optimizedSize: 0
      }
    };

    if (success) {
      const outputPath = this.getOutputPath();
      result.wasmFile = outputPath;
      result.size = await this.getFileSize(outputPath);
      if (result.stats) {
        result.stats.originalSize = result.size;
        if (options.optimizationTime) {
          result.stats.optimizedSize = result.size;
        }
      }
    }

    return result;
  }
}

/**
 * Plugin builder factory
 */
export class PluginBuilderFactory {
  private static builders = new Map<string, typeof PluginBuilder>();

  /**
   * Register builder for language
   */
  static registerBuilder(language: string, builder: typeof PluginBuilder): void {
    this.builders.set(language, builder);
  }

  /**
   * Create builder for language
   */
  static createBuilder(
    language: string,
    projectPath: string,
    manifest: PluginManifest,
    config: BuildConfig
  ): PluginBuilder {
    const BuilderClass = this.builders.get(language);
    if (!BuilderClass) {
      throw new Error(`No builder registered for language: ${language}`);
    }
    return new BuilderClass(projectPath, manifest, config);
  }
} 