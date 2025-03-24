import { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarIcon, MessageSquareIcon, DownloadIcon, HeartIcon, ShareIcon, FlagIcon } from 'lucide-react';

// 评论接口
interface Comment {
  id: string;
  user: string;
  avatar: string;
  date: string;
  rating: number;
  text: string;
  likes: number;
  isVerified: boolean;
}

// 版本历史接口
interface VersionHistory {
  version: string;
  date: string;
  changes: string[];
}

export const PluginDetail: FC<{ pluginName: string }> = ({ pluginName }) => {
  // 模拟插件数据
  const plugin = {
    name: pluginName,
    description: '高性能JSON解析插件，支持复杂数据结构和大型数据集。完全符合JSON规范，支持自定义解析选项和错误处理。',
    longDescription: `Extism JSON解析器是一个高性能的WebAssembly插件，专为需要在应用程序中处理和操作JSON数据的开发者设计。

该插件完全符合JSON规范，提供了全面的解析功能，同时保持了极高的性能和内存效率。它适用于处理大型和复杂的JSON数据结构，支持自定义解析选项和详细的错误处理。

主要特性：
- 高性能解析和序列化
- 支持所有JSON数据类型
- 路径查询支持（类似于JSONPath）
- 数据验证和转换
- 自定义错误处理和报告
- 内存优化设计
- 全面的类型安全`,
    author: 'Extism Core Team',
    authorUrl: 'https://github.com/extism',
    license: 'MIT',
    repository: 'https://github.com/extism/json-parser-plugin',
    homepage: 'https://extism.org/plugins/json-parser',
    rating: 4.9,
    ratingsCount: 128,
    downloads: 12430,
    version: '2.3.0',
    published: '2024-03-15',
    updated: '2024-03-15',
    size: '512KB',
    language: 'typescript',
    keywords: ['json', 'parser', 'serializer', 'data', 'validation'],
    dependencies: [
      { name: 'wasm-utils', version: '^1.5.0' },
      { name: 'memory-buffer', version: '^2.1.2' }
    ],
    versions: [
      { version: '2.3.0', date: '2024-03-15', changes: ['性能优化', '添加新的格式化选项', '修复特殊字符处理问题'] },
      { version: '2.2.1', date: '2024-02-28', changes: ['修复内存泄漏问题', '改进错误处理'] },
      { version: '2.2.0', date: '2024-02-10', changes: ['添加流式处理支持', '优化大型JSON文件处理'] },
      { version: '2.1.0', date: '2024-01-22', changes: ['添加JSONPath查询支持', '改进类型检查'] },
      { version: '2.0.0', date: '2024-01-05', changes: ['重构核心解析引擎', '添加验证功能', '提高性能'] }
    ],
    comments: [
      { 
        id: '1', 
        user: '张开发', 
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user1', 
        date: '2024-03-20', 
        rating: 5, 
        text: '非常优秀的JSON解析器，性能超出预期！我们在处理大量IoT设备数据时，这个插件帮助我们将处理时间减少了75%。文档详尽，API设计合理，强烈推荐给需要处理大量JSON数据的开发者。', 
        likes: 24,
        isVerified: true
      },
      { 
        id: '2', 
        user: '李工程师', 
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user2', 
        date: '2024-03-18', 
        rating: 5, 
        text: '这是我用过的最好的JSON解析器之一。我特别喜欢它对大文件的处理方式和错误报告的清晰度。集成到我们的系统中非常容易，性能也非常稳定。', 
        likes: 16,
        isVerified: true
      },
      { 
        id: '3', 
        user: '王测试', 
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user3', 
        date: '2024-03-15', 
        rating: 4, 
        text: '整体表现很好，功能强大。唯一的小问题是在处理非常深层嵌套的结构时有些慢，但这可能是不可避免的。文档很清晰，示例代码很有帮助。', 
        likes: 8,
        isVerified: false
      },
      { 
        id: '4', 
        user: '刘架构师', 
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user4', 
        date: '2024-03-10', 
        rating: 5, 
        text: '在我们的微服务架构中，这个插件为我们解决了大量的跨服务数据处理问题。API设计思路清晰，与Extism生态系统无缝集成。开发团队响应迅速，解决问题的态度很积极。', 
        likes: 19,
        isVerified: true
      }
    ],
    features: [
      '完整的JSON规范支持',
      '高性能解析和序列化',
      'JSONPath风格查询',
      '自定义错误处理',
      '内存优化',
      '流式处理大型文件',
      '数据验证和转换'
    ],
    usageExample: `// TypeScript示例
import { Plugin } from '@extism/sdk';
import { readFileSync } from 'fs';

async function parseJson() {
  // 加载插件
  const wasm = readFileSync('./extism-json-parser.wasm');
  const plugin = new Plugin(wasm);
  
  // 准备JSON数据
  const jsonData = '{"name":"测试","values":[1,2,3],"nested":{"key":"value"}}';
  
  // 调用解析函数
  const result = await plugin.call('parse', jsonData);
  const parsed = JSON.parse(result.string());
  
  // 使用JSONPath查询
  const pathResult = await plugin.call('query', JSON.stringify({
    json: jsonData,
    path: "$.nested.key"
  }));
  
  console.log('查询结果:', pathResult.string());  // 输出: "value"
}`
  };

  // 渲染星级评分
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // 渲染评论组件
  const renderComments = (comments: Comment[]) => {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">用户评价</h3>
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start">
                <img
                  src={comment.avatar}
                  alt={comment.user}
                  className="rounded-full w-10 h-10 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium">{comment.user}</span>
                    {comment.isVerified && (
                      <Badge className="ml-2 bg-green-100 text-green-800 text-xs">已验证用户</Badge>
                    )}
                  </div>
                  <div className="flex items-center mt-1 mb-2">
                    {renderStars(comment.rating)}
                    <span className="text-gray-500 text-sm ml-2">{comment.date}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                  <div className="flex items-center mt-3">
                    <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                      <HeartIcon className="h-3 w-3 mr-1" /> 
                      有帮助 ({comment.likes})
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-gray-500 ml-2">
                      <MessageSquareIcon className="h-3 w-3 mr-1" /> 
                      回复
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-gray-500 ml-2">
                      <FlagIcon className="h-3 w-3 mr-1" /> 
                      举报
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" className="w-full">查看全部 {plugin.ratingsCount} 条评价</Button>
        </div>
      </div>
    );
  };

  // 渲染版本历史
  const renderVersionHistory = (versions: VersionHistory[]) => {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">版本历史</h3>
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">版本 {version.version}</span>
                <span className="text-sm text-gray-500">{version.date}</span>
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                {version.changes.map((change, changeIdx) => (
                  <li key={changeIdx}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link href="/marketplace" className="text-blue-600 hover:underline flex items-center">
          &larr; 返回插件市场
        </Link>
      </div>

      <div className="bg-card rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{plugin.name}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
              {plugin.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {plugin.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center mb-2">
              {renderStars(plugin.rating)}
              <span className="ml-2 text-sm">
                ({plugin.rating.toFixed(1)}, {plugin.ratingsCount} 评价)
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <DownloadIcon className="h-4 w-4 mr-1" />
              <span>{plugin.downloads.toLocaleString()} 下载</span>
            </div>
            <Button className="w-full md:w-auto">安装插件</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">插件详情</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>{plugin.longDescription}</p>

              <h3>功能特点</h3>
              <ul>
                {plugin.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>

              <h3>使用示例</h3>
              <pre className="bg-muted/50 p-4 rounded-md overflow-x-auto">
                <code>{plugin.usageExample}</code>
              </pre>
            </div>
          </div>

          {renderComments(plugin.comments)}
        </div>

        <div>
          <div className="bg-card rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">插件信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">版本</span>
                <span className="font-medium">{plugin.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">发布日期</span>
                <span>{plugin.published}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">最后更新</span>
                <span>{plugin.updated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">大小</span>
                <span>{plugin.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">语言</span>
                <span>{plugin.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">许可证</span>
                <span>{plugin.license}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">作者</span>
                <a href={plugin.authorUrl} className="text-blue-600 hover:underline">
                  {plugin.author}
                </a>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium mb-2">依赖</h4>
                <div className="space-y-1">
                  {plugin.dependencies.map((dep, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{dep.name}</span>
                      <span>{dep.version}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <a href={plugin.repository} target="_blank" rel="noopener noreferrer">
                    源代码
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <a href={plugin.homepage} target="_blank" rel="noopener noreferrer">
                    主页
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">分享插件</h3>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <ShareIcon className="h-4 w-4 mr-2" /> 分享
              </Button>
              <Button variant="outline" className="flex-1">
                <HeartIcon className="h-4 w-4 mr-2" /> 收藏
              </Button>
            </div>
          </div>

          {renderVersionHistory(plugin.versions)}
        </div>
      </div>
    </div>
  );
}; 