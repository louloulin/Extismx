# Extism 插件生态系统

## 项目概述

Extism 插件生态系统是一个基于 Extism 框架的完整插件管理解决方案，支持多语言插件开发、分发和管理。该系统为开发者提供了统一的插件开发接口、中央化的插件注册表、完整的包管理功能以及与 Mastra 工具的无缝集成。

## 主要特性

### 多语言 PDK (插件开发工具包)

- **TypeScript PDK**: 使用 TypeScript/JavaScript 开发 Extism 插件
- **Go PDK**: 使用 Go 语言开发 Extism 插件
- **Python PDK**: 使用 Python 开发 Extism 插件
- **Rust PDK**: 使用 Rust 开发 Extism 插件
- **C/C++ PDK**: 使用 C 或 C++ 开发 Extism 插件

### 插件注册表

- 中央化的插件管理系统
- 版本控制与发布管理
- 插件元数据管理
- 插件依赖解析与管理
- 插件文档生成工具
- 依赖关系可视化

### 安全特性

- 插件签名与验证
- 权限管理与访问控制
- 漏洞扫描与安全检查

### 集成能力

- Mastra 工具集成
- 企业级部署支持
- 社区功能与交互

## 安装指南

### 系统要求

- Node.js v14.0.0 或更高
- npm 或 pnpm 包管理器
- 各 PDK 的特定依赖（详见下文）

### 安装步骤

1. 克隆代码库：

```bash
git clone https://github.com/yourusername/extism-plugin-ecosystem.git
cd extism-plugin-ecosystem
```

2. 安装依赖：

```bash
npm install
# 或使用 pnpm
pnpm install
```

3. 构建项目：

```bash
npm run build
```

4. 运行测试：

```bash
npm test
```

## 使用指南

### 插件开发

#### 使用 TypeScript PDK 开发插件

1. 创建新插件：

```typescript
import { Plugin } from '../src/core/pdk/typescript';

// 定义插件函数
export function add(a: number, b: number): number {
  return a + b;
}

// 注册插件函数
const plugin = new Plugin();
plugin.register('add', add);
```

2. 构建插件：

```bash
npm run build
```

#### 使用 Go PDK 开发插件

1. 准备 Go 开发环境
2. 创建新的 Go 插件：

```go
package main

import (
	"github.com/extism/go-pdk"
)

//export add
func add() int32 {
	input := pdk.InputBytes()
	
	// 解析输入，执行操作
	// ...
	
	return 0
}

func main() {}
```

3. 构建 Go 插件：

```bash
cd src/go-pdk
make build
```

### 注册表使用

#### 发布插件

```typescript
import { Registry } from '../src/core/registry';

const registry = new Registry();

// 发布插件
registry.publishPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  description: '我的第一个 Extism 插件',
  main: './dist/my-plugin.wasm',
  author: '您的名字',
  license: 'MIT'
});
```

#### 安装插件

```typescript
import { PackageManager } from '../src/core/registry/package-manager';

const pm = new PackageManager();

// 安装插件
await pm.installPlugin('my-plugin', '1.0.0');
```

### Mastra 集成

```typescript
import { MastraIntegration } from '../src/integrations/mastra';

// 初始化 Mastra 集成
const mastra = new MastraIntegration();

// 注册 Extism 插件作为 Mastra 工具
mastra.registerPluginAsTool('my-plugin', '1.0.0');
```

## API 参考

### 核心 API

- `Registry`: 插件注册表管理
- `PackageManager`: 包管理和依赖解析
- `DependencyResolver`: 依赖关系解析
- `DependencyVisualizer`: 依赖可视化工具
- `DocGenerator`: 文档生成器

### PDK API

- `typescript.Plugin`: TypeScript 插件基类
- `go.Plugin`: Go 插件接口
- `python.Plugin`: Python 插件接口
- `rust.Plugin`: Rust 插件接口
- `cpp.Plugin`: C/C++ 插件接口

### 安全 API

- `security.Validator`: 插件安全验证
- `security.Signer`: 插件签名工具

## 示例

### 简单插件示例

```typescript
// hello-world.ts
import { Plugin } from '../src/core/pdk/typescript';

export function hello(name: string): string {
  return `Hello, ${name}!`;
}

const plugin = new Plugin();
plugin.register('hello', hello);
```

### 使用插件

```typescript
// host.ts
import { Extism } from '@extism/extism';

async function main() {
  const extism = new Extism();
  const plugin = await extism.loadPlugin('./dist/hello-world.wasm');
  
  const result = await plugin.call('hello', 'World');
  console.log(result.toString()); // 输出: Hello, World!
}

main().catch(console.error);
```

## 常见问题

### 如何调试插件？

可以使用各语言 PDK 提供的调试工具。例如，在 TypeScript 中：

```typescript
import { Plugin, debug } from '../src/core/pdk/typescript';

// 启用调试模式
debug.enable();

// 创建插件并设置断点
// ...
```

### 插件大小优化

要优化插件大小，可以：

1. 使用 `--optimize-for-size` 构建标志
2. 移除未使用的依赖
3. 使用代码分割技术

## 社区与贡献

- 问题反馈: [GitHub Issues](https://github.com/yourusername/extism-plugin-ecosystem/issues)
- 贡献代码: [Pull Requests](https://github.com/yourusername/extism-plugin-ecosystem/pulls)
- 讨论: [GitHub Discussions](https://github.com/yourusername/extism-plugin-ecosystem/discussions)

## 许可证

此项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。 