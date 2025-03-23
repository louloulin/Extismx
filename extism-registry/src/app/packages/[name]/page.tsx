"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InstallationSteps } from '@/components/ui/installation-steps';

// 模拟的插件数据，在实际应用中这会从API获取
const mockPlugins = [
  {
    id: '1',
    name: 'hello-plugin',
    description: 'A simple hello world plugin for demonstration',
    language: 'typescript',
    version: '1.0.0',
    downloads: 1254,
    author: 'extism-team',
    repository: 'https://github.com/extism/hello-plugin',
    license: 'MIT',
    versions: [
      { version: '1.0.0', date: '2023-12-10', changes: 'Initial release' },
      { version: '0.9.0', date: '2023-11-25', changes: 'Beta release with core functionality' },
      { version: '0.5.0', date: '2023-10-15', changes: 'Alpha version for testing' }
    ],
    dependencies: [
      { name: 'extism-pdk', version: '^1.0.0' },
      { name: 'typescript', version: '^5.0.0' }
    ],
    usage: [
      { language: 'typescript', code: `import { Plugin } from '@extism/sdk';\n\nconst plugin = new Plugin('./hello-plugin.wasm');\nconst result = await plugin.call('greet', 'World');\nconsole.log(result.string()); // Outputs: "Hello, World!"` },
      { language: 'python', code: `from extism import Plugin\n\nwith Plugin("./hello-plugin.wasm") as plugin:\n    result = plugin.call("greet", b"World")\n    print(result.decode()) # Outputs: Hello, World!` },
      { language: 'go', code: `package main\n\nimport (\n  "fmt"\n  "github.com/extism/go-sdk"\n)\n\nfunc main() {\n  plugin, _ := extism.NewPlugin("./hello-plugin.wasm", nil)\n  defer plugin.Close()\n  \n  result, _ := plugin.Call("greet", []byte("World"))\n  fmt.Println(string(result)) // Outputs: Hello, World!\n}` }
    ],
    readme: `# Hello Plugin

A simple plugin that demonstrates the basics of Extism plugin development.

## Features

- Simple "hello world" functionality
- Demonstrates basic Extism PDK usage
- Includes TypeScript type definitions

## Usage

\`\`\`typescript
import { Plugin } from '@extism/sdk';

// Create a new plugin instance
const plugin = new Plugin('./hello-plugin.wasm');

// Call the plugin with input
const result = await plugin.call('greet', 'World');
console.log(result.string()); // Outputs: "Hello, World!"
\`\`\`

## Development

To build this plugin:

\`\`\`bash
npm install
npm run build
\`\`\`

This will produce a WebAssembly file that can be used with any Extism host.`
  },
  // 其他插件...
];

// 语言选项卡颜色
const languageColors: Record<string, string> = {
  typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  python: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  go: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
};

export default function PackageDetailPage({ params }: { params: { name: string } }) {
  const [selectedLanguage, setSelectedLanguage] = useState<'typescript' | 'python' | 'go' | 'rust' | 'cpp'>('typescript');
  
  // 查找对应的插件数据
  const plugin = mockPlugins.find(p => p.name === params.name);
  
  // 如果找不到对应插件，返回404
  if (!plugin) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{plugin.name}</h1>
                  <Badge>{plugin.language}</Badge>
                  <span className="text-sm text-muted-foreground">v{plugin.version}</span>
                </div>
                <p className="mt-2 text-muted-foreground">{plugin.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={plugin.repository} target="_blank">
                    Repository
                  </Link>
                </Button>
                <Button size="sm">
                  Install
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{plugin.downloads.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{plugin.license}</div>
                    <p className="text-sm text-muted-foreground">License</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{plugin.author}</div>
                    <p className="text-sm text-muted-foreground">Author</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="readme">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="readme">README</TabsTrigger>
                <TabsTrigger value="installation">Installation</TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              </TabsList>
              
              <TabsContent value="readme" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose prose-gray max-w-none dark:prose-invert">
                      <h1>Hello Plugin</h1>
                      <p>This is a simple demonstration plugin for the Extism WebAssembly plugin framework.</p>
                      <h2>Features</h2>
                      <ul>
                        <li>Simple greeting function</li>
                        <li>Demonstrates basic Extism functionality</li>
                        <li>Cross-language compatibility</li>
                      </ul>
                      <h2>Usage</h2>
                      <p>
                        Import the plugin in your host application and call the <code>greet</code> function 
                        with a name to receive a personalized greeting.
                      </p>
                      <h2>API Reference</h2>
                      <h3>greet(name: string): string</h3>
                      <p>Returns a greeting message for the provided name.</p>
                      <p><strong>Example:</strong> <code>greet("World")</code> returns <code>"Hello, World!"</code></p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="installation" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Installation Steps</CardTitle>
                    <CardDescription>
                      Follow these steps to install and use {plugin.name} in your project
                    </CardDescription>
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        variant={selectedLanguage === 'typescript' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSelectedLanguage('typescript')}
                      >
                        TypeScript
                      </Button>
                      <Button 
                        variant={selectedLanguage === 'python' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSelectedLanguage('python')}
                      >
                        Python
                      </Button>
                      <Button 
                        variant={selectedLanguage === 'go' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSelectedLanguage('go')}
                      >
                        Go
                      </Button>
                      <Button 
                        variant={selectedLanguage === 'rust' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSelectedLanguage('rust')}
                      >
                        Rust
                      </Button>
                      <Button 
                        variant={selectedLanguage === 'cpp' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSelectedLanguage('cpp')}
                      >
                        C++
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <InstallationSteps language={selectedLanguage} pluginName={plugin.name} />
                  </CardContent>
                  <CardFooter>
                    <Link href="/installation-guide">
                      <Button variant="outline">View Full Installation Guide</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="versions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Version History</CardTitle>
                    <CardDescription>
                      Release history for {plugin.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plugin.versions.map((version, index) => (
                        <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">v{version.version}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {version.changes}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {version.date}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="dependencies" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dependencies</CardTitle>
                    <CardDescription>
                      Packages that {plugin.name} depends on
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plugin.dependencies.map((dep, index) => (
                        <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                          <div className="font-medium">{dep.name}</div>
                          <div className="text-sm text-muted-foreground">{dep.version}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm font-medium">With CLI:</div>
                  <div className="bg-muted p-2 rounded-md text-sm font-mono">
                    extism plugin install {plugin.name}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Import URL:</div>
                  <div className="bg-muted p-2 rounded-md text-sm font-mono break-all">
                    https://registry.extism.org/plugins/{plugin.name}/v{plugin.version}/plugin.wasm
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/installation-guide">
                    <Button variant="outline" className="w-full">View Installation Guide</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Related Plugins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPlugins
                    .filter(p => p.name !== plugin.name && p.language === plugin.language)
                    .slice(0, 3)
                    .map((relatedPlugin, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <Link href={`/packages/${relatedPlugin.name}`} className="font-medium hover:underline">
                          {relatedPlugin.name}
                        </Link>
                        <Badge variant="outline">v{relatedPlugin.version}</Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/packages" className="text-sm text-primary hover:underline">
                  View all packages
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 