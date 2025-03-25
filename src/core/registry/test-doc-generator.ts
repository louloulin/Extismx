/**
 * Documentation Generator Test
 * 
 * This script demonstrates the functionality of the DocGenerator component.
 */

import { DocGenerator, DocFormat } from './doc-generator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates a sample plugin metadata for testing
 */
function createSamplePluginMetadata() {
  return {
    name: 'sample-plugin',
    version: '1.0.0',
    description: 'A sample plugin for testing documentation generation',
    author: 'Extism Team',
    license: 'MIT',
    repository: 'https://github.com/extism/sample-plugin',
    homepage: 'https://extism.org',
    tags: ['sample', 'test', 'documentation'],
    language: 'typescript' as const,
    main: 'dist/plugin.wasm',
    exports: [
      {
        name: 'greet',
        description: 'Greets a user by name',
        inputs: [
          {
            name: 'name',
            type: 'string',
            description: 'The name to greet',
            optional: false
          },
          {
            name: 'language',
            type: 'string',
            description: 'The language to use for greeting',
            optional: true
          }
        ],
        outputs: [
          {
            name: 'greeting',
            type: 'string',
            description: 'The greeting message'
          }
        ]
      },
      {
        name: 'calculate',
        description: 'Performs a mathematical calculation',
        inputs: [
          {
            name: 'operation',
            type: 'string',
            description: 'The operation to perform (add, subtract, multiply, divide)',
            optional: false
          },
          {
            name: 'a',
            type: 'number',
            description: 'First operand',
            optional: false
          },
          {
            name: 'b',
            type: 'number',
            description: 'Second operand',
            optional: false
          }
        ],
        outputs: [
          {
            name: 'result',
            type: 'number',
            description: 'The calculation result'
          }
        ]
      }
    ],
    dependencies: {
      'utils-lib': '1.2.0',
      'validation': '0.8.5',
      'format-helper': '2.1.3'
    }
  };
}

/**
 * Runs the doc generator tests
 */
async function runDocGeneratorTests() {
  console.log('=== Documentation Generator Test ===\n');
  
  try {
    // Create sample plugin metadata
    console.log('Creating sample plugin metadata...');
    const pluginMetadata = createSamplePluginMetadata();
    console.log(`Sample plugin metadata created for: ${pluginMetadata.name}@${pluginMetadata.version}\n`);
    
    // Create doc generator
    const docGenerator = new DocGenerator();
    
    // Generate Markdown documentation
    console.log('Generating Markdown documentation...');
    const markdownDoc = docGenerator.generate(pluginMetadata, {
      format: DocFormat.MARKDOWN,
      includeExamples: true,
      includeDependencies: true,
      includeUsage: true
    });
    console.log('Markdown documentation generated successfully');
    
    // Generate HTML documentation
    console.log('Generating HTML documentation...');
    const htmlDoc = docGenerator.generate(pluginMetadata, {
      format: DocFormat.HTML,
      includeExamples: true,
      includeDependencies: true,
      includeUsage: true,
      theme: 'light'
    });
    console.log('HTML documentation generated successfully');
    
    // Generate JSON documentation
    console.log('Generating JSON documentation...');
    const jsonDoc = docGenerator.generate(pluginMetadata, {
      format: DocFormat.JSON,
      includeExamples: true,
      includeDependencies: true
    });
    console.log('JSON documentation generated successfully');
    
    // Save documentation to files
    const outputDir = path.join(__dirname, '../../../output/docs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(outputDir, 'plugin-docs.md'), markdownDoc);
    fs.writeFileSync(path.join(outputDir, 'plugin-docs.html'), htmlDoc);
    fs.writeFileSync(path.join(outputDir, 'plugin-docs.json'), jsonDoc);
    
    console.log('\nDocumentation files saved to output/docs directory:');
    console.log('- Markdown: output/docs/plugin-docs.md');
    console.log('- HTML: output/docs/plugin-docs.html');
    console.log('- JSON: output/docs/plugin-docs.json');
    
    // Display a preview of the Markdown documentation
    console.log('\n--- Markdown Documentation Preview ---\n');
    console.log(markdownDoc.substring(0, 500) + '...');
    
    console.log('\n=== Test Completed Successfully ===');
  } catch (error) {
    console.error('Error in documentation generator test:', error);
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runDocGeneratorTests();
} 