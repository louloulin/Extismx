/**
 * Go plugin publisher implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { PluginPublisher } from '../common/publisher';
import { PDKError, PDKErrorCode } from '../../errors/pdk';
import { PluginManifest, PublishOptions, PublishResult } from '../common/types';

const execAsync = promisify(exec);

/**
 * Options specific to Go plugin publishing
 */
export interface GoPublishOptions extends PublishOptions {
  /**
   * Whether to use TinyGo for building
   */
  useTinyGo?: boolean;
  
  /**
   * Whether to use GitHub release
   */
  useGitHubRelease?: boolean;
  
  /**
   * GitHub repository URL if using GitHub release
   */
  githubRepo?: string;
  
  /**
   * GitHub token if using GitHub release
   */
  githubToken?: string;
  
  /**
   * Whether to create a Git tag
   */
  createGitTag?: boolean;
  
  /**
   * Whether to compress the WebAssembly binary
   */
  compressWasm?: boolean;
}

/**
 * Go plugin publisher implementation
 */
export class GoPublisher extends PluginPublisher {
  /**
   * Default Go publish options
   */
  private defaultGoOptions: GoPublishOptions = {
    useTinyGo: true,
    useGitHubRelease: false,
    createGitTag: true,
    compressWasm: true
  };

  /**
   * Go publish options
   */
  private goOptions: GoPublishOptions;

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
    options?: GoPublishOptions
  ) {
    super(projectPath, manifest, options);
    this.goOptions = { ...this.defaultGoOptions, ...options };
  }

  /**
   * Build the plugin
   */
  private async buildPlugin(): Promise<{ success: boolean; output: string; wasmPath?: string }> {
    try {
      const wasmPath = path.join(this.projectPath, 'plugin.wasm');
      let buildCommand: string;
      
      if (this.goOptions.useTinyGo) {
        buildCommand = 'tinygo build -o plugin.wasm -target=wasm .';
      } else {
        buildCommand = 'GOOS=js GOARCH=wasm go build -o plugin.wasm .';
      }
      
      // Run the build command
      const { stdout, stderr } = await execAsync(buildCommand, {
        cwd: this.projectPath
      });
      
      // Check if the build was successful
      if (!fs.existsSync(wasmPath)) {
        return {
          success: false,
          output: `Build completed but no wasm file was generated: ${stdout}\n${stderr}`
        };
      }
      
      return {
        success: true,
        output: stdout + stderr,
        wasmPath
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Compress the WebAssembly binary
   */
  private async compressWasm(wasmPath: string): Promise<{ success: boolean; output: string; compressedPath?: string }> {
    try {
      // Check if brotli is available
      try {
        await execAsync('which brotli');
      } catch {
        return {
          success: false,
          output: 'Brotli compression tool not found. Please install it to enable compression.'
        };
      }
      
      const compressedPath = `${wasmPath}.br`;
      
      // Compress the file
      const { stdout, stderr } = await execAsync(`brotli -c ${wasmPath} > ${compressedPath}`, {
        cwd: this.projectPath
      });
      
      // Check if compression was successful
      if (!fs.existsSync(compressedPath)) {
        return {
          success: false,
          output: `Compression completed but no output file was generated: ${stdout}\n${stderr}`
        };
      }
      
      return {
        success: true,
        output: stdout + stderr,
        compressedPath
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Create Git tag
   */
  private async createGitTag(): Promise<{ success: boolean; output: string }> {
    try {
      // Check if the directory is a git repository
      try {
        await execAsync('git rev-parse --is-inside-work-tree', {
          cwd: this.projectPath
        });
      } catch {
        return {
          success: false,
          output: 'Not a git repository'
        };
      }
      
      const tagName = `v${this.manifest.version}`;
      
      // Check if tag already exists
      try {
        const { stdout } = await execAsync(`git tag -l "${tagName}"`, {
          cwd: this.projectPath
        });
        
        if (stdout.trim() === tagName) {
          return {
            success: false,
            output: `Tag ${tagName} already exists`
          };
        }
      } catch {
        // Ignore errors when checking for tags
      }
      
      // Create tag
      const { stdout, stderr } = await execAsync(`git tag -a "${tagName}" -m "Release ${tagName}"`, {
        cwd: this.projectPath
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
   * Create GitHub release
   */
  private async createGitHubRelease(wasmPath: string): Promise<{ success: boolean; output: string; url?: string }> {
    try {
      if (!this.goOptions.githubRepo) {
        return {
          success: false,
          output: 'GitHub repository URL not provided'
        };
      }
      
      if (!this.goOptions.githubToken) {
        return {
          success: false,
          output: 'GitHub token not provided'
        };
      }
      
      // Check if gh CLI is available
      try {
        await execAsync('which gh');
      } catch {
        return {
          success: false,
          output: 'GitHub CLI (gh) not found. Please install it to enable GitHub releases.'
        };
      }
      
      const tagName = `v${this.manifest.version}`;
      const releaseName = `${this.manifest.name} ${tagName}`;
      const notes = this.manifest.description || `Release ${tagName}`;
      
      // Create release using gh CLI
      const { stdout, stderr } = await execAsync(
        `gh release create "${tagName}" "${wasmPath}" --repo "${this.goOptions.githubRepo}" --title "${releaseName}" --notes "${notes}"`,
        {
          cwd: this.projectPath,
          env: {
            ...process.env,
            GITHUB_TOKEN: this.goOptions.githubToken
          }
        }
      );
      
      // Extract release URL from output
      const urlMatch = stdout.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/releases\/tag\/[^\/\s]+/);
      const releaseUrl = urlMatch ? urlMatch[0] : undefined;
      
      return {
        success: true,
        output: stdout + stderr,
        url: releaseUrl
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Publish the Go plugin
   * 
   * @returns A promise that resolves to the publish result
   */
  async publish(): Promise<PublishResult> {
    try {
      // Build the plugin
      const buildResult = await this.buildPlugin();
      if (!buildResult.success || !buildResult.wasmPath) {
        throw new PDKError(
          `Failed to build plugin: ${buildResult.output}`,
          PDKErrorCode.BUILD_FAILED
        );
      }
      
      // Ensure distribution directory exists
      await this.ensureDistDir();
      
      // Copy the WebAssembly file to the distribution directory
      const distWasmPath = path.join(this.getDistDir(), 'plugin.wasm');
      fs.copyFileSync(buildResult.wasmPath, distWasmPath);
      
      let compressedSize: number | undefined;
      let compressedPath: string | undefined;
      
      // Compress the WebAssembly binary if configured
      if (this.goOptions.compressWasm) {
        const compressionResult = await this.compressWasm(distWasmPath);
        if (compressionResult.success && compressionResult.compressedPath) {
          compressedPath = compressionResult.compressedPath;
          compressedSize = fs.statSync(compressedPath).size;
        }
      }
      
      // Create git tag if configured
      let tagResult = { success: true, output: 'Skipped git tag creation' };
      if (this.goOptions.createGitTag) {
        tagResult = await this.createGitTag();
      }
      
      // Create GitHub release if configured
      const releaseResult: { success: boolean; output: string; url?: string } = { 
        success: true, 
        output: 'Skipped GitHub release'
      };
      
      if (this.goOptions.useGitHubRelease) {
        const githubResult = await this.createGitHubRelease(distWasmPath);
        releaseResult.success = githubResult.success;
        releaseResult.output = githubResult.output;
        releaseResult.url = githubResult.url;
      }
      
      // Build the result details
      const details: any = {
        wasmPath: distWasmPath,
        size: fs.statSync(distWasmPath).size
      };
      
      if (compressedPath && compressedSize) {
        details.compressedPath = compressedPath;
        details.compressedSize = compressedSize;
      }
      
      if (tagResult.success) {
        details.tagCreated = this.goOptions.createGitTag;
      } else {
        details.tagError = tagResult.output;
      }
      
      if (releaseResult.success && releaseResult.url) {
        details.releaseUrl = releaseResult.url;
      } else if (this.goOptions.useGitHubRelease) {
        details.releaseError = releaseResult.output;
      }
      
      return this.createSuccessResult(
        'Plugin published successfully',
        details
      );
    } catch (error) {
      if (error instanceof PDKError) {
        return this.createErrorResult(error.message, {
          errorCode: error.code,
          errorDetails: error.details
        });
      }
      
      return this.createErrorResult(
        `Failed to publish Go plugin: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
} 