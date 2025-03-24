/**
 * Plugin function type
 */
export interface PluginFunction {
  name: string;
  inputs: PluginType[];
  outputs: PluginType[];
  isAsync?: boolean;
}

/**
 * Plugin type definition
 */
export interface PluginType {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'buffer';
  optional?: boolean;
  description?: string;
  items?: PluginType;  // For array types
  properties?: Record<string, PluginType>;  // For object types
}

/**
 * Plugin manifest
 */
export interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  repository?: string;
  homepage?: string;
  keywords?: string[];
  language: string;
  runtime: string;
  exports: PluginFunction[];
  imports?: PluginFunction[];
  dependencies?: Record<string, string>;
}

/**
 * Plugin build configuration
 */
export interface BuildConfig {
  target: 'wasm32-unknown-unknown' | 'wasm32-wasi';
  debug?: boolean;
  optimizationLevel?: 0 | 1 | 2 | 3;
  features?: string[];
  env?: Record<string, string>;
}

/**
 * Plugin runtime configuration
 */
export interface RuntimeConfig {
  memory?: {
    initial: number;  // Initial memory pages (64KB each)
    maximum?: number; // Maximum memory pages
  };
  timeout?: number;   // Execution timeout in milliseconds
  allowedHosts?: string[]; // Allowed network hosts
  env?: Record<string, string>; // Environment variables
}

/**
 * Plugin test configuration
 */
export interface TestConfig {
  timeout?: number;
  coverage?: boolean;
  filter?: string;
  reporter?: 'spec' | 'json' | 'tap';
}

/**
 * Plugin publish options
 */
export interface PublishOptions {
  dryRun?: boolean;
  tag?: string;
  registry?: string;
  access?: 'public' | 'restricted';
  token?: string;
  signPackage?: boolean;
}

/**
 * Plugin publish result
 */
export interface PublishResult {
  success: boolean;
  message: string;
  details: {
    files?: string[];
    publishUrl?: string;
    error?: string;
    output?: string;
    errorCode?: string;
    errorDetails?: any;
    [key: string]: any;
  };
}

/**
 * Plugin development environment
 */
export interface DevEnvironment {
  buildConfig: BuildConfig;
  runtimeConfig: RuntimeConfig;
  testConfig: TestConfig;
}

/**
 * Plugin build result
 */
export interface BuildResult {
  success: boolean;
  wasmFile?: string;
  size?: number;
  error?: string;
  warnings?: string[];
  stats?: {
    buildTime: number;
    optimizationTime?: number;
    originalSize: number;
    optimizedSize?: number;
  };
}

/**
 * Plugin test result
 */
export interface TestResult {
  success: boolean;
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  duration: number;
  error?: string;
} 