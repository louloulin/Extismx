import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PublishPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Publish a Plugin</h1>
          <p className="text-muted-foreground">
            Share your Extism plugin with the community. Fill out the details below to publish your plugin to the registry.
          </p>
        </div>

        <Tabs defaultValue="upload" className="mb-8">
          <TabsList className="mb-4 grid grid-cols-2 w-[400px]">
            <TabsTrigger value="upload">Upload Plugin</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Upload Plugin Package</CardTitle>
                <CardDescription>
                  Upload your compiled WebAssembly plugin file (.wasm) along with metadata.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Plugin Name</Label>
                      <Input id="name" placeholder="my-awesome-plugin" />
                      <p className="text-sm text-muted-foreground">
                        Only lowercase letters, numbers, and hyphens.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input id="version" placeholder="1.0.0" />
                      <p className="text-sm text-muted-foreground">
                        Semantic versioning format (x.y.z).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="A brief description of your plugin's functionality" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="cpp">C/C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repository">Repository URL</Label>
                    <Input id="repository" placeholder="https://github.com/username/repo" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license">License</Label>
                    <Select>
                      <SelectTrigger id="license">
                        <SelectValue placeholder="Select license" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MIT">MIT</SelectItem>
                        <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
                        <SelectItem value="GPL-3.0">GPL 3.0</SelectItem>
                        <SelectItem value="BSD-3-Clause">BSD 3-Clause</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input id="keywords" placeholder="Comma-separated keywords (e.g. markdown, parser, util)" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Plugin File (.wasm)</Label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">WebAssembly file (.wasm)</p>
                        </div>
                        <input id="file" type="file" className="hidden" accept=".wasm" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="readme">README Content</Label>
                    <Textarea id="readme" className="min-h-[200px]" placeholder="# My Plugin&#10;&#10;Description and usage instructions for your plugin." />
                    <p className="text-sm text-muted-foreground">
                      Markdown format supported.
                    </p>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Save Draft</Button>
                <Button>Publish Plugin</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="create" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Create New Plugin</CardTitle>
                <CardDescription>
                  Start with a template and build your plugin from scratch.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="new-name">Plugin Name</Label>
                      <Input id="new-name" placeholder="my-awesome-plugin" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-language">Language</Label>
                      <Select>
                        <SelectTrigger id="new-language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="rust">Rust</SelectItem>
                          <SelectItem value="go">Go</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="cpp">C/C++</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Template</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="cursor-pointer border-2 border-primary">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Hello World</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">A simple starter plugin with basic functionality.</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Text Processor</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">Process and transform text input with various functions.</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">API Connector</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">Connect to external APIs and process responses.</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-description">Description</Label>
                    <Textarea id="new-description" placeholder="A brief description of your plugin's functionality" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Create Project</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-muted/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Publishing Guidelines</h2>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>All plugins must include proper documentation and usage examples.</li>
            <li>Plugin names must be unique and descriptive of their functionality.</li>
            <li>Ensure your plugin is properly tested before publishing.</li>
            <li>Include licensing information and specify any dependencies.</li>
            <li>By publishing, you agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 