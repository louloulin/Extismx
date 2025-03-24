import { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarIcon, TrendingUpIcon, MessageSquareIcon, ThumbsUpIcon } from 'lucide-react';

// 市场插件接口
interface MarketplacePlugin {
  id: string;
  name: string;
  description: string;
  author: string;
  rating: number;
  ratingsCount: number;
  downloads: number;
  version: string;
  language: string;
  tags: string[];
  trending: boolean;
  commentsCount: number;
  lastUpdated: string;
  recommended: boolean;
}

// 模拟插件数据
const mockPlugins: MarketplacePlugin[] = [
  {
    id: '1',
    name: 'extism-json-parser',
    description: '高性能JSON解析插件，支持复杂数据结构和大型数据集',
    author: 'Extism Core Team',
    rating: 4.9,
    ratingsCount: 128,
    downloads: 12430,
    version: '2.3.0',
    language: 'typescript',
    tags: ['json', 'parser', 'core'],
    trending: true,
    commentsCount: 42,
    lastUpdated: '2024-03-15',
    recommended: true
  },
  {
    id: '2',
    name: 'rust-wasm-crypto',
    description: '安全加密库，提供哈希、加密和签名功能',
    author: 'Crypto Wasm Team',
    rating: 4.8,
    ratingsCount: 94,
    downloads: 8760,
    version: '1.7.2',
    language: 'rust',
    tags: ['crypto', 'security', 'wasm'],
    trending: true,
    commentsCount: 36,
    lastUpdated: '2024-03-10',
    recommended: true
  },
  {
    id: '3',
    name: 'go-http-client',
    description: '轻量级HTTP客户端，支持常见请求方法和自定义头',
    author: 'GoWasm Contributors',
    rating: 4.7,
    ratingsCount: 83,
    downloads: 7320,
    version: '0.9.5',
    language: 'go',
    tags: ['http', 'client', 'network'],
    trending: false,
    commentsCount: 28,
    lastUpdated: '2024-02-28',
    recommended: false
  },
  {
    id: '4',
    name: 'text-analysis',
    description: '文本分析工具，提供情感分析和关键词提取功能',
    author: 'AI Analysis Group',
    rating: 4.6,
    ratingsCount: 67,
    downloads: 5980,
    version: '1.2.1',
    language: 'python',
    tags: ['nlp', 'text', 'analysis'],
    trending: true,
    commentsCount: 18,
    lastUpdated: '2024-03-05',
    recommended: true
  },
  {
    id: '5',
    name: 'cpp-image-processor',
    description: '高性能图像处理库，支持滤镜、裁剪和格式转换',
    author: 'C++ WASM Group',
    rating: 4.5,
    ratingsCount: 52,
    downloads: 4560,
    version: '2.0.0',
    language: 'cpp',
    tags: ['image', 'processing', 'media'],
    trending: false,
    commentsCount: 15,
    lastUpdated: '2024-02-20',
    recommended: false
  },
  {
    id: '6',
    name: 'database-connector',
    description: '数据库连接器，支持SQL和NoSQL数据库',
    author: 'DB Systems',
    rating: 4.4,
    ratingsCount: 41,
    downloads: 3890,
    version: '1.5.3',
    language: 'typescript',
    tags: ['database', 'sql', 'connector'],
    trending: false,
    commentsCount: 12,
    lastUpdated: '2024-02-15',
    recommended: true
  },
];

// 渲染星级评分组件
const StarRating: FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      <StarIcon className="h-4 w-4 text-yellow-400" />
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      <span className="mx-1 text-gray-400 text-xs">|</span>
    </div>
  );
};

// 评论与评分区块组件
const CommentsSection: FC = () => {
  return (
    <div className="w-full bg-card rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">最新评论与评分</h2>
      <div className="space-y-4">
        {[
          { user: "张开发", plugin: "extism-json-parser", comment: "非常优秀的JSON解析器，性能超出预期！", rating: 5, date: "2024-03-20" },
          { user: "李工程师", plugin: "rust-wasm-crypto", comment: "安全可靠，文档详尽，推荐使用。", rating: 5, date: "2024-03-18" },
          { user: "王测试", plugin: "text-analysis", comment: "情感分析准确度很高，但API可以更友好些。", rating: 4, date: "2024-03-15" }
        ].map((comment, idx) => (
          <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{comment.user}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <div className="flex items-center">
                    {Array(5).fill(0).map((_, i) => (
                      <StarIcon 
                        key={i} 
                        className={`h-4 w-4 ${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                <Link href={`/packages/${comment.plugin}`} className="text-sm text-blue-600 hover:underline">
                  {comment.plugin}
                </Link>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{comment.comment}</p>
              </div>
              <span className="text-xs text-gray-500">{comment.date}</span>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-4 w-full">查看更多评论</Button>
    </div>
  );
};

// 趋势分析组件
const TrendsSection: FC = () => {
  return (
    <div className="w-full bg-card rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">插件趋势</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/50 p-4 rounded-md">
          <h3 className="font-medium mb-2">热门语言</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "TypeScript", count: 428, color: "bg-blue-100 text-blue-800" },
              { name: "Rust", count: 356, color: "bg-orange-100 text-orange-800" },
              { name: "Go", count: 287, color: "bg-green-100 text-green-800" },
              { name: "Python", count: 241, color: "bg-yellow-100 text-yellow-800" },
              { name: "C++", count: 183, color: "bg-purple-100 text-purple-800" }
            ].map((lang, idx) => (
              <Badge key={idx} className={`${lang.color}`}>
                {lang.name} ({lang.count})
              </Badge>
            ))}
          </div>
        </div>
        <div className="bg-muted/50 p-4 rounded-md">
          <h3 className="font-medium mb-2">热门标签</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "API", count: 246, color: "bg-teal-100 text-teal-800" },
              { name: "数据处理", count: 203, color: "bg-indigo-100 text-indigo-800" },
              { name: "安全", count: 187, color: "bg-red-100 text-red-800" },
              { name: "AI", count: 165, color: "bg-pink-100 text-pink-800" },
              { name: "工具", count: 142, color: "bg-gray-100 text-gray-800" }
            ].map((tag, idx) => (
              <Badge key={idx} className={`${tag.color}`}>
                {tag.name} ({tag.count})
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-medium mb-2">本周增长最快</h3>
        <div className="space-y-2">
          {[
            { name: "text-analysis", growth: "+218%", downloads: 5980 },
            { name: "rust-wasm-crypto", growth: "+156%", downloads: 8760 },
            { name: "extism-json-parser", growth: "+124%", downloads: 12430 }
          ].map((plugin, idx) => (
            <div key={idx} className="flex items-center justify-between bg-muted/30 p-2 rounded">
              <Link href={`/packages/${plugin.name}`} className="text-blue-600 hover:underline">
                {plugin.name}
              </Link>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">{plugin.downloads} 下载</span>
                <span className="text-green-600 flex items-center text-sm font-medium">
                  <TrendingUpIcon className="h-4 w-4 mr-1" /> {plugin.growth}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 插件卡片组件
const PluginCard: FC<{ plugin: MarketplacePlugin }> = ({ plugin }) => {
  return (
    <div className="bg-card rounded-lg shadow hover:shadow-md transition-shadow p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <Link href={`/packages/${plugin.name}`}>
          <h3 className="text-lg font-medium hover:text-blue-600 hover:underline">{plugin.name}</h3>
        </Link>
        <div className="flex items-center">
          {plugin.trending && (
            <Badge className="bg-gradient-to-r from-pink-500 to-orange-500 text-white">
              <TrendingUpIcon className="h-3 w-3 mr-1" /> 热门
            </Badge>
          )}
          {plugin.recommended && (
            <Badge className="ml-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
              <ThumbsUpIcon className="h-3 w-3 mr-1" /> 推荐
            </Badge>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{plugin.description}</p>
      
      <div className="flex flex-wrap gap-1 mt-3">
        <Badge variant="outline" className="text-xs">
          {plugin.language}
        </Badge>
        {plugin.tags.map(tag => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
      
      <div className="mt-4 flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400">
        <StarRating rating={plugin.rating} />
        <span>{plugin.ratingsCount} 评分</span>
        <span className="mx-1 text-gray-400">|</span>
        <div className="flex items-center">
          <MessageSquareIcon className="h-3 w-3 mr-1" />
          <span>{plugin.commentsCount} 评论</span>
        </div>
        <span className="mx-1 text-gray-400">|</span>
        <span>{plugin.downloads.toLocaleString()} 下载</span>
      </div>
      
      <div className="mt-3 flex justify-between items-center text-xs">
        <span>版本 {plugin.version}</span>
        <span>更新于 {plugin.lastUpdated}</span>
      </div>
      
      <div className="mt-4 flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/marketplace/${encodeURIComponent(plugin.name)}`}>
            查看详情
          </Link>
        </Button>
        <Button size="sm">安装</Button>
      </div>
    </div>
  );
};

// 推荐算法组件
const RecommendationSection: FC = () => {
  return (
    <div className="w-full bg-card rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">为您推荐</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        基于您的使用历史和项目分析，以下插件可能对您有帮助
      </p>
      <div className="grid grid-cols-1 gap-4">
        {mockPlugins.filter(p => p.recommended).slice(0, 3).map((plugin) => (
          <div key={plugin.id} className="flex items-center p-3 bg-muted/30 rounded-lg">
            <div>
              <Link href={`/packages/${plugin.name}`} className="font-medium hover:text-blue-600 hover:underline">
                {plugin.name}
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{plugin.description}</p>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <StarRating rating={plugin.rating} />
                <span>{plugin.downloads.toLocaleString()} 下载</span>
              </div>
            </div>
            <Button size="sm" className="ml-auto">安装</Button>
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-4 w-full">查看更多推荐</Button>
    </div>
  );
};

// 插件市场页面
export default function MarketplacePage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">插件市场</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
            发现、评价和分享优秀的Extism插件。我们的市场提供评分、评论和趋势分析，帮助您找到最适合项目的插件。
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button asChild>
            <Link href="/publish">发布插件</Link>
          </Button>
          <Button variant="outline">提交评论</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">发现插件</h2>
            <div className="flex items-center space-x-2">
              <select className="text-sm border rounded py-1 px-2 bg-background">
                <option>全部类别</option>
                <option>工具</option>
                <option>API集成</option>
                <option>数据处理</option>
                <option>安全</option>
              </select>
              <select className="text-sm border rounded py-1 px-2 bg-background">
                <option>最高评分</option>
                <option>最新发布</option>
                <option>最多下载</option>
                <option>最多评论</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockPlugins.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button variant="outline">加载更多插件</Button>
          </div>
        </div>
        
        <div className="space-y-8">
          <RecommendationSection />
          <TrendsSection />
          <CommentsSection />
        </div>
      </div>
    </div>
  );
} 