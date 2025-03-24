/**
 * Rust plugin builder implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { PluginBuilder } from '../common/builder';
import { PDKError } from '../../errors/pdk';
import { PluginManifest, BuildConfig, BuildResult } from '../common/types';

const execAsync = promisify(exec);

/**
 * Options specific to Rust plugin building
 */
export interface RustBuildOptions {
  /**
   * Rust toolchain to use (e.g. "stable", "nightly")
   */
  rustToolchain?: string;
  
  /**
   * Whether to use optimized release build
   */
  release?: boolean;
  
  /**
   * Additional cargo features to enable
   */
  features?: string[];
  
  /**
   * Additional cargo flags
   */
  cargoFlags?: string[];
  
  /**
   * Whether to use wasm-opt for optimization
   */
  useWasmOpt?: boolean;
  
  /**
   * Optimization level for wasm-opt (0-4)
   */
  wasmOptLevel?: 0 | 1 | 2 | 3 | 4;
  
  /**
   * Whether to generate TypeScript bindings
   */
  generateBindings?: boolean;
}

/**
 * Rust plugin builder implementation
 */
export class RustBuilder extends PluginBuilder {
  /**
   * Default Rust build options
   */
  private defaultRustOptions: RustBuildOptions = {
    rustToolchain: 'stable',
    release: true,
    features: [],
    useWasmOpt: true,
    wasmOptLevel: 3,
    generateBindings: false
  };

  /**
   * Rust build options
   */
  private rustOptions: RustBuildOptions;

  /**
   * Constructor
   * 
   * @param projectPath - Path to the plugin project
   * @param manifest - Plugin manifest
   * @param config - Build configuration
   */
  constructor(
    projectPath: string,
    manifest: PluginManifest,
    config: BuildConfig,
    options?: RustBuildOptions
  ) {
    super(projectPath, manifest, config);
    this.rustOptions = { ...this.defaultRustOptions, ...options };
  }

  /**
   * Check if Rust toolchain and dependencies are installed
   * 
   * @throws {PDKError} If Rust is not installed or required dependencies are missing
   */
  private async checkRustEnvironment(): Promise<void> {
    try {
      // Check Rust version
      const { stdout } = await execAsync('rustc --version');
      if (!stdout.includes('rustc')) {
        throw new Error('Rust compiler not found');
      }
      
      // Check cargo
      await execAsync('cargo --version');
      
      // Check wasm-pack
      try {
        await execAsync('wasm-pack --version');
      } catch (error) {
        throw PDKError.missingDependency(
          'wasm-pack',
          'cargo install wasm-pack'
        );
      }
      
      // Check wasm-opt if enabled
      if (this.rustOptions.useWasmOpt) {
        try {
          await execAsync('wasm-opt --version');
        } catch (error) {
          throw PDKError.missingDependency(
            'wasm-opt',
            'npm install -g binaryen'
          );
        }
      }
      
      // Check wasm target
      try {
        const { stdout: targets } = await execAsync('rustup target list --installed');
        const wasmTarget = this.config.target === 'wasm32-wasi' ? 'wasm32-wasi' : 'wasm32-unknown-unknown';
        
        if (!targets.includes(wasmTarget)) {
          throw PDKError.missingDependency(
            `Rust target ${wasmTarget}`,
            `rustup target add ${wasmTarget}`
          );
        }
      } catch (error) {
        if (error instanceof PDKError) {
          throw error;
        }
        throw PDKError.buildFailed(`Failed to check Rust targets: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof PDKError) {
        throw error;
      }
      throw PDKError.buildFailed(`Rust environment check failed: ${error.message}`);
    }
  }

  /**
   * Build Rust project
   * 
   * @returns Path to the built wasm file
   */
  private async buildRustProject(): Promise<string> {
    const startTime = Date.now();
    
    try {
      // Prepare build command
      const wasmTarget = this.config.target === 'wasm32-wasi' ? 'wasm32-wasi' : 'wasm32-unknown-unknown';
      const releaseFlag = this.rustOptions.release ? '--release' : '';
      const featuresFlag = this.rustOptions.features?.length
        ? `--features "${this.rustOptions.features.join(' ')}"`
        : '';
        
      const cargoFlags = this.rustOptions.cargoFlags?.length
        ? this.rustOptions.cargoFlags.join(' ')
        : '';
      
      // Run cargo build
      const buildCommand = `cargo build ${releaseFlag} --target ${wasmTarget} ${featuresFlag} ${cargoFlags}`;
      
      console.log(`Building Rust project with command: ${buildCommand}`);
      
      await execAsync(buildCommand, { cwd: this.projectPath });
      
      // Get output path
      const targetDir = path.join(this.projectPath, 'target');
      const buildType = this.rustOptions.release ? 'release' : 'debug';
      const wasmFile = path.join(targetDir, wasmTarget, buildType, `${this.manifest.name.replace(/-/g, '_')}.wasm`);
      
      // Check if wasm file exists
      if (!fs.existsSync(wasmFile)) {
        throw new Error(`WebAssembly file not found at ${wasmFile}`);
      }
      
      return wasmFile;
    } catch (error) {
      throw PDKError.buildFailed(`Rust build failed: ${error.message}`);
    }
  }

  /**
   * Optimize WebAssembly using wasm-opt
   * 
   * @param wasmFile - Path to the WebAssembly file
   * @returns Path to the optimized WebAssembly file
   */
  private async optimizeWasm(wasmFile: string): Promise<string> {
    if (!this.rustOptions.useWasmOpt) {
      return wasmFile;
    }
    
    try {
      const optimizedFile = path.join(path.dirname(wasmFile), `${path.basename(wasmFile, '.wasm')}.opt.wasm`);
      
      const optLevel = this.rustOptions.wasmOptLevel;
      await execAsync(`wasm-opt -O${optLevel} ${wasmFile} -o ${optimizedFile}`);
      
      return optimizedFile;
    } catch (error) {
      console.warn(`WebAssembly optimization failed: ${error.message}`);
      return wasmFile;
    }
  }

  /**
   * Generate TypeScript bindings
   * 
   * @param wasmFile - Path to the WebAssembly file
   */
  private async generateBindings(wasmFile: string): Promise<void> {
    if (!this.rustOptions.generateBindings) {
      return;
    }
    
    try {
      const bindingsDir = path.join(this.getBuildDir(), 'bindings');
      
      if (!fs.existsSync(bindingsDir)) {
        fs.mkdirSync(bindingsDir, { recursive: true });
      }
      
      await execAsync(`wasm-bindgen ${wasmFile} --out-dir ${bindingsDir} --typescript`);
      
      console.log(`TypeScript bindings generated in ${bindingsDir}`);
    } catch (error) {
      console.warn(`Failed to generate TypeScript bindings: ${error.message}`);
    }
  }

  /**
   * Copy WebAssembly to build directory
   * 
   * @param wasmFile - Path to the WebAssembly file
   * @returns Path to the copied WebAssembly file
   */
  private async copyToOutput(wasmFile: string): Promise<string> {
    const outputFile = path.join(this.getBuildDir(), 'plugin.wasm');
    
    fs.copyFileSync(wasmFile, outputFile);
    
    return outputFile;
  }

  /**
   * Build the Rust plugin
   * 
   * @returns A promise that resolves to the build result
   */
  async build(): Promise<BuildResult> {
    const startTime = Date.now();
    
    try {
      // Ensure build directory exists
      await this.ensureBuildDir();
      
      // Check Rust environment
      await this.checkRustEnvironment();
      
      // Build the Rust project
      const wasmFile = await this.buildRustProject();
      
      // Get original file size
      const originalSize = await this.getFileSize(wasmFile);
      
      // Optimize WebAssembly if enabled
      const optimizationStartTime = Date.now();
      const optimizedFile = await this.optimizeWasm(wasmFile);
      const optimizationTime = Date.now() - optimizationStartTime;
      
      // Generate TypeScript bindings if enabled
      await this.generateBindings(optimizedFile);
      
      // Copy to output directory
      const outputFile = await this.copyToOutput(optimizedFile);
      
      // Get optimized file size
      const optimizedSize = await this.getFileSize(outputFile);
      
      // Calculate build time
      const buildTime = Date.now() - startTime;
      
      return this.createBuildResult(true, {
        buildTime,
        optimizationTime: this.rustOptions.useWasmOpt ? optimizationTime : undefined,
        warnings: []
      });
    } catch (error) {
      if (error instanceof PDKError) {
        throw error;
      }
      
      throw PDKError.buildFailed(`Rust plugin build failed: ${error.message}`);
    }
  }

  /**
   * Clean build artifacts
   */
  async clean(): Promise<void> {
    try {
      // Clean build directory
      await super.clean();
      
      // Run cargo clean
      await execAsync('cargo clean', { cwd: this.projectPath });
    } catch (error) {
      throw PDKError.buildFailed(`Failed to clean Rust build artifacts: ${error.message}`);
    }
  }
} 