'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, LineChart, BarChart } from '@/components/ui/charts';

// 模拟数据
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'developer', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'developer', status: 'active' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'user', status: 'pending' },
];

const plugins = [
  { id: 1, name: 'data-processor', author: 'John Doe', version: '1.2.0', downloads: 1250, status: 'approved' },
  { id: 2, name: 'image-analyzer', author: 'Jane Smith', version: '0.9.1', downloads: 870, status: 'approved' },
  { id: 3, name: 'text-formatter', author: 'Bob Johnson', version: '2.1.3', downloads: 2300, status: 'pending' },
  { id: 4, name: 'code-formatter', author: 'Alice Brown', version: '0.5.0', downloads: 430, status: 'rejected' },
  { id: 5, name: 'audio-converter', author: 'Charlie Davis', version: '1.0.0', downloads: 920, status: 'approved' },
];

const dailyStats = [
  { date: '2023-01-01', plugins: 5, users: 10, downloads: 50 },
  { date: '2023-01-02', plugins: 7, users: 15, downloads: 75 },
  { date: '2023-01-03', plugins: 10, users: 22, downloads: 120 },
  { date: '2023-01-04', plugins: 12, users: 28, downloads: 180 },
  { date: '2023-01-05', plugins: 15, users: 35, downloads: 250 },
  { date: '2023-01-06', plugins: 18, users: 42, downloads: 310 },
  { date: '2023-01-07', plugins: 22, users: 48, downloads: 380 },
];

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredPlugins = plugins.filter(plugin => 
    plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plugin.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">管理控制台</h1>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">用户管理</TabsTrigger>
          <TabsTrigger value="plugins">插件管理</TabsTrigger>
          <TabsTrigger value="stats">系统统计</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>
                管理系统用户、角色和权限
              </CardDescription>
              <div className="flex justify-between items-center mt-4">
                <Input
                  placeholder="搜索用户..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button>新增用户</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge variant={
                          user.status === 'active' ? 'default' :
                          user.status === 'inactive' ? 'destructive' : 'outline'
                        }>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="mr-2">编辑</Button>
                        <Button variant="destructive" size="sm">删除</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plugins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>插件管理</CardTitle>
              <CardDescription>
                审核、管理和监控系统中的插件
              </CardDescription>
              <div className="flex justify-between items-center mt-4">
                <Input
                  placeholder="搜索插件..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>作者</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>下载量</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlugins.map(plugin => (
                    <TableRow key={plugin.id}>
                      <TableCell>{plugin.id}</TableCell>
                      <TableCell>{plugin.name}</TableCell>
                      <TableCell>{plugin.author}</TableCell>
                      <TableCell>{plugin.version}</TableCell>
                      <TableCell>{plugin.downloads.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          plugin.status === 'approved' ? 'default' :
                          plugin.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {plugin.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="mr-2">查看</Button>
                        <Button variant={plugin.status === 'pending' ? 'default' : 'outline'} size="sm" className="mr-2">
                          {plugin.status === 'pending' ? '审核' : '编辑'}
                        </Button>
                        <Button variant="destructive" size="sm">删除</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>系统统计</CardTitle>
              <CardDescription>
                查看系统使用情况和性能指标
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      总用户数
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,298</div>
                    <p className="text-xs text-muted-foreground">
                      +12% 相比上月
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      总插件数
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">427</div>
                    <p className="text-xs text-muted-foreground">
                      +23% 相比上月
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      总下载量
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">48,295</div>
                    <p className="text-xs text-muted-foreground">
                      +18% 相比上月
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">每日趋势</h3>
                  <div className="h-[300px] border rounded-md p-4">
                    {/* 这里需要实现图表组件 */}
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      趋势图表
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">热门插件</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>插件名称</TableHead>
                        <TableHead>下载量</TableHead>
                        <TableHead>平均评分</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>data-processor</TableCell>
                        <TableCell>4,823</TableCell>
                        <TableCell>4.8/5.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>image-analyzer</TableCell>
                        <TableCell>3,145</TableCell>
                        <TableCell>4.5/5.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>text-formatter</TableCell>
                        <TableCell>2,987</TableCell>
                        <TableCell>4.7/5.0</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 