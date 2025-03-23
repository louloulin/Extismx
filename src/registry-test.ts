// Test script for the Extism plugin registry

import { ExtismRegistry } from './registry';
import { PluginMetadata } from './registry-types';
import { generateKeyPair, signPlugin, verifyPlugin } from './plugin-sign';
import * as crypto from 'crypto';

// Mock plugin content for testing
function createMockPluginContent(): Buffer {
  return Buffer.from('mock plugin content');
}

// Create mock plugin metadata
function createMockPluginMetadata(customProps: Partial<PluginMetadata> = {}): PluginMetadata {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    description: 'A test plugin',
    author: 'test-author',
    license: 'MIT',
    keywords: ['test', 'plugin'],
    language: 'typescript',
    runtime: 'wasm',
    exports: ['hello'],
    ...customProps
  };
}

// Test registry functionality
async function testRegistry() {
  console.log('=== Testing Extism Plugin Registry ===\n');
  
  // Create a new registry
  const registry = new ExtismRegistry('http://localhost:8080');
  console.log('Registry created successfully');
  
  // Test plugin publishing
  console.log('\n--- Test: Publishing a plugin ---');
  const metadata = createMockPluginMetadata();
  const content = createMockPluginContent();
  
  const publishResult = registry.publishPlugin(metadata, content);
  console.log(`Publish result: ${publishResult.success ? 'Success' : 'Failed'}`);
  console.log(`Plugin ID: ${publishResult.package.id}`);
  
  // Test plugin retrieval
  console.log('\n--- Test: Retrieving a plugin ---');
  const pluginId = publishResult.package.id;
  const plugin = registry.getPlugin(pluginId);
  
  if (plugin) {
    console.log(`Retrieved plugin: ${plugin.id}@${plugin.metadata.version}`);
    console.log(`Description: ${plugin.metadata.description}`);
  } else {
    console.error('Failed to retrieve plugin');
  }
  
  // Test plugin search
  console.log('\n--- Test: Searching for plugins ---');
  const searchResults = registry.searchPlugins({ query: 'test' });
  console.log(`Found ${searchResults.total} plugins`);
  searchResults.items.forEach(pkg => {
    console.log(`- ${pkg.id}@${pkg.metadata.version}: ${pkg.metadata.description}`);
  });
  
  // Test plugin versioning
  console.log('\n--- Test: Plugin versioning ---');
  const v2Metadata = createMockPluginMetadata({ version: '2.0.0', description: 'Version 2 of the test plugin' });
  const v2Content = createMockPluginContent();
  
  const v2PublishResult = registry.publishPlugin(v2Metadata, v2Content);
  console.log(`Published version 2.0.0: ${v2PublishResult.success ? 'Success' : 'Failed'}`);
  
  const versions = registry.getPluginVersions(pluginId);
  console.log(`Available versions: ${versions.map(v => v.version).join(', ')}`);
  
  const v1 = registry.getPlugin(pluginId, '1.0.0');
  const v2 = registry.getPlugin(pluginId, '2.0.0');
  console.log(`v1 description: ${v1?.metadata.description}`);
  console.log(`v2 description: ${v2?.metadata.description}`);
  
  // Test plugin signing and verification
  console.log('\n--- Test: Plugin signing and verification ---');
  const { privateKey, publicKey } = generateKeyPair();
  console.log('Generated key pair for signing');
  
  const signedContent = createMockPluginContent();
  const signature = signPlugin(signedContent, privateKey);
  console.log(`Signature: ${signature.substring(0, 20)}...`);
  
  const isValid = verifyPlugin(signedContent, signature, publicKey);
  console.log(`Signature verification: ${isValid ? 'Valid' : 'Invalid'}`);
  
  const signedMetadata = createMockPluginMetadata({ 
    name: 'signed-plugin',
    description: 'A signed test plugin' 
  });
  
  const signedPublishResult = registry.publishPlugin(signedMetadata, signedContent, signature);
  console.log(`Published signed plugin: ${signedPublishResult.success ? 'Success' : 'Failed'}`);
  console.log(`Signed plugin ID: ${signedPublishResult.package.id}`);
  console.log(`Verified: ${signedPublishResult.package.verified ? 'Yes' : 'No'}`);
  
  // Test plugin dependencies
  console.log('\n--- Test: Plugin dependencies ---');
  const depMetadata = createMockPluginMetadata({
    name: 'plugin-with-deps',
    description: 'A plugin with dependencies',
    dependencies: {
      [pluginId]: '>=1.0.0',
      [signedPublishResult.package.id]: '1.0.0'
    }
  });
  
  const depContent = createMockPluginContent();
  const depPublishResult = registry.publishPlugin(depMetadata, depContent);
  console.log(`Published plugin with dependencies: ${depPublishResult.success ? 'Success' : 'Failed'}`);
  
  const depGraph = registry.resolveDependencies(depPublishResult.package.id);
  console.log('Dependency graph:');
  console.log(`Root: ${depGraph?.root.id}@${depGraph?.root.metadata.version}`);
  console.log('Dependencies:');
  if (depGraph) {
    Object.entries(depGraph.dependencies).forEach(([id, dep]) => {
      console.log(`- ${id}: requested ${dep.requested}, resolved ${dep.resolved}`);
    });
  }
  
  console.log('\n=== Registry Tests Completed ===');
}

// Run the tests
testRegistry().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}); 