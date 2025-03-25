/**
 * Plugin Documentation Generator
 * 
 * Generates documentation for plugins in various formats based on their manifests.
 * Supports Markdown, HTML, and JSON formats.
 */

import { logger } from '../utils/logging';
import { Plugin, PluginMetadata } from './types';

/**
 * Documentation format options
 */
export enum DocFormat {
  MARKDOWN = 'markdown',
  HTML = 'html',
  JSON = 'json'
}

/**
 * Documentation generation options
 */
export interface DocGenerationOptions {
  /**
   * Format of the generated documentation
   */
  format: DocFormat;
  
  /**
   * Whether to include code examples
   */
  includeExamples?: boolean;
  
  /**
   * Whether to include dependency information
   */
  includeDependencies?: boolean;
  
  /**
   * Whether to include usage instructions
   */
  includeUsage?: boolean;
  
  /**
   * CSS theme for HTML format
   */
  theme?: 'light' | 'dark' | 'custom';
  
  /**
   * Custom CSS for HTML format
   */
  customCss?: string;
}

/**
 * Template for code examples by language
 */
const codeExampleTemplates: Record<string, (pluginName: string, exportName: string) => string> = {
  typescript: (pluginName, exportName) => `
import { Plugin } from '@extism/extism';

async function example() {
  // Initialize plugin
  const plugin = new Plugin('/path/to/${pluginName}.wasm');
  
  // Call the function
  const input = { /* function input */ };
  const result = await plugin.call('${exportName}', JSON.stringify(input));
  
  // Process the result
  const output = JSON.parse(result.toString());
  console.log(output);
}
`,
  python: (pluginName, exportName) => `
from extism import Plugin

def example():
    # Initialize plugin
    plugin = Plugin('/path/to/${pluginName}.wasm')
    
    # Call the function
    input_data = { /* function input */ }
    result = plugin.call('${exportName}', bytes(str(input_data), 'utf-8'))
    
    # Process the result
    output = result.decode('utf-8')
    print(output)
`,
  rust: (pluginName, exportName) => `
use extism::{Context, Plugin};

fn example() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize plugin
    let ctx = Context::new();
    let plugin = ctx.plugin("/path/to/${pluginName}.wasm", None, false)?;
    
    // Call the function
    let input = r#"{ /* function input */ }"#;
    let result = plugin.call("${exportName}", input.as_bytes())?;
    
    // Process the result
    let output = String::from_utf8(result.to_vec())?;
    println!("{}", output);
    
    Ok(())
}
`
};

/**
 * Generates documentation for plugins
 */
export class DocGenerator {
  /**
   * Creates a new documentation generator
   */
  constructor() {
    logger.info('Documentation generator initialized');
  }
  
  /**
   * Generates documentation for a plugin
   */
  generate(
    plugin: Plugin | PluginMetadata,
    options: DocGenerationOptions
  ): string {
    logger.info(`Generating ${options.format} documentation for plugin: ${this.getPluginName(plugin)}`);
    
    const metadata = 'metadata' in plugin ? plugin.metadata : plugin;
    
    switch (options.format) {
      case DocFormat.MARKDOWN:
        return this.generateMarkdown(metadata, options);
      case DocFormat.HTML:
        return this.generateHtml(metadata, options);
      case DocFormat.JSON:
        return this.generateJson(metadata, options);
      default:
        throw new Error(`Unsupported documentation format: ${options.format}`);
    }
  }
  
  /**
   * Generates Markdown documentation
   */
  private generateMarkdown(
    metadata: PluginMetadata,
    options: DocGenerationOptions
  ): string {
    let doc = '';
    
    // Title
    doc += `# ${metadata.name}\n\n`;
    
    // Version and other metadata
    doc += `**Version:** ${metadata.version}\n\n`;
    
    if (metadata.description) {
      doc += `${metadata.description}\n\n`;
    }
    
    // Author info
    if (metadata.author) {
      doc += `**Author:** ${metadata.author}\n\n`;
    }
    
    // License
    if (metadata.license) {
      doc += `**License:** ${metadata.license}\n\n`;
    }
    
    // Tags/Keywords
    if (metadata.tags && metadata.tags.length > 0) {
      doc += `**Tags:** ${metadata.tags.join(', ')}\n\n`;
    }
    
    // Functions/Exports
    if (metadata.exports && metadata.exports.length > 0) {
      doc += `## Functions\n\n`;
      
      metadata.exports.forEach(exp => {
        doc += `### \`${exp.name}\`\n\n`;
        
        if (exp.description) {
          doc += `${exp.description}\n\n`;
        }
        
        // Input parameters
        if (exp.inputs && exp.inputs.length > 0) {
          doc += `#### Input Parameters\n\n`;
          doc += `| Name | Type | Description | Required |\n`;
          doc += `|------|------|-------------|----------|\n`;
          
          exp.inputs.forEach(input => {
            doc += `| ${input.name} | ${input.type} | ${input.description || ''} | ${input.optional ? 'No' : 'Yes'} |\n`;
          });
          
          doc += `\n`;
        }
        
        // Output parameters
        if (exp.outputs && exp.outputs.length > 0) {
          doc += `#### Return Values\n\n`;
          doc += `| Name | Type | Description |\n`;
          doc += `|------|------|-------------|\n`;
          
          exp.outputs.forEach(output => {
            doc += `| ${output.name} | ${output.type} | ${output.description || ''} |\n`;
          });
          
          doc += `\n`;
        }
        
        // Code examples
        if (options.includeExamples && metadata.language) {
          const templateFn = codeExampleTemplates[metadata.language];
          
          if (templateFn) {
            doc += `#### Example\n\n`;
            doc += '```' + metadata.language + '\n';
            doc += templateFn(metadata.name, exp.name);
            doc += '```\n\n';
          }
        }
      });
    }
    
    // Dependencies
    if (options.includeDependencies && metadata.dependencies) {
      doc += `## Dependencies\n\n`;
      
      const deps = Object.entries(metadata.dependencies);
      if (deps.length > 0) {
        doc += `| Package | Version |\n`;
        doc += `|---------|----------|\n`;
        
        deps.forEach(([name, version]) => {
          doc += `| ${name} | ${version} |\n`;
        });
        
        doc += `\n`;
      } else {
        doc += `No dependencies.\n\n`;
      }
    }
    
    // Usage instructions
    if (options.includeUsage) {
      doc += `## Usage\n\n`;
      doc += `To use this plugin, you need to load it using the Extism SDK for your language.\n\n`;
      
      doc += `### Installation\n\n`;
      doc += `You can install this plugin from the registry:\n\n`;
      doc += '```bash\n';
      doc += `extism-registry install ${metadata.name}@${metadata.version}\n`;
      doc += '```\n\n';
      
      doc += `Or manually download the WASM file and load it in your application.\n\n`;
    }
    
    return doc;
  }
  
  /**
   * Generates HTML documentation
   */
  private generateHtml(
    metadata: PluginMetadata,
    options: DocGenerationOptions
  ): string {
    const markdown = this.generateMarkdown(metadata, options);
    
    // Basic HTML template with CSS
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.name} - Plugin Documentation</title>
  <style>
    ${this.getHtmlStyles(options)}
  </style>
</head>
<body>
  <div class="container">
    ${this.markdownToHtml(markdown)}
  </div>
</body>
</html>`;
    
    return html;
  }
  
  /**
   * Generates JSON documentation
   */
  private generateJson(
    metadata: PluginMetadata,
    options: DocGenerationOptions
  ): string {
    const doc: any = {
      name: metadata.name,
      version: metadata.version,
      description: metadata.description,
      author: metadata.author,
      license: metadata.license,
      language: metadata.language,
      tags: metadata.tags,
      repository: metadata.repository,
      homepage: metadata.homepage,
      functions: []
    };
    
    // Add functions
    if (metadata.exports) {
      doc.functions = metadata.exports.map(exp => {
        const func: any = {
          name: exp.name,
          description: exp.description,
          inputs: exp.inputs,
          outputs: exp.outputs
        };
        
        // Add code examples if requested
        if (options.includeExamples && metadata.language) {
          const templateFn = codeExampleTemplates[metadata.language];
          
          if (templateFn) {
            func.example = templateFn(metadata.name, exp.name);
          }
        }
        
        return func;
      });
    }
    
    // Add dependencies if requested
    if (options.includeDependencies) {
      doc.dependencies = metadata.dependencies || {};
    }
    
    return JSON.stringify(doc, null, 2);
  }
  
  /**
   * Gets plugin name from plugin or metadata
   */
  private getPluginName(plugin: Plugin | PluginMetadata): string {
    if ('metadata' in plugin) {
      return plugin.metadata.name;
    }
    
    return plugin.name;
  }
  
  /**
   * Converts Markdown to HTML
   * Simple implementation - a real implementation would use a proper Markdown parser
   */
  private markdownToHtml(markdown: string): string {
    // This is a very simple converter - in a real implementation, use a
    // dedicated Markdown library for proper conversion
    let html = markdown;
    
    // Convert headings
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
    
    // Convert bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic text
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Convert inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Convert tables
    html = html.replace(/\n\|(.*?)\|\n\|([-|]*)\|\n([\s\S]*?)\n\n/g, (match, header, separator, rows) => {
      const headerCells = header.split('|').map(cell => cell.trim());
      const rowsList = rows.trim().split('\n');
      
      let tableHtml = '<table><thead><tr>';
      headerCells.forEach(cell => {
        tableHtml += `<th>${cell}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      
      rowsList.forEach(row => {
        tableHtml += '<tr>';
        const cells = row.split('|').map(cell => cell.trim());
        cells.forEach(cell => {
          tableHtml += `<td>${cell}</td>`;
        });
        tableHtml += '</tr>';
      });
      
      tableHtml += '</tbody></table>';
      return tableHtml;
    });
    
    // Convert paragraphs (needs to be after tables)
    html = html.replace(/\n\n([^<].*?)\n\n/gs, '\n\n<p>$1</p>\n\n');
    
    return html;
  }
  
  /**
   * Gets CSS styles for HTML documentation
   */
  private getHtmlStyles(options: DocGenerationOptions): string {
    if (options.customCss) {
      return options.customCss;
    }
    
    const theme = options.theme || 'light';
    
    // Basic styles for light and dark themes
    if (theme === 'light') {
      return `
        :root {
          --bg-color: #ffffff;
          --text-color: #333333;
          --heading-color: #0f172a;
          --link-color: #2563eb;
          --border-color: #e5e7eb;
          --code-bg: #f1f5f9;
          --table-header-bg: #f8fafc;
        }
        
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: var(--text-color);
          background-color: var(--bg-color);
          margin: 0;
          padding: 0;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h1, h2, h3, h4 {
          color: var(--heading-color);
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        
        h1 {
          font-size: 2.5rem;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 0.5rem;
        }
        
        h2 {
          font-size: 1.8rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.3rem;
        }
        
        h3 {
          font-size: 1.4rem;
        }
        
        h4 {
          font-size: 1.2rem;
        }
        
        p {
          margin-bottom: 1.5rem;
        }
        
        code {
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          background-color: var(--code-bg);
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-size: 0.9em;
        }
        
        pre {
          background-color: var(--code-bg);
          padding: 1rem;
          border-radius: 5px;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        pre code {
          background-color: transparent;
          padding: 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        
        th, td {
          padding: 0.75rem;
          text-align: left;
          border: 1px solid var(--border-color);
        }
        
        th {
          background-color: var(--table-header-bg);
          font-weight: 600;
        }
        
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
      `;
    } else if (theme === 'dark') {
      return `
        :root {
          --bg-color: #111827;
          --text-color: #e5e7eb;
          --heading-color: #f3f4f6;
          --link-color: #60a5fa;
          --border-color: #374151;
          --code-bg: #1f2937;
          --table-header-bg: #1e293b;
        }
        
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: var(--text-color);
          background-color: var(--bg-color);
          margin: 0;
          padding: 0;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h1, h2, h3, h4 {
          color: var(--heading-color);
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        
        h1 {
          font-size: 2.5rem;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 0.5rem;
        }
        
        h2 {
          font-size: 1.8rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.3rem;
        }
        
        h3 {
          font-size: 1.4rem;
        }
        
        h4 {
          font-size: 1.2rem;
        }
        
        p {
          margin-bottom: 1.5rem;
        }
        
        code {
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          background-color: var(--code-bg);
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-size: 0.9em;
        }
        
        pre {
          background-color: var(--code-bg);
          padding: 1rem;
          border-radius: 5px;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        pre code {
          background-color: transparent;
          padding: 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        
        th, td {
          padding: 0.75rem;
          text-align: left;
          border: 1px solid var(--border-color);
        }
        
        th {
          background-color: var(--table-header-bg);
          font-weight: 600;
        }
        
        tr:nth-child(even) {
          background-color: #262f3e;
        }
      `;
    }
    
    return '';
  }
} 