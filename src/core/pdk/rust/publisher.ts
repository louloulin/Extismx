/**
 * Rust plugin publisher implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { PluginPublisher } from '../common/publisher';
import { PDKError } from '../../errors/pdk';
import { PluginManifest, PublishOptions, PublishResult } from '../common/types';

const execAsync = promisify(exec);

/**
 * Options specific to Rust plugin publishing
 */
export interface RustPublishOptions extends PublishOptions {
  /**
   * Whether to publish to crates.io
   */
  publishToCratesIo?: boolean;
  
  /**
   * Whether to use cargo-wasm-pack for publishing
   */
  useWasmPack?: boolean;
  
  /**
   * Whether to use cargo-publish for publishing
   */
  useCargoPublish?: boolean;
  
  /**
   * Additional cargo publish arguments
   */
  cargoPublishArgs?: string[];
}

/**
 * Rust plugin publisher implementation
 */
export class RustPublisher extends PluginPublisher {
  /**
   * Default Rust publish options
   */
  private defaultRustOptions: RustPublishOptions = {
    publishToCratesIo: false,
    useWasmPack: false,
    useCargoPublish: true
  };

  /**
   * Rust publish options
   */
  private rustOptions: RustPublishOptions;

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
    options?: RustPublishOptions
  ) {
    super(projectPath, manifest, options);
    this.rustOptions = { ...this.defaultRustOptions, ...options };
  }

  /**
   * Publish the Rust plugin
   * 
   * @returns A promise that resolves to the publish result
   */
  async publish(): Promise<PublishResult> {
    try {
      // Build the package
      await execAsync('cargo build --target wasm32-unknown-unknown --release', { 
        cwd: this.projectPath 
      });
      
      // Get package details from Cargo.toml
      const cargoTomlPath = path.join(this.projectPath, 'Cargo.toml');
      const cargoToml = fs.readFileSync(cargoTomlPath, 'utf-8');
      
      const nameMatch = cargoToml.match(/name\s*=\s*"([^"]+)"/);
      const versionMatch = cargoToml.match(/version\s*=\s*"([^"]+)"/);
      
      const packageName = nameMatch ? nameMatch[1] : 'unknown';
      const packageVersion = versionMatch ? versionMatch[1] : 'unknown';
      
      // Determine output path
      const wasmFileName = `${packageName.replace(/-/g, '_')}.wasm`;
      const wasmPath = path.join(
        this.projectPath, 
        'target', 
        'wasm32-unknown-unknown', 
        'release', 
        wasmFileName
      );
      
      // Ensure the distribution directory exists
      await this.ensureDistDir();
      
      // Copy the WebAssembly file to the distribution directory
      const distWasmPath = path.join(this.getDistDir(), 'plugin.wasm');
      fs.copyFileSync(wasmPath, distWasmPath);
      
      return this.createSuccessResult(
        'Package built successfully.',
        {
          wasmPath: distWasmPath,
          size: fs.statSync(distWasmPath).size
        }
      );
    } catch (error) {
      if (error instanceof PDKError) {
        return this.createErrorResult(error.message, {
          errorCode: error.code,
          errorDetails: error.details
        });
      }
      
      return this.createErrorResult(
        `Failed to publish Rust plugin: ${error instanceof Error ? error.message : String(error)}`,
        {
          error: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }
} 