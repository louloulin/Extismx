import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { TestResult, TestConfig } from '../common/types';

const execAsync = promisify(exec);

/**
 * TypeScript plugin tester
 */
export class TypeScriptTester {
  constructor(
    private projectPath: string,
    private config: TestConfig
  ) {}

  /**
   * Run tests
   */
  async runTests(): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // Run Jest tests
      const { stdout, stderr } = await execAsync(
        'jest --json --coverage',
        {
          cwd: this.projectPath,
          timeout: this.config.timeout || 30000
        }
      );

      if (stderr) {
        console.warn('Test warnings:', stderr);
      }

      // Parse Jest output
      const results = JSON.parse(stdout);
      
      return {
        success: results.success,
        stats: {
          total: results.numTotalTests,
          passed: results.numPassedTests,
          failed: results.numFailedTests,
          skipped: results.numPendingTests
        },
        coverage: {
          statements: results.coverageMap?.total?.statements?.pct || 0,
          branches: results.coverageMap?.total?.branches?.pct || 0,
          functions: results.coverageMap?.total?.functions?.pct || 0,
          lines: results.coverageMap?.total?.lines?.pct || 0
        },
        duration: Date.now() - startTime
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
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Run type checking
   */
  async checkTypes(): Promise<boolean> {
    try {
      await execAsync('tsc --noEmit', {
        cwd: this.projectPath
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Run linting
   */
  async lint(): Promise<boolean> {
    try {
      await execAsync('eslint . --ext .ts', {
        cwd: this.projectPath
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate plugin manifest
   */
  async validateManifest(): Promise<boolean> {
    try {
      const manifestPath = path.join(this.projectPath, 'package.json');
      const manifest = require(manifestPath);

      // Basic validation
      if (!manifest.name || !manifest.version) {
        return false;
      }

      // Additional validation can be added here

      return true;
    } catch {
      return false;
    }
  }
} 