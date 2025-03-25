/**
 * Dependency Graph Visualizer
 * 
 * Provides utilities for visualizing dependency graphs in various formats,
 * including ASCII tree, DOT format for Graphviz, and JSON for web-based visualizations.
 */

import { DependencyGraph, ResolvedDependency } from './dependency-resolver';
import { logger } from '../utils/logging';

/**
 * Options for dependency visualization
 */
export interface VisualizationOptions {
  /**
   * Maximum depth to display in the visualization
   */
  maxDepth?: number;
  
  /**
   * Whether to show version numbers
   */
  showVersions?: boolean;
  
  /**
   * Whether to show optional dependencies differently
   */
  distinguishOptional?: boolean;
  
  /**
   * Whether to highlight conflicting versions
   */
  highlightConflicts?: boolean;
}

/**
 * Visualizes dependency graphs in various formats
 */
export class DependencyVisualizer {
  /**
   * Creates a new instance of the dependency visualizer
   */
  constructor() {
    logger.info('Dependency visualizer initialized');
  }
  
  /**
   * Generates an ASCII tree representation of the dependency graph
   */
  toAsciiTree(
    graph: DependencyGraph,
    options: VisualizationOptions = {}
  ): string {
    const opts = {
      maxDepth: options.maxDepth ?? Infinity,
      showVersions: options.showVersions ?? true,
      distinguishOptional: options.distinguishOptional ?? true,
      highlightConflicts: options.highlightConflicts ?? true,
    };
    
    // Find conflicts if needed
    const conflicts = opts.highlightConflicts
      ? graph.findConflicts().reduce((map, conflict) => {
          map.set(conflict.name, conflict.versions);
          return map;
        }, new Map<string, string[]>())
      : new Map<string, string[]>();
    
    // Start building the tree with the root node
    let result = this.formatNode(graph.root, opts, conflicts) + '\n';
    
    // Recursively build the tree
    result += this.buildAsciiTree(graph.root, '', true, 0, opts, conflicts);
    
    return result;
  }
  
  /**
   * Generates a DOT format representation for Graphviz
   */
  toDot(
    graph: DependencyGraph,
    options: VisualizationOptions = {}
  ): string {
    const opts = {
      maxDepth: options.maxDepth ?? Infinity,
      showVersions: options.showVersions ?? true,
      distinguishOptional: options.distinguishOptional ?? true,
      highlightConflicts: options.highlightConflicts ?? true,
    };
    
    // Find conflicts if needed
    const conflicts = opts.highlightConflicts
      ? graph.findConflicts().reduce((map, conflict) => {
          map.set(conflict.name, conflict.versions);
          return map;
        }, new Map<string, string[]>())
      : new Map<string, string[]>();
    
    // Start building the DOT file
    let dot = 'digraph DependencyGraph {\n';
    dot += '  node [shape=box, style=filled, fillcolor=lightblue];\n';
    
    // Set conflicts to a different color if enabled
    if (opts.highlightConflicts) {
      dot += '  node [fillcolor=lightblue];\n';
    }
    
    // Track nodes to avoid duplicates
    const nodes = new Set<string>();
    const edges = new Set<string>();
    
    // Recursive function to add nodes and edges
    const addNodesAndEdges = (
      dep: ResolvedDependency,
      depth: number = 0
    ) => {
      if (depth > opts.maxDepth) return;
      
      // Create node ID
      const nodeId = `"${dep.name}${opts.showVersions ? '@' + dep.version : ''}"`;
      
      // Add node if it doesn't exist
      if (!nodes.has(nodeId)) {
        nodes.add(nodeId);
        
        // Change node color if it's a conflicting package
        if (opts.highlightConflicts && conflicts.has(dep.name)) {
          dot += `  ${nodeId} [fillcolor=lightsalmon];\n`;
        }
      }
      
      // Add edges to dependencies
      for (const child of dep.dependencies) {
        const childId = `"${child.name}${opts.showVersions ? '@' + child.version : ''}"`;
        const edgeId = `${nodeId} -> ${childId}`;
        
        if (!edges.has(edgeId)) {
          edges.add(edgeId);
          dot += `  ${edgeId};\n`;
        }
        
        // Process child dependencies
        addNodesAndEdges(child, depth + 1);
      }
    };
    
    // Start with the root node
    addNodesAndEdges(graph.root);
    
    // Close the DOT file
    dot += '}\n';
    
    return dot;
  }
  
  /**
   * Generates a JSON representation for web-based visualizations
   */
  toJson(
    graph: DependencyGraph,
    options: VisualizationOptions = {}
  ): string {
    // Convert the graph to a JSON object with proper structure for visualization
    const jsonGraph = this.buildJsonGraph(graph.root, options);
    
    // Return the stringified JSON
    return JSON.stringify(jsonGraph, null, 2);
  }
  
  /**
   * Recursively builds a JSON object for visualization
   */
  private buildJsonGraph(
    node: ResolvedDependency,
    options: VisualizationOptions = {},
    depth: number = 0
  ): any {
    const opts = {
      maxDepth: options.maxDepth ?? Infinity,
      showVersions: options.showVersions ?? true,
    };
    
    // Stop recursion if max depth reached
    if (depth > opts.maxDepth) {
      return { name: '...', children: [] };
    }
    
    // Create label based on options
    const label = opts.showVersions
      ? `${node.name}@${node.version}`
      : node.name;
    
    // If no children or reached max depth, return a leaf node
    if (node.dependencies.length === 0) {
      return { name: label };
    }
    
    // Otherwise, build the children recursively
    return {
      name: label,
      children: node.dependencies.map(child =>
        this.buildJsonGraph(child, options, depth + 1)
      )
    };
  }
  
  /**
   * Recursively builds an ASCII tree representation
   */
  private buildAsciiTree(
    node: ResolvedDependency,
    prefix: string,
    isLast: boolean,
    depth: number,
    options: Required<VisualizationOptions>,
    conflicts: Map<string, string[]>
  ): string {
    // Stop recursion if max depth reached or no children
    if (depth >= options.maxDepth || node.dependencies.length === 0) {
      return '';
    }
    
    let result = '';
    
    // Process each child
    for (let i = 0; i < node.dependencies.length; i++) {
      const child = node.dependencies[i];
      const isLastChild = i === node.dependencies.length - 1;
      
      // Build the line prefix
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      
      // Add the child node
      result += prefix + (isLast ? '└── ' : '├── ') + this.formatNode(child, options, conflicts) + '\n';
      
      // Recursively add child's children
      result += this.buildAsciiTree(child, childPrefix, isLastChild, depth + 1, options, conflicts);
    }
    
    return result;
  }
  
  /**
   * Formats a node for display in the ASCII tree
   */
  private formatNode(
    node: ResolvedDependency,
    options: Required<VisualizationOptions>,
    conflicts: Map<string, string[]>
  ): string {
    let label = node.name;
    
    // Add version if needed
    if (options.showVersions) {
      label += `@${node.version}`;
    }
    
    // Highlight conflicts if needed
    if (options.highlightConflicts && conflicts.has(node.name)) {
      label = `*${label}*`;
    }
    
    return label;
  }
} 