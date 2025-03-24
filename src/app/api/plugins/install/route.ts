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
  versions: string[];
  dependencies?: Record<string, string>;
}

// 模拟数据 - 包详情
const mockPackages: Record<string, Package> = {
  'extism-plugin-json': {
    name: 'extism-plugin-json',
    description: 'JSON processing plugin for Extism',
    language: 'typescript',
    license: 'MIT',
    downloads: 5728,
    latest: '1.2.0',
    updated: '2024-02-15',
    versions: ['1.0.0', '1.1.0', '1.2.0'],
    dependencies: {
      'extism-core': '^1.0.0'
    }
  },
  'rust-wasm-analyzer': {
    name: 'rust-wasm-analyzer',
    description: 'Rust WebAssembly code analyzer',
    language: 'rust',
    license: 'Apache-2.0',
    downloads: 4213,
    latest: '0.9.1',
    updated: '2024-03-01',
    versions: ['0.8.0', '0.9.0', '0.9.1'],
    dependencies: {
      'wasm-bindgen': '^0.2.84'
    }
  }
};

// 依赖解析器
function resolveDependencies(packageName: string, version: string): Record<string, string> {
  // 这里应该是一个递归解析依赖的函数
  // 目前我们简单返回直接依赖
  const pkg = mockPackages[packageName];
  if (!pkg) {
    return {};
  }
  
  return pkg.dependencies || {};
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { packageName, version = 'latest', options = {} } = body;
    
    // 验证参数
    if (!packageName) {
      return NextResponse.json({ error: 'Package name is required' }, { status: 400 });
    }
    
    // 查找包
    const pkg = mockPackages[packageName];
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }
    
    // 确定版本
    const targetVersion = version === 'latest' ? pkg.latest : version;
    if (!pkg.versions.includes(targetVersion)) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }
    
    // 解析依赖
    const dependencies = resolveDependencies(packageName, targetVersion);
    
    // 构建安装结果
    const installResult = {
      success: true,
      packageName,
      version: targetVersion,
      installPath: options.global 
        ? `/usr/local/lib/extism/plugins/${packageName}@${targetVersion}` 
        : `./node_modules/.extism/${packageName}@${targetVersion}`,
      dependencies: Object.keys(dependencies).map(dep => ({
        name: dep,
        version: dependencies[dep]
      })),
      installTime: new Date().toISOString(),
      size: Math.floor(Math.random() * 1000) + 50, // 模拟包大小（KB）
    };
    
    // 在实际实现中，我们会在这里执行实际的安装
    // 对于模拟，我们只是增加下载计数
    mockPackages[packageName].downloads += 1;
    
    return NextResponse.json(installResult);
  } catch (error) {
    console.error('Error installing package:', error);
    return NextResponse.json({ error: 'Failed to install package' }, { status: 500 });
  }
} 