import { NextRequest, NextResponse } from 'next/server';

// 模拟插件数据
const plugins = [
  { id: 1, name: 'data-processor', author: 'John Doe', version: '1.2.0', downloads: 1250, status: 'approved', created_at: '2023-01-15', updated_at: '2023-05-10' },
  { id: 2, name: 'image-analyzer', author: 'Jane Smith', version: '0.9.1', downloads: 870, status: 'approved', created_at: '2023-02-22', updated_at: '2023-06-18' },
  { id: 3, name: 'text-formatter', author: 'Bob Johnson', version: '2.1.3', downloads: 2300, status: 'pending', created_at: '2023-03-07', updated_at: '2023-03-07' },
  { id: 4, name: 'code-formatter', author: 'Alice Brown', version: '0.5.0', downloads: 430, status: 'rejected', created_at: '2023-04-14', updated_at: '2023-04-30' },
  { id: 5, name: 'audio-converter', author: 'Charlie Davis', version: '1.0.0', downloads: 920, status: 'approved', created_at: '2023-05-23', updated_at: '2023-07-11' },
  { id: 6, name: 'video-encoder', author: 'Eva Wilson', version: '0.7.2', downloads: 560, status: 'approved', created_at: '2023-06-09', updated_at: '2023-08-05' },
  { id: 7, name: 'database-connector', author: 'Frank Miller', version: '3.0.1', downloads: 3100, status: 'approved', created_at: '2023-01-30', updated_at: '2023-09-22' },
  { id: 8, name: 'api-tester', author: 'Grace Lee', version: '1.4.5', downloads: 1850, status: 'pending', created_at: '2023-07-18', updated_at: '2023-07-18' },
  { id: 9, name: 'json-validator', author: 'Henry Adams', version: '2.2.0', downloads: 2700, status: 'approved', created_at: '2023-08-04', updated_at: '2023-10-01' },
  { id: 10, name: 'pdf-generator', author: 'Ivy Chen', version: '1.1.3', downloads: 1400, status: 'rejected', created_at: '2023-09-12', updated_at: '2023-09-20' },
  { id: 11, name: 'file-uploader', author: 'Jack Wang', version: '0.8.7', downloads: 980, status: 'pending', created_at: '2023-10-07', updated_at: '2023-10-07' },
  { id: 12, name: 'markdown-parser', author: 'Kate Thompson', version: '1.3.2', downloads: 2150, status: 'approved', created_at: '2023-02-11', updated_at: '2023-11-03' },
];

export async function GET(request: NextRequest) {
  // 获取URL查询参数
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase();
  const author = searchParams.get('author');
  const status = searchParams.get('status');
  const sortBy = searchParams.get('sortBy') || 'downloads';
  const sortDir = searchParams.get('sortDir') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // 筛选插件
  let filteredPlugins = [...plugins];
  
  if (search) {
    filteredPlugins = filteredPlugins.filter(plugin => 
      plugin.name.toLowerCase().includes(search) || 
      plugin.author.toLowerCase().includes(search)
    );
  }
  
  if (author) {
    filteredPlugins = filteredPlugins.filter(plugin => plugin.author === author);
  }
  
  if (status) {
    filteredPlugins = filteredPlugins.filter(plugin => plugin.status === status);
  }
  
  // 排序
  filteredPlugins.sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a];
    const bValue = b[sortBy as keyof typeof b];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDir === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return sortDir === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });
  
  // 计算分页
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPlugins = filteredPlugins.slice(startIndex, endIndex);
  
  // 返回结果
  return NextResponse.json({
    plugins: paginatedPlugins,
    total: filteredPlugins.length,
    page,
    limit,
    totalPages: Math.ceil(filteredPlugins.length / limit)
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 在实际应用中，这里需要数据验证和处理
    const now = new Date().toISOString().split('T')[0];
    const newPlugin = {
      id: plugins.length + 1,
      name: body.name,
      author: body.author,
      version: body.version,
      downloads: 0,
      status: 'pending',
      created_at: now,
      updated_at: now
    };
    
    // 在实际应用中，这里会存储到数据库
    plugins.push(newPlugin);
    
    return NextResponse.json(newPlugin, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: '创建插件失败', details: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const pluginId = body.id;
    
    // 查找插件
    const pluginIndex = plugins.findIndex(p => p.id === pluginId);
    if (pluginIndex === -1) {
      return NextResponse.json(
        { error: '插件不存在' },
        { status: 404 }
      );
    }
    
    // 更新插件
    const updatedPlugin = {
      ...plugins[pluginIndex],
      ...body,
      updated_at: new Date().toISOString().split('T')[0]
    };
    
    plugins[pluginIndex] = updatedPlugin;
    
    return NextResponse.json(updatedPlugin);
  } catch (error) {
    return NextResponse.json(
      { error: '更新插件失败', details: (error as Error).message },
      { status: 400 }
    );
  }
} 