# Extism 插件开发教程

本教程将指导您从零开始创建、测试和发布一个 Extism 插件。我们将使用 TypeScript 作为主要语言，但原理适用于所有支持的编程语言。

## 目录

- [环境准备](#环境准备)
- [创建基础插件](#创建基础插件)
- [添加高级功能](#添加高级功能)
- [测试插件](#测试插件)
- [优化与性能](#优化与性能)
- [打包与发布](#打包与发布)
- [实战示例](#实战示例)

## 环境准备

### 安装必要工具

开始前，确保您的系统已安装：

1. Node.js (v14+) 和 npm
2. TypeScript
3. Extism CLI 工具

```bash
# 安装 TypeScript
npm install -g typescript

# 安装 Extism CLI
npm install -g @extism/cli
```

### 创建项目

初始化一个新的项目：

```bash
# 创建项目目录
mkdir weather-plugin
cd weather-plugin

# 初始化 npm 项目
npm init -y

# 安装依赖
npm install --save-dev typescript @types/node
npm install --save @extism/extism
```

### 配置 TypeScript

创建 `tsconfig.json` 文件：

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

## 创建基础插件

### 项目结构

设置以下项目结构：

```
weather-plugin/
├── src/
│   ├── index.ts        # 主入口文件
│   └── utils/          # 工具函数
│       └── helpers.ts
├── test/
│   └── index.test.js   # 测试文件
├── tsconfig.json       # TypeScript 配置
├── package.json        # 项目配置
└── plugin.json         # 插件元数据
```

### 基础插件代码

创建 `src/index.ts` 文件：

```typescript
import { Plugin } from '@extism/plugin';

// 创建插件实例
const plugin = new Plugin();

/**
 * 获取当前天气
 * @param location 位置字符串 (城市名或坐标)
 * @returns 天气信息的JSON字符串
 */
function getCurrentWeather(location: string): string {
  // 简单实现，实际情况下会调用天气API
  const weatherInfo = {
    location: location,
    temperature: 22,
    condition: "晴天",
    humidity: 65,
    windSpeed: 10,
    timestamp: new Date().toISOString()
  };
  
  return JSON.stringify(weatherInfo);
}

// 注册插件函数
plugin.register("get_weather", getCurrentWeather);

// 导出插件
export default plugin;
```

### 创建帮助函数

创建 `src/utils/helpers.ts` 文件：

```typescript
/**
 * 验证位置输入是否有效
 * @param location 位置字符串
 * @returns 是否有效
 */
export function validateLocation(location: string): boolean {
  return location.trim().length > 0;
}

/**
 * 格式化温度
 * @param temp 温度值
 * @param format 格式 ('C' 或 'F')
 * @returns 格式化后的温度字符串
 */
export function formatTemperature(temp: number, format: 'C' | 'F' = 'C'): string {
  if (format === 'F') {
    temp = temp * 9/5 + 32;
    return `${temp.toFixed(1)}°F`;
  }
  return `${temp.toFixed(1)}°C`;
}
```

### 插件元数据

创建 `plugin.json` 文件：

```json
{
  "name": "weather-plugin",
  "version": "1.0.0",
  "description": "获取城市天气信息的 Extism 插件",
  "main": "./dist/weather-plugin.wasm",
  "author": "您的名字",
  "license": "MIT",
  "keywords": ["extism", "plugin", "weather", "api"],
  "repository": "https://github.com/yourusername/weather-plugin",
  "functions": [
    {
      "name": "get_weather",
      "inputs": [
        {
          "name": "location",
          "type": "string",
          "description": "位置信息 (城市名或坐标)"
        }
      ],
      "output": {
        "type": "string",
        "description": "包含天气信息的 JSON 字符串"
      }
    }
  ]
}
```

## 添加高级功能

现在让我们添加一些高级功能，包括宿主函数调用和状态管理。

### 更新插件代码

更新 `src/index.ts` 文件：

```typescript
import { Plugin, HostFunctions } from '@extism/plugin';
import { validateLocation, formatTemperature } from './utils/helpers';

// 创建插件实例
const plugin = new Plugin();

// 定义宿主函数 (需要宿主环境提供)
const hostFunctions: HostFunctions = {
  // HTTP 请求函数
  http_get: async (url: string): Promise<string> => {
    // 这个函数由宿主应用提供实现
    return ''; // 由宿主应用替换
  },
  
  // 日志函数
  log: (message: string): void => {
    // 由宿主应用实现
  }
};

// 插件状态
interface PluginState {
  cachedWeather: Record<string, {
    data: any,
    timestamp: number
  }>;
  requestCount: number;
}

// 初始状态
const state: PluginState = {
  cachedWeather: {},
  requestCount: 0
};

/**
 * 获取当前天气
 * @param location 位置字符串 (城市名或坐标)
 * @returns 天气信息的JSON字符串
 */
async function getCurrentWeather(location: string): Promise<string> {
  if (!validateLocation(location)) {
    throw new Error('无效的位置信息');
  }
  
  // 更新请求计数
  state.requestCount++;
  
  // 检查缓存
  const now = Date.now();
  const cachedData = state.cachedWeather[location];
  const cacheValidTime = 10 * 60 * 1000; // 10分钟缓存
  
  if (cachedData && (now - cachedData.timestamp) < cacheValidTime) {
    // 返回缓存数据
    return JSON.stringify({
      ...cachedData.data,
      cached: true,
      requestCount: state.requestCount
    });
  }
  
  try {
    // 使用宿主函数发起HTTP请求获取实际天气数据
    // 这里使用模拟数据，实际应该调用天气API
    // const apiUrl = `https://api.weather.example.com?location=${encodeURIComponent(location)}`;
    // const weatherData = await hostFunctions.http_get(apiUrl);
    
    // 模拟的天气数据
    const weatherData = {
      location: location,
      temperature: 22 + Math.random() * 10,
      condition: ["晴天", "多云", "小雨", "大雨"][Math.floor(Math.random() * 4)],
      humidity: 50 + Math.floor(Math.random() * 40),
      windSpeed: 5 + Math.floor(Math.random() * 20),
      timestamp: new Date().toISOString()
    };
    
    // 保存到缓存
    state.cachedWeather[location] = {
      data: weatherData,
      timestamp: now
    };
    
    // 添加格式化的温度
    const formattedTemp = formatTemperature(weatherData.temperature);
    
    // 返回结果
    return JSON.stringify({
      ...weatherData,
      formattedTemperature: formattedTemp,
      cached: false,
      requestCount: state.requestCount
    });
  } catch (error) {
    // 记录错误
    hostFunctions.log(`获取天气数据错误: ${error.message}`);
    throw new Error(`无法获取天气数据: ${error.message}`);
  }
}

/**
 * 清除特定位置的缓存
 * @param location 位置字符串
 * @returns 操作结果
 */
function clearCache(location: string): string {
  if (location === '*') {
    // 清除所有缓存
    state.cachedWeather = {};
    return JSON.stringify({ success: true, message: '所有缓存已清除' });
  }
  
  // 清除特定位置的缓存
  if (state.cachedWeather[location]) {
    delete state.cachedWeather[location];
    return JSON.stringify({ success: true, message: `${location} 的缓存已清除` });
  }
  
  return JSON.stringify({ 
    success: false, 
    message: `未找到 ${location} 的缓存` 
  });
}

/**
 * 获取插件状态信息
 * @returns 状态信息JSON字符串
 */
function getStatus(): string {
  const cacheCount = Object.keys(state.cachedWeather).length;
  
  return JSON.stringify({
    requestCount: state.requestCount,
    cachedLocations: cacheCount,
    memoryUsage: {
      cacheSize: JSON.stringify(state.cachedWeather).length
    }
  });
}

// 注册插件函数
plugin.register("get_weather", getCurrentWeather);
plugin.register("clear_cache", clearCache);
plugin.register("get_status", getStatus);

// 注册宿主函数
for (const [name, fn] of Object.entries(hostFunctions)) {
  plugin.useHostFunction(name, fn);
}

// 导出插件
export default plugin;
```

## 测试插件

### 创建测试宿主

创建 `test/host.js` 文件：

```javascript
const fs = require('fs');
const path = require('path');
const { Extism } = require('@extism/extism');

async function main() {
  try {
    // 初始化 Extism
    const extism = new Extism();
    
    // 加载插件
    const pluginPath = path.join(__dirname, '../dist/weather-plugin.wasm');
    const plugin = await extism.loadPlugin(pluginPath, {
      wasi: true,
      functions: [
        {
          // 实现 HTTP 请求宿主函数
          name: "http_get",
          inputs: ["string"],
          outputs: ["string"],
          callback: async (url) => {
            console.log(`[宿主] 发起 HTTP 请求到: ${url}`);
            // 简单模拟，实际应该使用 fetch 或其他 HTTP 客户端
            return JSON.stringify({ 
              temperature: 25, 
              condition: "多云",
              humidity: 60 
            });
          }
        },
        {
          // 实现日志宿主函数
          name: "log",
          inputs: ["string"],
          callback: (message) => {
            console.log(`[插件日志] ${message}`);
          }
        }
      ]
    });
    
    // 测试 get_weather 函数
    console.log("\n测试 get_weather 函数:");
    const location = "北京";
    const input = Buffer.from(location);
    let result = await plugin.call('get_weather', input);
    console.log(`${location} 的天气: ${result.toString()}`);
    
    // 测试再次请求 (应该使用缓存)
    console.log("\n再次请求相同位置 (应使用缓存):");
    result = await plugin.call('get_weather', input);
    console.log(`${location} 的天气: ${result.toString()}`);
    
    // 测试获取状态
    console.log("\n测试 get_status 函数:");
    result = await plugin.call('get_status');
    console.log(`插件状态: ${result.toString()}`);
    
    // 测试清除缓存
    console.log("\n测试 clear_cache 函数:");
    result = await plugin.call('clear_cache', input);
    console.log(`清除缓存结果: ${result.toString()}`);
    
    // 释放插件资源
    plugin.free();
    console.log("\n测试完成");
  } catch (error) {
    console.error("测试出错:", error);
  }
}

main();
```

### 创建构建脚本

创建 `scripts/build.js` 文件：

```javascript
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 构建配置
const config = {
  entry: './src/index.ts',
  outDir: './dist',
  outFile: 'weather-plugin.wasm',
  optimize: true
};

async function build() {
  try {
    console.log('开始构建插件...');
    
    // 确保输出目录存在
    if (!fs.existsSync(config.outDir)) {
      fs.mkdirSync(config.outDir, { recursive: true });
    }
    
    // 编译 TypeScript
    console.log('编译 TypeScript...');
    execSync('npx tsc', { stdio: 'inherit' });
    
    // 使用 Extism CLI 构建 WASM 插件
    console.log('构建 WASM 插件...');
    const outPath = path.join(config.outDir, config.outFile);
    const cmd = `npx extism-js ${config.entry} -o ${outPath} ${config.optimize ? '--optimize' : ''}`;
    
    execSync(cmd, { stdio: 'inherit' });
    
    console.log(`插件构建成功: ${outPath}`);
  } catch (error) {
    console.error('构建失败:', error);
    process.exit(1);
  }
}

build();
```

### 更新 package.json

更新 `package.json` 添加构建和测试脚本：

```json
{
  "name": "weather-plugin",
  "version": "1.0.0",
  "description": "获取城市天气信息的 Extism 插件",
  "main": "dist/index.js",
  "scripts": {
    "build": "node scripts/build.js",
    "test": "npm run build && node test/host.js"
  },
  "dependencies": {
    "@extism/extism": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^4.7.4"
  }
}
```

## 优化与性能

### 内存优化

更新 `src/index.ts` 增加内存优化：

```typescript
// 在文件顶部添加以下导入
import { MemoryManager } from '@extism/plugin';

// 添加内存管理函数
function processLargeData(data: string): string {
  // 获取内存管理器
  const memory = plugin.getMemory();
  
  // 分配内存
  const size = data.length * 2; // 预留足够空间
  const ptr = memory.allocate(size);
  
  try {
    // 在 WebAssembly 内存中处理数据
    // ... 在此执行数据处理逻辑 ...
    
    // 这里仅为示例
    const result = `Processed: ${data}`;
    
    return result;
  } finally {
    // 释放内存
    memory.free(ptr);
  }
}

// 注册此函数
plugin.register("process_large_data", processLargeData);
```

### 性能优化配置

创建 `optimization.config.js` 文件：

```javascript
module.exports = {
  // 构建优化选项
  build: {
    optimizeLevel: 3,         // 代码优化级别 (0-3)
    shrinkLevel: 2,           // 代码收缩级别 (0-2)
    inlining: true,           // 启用内联
    removeDeadCode: true,     // 移除死代码
    optimizeForSize: true,    // 为大小优化
  },
  
  // 运行时优化
  runtime: {
    enableCaching: true,      // 启用缓存
    cacheTimeoutMs: 600000,   // 缓存超时 (10分钟)
    memoryLimitMB: 10,        // 内存限制
    asyncProcessing: true     // 启用异步处理
  }
};
```

## 打包与发布

### 完善 plugin.json

更新 `plugin.json` 添加更多元数据：

```json
{
  "name": "weather-plugin",
  "version": "1.0.0",
  "description": "获取城市天气信息的 Extism 插件",
  "main": "./dist/weather-plugin.wasm",
  "author": "您的名字",
  "license": "MIT",
  "keywords": ["extism", "plugin", "weather", "api"],
  "repository": "https://github.com/yourusername/weather-plugin",
  "dependencies": {},
  "hostFunctions": [
    {
      "name": "http_get",
      "inputs": ["string"],
      "outputs": ["string"],
      "description": "发起 HTTP GET 请求"
    },
    {
      "name": "log",
      "inputs": ["string"],
      "description": "记录日志消息"
    }
  ],
  "functions": [
    {
      "name": "get_weather",
      "inputs": [
        {
          "name": "location",
          "type": "string",
          "description": "位置信息 (城市名或坐标)"
        }
      ],
      "output": {
        "type": "string",
        "description": "包含天气信息的 JSON 字符串"
      },
      "description": "获取指定位置的当前天气信息"
    },
    {
      "name": "clear_cache",
      "inputs": [
        {
          "name": "location",
          "type": "string",
          "description": "位置信息或 '*' 清除所有缓存"
        }
      ],
      "output": {
        "type": "string",
        "description": "操作结果的 JSON 字符串"
      },
      "description": "清除指定位置的天气缓存"
    },
    {
      "name": "get_status",
      "output": {
        "type": "string",
        "description": "插件状态的 JSON 字符串"
      },
      "description": "获取插件的当前状态信息"
    }
  ],
  "permissions": {
    "network": ["api.weather.example.com"]
  }
}
```

### 创建发布脚本

创建 `scripts/publish.js` 文件：

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 读取插件元数据
const pluginJson = JSON.parse(fs.readFileSync('./plugin.json', 'utf8'));
const { name, version } = pluginJson;

async function publishPlugin() {
  try {
    console.log(`准备发布 ${name}@${version}...`);
    
    // 确保插件已构建
    if (!fs.existsSync('./dist/weather-plugin.wasm')) {
      console.log('插件未构建，开始构建...');
      execSync('npm run build', { stdio: 'inherit' });
    }
    
    // 登录到 Extism 注册表
    // 首次运行时需要先登录: npx extism-registry login
    console.log('登录到 Extism 注册表...');
    
    // 发布插件
    console.log('发布插件...');
    execSync('npx extism-registry publish ./plugin.json', { 
      stdio: 'inherit' 
    });
    
    console.log(`插件 ${name}@${version} 发布成功!`);
  } catch (error) {
    console.error('发布失败:', error);
    process.exit(1);
  }
}

publishPlugin();
```

## 实战示例

最后，让我们在 `examples` 目录中添加一个完整的实战示例。

### 创建示例应用

创建 `examples/weather-app/index.js` 文件：

```javascript
const express = require('express');
const { Extism } = require('@extism/extism');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

async function main() {
  // 初始化 Express 应用
  const app = express();
  const port = process.env.PORT || 3000;
  
  // 初始化 Extism
  const extism = new Extism();
  
  // 加载天气插件
  const pluginPath = path.join(__dirname, '../../dist/weather-plugin.wasm');
  const plugin = await extism.loadPlugin(pluginPath, {
    wasi: true,
    functions: [
      {
        // 实现真实的 HTTP 请求宿主函数
        name: "http_get",
        inputs: ["string"],
        outputs: ["string"],
        callback: async (url) => {
          console.log(`发起 HTTP 请求: ${url}`);
          try {
            const response = await fetch(url);
            return await response.text();
          } catch (error) {
            console.error(`HTTP 请求错误: ${error.message}`);
            return JSON.stringify({ error: error.message });
          }
        }
      },
      {
        // 实现日志宿主函数
        name: "log",
        inputs: ["string"],
        callback: (message) => {
          console.log(`[插件日志] ${message}`);
        }
      }
    ]
  });
  
  // 设置静态文件目录
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());
  
  // API 端点 - 获取天气
  app.get('/api/weather/:location', async (req, res) => {
    try {
      const location = req.params.location;
      const result = await plugin.call('get_weather', Buffer.from(location));
      res.json(JSON.parse(result.toString()));
    } catch (error) {
      console.error(`处理请求错误: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });
  
  // API 端点 - 获取插件状态
  app.get('/api/status', async (req, res) => {
    try {
      const result = await plugin.call('get_status');
      res.json(JSON.parse(result.toString()));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // API 端点 - 清除缓存
  app.post('/api/clear-cache', async (req, res) => {
    try {
      const location = req.body.location || '*';
      const result = await plugin.call('clear_cache', Buffer.from(location));
      res.json(JSON.parse(result.toString()));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // 启动服务器
  app.listen(port, () => {
    console.log(`天气应用运行在 http://localhost:${port}`);
  });
  
  // 处理进程终止，释放插件资源
  process.on('SIGINT', () => {
    console.log('正在关闭应用...');
    plugin.free();
    process.exit(0);
  });
}

main().catch(console.error);
```

### 创建示例前端

创建 `examples/weather-app/public/index.html` 文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>天气查询应用</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    .weather-card {
      transition: all 0.3s ease;
    }
    .weather-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .cached-badge {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  </style>
</head>
<body>
  <div class="container py-5">
    <h1 class="text-center mb-4">天气查询应用</h1>
    <p class="text-center text-muted mb-5">使用 Extism 天气插件构建的示例应用</p>
    
    <div class="row justify-content-center mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input type="text" id="location-input" class="form-control" placeholder="输入城市名称..." aria-label="城市名称">
          <button class="btn btn-primary" type="button" id="search-btn">查询天气</button>
        </div>
      </div>
    </div>
    
    <div class="row justify-content-center mb-5">
      <div class="col-md-6">
        <div id="weather-display" class="card weather-card d-none">
          <div class="card-body">
            <span id="cached-badge" class="cached-badge badge bg-info d-none">缓存数据</span>
            <h2 class="card-title" id="location-display">城市名称</h2>
            <div class="row">
              <div class="col-md-6">
                <h3 id="temp-display" class="display-4">--°C</h3>
                <p id="condition-display" class="lead">天气状况</p>
              </div>
              <div class="col-md-6">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item d-flex justify-content-between">
                    <span>湿度:</span>
                    <span id="humidity-display">--</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between">
                    <span>风速:</span>
                    <span id="wind-display">--</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between">
                    <span>更新时间:</span>
                    <span id="time-display">--</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row justify-content-center">
      <div class="col-md-3">
        <button id="clear-cache-btn" class="btn btn-outline-danger w-100">清除缓存</button>
      </div>
      <div class="col-md-3">
        <button id="status-btn" class="btn btn-outline-secondary w-100">查看插件状态</button>
      </div>
    </div>
    
    <div class="mt-4">
      <div id="status-display" class="card d-none">
        <div class="card-header">插件状态</div>
        <div class="card-body">
          <pre id="status-json" class="mb-0">...</pre>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const locationInput = document.getElementById('location-input');
      const searchBtn = document.getElementById('search-btn');
      const weatherDisplay = document.getElementById('weather-display');
      const cachedBadge = document.getElementById('cached-badge');
      const locationDisplay = document.getElementById('location-display');
      const tempDisplay = document.getElementById('temp-display');
      const conditionDisplay = document.getElementById('condition-display');
      const humidityDisplay = document.getElementById('humidity-display');
      const windDisplay = document.getElementById('wind-display');
      const timeDisplay = document.getElementById('time-display');
      const clearCacheBtn = document.getElementById('clear-cache-btn');
      const statusBtn = document.getElementById('status-btn');
      const statusDisplay = document.getElementById('status-display');
      const statusJson = document.getElementById('status-json');
      
      // 查询天气
      async function searchWeather() {
        const location = locationInput.value.trim();
        if (!location) return;
        
        try {
          const response = await fetch(`/api/weather/${encodeURIComponent(location)}`);
          const data = await response.json();
          
          if (data.error) {
            alert(`错误: ${data.error}`);
            return;
          }
          
          // 显示天气信息
          weatherDisplay.classList.remove('d-none');
          locationDisplay.textContent = data.location;
          tempDisplay.textContent = data.formattedTemperature || `${data.temperature}°C`;
          conditionDisplay.textContent = data.condition;
          humidityDisplay.textContent = `${data.humidity}%`;
          windDisplay.textContent = `${data.windSpeed} km/h`;
          timeDisplay.textContent = new Date(data.timestamp).toLocaleString();
          
          // 显示缓存标记
          if (data.cached) {
            cachedBadge.classList.remove('d-none');
          } else {
            cachedBadge.classList.add('d-none');
          }
        } catch (error) {
          alert(`请求失败: ${error.message}`);
        }
      }
      
      // 清除缓存
      async function clearCache() {
        try {
          const location = locationInput.value.trim() || '*';
          const response = await fetch('/api/clear-cache', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ location })
          });
          
          const data = await response.json();
          alert(data.message);
        } catch (error) {
          alert(`清除缓存失败: ${error.message}`);
        }
      }
      
      // 获取插件状态
      async function getStatus() {
        try {
          const response = await fetch('/api/status');
          const data = await response.json();
          
          statusDisplay.classList.remove('d-none');
          statusJson.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
          alert(`获取状态失败: ${error.message}`);
        }
      }
      
      // 绑定事件
      searchBtn.addEventListener('click', searchWeather);
      locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
      });
      clearCacheBtn.addEventListener('click', clearCache);
      statusBtn.addEventListener('click', getStatus);
    });
  </script>
</body>
</html>
```

### 示例依赖配置

创建 `examples/weather-app/package.json` 文件：

```json
{
  "name": "weather-app-example",
  "version": "1.0.0",
  "description": "使用 Extism 天气插件的示例应用",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@extism/extism": "^1.0.0",
    "express": "^4.18.2",
    "node-fetch": "^2.6.7"
  }
}
```

## 总结

通过本教程，您已经学习了如何：

1. 设置 Extism 插件开发环境
2. 创建基础插件功能
3. 添加高级特性，如宿主函数和状态管理
4. 测试和调试插件
5. 优化插件性能
6. 打包和发布插件
7. 在实际应用中使用插件

这只是 Extism 插件开发的起点。随着您继续探索，您可以创建更复杂、更强大的插件，用于各种用途，从数据处理到人工智能，从API集成到自定义工具。

祝您在 Extism 插件开发之旅中取得成功！ 