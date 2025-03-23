import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "@/components/ui/search";

// 模拟的插件数据
const mockPlugins = [
  {
    id: '1',
    name: 'hello-plugin',
    description: 'A simple hello world plugin for demonstration',
    language: 'typescript',
    version: '1.0.0',
    downloads: 1254,
    author: 'extism-team'
  },
  {
    id: '2',
    name: 'markdown-parser',
    description: 'Parse and render markdown content',
    language: 'rust',
    version: '0.2.3',
    downloads: 875,
    author: 'rust-developer'
  },
  {
    id: '3',
    name: 'image-processor',
    description: 'Process and optimize images with WebAssembly',
    language: 'go',
    version: '1.1.2',
    downloads: 2145,
    author: 'wasm-expert'
  },
  {
    id: '4',
    name: 'data-validator',
    description: 'Validate data formats and structures',
    language: 'python',
    version: '0.5.0',
    downloads: 732,
    author: 'py-coder'
  },
  {
    id: '5',
    name: 'crypto-tools',
    description: 'Cryptographic utilities for secure applications',
    language: 'cpp',
    version: '2.0.1',
    downloads: 1823,
    author: 'security-dev'
  }
];

// 语言标签颜色映射
const languageColors: Record<string, string> = {
  typescript: 'bg-blue-100 text-blue-800',
  rust: 'bg-orange-100 text-orange-800',
  go: 'bg-cyan-100 text-cyan-800',
  python: 'bg-green-100 text-green-800',
  cpp: 'bg-purple-100 text-purple-800'
};

export default function PackagesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-6 mb-8">
        <h1 className="text-3xl font-bold">Available Plugins</h1>
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <p className="text-muted-foreground">
            Discover and explore Extism plugins from our community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Search />
            
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="cpp">C/C++</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPlugins.map(plugin => (
          <Card key={plugin.id} className="flex flex-col">
            <CardHeader>
              <Link href={`/packages/${plugin.name}`}>
                <CardTitle className="hover:text-blue-600">{plugin.name}</CardTitle>
              </Link>
              <CardDescription>{plugin.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex justify-between items-center">
                <span className={`${languageColors[plugin.language]} px-3 py-1 rounded-full text-sm`}>
                  {plugin.language}
                </span>
                <span className="text-sm text-muted-foreground">v{plugin.version}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
              <span>By {plugin.author}</span>
              <span>{plugin.downloads.toLocaleString()} downloads</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 