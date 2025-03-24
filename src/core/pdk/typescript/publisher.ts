import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

/**
 * TypeScript plugin publisher
 */
export class TypeScriptPublisher {
  constructor(private projectPath: string) {}

  /**
   * Publish plugin to npm registry
   */
  async publishToNpm(version?: string): Promise<void> {
    try {
      // Update version if provided
      if (version) {
        await this.updateVersion(version);
      }

      // Build plugin
      await execAsync('npm run build', {
        cwd: this.projectPath
      });

      // Publish to npm
      await execAsync('npm publish', {
        cwd: this.projectPath
      });
    } catch (error) {
      throw new Error(`Failed to publish plugin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update plugin version
   */
  private async updateVersion(version: string): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      packageJson.version = version;
      
      await fs.writeFile(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2)
      );
    } catch (error) {
      throw new Error(`Failed to update version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create git tag for version
   */
  async createGitTag(version: string): Promise<void> {
    try {
      await execAsync(`git tag v${version}`, {
        cwd: this.projectPath
      });

      await execAsync('git push --tags', {
        cwd: this.projectPath
      });
    } catch (error) {
      throw new Error(`Failed to create git tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate changelog
   */
  async generateChangelog(): Promise<void> {
    try {
      // This is a simple implementation
      // In practice, you might want to use tools like standard-version
      const commits = await execAsync(
        'git log --pretty=format:"%h - %s (%an)" $(git describe --tags --abbrev=0)..HEAD',
        { cwd: this.projectPath }
      );

      const changelog = `# Changelog\n\n## Latest Changes\n\n${commits.stdout}\n`;

      await fs.writeFile(
        path.join(this.projectPath, 'CHANGELOG.md'),
        changelog,
        { flag: 'a' }
      );
    } catch (error) {
      throw new Error(`Failed to generate changelog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 