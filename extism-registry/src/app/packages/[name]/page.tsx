import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  // 在实际应用中，这会是一个API调用
  const plugin = mockPlugins.find(p => p.name === params.name);
  
  if (!plugin) {
    notFound();
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{plugin.name}</h1>
                <Badge variant="outline" className="ml-2">v{plugin.version}</Badge>
              </div>
              <p className="text-muted-foreground">{plugin.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  {plugin.language}
                </Badge>
                <span className="text-sm text-muted-foreground">{plugin.downloads.toLocaleString()} downloads</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="sm" variant="secondary" asChild>
                <a href={plugin.repository} target="_blank" rel="noopener noreferrer">GitHub</a>
              </Button>
              <Button size="sm">Install</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">Version</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-semibold">{plugin.version}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">License</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-semibold">{plugin.license}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-semibold">{plugin.downloads.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="readme" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="readme">README</TabsTrigger>
              <TabsTrigger value="usage">Usage Examples</TabsTrigger>
              <TabsTrigger value="installation">Installation</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>
            <TabsContent value="readme" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {plugin.readme.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={i} className="text-xl font-semibold mt-4 mb-2">{line.substring(3)}</h2>;
                      } else if (line.startsWith('```')) {
                        return line.length > 3 ? 
                          <pre key={i} className="bg-muted p-4 rounded-md mt-2 mb-2 overflow-x-auto">
                            <code className="text-sm">{line.substring(3)}</code>
                          </pre> : 
                          <div key={i} className="mt-2 mb-2"></div>;
                      } else {
                        return <p key={i} className="my-2">{line}</p>;
                      }
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="usage" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
                  <Tabs defaultValue={plugin.usage[0].language}>
                    <TabsList className="mb-4">
                      {plugin.usage.map((example) => (
                        <TabsTrigger key={example.language} value={example.language}>
                          {example.language}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {plugin.usage.map((example) => (
                      <TabsContent key={example.language} value={example.language}>
                        <div className={`p-1 rounded-t-md ${languageColors[example.language]}`}>
                          <span className="text-xs font-medium px-2">{example.language}</span>
                        </div>
                        <pre className="bg-muted p-4 rounded-b-md overflow-x-auto">
                          <code className="text-sm whitespace-pre">{example.code}</code>
                        </pre>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="installation" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Installation Instructions</h3>
                  <div className="mb-4">
                    <p className="mb-2">Install using npm:</p>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                      <code className="text-sm">npm install {plugin.name}@{plugin.version}</code>
                    </pre>
                  </div>
                  <div>
                    <p className="mb-2">Or download directly:</p>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                      <code className="text-sm">curl -L https://registry.extism.org/plugins/{plugin.name}/download/{plugin.version} -o {plugin.name}.wasm</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="versions" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Version History</h3>
                  <div className="space-y-4">
                    {plugin.versions.map((version, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{version.version}</Badge>
                            <span className="text-sm text-muted-foreground">{version.date}</span>
                          </div>
                          <p className="text-sm">{version.changes}</p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plugin.dependencies.map((dep, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="font-medium">{dep.name}</span>
                    <Badge variant="secondary">{dep.version}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Author</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-primary">
                    {plugin.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{plugin.author}</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/authors/${plugin.author}`}>View Profile</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Related Plugins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="min-w-16 flex justify-center">golang</Badge>
                  <Link href="/packages/go-plugin" className="text-sm hover:underline">go-plugin</Link>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="min-w-16 flex justify-center">python</Badge>
                  <Link href="/packages/python-plugin" className="text-sm hover:underline">python-plugin</Link>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="min-w-16 flex justify-center">rust</Badge>
                  <Link href="/packages/rust-plugin" className="text-sm hover:underline">rust-plugin</Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 