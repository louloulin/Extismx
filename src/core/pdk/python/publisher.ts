/**
 * Python plugin publisher implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { PluginPublisher, PublishOptions, PublishResult } from '../common/publisher';
import { PDKError } from '../../errors/pdk';
import { PluginManifest } from '../common/types';

const execAsync = promisify(exec);

/**
 * Options specific to Python plugin publishing
 */
export interface PythonPublishOptions extends PublishOptions {
  /**
   * Whether to publish to PyPI
   */
  publishToPyPI?: boolean;
  
  /**
   * Whether to use TestPyPI instead of the main PyPI registry
   */
  useTestPyPI?: boolean;
  
  /**
   * Whether to use virtual environment
   */
  useVenv?: boolean;
  
  /**
   * Whether to build a wheel package
   */
  buildWheel?: boolean;
  
  /**
   * Whether to build a source distribution
   */
  buildSdist?: boolean;
  
  /**
   * Additional arguments to pass to twine
   */
  twineArgs?: string[];
}

/**
 * Python plugin publisher implementation
 */
export class PythonPublisher extends PluginPublisher {
  /**
   * Default Python publish options
   */
  private defaultPythonOptions: PythonPublishOptions = {
    publishToPyPI: false,
    useTestPyPI: true,
    useVenv: true,
    buildWheel: true,
    buildSdist: true
  };

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
    options?: PythonPublishOptions
  ) {
    super(projectPath, manifest, options || {});
    this.options = { ...this.defaultPythonOptions, ...options };
  }

  /**
   * Get Python-specific publish options
   */
  get pythonOptions(): PythonPublishOptions {
    return this.options as PythonPublishOptions;
  }

  /**
   * Check Python publish environment
   * 
   * @throws {PDKError} If environment check fails
   */
  private async checkEnvironment(): Promise<string> {
    try {
      // Find Python executable
      let pythonPath = 'python';
      
      // Use venv if enabled
      if (this.pythonOptions.useVenv) {
        const venvPath = path.join(this.projectPath, 'venv');
        
        if (fs.existsSync(venvPath)) {
          pythonPath = process.platform === 'win32'
            ? path.join(venvPath, 'Scripts', 'python.exe')
            : path.join(venvPath, 'bin', 'python');
        } else {
          console.warn('Virtual environment not found. Using system Python instead.');
        }
      }
      
      // Check Python version
      await execAsync(`${pythonPath} --version`);
      
      // Check publishing tools
      const requiredPackages = ['setuptools', 'wheel', 'build', 'twine'];
      
      // Check each package
      for (const pkg of requiredPackages) {
        try {
          await execAsync(`${pythonPath} -c "import ${pkg.replace('-', '_')}"`);
        } catch (err) {
          throw PDKError.missingDependency(pkg, `pip install ${pkg}`);
        }
      }
      
      return pythonPath;
    } catch (err) {
      if (err instanceof PDKError) {
        throw err;
      }
      throw PDKError.buildFailed(`Python environment check failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Build Python package
   * 
   * @param pythonPath - Path to Python executable
   * @returns Path to the built distribution files
   */
  private async buildPackage(pythonPath: string): Promise<string[]> {
    const distDir = path.join(this.projectPath, 'dist');
    
    // Clean dist directory if it exists
    if (fs.existsSync(distDir)) {
      fs.rmdirSync(distDir, { recursive: true });
    }
    
    try {
      // Build command
      let buildCommand = `${pythonPath} -m build`;
      
      // Build specific formats
      if (!this.pythonOptions.buildWheel && this.pythonOptions.buildSdist) {
        buildCommand += ' --sdist';
      } else if (this.pythonOptions.buildWheel && !this.pythonOptions.buildSdist) {
        buildCommand += ' --wheel';
      }
      
      // Run build
      await execAsync(buildCommand, { cwd: this.projectPath });
      
      // Get built distribution files
      const distFiles = fs.readdirSync(distDir);
      return distFiles.map(file => path.join(distDir, file));
    } catch (err) {
      throw PDKError.buildFailed(`Failed to build Python package: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Publish to PyPI
   * 
   * @param pythonPath - Path to Python executable
   * @param distFiles - Distribution files to publish
   * @returns Publish result
   */
  private async publishToPyPI(pythonPath: string, distFiles: string[]): Promise<PublishResult> {
    try {
      if (!this.pythonOptions.publishToPyPI) {
        return this.createSuccessResult('PyPI publishing is disabled in options.', {
          files: distFiles,
          publishUrl: null
        });
      }
      
      // Build twine command
      let twineCommand = `${pythonPath} -m twine upload`;
      
      // Use TestPyPI if specified
      if (this.pythonOptions.useTestPyPI) {
        twineCommand += ' --repository testpypi';
      }
      
      // Add distribution files
      twineCommand += ` ${distFiles.join(' ')}`;
      
      // Add additional twine arguments
      if (this.pythonOptions.twineArgs) {
        twineCommand += ` ${this.pythonOptions.twineArgs.join(' ')}`;
      }
      
      // Run twine
      const { stdout, stderr } = await execAsync(twineCommand, { cwd: this.projectPath });
      
      // Get the package name and version
      const setupPyPath = path.join(this.projectPath, 'setup.py');
      const setupPyContent = fs.readFileSync(setupPyPath, 'utf-8');
      
      const nameMatch = setupPyContent.match(/name="([^"]+)"/);
      const versionMatch = setupPyContent.match(/version="([^"]+)"/);
      
      const packageName = nameMatch ? nameMatch[1] : 'unknown';
      const packageVersion = versionMatch ? versionMatch[1] : 'unknown';
      
      // Create publication URL
      const baseUrl = this.pythonOptions.useTestPyPI 
        ? 'https://test.pypi.org/project/' 
        : 'https://pypi.org/project/';
        
      const publishUrl = `${baseUrl}${packageName}/${packageVersion}/`;
      
      return this.createSuccessResult(
        `Package published to ${this.pythonOptions.useTestPyPI ? 'TestPyPI' : 'PyPI'}.`,
        {
          files: distFiles,
          publishUrl,
          output: stdout + (stderr ? `\n${stderr}` : '')
        }
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return this.createErrorResult(
        `Failed to publish to PyPI: ${error.message}`,
        {
          files: distFiles,
          error: error.message,
          stderr: error['stderr'],
          stdout: error['stdout']
        }
      );
    }
  }

  /**
   * Publish the Python plugin
   * 
   * @returns A promise that resolves to the publish result
   */
  async publish(): Promise<PublishResult> {
    try {
      // Check environment
      const pythonPath = await this.checkEnvironment();
      
      // Build the package
      const distFiles = await this.buildPackage(pythonPath);
      
      // Publish to PyPI if enabled
      if (this.pythonOptions.publishToPyPI) {
        return await this.publishToPyPI(pythonPath, distFiles);
      }
      
      // Return local publish result
      return this.createSuccessResult(
        'Package built successfully but not published to PyPI.',
        {
          files: distFiles,
          publishUrl: null
        }
      );
    } catch (err) {
      if (err instanceof PDKError) {
        return this.createErrorResult(err.message, {
          errorCode: err.metadata.code,
          errorDetails: err.details
        });
      }
      
      return this.createErrorResult(
        `Failed to publish Python plugin: ${err instanceof Error ? err.message : String(err)}`,
        {
          error: err instanceof Error ? err.message : String(err)
        }
      );
    }
  }
} 