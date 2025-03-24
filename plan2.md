让我分析一下当前代码的模块化结构，并提出改进建议。

从目录结构来看，代码主要分为以下几个部分：

1. **核心注册表模块**：
- `registry.ts` - 注册表核心实现
- `registry-types.ts` - 类型定义
- `registry-cli.ts` - 命令行接口
- `registry-test.ts` - 测试文件

2. **插件开发工具包(PDK)**：
- `python-pdk/`
- `go-pdk/`
- `rust-pdk/`
- `cpp-pdk/`
- `c-pdk/`
- `extism-pdk.ts`

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

存在的模块化问题：

1. **目录结构不够清晰**：
   - 测试文件散布在各处，没有统一放在 `tests` 目录下
   - 核心功能和辅助功能混在一起
   - PDK 相关代码虽然分目录但组织不够清晰

2. **职责分离不够明确**：
   - 注册表核心功能和CLI混合在一起
   - 企业版功能和社区版功能边界不清晰
   - 集成模块和核心功能耦合度高

3. **依赖关系不够清晰**：
   - 缺少模块间依赖关系的文档
   - 没有明确的模块入口文件
   - 缺少模块级别的配置文件

建议的改进方案：

```
src/
├── core/                           # 核心功能模块
│   ├── registry/                   # 注册表核心
│   │   ├── index.ts               # 模块入口
│   │   ├── types.ts               # 类型定义
│   │   ├── storage.ts             # 存储接口
│   │   └── validation.ts          # 验证逻辑
│   ├── security/                   # 安全相关
│   │   ├── index.ts
│   │   ├── signing.ts
│   │   └── verification.ts
│   └── config/                     # 配置管理
│       ├── index.ts
│       └── defaults.ts
│
├── pdk/                           # 插件开发工具包
│   ├── common/                    # 共享代码
│   │   ├── index.ts
│   │   └── types.ts
│   ├── python/
│   ├── go/
│   ├── rust/
│   ├── cpp/
│   └── c/
│
├── enterprise/                    # 企业版功能
│   ├── index.ts
│   ├── features/
│   └── licensing/
│
├── cli/                          # 命令行工具
│   ├── index.ts
│   ├── commands/
│   └── utils/
│
├── integrations/                 # 第三方集成
│   ├── mastra/
│   ├── mcp/
│   └── common/
│
├── utils/                        # 通用工具
│   ├── index.ts
│   ├── logger.ts
│   ├── errors.ts
│   └── helpers.ts
│
└── tests/                        # 测试文件
    ├── unit/                     # 单元测试
    ├── integration/             # 集成测试
    ├── e2e/                    # 端到端测试
    └── fixtures/               # 测试数据
```

具体改进建议：

1. **核心模块重构**：
```typescript
// core/registry/index.ts
export interface IRegistryStorage {
  savePlugin(plugin: Plugin): Promise<void>;
  getPlugin(id: string): Promise<Plugin>;
  // ...其他存储接口方法
}

export class Registry {
  constructor(
    private storage: IRegistryStorage,
    private config: RegistryConfig
  ) {}
  
  // 核心方法实现
}
```

2. **存储层抽象**：
```typescript
// core/registry/storage.ts
export class MemoryStorage implements IRegistryStorage {
  // 内存存储实现
}

export class DatabaseStorage implements IRegistryStorage {
  // 数据库存储实现
}
```

3. **配置管理**：
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

4. **CLI模块分离**：
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

5. **集成模块解耦**：
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

6. **测试组织**：
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

7. **错误处理统一**：
```typescript
// utils/errors.ts
export class RegistryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
  }
}

export class ValidationError extends RegistryError {
  // 验证错误实现
}
```

8. **类型定义集中**：
```typescript
// core/registry/types.ts
export interface Plugin {
  // 插件接口定义
}

export type PluginMetadata = {
  // 元数据类型定义
}
```

这样的模块化结构将带来以下好处：

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
