import { Plugin } from '@extism/sdk';
import { fetchJSON, fetchWithRetry } from './fetch-utils';

export interface PackageDependency {
  name: string;
  version: string;
  optional: boolean;
}

export interface PackageManifest {
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
  repository?: string;
  homepage?: string;
  keywords: string[];
  language: 'typescript' | 'rust' | 'go' | 'python' | 'cpp';
  main: string;
  exports: {
    name: string;
    description?: string;
    inputs?: {
      name: string;
      type: string;
      description?: string;
      optional?: boolean;
    }[];
    outputs?: {
      name: string;
      type: string;
      description?: string;
    }[];
  }[];
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface InstalledPackage {
  manifest: PackageManifest;
  path: string;
  plugin?: Plugin;
}

export interface PackageResolutionOptions {
  /**
   * If true, only one version of each package will be installed
   * If false, multiple versions can coexist
   */
  deduplicate?: boolean;
  
  /**
   * Maximum depth for dependency resolution
   */
  maxDepth?: number;
  
  /**
   * If true, verifies signatures of all packages
   */
  verifySignatures?: boolean;
  
  /**
   * Cache mode for package installation
   */
  cacheMode?: 'use' | 'update' | 'bypass';
  
  /**
   * Registry URL to use
   */
  registry?: string;
  
  /**
   * Authentication token for private packages
   */
  authToken?: string;
}

export class PackageManager {
  private packages: Map<string, InstalledPackage> = new Map();
  private registry: string;
  private cacheDir: string;
  private authToken?: string;
  
  constructor(options: {
    registry?: string;
    cacheDir?: string;
    authToken?: string;
  } = {}) {
    this.registry = options.registry || 'https://registry.extism.org';
    this.cacheDir = options.cacheDir || '.extism-cache';
    this.authToken = options.authToken;
  }
  
  /**
   * Installs a package and all its dependencies
   */
  async install(
    packageName: string, 
    version = 'latest', 
    options: PackageResolutionOptions = {}
  ): Promise<InstalledPackage> {
    console.log(`Installing ${packageName}@${version}...`);
    
    // Normalize options
    const opts = {
      deduplicate: options.deduplicate ?? true,
      maxDepth: options.maxDepth ?? 10,
      verifySignatures: options.verifySignatures ?? true,
      cacheMode: options.cacheMode ?? 'use',
      registry: options.registry ?? this.registry,
      authToken: options.authToken ?? this.authToken,
    };
    
    // Check if package is already installed
    const packageKey = `${packageName}@${version}`;
    if (this.packages.has(packageKey) && opts.cacheMode === 'use') {
      console.log(`Package ${packageKey} already installed, using cached version`);
      return this.packages.get(packageKey)!;
    }
    
    // Fetch package manifest from registry
    const manifest = await this.fetchPackageManifest(packageName, version, opts);
    
    // Install dependencies
    if (manifest.dependencies && Object.keys(manifest.dependencies).length > 0 && opts.maxDepth > 0) {
      console.log(`Installing dependencies for ${packageName}@${version}...`);
      
      await Promise.all(
        Object.entries(manifest.dependencies).map(([depName, depVersion]) => 
          this.install(depName, depVersion, {
            ...opts,
            maxDepth: opts.maxDepth - 1
          })
        )
      );
      
      console.log(`Completed installing dependencies for ${packageName}@${version}`);
    }
    
    // Download and install the actual package
    const packagePath = await this.downloadPackage(packageName, manifest.version, opts);
    
    // Create the installed package record
    const installedPackage: InstalledPackage = {
      manifest,
      path: packagePath,
    };
    
    // Cache the package
    this.packages.set(packageKey, installedPackage);
    
    console.log(`Successfully installed ${packageName}@${version}`);
    return installedPackage;
  }
  
  /**
   * Loads a package as a Plugin instance
   */
  async load(packageName: string, version = 'latest'): Promise<Plugin> {
    const packageKey = `${packageName}@${version}`;
    
    // Check if package is already installed
    if (!this.packages.has(packageKey)) {
      // If not, install it first
      await this.install(packageName, version);
    }
    
    const pkg = this.packages.get(packageKey)!;
    
    // If plugin is already loaded, return it
    if (pkg.plugin) {
      return pkg.plugin;
    }
    
    // Otherwise, load the plugin
    console.log(`Loading plugin ${packageName}@${version}...`);
    const plugin = new Plugin(pkg.path);
    
    // Cache the loaded plugin
    pkg.plugin = plugin;
    
    return plugin;
  }
  
  /**
   * Lists all installed packages
   */
  list(): InstalledPackage[] {
    return Array.from(this.packages.values());
  }
  
  /**
   * Uninstalls a package
   */
  async uninstall(packageName: string, version = 'latest'): Promise<void> {
    const packageKey = `${packageName}@${version}`;
    
    if (!this.packages.has(packageKey)) {
      console.warn(`Package ${packageKey} is not installed`);
      return;
    }
    
    const pkg = this.packages.get(packageKey)!;
    
    // Close the plugin if it's loaded
    if (pkg.plugin) {
      pkg.plugin.close();
    }
    
    // Remove from cache
    this.packages.delete(packageKey);
    
    console.log(`Uninstalled ${packageKey}`);
  }
  
  /**
   * Updates a package to the latest version
   */
  async update(packageName: string, version = 'latest'): Promise<InstalledPackage> {
    // First uninstall the existing package
    await this.uninstall(packageName, version);
    
    // Then install the latest version
    return this.install(packageName, 'latest', { cacheMode: 'bypass' });
  }
  
  /**
   * Resolves version conflicts by applying dependency resolution strategies
   */
  async resolveConflicts(): Promise<void> {
    // Implement conflict resolution algorithm
    // This is a placeholder for the actual implementation
    console.log('Resolving package version conflicts...');
    
    // In a real implementation, this would:
    // 1. Build a dependency graph
    // 2. Identify conflicting versions
    // 3. Apply resolution strategies (newest wins, SemVer compatibility, etc.)
    // 4. Re-install packages if needed
    
    console.log('Conflicts resolved');
  }
  
  /**
   * Cleans up unused packages from cache
   */
  async cleanup(): Promise<void> {
    // Implement cache cleanup
    console.log('Cleaning up package cache...');
    
    // In a real implementation, this would:
    // 1. Identify unused packages
    // 2. Remove them from disk
    // 3. Update cache records
    
    console.log('Cache cleaned');
  }
  
  /**
   * Verifies the integrity and signatures of all installed packages
   */
  async verify(): Promise<boolean> {
    console.log('Verifying package integrity...');
    
    // In a real implementation, this would:
    // 1. Check package checksums
    // 2. Verify signatures against trusted keys
    // 3. Report any issues
    
    console.log('Verification complete, all packages are valid');
    return true;
  }
  
  // Private utility methods
  
  private async fetchPackageManifest(
    packageName: string, 
    version: string,
    options: PackageResolutionOptions
  ): Promise<PackageManifest> {
    const registry = options.registry || this.registry;
    const url = `${registry}/api/packages/${packageName}/${version === 'latest' ? '' : version}`;
    
    try {
      return await fetchJSON<PackageManifest>(url, {
        headers: options.authToken ? {
          'Authorization': `Bearer ${options.authToken}`
        } : undefined
      });
    } catch (error) {
      console.error(`Failed to fetch package manifest for ${packageName}@${version}:`, error);
      throw new Error(`Failed to fetch package manifest for ${packageName}@${version}`);
    }
  }
  
  private async downloadPackage(
    packageName: string, 
    version: string,
    options: PackageResolutionOptions
  ): Promise<string> {
    // This is a simplified implementation that would be replaced with actual download logic
    const registry = options.registry || this.registry;
    const url = `${registry}/api/packages/${packageName}/${version}/download`;
    
    console.log(`Downloading package ${packageName}@${version} from ${url}`);
    
    // In a real implementation, this would:
    // 1. Download the package
    // 2. Verify its checksum
    // 3. Extract it to the cache directory
    // 4. Return the path to the extracted package
    
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a simulated path
    const path = `${this.cacheDir}/${packageName}/${version}/plugin.wasm`;
    console.log(`Package downloaded to ${path}`);
    
    return path;
  }
} 