"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "@/components/ui/search";
import { NativeSelect } from "@/components/ui/native-select";
import Link from "next/link";

interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  language: string;
  tags: string[];
  downloads: number;
  updated: string;
}

const plugins: Plugin[] = [
  {
    id: "1",
    name: "extism-http-client",
    description: "HTTP client for making requests from plugins",
    author: "Extism Team",
    version: "1.2.0",
    language: "typescript",
    tags: ["http", "client", "network"],
    downloads: 2403,
    updated: "3 days ago"
  },
  {
    id: "2",
    name: "extism-redis",
    description: "Redis client for Extism plugins",
    author: "Extism Community",
    version: "0.9.1",
    language: "rust",
    tags: ["database", "redis", "cache"],
    downloads: 1895,
    updated: "1 week ago"
  },
  {
    id: "3",
    name: "extism-image",
    description: "Image processing library for Extism",
    author: "ImageTools",
    version: "2.0.3",
    language: "go",
    tags: ["image", "processing", "graphics"],
    downloads: 3210,
    updated: "2 days ago"
  },
  {
    id: "4",
    name: "extism-ml",
    description: "Machine learning toolkit for Extism plugins",
    author: "AI Research Group",
    version: "0.5.0",
    language: "python",
    tags: ["ml", "ai", "machine-learning"],
    downloads: 1245,
    updated: "5 days ago"
  },
  {
    id: "5",
    name: "extism-crypto",
    description: "Cryptographic functions for Extism plugins",
    author: "Security Team",
    version: "1.1.2",
    language: "rust",
    tags: ["crypto", "security", "encryption"],
    downloads: 2876,
    updated: "1 day ago"
  },
  {
    id: "6",
    name: "extism-pdf",
    description: "PDF generation and parsing for Extism",
    author: "Document Tools",
    version: "0.8.5",
    language: "cpp",
    tags: ["pdf", "document", "parsing"],
    downloads: 1654,
    updated: "4 days ago"
  }
];

const languageOptions = [
  { value: "all", label: "All Languages" },
  { value: "typescript", label: "TypeScript" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "python", label: "Python" },
  { value: "cpp", label: "C/C++" }
];

const sortOptions = [
  { value: "downloads", label: "Most Downloaded" },
  { value: "updated", label: "Recently Updated" },
  { value: "name", label: "Alphabetical" }
];

export default function PackagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [sortBy, setSortBy] = useState("downloads");
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>(plugins);
  
  // 高级搜索处理函数
  useEffect(() => {
    let results = [...plugins];
    
    // 基于搜索词过滤
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(plugin => 
        plugin.name.toLowerCase().includes(lowerSearchTerm) ||
        plugin.description.toLowerCase().includes(lowerSearchTerm) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // 基于语言过滤
    if (selectedLanguage !== "all") {
      results = results.filter(plugin => plugin.language === selectedLanguage);
    }
    
    // 基于选择的排序方式
    switch (sortBy) {
      case "downloads":
        results.sort((a, b) => b.downloads - a.downloads);
        break;
      case "updated":
        // 这里简化处理，实际应该使用日期比较
        results.sort((a, b) => a.updated.localeCompare(b.updated));
        break;
      case "name":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    setFilteredPlugins(results);
  }, [searchTerm, selectedLanguage, sortBy]);

  // 搜索处理函数
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  // 语言选择处理函数
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  // 排序处理函数
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div>
          <h1 className="text-3xl font-bold">Extism Packages</h1>
          <p className="text-muted-foreground mt-2">
            Discover and install plugins for your Extism projects
          </p>
        </div>
        <Link href="/publish">
          <Button variant="default">Publish Package</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <Search placeholder="Search packages..." onSearch={handleSearch} />
          </div>
          <div className="flex flex-1 gap-4">
            <div className="flex-1">
              <NativeSelect value={selectedLanguage} onChange={handleLanguageChange}>
                {languageOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex-1">
              <NativeSelect value={sortBy} onChange={handleSortChange}>
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </NativeSelect>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlugins.length > 0 ? (
            filteredPlugins.map(plugin => (
              <Link href={`/packages/${plugin.name}`} key={plugin.id}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plugin.name}</CardTitle>
                      <span className="text-sm bg-primary/10 text-primary py-1 px-2 rounded-full">
                        v{plugin.version}
                      </span>
                    </div>
                    <CardDescription>{plugin.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
                        {plugin.language}
                      </span>
                      <span>•</span>
                      <span>{plugin.downloads.toLocaleString()} downloads</span>
                      <span>•</span>
                      <span>Updated {plugin.updated}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {plugin.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="text-sm text-muted-foreground">
                      By {plugin.author}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium">No packages found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
        
        {filteredPlugins.length > 0 && (
          <div className="flex justify-center mt-8">
            <p className="text-muted-foreground">
              Showing {filteredPlugins.length} of {plugins.length} packages
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 