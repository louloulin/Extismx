# Extism 插件生态系统 API 参考

本文档提供了 Extism 插件生态系统的详细 API 参考，包括核心组件、PDK 接口、安全模块以及集成功能。

## 核心 API

### Registry

插件注册表是整个生态系统的核心，负责管理插件的发布、版本控制和查询。

```typescript
import { Registry } from '../src/core/registry';

// 创建注册表实例
const registry = new Registry({
  storagePath: './plugins',
  enableSignatureVerification: true
});

// 注册表方法
registry.publishPlugin(pluginInfo);
registry.getPlugin(name, version);
registry.listPlugins(options);
registry.searchPlugins(query);
registry.deletePlugin(name, version);
```

#### 方法

| 方法名 | 参数 | 返回值 | 描述 |
|-------|------|-------|------|
| `publishPlugin` | `PluginInfo` | `Promise<PublishResult>` | 发布一个新插件或更新现有插件 |
| `getPlugin` | `name: string, version: string` | `Promise<Plugin>` | 获取特定版本的插件 |
| `listPlugins` | `options?: ListOptions` | `Promise<Plugin[]>` | 列出所有插件，可选过滤条件 |
| `searchPlugins` | `query: string` | `Promise<Plugin[]>` | 搜索符合条件的插件 |
| `deletePlugin` | `name: string, version: string` | `Promise<boolean>` | 删除特定版本的插件 |

#### 类型定义

```typescript
interface PluginInfo {
  name: string;
  version: string;
  description?: string;
  main: string;
  author?: string;
  license?: string;
  dependencies?: Record<string, string>;
  keywords?: string[];
  tags?: string[];
  repository?: string;
  homepage?: string;
}

interface ListOptions {
  limit?: number;
  offset?: number;
  tags?: string[];
  author?: string;
}

interface PublishResult {
  success: boolean;
  id: string;
  message?: string;
}
```

### PackageManager

包管理器处理插件的安装、更新和卸载，并管理其依赖关系。

```typescript
import { PackageManager } from '../src/core/registry/package-manager';

// 创建包管理器实例
const pm = new PackageManager({
  registryUrl: 'https://registry.example.com',
  localPath: './node_modules'
});

// 包管理器方法
await pm.installPlugin('plugin-name', '1.0.0');
await pm.updatePlugin('plugin-name', 'latest');
await pm.uninstallPlugin('plugin-name');
const deps = await pm.listDependencies('plugin-name');
```

#### 方法

| 方法名 | 参数 | 返回值 | 描述 |
|-------|------|-------|------|
| `installPlugin` | `name: string, version: string` | `Promise<InstallResult>` | 安装指定版本的插件 |
| `updatePlugin` | `name: string, targetVersion?: string` | `Promise<UpdateResult>` | 更新插件到指定版本或最新版本 |
| `uninstallPlugin` | `name: string` | `Promise<boolean>` | 卸载插件 |
| `listDependencies` | `name: string, version?: string` | `Promise<Dependency[]>` | 列出插件的依赖 |

### DependencyResolver

依赖解析器负责分析和解决插件之间的依赖关系。

```typescript
import { DependencyResolver } from '../src/core/registry/dependency-resolver';

// 创建依赖解析器实例
const resolver = new DependencyResolver();

// 解析依赖
const resolvedDeps = await resolver.resolve('plugin-name', '1.0.0');

// 检查依赖冲突
const conflicts = await resolver.checkConflicts(dependencies);

// 生成依赖图
const graph = await resolver.generateDependencyGraph('plugin-name');
```

#### 方法

| 方法名 | 参数 | 返回值 | 描述 |
|-------|------|-------|------|
| `resolve` | `name: string, version: string` | `Promise<ResolvedDependency[]>` | 解析插件的所有依赖 |
| `checkConflicts` | `dependencies: Dependency[]` | `Promise<Conflict[]>` | 检查依赖中的冲突 |
| `generateDependencyGraph` | `name: string, version?: string` | `Promise<DependencyGraph>` | 生成完整的依赖图 |

### DependencyVisualizer

依赖可视化工具，用于生成依赖关系图和可视化报告。

```typescript
import { DependencyVisualizer } from '../src/core/registry/dependency-visualizer';

// 创建可视化工具实例
const visualizer = new DependencyVisualizer();

// 生成图形化展示
await visualizer.generateGraphViz('plugin-name', './graph.png');

// 生成 HTML 报告
await visualizer.generateHtmlReport('plugin-name', './report.html');
```

#### 方法

| 方法名 | 参数 | 返回值 | 描述 |
|-------|------|-------|------|
| `generateGraphViz` | `name: string, outputPath: string` | `Promise<void>` | 生成 GraphViz 格式的依赖图 |
| `generateHtmlReport` | `name: string, outputPath: string` | `Promise<void>` | 生成交互式 HTML 依赖报告 |
| `generateJsonOutput` | `name: string` | `Promise<string>` | 生成 JSON 格式的依赖数据 |

### DocGenerator

文档生成器，用于自动生成插件的文档。

```typescript
import { DocGenerator } from '../src/core/registry/doc-generator';

// 创建文档生成器实例
const docGen = new DocGenerator();

// 为单个插件生成文档
await docGen.generatePluginDocs('plugin-name', './docs');

// 为所有插件生成文档
await docGen.generateAllDocs('./docs');

// 生成 API 参考文档
await docGen.generateApiReference('./api-reference.md');
```

#### 方法

| 方法名 | 参数 | 返回值 | 描述 |
|-------|------|-------|------|
| `generatePluginDocs` | `name: string, outputDir: string` | `Promise<void>` | 为单个插件生成文档 |
| `generateAllDocs` | `outputDir: string` | `Promise<void>` | 为注册表中的所有插件生成文档 |
| `generateApiReference` | `outputPath: string` | `Promise<void>` | 生成 API 参考文档 |
| `extractTypes` | `pluginPath: string` | `Promise<TypeInfo[]>` | 从插件中提取类型信息 |

## PDK API

### TypeScript PDK

TypeScript PDK 提供了在 TypeScript/JavaScript 中开发 Extism 插件的接口。

```typescript
import { Plugin, HostFunctions } from '../src/core/pdk/typescript';

// 创建插件实例
const plugin = new Plugin();

// 定义插件函数
function greeting(name: string): string {
  return `Hello, ${name}!`;
}

// 注册插件函数
plugin.register('greeting', greeting);

// 使用宿主函数
plugin.useHostFunction('log', (message: string) => {
  console.log(`[Plugin] ${message}`);
});
```

#### 类

| 类名 | 描述 |
|------|------|
| `Plugin` | 主插件类，用于注册和管理插件函数 |
| `HostFunctions` | 宿主函数接口，用于与宿主环境交互 |
| `MemoryManager` | 内存管理工具，用于处理 WebAssembly 内存 |

#### Plugin 方法

| 方法名 | 参数 | 返回值 | 描述 |
|-------|------|-------|------|
| `register` | `name: string, fn: Function` | `void` | 注册一个插件函数 |
| `useHostFunction` | `name: string, fn: Function` | `void` | 使用宿主环境提供的函数 |
| `getMemory` | `size?: number` | `MemoryManager` | 获取内存管理器 |
| `build` | `options?: BuildOptions` | `Promise<Uint8Array>` | 构建插件为 WASM 模块 |

### Go PDK

Go PDK 提供了在 Go 语言中开发 Extism 插件的接口。

```go
package main

import (
	"github.com/extism/go-pdk"
)

//export greet
func greet() int32 {
	input := pdk.InputString()
	pdk.OutputString("Hello, " + input + "!")
	return 0
}

func main() {}
```

### Python PDK

Python PDK 提供了在 Python 中开发 Extism 插件的接口。

```python
from extism_pdk import Plugin, Memory

plugin = Plugin()

@plugin.export
def greet():
    name = plugin.input_string()
    plugin.output_string(f"Hello, {name}!")
    return 0

if __name__ == "__main__":
    plugin.run()
```

### Rust PDK

Rust PDK 提供了在 Rust 中开发 Extism 插件的接口。

```rust
use extism_pdk::*;

#[plugin_fn]
pub fn greet(input: String) -> FnResult<String> {
    Ok(format!("Hello, {}!", input))
}
```

### C/C++ PDK

C/C++ PDK 提供了在 C 或 C++ 中开发 Extism 插件的接口。

```cpp
#include "extism-pdk.h"

EXTISM_EXPORT int32_t greet() {
    const char* input = extism_input_get();
    char buffer[256];
    snprintf(buffer, sizeof(buffer), "Hello, %s!", input);
    extism_output_set(buffer, strlen(buffer));
    return 0;
}
```

## 安全 API

### Validator

插件验证器，用于检查插件的安全性和完整性。

```typescript
import { Validator } from '../src/core/security/validator';

// 创建验证器实例
const validator = new Validator();

// 验证插件
const validationResult = await validator.validatePlugin('./plugin.wasm');

// 检查是否包含恶意代码
const securityScan = await validator.scanForMaliciousCode('./plugin.wasm');

// 分析插件使用的内存和资源
const resourceAnalysis = await validator.analyzeResourceUsage('./plugin.wasm');
```

#### 方法

| 方法名 | 参数 | 返回值 | 描述 |
|-------|------|-------|------|
| `validatePlugin` | `pluginPath: string` | `Promise<ValidationResult>` | 验证插件的安全性和完整性 |
| `scanForMaliciousCode` | `pluginPath: string` | `Promise<ScanResult>` | 扫描潜在的恶意代码 |
| `analyzeResourceUsage` | `pluginPath: string` | `Promise<ResourceAnalysis>` | 分析插件的资源使用情况 |
| `verifySignature` | `pluginPath: string, publicKey: string` | `Promise<boolean>` | 验证插件的数字签名 |

### Signer

插件签名工具，用于为插件创建和验证数字签名。

```typescript
import { Signer } from '../src/core/security/signer';

// 创建签名工具实例
const signer = new Signer();

// 生成密钥对
const keyPair = await signer.generateKeyPair();

// 签名插件
await signer.signPlugin('./plugin.wasm', keyPair.privateKey);

// 验证签名
const isValid = await signer.verifySignature('./plugin.wasm', keyPair.publicKey);
```

#### 方法

| 方法名 | 参数 | 返回值 | 描述 |
|-------|------|-------|------|
| `generateKeyPair` | `options?: KeyOptions` | `Promise<KeyPair>` | 生成新的密钥对 |
| `signPlugin` | `pluginPath: string, privateKey: string` | `Promise<void>` | 对插件进行签名 |
| `verifySignature` | `pluginPath: string, publicKey: string` | `Promise<boolean>` | 验证插件的签名 |
| `exportPublicKey` | `format?: string` | `Promise<string>` | 导出公钥 |

## 集成 API

### MastraIntegration

Mastra 集成接口，用于将 Extism 插件注册为 Mastra 工具。

```typescript
import { MastraIntegration } from '../src/integrations/mastra';

// 创建 Mastra 集成实例
const mastra = new MastraIntegration({
  apiKey: 'your-mastra-api-key'
});

// 注册插件作为工具
await mastra.registerPluginAsTool('my-plugin', '1.0.0', {
  name: 'My Tool',
  description: '我的 Mastra 工具'
});

// 调用 Mastra API
const result = await mastra.callTool('My Tool', { input: 'data' });
```

#### 方法

| 方法名 | 参数 | 返回值 | 描述 |
|-------|------|-------|------|
| `registerPluginAsTool` | `pluginName: string, version: string, options?: ToolOptions` | `Promise<RegisterResult>` | 将插件注册为 Mastra 工具 |
| `unregisterTool` | `toolName: string` | `Promise<boolean>` | 注销 Mastra 工具 |
| `callTool` | `toolName: string, params: any` | `Promise<any>` | 调用 Mastra 工具 |
| `listTools` | `options?: ListOptions` | `Promise<Tool[]>` | 列出所有注册的工具 |

### EnterpriseFeatures

企业级功能，提供高级管理和监控功能。

```typescript
import { EnterpriseFeatures } from '../src/core/enterprise';

// 创建企业级功能实例
const enterprise = new EnterpriseFeatures({
  licenseKey: 'your-enterprise-license'
});

// 启用高级监控
await enterprise.enableAdvancedMonitoring();

// 设置用户权限
await enterprise.setUserPermissions('user@example.com', ['read', 'write']);

// 生成审计报告
const report = await enterprise.generateAuditReport(new Date('2023-01-01'), new Date());
```

#### 方法

| 方法名 | 参数 | 返回值 | 描述 |
|-------|------|-------|------|
| `enableAdvancedMonitoring` | `options?: MonitoringOptions` | `Promise<void>` | 启用高级监控功能 |
| `setUserPermissions` | `userId: string, permissions: string[]` | `Promise<void>` | 设置用户权限 |
| `generateAuditReport` | `startDate: Date, endDate: Date` | `Promise<AuditReport>` | 生成审计报告 |
| `configureSSOIntegration` | `provider: string, options: SSOOptions` | `Promise<void>` | 配置 SSO 集成 |

## 实用工具 API

### NetworkUtils

网络工具，用于处理网络请求和 API 调用。

```typescript
import { NetworkUtils } from '../src/core/utils/network';

// 创建网络工具实例
const network = new NetworkUtils();

// 发送 HTTP 请求
const response = await network.request('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' })
});

// 进行 API 调用
const apiResult = await network.callApi('getUsers', { limit: 10 });

// 下载文件
await network.downloadFile('https://example.com/file.zip', './downloads/file.zip');
```

#### 方法

| 方法名 | 参数 | 返回值 | 描述 |
|-------|------|-------|------|
| `request` | `url: string, options?: RequestOptions` | `Promise<Response>` | 发送 HTTP 请求 |
| `callApi` | `endpoint: string, params?: any` | `Promise<any>` | 调用 API 端点 |
| `downloadFile` | `url: string, destination: string` | `Promise<void>` | 下载文件到指定位置 |
| `uploadFile` | `filePath: string, url: string, options?: UploadOptions` | `Promise<Response>` | 上传文件到指定 URL | 