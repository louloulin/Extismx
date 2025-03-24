/**
 * Go plugin tester implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { PluginTester } from '../common/tester';
import { PDKError, PDKErrorCode } from '../../errors/pdk';
import { PluginManifest, TestResult } from '../common/types';

const execAsync = promisify(exec);

/**
 * Options specific to Go plugin testing
 */
export interface GoTestOptions {
  /**
   * Whether to run tests
   */
  runTests?: boolean;
  
  /**
   * Whether to run tests with race detection
   */
  runRaceDetection?: boolean;
  
  /**
   * Whether to check formatting with gofmt
   */
  checkFormat?: boolean;
  
  /**
   * Whether to run staticcheck
   */
  runStaticCheck?: boolean;
  
  /**
   * Whether to run gosec security scanner
   */
  runGoSec?: boolean;
  
  /**
   * Additional go test arguments
   */
  goTestArgs?: string[];
  
  /**
   * Whether to run tests with verbose output
   */
  testVerbose?: boolean;
  
  /**
   * Timeout for tests in seconds
   */
  testTimeout?: number;
}

/**
 * Go plugin tester implementation
 */
export class GoTester extends PluginTester {
  /**
   * Default Go test options
   */
  private defaultGoOptions: GoTestOptions = {
    runTests: true,
    runRaceDetection: false,
    checkFormat: true,
    runStaticCheck: true,
    runGoSec: false,
    testVerbose: false,
    testTimeout: 30
  };

  /**
   * Go test options
   */
  private goOptions: GoTestOptions;

  /**
   * Constructor
   * 
   * @param projectPath - Path to the plugin project
   * @param manifest - Plugin manifest
   * @param options - Test options
   * @param goOptions - Go-specific test options
   */
  constructor(
    projectPath: string,
    manifest: PluginManifest,
    options?: any,
    goOptions?: GoTestOptions
  ) {
    super(projectPath, manifest, options);
    this.goOptions = { ...this.defaultGoOptions, ...goOptions };
  }

  /**
   * Run unit tests
   * 
   * @returns Test results
   */
  private async runTests(): Promise<{
    success: boolean;
    output: string;
    testCount: number;
    passedCount: number;
    failedCount: number;
    skippedCount: number;
  }> {
    try {
      let args = ['test'];
      
      if (this.goOptions.testVerbose) {
        args.push('-v');
      }
      
      if (this.goOptions.runRaceDetection) {
        args.push('-race');
      }
      
      if (this.goOptions.testTimeout) {
        args.push(`-timeout=${this.goOptions.testTimeout}s`);
      }
      
      // Add JSON output for easier parsing
      args.push('-json');
      
      if (this.goOptions.goTestArgs?.length) {
        args.push(...this.goOptions.goTestArgs);
      }
      
      // Add ./... to test all packages
      args.push('./...');
      
      const { stdout, stderr } = await execAsync(`go ${args.join(' ')}`, {
        cwd: this.projectPath
      });
      
      const output = stdout + stderr;
      
      // Parse JSON test output
      const testLines = stdout.split('\n').filter(line => line.trim().length > 0);
      let testCount = 0;
      let passedCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      
      testLines.forEach(line => {
        try {
          const testEvent = JSON.parse(line);
          if (testEvent.Action === 'run') {
            testCount++;
          } else if (testEvent.Action === 'pass') {
            passedCount++;
          } else if (testEvent.Action === 'fail') {
            failedCount++;
          } else if (testEvent.Action === 'skip') {
            skippedCount++;
          }
        } catch (e) {
          // Skip non-JSON lines
        }
      });
      
      return {
        success: failedCount === 0,
        output,
        testCount,
        passedCount,
        failedCount,
        skippedCount
      };
    } catch (error) {
      const errorOutput = error instanceof Error ? error.message : String(error);
      
      // Try to extract test counts from error output
      const failRegex = /FAIL: (\d+)/;
      const passRegex = /PASS: (\d+)/;
      const skipRegex = /SKIP: (\d+)/;
      
      const failMatch = errorOutput.match(failRegex);
      const passMatch = errorOutput.match(passRegex);
      const skipMatch = errorOutput.match(skipRegex);
      
      const failedCount = failMatch ? parseInt(failMatch[1], 10) : 0;
      const passedCount = passMatch ? parseInt(passMatch[1], 10) : 0;
      const skippedCount = skipMatch ? parseInt(skipMatch[1], 10) : 0;
      const testCount = failedCount + passedCount + skippedCount;
      
      return {
        success: false,
        output: errorOutput,
        testCount,
        passedCount,
        failedCount,
        skippedCount
      };
    }
  }

  /**
   * Check code formatting with gofmt
   * 
   * @returns Format check results
   */
  private async checkFormat(): Promise<{
    success: boolean;
    output: string;
    unformattedFiles: string[];
  }> {
    try {
      const { stdout, stderr } = await execAsync('gofmt -l .', {
        cwd: this.projectPath
      });
      
      const output = stdout + stderr;
      const unformattedFiles = stdout
        .split('\n')
        .filter(line => line.trim().length > 0);
      
      return {
        success: unformattedFiles.length === 0,
        output,
        unformattedFiles
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error),
        unformattedFiles: []
      };
    }
  }

  /**
   * Run staticcheck
   * 
   * @returns Staticcheck results
   */
  private async runStaticCheck(): Promise<{
    success: boolean;
    output: string;
    issues: string[];
  }> {
    try {
      const { stdout, stderr } = await execAsync('staticcheck ./...', {
        cwd: this.projectPath
      });
      
      const output = stdout + stderr;
      const issues = stdout
        .split('\n')
        .filter(line => line.trim().length > 0);
      
      return {
        success: issues.length === 0,
        output,
        issues
      };
    } catch (error) {
      // If the command fails, extract issues from the error message
      if (error instanceof Error && error.message.includes('exit status')) {
        const output = error.message;
        const issues = output
          .split('\n')
          .filter(line => line.includes('.go:'));
        
        return {
          success: false,
          output,
          issues
        };
      }
      
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error),
        issues: [`Failed to run staticcheck: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * Test the Go plugin
   * 
   * @returns A promise that resolves to the test result
   */
  async test(): Promise<TestResult> {
    const testStartTime = Date.now();
    let success = true;
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let errorMessage = '';
    const testDetails: Record<string, any> = {};
    
    try {
      // Run unit tests
      if (this.goOptions.runTests) {
        const testResults = await this.runTests();
        testDetails.tests = testResults;
        
        totalTests += testResults.testCount;
        passedTests += testResults.passedCount;
        failedTests += testResults.failedCount;
        skippedTests += testResults.skippedCount;
        
        if (!testResults.success) {
          success = false;
          errorMessage += `Go tests failed: ${testResults.failedCount} of ${testResults.testCount} tests failed. `;
        }
      }
      
      // Check format
      if (this.goOptions.checkFormat) {
        const formatResults = await this.checkFormat();
        testDetails.format = formatResults;
        
        if (!formatResults.success) {
          if (this.options.failOnWarnings) {
            success = false;
            errorMessage += `Found ${formatResults.unformattedFiles.length} unformatted files. `;
          }
        }
      }
      
      // Run staticcheck
      if (this.goOptions.runStaticCheck) {
        const staticCheckResults = await this.runStaticCheck();
        testDetails.staticCheck = staticCheckResults;
        
        if (!staticCheckResults.success) {
          if (this.options.failOnWarnings) {
            success = false;
            errorMessage += `Found ${staticCheckResults.issues.length} issues with staticcheck. `;
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
          statements: 0, // Go coverage is not calculated by default
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
        duration: Date.now() - testStartTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
} 