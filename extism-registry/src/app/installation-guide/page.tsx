import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Installation Guide | Extism Plugin Registry',
  description: 'Learn how to install and use Extism plugins in your projects',
};

export default function InstallationGuidePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Extism Installation Guide</h1>
          <p className="text-muted-foreground text-lg">
            Get started with Extism plugins in your project. Follow these simple steps to install and use plugins from the registry.
          </p>
        </div>

        <Tabs defaultValue="quickstart">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="cli">CLI Installation</TabsTrigger>
            <TabsTrigger value="languages">Language SDKs</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
                <CardDescription>
                  The fastest way to get started with Extism plugins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Step 1: Install the Extism CLI</h3>
                  <div className="bg-muted p-4 rounded-md overflow-auto">
                    <code>curl -fsSL https://get.extism.org/cli | sh</code>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Step 2: Install a plugin</h3>
                  <div className="bg-muted p-4 rounded-md overflow-auto">
                    <code>extism plugin install hello-plugin</code>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Step 3: Run the plugin</h3>
                  <div className="bg-muted p-4 rounded-md overflow-auto">
                    <code>extism call hello-plugin greet --input "World"</code>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md">
                  <h4 className="font-medium">That's it!</h4>
                  <p>You've successfully installed and run your first Extism plugin.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/docs/getting-started">
                  <Button variant="outline">Read complete documentation</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="cli" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CLI Installation</CardTitle>
                <CardDescription>
                  Install and manage Extism plugins using the command-line interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Installation</h3>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Linux/macOS</h4>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <code>curl -fsSL https://get.extism.org/cli | sh</code>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Windows</h4>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <code>iwr -useb https://get.extism.org/cli | iex</code>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">With Homebrew</h4>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <code>brew install extism</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Commands</h3>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Search for plugins</h4>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <code>extism search markdown</code>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Install a plugin</h4>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <code>extism plugin install json-validator@1.0.0</code>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">List installed plugins</h4>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <code>extism plugin list</code>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Update plugins</h4>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <code>extism plugin update --all</code>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/docs/cli">
                  <Button variant="outline">View CLI Documentation</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="languages" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Language SDKs</CardTitle>
                <CardDescription>
                  Install and use Extism plugins in your programming language of choice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">TypeScript/JavaScript</h3>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <code>npm install @extism/js</code>
                    </div>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <pre className="text-sm">
{`import { Plugin } from '@extism/js';

// Load a plugin
const plugin = new Plugin('path/to/plugin.wasm');

// Call a function
const result = await plugin.call('function_name', input);
console.log(result.string());`}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Python</h3>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <code>pip install extism</code>
                    </div>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <pre className="text-sm">
{`from extism import Plugin

# Load a plugin
plugin = Plugin('path/to/plugin.wasm')

# Call a function
result = plugin.call('function_name', b'input')
print(result.decode())`}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Go</h3>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <code>go get github.com/extism/go-sdk</code>
                    </div>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <pre className="text-sm">
{`import "github.com/extism/go-sdk"

// Load a plugin
plugin, err := extism.NewPlugin('path/to/plugin.wasm', nil)
if err != nil {
  panic(err)
}

// Call a function
result, err := plugin.Call("function_name", []byte("input"))
if err != nil {
  panic(err)
}
fmt.Println(string(result))`}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Rust</h3>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <code>cargo add extism</code>
                    </div>
                    <div className="bg-muted p-4 rounded-md overflow-auto">
                      <pre className="text-sm">
{`use extism::*;

// Load a plugin
let plugin = Plugin::new("path/to/plugin.wasm", None).unwrap();

// Call a function
let result = plugin.call("function_name", b"input").unwrap();
println!("{}", String::from_utf8_lossy(&result));`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/docs/sdks">
                  <Button variant="outline">View SDK Documentation</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Usage</CardTitle>
                <CardDescription>
                  Advanced techniques for working with Extism plugins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Plugin Configuration</h3>
                  <p>Configure plugin behavior with manifest files:</p>
                  <div className="bg-muted p-4 rounded-md overflow-auto">
                    <pre className="text-sm">
{`{
  "wasm": [
    { "path": "plugin.wasm" }
  ],
  "memory": {
    "max": 100
  },
  "config": {
    "timeout": 5000,
    "debug": true
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Host Functions</h3>
                  <p>Extend plugin capabilities with host functions:</p>
                  <div className="bg-muted p-4 rounded-md overflow-auto">
                    <pre className="text-sm">
{`// TypeScript example
import { Plugin, FunctionConfig } from '@extism/js';

const httpGet: FunctionConfig = {
  name: 'http_get',
  inputs: ['string'],
  outputs: ['string'],
  fn: (ctx, url) => {
    // Make HTTP request and return result
    const response = fetch(url.toString());
    return response.text();
  }
};

const plugin = new Plugin('path/to/plugin.wasm', {
  functions: [httpGet]
});`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Multi-Plugin Management</h3>
                  <p>Manage multiple plugins in a single application:</p>
                  <div className="bg-muted p-4 rounded-md overflow-auto">
                    <pre className="text-sm">
{`// Using the plugin registry for TypeScript
import { PluginRegistry } from '@extism/js';

const registry = new PluginRegistry();

// Register plugins with the registry
registry.register('json-validator', 'path/to/json-validator.wasm');
registry.register('markdown-parser', 'path/to/markdown-parser.wasm');

// Use plugins from the registry
const jsonPlugin = registry.get('json-validator');
const markdownPlugin = registry.get('markdown-parser');

// Call functions
const isValid = jsonPlugin.call('validate', jsonData).string() === 'true';
const html = markdownPlugin.call('to_html', markdownText).string();`}
                    </pre>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/docs/advanced">
                  <Button variant="outline">View Advanced Documentation</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-10 space-y-6">
          <h2 className="text-2xl font-bold">Need More Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Browse our comprehensive documentation for detailed guides and examples.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/docs">View Documentation</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Join our community forums to ask questions and share your experiences.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/community">Join Community</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Explore example projects and tutorials to help you get started.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/examples">View Examples</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 