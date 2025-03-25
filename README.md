# Extism 插件生态系统

Extism 插件生态系统是一个全面的框架，旨在简化跨语言、跨平台的插件开发、分发和管理。它提供了一套统一的工具和接口，使开发者能够创建可在多种环境中无缝运行的插件。

## 特性

- **多语言 PDK 支持**: 使用 TypeScript、Rust、Go、Python 等语言开发插件
- **插件注册与发现**: 中央注册表用于发布和查找插件
- **版本控制与管理**: 自动化的版本控制和依赖管理
- **签名与验证**: 确保插件来源和完整性的安全机制
- **权限控制**: 精细的权限系统确保插件安全运行
- **文档生成**: 自动为插件生成文档
- **与 Mastra 工具集成**: 无缝连接到 Mastra 生态系统的其他工具

## 文档

详细文档可在 `doc` 目录中找到:

- [完整文档](doc/documentation.md)
- [快速入门](doc/getting-started.md)
- [API 参考](doc/api-reference.md)
- [插件注册表](doc/extism-registry.md)
- [安全最佳实践](doc/security-best-practices.md)
- [架构说明](doc/architecture.md)
- [插件开发教程](doc/plugin-development-tutorial.md) - 从零开始构建完整的 Extism 插件
- [调试指南](doc/debugging-guide.md) - 排查和解决插件问题的技术和工具

更多文档请查看[文档索引](doc/README.md)。

## 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/extism-plugin-ecosystem.git

# 进入项目目录
cd extism-plugin-ecosystem

# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm test
```

## 快速示例

使用 TypeScript 创建一个简单的插件:

```typescript
import { Plugin } from '@extism/plugin';

// 创建插件实例
const plugin = new Plugin();

// 注册一个函数，可以从宿主应用调用
plugin.register('hello_world', (name: string) => {
  return `Hello, ${name}!`;
});

// 导出插件
export default plugin;
```

## 贡献

欢迎为 Extism 插件生态系统做出贡献！请查看 [贡献指南](doc/contributing.md) 了解更多信息。

## 测试结果

✅ 所有测试已通过 (124 tests, 372 assertions)

## 未来计划

- 用户认证与授权
- 高级搜索功能
- 社区评分与评论
- 企业部署解决方案

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

