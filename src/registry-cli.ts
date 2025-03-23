#!/usr/bin/env node
// Command-line interface for the Extism plugin registry

import { ExtismRegistry, defaultRegistry } from './registry';
import { generateKeyPair, signPlugin, verifyPlugin, createCertificate } from './plugin-sign';
import * as fs from 'fs';
import * as path from 'path';
import { PluginMetadata } from './registry-types';

// Simple CLI argument parser
function parseArgs(): { command: string, options: Record<string, string> } {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options: Record<string, string> = {};
  
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
      options[key] = value;
      if (value !== 'true') i++;
    }
  }
  
  return { command, options };
}

// Display help information
function showHelp() {
  console.log(`
Extism Plugin Registry CLI

Usage: extism-registry [command] [options]

Commands:
  init             Initialize a plugin project
  publish          Publish a plugin to the registry
  search           Search for plugins in the registry
  info             Get information about a plugin
  download         Download a plugin
  genkey           Generate a key pair for signing plugins
  sign             Sign a plugin package
  verify           Verify a plugin signature
  help             Show this help message

Options:
  --name           Plugin name
  --version        Plugin version
  --author         Plugin author
  --desc           Plugin description
  --lang           Plugin language
  --file           Plugin file path
  --out            Output file path
  --id             Plugin ID
  --key            Key file path
  --query          Search query
  --limit          Result limit
  --offset         Result offset

Examples:
  extism-registry init --name my-plugin --author "My Name" --lang typescript
  extism-registry publish --file my-plugin.wasm
  extism-registry search --query "weather"
  extism-registry info --id author/my-plugin
  extism-registry download --id author/my-plugin --out my-plugin.wasm
  extism-registry genkey --out keys.json
  extism-registry sign --file my-plugin.wasm --key private-key.pem
  extism-registry verify --file my-plugin.wasm --id author/my-plugin
  `);
}

// Initialize a new plugin project
function initPlugin(options: Record<string, string>) {
  const name = options.name;
  const author = options.author;
  const description = options.desc || `${name} plugin`;
  const language = options.lang || 'typescript';
  
  if (!name || !author) {
    console.error('Error: Plugin name and author are required');
    process.exit(1);
  }
  
  // Create project directory
  if (!fs.existsSync(name)) {
    fs.mkdirSync(name);
  }
  
  // Create package.json for TypeScript/JavaScript projects
  if (language === 'typescript' || language === 'javascript') {
    const packageJson = {
      name,
      version: '0.1.0',
      description,
      author,
      license: 'MIT',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        test: 'echo "Error: no test specified" && exit 1'
      },
      keywords: ['extism', 'plugin'],
      dependencies: {
        '@extism/extism': '^2.0.0'
      },
      devDependencies: {
        typescript: '^4.9.0'
      }
    };
    
    fs.writeFileSync(
      path.join(name, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create tsconfig.json for TypeScript projects
    if (language === 'typescript') {
      const tsconfig = {
        compilerOptions: {
          target: 'ES2020',
          module: 'NodeNext',
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
          declaration: true
        },
        include: ['src/**/*'],
        exclude: ['node_modules', '**/*.test.ts']
      };
      
      fs.writeFileSync(
        path.join(name, 'tsconfig.json'),
        JSON.stringify(tsconfig, null, 2)
      );
    }
    
    // Create src directory
    const srcDir = path.join(name, 'src');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
    }
    
    // Create main file
    const mainFile = `// ${name} plugin
${language === 'typescript' ? 'import { Host } from \'./extism-pdk\';' : 'const { Host } = require(\'./extism-pdk\');'}

// Example plugin function
export function hello() {
  // Get input from the host
  const input = Host.inputString();
  
  // Create greeting
  const greeting = \`Hello, \${input || 'World'}! This is ${name} plugin.\`;
  
  // Send output to the host
  Host.outputString(greeting);
  
  // Return success
  return 0;
}
`;
    
    fs.writeFileSync(
      path.join(srcDir, `index.${language === 'typescript' ? 'ts' : 'js'}`),
      mainFile
    );
    
    // Create plugin manifest
    const manifest = {
      name,
      version: '0.1.0',
      description,
      author,
      license: 'MIT',
      keywords: ['extism', 'plugin'],
      language,
      runtime: 'wasm',
      exports: ['hello']
    };
    
    fs.writeFileSync(
      path.join(name, 'plugin.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`Initialized ${language} plugin project: ${name}`);
  } else {
    console.error(`Error: Language '${language}' is not supported yet`);
    process.exit(1);
  }
}

// Publish a plugin to the registry
function publishPlugin(options: Record<string, string>) {
  const filePath = options.file;
  const keyPath = options.key;
  
  if (!filePath) {
    console.error('Error: Plugin file path is required');
    process.exit(1);
  }
  
  // Read plugin file
  const content = fs.readFileSync(filePath);
  
  // Read manifest
  const manifestPath = path.join(path.dirname(filePath), 'plugin.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Error: plugin.json not found');
    process.exit(1);
  }
  
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const metadata: PluginMetadata = JSON.parse(manifestContent);
  
  // Sign the plugin if key is provided
  let signature: string | undefined;
  if (keyPath) {
    try {
      const privateKey = fs.readFileSync(keyPath, 'utf-8');
      signature = signPlugin(content, privateKey);
      console.log('Plugin signed successfully');
    } catch (error) {
      console.error('Error signing plugin:', error);
      process.exit(1);
    }
  }
  
  // Publish to registry
  const result = defaultRegistry.publishPlugin(metadata, content, signature);
  
  if (result.success) {
    console.log(`Plugin ${result.package.id}@${result.package.metadata.version} published successfully`);
  } else {
    console.error(`Error publishing plugin: ${result.message}`);
    if (result.warnings) {
      console.error('Warnings:');
      result.warnings.forEach(warning => console.error(`- ${warning}`));
    }
    process.exit(1);
  }
}

// Search for plugins in the registry
function searchPlugins(options: Record<string, string>) {
  const query = options.query;
  const language = options.lang;
  const author = options.author;
  const limit = options.limit ? parseInt(options.limit) : undefined;
  const offset = options.offset ? parseInt(options.offset) : undefined;
  
  const results = defaultRegistry.searchPlugins({
    query,
    language,
    author,
    limit,
    offset
  });
  
  console.log(`Found ${results.total} plugins`);
  
  results.items.forEach(pkg => {
    console.log(`\n${pkg.id}@${pkg.metadata.version}`);
    console.log(`  ${pkg.metadata.description}`);
    console.log(`  Language: ${pkg.metadata.language}`);
    console.log(`  Author: ${pkg.metadata.author}`);
    console.log(`  Downloads: ${pkg.downloads}`);
    console.log(`  Keywords: ${pkg.metadata.keywords.join(', ')}`);
  });
  
  if (results.nextOffset !== undefined) {
    console.log(`\nMore results available. Use --offset ${results.nextOffset} to see more.`);
  }
}

// Get information about a plugin
function getPluginInfo(options: Record<string, string>) {
  const id = options.id;
  const version = options.version;
  
  if (!id) {
    console.error('Error: Plugin ID is required');
    process.exit(1);
  }
  
  const plugin = defaultRegistry.getPlugin(id, version);
  
  if (!plugin) {
    console.error(`Error: Plugin ${id}${version ? `@${version}` : ''} not found`);
    process.exit(1);
  }
  
  console.log(`${plugin.id}@${plugin.metadata.version}`);
  console.log(`  Description: ${plugin.metadata.description}`);
  console.log(`  Author: ${plugin.metadata.author}`);
  console.log(`  License: ${plugin.metadata.license}`);
  console.log(`  Language: ${plugin.metadata.language}`);
  console.log(`  Runtime: ${plugin.metadata.runtime}`);
  console.log(`  Exports: ${plugin.metadata.exports.join(', ')}`);
  
  if (plugin.metadata.imports && plugin.metadata.imports.length > 0) {
    console.log(`  Imports: ${plugin.metadata.imports.join(', ')}`);
  }
  
  if (plugin.metadata.dependencies && Object.keys(plugin.metadata.dependencies).length > 0) {
    console.log('  Dependencies:');
    for (const [dep, ver] of Object.entries(plugin.metadata.dependencies)) {
      console.log(`    ${dep}: ${ver}`);
    }
  }
  
  console.log(`  Created: ${plugin.created}`);
  console.log(`  Updated: ${plugin.updated}`);
  console.log(`  Downloads: ${plugin.downloads}`);
  console.log(`  Size: ${plugin.size} bytes`);
  console.log(`  Hash: ${plugin.hash}`);
  console.log(`  Signature: ${plugin.signature ? 'Yes' : 'No'}`);
  console.log(`  Verified: ${plugin.verified ? 'Yes' : 'No'}`);
  
  // Show versions
  const versions = defaultRegistry.getPluginVersions(id);
  if (versions.length > 1) {
    console.log('\nVersions:');
    versions.forEach(ver => {
      console.log(`  ${ver.version} (${ver.created})`);
    });
  }
}

// Generate a key pair for signing plugins
function generateKeys(options: Record<string, string>) {
  const outPath = options.out || 'extism-keys.json';
  
  const keyPair = generateKeyPair();
  
  fs.writeFileSync(
    outPath,
    JSON.stringify(keyPair, null, 2)
  );
  
  console.log(`Key pair generated and saved to ${outPath}`);
  console.log('Keep your private key secure and do not share it!');
}

// Main function
async function main() {
  const { command, options } = parseArgs();
  
  switch (command) {
    case 'init':
      initPlugin(options);
      break;
    case 'publish':
      publishPlugin(options);
      break;
    case 'search':
      searchPlugins(options);
      break;
    case 'info':
      getPluginInfo(options);
      break;
    case 'genkey':
      generateKeys(options);
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Run the CLI
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 