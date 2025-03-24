/**
 * Rust plugin tester implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { PluginTester } from '../common/tester';
import { PDKError } from '../../errors/pdk';
import { PluginManifest, TestResult } from '../common/types';

const execAsync = promisify(exec);

/**
 * Options specific to Rust plugin testing
 */
export interface RustTestOptions {
  /**
   * Whether to run unit tests
   */
  runUnitTests?: boolean;
  
  /**
   * Whether to run doc tests
   */
  runDocTests?: boolean;
  
  /**
   * Whether to run clippy lints
   */
  runClippy?: boolean;
  
  /**
   * Whether to check formatting with rustfmt
   */
  checkFormat?: boolean;
  
  /**
   * Additional cargo test arguments
   */
  cargoTestArgs?: string[];
  
  /**
   * Additional clippy arguments
   */
  clippyArgs?: string[];
}

/**
 * Rust plugin tester implementation
 */
export class RustTester extends PluginTester {
  /**
   * Default Rust test options
   */
  private defaultRustOptions: RustTestOptions = {
    runUnitTests: true,
    runDocTests: true,
    runClippy: true,
    checkFormat: true
  };

  /**
   * Rust test options
   */
  private rustOptions: RustTestOptions;

  /**
   * Constructor
   * 
   * @param projectPath - Path to the plugin project
   * @param manifest - Plugin manifest
   * @param options - Test options
   * @param rustOptions - Rust-specific test options
   */
  constructor(
    projectPath: string,
    manifest: PluginManifest,
    options?: any,
    rustOptions?: RustTestOptions
  ) {
    super(projectPath, manifest, options);
    this.rustOptions = { ...this.defaultRustOptions, ...rustOptions };
  }

  /**
   * Run unit and integration tests
   * 
   * @returns Test results
   */
  private async runTests(): Promise<{
    success: boolean;
    output: string;
    testCount: number;
    failedCount: number;
  }> {
    try {
      const args = this.options.verbose ? ['test', '--', '--show-output'] : ['test'];
      
      if (this.rustOptions.cargoTestArgs?.length) {
        args.push(...this.rustOptions.cargoTestArgs);
      }
      
      const { stdout, stderr } = await execAsync(`cargo ${args.join(' ')}`, {
        cwd: this.projectPath
      });
      
      const output = stdout + stderr;
      const testCountMatch = output.match(/running (\d+) tests?/);
      const failedMatch = output.match(/(\d+) failed/);
      
      const testCount = testCountMatch ? parseInt(testCountMatch[1], 10) : 0;
      const failedCount = failedMatch ? parseInt(failedMatch[1], 10) : 0;
      
      return {
        success: failedCount === 0,
        output,
        testCount,
        failedCount
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error),
        testCount: 0,
        failedCount: 1
      };
    }
  }

  /**
   * Run clippy lints
   * 
   * @returns Lint results
   */
  private async runLints(): Promise<{
    success: boolean;
    output: string;
    warningCount: number;
    errorCount: number;
  }> {
    try {
      const args = ['clippy', '--all-targets', '--all-features'];
      
      if (this.options.failOnWarnings) {
        args.push('--', '--deny', 'warnings');
      }
      
      if (this.rustOptions.clippyArgs?.length) {
        args.push(...this.rustOptions.clippyArgs);
      }
      
      const { stdout, stderr } = await execAsync(`cargo ${args.join(' ')}`, {
        cwd: this.projectPath
      });
      
      const output = stdout + stderr;
      const warningMatch = output.match(/warning(?:s)?: (\d+)/);
      const errorMatch = output.match(/error(?:s)?: (\d+)/);
      
      const warningCount = warningMatch ? parseInt(warningMatch[1], 10) : 0;
      const errorCount = errorMatch ? parseInt(errorMatch[1], 10) : 0;
      
      return {
        success: errorCount === 0 && (!this.options.failOnWarnings || warningCount === 0),
        output,
        warningCount,
        errorCount
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error),
        warningCount: 0,
        errorCount: 1
      };
    }
  }

  /**
   * Check code formatting
   * 
   * @returns Format check results
   */
  private async checkFormatting(): Promise<{
    success: boolean;
    output: string;
    fileCount: number;
    unformattedCount: number;
  }> {
    try {
      const { stdout, stderr } = await execAsync('cargo fmt --all -- --check', {
        cwd: this.projectPath
      });
      
      const output = stdout + stderr;
      // Count the number of files checked (approximate)
      const fileCount = (output.match(/Checking formatting/g) || []).length;
      // Count unformatted files
      const unformattedCount = (output.match(/not formatted/g) || []).length;
      
      return {
        success: unformattedCount === 0,
        output,
        fileCount,
        unformattedCount
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not formatted')) {
        const output = error.message;
        const fileCount = (output.match(/Checking formatting/g) || []).length;
        const unformattedCount = (output.match(/not formatted/g) || []).length;
        
        return {
          success: false,
          output,
          fileCount,
          unformattedCount
        };
      }
      
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error),
        fileCount: 0,
        unformattedCount: 0
      };
    }
  }

  /**
   * Test the Rust plugin
   * 
   * @returns A promise that resolves to the test result
   */
  async test(): Promise<TestResult> {
    try {
      const testStartTime = Date.now();
      let success = true;
      let totalTests = 0;
      let passedTests = 0;
      let failedTests = 0;
      let skippedTests = 0;
      let errorMessage = '';
      
      // Run unit and integration tests
      if (this.rustOptions.runUnitTests) {
        const testResults = await this.runTests();
        
        totalTests += testResults.testCount;
        failedTests += testResults.failedCount;
        passedTests += testResults.testCount - testResults.failedCount;
        
        if (!testResults.success) {
          success = false;
          errorMessage += `Tests failed: ${testResults.failedCount} of ${testResults.testCount} tests failed. `;
        }
      }
      
      // Run clippy lints
      if (this.rustOptions.runClippy) {
        const lintResults = await this.runLints();
        
        if (!lintResults.success) {
          if (lintResults.errorCount > 0) {
            success = false;
            errorMessage += `Clippy found ${lintResults.errorCount} errors. `;
          } else if (lintResults.warningCount > 0 && this.options.failOnWarnings) {
            success = false;
            errorMessage += `Clippy found ${lintResults.warningCount} warnings (failing because failOnWarnings is enabled). `;
          }
        }
      }
      
      // Check formatting
      if (this.rustOptions.checkFormat) {
        const formatResults = await this.checkFormatting();
        
        if (!formatResults.success) {
          if (this.options.failOnWarnings) {
            success = false;
            errorMessage += `Found ${formatResults.unformattedCount} unformatted files (failing because failOnWarnings is enabled). `;
          }
        }
      }
      
      const duration = Date.now() - testStartTime;
      
      return {
        success,
        stats: {
          total: totalTests,
          passed: passedTests,
          failed: failedTests,
          skipped: skippedTests
        },
        coverage: {
          statements: 0, // Rust doesn't easily provide coverage info
          branches: 0,
          functions: 0,
          lines: 0
        },
        duration,
        error: errorMessage.length > 0 ? errorMessage.trim() : undefined
      };
    } catch (error) {
      return {
        success: false,
        stats: {
          total: 0,
          passed: 0,
          failed: 1,
          skipped: 0
        },
        coverage: {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0
        },
        duration: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
} 