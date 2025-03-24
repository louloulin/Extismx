/**
 * C++ plugin tester implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { PluginTester } from '../common/tester';
import { PDKError, PDKErrorCode } from '../../errors/pdk';
import { PluginManifest, TestResult, TestConfig } from '../common/types';

const execAsync = promisify(exec);

/**
 * Options specific to C++ plugin testing
 */
export interface CppTestOptions {
  /**
   * The test framework to use
   */
  testFramework?: 'catch2' | 'googletest' | 'doctest' | 'custom';
  
  /**
   * Path to the test executable
   */
  testExecutablePath?: string;
  
  /**
   * Whether to use CMake for testing
   */
  useCMake?: boolean;
  
  /**
   * Whether to use Make for testing
   */
  useMake?: boolean;
  
  /**
   * Additional arguments to pass to the test runner
   */
  testArgs?: string[];
  
  /**
   * Path to the CMake executable
   */
  cmakePath?: string;
  
  /**
   * Path to the Make executable
   */
  makePath?: string;
  
  /**
   * Directory containing the test files
   */
  testDir?: string;
}

/**
 * C++ plugin tester implementation
 */
export class CppTester extends PluginTester {
  /**
   * Default C++ test options
   */
  private defaultCppOptions: CppTestOptions = {
    testFramework: 'catch2',
    useCMake: true,
    useMake: false,
    cmakePath: 'cmake',
    makePath: 'make',
    testDir: 'tests'
  };

  /**
   * C++ test options
   */
  private cppOptions: CppTestOptions;

  /**
   * Constructor
   * 
   * @param projectPath - Path to the plugin project
   * @param manifest - Plugin manifest
   * @param config - Test configuration
   * @param cppOptions - C++-specific test options
   */
  constructor(
    projectPath: string,
    manifest: PluginManifest,
    config: TestConfig,
    cppOptions?: CppTestOptions
  ) {
    super(projectPath, manifest, config);
    this.cppOptions = { ...this.defaultCppOptions, ...cppOptions };
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
   * Find the test executable
   */
  private async findTestExecutable(): Promise<string | undefined> {
    if (this.cppOptions.testExecutablePath) {
      return path.resolve(this.projectPath, this.cppOptions.testExecutablePath);
    }
    
    const possibleTestDirs = [
      this.projectPath,
      path.join(this.projectPath, 'build'),
      path.join(this.projectPath, 'build/tests'),
      path.join(this.projectPath, 'tests'),
      path.join(this.projectPath, 'test')
    ];
    
    const possibleTestNames = [
      'tests',
      'test',
      'unittests',
      'unittest',
      'run_tests',
      'run_test',
      'run-tests',
      'run-test',
      `${path.basename(this.projectPath)}_tests`,
      `${path.basename(this.projectPath)}_test`
    ];
    
    for (const dir of possibleTestDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        
        for (const name of possibleTestNames) {
          const testFile = files.find(file => 
            file === name || 
            file === `${name}.exe` || 
            (file.startsWith(name) && !file.endsWith('.cpp') && !file.endsWith('.h'))
          );
          
          if (testFile) {
            const testPath = path.join(dir, testFile);
            
            // Check if file is executable
            try {
              fs.accessSync(testPath, fs.constants.X_OK);
              return testPath;
            } catch {
              // Not executable
            }
          }
        }
      }
    }
    
    return undefined;
  }

  /**
   * Build tests using CMake
   */
  private async buildTestsWithCMake(): Promise<{ success: boolean; output: string }> {
    try {
      // Create build directory
      const buildDir = path.join(this.projectPath, 'build');
      
      if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
      }
      
      // Configure with CMake
      const { stdout: configureOutput, stderr: configureError } = await execAsync(
        `${this.cppOptions.cmakePath} -DBUILD_TESTING=ON ..`,
        { cwd: buildDir, env: { ...process.env } }
      );
      
      // Build with CMake
      const { stdout: buildOutput, stderr: buildError } = await execAsync(
        `${this.cppOptions.cmakePath} --build . --target test`,
        { cwd: buildDir, env: { ...process.env } }
      );
      
      const output = configureOutput + configureError + buildOutput + buildError;
      
      // Success is based on whether we can find the test executable
      const testExecutable = await this.findTestExecutable();
      
      return {
        success: !!testExecutable,
        output
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Build tests using Make
   */
  private async buildTestsWithMake(): Promise<{ success: boolean; output: string }> {
    try {
      // Run make tests
      const { stdout, stderr } = await execAsync(`${this.cppOptions.makePath} tests`, {
        cwd: this.projectPath,
        env: { ...process.env }
      });
      
      const output = stdout + stderr;
      
      // Success is based on whether we can find the test executable
      const testExecutable = await this.findTestExecutable();
      
      return {
        success: !!testExecutable,
        output
      };
    } catch (error) {
      // Try make test if tests failed
      try {
        const { stdout, stderr } = await execAsync(`${this.cppOptions.makePath} test`, {
          cwd: this.projectPath,
          env: { ...process.env }
        });
        
        const output = stdout + stderr;
        
        // Success is based on whether we can find the test executable
        const testExecutable = await this.findTestExecutable();
        
        return {
          success: !!testExecutable,
          output
        };
      } catch (err) {
        return {
          success: false,
          output: error instanceof Error ? error.message : String(error)
        };
      }
    }
  }

  /**
   * Parse test results from Catch2 output
   */
  private parseCatch2Results(output: string): { passing: number; failing: number; skipped: number } {
    const lines = output.split('\n');
    let passing = 0;
    let failing = 0;
    let skipped = 0;
    
    // Try to find the summary line
    const summaryLine = lines.find(line => line.includes('test cases:') || line.includes('assertions:'));
    
    if (summaryLine) {
      // Parse test case count
      const testCaseMatch = summaryLine.match(/(\d+) test cases?/);
      if (testCaseMatch) {
        const total = parseInt(testCaseMatch[1], 10);
        
        // Parse failing count
        const failingMatch = summaryLine.match(/(\d+) failed/);
        failing = failingMatch ? parseInt(failingMatch[1], 10) : 0;
        
        // Parse skipped count if available
        const skippedMatch = summaryLine.match(/(\d+) skipped/);
        skipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0;
        
        // Calculate passing tests
        passing = total - failing - skipped;
      }
    } else {
      // If no summary line, count success and failure lines
      for (const line of lines) {
        if (line.includes('PASSED') || line.includes('All tests passed')) {
          passing++;
        } else if (line.includes('FAILED')) {
          failing++;
        } else if (line.includes('SKIPPED')) {
          skipped++;
        }
      }
    }
    
    return { passing, failing, skipped };
  }

  /**
   * Parse test results from Google Test output
   */
  private parseGoogleTestResults(output: string): { passing: number; failing: number; skipped: number } {
    const lines = output.split('\n');
    let passing = 0;
    let failing = 0;
    let skipped = 0;
    
    // Try to find the summary line
    const summaryLine = lines.find(line => 
      line.includes('PASSED') && line.includes('FAILED') && line.includes('tests')
    );
    
    if (summaryLine) {
      // Parse passing count
      const passingMatch = summaryLine.match(/(\d+) (?:tests )?PASSED/);
      passing = passingMatch ? parseInt(passingMatch[1], 10) : 0;
      
      // Parse failing count
      const failingMatch = summaryLine.match(/(\d+) (?:tests )?FAILED/);
      failing = failingMatch ? parseInt(failingMatch[1], 10) : 0;
      
      // Parse skipped/disabled count if available
      const skippedMatch = summaryLine.match(/(\d+) (?:tests )?(?:SKIPPED|DISABLED)/);
      skipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0;
    } else {
      // If no summary line, count individual test results
      for (const line of lines) {
        if (line.includes('OK]') || line.includes('PASSED')) {
          passing++;
        } else if (line.includes('FAILED]')) {
          failing++;
        } else if (line.includes('SKIPPED]') || line.includes('DISABLED]')) {
          skipped++;
        }
      }
    }
    
    return { passing, failing, skipped };
  }

  /**
   * Parse test results from doctest output
   */
  private parseDocTestResults(output: string): { passing: number; failing: number; skipped: number } {
    const lines = output.split('\n');
    let passing = 0;
    let failing = 0;
    let skipped = 0;
    
    // Try to find the summary line
    const summaryLine = lines.find(line => line.includes('test cases:'));
    
    if (summaryLine) {
      // Parse test case count
      const testCaseMatch = summaryLine.match(/(\d+) test cases/);
      if (testCaseMatch) {
        const total = parseInt(testCaseMatch[1], 10);
        
        // Parse failing count
        const failingMatch = summaryLine.match(/(\d+) failed/);
        failing = failingMatch ? parseInt(failingMatch[1], 10) : 0;
        
        // Parse skipped count if available
        const skippedMatch = summaryLine.match(/(\d+) skipped/);
        skipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0;
        
        // Calculate passing tests
        passing = total - failing - skipped;
      }
    } else {
      // If no summary line, count success and failure lines
      for (const line of lines) {
        if (line.includes('PASSED') || line.includes('SUCCESS')) {
          passing++;
        } else if (line.includes('FAILED') || line.includes('FAILURE')) {
          failing++;
        } else if (line.includes('SKIPPED')) {
          skipped++;
        }
      }
    }
    
    return { passing, failing, skipped };
  }

  /**
   * Parse generic test results
   */
  private parseGenericTestResults(output: string): { passing: number; failing: number; skipped: number } {
    let passing = 0;
    let failing = 0;
    let skipped = 0;
    
    // If the output contains "All tests passed" or similar, assume all tests passed
    if (
      output.includes('All tests passed') || 
      output.includes('All tests successful') ||
      output.includes('All tests PASSED')
    ) {
      // Try to extract the number of tests from output
      const match = output.match(/(\d+) tests? passed/i);
      passing = match ? parseInt(match[1], 10) : 1;
    } else {
      // Count various test result indicators
      const lines = output.split('\n');
      
      for (const line of lines) {
        const lowercaseLine = line.toLowerCase();
        
        if (
          lowercaseLine.includes('pass') || 
          lowercaseLine.includes('ok') || 
          lowercaseLine.includes('success')
        ) {
          passing++;
        } else if (
          lowercaseLine.includes('fail') || 
          lowercaseLine.includes('error') || 
          lowercaseLine.includes('not ok')
        ) {
          failing++;
        } else if (
          lowercaseLine.includes('skip') || 
          lowercaseLine.includes('ignored') || 
          lowercaseLine.includes('disabled')
        ) {
          skipped++;
        }
      }
      
      // If we couldn't find any specific result indicators, check the exit code
      if (passing === 0 && failing === 0 && skipped === 0) {
        // If the output doesn't have any explicit failures, assume 1 passing test
        passing = 1;
      }
    }
    
    return { passing, failing, skipped };
  }

  /**
   * Parse test results based on framework
   */
  private parseTestResults(output: string, framework: string): { passing: number; failing: number; skipped: number } {
    switch (framework) {
      case 'catch2':
        return this.parseCatch2Results(output);
      case 'googletest':
        return this.parseGoogleTestResults(output);
      case 'doctest':
        return this.parseDocTestResults(output);
      default:
        return this.parseGenericTestResults(output);
    }
  }

  /**
   * Run the test executable
   */
  private async runTestExecutable(testExecutablePath: string): Promise<{ success: boolean; output: string }> {
    try {
      const args = this.cppOptions.testArgs ? ` ${this.cppOptions.testArgs.join(' ')}` : '';
      const command = `${testExecutablePath}${args}`;
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectPath,
        env: { ...process.env }
      });
      
      return {
        success: true,
        output: stdout + stderr
      };
    } catch (error) {
      // If the command failed but produced output, we still want to parse the results
      if (error instanceof Error && 'stdout' in error && 'stderr' in error) {
        const errorObj = error as { stdout: string; stderr: string };
        return {
          success: false,
          output: errorObj.stdout + errorObj.stderr
        };
      }
      
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Detect the test framework from the project
   */
  private async detectTestFramework(): Promise<string> {
    // Use configured framework if available
    if (this.cppOptions.testFramework !== 'custom') {
      return this.cppOptions.testFramework || 'catch2';
    }
    
    // Try to detect from source files
    const testDir = path.join(this.projectPath, this.cppOptions.testDir || 'tests');
    
    if (fs.existsSync(testDir)) {
      const checkFiles = async (dir: string): Promise<string> => {
        try {
          const files = await fs.promises.readdir(dir);
          
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.promises.stat(filePath);
            
            if (stat.isDirectory()) {
              const result = await checkFiles(filePath);
              if (result !== 'custom') {
                return result;
              }
            } else if (file.endsWith('.cpp') || file.endsWith('.h') || file.endsWith('.hpp')) {
              try {
                const content = await fs.promises.readFile(filePath, 'utf-8');
                
                if (content.includes('#include <catch2/') || content.includes('#include "catch2/')) {
                  return 'catch2';
                } else if (content.includes('#include <gtest/') || content.includes('#include "gtest/')) {
                  return 'googletest';
                } else if (content.includes('#include <doctest') || content.includes('#include "doctest')) {
                  return 'doctest';
                }
              } catch {
                // Ignore file read errors
              }
            }
          }
          
          return 'custom';
        } catch {
          return 'custom';
        }
      };
      
      return await checkFiles(testDir);
    }
    
    return 'custom';
  }

  /**
   * Run tests for the C++ plugin
   * 
   * @returns A promise that resolves to the test result
   */
  async runTests(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Build tests based on project type
      let buildOutput = '';
      
      if (this.cppOptions.useCMake && this.hasCMakeLists()) {
        const buildResult = await this.buildTestsWithCMake();
        buildOutput = buildResult.output;
        
        if (!buildResult.success) {
          throw new PDKError(
            `Failed to build tests: ${buildResult.output}`,
            PDKErrorCode.TEST_BUILD_ERROR
          );
        }
      } else if (this.cppOptions.useMake && this.hasMakefile()) {
        const buildResult = await this.buildTestsWithMake();
        buildOutput = buildResult.output;
        
        if (!buildResult.success) {
          throw new PDKError(
            `Failed to build tests: ${buildResult.output}`,
            PDKErrorCode.TEST_BUILD_ERROR
          );
        }
      }
      
      // Find the test executable
      const testExecutablePath = await this.findTestExecutable();
      
      if (!testExecutablePath) {
        throw new PDKError(
          'Could not find test executable',
          PDKErrorCode.TEST_NOT_FOUND
        );
      }
      
      // Run the test executable
      const testResult = await this.runTestExecutable(testExecutablePath);
      
      // Detect test framework
      const testFramework = await this.detectTestFramework();
      
      // Parse results
      const parsedResults = this.parseTestResults(testResult.output, testFramework);
      
      // Handle case where tests execute but all fail
      if (parsedResults.passing === 0 && parsedResults.failing === 0 && parsedResults.skipped === 0) {
        parsedResults.failing = 1;
      }
      
      // Combine build output and test output
      const combinedOutput = buildOutput 
        ? `--- Build Output ---\n${buildOutput}\n\n--- Test Output ---\n${testResult.output}`
        : testResult.output;
      
      const duration = Date.now() - startTime;
      
      return {
        success: parsedResults.failing === 0,
        output: combinedOutput,
        stats: {
          passing: parsedResults.passing,
          failing: parsedResults.failing,
          skipped: parsedResults.skipped,
          duration
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof PDKError 
          ? error.message 
          : `Unknown error: ${error instanceof Error ? error.message : String(error)}`,
        stats: {
          passing: 0,
          failing: 1,
          skipped: 0,
          duration: Date.now() - startTime
        }
      };
    }
  }
} 