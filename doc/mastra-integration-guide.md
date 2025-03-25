# Mastra 集成指南

本文档详细介绍了如何将 Extism 插件与 Mastra 工具平台集成，实现功能扩展和互操作性。

## 目录

- [概述](#概述)
- [前提条件](#前提条件)
- [集成架构](#集成架构)
- [基本集成流程](#基本集成流程)
- [高级功能](#高级功能)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)
- [示例项目](#示例项目)

## 概述

Mastra 是一个强大的工具和插件平台，而 Extism 提供了跨语言的插件开发能力。通过 Mastra 集成，开发者可以：

1. 将 Extism 插件注册为 Mastra 工具
2. 使用 Mastra 平台管理和调用 Extism 插件
3. 在 Mastra 工作流中编排 Extism 插件
4. 共享和发现更多 Extism 插件

## 前提条件

开始集成前，请确保您已具备：

- Extism 插件生态系统的基本了解
- 已开发并测试的 Extism 插件
- Mastra 平台账号和 API 密钥
- Node.js 环境（用于运行集成代码）

## 集成架构

Extism 与 Mastra 的集成基于以下架构：

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Extism 插件    │◄────┤  集成适配层     │
│                 │     │                 │
└─────────────────┘     └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │                 │
                        │  Mastra API     │
                        │                 │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │                 │
                        │  Mastra 平台    │
                        │                 │
                        └─────────────────┘
```

集成适配层负责：
- 将 Extism 插件转换为 Mastra 工具格式
- 处理输入输出格式转换
- 管理身份验证和权限
- 处理错误和异常情况

## 基本集成流程

### 1. 安装集成库

```bash
npm install @mastra/extism-integration
```

### 2. 配置集成

创建集成配置文件 `mastra-config.js`：

```javascript
module.exports = {
  apiKey: process.env.MASTRA_API_KEY,
  baseUrl: 'https://api.mastra.ai',
  defaultCategory: 'Extism Tools',
  pluginsDir: './plugins'
};
```

### 3. 创建集成脚本

创建 `integrate.js` 文件：

```javascript
const { MastraIntegration } = require('@mastra/extism-integration');
const config = require('./mastra-config.js');

async function integratePlugins() {
  // 初始化集成
  const mastra = new MastraIntegration(config);
  
  try {
    // 注册单个插件
    await mastra.registerPluginAsTool('hello-world', '1.0.0', {
      name: 'Hello World Tool',
      description: '示例问候工具',
      category: 'Demo'
    });
    
    console.log('插件已注册为 Mastra 工具');
    
    // 列出注册的工具
    const tools = await mastra.listTools();
    console.log('工具列表:', tools);
    
  } catch (error) {
    console.error('集成失败:', error);
  }
}

integratePlugins();
```

### 4. 运行集成

```bash
MASTRA_API_KEY=your-api-key node integrate.js
```

### 5. 验证集成

登录 Mastra 平台，在工具列表中应该能看到新注册的工具。

## 高级功能

### 批量注册插件

您可以批量注册多个插件：

```javascript
// 批量注册脚本: batch-register.js
const { MastraIntegration } = require('@mastra/extism-integration');
const config = require('./mastra-config.js');
const fs = require('fs');
const path = require('path');

async function batchRegister() {
  const mastra = new MastraIntegration(config);
  
  // 读取插件目录
  const pluginsDir = config.pluginsDir;
  const plugins = fs.readdirSync(pluginsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(pluginsDir, file)));
      return {
        name: data.name,
        version: data.version,
        config: {
          name: data.displayName || data.name,
          description: data.description,
          category: data.category || config.defaultCategory,
          icon: data.icon
        }
      };
    });
  
  console.log(`找到 ${plugins.length} 个插件配置`);
  
  // 批量注册
  for (const plugin of plugins) {
    try {
      await mastra.registerPluginAsTool(
        plugin.name, 
        plugin.version,
        plugin.config
      );
      console.log(`已注册: ${plugin.name}@${plugin.version}`);
    } catch (error) {
      console.error(`注册失败 ${plugin.name}: ${error.message}`);
    }
  }
}

batchRegister();
```

### 创建符合 Mastra 规范的插件

为了更好地与 Mastra 集成，您可以按照以下模板开发专门的 Mastra 工具插件：

```typescript
// mastra-tool-plugin.ts
import { Plugin } from '../src/core/pdk/typescript';

// 定义 Mastra 工具处理函数
function processToolRequest(input: string): string {
  // 解析输入 (Mastra 工具输入格式)
  const request = JSON.parse(input);
  
  // 处理请求
  const result = {
    status: 'success',
    result: `Processed: ${request.input}`,
    metadata: {
      processingTime: '100ms',
      version: '1.0.0'
    }
  };
  
  // 返回 Mastra 格式的响应
  return JSON.stringify(result);
}

// 创建并注册插件
const plugin = new Plugin();
plugin.register('process', processToolRequest);

export default plugin;
```

### 插件元数据增强

为使插件在 Mastra 平台上表现更好，可以在 `plugin.json` 中添加额外的 Mastra 相关元数据：

```json
{
  "name": "data-processor",
  "version": "1.0.0",
  "description": "数据处理插件",
  "main": "./dist/data-processor.wasm",
  "author": "开发者名称",
  "license": "MIT",
  "mastra": {
    "displayName": "数据处理工具",
    "category": "数据工具",
    "icon": "data:image/svg+xml,...",
    "examples": [
      {
        "name": "基本示例",
        "input": {"data": "example"},
        "output": {"result": "processed example"}
      }
    ],
    "parameters": [
      {
        "name": "data",
        "type": "string",
        "description": "要处理的数据",
        "required": true
      },
      {
        "name": "options",
        "type": "object",
        "description": "处理选项",
        "required": false
      }
    ]
  }
}
```

## 最佳实践

### 输入输出格式

确保您的 Extism 插件能够处理 Mastra 工具输入格式，并返回符合 Mastra 规范的输出格式：

```typescript
// 标准 Mastra 输入格式
interface MastraInput {
  inputs: {
    [key: string]: any;
  };
  context?: {
    [key: string]: any;
  };
}

// 标准 Mastra 输出格式
interface MastraOutput {
  status: 'success' | 'error';
  result?: any;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata?: {
    [key: string]: any;
  };
}
```

### 错误处理

优雅地处理插件中的错误，确保返回格式化的错误信息：

```typescript
function processWithErrorHandling(input: string): string {
  try {
    // 解析输入
    const request = JSON.parse(input);
    
    // 处理逻辑
    // ...
    
    // 返回成功结果
    return JSON.stringify({
      status: 'success',
      result: processedResult
    });
  } catch (error) {
    // 返回格式化的错误
    return JSON.stringify({
      status: 'error',
      error: {
        message: error.message,
        code: error.code || 'PROCESSING_ERROR',
        details: { stack: error.stack }
      }
    });
  }
}
```

### 版本管理

采用语义化版本，并在每次更新时确保正确更新 Mastra 工具注册：

```javascript
// 更新工具版本
async function updateToolVersion(toolName, newVersion) {
  const mastra = new MastraIntegration(config);
  
  // 先注销旧版本 (可选)
  try {
    await mastra.unregisterTool(toolName);
    console.log(`已注销工具 ${toolName}`);
  } catch (error) {
    console.log(`注销工具失败: ${error.message}`);
  }
  
  // 注册新版本
  await mastra.registerPluginAsTool(toolName, newVersion, {
    name: toolName,
    description: '更新后的工具描述',
    category: 'Updated Tools'
  });
  
  console.log(`工具 ${toolName} 已更新到版本 ${newVersion}`);
}
```

### 配置可覆盖性

设计允许在 Mastra 平台上覆盖的插件配置：

```typescript
function processWithConfig(input: string): string {
  const request = JSON.parse(input);
  
  // 合并默认配置和请求中的配置
  const config = {
    ...DEFAULT_CONFIG,
    ...(request.config || {})
  };
  
  // 使用合并后的配置处理
  return JSON.stringify({
    status: 'success',
    result: processWithConfiguration(request.input, config)
  });
}
```

## 故障排除

### 注册失败

如果插件注册为 Mastra 工具失败：

1. 检查 API 密钥是否有效
2. 确保插件名称和版本正确
3. 验证插件 WASM 文件是否可访问
4. 检查网络连接和防火墙设置
5. 查看 Mastra API 返回的具体错误消息

### 工具调用错误

如果 Mastra 工具调用插件时出错：

1. 检查插件是否正确处理 Mastra 输入格式
2. 确保插件返回符合 Mastra 格式的响应
3. 验证插件是否正确处理错误情况
4. 检查插件的内存和CPU限制是否足够
5. 在 Mastra 平台上查看详细的错误日志

### 权限问题

如果出现权限相关错误：

1. 确保 API 密钥具有注册工具的权限
2. 检查插件是否请求了 Mastra 平台不允许的权限
3. 验证插件是否符合 Mastra 的安全策略
4. 联系 Mastra 平台管理员获取更多权限信息

## 示例项目

### 基础集成示例

完整的基础集成项目结构：

```
mastra-integration-example/
├── package.json
├── mastra-config.js
├── integrate.js
├── plugins/
│   ├── hello-world/
│   │   ├── plugin.json
│   │   ├── index.ts
│   │   └── dist/
│   │       └── hello-world.wasm
│   └── data-processor/
│       ├── plugin.json
│       ├── index.ts
│       └── dist/
│           └── data-processor.wasm
└── README.md
```

`package.json`:

```json
{
  "name": "mastra-integration-example",
  "version": "1.0.0",
  "description": "Extism 插件与 Mastra 集成示例",
  "main": "integrate.js",
  "scripts": {
    "integrate": "node integrate.js",
    "batch": "node batch-register.js"
  },
  "dependencies": {
    "@mastra/extism-integration": "^1.0.0"
  }
}
```

### 高级集成示例

查看 [GitHub 仓库](https://github.com/yourusername/extism-mastra-integration) 获取完整的高级集成示例，包括：

- 自定义 Mastra 工具适配器
- 复杂参数处理
- 集成测试套件
- CI/CD 集成流程
- 企业部署示例

## 总结

通过本指南，您已经学会如何将 Extism 插件与 Mastra 平台集成，使您的插件能够在 Mastra 生态系统中作为工具使用。随着集成的深入，您可以逐步应用高级技术，创建更加强大和用户友好的工具。 