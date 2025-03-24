/**
 * Go plugin development kit (PDK)
 * 
 * This module exports all Go PDK components.
 */

// Re-export all Go PDK components
export * from './builder';
export * from './tester';
export * from './template';
export * from './publisher';

// Import for side effects (registration)
import { GoBuilder } from './builder';
import { GoTester } from './tester';
import { GoTemplateGenerator } from './template';
import { GoPublisher } from './publisher';

// Register with factories if applicable
import { PluginBuilderFactory } from '../common/builder';

// Register Go builder with the plugin builder factory
PluginBuilderFactory.registerBuilder('go', GoBuilder);

/**
 * Create Go builder
 * 
 * @param projectPath - Path to the project
 * @param manifest - Plugin manifest
 * @param options - Builder options
 * @returns Go builder instance
 */
export function createGoBuilder(projectPath: string, manifest: any, options?: any) {
  return new GoBuilder(projectPath, manifest, options);
}

/**
 * Create Go tester
 * 
 * @param projectPath - Path to the project
 * @param manifest - Plugin manifest
 * @param options - Tester options
 * @returns Go tester instance
 */
export function createGoTester(projectPath: string, manifest: any, options?: any) {
  return new GoTester(projectPath, manifest, options);
}

/**
 * Create Go template generator
 * 
 * @param options - Template options
 * @returns Go template generator instance
 */
export function createGoTemplateGenerator(options?: any) {
  return new GoTemplateGenerator(options);
}

/**
 * Create Go publisher
 * 
 * @param projectPath - Path to the project
 * @param manifest - Plugin manifest
 * @param options - Publisher options
 * @returns Go publisher instance
 */
export function createGoPublisher(projectPath: string, manifest: any, options?: any) {
  return new GoPublisher(projectPath, manifest, options);
} 