/**
 * Go plugin builder implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { PluginBuilder } from '../common/builder';
import { PDKError, PDKErrorCode } from '../../errors/pdk';
import { PluginManifest, BuildResult, BuildConfig } from '../common/types';

const execAsync = promisify(exec);

/**
 * Options specific to Go plugin building
 */
export interface GoBuildOptions {
  /**
   * Go compiler path
   */
  goPath?: string;
  
  /**
   * TinyGo compiler path (preferred for WebAssembly)
   */
  tinyGoPath?: string;
  
  /**
   * Whether to use TinyGo for compilation (recommended for smaller binaries)
   */
  useTinyGo?: boolean;
  
  /**
   * Additional build tags for Go compilation
   */
  tags?: string[];
  
  /**
   * Additional LDFLAGS for Go compilation
   */
  ldflags?: string[];
  
  /**
   * Whether to run go mod tidy before building
   */
  runGoModTidy?: boolean;
  
  /**
   * Additional environment variables for the build process
   */
  env?: Record<string, string>;
}

/**
 * Go plugin builder implementation
 */
export class GoBuilder extends PluginBuilder {
  /**
   * Default Go build options
   */
  private defaultGoBuildOptions: GoBuildOptions = {
    goPath: 'go',
    tinyGoPath: 'tinygo',
    useTinyGo: true,
    runGoModTidy: true,
    env: {
      'GOOS': 'js',
      'GOARCH': 'wasm'
    }
  };

  /**
   * Go build options
   */
  private goBuildOptions: GoBuildOptions;

  /**
   * Constructor
   * 
   * @param projectPath - Path to the plugin project
   * @param manifest - Plugin manifest
   * @param config - Build configuration
   * @param goBuildOptions - Go-specific build options
   */
  constructor(
    projectPath: string,
    manifest: PluginManifest,
    config: BuildConfig,
    goBuildOptions?: GoBuildOptions
  ) {
    super(projectPath, manifest, config);
    this.goBuildOptions = { ...this.defaultGoBuildOptions, ...goBuildOptions };
  }

  /**
   * Verify the Go environment
   * 
   * @returns Result of environment verification
   */
  private async verifyEnvironment(): Promise<{ valid: boolean; error?: string }> {
    try {
      const compiler = this.goBuildOptions.useTinyGo 
        ? this.goBuildOptions.tinyGoPath 
        : this.goBuildOptions.goPath;
      
      const { stdout } = await execAsync(`${compiler} version`, { 
        env: { ...process.env }
      });
      
      const isValid = this.goBuildOptions.useTinyGo 
        ? stdout.toLowerCase().includes('tinygo') 
        : stdout.toLowerCase().includes('go version');
      
      if (!isValid) {
        return { 
          valid: false, 
          error: `Invalid compiler output: ${stdout}` 
        };
      }
      
      return { valid: true };
    } catch (error) {
      const compiler = this.goBuildOptions.useTinyGo ? 'TinyGo' : 'Go';
      return { 
        valid: false, 
        error: `${compiler} compiler not found or not working correctly: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Run go mod tidy
   * 
   * @returns Result of go mod tidy
   */
  private async runGoModTidy(): Promise<{ success: boolean; output: string }> {
    try {
      const { stdout, stderr } = await execAsync(`${this.goBuildOptions.goPath} mod tidy`, {
        cwd: this.projectPath,
        env: { ...process.env }
      });
      
      return {
        success: true,
        output: stdout + stderr
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Clean build artifacts
   */
  async clean(): Promise<void> {
    try {
      // Ensure the build directory exists
      await this.ensureBuildDir();
      
      // Clean Go cache
      await execAsync(`${this.goBuildOptions.goPath} clean`, {
        cwd: this.projectPath,
        env: { ...process.env }
      });
      
      // Remove the plugin.wasm file if it exists
      const outputPath = this.getOutputPath();
      try {
        await fs.promises.access(outputPath);
        await fs.promises.unlink(outputPath);
      } catch (error) {
        // File doesn't exist, nothing to do
      }
    } catch (error) {
      // Ignore errors in clean
      console.warn(`Warning: Failed to clean build artifacts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Build the Go plugin
   * 
   * @returns A promise that resolves to the build result
   */
  async build(): Promise<BuildResult> {
    const startTime = Date.now();
    
    try {
      // Verify Go environment
      const envCheck = await this.verifyEnvironment();
      if (!envCheck.valid) {
        throw new PDKError(
          envCheck.error || 'Go environment verification failed',
          PDKErrorCode.MISSING_DEPENDENCY
        );
      }
      
      // Run go mod tidy if configured
      if (this.goBuildOptions.runGoModTidy) {
        const tidyResult = await this.runGoModTidy();
        if (!tidyResult.success) {
          throw new PDKError(
            `go mod tidy failed: ${tidyResult.output}`,
            PDKErrorCode.BUILD_FAILED
          );
        }
      }
      
      // Ensure the build directory exists
      await this.ensureBuildDir();
      
      // Determine the output path
      const outputPath = this.getOutputPath();
      
      // Build the command based on whether TinyGo or standard Go is used
      let buildCommand: string;
      let buildEnv = { ...process.env };
      
      if (this.goBuildOptions.env) {
        buildEnv = { ...buildEnv, ...this.goBuildOptions.env };
      }
      
      if (this.goBuildOptions.useTinyGo) {
        const tagsArg = this.goBuildOptions.tags?.length 
          ? `-tags="${this.goBuildOptions.tags.join(',')}"` 
          : '';
        
        buildCommand = `${this.goBuildOptions.tinyGoPath} build -o ${outputPath} ${tagsArg} -target=wasm .`;
      } else {
        const tagsArg = this.goBuildOptions.tags?.length 
          ? `-tags=${this.goBuildOptions.tags.join(',')}` 
          : '';
        
        const ldflagsArg = this.goBuildOptions.ldflags?.length 
          ? `-ldflags="${this.goBuildOptions.ldflags.join(' ')}"` 
          : '';
        
        buildCommand = `${this.goBuildOptions.goPath} build ${tagsArg} ${ldflagsArg} -o ${outputPath} .`;
      }
      
      // Execute the build command
      const { stdout, stderr } = await execAsync(buildCommand, {
        cwd: this.projectPath,
        env: buildEnv
      });
      
      // Check if the build was successful (output file exists)
      if (!fs.existsSync(outputPath)) {
        throw new PDKError(
          `Build command completed but no output file was generated: ${stdout}\n${stderr}`,
          PDKErrorCode.COMPILATION_ERROR
        );
      }
      
      // Get file size
      const stats = fs.statSync(outputPath);
      const originalSize = stats.size;
      
      const buildTime = Date.now() - startTime;
      
      // Parse warnings from output
      const warnings = stderr.split('\n')
        .filter(line => line.toLowerCase().includes('warning'))
        .map(line => line.trim());
      
      return {
        success: true,
        wasmFile: outputPath,
        size: originalSize,
        warnings: warnings.length > 0 ? warnings : undefined,
        stats: {
          buildTime,
          originalSize,
          optimizedSize: originalSize // No additional optimization step
        }
      };
    } catch (error) {
      // Handle specific PDK errors
      if (error instanceof PDKError) {
        return {
          success: false,
          error: error.message,
          stats: {
            buildTime: Date.now() - startTime,
            originalSize: 0
          }
        };
      }
      
      // Handle generic errors
      return {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : `Unknown error: ${String(error)}`,
        stats: {
          buildTime: Date.now() - startTime,
          originalSize: 0
        }
      };
    }
  }
} 