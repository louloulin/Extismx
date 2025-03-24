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
- `src/core/pdk/typescript/` - TypeScript PDK实现
待实现：
- `src/core/pdk/python/` - Python PDK
- `src/core/pdk/rust/` - Rust PDK
- `src/core/pdk/go/` - Go PDK
- `src/core/pdk/cpp/` - C++ PDK

6. **企业版功能**：
- `enterprise-support.ts`
- `enterprise-test.ts`

7. **集成模块**：
- `mastra-integration.ts`
- `extism-mcp.ts`

8. **测试相关**：
- `tests/` 目录
- 各种测试文件（`*-test.ts/js`）

9. **工具类**：
- `utils/` 目录

已完成的重构：

1. **PDK模块重构**：
   - ✅ 创建了清晰的目录结构
   - ✅ 实现了TypeScript PDK
   - ✅ 分离了共享代码
   - ✅ 提供了完整的插件生命周期支持

2. **TypeScript PDK功能**：
   - ✅ 构建器：编译TypeScript并生成WebAssembly
   - ✅ 模板生成器：创建标准项目结构
   - ✅ 测试器：运行测试和类型检查
   - ✅ 发布器：发布到npm和版本管理

3. **注册表核心模块重构**：
   - ✅ 分离了核心功能和存储层
   - ✅ 实现了插件的完整生命周期管理
   - ✅ 添加了插件状态和可见性控制
   - ✅ 改进了错误处理和类型定义
   - ✅ 支持插件查询和过滤
   - ✅ 实现了内存存储适配器

4. **安全模块重构**：
   - ✅ 创建了完整的安全模块目录结构
   - ✅ 实现了多种签名算法支持(RSA-SHA256、ED25519、ECDSA_P256)
   - ✅ 分离了密钥管理、签名和验证功能
   - ✅ 添加了灵活的配置选项
   - ✅ 改进了错误处理和类型安全
   - ✅ 支持密钥生成和管理

5. **配置管理模块重构**：
   - ✅ 创建了配置管理核心类
   - ✅ 实现了配置加载、验证和更新
   - ✅ 支持从文件和环境变量加载配置
   - ✅ 添加了错误处理和类型安全
   - ✅ 提供了合理的默认配置
   - ✅ 支持配置序列化和保存

6. **CLI模块重构**：
   - ✅ 创建了模块化的命令结构
   - ✅ 实现了命令基础接口
   - ✅ 分离了命令处理逻辑
   - ✅ 改进了错误处理和结果呈现
   - ✅ 添加了帮助和版本信息
   - ✅ 支持从环境变量配置CLI行为

待完成的重构：

1. **集成模块解耦**：
   ```typescript
   // integrations/common/types.ts
   export interface IntegrationConfig {
     // 集成配置接口
   }

   // integrations/mastra/index.ts
   export class MastraIntegration implements Integration {
     // Mastra 集成实现
   }
   ```

2. **测试组织**：
   ```typescript
   // tests/unit/registry.test.ts
   describe('Registry', () => {
     // 单元测试
   });

   // tests/integration/storage.test.ts
   describe('DatabaseStorage', () => {
     // 集成测试
   });
   ```

下一步建议：

1. 重组集成模块
2. 重组测试文件
3. 实现统一的错误处理
4. 实现其他语言的PDK
5. 完善文档

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

建议按照这个结构继续逐步重构代码，可以分阶段进行：

1. 首先重组集成模块
2. 然后重组测试文件
3. 接着实现统一的错误处理
4. 最后优化其他功能

这样可以确保重构过程平滑，不会影响现有功能的正常运行。
