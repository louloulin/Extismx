# 贡献指南

感谢您对 Extism 插件生态系统的关注！我们非常欢迎社区成员的贡献，无论是代码、文档还是创意。本指南将帮助您了解如何有效地参与项目开发。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [提交 Pull Request](#提交-pull-request)
- [代码风格](#代码风格)
- [测试](#测试)
- [文档](#文档)
- [版本发布](#版本发布)
- [社区讨论](#社区讨论)

## 行为准则

本项目采用开放、友好和包容的态度。我们希望所有参与者能够：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性的批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 如何贡献

您可以通过多种方式为项目做出贡献：

1. **报告 Bug**: 如果您发现了问题，请通过 GitHub Issues 报告，并尽可能提供详细信息。
2. **提出新功能**: 对于新功能的想法，请先通过 Issues 讨论。
3. **改进文档**: 帮助我们完善和更新文档。
4. **贡献代码**: 通过 PR 提交 bug 修复或新功能实现。
5. **代码审查**: 审查其他贡献者的 PR 并提供反馈。

## 开发环境设置

1. Fork 项目仓库
2. 克隆您的 Fork 到本地

```bash
git clone https://github.com/YOUR_USERNAME/extism-plugin-ecosystem.git
cd extism-plugin-ecosystem
```

3. 设置上游远程仓库

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/extism-plugin-ecosystem.git
```

4. 安装依赖

```bash
npm install
```

5. 创建新的分支

```bash
git checkout -b feature/your-feature-name
```

## 提交 Pull Request

1. 确保您的修改通过了所有测试
2. 更新相关文档
3. 提交代码并推送到您的 Fork

```bash
git add .
git commit -m "feat: 添加新功能 XYZ"
git push origin feature/your-feature-name
```

4. 通过 GitHub 创建一个 Pull Request
5. 在 PR 描述中详细说明您的修改和解决的问题

我们使用[约定式提交](https://www.conventionalcommits.org/)规范，提交消息应遵循以下格式：

```
<类型>[可选作用域]: <描述>

[可选正文]

[可选脚注]
```

常用类型包括：
- **feat**: 新功能
- **fix**: Bug 修复
- **docs**: 文档更新
- **style**: 代码格式调整（不影响代码功能）
- **refactor**: 重构代码
- **test**: 添加或修改测试
- **chore**: 构建过程或辅助工具的变动

## 代码风格

我们使用 ESLint 和 Prettier 来保持代码风格一致。提交前请运行：

```bash
npm run lint
npm run format
```

TypeScript 代码风格指南：
- 使用 2 空格缩进
- 优先使用 `const` 和 `let`
- 类型定义使用 `interface` 而非 `type`（除非需要联合类型）
- 导出的函数和类必须有 JSDoc 注释

## 测试

在提交 PR 前，请确保添加适当的测试并通过现有测试：

```bash
npm test
```

对于新功能，请添加单元测试和集成测试。测试覆盖率应达到至少 80%。

## 文档

文档是项目的重要组成部分。如果您的修改涉及功能变更，请同时更新相关文档：

- 更新 API 文档
- 更新使用示例
- 添加新功能说明

文档采用 Markdown 格式，位于 `doc/` 目录下。

## 版本发布

我们使用[语义化版本](https://semver.org/)规范：

- 主版本号：不兼容的 API 变更
- 次版本号：向后兼容的功能新增
- 修订号：向后兼容的缺陷修复

## 社区讨论

有关项目开发的讨论可以在以下渠道进行：

- GitHub Discussions
- Discord 服务器（链接待添加）
- 社区会议（每两周一次，详见社区日历）

## 致谢

再次感谢您对 Extism 插件生态系统的贡献！您的参与对项目的成功至关重要。 