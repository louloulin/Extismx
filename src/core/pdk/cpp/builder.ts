/**
 * C++ plugin builder implementation
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
 * Options specific to C++ plugin building
 */
export interface CppBuildOptions {
  /**
   * Emscripten compiler path (emcc)
   */
  emccPath?: string;
  
  /**
   * CMake path
   */
  cmakePath?: string;
  
  /**
   * Make path
   */
  makePath?: string;
  
  /**
   * Whether to use CMake for building
   */
  useCMake?: boolean;
  
  /**
   * Whether to use Make for building
   */
  useMake?: boolean;
  
  /**
   * Additional compiler flags
   */
  cxxFlags?: string[];
  
  /**
   * Optimization level (0-3)
   */
  optimizationLevel?: 0 | 1 | 2 | 3;
  
  /**
   * Whether to enable debug symbols
   */
  debug?: boolean;
  
  /**
   * Additional linker flags
   */
  ldFlags?: string[];
  
  /**
   * Additional include directories
   */
  includeDirs?: string[];
  
  /**
   * Additional library directories
   */
  libDirs?: string[];
  
  /**
   * Libraries to link against
   */
  libs?: string[];
}

/**
 * C++ plugin builder implementation
 */
export class CppBuilder extends PluginBuilder {
  /**
   * Default C++ build options
   */
  private defaultCppOptions: CppBuildOptions = {
    emccPath: 'emcc',
    cmakePath: 'cmake',
    makePath: 'make',
    useCMake: true,
    useMake: false,
    optimizationLevel: 2,
    debug: false,
    cxxFlags: ['-std=c++17'],
    includeDirs: ['include']
  };

  /**
   * C++ build options
   */
  private cppOptions: CppBuildOptions;

  /**
   * Constructor
   * 
   * @param projectPath - Path to the plugin project
   * @param manifest - Plugin manifest
   * @param config - Build configuration
   * @param cppOptions - C++-specific build options
   */
  constructor(
    projectPath: string,
    manifest: PluginManifest,
    config: BuildConfig,
    cppOptions?: CppBuildOptions
  ) {
    super(projectPath, manifest, config);
    this.cppOptions = { ...this.defaultCppOptions, ...cppOptions };
  }

  /**
   * Verify the Emscripten environment
   * 
   * @returns Result of environment verification
   */
  private async verifyEnvironment(): Promise<{ valid: boolean; error?: string }> {
    try {
      const { stdout } = await execAsync(`${this.cppOptions.emccPath} --version`, { 
        env: { ...process.env }
      });
      
      const isValid = stdout.toLowerCase().includes('emscripten');
      
      if (!isValid) {
        return { 
          valid: false, 
          error: `Invalid Emscripten output: ${stdout}` 
        };
      }
      
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: `Emscripten compiler not found or not working correctly: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
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
   * Get source files in the project
   */
  private getSourceFiles(): string[] {
    const sourceExtensions = ['.cpp', '.cc', '.cxx', '.c'];
    let sourceFiles: string[] = [];
    
    const walkSync = (dir: string) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && file !== 'build' && file !== 'dist' && !file.startsWith('.')) {
          walkSync(filePath);
        } else if (stat.isFile() && sourceExtensions.includes(path.extname(file))) {
          sourceFiles.push(filePath);
        }
      }
    };
    
    walkSync(this.projectPath);
    return sourceFiles;
  }

  /**
   * Build using CMake
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
        `${this.cppOptions.cmakePath} -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake ..`,
        { cwd: buildDir, env: { ...process.env } }
      );
      
      // Build with CMake
      const { stdout: buildOutput, stderr: buildError } = await execAsync(
        `${this.cppOptions.cmakePath} --build .`,
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
   * Build using Make
   */
  private async buildWithMake(): Promise<{ success: boolean; output: string; wasmPath?: string }> {
    try {
      // Run make
      const { stdout, stderr } = await execAsync(`${this.cppOptions.makePath}`, {
        cwd: this.projectPath,
        env: { ...process.env }
      });
      
      const output = stdout + stderr;
      
      // Find the generated WebAssembly file
      let wasmFile: string | undefined;
      
      // Common output directories to check
      const dirsToCheck = [
        this.projectPath,
        path.join(this.projectPath, 'build'),
        path.join(this.projectPath, 'dist')
      ];
      
      for (const dir of dirsToCheck) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          
          for (const file of files) {
            if (file.endsWith('.wasm')) {
              wasmFile = path.join(dir, file);
              break;
            }
          }
          
          if (wasmFile) break;
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
   * Build directly with Emscripten
   */
  private async buildWithEmscripten(): Promise<{ success: boolean; output: string; wasmPath?: string }> {
    try {
      // Ensure output directory exists
      await this.ensureBuildDir();
      
      // Get source files
      const sourceFiles = this.getSourceFiles();
      
      if (sourceFiles.length === 0) {
        return {
          success: false,
          output: 'No source files found in the project'
        };
      }
      
      // Build command
      const outputPath = this.getOutputPath();
      const includeArgs = this.cppOptions.includeDirs?.map(dir => `-I${dir}`).join(' ') || '';
      const libArgs = this.cppOptions.libDirs?.map(dir => `-L${dir}`).join(' ') || '';
      const libs = this.cppOptions.libs?.map(lib => `-l${lib}`).join(' ') || '';
      const cxxFlags = this.cppOptions.cxxFlags?.join(' ') || '';
      const ldFlags = this.cppOptions.ldFlags?.join(' ') || '';
      const optimization = `-O${this.cppOptions.optimizationLevel}`;
      const debug = this.cppOptions.debug ? '-g' : '';
      
      // Special flags for Extism WebAssembly modules
      const emscriptenFlags = [
        '-s WASM=1',
        '-s STANDALONE_WASM=1',
        '-s EXPORTED_RUNTIME_METHODS=[]',
        '-s EXPORTED_FUNCTIONS=["_malloc","_free"]',
        '-s ALLOW_MEMORY_GROWTH=1',
        '-s NO_EXIT_RUNTIME=1',
        '-s ERROR_ON_UNDEFINED_SYMBOLS=1'
      ].join(' ');
      
      const buildCommand = [
        this.cppOptions.emccPath,
        sourceFiles.join(' '),
        `-o ${outputPath}`,
        includeArgs,
        libArgs,
        libs,
        cxxFlags,
        ldFlags,
        optimization,
        debug,
        emscriptenFlags
      ].filter(Boolean).join(' ');
      
      // Execute the build command
      const { stdout, stderr } = await execAsync(buildCommand, {
        cwd: this.projectPath,
        env: { ...process.env }
      });
      
      // Check if the build was successful
      if (!fs.existsSync(outputPath)) {
        return {
          success: false,
          output: `Build command completed but no output file was generated: ${stdout}\n${stderr}`
        };
      }
      
      return {
        success: true,
        output: stdout + stderr,
        wasmPath: outputPath
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
      
      if (this.cppOptions.useCMake && this.hasCMakeLists()) {
        // Clean CMake build directory
        const buildDir = path.join(this.projectPath, 'build');
        
        if (fs.existsSync(buildDir)) {
          fs.rmSync(buildDir, { recursive: true, force: true });
        }
      } else if (this.cppOptions.useMake && this.hasMakefile()) {
        // Run make clean
        try {
          await execAsync(`${this.cppOptions.makePath} clean`, {
            cwd: this.projectPath,
            env: { ...process.env }
          });
        } catch (error) {
          // Ignore errors from make clean
        }
      }
      
      // Remove the WebAssembly file if it exists
      const outputPath = this.getOutputPath();
      
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    } catch (error) {
      // Ignore errors in clean
      console.warn(`Warning: Failed to clean build artifacts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Build the C++ plugin
   * 
   * @returns A promise that resolves to the build result
   */
  async build(): Promise<BuildResult> {
    const startTime = Date.now();
    
    try {
      // Verify Emscripten environment
      const envCheck = await this.verifyEnvironment();
      
      if (!envCheck.valid) {
        throw new PDKError(
          envCheck.error || 'Emscripten environment verification failed',
          PDKErrorCode.MISSING_DEPENDENCY
        );
      }
      
      // Determine build method
      let buildResult: { success: boolean; output: string; wasmPath?: string };
      
      if (this.cppOptions.useCMake && this.hasCMakeLists()) {
        buildResult = await this.buildWithCMake();
      } else if (this.cppOptions.useMake && this.hasMakefile()) {
        buildResult = await this.buildWithMake();
      } else {
        buildResult = await this.buildWithEmscripten();
      }
      
      if (!buildResult.success || !buildResult.wasmPath) {
        throw new PDKError(
          `Failed to build plugin: ${buildResult.output}`,
          PDKErrorCode.COMPILATION_ERROR
        );
      }
      
      // Ensure output directory exists
      await this.ensureBuildDir();
      
      // Copy the WebAssembly file to the output directory if it's not already there
      const outputPath = this.getOutputPath();
      
      if (buildResult.wasmPath !== outputPath) {
        fs.copyFileSync(buildResult.wasmPath, outputPath);
      }
      
      // Get file size
      const stats = fs.statSync(outputPath);
      const size = stats.size;
      
      // Parse warnings from output
      const warnings = buildResult.output
        .split('\n')
        .filter(line => line.toLowerCase().includes('warning'))
        .map(line => line.trim());
      
      const buildTime = Date.now() - startTime;
      
      return {
        success: true,
        wasmFile: outputPath,
        size,
        warnings: warnings.length > 0 ? warnings : undefined,
        stats: {
          buildTime,
          originalSize: size,
          optimizedSize: size
        }
      };
    } catch (error) {
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