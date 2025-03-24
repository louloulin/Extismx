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
    updated: '2024-02-15'
  },
  {
    name: 'rust-wasm-analyzer',
    description: 'Rust WebAssembly code analyzer',
    language: 'rust',
    license: 'Apache-2.0',
    downloads: 4213,
    latest: '0.9.1',
    updated: '2024-03-01'
  },
  {
    name: 'go-extism-utils',
    description: 'Utility functions for Go Extism plugins',
    language: 'go',
    license: 'BSD-3-Clause',
    downloads: 3659,
    latest: '2.1.3',
    updated: '2024-01-28'
  },
  {
    name: 'cpp-wasm-runtime',
    description: 'C++ WebAssembly runtime helper',
    language: 'cpp',
    license: 'MIT',
    downloads: 2841,
    latest: '0.5.2',
    updated: '2024-02-20'
  },
  {
    name: 'python-extism-helper',
    description: 'Helper library for Python Extism plugins',
    language: 'python',
    license: 'MIT',
    downloads: 1976,
    latest: '1.0.1',
    updated: '2024-03-10'
  }
];

export async function GET(request: NextRequest) {
  // 统计总下载量
  const totalDownloads = mockPackages.reduce((total: number, pkg: Package) => total + pkg.downloads, 0);
  
  // 统计包的总数
  const totalPackages = mockPackages.length;
  
  // 按语言分类
  const packagesByLanguage = mockPackages.reduce((acc: Record<string, number>, pkg: Package) => {
    if (!acc[pkg.language]) {
      acc[pkg.language] = 0;
    }
    acc[pkg.language]++;
    return acc;
  }, {} as Record<string, number>);
  
  // 按许可证分类
  const packagesByLicense = mockPackages.reduce((acc: Record<string, number>, pkg: Package) => {
    if (!acc[pkg.license]) {
      acc[pkg.license] = 0;
    }
    acc[pkg.license]++;
    return acc;
  }, {} as Record<string, number>);
  
  // 获取下载量排名前5的包
  const topPackages = [...mockPackages]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5)
    .map(pkg => ({
      name: pkg.name,
      downloads: pkg.downloads,
      version: pkg.latest
    }));
  
  // 获取最新发布的5个包
  const latestPackages = [...mockPackages]
    .sort((a, b) => {
      const dateA = new Date(a.updated);
      const dateB = new Date(b.updated);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5)
    .map(pkg => ({
      name: pkg.name,
      version: pkg.latest,
      released: pkg.updated
    }));
  
  // 返回统计数据
  return NextResponse.json({
    overview: {
      totalDownloads,
      totalPackages,
      averageDownloadsPerPackage: Math.round(totalDownloads / totalPackages)
    },
    distribution: {
      byLanguage: packagesByLanguage,
      byLicense: packagesByLicense
    },
    topPackages,
    latestPackages,
    // 添加一些性能指标
    performance: {
      averageLoadTime: 42, // ms
      averageMemoryUsage: 8.6, // MB
      averageCompilationTime: 28 // seconds
    }
  });
} 