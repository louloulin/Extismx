让我分析一下当前代码的模块化结构，并提出改进建议。

从目录结构来看，代码主要分为以下几个部分：

1. **核心注册表模块**：
✅ 已重构完成：
- `src/core/registry/index.ts` - 注册表核心实现
- `src/core/registry/types.ts` - 类型定义
- `src/core/registry/storage.ts` - 存储接口和实现

2. **安全模块**：
✅ 已重构完成：
- `src/core/security/index.ts` - 安全模块导出和创建
- `src/core/security/types.ts` - 安全相关类型定义
- `src/core/security/signing.ts` - 签名功能实现
- `src/core/security/verification.ts` - 验证功能实现
- `src/core/security/keystore.ts` - 密钥管理实现

3. **配置管理模块**：
✅ 已重构完成：
- `src/core/config/index.ts` - 配置管理核心实现
- `src/core/config/types.ts` - 配置类型定义
- `src/core/config/defaults.ts` - 默认配置值

4. **CLI模块**：
✅ 已重构完成：
- `src/cli/index.ts` - CLI核心实现
- `src/cli/types.ts` - CLI类型定义
- `src/cli/bin.ts` - CLI入口脚本
- `src/cli/commands/publish.ts` - 发布命令实现
- `src/cli/commands/search.ts` - 搜索命令实现

5. **插件开发工具包(PDK)**：
✅ 已重构完成：
- `src/core/pdk/common/` - 共享类型和基础类
  - `builder.ts` - 构建器基类
  - `template.ts` - 模板生成器基类
  - `tester.ts` - 测试器基类
  - `publisher.ts` - 发布器基类
  - `types.ts` - 共享类型定义
- `src/core/pdk/typescript/` - TypeScript PDK实现
- `src/core/pdk/python/` - Python PDK实现
  - `builder.ts` - Python构建器实现
  - `template.ts` - Python模板生成器实现
  - `tester.ts` - Python测试器实现
  - `publisher.ts` - Python发布器实现
  - `index.ts` - Python PDK导出
- `src/core/pdk/rust/` - Rust PDK实现
  - `builder.ts` - Rust构建器实现
  - `template.ts` - Rust模板生成器实现
  - `tester.ts` - Rust测试器实现
  - `publisher.ts` - Rust发布器实现
  - `index.ts` - Rust PDK导出
- `src/core/pdk/index.ts` - PDK模块导出
待实现：
- `src/core/pdk/go/` - Go PDK
- `src/core/pdk/cpp/` - C++ PDK

6. **企业版功能**：
- `enterprise-support.ts`

7. **集成模块**：
✅ 已重构完成：
- `src/integrations/common/types.ts` - 共享集成类型和接口
- `src/integrations/extism/integration.ts` - Extism MCP 集成实现
- `src/integrations/extism/pdk.ts` - Extism PDK 模拟实现
- `src/integrations/extism/hello-plugin.ts` - 示例插件
- `src/integrations/mastra/integration.ts` - Mastra 集成实现
- `src/integrations/demo.ts` - 集成演示
- `src/integrations/index.ts` - 集成模块索引

8. **测试相关**：
✅ 已重构完成：
- `tests/jest.config.ts` - Jest配置文件
- `tests/setup.ts` - 测试环境设置
- `tests/unit/` - 单元测试目录
  - `registry.test.ts` - 注册表单元测试
- `tests/integration/` - 集成测试目录
  - `storage.test.ts` - 存储集成测试
- `tests/e2e/` - 端到端测试目录

9. **错误处理模块**：
✅ 已重构完成：
- `src/core/errors/index.ts` - 错误处理核心和公共函数
- `src/core/errors/types.ts` - 错误类型定义
- `src/core/errors/registry.ts` - 注册表错误定义
- `src/core/errors/security.ts` - 安全模块错误定义
- `src/core/errors/config.ts` - 配置模块错误定义
- `src/core/errors/pdk.ts` - PDK错误定义
- `src/core/errors/integration.ts` - 集成模块错误定义

10. **工具类**：
- `utils/` 目录

已完成的重构：

1. **PDK模块重构**：
   - ✅ 创建了清晰的目录结构
   - ✅ 实现了TypeScript PDK
   - ✅ 实现了Python PDK
   - ✅ 实现了Rust PDK
   - ✅ 分离了共享代码
   - ✅ 提供了完整的插件生命周期支持

2. **TypeScript PDK功能**：
   - ✅ 构建器：编译TypeScript并生成WebAssembly
   - ✅ 模板生成器：创建标准项目结构
   - ✅ 测试器：运行测试和类型检查
   - ✅ 发布器：发布到npm和版本管理

3. **Python PDK功能**：
   - ✅ 构建器：编译Python并生成WebAssembly
   - ✅ 模板生成器：创建标准项目结构
   - ✅ 测试器：运行pytest和类型检查
   - ✅ 发布器：发布到PyPI和版本管理

4. **Rust PDK功能**：
   - ✅ 构建器：编译Rust并生成WebAssembly
   - ✅ 模板生成器：创建标准项目结构
   - ✅ 测试器：运行cargo test和代码检查
   - ✅ 发布器：发布到crates.io和GitHub

5. **注册表核心模块重构**：
   - ✅ 分离了核心功能和存储层
   - ✅ 实现了插件的完整生命周期管理
   - ✅ 添加了插件状态和可见性控制
   - ✅ 改进了错误处理和类型定义
   - ✅ 支持插件查询和过滤
   - ✅ 实现了内存存储适配器

6. **安全模块重构**：
   - ✅ 创建了完整的安全模块目录结构
   - ✅ 实现了多种签名算法支持(RSA-SHA256、ED25519、ECDSA_P256)
   - ✅ 分离了密钥管理、签名和验证功能
   - ✅ 添加了灵活的配置选项
   - ✅ 改进了错误处理和类型安全
   - ✅ 支持密钥生成和管理

7. **配置管理模块重构**：
   - ✅ 创建了配置管理核心类
   - ✅ 实现了配置加载、验证和更新
   - ✅ 支持从文件和环境变量加载配置
   - ✅ 添加了错误处理和类型安全
   - ✅ 提供了合理的默认配置
   - ✅ 支持配置序列化和保存

8. **CLI模块重构**：
   - ✅ 创建了模块化的命令结构
   - ✅ 实现了命令基础接口
   - ✅ 分离了命令处理逻辑
   - ✅ 改进了错误处理和结果呈现
   - ✅ 添加了帮助和版本信息
   - ✅ 支持从环境变量配置CLI行为

9. **集成模块重构**：
   - ✅ 创建了模块化的集成结构
   - ✅ 定义了通用集成接口和类型
   - ✅ 实现了Extism集成
   - ✅ 实现了Mastra集成
   - ✅ 添加了错误处理机制
   - ✅ 提供了完整的示例和演示
   - ✅ 支持不同插件系统之间的互操作性

10. **测试组织重构**：
   - ✅ 创建了清晰的测试目录结构
   - ✅ 实现了Jest测试配置
   - ✅ 添加了测试环境设置
   - ✅ 创建了单元测试示例
   - ✅ 创建了集成测试示例
   - ✅ 准备了端到端测试目录
   - ✅ 删除了旧的测试文件

11. **统一错误处理重构**：
   - ✅ 创建了统一的错误处理系统
   - ✅ 实现了基础错误类和错误工厂
   - ✅ 为每个模块定义了专门的错误类型
   - ✅ 添加了详细的错误代码和描述
   - ✅ 支持错误元数据和详细信息
   - ✅ 提供了错误序列化和格式化
   - ✅ 添加了有用的错误处理建议

待完成的重构：

1. **其他语言PDK实现**：
   ```typescript
   // src/core/pdk/go/index.ts
   import { PluginBuilder } from '../common/builder';
   
   export class GoBuilder extends PluginBuilder {
     // Go特定的构建实现
   }
   
   // src/core/pdk/cpp/index.ts
   import { PluginBuilder } from '../common/builder';
   
   export class CppBuilder extends PluginBuilder {
     // C++特定的构建实现
   }
   ```

下一步建议：

1. 实现其他语言的PDK（Go、C++）
2. 完善文档

这样的重构将带来以下好处：

1. **更好的可维护性**：
   - 每个模块职责清晰
   - 代码组织更有条理
   - 更容易定位和修复问题

2. **更好的可测试性**：
   - 测试文件组织清晰
   - 更容易编写单元测试
   - 更容易进行集成测试

3. **更好的可扩展性**：
   - 容易添加新功能
   - 容易替换实现
   - 容易集成新的第三方服务

4. **更好的依赖管理**：
   - 依赖关系清晰
   - 避免循环依赖
   - 更容易进行依赖注入

5. **更好的错误处理**：
   - 统一的错误类型
   - 详细的错误信息
   - 更易于理解和调试的错误
   - 更好的错误定位

6. **更好的多语言支持**：
   - 统一的插件开发接口
   - 支持多种编程语言
   - 一致的构建、测试和发布流程
   - 语言特定的优化和配置

建议按照这个结构继续逐步重构代码，可以分阶段进行：

1. 继续实现其他语言的PDK
2. 然后完善文档

这样可以确保重构过程平滑，不会影响现有功能的正常运行。
