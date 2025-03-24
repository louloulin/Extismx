/**
 * C++ plugin publisher implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { PluginPublisher } from '../common/publisher';
import { PDKError, PDKErrorCode } from '../../errors/pdk';
import { PluginManifest, PublishResult, PublishOptions } from '../common/types';

const execAsync = promisify(exec);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

/**
 * Options specific to C++ plugin publishing
 */
export interface CppPublishOptions extends PublishOptions {
  /**
   * Whether to use CMake for building
   */
  useCMake?: boolean;
  
  /**
   * Whether to publish to a package registry
   */
  publishToRegistry?: boolean;
  
  /**
   * Package registry to publish to (e.g., GitHub Packages, npm)
   */
  registry?: string;
  
  /**
   * Token for authenticating with the package registry
   */
  registryToken?: string;
  
  /**
   * Additional build args for Emscripten
   */
  emscriptenArgs?: string[];
}

/**
 * C++ plugin publisher implementation
 */
export class CppPublisher extends PluginPublisher {
  /**
   * Default C++ publish options
   */
  private defaultCppOptions: CppPublishOptions = {
    useCMake: true,
    publishToRegistry: false
  };

  /**
   * C++ publish options
   */
  private cppOptions: CppPublishOptions;

  /**
   * Constructor
   * 
   * @param projectPath - Path to the plugin project
   * @param manifest - Plugin manifest
   * @param options - Publish options
   */
  constructor(
    projectPath: string,
    manifest: PluginManifest,
    options?: CppPublishOptions
  ) {
    super(projectPath, manifest, options);
    this.cppOptions = { ...this.defaultCppOptions, ...options };
  }

  /**
   * Check if the project has a CMakeLists.txt file
   */
  private hasCMakeLists(): boolean {
    return fs.existsSync(path.join(this.projectPath, 'CMakeLists.txt'));
  }

  /**
   * Check if the project has a Makefile
   */
  private hasMakefile(): boolean {
    return fs.existsSync(path.join(this.projectPath, 'Makefile'));
  }

  /**
   * Build the plugin with CMake
   */
  private async buildWithCMake(): Promise<{ success: boolean; output: string; wasmPath?: string }> {
    try {
      // Create build directory
      const buildDir = path.join(this.projectPath, 'build');
      
      if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
      }
      
      // Configure with CMake
      const { stdout: configureOutput, stderr: configureError } = await execAsync(
        `emcmake cmake ..`,
        { cwd: buildDir, env: { ...process.env } }
      );
      
      // Build with CMake
      const { stdout: buildOutput, stderr: buildError } = await execAsync(
        `emmake cmake --build .`,
        { cwd: buildDir, env: { ...process.env } }
      );
      
      const output = configureOutput + configureError + buildOutput + buildError;
      
      // Find the generated WebAssembly file
      let wasmFile: string | undefined;
      const files = fs.readdirSync(buildDir);
      
      for (const file of files) {
        if (file.endsWith('.wasm')) {
          wasmFile = path.join(buildDir, file);
          break;
        }
      }
      
      if (!wasmFile) {
        // Check if it might be in a subdirectory
        const findWasmFiles = (dir: string): string[] => {
          const results: string[] = [];
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            const entryPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
              results.push(...findWasmFiles(entryPath));
            } else if (entry.name.endsWith('.wasm')) {
              results.push(entryPath);
            }
          }
          
          return results;
        };
        
        const wasmFiles = findWasmFiles(buildDir);
        
        if (wasmFiles.length > 0) {
          wasmFile = wasmFiles[0];
        } else {
          return {
            success: false,
            output: `Build completed but no wasm file was generated: ${output}`
          };
        }
      }
      
      return {
        success: true,
        output,
        wasmPath: wasmFile
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Build the plugin with Make
   */
  private async buildWithMake(): Promise<{ success: boolean; output: string; wasmPath?: string }> {
    try {
      // Run make
      const { stdout, stderr } = await execAsync(`make`, {
        cwd: this.projectPath,
        env: { ...process.env }
      });
      
      const output = stdout + stderr;
      
      // Find the generated WebAssembly file in the dist directory
      const distDir = path.join(this.projectPath, 'dist');
      
      if (!fs.existsSync(distDir)) {
        return {
          success: false,
          output: `Build completed but dist directory was not created: ${output}`
        };
      }
      
      const files = fs.readdirSync(distDir);
      let wasmFile: string | undefined;
      
      for (const file of files) {
        if (file.endsWith('.wasm')) {
          wasmFile = path.join(distDir, file);
          break;
        }
      }
      
      if (!wasmFile) {
        return {
          success: false,
          output: `Build completed but no wasm file was generated: ${output}`
        };
      }
      
      return {
        success: true,
        output,
        wasmPath: wasmFile
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Publish the C++ plugin
   * 
   * @returns A promise that resolves to the publish result
   */
  async publish(): Promise<PublishResult> {
    try {
      // Check if Emscripten is installed
      try {
        await execAsync('emcc --version');
      } catch (error) {
        throw new PDKError(
          'Emscripten is not installed or not in PATH',
          PDKErrorCode.MISSING_DEPENDENCY
        );
      }
      
      // Build the plugin
      let buildResult: { success: boolean; output: string; wasmPath?: string };
      
      if (this.cppOptions.useCMake && this.hasCMakeLists()) {
        buildResult = await this.buildWithCMake();
      } else if (this.hasMakefile()) {
        buildResult = await this.buildWithMake();
      } else {
        throw new PDKError(
          'No CMakeLists.txt or Makefile found in the project',
          PDKErrorCode.MISSING_CONFIG
        );
      }
      
      if (!buildResult.success || !buildResult.wasmPath) {
        throw new PDKError(
          `Failed to build plugin: ${buildResult.output}`,
          PDKErrorCode.BUILD_ERROR
        );
      }
      
      // Ensure distribution directory exists
      const distDir = path.join(this.projectPath, 'dist');
      
      if (!fs.existsSync(distDir)) {
        await mkdir(distDir, { recursive: true });
      }
      
      // Copy the WebAssembly file to the dist directory if it's not already there
      const wasmFileName = path.basename(buildResult.wasmPath);
      const distWasmPath = path.join(distDir, wasmFileName);
      
      if (buildResult.wasmPath !== distWasmPath) {
        await copyFile(buildResult.wasmPath, distWasmPath);
      }
      
      // Get file size
      const stats = fs.statSync(distWasmPath);
      const size = stats.size;
      
      // Check for optimizations
      let optimizations: string[] = [];
      
      if (this.cppOptions.optimize) {
        optimizations.push('Used optimization level from configuration');
      }
      
      if (buildResult.output.includes('-O3')) {
        optimizations.push('Used level 3 optimization');
      } else if (buildResult.output.includes('-O2')) {
        optimizations.push('Used level 2 optimization');
      } else if (buildResult.output.includes('-O1')) {
        optimizations.push('Used level 1 optimization');
      }
      
      // Publish to registry if requested
      if (this.cppOptions.publishToRegistry && this.cppOptions.registry) {
        try {
          // Implementation would vary based on registry type
          // This is a placeholder
          console.log(`Publishing to registry: ${this.cppOptions.registry}`);
          // In a real implementation, this would publish to the specified registry
        } catch (error) {
          return {
            success: true,
            artifacts: [distWasmPath],
            size,
            optimizations: optimizations.length > 0 ? optimizations : undefined,
            warning: `Plugin built successfully but failed to publish to registry: ${
              error instanceof Error ? error.message : String(error)
            }`
          };
        }
      }
      
      return {
        success: true,
        artifacts: [distWasmPath],
        size,
        optimizations: optimizations.length > 0 ? optimizations : undefined
      };
    } catch (error) {
      if (error instanceof PDKError) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : `Unknown error: ${String(error)}`
      };
    }
  }
} 