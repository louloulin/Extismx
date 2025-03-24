import { PluginBuilder } from '../common/builder';
import { BuildResult } from '../common/types';
import * as path from 'path';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * TypeScript plugin builder
 */
export class TypeScriptBuilder extends PluginBuilder {
  /**
   * Build plugin
   */
  async build(): Promise<BuildResult> {
    const startTime = Date.now();
    let optimizationTime = 0;

    try {
      // Ensure build directory exists
      await this.ensureBuildDir();

      // Compile TypeScript to JavaScript
      await this.compileTypeScript();

      // Bundle JavaScript to WebAssembly
      const bundleStartTime = Date.now();
      await this.bundleToWasm();
      optimizationTime = Date.now() - bundleStartTime;

      return this.createBuildResult(true, {
        buildTime: Date.now() - startTime,
        optimizationTime
      });
    } catch (error) {
      return this.createBuildResult(false, {
        error: error instanceof Error ? error.message : 'Unknown error',
        buildTime: Date.now() - startTime
      });
    }
  }

  /**
   * Clean build artifacts
   */
  async clean(): Promise<void> {
    try {
      await fs.rm(this.getBuildDir(), { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean build directory:', error);
    }
  }

  /**
   * Compile TypeScript to JavaScript
   */
  private async compileTypeScript(): Promise<void> {
    const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
    
    // Check if tsconfig.json exists
    try {
      await fs.access(tsconfigPath);
    } catch {
      // Create default tsconfig.json if it doesn't exist
      await this.createDefaultTsConfig();
    }

    // Run TypeScript compiler
    const { stdout, stderr } = await execAsync('tsc --project ' + tsconfigPath);
    
    if (stderr) {
      throw new Error(`TypeScript compilation failed: ${stderr}`);
    }
  }

  /**
   * Bundle JavaScript to WebAssembly
   */
  private async bundleToWasm(): Promise<void> {
    // In a real implementation, this would use a tool like AssemblyScript
    // or a custom bundler to convert JavaScript to WebAssembly
    throw new Error('WebAssembly bundling not implemented');
  }

  /**
   * Create default TypeScript configuration
   */
  private async createDefaultTsConfig(): Promise<void> {
    const config = {
      compilerOptions: {
        target: "es2020",
        module: "commonjs",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: "./build",
        rootDir: "./src"
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "**/*.test.ts"]
    };

    await fs.writeFile(
      path.join(this.projectPath, 'tsconfig.json'),
      JSON.stringify(config, null, 2)
    );
  }
} 