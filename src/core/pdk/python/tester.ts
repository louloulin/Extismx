/**
 * Python plugin tester implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { PluginTester, TestOptions, TestResult } from '../common/tester';
import { PDKError } from '../../errors';

const execAsync = promisify(exec);

/**
 * Options specific to Python plugin testing
 */
export interface PythonTestOptions extends TestOptions {
  /**
   * Whether to run type checking with mypy
   */
  typeCheck?: boolean;
  
  /**
   * Whether to measure test coverage
   */
  coverage?: boolean;
  
  /**
   * Additional pytest arguments
   */
  pytestArgs?: string[];
  
  /**
   * Additional mypy arguments
   */
  mypyArgs?: string[];
  
  /**
   * Whether to use virtual environment for testing
   */
  useVenv?: boolean;
}

/**
 * Python plugin tester implementation
 */
export class PythonTester extends PluginTester {
  /**
   * Default Python test options
   */
  private defaultPythonOptions: PythonTestOptions = {
    typeCheck: true,
    coverage: true,
    useVenv: true
  };

  /**
   * Constructor
   * 
   * @param projectPath - Path to the plugin project
   * @param options - Test options
   */
  constructor(projectPath: string, options?: PythonTestOptions) {
    super(projectPath, options);
    this.options = { ...this.defaultPythonOptions, ...options };
  }

  /**
   * Get Python-specific test options
   */
  get pythonOptions(): PythonTestOptions {
    return this.options as PythonTestOptions;
  }

  /**
   * Check Python test environment
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
      
      // Check testing tools
      const requiredPackages = ['pytest'];
      
      if (this.pythonOptions.typeCheck) {
        requiredPackages.push('mypy');
      }
      
      if (this.pythonOptions.coverage) {
        requiredPackages.push('pytest-cov');
      }
      
      // Check each package
      for (const pkg of requiredPackages) {
        try {
          await execAsync(`${pythonPath} -c "import ${pkg.replace('-', '_')}"`);
        } catch (error) {
          throw new PDKError('MISSING_DEPENDENCY', `Missing dependency: ${pkg}. Install it with: pip install ${pkg}`);
        }
      }
      
      return pythonPath;
    } catch (error) {
      if (error instanceof PDKError) {
        throw error;
      }
      throw new PDKError('TEST_FAILED', `Python environment check failed: ${error.message}`);
    }
  }

  /**
   * Run pytest tests
   * 
   * @param pythonPath - Path to Python executable
   * @returns Test results
   */
  private async runTests(pythonPath: string): Promise<{
    success: boolean;
    output: string;
    coverage?: number;
  }> {
    const testsDir = path.join(this.projectPath, 'tests');
    
    // Check if tests directory exists
    if (!fs.existsSync(testsDir)) {
      console.warn('Tests directory not found. Skipping tests.');
      return { success: true, output: 'Tests directory not found. Skipping tests.' };
    }
    
    try {
      // Build pytest command
      let command = `${pythonPath} -m pytest`;
      
      // Add coverage if enabled
      if (this.pythonOptions.coverage) {
        command += ' --cov';
      }
      
      // Add verbose output
      command += ' -v';
      
      // Add additional pytest arguments
      if (this.pythonOptions.pytestArgs) {
        command += ` ${this.pythonOptions.pytestArgs.join(' ')}`;
      }
      
      // Run tests
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectPath
      });
      
      // Parse results
      const output = stdout + (stderr ? `\n${stderr}` : '');
      const success = !output.includes('FAILED') && !output.includes('ERROR');
      
      // Parse coverage if enabled
      let coverage: number | undefined;
      if (this.pythonOptions.coverage) {
        const coverageMatch = output.match(/TOTAL\s+\d+\s+\d+\s+(\d+)%/);
        if (coverageMatch) {
          coverage = parseInt(coverageMatch[1], 10);
        }
      }
      
      return { success, output, coverage };
    } catch (error) {
      return {
        success: false,
        output: `Tests failed with error: ${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`
      };
    }
  }

  /**
   * Run type checking
   * 
   * @param pythonPath - Path to Python executable
   * @returns Type checking results
   */
  private async runTypeChecking(pythonPath: string): Promise<{
    success: boolean;
    output: string;
  }> {
    try {
      // Build mypy command
      let command = `${pythonPath} -m mypy`;
      
      // Add source directory
      const packageName = path.basename(this.projectPath).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      command += ` ${packageName}`;
      
      // Add additional mypy arguments
      if (this.pythonOptions.mypyArgs) {
        command += ` ${this.pythonOptions.mypyArgs.join(' ')}`;
      }
      
      // Run type checking
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectPath
      });
      
      // Parse results
      const output = stdout + (stderr ? `\n${stderr}` : '');
      const success = !output.includes('error:');
      
      return { success, output };
    } catch (error) {
      return {
        success: false,
        output: `Type checking failed with error: ${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`
      };
    }
  }

  /**
   * Test the Python plugin
   * 
   * @returns A promise that resolves to the test result
   */
  async test(): Promise<TestResult> {
    try {
      // Check environment
      const pythonPath = await this.checkEnvironment();
      
      // Results
      const results: TestResult = {
        success: true,
        details: {}
      };
      
      // Run type checking if enabled
      if (this.pythonOptions.typeCheck) {
        const typeCheckResult = await this.runTypeChecking(pythonPath);
        results.details.typeCheck = typeCheckResult;
        
        if (!typeCheckResult.success) {
          results.success = false;
        }
      }
      
      // Run tests
      const testResult = await this.runTests(pythonPath);
      results.details.tests = testResult;
      
      if (testResult.coverage !== undefined) {
        results.details.coverage = testResult.coverage;
      }
      
      if (!testResult.success) {
        results.success = false;
      }
      
      return results;
    } catch (error) {
      if (error instanceof PDKError) {
        throw error;
      }
      throw new PDKError('TEST_FAILED', `Python plugin testing failed: ${error.message}`);
    }
  }
} 