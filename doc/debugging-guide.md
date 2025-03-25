# Extism 插件调试指南

插件开发过程中，调试是一个必不可少的环节。本指南将介绍调试 Extism 插件的各种技术和工具，帮助您快速定位和解决问题。

## 目录

- [调试环境设置](#调试环境设置)
- [常见错误类型](#常见错误类型)
- [日志记录技巧](#日志记录技巧)
- [内存问题排查](#内存问题排查)
- [性能分析](#性能分析)
- [调试工具](#调试工具)
- [高级调试技术](#高级调试技术)
- [故障排除清单](#故障排除清单)

## 调试环境设置

### 开发环境配置

在开始调试之前，配置适当的开发环境非常重要：

1. **启用调试模式**：

```typescript
// 在开发环境中启用调试模式
const plugin = new Plugin({
  debug: true,
  logLevel: 'verbose'
});
```

2. **设置源码映射**：

确保您的构建过程生成源码映射文件，这样可以在调试时看到原始源码而不是编译后的代码：

```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,
    // 其他配置...
  }
}
```

3. **启用检查工具**：

```bash
# 使用 TypeScript 的严格检查
npx tsc --noEmit --strict

# 使用 ESLint 进行代码检查
npx eslint src/**/*.ts
```

## 常见错误类型

### 1. 编译时错误

这些通常与类型不匹配、语法错误或导入错误有关：

```typescript
// 错误示例: 类型不匹配
function processNumber(num: number): number {
  return num * 2;
}

plugin.register('process', (input: string) => {
  // 错误: 类型不兼容
  return processNumber(input);
});

// 修正: 转换类型
plugin.register('process', (input: string) => {
  const num = parseInt(input, 10);
  if (isNaN(num)) {
    throw new Error('输入必须是数字');
  }
  return processNumber(num).toString();
});
```

### 2. 运行时错误

这些发生在插件执行期间：

```typescript
// 常见运行时错误: 空指针引用
plugin.register('process_data', (data: string) => {
  const obj = JSON.parse(data);
  // 如果 user 为 undefined，这会引发错误
  return obj.user.name;
});

// 修正: 添加防御性检查
plugin.register('process_data', (data: string) => {
  try {
    const obj = JSON.parse(data);
    if (!obj || !obj.user) {
      return '未找到用户';
    }
    return obj.user.name || '未指定名称';
  } catch (error) {
    return `解析错误: ${error.message}`;
  }
});
```

### 3. 宿主函数错误

与宿主函数交互时出现的问题：

```typescript
// 错误: 缺少错误处理
plugin.useHostFunction('http_get', async (url: string) => {
  const response = await fetch(url);
  return response.text();
});

// 修正: 添加错误处理
plugin.useHostFunction('http_get', async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    return response.text();
  } catch (error) {
    console.error(`请求失败: ${error.message}`);
    throw error; // 重新抛出以通知插件
  }
});
```

## 日志记录技巧

### 结构化日志记录

实现结构化日志记录以便于排查问题：

```typescript
// 创建日志帮助函数
function logEvent(type: string, message: string, data?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    ...(data && { data })
  };
  
  // 使用宿主函数记录日志
  plugin.callHostFunction('log', JSON.stringify(logEntry));
}

// 使用示例
plugin.register('process_order', (orderData: string) => {
  logEvent('INFO', '开始处理订单');
  
  try {
    const order = JSON.parse(orderData);
    logEvent('DEBUG', '订单数据解析成功', { orderId: order.id });
    
    // 处理逻辑...
    
    logEvent('INFO', '订单处理完成', { orderId: order.id, status: 'completed' });
    return JSON.stringify({ success: true });
  } catch (error) {
    logEvent('ERROR', '订单处理失败', { error: error.message, stack: error.stack });
    return JSON.stringify({ success: false, error: error.message });
  }
});
```

### 日志级别

使用不同的日志级别区分信息重要性：

```typescript
enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR
}

// 当前设置的日志级别
let currentLogLevel = LogLevel.INFO;

function log(level: LogLevel, message: string, data?: any) {
  if (level >= currentLogLevel) {
    const levelName = LogLevel[level];
    plugin.callHostFunction('log', JSON.stringify({
      level: levelName,
      message,
      data,
      timestamp: new Date().toISOString()
    }));
  }
}

// 使用示例
log(LogLevel.DEBUG, "调试信息", { detail: "额外数据" });
log(LogLevel.ERROR, "严重错误", { code: 500 });
```

## 内存问题排查

### 内存泄漏检测

```typescript
// 创建内存使用跟踪
const memoryUsage = {
  allocations: 0,
  freed: 0,
  active: 0,
  report: function() {
    return {
      total: this.allocations,
      freed: this.freed,
      active: this.active
    };
  }
};

// 获取内存管理器的包装器
function getManagedMemory() {
  const memory = plugin.getMemory();
  
  return {
    allocate: (size: number) => {
      memoryUsage.allocations++;
      memoryUsage.active++;
      return memory.allocate(size);
    },
    free: (ptr: number) => {
      memoryUsage.freed++;
      memoryUsage.active--;
      memory.free(ptr);
    },
    getUsage: () => memoryUsage.report()
  };
}

// 使用示例
plugin.register('process_large_data', (data: string) => {
  const mem = getManagedMemory();
  
  // 分配内存
  const ptr = mem.allocate(data.length * 2);
  
  try {
    // 处理数据...
    return `处理完成，内存使用: ${JSON.stringify(mem.getUsage())}`;
  } finally {
    // 释放内存
    mem.free(ptr);
  }
});
```

### 优化大型数据处理

当处理大型数据时，考虑分块处理：

```typescript
plugin.register('process_large_array', (dataStr: string) => {
  const data = JSON.parse(dataStr);
  const results = [];
  const CHUNK_SIZE = 1000; // 每次处理1000个元素
  
  // 分块处理大型数组
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    
    // 处理当前块
    const processedChunk = chunk.map(item => /* 处理逻辑 */);
    results.push(...processedChunk);
    
    // 记录进度
    log(LogLevel.DEBUG, `已处理 ${Math.min(i + CHUNK_SIZE, data.length)}/${data.length} 项`);
  }
  
  return JSON.stringify(results);
});
```

## 性能分析

### 函数执行时间测量

创建一个简单的性能测量函数：

```typescript
function measureExecutionTime<T>(
  fn: () => T,
  name: string
): T {
  const start = Date.now();
  try {
    return fn();
  } finally {
    const end = Date.now();
    log(LogLevel.DEBUG, `性能: ${name} 耗时 ${end - start}ms`);
  }
}

// 使用示例
plugin.register('process_data', (data: string) => {
  return measureExecutionTime(() => {
    // 处理逻辑...
    const result = /* 复杂操作 */;
    return result;
  }, 'process_data');
});
```

### 识别性能瓶颈

对各个步骤进行性能测量，找出瓶颈所在：

```typescript
plugin.register('complex_operation', (input: string) => {
  // 步骤1: 解析输入
  const data = measureExecutionTime(() => {
    return JSON.parse(input);
  }, 'parse_input');
  
  // 步骤2: 数据转换
  const transformed = measureExecutionTime(() => {
    return data.map(item => /* 转换逻辑 */);
  }, 'transform_data');
  
  // 步骤3: 聚合结果
  const results = measureExecutionTime(() => {
    return transformed.reduce((acc, item) => /* 聚合逻辑 */, {});
  }, 'aggregate_results');
  
  // 步骤4: 格式化输出
  return measureExecutionTime(() => {
    return JSON.stringify(results);
  }, 'format_output');
});
```

## 调试工具

### Extism 调试器

使用 Extism CLI 提供的调试功能：

```bash
# 运行插件并开启调试
extism run --debug plugin.wasm --function get_weather --input '{"location":"Beijing"}'
```

### 调试日志可视化

对于复杂的插件调试，可以创建一个调试可视化工具：

```javascript
// debug-visualizer.js
const fs = require('fs');
const path = require('path');

// 读取日志文件
const logs = fs.readFileSync(path.join(__dirname, 'plugin-debug.log'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map(line => JSON.parse(line));

// 按类型组织日志
const logsByType = {};
logs.forEach(log => {
  if (!logsByType[log.type]) {
    logsByType[log.type] = [];
  }
  logsByType[log.type].push(log);
});

// 生成性能报告
const perfLogs = logs.filter(log => log.type === 'PERF');
console.log('性能报告:');
perfLogs.forEach(log => {
  console.log(`- ${log.data.operation}: ${log.data.duration}ms`);
});

// 错误报告
const errors = logs.filter(log => log.type === 'ERROR');
if (errors.length > 0) {
  console.log('\n错误报告:');
  errors.forEach(error => {
    console.log(`- [${error.timestamp}] ${error.message}`);
    if (error.data) {
      console.log(`  详情: ${JSON.stringify(error.data)}`);
    }
  });
}
```

## 高级调试技术

### 模拟宿主环境

创建一个模拟的宿主环境进行本地调试：

```typescript
// mock-host.ts
import { readFileSync } from 'fs';
import { Plugin } from '@extism/extism';

// 加载插件
async function loadPluginForDebugging(pluginPath: string) {
  const plugin = new Plugin();
  
  // 模拟宿主函数
  const mockHostFunctions = {
    // 模拟 HTTP 请求
    http_get: async (url: string) => {
      console.log(`[模拟] HTTP GET 请求: ${url}`);
      // 返回模拟数据
      return JSON.stringify({
        status: 200,
        body: '{"data": "模拟响应数据"}'
      });
    },
    
    // 模拟日志
    log: (message: string) => {
      console.log(`[插件日志] ${message}`);
    },
    
    // 模拟文件系统访问
    read_file: (path: string) => {
      console.log(`[模拟] 读取文件: ${path}`);
      try {
        return readFileSync(path, 'utf8');
      } catch (error) {
        console.error(`[模拟] 文件读取错误: ${error.message}`);
        throw new Error(`无法读取文件: ${error.message}`);
      }
    }
  };
  
  // 注册所有模拟宿主函数
  for (const [name, fn] of Object.entries(mockHostFunctions)) {
    plugin.useHostFunction(name, fn);
  }
  
  return plugin;
}

// 测试特定插件函数
async function testPluginFunction(
  plugin: Plugin,
  functionName: string,
  input: any
) {
  console.log(`[测试] 调用函数 '${functionName}' 输入:`, input);
  
  try {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    const result = await plugin.call(functionName, inputStr);
    
    console.log(`[测试] 函数 '${functionName}' 返回:`, result);
    return result;
  } catch (error) {
    console.error(`[测试] 函数 '${functionName}' 执行错误:`, error);
    throw error;
  }
}

// 使用示例
async function main() {
  const plugin = await loadPluginForDebugging('./dist/my-plugin.wasm');
  
  // 测试插件函数
  await testPluginFunction(plugin, 'get_weather', { location: 'Beijing' });
  await testPluginFunction(plugin, 'process_data', { items: [1, 2, 3] });
  
  // 释放资源
  plugin.free();
}

main().catch(console.error);
```

### 调试断点技术

在 WebAssembly 中实现软断点：

```typescript
// debug-break 函数用于创建可以手动触发的断点
function debugBreak(condition: boolean, message: string, data?: any): void {
  if (!condition) {
    return;
  }
  
  // 记录断点信息
  log(LogLevel.DEBUG, `断点触发: ${message}`, data);
  
  // 只在调试模式下执行以下代码
  if (process.env.DEBUG_MODE === 'true') {
    // 这将记录完整堆栈
    console.trace(`断点: ${message}`);
    
    // 在Node.js环境中可以使用以下代码暂停执行
    // 注意：这只在非生产环境有效
    // eslint-disable-next-line no-debugger
    debugger;
  }
}

// 使用示例
plugin.register('process_transaction', (txData: string) => {
  const tx = JSON.parse(txData);
  
  // 当满足特定条件时设置断点
  debugBreak(
    tx.amount > 10000, 
    '大金额交易',
    { txId: tx.id, amount: tx.amount }
  );
  
  // 正常处理...
});
```

## 故障排除清单

使用以下清单快速排查常见问题：

### 编译问题

- [ ] TypeScript 类型检查是否通过？
- [ ] 构建脚本是否正确配置？
- [ ] 是否使用了不兼容的 API？
- [ ] 依赖项是否都正确安装？
- [ ] 导入路径是否正确？

### 运行时问题

- [ ] 插件是否正确注册了所有必需的函数？
- [ ] 输入参数是否符合预期格式？
- [ ] 是否正确处理了 JSON 解析和序列化？
- [ ] 是否处理了所有可能的错误情况？
- [ ] 是否正确使用了宿主函数？

### 性能问题

- [ ] 是否存在不必要的数据复制？
- [ ] 是否有效率低下的算法？
- [ ] 是否在循环中执行昂贵操作？
- [ ] 内存使用是否得到优化？
- [ ] 是否过度使用宿主函数调用？

### 内存问题

- [ ] 是否存在未释放的内存分配？
- [ ] 是否正确管理了大型数据结构？
- [ ] 是否考虑了内存使用限制？
- [ ] 缓存策略是否合理？

## 结论

调试是插件开发过程中不可或缺的一部分。通过使用本指南中介绍的技术和工具，您可以更高效地找出并解决插件中的问题。记住，良好的日志记录和系统性的调试方法是成功解决复杂问题的关键。

随着您对 Extism 插件开发经验的积累，您将开发出自己的调试技巧和最佳实践。定期查看和更新您的调试策略，以适应新的挑战和项目需求。

---

*最后更新: 2023年6月18日* 