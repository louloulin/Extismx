import { NextRequest, NextResponse } from 'next/server';

// 定义包的接口
interface Package {
  name: string;
  description: string;
  language: string;
  license: string;
  downloads: number;
  latest: string;
  updated: string;
  tags?: string[];
}

// 模拟数据
const mockPackages: Package[] = [
  {
    name: 'extism-plugin-json',
    description: 'JSON processing plugin for Extism',
    language: 'typescript',
    license: 'MIT',
    downloads: 5728,
    latest: '1.2.0',
    updated: '2024-02-15',
    tags: ['json', 'parser', 'utility']
  },
  {
    name: 'rust-wasm-analyzer',
    description: 'Rust WebAssembly code analyzer',
    language: 'rust',
    license: 'Apache-2.0',
    downloads: 4213,
    latest: '0.9.1',
    updated: '2024-03-01',
    tags: ['analyzer', 'wasm', 'rust']
  },
  {
    name: 'go-extism-utils',
    description: 'Utility functions for Go Extism plugins',
    language: 'go',
    license: 'BSD-3-Clause',
    downloads: 3659,
    latest: '2.1.3',
    updated: '2024-01-28',
    tags: ['utility', 'go']
  },
  {
    name: 'cpp-wasm-runtime',
    description: 'C++ WebAssembly runtime helper',
    language: 'cpp',
    license: 'MIT',
    downloads: 2841,
    latest: '0.5.2',
    updated: '2024-02-20',
    tags: ['runtime', 'wasm', 'cpp']
  },
  {
    name: 'python-extism-helper',
    description: 'Helper library for Python Extism plugins',
    language: 'python',
    license: 'MIT',
    downloads: 1976,
    latest: '1.0.1',
    updated: '2024-03-10',
    tags: ['helper', 'python']
  },
  {
    name: 'typescript-pdk-tools',
    description: 'TypeScript PDK toolkit for Extism',
    language: 'typescript',
    license: 'MIT',
    downloads: 3142,
    latest: '2.0.0',
    updated: '2024-02-28',
    tags: ['typescript', 'pdk', 'toolkit']
  },
  {
    name: 'rust-extism-adapter',
    description: 'Rust adapter for Extism plugins',
    language: 'rust',
    license: 'MIT',
    downloads: 2570,
    latest: '1.3.1',
    updated: '2024-01-15',
    tags: ['adapter', 'rust']
  },
  {
    name: 'go-wasm-compiler',
    description: 'WebAssembly compiler tools for Go',
    language: 'go',
    license: 'Apache-2.0',
    downloads: 1893,
    latest: '0.7.2',
    updated: '2024-02-10',
    tags: ['compiler', 'wasm', 'go']
  }
];

export async function GET(request: NextRequest) {
  // 获取URL查询参数
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.toLowerCase() || '';
  const language = url.searchParams.get('language') || '';
  const license = url.searchParams.get('license') || '';
  const tag = url.searchParams.get('tag')?.toLowerCase() || '';
  const sort = url.searchParams.get('sort') || 'relevance';
  const order = url.searchParams.get('order') || 'desc';
  const limit = parseInt(url.searchParams.get('limit') || '10');
  
  // 过滤包
  let filteredPackages = [...mockPackages];
  
  // 按查询词过滤
  if (query) {
    filteredPackages = filteredPackages.filter(pkg => 
      pkg.name.toLowerCase().includes(query) || 
      pkg.description.toLowerCase().includes(query)
    );
  }
  
  // 按语言过滤
  if (language) {
    filteredPackages = filteredPackages.filter(pkg => 
      pkg.language === language
    );
  }
  
  // 按许可证过滤
  if (license) {
    filteredPackages = filteredPackages.filter(pkg => 
      pkg.license === license
    );
  }
  
  // 按标签过滤
  if (tag) {
    filteredPackages = filteredPackages.filter(pkg => 
      pkg.tags?.some(t => t.toLowerCase().includes(tag))
    );
  }
  
  // 排序
  if (sort === 'downloads') {
    filteredPackages.sort((a, b) => 
      order === 'desc' ? b.downloads - a.downloads : a.downloads - b.downloads
    );
  } else if (sort === 'updated') {
    filteredPackages.sort((a, b) => {
      const dateA = new Date(a.updated);
      const dateB = new Date(b.updated);
      return order === 'desc' 
        ? dateB.getTime() - dateA.getTime() 
        : dateA.getTime() - dateB.getTime();
    });
  } else if (sort === 'name') {
    filteredPackages.sort((a, b) => {
      return order === 'desc' 
        ? b.name.localeCompare(a.name) 
        : a.name.localeCompare(b.name);
    });
  } else if (sort === 'relevance' && query) {
    // 基于查询词的相关性排序
    filteredPackages.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(query) ? 1 : 0;
      const bNameMatch = b.name.toLowerCase().includes(query) ? 1 : 0;
      
      if (aNameMatch !== bNameMatch) {
        return order === 'desc' ? bNameMatch - aNameMatch : aNameMatch - bNameMatch;
      }
      
      // 如果名称匹配相同，按下载量排序
      return order === 'desc' ? b.downloads - a.downloads : a.downloads - b.downloads;
    });
  }
  
  // 限制结果数量
  filteredPackages = filteredPackages.slice(0, limit);
  
  // 返回结果
  return NextResponse.json({
    results: filteredPackages,
    count: filteredPackages.length,
    total: mockPackages.length,
    filters: {
      query,
      language,
      license,
      tag,
      sort,
      order,
      limit
    }
  });
} 