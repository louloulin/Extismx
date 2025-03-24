import { NextRequest, NextResponse } from 'next/server';

// 模拟用户数据
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', created_at: '2023-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'developer', status: 'active', created_at: '2023-02-20' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'inactive', created_at: '2023-03-10' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'developer', status: 'active', created_at: '2023-04-05' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'user', status: 'pending', created_at: '2023-05-18' },
  { id: 6, name: 'Eva Wilson', email: 'eva@example.com', role: 'developer', status: 'active', created_at: '2023-06-22' },
  { id: 7, name: 'Frank Miller', email: 'frank@example.com', role: 'user', status: 'active', created_at: '2023-07-07' },
  { id: 8, name: 'Grace Lee', email: 'grace@example.com', role: 'user', status: 'active', created_at: '2023-08-14' },
  { id: 9, name: 'Henry Adams', email: 'henry@example.com', role: 'developer', status: 'inactive', created_at: '2023-09-29' },
  { id: 10, name: 'Ivy Chen', email: 'ivy@example.com', role: 'user', status: 'pending', created_at: '2023-10-12' },
];

export async function GET(request: NextRequest) {
  // 获取URL查询参数
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase();
  const role = searchParams.get('role');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // 筛选用户
  let filteredUsers = [...users];
  
  if (search) {
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(search) || 
      user.email.toLowerCase().includes(search)
    );
  }
  
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role);
  }
  
  if (status) {
    filteredUsers = filteredUsers.filter(user => user.status === status);
  }
  
  // 计算分页
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  // 返回结果
  return NextResponse.json({
    users: paginatedUsers,
    total: filteredUsers.length,
    page,
    limit,
    totalPages: Math.ceil(filteredUsers.length / limit)
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 在实际应用中，这里需要数据验证和处理
    const newUser = {
      id: users.length + 1,
      name: body.name,
      email: body.email,
      role: body.role || 'user',
      status: body.status || 'pending',
      created_at: new Date().toISOString().split('T')[0]
    };
    
    // 在实际应用中，这里会存储到数据库
    users.push(newUser);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: '创建用户失败', details: (error as Error).message },
      { status: 400 }
    );
  }
}

// 更多API方法(PUT, DELETE等)将在实际实现中添加 