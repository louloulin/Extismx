# Extism 插件生态系统快速入门

本指南将帮助您快速上手 Extism 插件生态系统，包括安装、配置、开发第一个插件以及发布到注册表。

## 目录

1. [安装与设置](#安装与设置)
2. [开发第一个插件](#开发第一个插件)
3. [测试插件](#测试插件)
4. [发布到注册表](#发布到注册表)
5. [与 Mastra 集成](#与-mastra-集成)
6. [常见问题排查](#常见问题排查)

## 安装与设置

### 先决条件

开始使用 Extism 插件生态系统前，请确保您的系统满足以下要求：

- **Node.js**: v14.0.0 或更高版本
- **npm** 或 **pnpm**: 用于包管理
- **Git**: 用于版本控制

对于特定语言的开发还需要：

- **Go**: 1.16+ (用于 Go PDK)
- **Python**: 3.6+ (用于 Python PDK)
- **Rust**: 最新稳定版 (用于 Rust PDK)
- **C/C++ 编译器**: 如 GCC 或 Clang (用于 C/C++ PDK)

### 安装步骤

1. 克隆仓库：

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

4. 验证安装：

```bash
npm run test-plugin
```

如果测试成功，您将看到成功输出，表明系统已正确设置。

## 开发第一个插件

让我们开发一个简单的 "Hello World" 插件来展示基本功能。您可以选择自己熟悉的语言。

### 使用 TypeScript 开发插件

1. 创建插件目录和文件：

```bash
mkdir -p my-plugins/hello-world
cd my-plugins/hello-world
touch index.ts
```

2. 编写插件代码，打开 `index.ts` 并添加以下内容：

```typescript
import { Plugin } from '../../src/core/pdk/typescript';

// 定义一个简单的问候函数
export function greet(name: string): string {
  return `Hello, ${name} from Extism plugin!`;
}

// 创建插件并注册函数
const plugin = new Plugin();
plugin.register('greet', greet);

// 导出插件
export default plugin;
```

3. 创建构建配置 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  },
  "include": ["./*.ts"]
}
```

4. 添加构建脚本 `build.js`：

```javascript
const { buildPlugin } = require('../../src/core/pdk/typescript/builder');

async function build() {
  await buildPlugin({
    entry: './index.ts',
    output: './dist/hello-world.wasm',
    optimize: true
  });
  console.log('Plugin built successfully!');
}

build().catch(console.error);
```

5. 构建插件：

```bash
node build.js
```

### 使用 Go 开发插件

1. 创建插件目录和文件：

```bash
mkdir -p my-plugins/hello-go
cd my-plugins/hello-go
touch main.go
```

2. 编写插件代码，打开 `main.go` 并添加以下内容：

```go
package main

import (
	"github.com/extism/go-pdk"
)

//export greet
func greet() int32 {
	// 获取输入
	input := pdk.InputString()
	
	// 设置输出
	message := "Hello, " + input + " from Go plugin!"
	pdk.OutputString(message)
	
	return 0
}

func main() {}
```

3. 构建插件：

```bash
GOOS=js GOARCH=wasm go build -o hello-go.wasm main.go
```

### 使用 Python 开发插件

1. 创建插件目录和文件：

```bash
mkdir -p my-plugins/hello-python
cd my-plugins/hello-python
touch plugin.py
```

2. 编写插件代码，打开 `plugin.py` 并添加以下内容：

```python
from extism_pdk import Plugin, Memory

plugin = Plugin()

@plugin.export
def greet():
    # 获取输入
    name = plugin.input_string()
    
    # 设置输出
    plugin.output_string(f"Hello, {name} from Python plugin!")
    
    return 0

if __name__ == "__main__":
    plugin.run()
```

3. 使用打包工具构建插件：

```bash
python -m extism_pdk.build plugin.py -o hello-python.wasm
```

## 测试插件

让我们创建一个简单的宿主程序来测试我们的插件：

1. 创建测试文件 `test-plugin.js`：

```javascript
const fs = require('fs');
const { Extism } = require('@extism/extism');

async function testPlugin(pluginPath, name) {
  try {
    // 初始化 Extism
    const extism = new Extism();
    
    // 加载插件
    const pluginData = fs.readFileSync(pluginPath);
    const plugin = await extism.loadPlugin(pluginData, {
      wasi: true
    });
    
    // 调用插件功能
    const input = Buffer.from(name);
    const result = await plugin.call('greet', input);
    
    console.log(`Plugin result: ${result.toString()}`);
    
    // 释放资源
    plugin.free();
  } catch (error) {
    console.error('Error testing plugin:', error);
  }
}

// 测试我们的插件
const pluginPath = process.argv[2] || './my-plugins/hello-world/dist/hello-world.wasm';
const name = process.argv[3] || 'World';

testPlugin(pluginPath, name)
  .then(() => console.log('Test completed'))
  .catch(console.error);
```

2. 运行测试：

```bash
node test-plugin.js ./my-plugins/hello-world/dist/hello-world.wasm "Extism User"
```

如果一切正常，您应该看到类似下面的输出：

```
Plugin result: Hello, Extism User from Extism plugin!
Test completed
```

## 发布到注册表

现在我们的插件工作正常，让我们将其发布到 Extism 插件注册表：

1. 创建发布配置文件 `plugin.json`：

```json
{
  "name": "hello-world",
  "version": "1.0.0",
  "description": "一个简单的 Hello World Extism 插件",
  "main": "./dist/hello-world.wasm",
  "author": "您的名字",
  "license": "MIT",
  "keywords": ["extism", "plugin", "hello", "demo"],
  "repository": "https://github.com/yourusername/my-extism-plugins"
}
```

2. 使用注册表 CLI 发布插件：

```bash
# 首先登录到注册表
npx extism-registry login

# 发布插件
npx extism-registry publish ./my-plugins/hello-world/plugin.json
```

3. 验证插件是否已发布：

```bash
npx extism-registry info hello-world
```

## 与 Mastra 集成

将我们的插件与 Mastra 工具集成：

1. 创建集成脚本 `mastra-integration.js`：

```javascript
const { MastraIntegration } = require('./src/integrations/mastra');

async function registerWithMastra() {
  try {
    // 初始化 Mastra 集成
    const mastra = new MastraIntegration({
      apiKey: process.env.MASTRA_API_KEY || 'your-api-key-here'
    });
    
    // 注册插件作为 Mastra 工具
    await mastra.registerPluginAsTool('hello-world', '1.0.0', {
      name: 'Greeting Tool',
      description: '一个简单的问候工具',
      category: 'Demo'
    });
    
    console.log('插件已成功注册为 Mastra 工具');
    
    // 列出所有工具
    const tools = await mastra.listTools();
    console.log('注册的工具列表:', tools);
  } catch (error) {
    console.error('Mastra 集成错误:', error);
  }
}

registerWithMastra().catch(console.error);
```

2. 运行集成脚本：

```bash
node mastra-integration.js
```

## 常见问题排查

### 构建问题

**问题**: 插件构建失败，出现 "无法找到模块" 错误。

**解决方案**: 确保所有依赖都已正确安装，并且导入路径正确。对于 TypeScript 插件，检查 `tsconfig.json` 配置是否正确。

```bash
npm install --save-dev typescript @types/node
```

### 插件执行问题

**问题**: 插件加载成功但执行失败。

**解决方案**: 检查宿主环境是否提供了插件所需的所有功能，并检查输入参数的格式是否正确。启用调试模式：

```javascript
const plugin = await extism.loadPlugin(pluginData, {
  wasi: true,
  debug: true
});
```

### 注册表问题

**问题**: 插件发布失败，出现权限错误。

**解决方案**: 确保您已正确登录到注册表，并且具有发布权限。检查 API 密钥是否正确设置：

```bash
npx extism-registry login --api-key your-api-key
```

## 后续步骤

恭喜！您已成功创建、测试并发布了您的第一个 Extism 插件，并将其与 Mastra 工具集成。接下来，您可以：

1. 探索更复杂的插件功能，如使用宿主函数和共享内存
2. 创建具有依赖关系的插件
3. 使用其他语言的 PDK 开发插件
4. 了解更多关于安全特性和插件签名的信息

请参考完整的 API 文档以获取更详细的信息。 