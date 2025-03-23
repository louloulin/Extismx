import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DocsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4 space-y-6">
          <div className="sticky top-20">
            <h2 className="text-xl font-bold mb-4">Documentation</h2>
            
            <div className="space-y-1">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Getting Started</h3>
              <nav className="flex flex-col space-y-1">
                <Link href="#introduction" className="text-sm hover:text-primary py-1">Introduction</Link>
                <Link href="#installation" className="text-sm hover:text-primary py-1">Installation</Link>
                <Link href="#quick-start" className="text-sm hover:text-primary py-1">Quick Start</Link>
              </nav>
            </div>
            
            <div className="space-y-1 mt-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Plugin Development</h3>
              <nav className="flex flex-col space-y-1">
                <Link href="#plugin-basics" className="text-sm hover:text-primary py-1">Plugin Basics</Link>
                <Link href="#typescript-pdk" className="text-sm hover:text-primary py-1">TypeScript PDK</Link>
                <Link href="#go-pdk" className="text-sm hover:text-primary py-1">Go PDK</Link>
                <Link href="#python-pdk" className="text-sm hover:text-primary py-1">Python PDK</Link>
                <Link href="#rust-pdk" className="text-sm hover:text-primary py-1">Rust PDK</Link>
                <Link href="#cpp-pdk" className="text-sm hover:text-primary py-1">C/C++ PDK</Link>
              </nav>
            </div>
            
            <div className="space-y-1 mt-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Registry</h3>
              <nav className="flex flex-col space-y-1">
                <Link href="#publishing" className="text-sm hover:text-primary py-1">Publishing Plugins</Link>
                <Link href="#versioning" className="text-sm hover:text-primary py-1">Versioning</Link>
                <Link href="#dependencies" className="text-sm hover:text-primary py-1">Dependencies</Link>
              </nav>
            </div>
            
            <div className="space-y-1 mt-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Integration</h3>
              <nav className="flex flex-col space-y-1">
                <Link href="#host-integration" className="text-sm hover:text-primary py-1">Host Integration</Link>
                <Link href="#mastra-integration" className="text-sm hover:text-primary py-1">Mastra Integration</Link>
                <Link href="#security" className="text-sm hover:text-primary py-1">Security</Link>
              </nav>
            </div>
            
            <div className="mt-8">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/api">API Reference</Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="md:w-3/4">
          <div className="space-y-12">
            <section id="introduction" className="scroll-mt-20">
              <h1 className="text-4xl font-bold mb-6">Extism Plugin Documentation</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Learn how to build, publish, and integrate Extism plugins.
              </p>
              
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p>
                      Extism is a framework for building and integrating portable WebAssembly plugins. This documentation will guide you through creating your own plugins, publishing them to the registry, and integrating them into host applications.
                    </p>
                    <p>
                      Plugins run in isolated WebAssembly sandboxes, providing security and portability across different environments. You can write plugins in TypeScript, Go, Python, Rust, or C/C++, allowing you to use your preferred language.
                    </p>
                    <p>
                      The Extism ecosystem includes:
                    </p>
                    <ul>
                      <li>Plugin Development Kits (PDKs) for multiple languages</li>
                      <li>A central registry for discovering and sharing plugins</li>
                      <li>Host SDKs for integration into applications</li>
                      <li>Mastra integration tools</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>
            
            <section id="installation" className="scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Installation</h2>
              
              <Tabs defaultValue="npm">
                <TabsList className="mb-4">
                  <TabsTrigger value="npm">npm</TabsTrigger>
                  <TabsTrigger value="go">Go</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                
                <TabsContent value="npm">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">NPM Installation</h3>
                      <p className="mb-4">Install the Extism PDK for TypeScript projects:</p>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">npm install @extism/pdk</code>
                      </pre>
                      
                      <p className="mt-6 mb-4">For host integration, install the SDK:</p>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">npm install @extism/sdk</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="go">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Go Installation</h3>
                      <p className="mb-4">Install the Extism PDK for Go projects:</p>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">go get github.com/extism/go-pdk</code>
                      </pre>
                      
                      <p className="mt-6 mb-4">For host integration, install the SDK:</p>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">go get github.com/extism/go-sdk</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="python">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Python Installation</h3>
                      <p className="mb-4">Install the Extism PDK for Python projects:</p>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">pip install extism-pdk</code>
                      </pre>
                      
                      <p className="mt-6 mb-4">For host integration, install the SDK:</p>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">pip install extism</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>
            
            <section id="quick-start" className="scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Quick Start</h2>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Create Your First Plugin</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">1. Initialize a new project</h4>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">mkdir hello-plugin && cd hello-plugin
npm init -y
npm install @extism/pdk</code>
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">2. Create a simple plugin</h4>
                      <p className="mb-2">Create a file named <code>plugin.ts</code>:</p>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">{`import { Host } from '@extism/pdk';

export function greet(name: string): string {
  // Get input as string
  const input = Host.inputString();
  
  // Return greeting
  return \`Hello, \${input || name}!\`;
}`}</code>
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">3. Build the plugin</h4>
                      <p className="mb-2">Configure your <code>package.json</code>:</p>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">{`{
  "scripts": {
    "build": "extism-js plugin.ts -o hello-plugin.wasm"
  }
}`}</code>
                      </pre>
                      <p className="mt-4 mb-2">Build the plugin:</p>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">npm run build</code>
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">4. Test your plugin</h4>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">{`import { Plugin } from '@extism/sdk';

(async () => {
  // Load the plugin
  const plugin = new Plugin('./hello-plugin.wasm');
  
  // Call the plugin
  const result = await plugin.call('greet', 'World');
  console.log(result.string()); // Outputs: Hello, World!
  
  // Clean up
  plugin.close();
})();`}</code>
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">5. Publish your plugin</h4>
                      <p>Once your plugin is ready, you can publish it to the Extism Registry to share with the community.</p>
                      <Button className="mt-2" asChild>
                        <Link href="/publish">Publish Your Plugin</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
            
            <section id="plugin-basics" className="scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Plugin Basics</h2>
              
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p>
                      Extism plugins are compiled WebAssembly modules with exports that can be called from host applications. They follow a few basic principles:
                    </p>
                    
                    <h3>Plugin Structure</h3>
                    <p>
                      A plugin consists of exported functions that can be called by the host. Each function can:
                    </p>
                    <ul>
                      <li>Accept input data from the host</li>
                      <li>Process the input using the plugin's logic</li>
                      <li>Return output data to the host</li>
                      <li>Access host-provided functions and resources</li>
                    </ul>
                    
                    <h3>Memory Management</h3>
                    <p>
                      Plugins run in an isolated WebAssembly sandbox with their own memory space. The PDK provides utilities for memory management, but it's important to understand how data is passed between the host and the plugin.
                    </p>
                    
                    <h3>Plugin Manifest</h3>
                    <p>
                      Each plugin has a manifest that describes:
                    </p>
                    <ul>
                      <li>Metadata (name, version, description)</li>
                      <li>Exported functions and their interfaces</li>
                      <li>Required host functions and capabilities</li>
                      <li>Dependencies on other plugins</li>
                    </ul>
                    
                    <h3>Plugin Lifecycle</h3>
                    <ul>
                      <li><strong>Development</strong>: Write plugin code using a PDK</li>
                      <li><strong>Compilation</strong>: Compile to WebAssembly</li>
                      <li><strong>Publishing</strong>: Publish to the registry</li>
                      <li><strong>Integration</strong>: Use in host applications</li>
                      <li><strong>Updates</strong>: Publish new versions with improvements</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>
            
            {/* 后续部分包含其他语言PDK的文档，可以按需展开 */}

            <section id="typescript-pdk" className="scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">TypeScript PDK</h2>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p>
                      The TypeScript PDK allows you to write Extism plugins using TypeScript or JavaScript. It provides a set of APIs for interacting with the host environment and managing memory.
                    </p>
                    
                    <h3 className="text-xl font-semibold">Core Concepts</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Host Module</h4>
                        <p className="text-muted-foreground">
                          The Host module provides functions for interacting with the host environment:
                        </p>
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto mt-2">
                          <code className="text-sm">{`import { Host } from '@extism/pdk';

// Get input from host
const input = Host.inputBytes();

// Store something in the key-value store
Host.setConfig("my-key", "my-value");

// Retrieve from key-value store
const value = Host.getConfig("my-key");`}</code>
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Memory Management</h4>
                        <p className="text-muted-foreground">
                          The PDK handles memory management automatically for most cases, but you can also work with memory directly:
                        </p>
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto mt-2">
                          <code className="text-sm">{`import { Memory } from '@extism/pdk';

// Allocate memory
const memory = new Memory(100);
memory.writeString("Hello");

// Free memory when done
memory.free();`}</code>
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">HTTP Functions</h4>
                        <p className="text-muted-foreground">
                          Plugins can make HTTP requests if allowed by the host:
                        </p>
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto mt-2">
                          <code className="text-sm">{`import { Http } from '@extism/pdk';

// Make an HTTP request
const response = Http.request({
  method: "GET",
  url: "https://api.example.com/data",
  headers: { "Accept": "application/json" }
});`}</code>
                        </pre>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-2">Example Plugin</h3>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">{`import { Host, Http, JSON } from '@extism/pdk';

// A function that fetches data from an API and processes it
export function fetchAndProcess(): string {
  // Get API URL from config
  const apiUrl = Host.getConfig("api_url");
  if (!apiUrl) {
    return JSON.stringify({ error: "API URL not configured" });
  }
  
  // Make HTTP request
  const response = Http.request({
    method: "GET",
    url: apiUrl,
    headers: { "Accept": "application/json" }
  });
  
  // Process the response
  if (response.status !== 200) {
    return JSON.stringify({ error: \`API error: \${response.status}\` });
  }
  
  // Parse JSON response
  const data = JSON.parse(response.body);
  
  // Do some processing...
  const processedData = {
    ...data,
    processedAt: new Date().toISOString(),
    count: data.items?.length || 0
  };
  
  // Return processed data
  return JSON.stringify(processedData);
}`}</code>
                      </pre>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" asChild>
                        <Link href="/api/typescript">TypeScript API Reference</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
            
            {/* 添加更多语言PDK的部分可以类似展开 */}
            
            <section id="publishing" className="scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Publishing Plugins</h2>
              
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p>
                      Once you've built your plugin, you can share it with the community by publishing it to the Extism Registry. This makes it discoverable and usable by others.
                    </p>
                    
                    <h3>Publishing Requirements</h3>
                    <p>Before publishing, ensure your plugin:</p>
                    <ul>
                      <li>Has a unique name in the registry namespace</li>
                      <li>Has a valid semantic version</li>
                      <li>Includes a clear description of functionality</li>
                      <li>Has proper documentation (README)</li>
                      <li>Specifies all dependencies</li>
                      <li>Includes license information</li>
                    </ul>
                    
                    <h3>Publishing Process</h3>
                    <p>You can publish your plugin using one of these methods:</p>
                    <ol>
                      <li>Using the web interface on the Extism Registry website</li>
                      <li>Using the Extism CLI tool</li>
                      <li>Using the Registry API</li>
                    </ol>
                    
                    <h3>Managing Releases</h3>
                    <p>
                      Once published, you can manage your plugin by:
                    </p>
                    <ul>
                      <li>Publishing updates with new versions</li>
                      <li>Adding or updating documentation</li>
                      <li>Responding to issues reported by users</li>
                      <li>Marking versions as deprecated when needed</li>
                    </ul>
                    
                    <div className="flex justify-center mt-6">
                      <Button asChild>
                        <Link href="/publish">Go to Publishing Page</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
            
            <section id="mastra-integration" className="scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Mastra Integration</h2>
              
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p>
                      Extism plugins can be seamlessly integrated with Mastra tools, allowing you to enhance and extend Mastra's functionality.
                    </p>
                    
                    <h3>Integration Methods</h3>
                    <p>
                      There are several ways to integrate Extism plugins with Mastra:
                    </p>
                    <ul>
                      <li><strong>Mastra Tool Extensions</strong> - Create plugins that extend Mastra's built-in tools</li>
                      <li><strong>Custom Tools</strong> - Build entirely new tools for the Mastra ecosystem</li>
                      <li><strong>Workflow Components</strong> - Create specialized components for Mastra workflows</li>
                      <li><strong>Data Processors</strong> - Build plugins that process and transform data within Mastra pipelines</li>
                    </ul>
                    
                    <h3>Mastra MCP Integration</h3>
                    <p>
                      Plugins can be integrated with Mastra's Multi-Component Platform (MCP):
                    </p>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto mb-4">
                      <code className="text-sm">{`import { createMastraTool } from '@mastra/tools';
import { Plugin } from '@extism/sdk';

// Create Mastra tool from Extism plugin
const myTool = createMastraTool({
  name: 'my-extism-tool',
  description: 'A custom tool powered by an Extism plugin',
  plugin: new Plugin('./my-plugin.wasm'),
  function: 'process', // Export to call in the plugin
  schema: {
    // Input schema definition
    input: {
      type: 'object',
      properties: {
        text: { type: 'string' }
      }
    },
    // Output schema definition
    output: {
      type: 'object',
      properties: {
        result: { type: 'string' }
      }
    }
  }
});`}</code>
                      </pre>
                    
                    <h3>Security Considerations</h3>
                    <p>
                      When integrating plugins with Mastra:
                    </p>
                    <ul>
                      <li>Only use plugins from trusted sources</li>
                      <li>Verify plugin signatures when available</li>
                      <li>Configure appropriate permissions for plugins</li>
                      <li>Consider what host capabilities are exposed to plugins</li>
                    </ul>
                    
                    <div className="flex justify-end mt-6">
                      <Button variant="outline" asChild>
                        <Link href="/guides/mastra-integration">Read Integration Guide</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}