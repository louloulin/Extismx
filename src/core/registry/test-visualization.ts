/**
 * Dependency Visualizer Test
 * 
 * This script demonstrates the functionality of the DependencyVisualizer component.
 */

import { DependencyResolver, ResolvedDependency } from './dependency-resolver';
import { DependencyVisualizer } from './dependency-visualizer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates a sample dependency graph for testing
 */
async function createSampleGraph() {
  // Create a sample manifest
  const rootManifest = {
    name: 'sample-plugin',
    version: '1.0.0',
    description: 'A sample plugin for testing dependency visualization',
    author: 'Extism Team',
    license: 'MIT',
    repository: 'https://github.com/extism/sample-plugin',
    homepage: 'https://extism.org',
    keywords: ['sample', 'plugin', 'test'],
    language: 'typescript' as const,
    main: 'dist/plugin.wasm',
    exports: [
      {
        name: 'hello',
        description: 'Says hello',
        inputs: [
          {
            name: 'name',
            type: 'string',
            description: 'Name to greet',
            optional: false
          }
        ],
        outputs: [
          {
            name: 'greeting',
            type: 'string',
            description: 'The greeting message'
          }
        ]
      }
    ],
    dependencies: {
      'utils-lib': '1.2.0',
      'logging-lib': '0.8.5',
      'format-lib': '2.1.3',
      'config-lib': '0.5.0'
    }
  };

  // Create a DependencyResolver instance
  const resolver = new DependencyResolver();
  
  // Create a graph with the root manifest
  const graph = await resolver.resolve(rootManifest);
  
  // For testing, manually add more dependencies
  // In a real scenario, these would be fetched from a registry
  const utilsLibDep = graph.root.dependencies.find(d => d.name === 'utils-lib');
  if (utilsLibDep) {
    utilsLibDep.dependencies.push(
      { name: 'http-client', version: '1.0.0', dependencies: [] },
      { name: 'validation', version: '0.9.2', dependencies: [] }
    );
  }
  
  const loggingLibDep = graph.root.dependencies.find(d => d.name === 'logging-lib');
  if (loggingLibDep) {
    loggingLibDep.dependencies.push(
      { name: 'utils-lib', version: '1.1.0', dependencies: [] }, // Note: different version - this creates a conflict
      { name: 'format-lib', version: '2.1.3', dependencies: [] }
    );
  }
  
  const formatLibDep = graph.root.dependencies.find(d => d.name === 'format-lib');
  if (formatLibDep) {
    formatLibDep.dependencies.push(
      { name: 'string-ops', version: '0.7.1', dependencies: [] }
    );
  }
  
  return graph;
}

/**
 * Runs the visualizer tests
 */
async function runVisualizerTests() {
  console.log('=== Dependency Visualizer Test ===\n');
  
  try {
    // Create sample dependency graph
    console.log('Creating sample dependency graph...');
    const graph = await createSampleGraph();
    console.log('Sample graph created with the following root dependencies:');
    graph.root.dependencies.forEach(dep => {
      console.log(`- ${dep.name}@${dep.version}`);
    });
    
    // Create visualizer
    const visualizer = new DependencyVisualizer();
    
    // Generate ASCII tree visualization
    console.log('\n--- ASCII Tree Visualization ---\n');
    const asciiTree = visualizer.toAsciiTree(graph);
    console.log(asciiTree);
    
    // Generate DOT format visualization
    console.log('\n--- DOT Format Visualization ---\n');
    const dot = visualizer.toDot(graph);
    console.log(dot);
    
    // Generate JSON visualization
    console.log('\n--- JSON Visualization ---\n');
    const json = visualizer.toJson(graph);
    console.log(json);
    
    // Save visualizations to files
    const outputDir = path.join(__dirname, '../../../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(outputDir, 'dependency-tree.txt'), asciiTree);
    fs.writeFileSync(path.join(outputDir, 'dependency-graph.dot'), dot);
    fs.writeFileSync(path.join(outputDir, 'dependency-graph.json'), json);
    
    console.log('\nVisualizations saved to the output directory.');
    console.log(`- ASCII Tree: output/dependency-tree.txt`);
    console.log(`- DOT Graph: output/dependency-graph.dot`);
    console.log(`- JSON: output/dependency-graph.json`);
    
    console.log('\nTo render the DOT graph, use Graphviz:');
    console.log('dot -Tpng output/dependency-graph.dot -o output/dependency-graph.png');
    
    console.log('\n=== Test Completed Successfully ===');
  } catch (error) {
    console.error('Error in visualizer test:', error);
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runVisualizerTests();
} 