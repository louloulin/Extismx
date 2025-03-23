import { PackageManifest, PackageResolutionOptions } from './package-manager';

interface DependencyNode {
  name: string;
  version: string;
  dependencies: Map<string, DependencyNode>;
  requiredBy: Set<DependencyNode>;
  manifest?: PackageManifest;
  isRoot?: boolean;
}

export class DependencyGraph {
  private nodes: Map<string, DependencyNode> = new Map();
  private rootNodes: Set<DependencyNode> = new Set();

  addNode(
    name: string,
    version: string,
    manifest?: PackageManifest,
    isRoot = false
  ): DependencyNode {
    const key = `${name}@${version}`;
    
    if (this.nodes.has(key)) {
      return this.nodes.get(key)!;
    }
    
    const node: DependencyNode = {
      name,
      version,
      dependencies: new Map(),
      requiredBy: new Set(),
      manifest,
      isRoot
    };
    
    this.nodes.set(key, node);
    
    if (isRoot) {
      this.rootNodes.add(node);
    }
    
    return node;
  }

  addDependency(
    parentName: string,
    parentVersion: string,
    childName: string,
    childVersion: string,
    childManifest?: PackageManifest
  ): void {
    const parentKey = `${parentName}@${parentVersion}`;
    const parent = this.nodes.get(parentKey);
    
    if (!parent) {
      throw new Error(`Parent node ${parentKey} not found`);
    }
    
    const child = this.addNode(childName, childVersion, childManifest);
    parent.dependencies.set(childName, child);
    child.requiredBy.add(parent);
  }

  getRootNodes(): DependencyNode[] {
    return Array.from(this.rootNodes);
  }

  getAllNodes(): DependencyNode[] {
    return Array.from(this.nodes.values());
  }

  getNode(name: string, version: string): DependencyNode | undefined {
    return this.nodes.get(`${name}@${version}`);
  }

  getVersions(packageName: string): string[] {
    return Array.from(this.nodes.values())
      .filter(node => node.name === packageName)
      .map(node => node.version);
  }
}

export class DependencyResolver {
  private graph: DependencyGraph = new DependencyGraph();
  
  /**
   * Build a dependency graph from root packages
   */
  async buildGraph(
    packages: Array<{ name: string; version: string; manifest: PackageManifest }>,
    options: PackageResolutionOptions = {}
  ): Promise<DependencyGraph> {
    this.graph = new DependencyGraph();
    
    // Add root packages
    for (const pkg of packages) {
      this.graph.addNode(pkg.name, pkg.version, pkg.manifest, true);
    }
    
    // Process dependencies recursively
    for (const pkg of packages) {
      await this.processDependencies(pkg.name, pkg.version, pkg.manifest, options, 0);
    }
    
    return this.graph;
  }
  
  /**
   * Recursively process dependencies and add them to the graph
   */
  private async processDependencies(
    packageName: string,
    version: string,
    manifest: PackageManifest,
    options: PackageResolutionOptions,
    depth: number
  ): Promise<void> {
    const maxDepth = options.maxDepth ?? 10;
    
    if (depth >= maxDepth) {
      console.warn(`Max dependency depth reached for ${packageName}@${version}`);
      return;
    }
    
    const dependencies = manifest.dependencies || {};
    
    for (const [depName, depVersionRange] of Object.entries(dependencies)) {
      // In a real implementation, we would resolve the version range to a specific version
      // For simplicity, we'll use the version range as-is
      const depVersion = depVersionRange;
      
      this.graph.addDependency(packageName, version, depName, depVersion);
      
      // Recursively process dependency's dependencies
      // In a real implementation, we would fetch the manifest from the registry
      // For now, we'll simulate an empty manifest
      const depManifest: PackageManifest = {
        name: depName,
        version: depVersion,
        description: `Dependency of ${packageName}`,
        language: 'typescript', // Assuming TypeScript as default
        main: 'index.wasm',
        exports: [],
        keywords: [],
        dependencies: {}
      };
      
      await this.processDependencies(depName, depVersion, depManifest, options, depth + 1);
    }
  }
  
  /**
   * Resolve version conflicts using a specified strategy
   */
  resolveConflicts(options: {
    strategy: 'newest' | 'oldest' | 'highest-required' | 'exact';
    preferredVersions?: Record<string, string>;
  } = { strategy: 'newest' }): Map<string, string> {
    const resolvedVersions = new Map<string, string>();
    const packageNames = new Set<string>();
    
    // Collect all unique package names
    for (const node of this.graph.getAllNodes()) {
      packageNames.add(node.name);
    }
    
    // Resolve version for each package
    for (const packageName of packageNames) {
      const versions = this.graph.getVersions(packageName);
      
      if (versions.length === 1) {
        // No conflict if only one version
        resolvedVersions.set(packageName, versions[0]);
        continue;
      }
      
      // Handle conflict based on strategy
      let selectedVersion: string;
      
      // Check if there's a preferred version specified
      if (options.preferredVersions && options.preferredVersions[packageName]) {
        selectedVersion = options.preferredVersions[packageName];
      } else {
        switch (options.strategy) {
          case 'newest':
            // Simple implementation: assume semver format and sort
            selectedVersion = versions.sort((a, b) => {
              return this.compareVersions(b, a); // Descending order
            })[0];
            break;
            
          case 'oldest':
            selectedVersion = versions.sort((a, b) => {
              return this.compareVersions(a, b); // Ascending order
            })[0];
            break;
            
          case 'highest-required':
            // Select the version that is required by the most packages
            const versionRequiredCounts = new Map<string, number>();
            
            for (const version of versions) {
              const node = this.graph.getNode(packageName, version);
              if (node) {
                versionRequiredCounts.set(version, node.requiredBy.size);
              }
            }
            
            selectedVersion = versions.sort((a, b) => {
              return (versionRequiredCounts.get(b) || 0) - (versionRequiredCounts.get(a) || 0);
            })[0];
            break;
            
          case 'exact':
            // In the 'exact' strategy, we keep all versions
            // This is handled differently - we'll add a version suffix to the package name
            for (const version of versions) {
              resolvedVersions.set(`${packageName}#${version}`, version);
            }
            continue;
            
          default:
            throw new Error(`Unknown resolution strategy: ${options.strategy}`);
        }
      }
      
      resolvedVersions.set(packageName, selectedVersion);
    }
    
    return resolvedVersions;
  }
  
  /**
   * Generate an optimized installation plan based on the resolved dependencies
   */
  generateInstallationPlan(resolvedVersions: Map<string, string>): Array<{ name: string; version: string; }> {
    const installationPlan: Array<{ name: string; version: string; }> = [];
    const visited = new Set<string>();
    
    // Sort by dependency order (bottom-up)
    const nodes = this.sortNodesByDependencyOrder();
    
    for (const node of nodes) {
      const { name } = node;
      const version = resolvedVersions.get(name);
      
      if (!version) continue;
      
      const key = `${name}@${version}`;
      if (visited.has(key)) continue;
      
      installationPlan.push({ name, version });
      visited.add(key);
    }
    
    return installationPlan;
  }
  
  /**
   * Sort nodes in topological order
   */
  private sortNodesByDependencyOrder(): DependencyNode[] {
    const sorted: DependencyNode[] = [];
    const visited = new Set<string>();
    
    const visit = (node: DependencyNode) => {
      const key = `${node.name}@${node.version}`;
      
      if (visited.has(key)) return;
      visited.add(key);
      
      for (const dep of node.dependencies.values()) {
        visit(dep);
      }
      
      sorted.push(node);
    };
    
    // Start with root nodes
    for (const root of this.graph.getRootNodes()) {
      visit(root);
    }
    
    return sorted;
  }
  
  /**
   * Simple semver comparison
   */
  private compareVersions(versionA: string, versionB: string): number {
    // Simple implementation - split by dots and compare each part
    const partsA = versionA.split('.').map(part => parseInt(part, 10) || 0);
    const partsB = versionB.split('.').map(part => parseInt(part, 10) || 0);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const partA = partsA[i] || 0;
      const partB = partsB[i] || 0;
      
      if (partA !== partB) {
        return partA - partB;
      }
    }
    
    return 0;
  }
} 