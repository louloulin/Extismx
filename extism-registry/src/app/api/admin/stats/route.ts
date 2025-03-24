import { NextRequest, NextResponse } from 'next/server';

// 模拟总体统计数据
const overallStats = {
  total_users: 1298,
  total_plugins: 427,
  total_downloads: 48295,
  active_users: 765,
  pending_plugins: 32,
  user_growth_rate: 12, // 百分比
  plugin_growth_rate: 23, // 百分比
  download_growth_rate: 18, // 百分比
};

// 模拟每日统计数据
const dailyStats = [
  { date: '2023-01-01', new_users: 5, new_plugins: 2, downloads: 120 },
  { date: '2023-01-02', new_users: 7, new_plugins: 1, downloads: 145 },
  { date: '2023-01-03', new_users: 10, new_plugins: 3, downloads: 210 },
  { date: '2023-01-04', new_users: 8, new_plugins: 0, downloads: 188 },
  { date: '2023-01-05', new_users: 12, new_plugins: 4, downloads: 230 },
  { date: '2023-01-06', new_users: 15, new_plugins: 2, downloads: 265 },
  { date: '2023-01-07', new_users: 9, new_plugins: 1, downloads: 240 },
  { date: '2023-01-08', new_users: 11, new_plugins: 3, downloads: 280 },
  { date: '2023-01-09', new_users: 14, new_plugins: 5, downloads: 310 },
  { date: '2023-01-10', new_users: 18, new_plugins: 6, downloads: 350 },
  { date: '2023-01-11', new_users: 21, new_plugins: 4, downloads: 390 },
  { date: '2023-01-12', new_users: 16, new_plugins: 3, downloads: 420 },
  { date: '2023-01-13', new_users: 19, new_plugins: 7, downloads: 460 },
  { date: '2023-01-14', new_users: 24, new_plugins: 5, downloads: 510 },
  { date: '2023-01-15', new_users: 28, new_plugins: 8, downloads: 580 },
  { date: '2023-01-16', new_users: 31, new_plugins: 6, downloads: 630 },
  { date: '2023-01-17', new_users: 25, new_plugins: 4, downloads: 590 },
  { date: '2023-01-18', new_users: 22, new_plugins: 3, downloads: 550 },
  { date: '2023-01-19', new_users: 27, new_plugins: 5, downloads: 600 },
  { date: '2023-01-20', new_users: 30, new_plugins: 7, downloads: 640 },
  { date: '2023-01-21', new_users: 33, new_plugins: 9, downloads: 690 },
  { date: '2023-01-22', new_users: 29, new_plugins: 6, downloads: 620 },
  { date: '2023-01-23', new_users: 26, new_plugins: 4, downloads: 580 },
  { date: '2023-01-24', new_users: 23, new_plugins: 3, downloads: 540 },
  { date: '2023-01-25', new_users: 20, new_plugins: 2, downloads: 510 },
  { date: '2023-01-26', new_users: 18, new_plugins: 1, downloads: 480 },
  { date: '2023-01-27', new_users: 21, new_plugins: 3, downloads: 520 },
  { date: '2023-01-28', new_users: 24, new_plugins: 4, downloads: 560 },
  { date: '2023-01-29', new_users: 27, new_plugins: 5, downloads: 590 },
  { date: '2023-01-30', new_users: 30, new_plugins: 7, downloads: 640 },
];

// 模拟热门插件数据
const topPlugins = [
  { name: 'data-processor', downloads: 4823, rating: 4.8 },
  { name: 'database-connector', downloads: 3642, rating: 4.6 },
  { name: 'json-validator', downloads: 3521, rating: 4.7 },
  { name: 'text-formatter', downloads: 3145, rating: 4.5 },
  { name: 'markdown-parser', downloads: 2987, rating: 4.7 },
  { name: 'image-analyzer', downloads: 2745, rating: 4.4 },
  { name: 'api-tester', downloads: 2587, rating: 4.3 },
  { name: 'pdf-generator', downloads: 2345, rating: 4.6 },
  { name: 'audio-converter', downloads: 2123, rating: 4.2 },
  { name: 'file-uploader', downloads: 1987, rating: 4.5 },
];

// 模拟活跃用户数据
const topUsers = [
  { name: 'John Doe', plugins_published: 12, total_downloads: 9845 },
  { name: 'Jane Smith', plugins_published: 9, total_downloads: 7632 },
  { name: 'Bob Johnson', plugins_published: 7, total_downloads: 6254 },
  { name: 'Frank Miller', plugins_published: 6, total_downloads: 5423 },
  { name: 'Alice Brown', plugins_published: 5, total_downloads: 4127 },
];

export async function GET(request: NextRequest) {
  // 获取URL查询参数
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'overall';
  const period = searchParams.get('period') || '30days';
  
  // 根据请求类型返回不同的统计数据
  switch (type) {
    case 'overall':
      return NextResponse.json(overallStats);
      
    case 'daily':
      let filteredStats;
      
      // 根据时间段筛选数据
      if (period === '7days') {
        filteredStats = dailyStats.slice(-7);
      } else if (period === '14days') {
        filteredStats = dailyStats.slice(-14);
      } else {
        filteredStats = dailyStats;
      }
      
      return NextResponse.json(filteredStats);
      
    case 'top_plugins':
      // 可以根据period参数进一步筛选，这里简化处理
      return NextResponse.json(topPlugins);
      
    case 'top_users':
      // 可以根据period参数进一步筛选，这里简化处理
      return NextResponse.json(topUsers);
      
    default:
      return NextResponse.json(
        { error: '无效的统计类型' },
        { status: 400 }
      );
  }
} 