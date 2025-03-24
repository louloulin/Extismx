/**
 * Python plugin builder implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

import { PluginBuilder, BuildOptions, BuildResult } from '../common/builder';
import { PDKError } from '../../errors';

const execAsync = promisify(exec);

/**
 * Options specific to Python plugin building
 */
export interface PythonBuildOptions extends BuildOptions {
  /**
   * Python version to target (e.g., "3.9", "3.10", "3.11")
   */
  pythonVersion?: string;
  
  /**
   * Whether to use virtual environments
   */
  useVenv?: boolean;
  
  /**
   * Additional packages to install for the build
   */
  additionalPackages?: string[];
  
  /**
   * Whether to run type checking with mypy
   */
  typeCheck?: boolean;
  
  /**
   * Whether to bundle dependencies inline (using tools like PyInstaller)
   */
  bundleDependencies?: boolean;
  
  /**
   * Extra arguments to pass to the Python compiler
   */
  extraPythonArgs?: string[];
  
  /**
   * Whether to create a wheel package
   */
  createWheel?: boolean;
}

/**
 * Python plugin builder implementation
 */
export class PythonBuilder extends PluginBuilder {
  /**
   * Default build options specific to Python
   */
  private defaultPythonOptions: PythonBuildOptions = {
    pythonVersion: "3.10",
    useVenv: true,
    typeCheck: false,
    bundleDependencies: true,
    createWheel: true
  };

  /**
   * Constructor
   * 
   * @param projectPath - Path to the plugin project
   * @param options - Build options
   */
  constructor(projectPath: string, options?: PythonBuildOptions) {
    super(projectPath, options);
    this.options = { ...this.defaultPythonOptions, ...options };
  }

  /**
   * Get Python-specific build options
   */
  get pythonOptions(): PythonBuildOptions {
    return this.options as PythonBuildOptions;
  }

  /**
   * Check if Python and required dependencies are installed
   * 
   * @throws {PDKError} If Python is not installed or required dependencies are missing
   */
  private async checkPythonEnvironment(): Promise<void> {
    try {
      // Check Python version
      const { stdout } = await execAsync('python --version');
      const versionMatch = stdout.match(/Python (\d+\.\d+\.\d+)/);
      
      if (!versionMatch) {
        throw new Error('Could not determine Python version');
      }
      
      const version = versionMatch[1];
      const majorMinor = version.split('.').slice(0, 2).join('.');
      
      if (this.pythonOptions.pythonVersion && majorMinor !== this.pythonOptions.pythonVersion) {
        throw new Error(`Python version mismatch: found ${majorMinor}, required ${this.pythonOptions.pythonVersion}`);
      }
      
      // Check required packages
      const requiredPackages = ['pywasm3', 'setuptools', 'wheel'];
      
      if (this.pythonOptions.typeCheck) {
        requiredPackages.push('mypy');
      }
      
      if (this.pythonOptions.additionalPackages) {
        requiredPackages.push(...this.pythonOptions.additionalPackages);
      }
      
      // Check each package
      for (const pkg of requiredPackages) {
        try {
          await execAsync(`python -c "import ${pkg.replace('-', '_')}"`);
        } catch (e) {
          throw new PDKError.missingDependency(pkg, `pip install ${pkg}`);
        }
      }
    } catch (error) {
      if (error instanceof PDKError) {
        throw error;
      }
      throw PDKError.buildFailed(`Python environment check failed: ${error.message}`);
    }
  }

  /**
   * Create virtual environment if enabled
   * 
   * @param buildDir - The build directory
   */
  private async createVirtualEnv(buildDir: string): Promise<string> {
    if (!this.pythonOptions.useVenv) {
      return 'python';
    }
    
    const venvPath = path.join(buildDir, 'venv');
    try {
      await execAsync(`python -m venv ${venvPath}`);
      
      // Determine the Python executable path in the virtual environment
      const pythonPath = process.platform === 'win32'
        ? path.join(venvPath, 'Scripts', 'python.exe')
        : path.join(venvPath, 'bin', 'python');
      
      // Install required packages in the virtual environment
      await execAsync(`${pythonPath} -m pip install --upgrade pip`);
      
      const requiredPackages = ['pywasm3', 'setuptools', 'wheel'];
      
      if (this.pythonOptions.typeCheck) {
        requiredPackages.push('mypy');
      }
      
      if (this.pythonOptions.additionalPackages) {
        requiredPackages.push(...this.pythonOptions.additionalPackages);
      }
      
      // Install dependencies from requirements.txt if it exists
      const requirementsPath = path.join(this.projectPath, 'requirements.txt');
      if (fs.existsSync(requirementsPath)) {
        await execAsync(`${pythonPath} -m pip install -r ${requirementsPath}`);
      }
      
      // Install the remaining required packages
      await execAsync(`${pythonPath} -m pip install ${requiredPackages.join(' ')}`);
      
      return pythonPath;
    } catch (error) {
      throw PDKError.buildFailed(`Failed to create virtual environment: ${error.message}`);
    }
  }

  /**
   * Compile Python code to WebAssembly
   * 
   * @throws {PDKError} If compilation fails
   */
  private async compilePythonToWasm(pythonPath: string, buildDir: string): Promise<string> {
    try {
      const mainPyPath = path.join(this.projectPath, 'main.py');
      const packageSetupPath = path.join(this.projectPath, 'setup.py');
      const wasmOutputPath = path.join(buildDir, 'plugin.wasm');
      
      // Check if the main Python file exists
      if (!fs.existsSync(mainPyPath)) {
        throw new Error(`Main Python file not found: ${mainPyPath}`);
      }
      
      // Run type checking if enabled
      if (this.pythonOptions.typeCheck) {
        const { stdout, stderr } = await execAsync(`${pythonPath} -m mypy ${mainPyPath}`);
        
        if (stderr && stderr.trim().length > 0) {
          const errors = stderr.split('\n').filter(line => line.trim().length > 0);
          throw PDKError.typeCheckFailed(errors);
        }
      }
      
      // Compile Python to WebAssembly using pywasm3
      // This is a simplified example - in a real implementation,
      // you would use a proper Python-to-WebAssembly compiler like Pyodide or similar
      await execAsync(`${pythonPath} -m pywasm3 compile ${mainPyPath} -o ${wasmOutputPath} ${
        this.pythonOptions.extraPythonArgs ? this.pythonOptions.extraPythonArgs.join(' ') : ''
      }`);
      
      // Create wheel package if enabled
      if (this.pythonOptions.createWheel && fs.existsSync(packageSetupPath)) {
        const distDir = path.join(buildDir, 'dist');
        fs.mkdirSync(distDir, { recursive: true });
        
        await execAsync(`${pythonPath} ${packageSetupPath} bdist_wheel -d ${distDir}`, {
          cwd: this.projectPath
        });
      }
      
      return wasmOutputPath;
    } catch (error) {
      if (error instanceof PDKError) {
        throw error;
      }
      throw PDKError.buildFailed(`Python compilation failed: ${error.message}`);
    }
  }

  /**
   * Build the Python plugin
   * 
   * @returns A promise that resolves to the build result
   * @throws {PDKError} If the build fails
   */
  async build(): Promise<BuildResult> {
    try {
      // Create build directory
      const buildDir = this.ensureBuildDirectoryExists();
      
      // Check Python environment
      await this.checkPythonEnvironment();
      
      // Create virtual environment if enabled
      const pythonPath = await this.createVirtualEnv(buildDir);
      
      // Compile Python to WebAssembly
      const wasmOutputPath = await this.compilePythonToWasm(pythonPath, buildDir);
      
      // Get the output size
      const size = this.getFileSize(wasmOutputPath);
      
      // Collect build artifacts
      const artifacts = [wasmOutputPath];
      
      // Check for wheel package
      const distDir = path.join(buildDir, 'dist');
      if (fs.existsSync(distDir)) {
        const wheelFiles = fs.readdirSync(distDir)
          .filter(file => file.endsWith('.whl'))
          .map(file => path.join(distDir, file));
        
        artifacts.push(...wheelFiles);
      }
      
      return this.createBuildResult(artifacts, size, {
        pythonVersion: this.pythonOptions.pythonVersion,
        wasTypechecked: this.pythonOptions.typeCheck
      });
    } catch (error) {
      if (error instanceof PDKError) {
        throw error;
      }
      throw PDKError.buildFailed(`Python plugin build failed: ${error.message}`);
    }
  }

  /**
   * Clean build artifacts
   */
  async clean(): Promise<void> {
    try {
      const buildDir = this.getBuildDirectory();
      
      // Clean common build directory
      await super.clean();
      
      // Additionally clean Python-specific build artifacts
      const pythonBuildArtifacts = [
        path.join(this.projectPath, 'build'),
        path.join(this.projectPath, 'dist'),
        path.join(this.projectPath, '*.egg-info')
      ];
      
      for (const artifact of pythonBuildArtifacts) {
        try {
          // Using rm -rf through exec for directories with pattern matching
          await execAsync(`rm -rf ${artifact}`);
        } catch (err) {
          // Ignore errors from pattern matching
        }
      }
      
      // Clean __pycache__ directories
      try {
        await execAsync(`find ${this.projectPath} -name "__pycache__" -type d -exec rm -rf {} +`);
      } catch (err) {
        // Ignore errors from pattern matching
      }
    } catch (error) {
      throw PDKError.buildFailed(`Failed to clean Python build artifacts: ${error.message}`);
    }
  }
} 