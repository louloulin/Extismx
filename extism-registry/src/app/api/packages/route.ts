import { NextRequest, NextResponse } from 'next/server';

// Define types for package summary
interface PackageSummary {
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  language: string;
  downloads: number;
  stars: number;
  created: string;
  updated: string;
}

// Mock package list
const mockPackages: PackageSummary[] = [
  {
    name: 'hello-plugin',
    description: 'A simple Hello World plugin for Extism',
    version: '1.0.0',
    author: 'Extism Team',
    license: 'MIT',
    language: 'typescript',
    downloads: 1250,
    stars: 24,
    created: '2023-07-10',
    updated: '2023-09-15'
  },
  {
    name: 'markdown-parser',
    description: 'Parse and render Markdown content to HTML and other formats',
    version: '2.1.3',
    author: 'Markdown Team',
    license: 'Apache-2.0',
    language: 'rust',
    downloads: 3420,
    stars: 78,
    created: '2023-08-18',
    updated: '2023-12-15'
  },
  {
    name: 'json-validator',
    description: 'Validate JSON against schemas with comprehensive error reporting',
    version: '0.8.2',
    author: 'JSON Tools',
    license: 'MIT',
    language: 'go',
    downloads: 890,
    stars: 31,
    created: '2023-08-25',
    updated: '2023-11-20'
  },
  {
    name: 'image-processor',
    description: 'Process and manipulate images with various transformations',
    version: '1.2.1',
    author: 'Image Team',
    license: 'MIT',
    language: 'rust',
    downloads: 750,
    stars: 42,
    created: '2023-09-10',
    updated: '2023-12-05'
  },
  {
    name: 'text-classifier',
    description: 'Classify text using pre-trained models',
    version: '0.5.0',
    author: 'ML Team',
    license: 'Apache-2.0',
    language: 'python',
    downloads: 520,
    stars: 19,
    created: '2023-10-25',
    updated: '2023-11-30'
  },
  {
    name: 'http-client',
    description: 'Make HTTP requests from within plugins',
    version: '1.1.0',
    author: 'Networking Team',
    license: 'MIT',
    language: 'typescript',
    downloads: 1850,
    stars: 56,
    created: '2023-08-15',
    updated: '2023-12-01'
  },
  {
    name: 'crypto-utils',
    description: 'Cryptographic utilities for hashing and encryption',
    version: '0.9.1',
    author: 'Security Team',
    license: 'BSD-3-Clause',
    language: 'rust',
    downloads: 980,
    stars: 27,
    created: '2023-09-20',
    updated: '2023-11-15'
  },
  {
    name: 'mastra-ai-connector',
    description: 'Connect to Mastra AI services from within plugins',
    version: '1.0.2',
    author: 'Mastra Integration Team',
    license: 'MIT',
    language: 'typescript',
    downloads: 2150,
    stars: 68,
    created: '2023-10-10',
    updated: '2023-12-20'
  }
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    
    // Parse query parameters
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const language = url.searchParams.get('language') || '';
    const sort = url.searchParams.get('sort') || 'downloads';
    const order = url.searchParams.get('order') || 'desc';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Filter packages
    let filteredPackages = [...mockPackages];
    
    if (search) {
      filteredPackages = filteredPackages.filter(pkg => 
        pkg.name.toLowerCase().includes(search) || 
        pkg.description.toLowerCase().includes(search)
      );
    }
    
    if (language) {
      filteredPackages = filteredPackages.filter(pkg => 
        pkg.language.toLowerCase() === language.toLowerCase()
      );
    }
    
    // Sort packages
    filteredPackages.sort((a, b) => {
      const orderMultiplier = order === 'asc' ? 1 : -1;
      
      switch (sort) {
        case 'name':
          return orderMultiplier * a.name.localeCompare(b.name);
        case 'stars':
          return orderMultiplier * (a.stars - b.stars);
        case 'updated':
          return orderMultiplier * (new Date(a.updated).getTime() - new Date(b.updated).getTime());
        case 'downloads':
        default:
          return orderMultiplier * (a.downloads - b.downloads);
      }
    });
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPackages = filteredPackages.slice(startIndex, endIndex);
    
    // Prepare response with pagination metadata
    const response = {
      packages: paginatedPackages,
      pagination: {
        totalPackages: filteredPackages.length,
        totalPages: Math.ceil(filteredPackages.length / limit),
        currentPage: page,
        limit
      },
      filters: {
        search,
        language,
        sort,
        order
      },
      // In a real API, you would include available languages for filtering
      availableLanguages: ['typescript', 'rust', 'go', 'python', 'c', 'cpp']
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching packages:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
} 