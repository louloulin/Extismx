/**
 * Common tester abstractions
 */
import { PluginManifest, TestResult } from './types';

/**
 * Options for testing
 */
export interface TestOptions {
  /**
   * Whether to run in verbose mode
   */
  verbose?: boolean;
  
  /**
   * Whether to fail on warnings
   */
  failOnWarnings?: boolean;
  
  /**
   * Test timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Whether to measure coverage
   */
  coverage?: boolean;
}

/**
 * Abstract plugin tester
 */
export abstract class PluginTester {
  /**
   * Constructor
   * 
   * @param projectPath - Path to the plugin project
   * @param manifest - Plugin manifest
   * @param options - Test options
   */
  constructor(
    protected projectPath: string,
    protected manifest: PluginManifest,
    protected options: TestOptions = {}
  ) {}

  /**
   * Test the plugin
   */
  abstract test(): Promise<TestResult>;
} 