import * as fs from 'fs/promises';
import * as path from 'path';
import { PluginManifest } from '../common/types';

/**
 * TypeScript plugin template generator
 */
export class TypeScriptTemplateGenerator {
  constructor(private projectPath: string) {}

  /**
   * Generate plugin template
   */
  async generate(manifest: PluginManifest): Promise<void> {
    // Create project structure
    await this.createProjectStructure();

    // Generate package.json
    await this.generatePackageJson(manifest);

    // Generate plugin source
    await this.generatePluginSource(manifest);

    // Generate test file
    await this.generateTestFile(manifest);

    // Generate README
    await this.generateReadme(manifest);
  }

  /**
   * Create project directory structure
   */
  private async createProjectStructure(): Promise<void> {
    const dirs = [
      'src',
      'test',
      'build'
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(this.projectPath, dir), { recursive: true });
    }
  }

  /**
   * Generate package.json
   */
  private async generatePackageJson(manifest: PluginManifest): Promise<void> {
    const packageJson = {
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      license: manifest.license || 'MIT',
      scripts: {
        build: 'tsc',
        test: 'jest',
        clean: 'rm -rf build'
      },
      dependencies: {
        ...manifest.dependencies
      },
      devDependencies: {
        typescript: '^4.9.0',
        '@types/node': '^16.0.0',
        jest: '^27.0.0',
        '@types/jest': '^27.0.0',
        'ts-jest': '^27.0.0'
      }
    };

    await fs.writeFile(
      path.join(this.projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  /**
   * Generate plugin source code
   */
  private async generatePluginSource(manifest: PluginManifest): Promise<void> {
    const source = `/**
 * ${manifest.name} plugin
 * ${manifest.description || ''}
 */

export interface PluginConfig {
  // Add plugin configuration options here
}

export class Plugin {
  constructor(private config: PluginConfig) {}

  /**
   * Initialize plugin
   */
  async init(): Promise<void> {
    // Add initialization logic here
  }

  /**
   * Plugin functions
   */
  // Add your plugin functions here
}
`;

    await fs.writeFile(
      path.join(this.projectPath, 'src', 'index.ts'),
      source
    );
  }

  /**
   * Generate test file
   */
  private async generateTestFile(manifest: PluginManifest): Promise<void> {
    const test = `import { Plugin } from '../src';

describe('${manifest.name}', () => {
  let plugin: Plugin;

  beforeEach(() => {
    plugin = new Plugin({});
  });

  it('should initialize successfully', async () => {
    await expect(plugin.init()).resolves.not.toThrow();
  });

  // Add more test cases here
});
`;

    await fs.writeFile(
      path.join(this.projectPath, 'test', 'index.test.ts'),
      test
    );
  }

  /**
   * Generate README
   */
  private async generateReadme(manifest: PluginManifest): Promise<void> {
    const readme = `# ${manifest.name}

${manifest.description || ''}

## Installation

\`\`\`bash
npm install ${manifest.name}
\`\`\`

## Usage

\`\`\`typescript
import { Plugin } from '${manifest.name}';

const plugin = new Plugin({
  // Add configuration options here
});

await plugin.init();
// Use plugin functions
\`\`\`

## API

// Add API documentation here

## License

${manifest.license || 'MIT'}
`;

    await fs.writeFile(
      path.join(this.projectPath, 'README.md'),
      readme
    );
  }
} 