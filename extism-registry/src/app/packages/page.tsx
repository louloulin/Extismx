"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SelectComponent from '../../components/ui/select';

// Mock data for demonstration
const mockPlugins = [
  {
    id: '1',
    name: 'http-client',
    description: 'A plugin for making HTTP requests from your applications',
    version: '1.2.0',
    language: 'typescript',
    author: 'extism-team',
    downloads: 12450,
    license: 'MIT',
  },
  {
    id: '2',
    name: 'sqlite-storage',
    description: 'Persistent storage plugin using SQLite',
    version: '0.9.5',
    language: 'rust',
    author: 'database-plugins',
    downloads: 8930,
    license: 'Apache-2.0',
  },
  {
    id: '3',
    name: 'image-processor',
    description: 'Fast image manipulation and processing',
    version: '2.1.1',
    language: 'go',
    author: 'media-tools',
    downloads: 5621,
    license: 'MIT',
  },
  {
    id: '4',
    name: 'markdown-parser',
    description: 'Parse and convert markdown to HTML',
    version: '1.0.3',
    language: 'typescript',
    author: 'content-tools',
    downloads: 3457,
    license: 'MIT',
  },
  {
    id: '5',
    name: 'pdf-generator',
    description: 'Generate PDF documents from templates',
    version: '0.7.2',
    language: 'python',
    author: 'document-utils',
    downloads: 2890,
    license: 'BSD-3-Clause',
  },
  {
    id: '6',
    name: 'json-validator',
    description: 'Validate JSON against schemas',
    version: '3.0.1',
    language: 'rust',
    author: 'schema-tools',
    downloads: 9876,
    license: 'MIT',
  },
  {
    id: '7',
    name: 'ml-classifier',
    description: 'Machine learning classification models',
    version: '0.5.0',
    language: 'python',
    author: 'ai-plugins',
    downloads: 1543,
    license: 'Apache-2.0',
  },
  {
    id: '8',
    name: 'crypto-utils',
    description: 'Cryptographic utilities and functions',
    version: '2.3.0',
    language: 'go',
    author: 'security-tools',
    downloads: 7654,
    license: 'MIT',
  },
  {
    id: '9',
    name: 'template-engine',
    description: 'Flexible templating engine for text processing',
    version: '1.1.4',
    language: 'typescript',
    author: 'template-systems',
    downloads: 4567,
    license: 'MIT',
  },
  {
    id: '10',
    name: 'audio-processor',
    description: 'Audio processing and manipulation plugin',
    version: '0.8.1',
    language: 'cpp',
    author: 'media-tools',
    downloads: 2345,
    license: 'MPL-2.0',
  },
];

export default function PluginsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('downloads');
  const [filteredPlugins, setFilteredPlugins] = useState(mockPlugins);
  const [expandedSearch, setExpandedSearch] = useState(false);
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [minDownloads, setMinDownloads] = useState(0);

  // Language options
  const languages = [
    { value: 'all', label: 'All Languages' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'rust', label: 'Rust' },
    { value: 'go', label: 'Go' },
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'C/C++' },
  ];

  // License options
  const licenses = [
    { value: 'all', label: 'All Licenses' },
    { value: 'MIT', label: 'MIT' },
    { value: 'Apache-2.0', label: 'Apache 2.0' },
    { value: 'BSD-3-Clause', label: 'BSD 3-Clause' },
    { value: 'MPL-2.0', label: 'Mozilla Public License 2.0' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'downloads', label: 'Downloads' },
    { value: 'name', label: 'Name' },
    { value: 'version', label: 'Version' },
    { value: 'recent', label: 'Recently Updated' },
  ];

  useEffect(() => {
    // Filter plugins based on search term, language, license, and downloads
    let results = mockPlugins;
    
    if (searchTerm) {
      results = results.filter(plugin => 
        plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedLanguage !== 'all') {
      results = results.filter(plugin => plugin.language === selectedLanguage);
    }

    if (licenseFilter !== 'all') {
      results = results.filter(plugin => plugin.license === licenseFilter);
    }

    if (minDownloads > 0) {
      results = results.filter(plugin => plugin.downloads >= minDownloads);
    }
    
    // Sort results
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'version':
          return b.version.localeCompare(a.version);
        case 'recent':
          // This would normally use dates, but we're using mock data
          return parseInt(b.id) - parseInt(a.id);
        case 'downloads':
        default:
          return b.downloads - a.downloads;
      }
    });
    
    setFilteredPlugins(results);
  }, [searchTerm, selectedLanguage, sortBy, licenseFilter, minDownloads]);

  function getLanguageBadge(language: string) {
    const colorMap: Record<string, string> = {
      typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      rust: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      go: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      python: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cpp: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    
    return (
      <Badge variant="outline" className={`${colorMap[language] || ''}`}>
        {language}
      </Badge>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Extism Plugins</h1>
          <p className="text-muted-foreground">
            Discover and install plugins for your Extism applications
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/publish">Publish a Plugin</Link>
        </Button>
      </div>

      <div className="mb-8 bg-card p-4 rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search plugins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <SelectComponent
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
              options={languages}
              placeholder="Language"
            />
          </div>
          <div className="w-full md:w-48">
            <SelectComponent
              value={sortBy}
              onValueChange={setSortBy}
              options={sortOptions}
              placeholder="Sort by"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setExpandedSearch(!expandedSearch)}
            className="md:self-start"
          >
            {expandedSearch ? 'Less filters' : 'More filters'}
          </Button>
        </div>

        {expandedSearch && (
          <div className="flex flex-col md:flex-row gap-4 mt-4 animate-in fade-in-50 duration-300">
            <div className="w-full md:w-48">
              <SelectComponent
                value={licenseFilter}
                onValueChange={setLicenseFilter}
                options={licenses}
                placeholder="License"
              />
            </div>
            <div className="w-full md:w-48">
              <Input
                type="number"
                placeholder="Min. downloads"
                value={minDownloads || ''}
                onChange={(e) => setMinDownloads(Number(e.target.value))}
                min="0"
              />
            </div>
            <Button 
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedLanguage('all');
                setSortBy('downloads');
                setLicenseFilter('all');
                setMinDownloads(0);
              }}
              className="md:self-start"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {filteredPlugins.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No plugins found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your search filters</p>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setSelectedLanguage('all');
            setSortBy('downloads');
            setLicenseFilter('all');
            setMinDownloads(0);
          }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugins.map((plugin) => (
            <Card key={plugin.id} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>
                    <Link href={`/packages/${plugin.name}`} className="hover:underline">
                      {plugin.name}
                    </Link>
                  </CardTitle>
                  {getLanguageBadge(plugin.language)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1 gap-2">
                  <span>v{plugin.version}</span>
                  <span>•</span>
                  <span>{plugin.license}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{plugin.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  {plugin.downloads.toLocaleString()} downloads
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/packages/${plugin.name}`}>
                    View Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">
          Showing {filteredPlugins.length} of {mockPlugins.length} plugins
        </p>
      </div>
    </div>
  );
} 