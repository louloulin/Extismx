让我分析一下当前代码的模块化结构，并提出改进建议。

从目录结构来看，代码主要分为以下几个部分：

1. **核心注册表模块**：
✅ 已重构完成：
- `src/core/registry/index.ts` - 注册表核心实现
- `src/core/registry/types.ts` - 类型定义
- `src/core/registry/storage.ts` - 存储接口和实现

2. **插件开发工具包(PDK)**：
✅ 已重构完成：
- `src/core/pdk/common/` - 共享类型和基础类
- `src/core/pdk/typescript/` - TypeScript PDK实现
待实现：
- `src/core/pdk/python/` - Python PDK
- `src/core/pdk/rust/` - Rust PDK
- `src/core/pdk/go/` - Go PDK
- `src/core/pdk/cpp/` - C++ PDK

3. **企业版功能**：
- `enterprise-support.ts`
- `enterprise-test.ts`

4. **集成模块**：
- `mastra-integration.ts`
- `extism-mcp.ts`

5. **测试相关**：
- `tests/` 目录
- 各种测试文件（`*-test.ts/js`）

6. **工具类**：
- `utils/` 目录
- `plugin-sign.ts`

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

待完成的重构：

1. **目录结构优化**：
   ```
   src/
   ├── core/                           # 核心功能模块
   │   ├── security/                   # 安全相关
   │   │   ├── index.ts
   │   │   ├── signing.ts
   │   │   └── verification.ts
   │   └── config/                     # 配置管理
   │       ├── index.ts
   │       └── defaults.ts
   ```

2. **配置管理**：
   ```typescript
   // core/config/index.ts
   export interface RegistryConfig {
     baseUrl: string;
     storage: StorageConfig;
     security: SecurityConfig;
     // ...其他配置项
   }

   export function loadConfig(): RegistryConfig {
     // 加载配置逻辑
   }
   ```

3. **CLI模块分离**：
   ```typescript
   // cli/commands/publish.ts
   export class PublishCommand {
     async execute(args: PublishArgs): Promise<void> {
       // 发布命令实现
     }
   }

   // cli/index.ts
   export class CLI {
     private commands: Map<string, Command>;
     
     async run(args: string[]): Promise<void> {
       // CLI 入口逻辑
     }
   }
   ```

4. **集成模块解耦**：
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

5. **测试组织**：
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

1. 实现其他语言的PDK
2. 实现安全模块
3. 实现配置管理
4. 分离CLI模块
5. 重组测试文件
6. 实现统一的错误处理
7. 完善文档

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

建议按照这个结构逐步重构代码，可以分阶段进行：

1. 首先整理目录结构
2. 然后重构核心模块
3. 接着分离存储层
4. 最后优化周边功能

这样可以确保重构过程平滑，不会影响现有功能的正常运行。
