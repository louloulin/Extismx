
基于对当前项目结构的分析，我将为整个项目提供模块化改进方案。

# 模块化结构建议

## 1. 核心模块结构

根据当前项目结构，建议将`src`目录重组为以下模块化结构:

```
src/
├── modules/                    # 所有功能模块
│   ├── core/                   # 核心功能模块
│   │   ├── extism/             # Extism核心功能
│   │   │   ├── index.ts        # 模块导出
│   │   │   ├── host.ts         # 主机功能
│   │   │   └── pdk.ts          # PDK实现
│   │   └── common/             # 通用工具和类型
│   │       ├── index.ts
│   │       ├── types.ts
│   │       └── utils.ts
│   ├── registry/              # 注册表模块
│   │   ├── index.ts
│   │   ├── types.ts           # 注册表类型定义
│   │   ├── service.ts         # 注册表服务
│   │   ├── cli.ts             # CLI功能
│   │   └── __tests__/         # 单元测试
│   ├── package-manager/       # 包管理模块
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── resolver.ts        # 依赖解析器
│   │   ├── manager.ts         # 包管理器
│   │   └── __tests__/
│   ├── auth/                  # 认证模块
│   │   ├── index.ts
│   │   ├── service.ts
│   │   └── __tests__/
│   ├── enterprise/            # 企业功能模块
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── support.ts         # 企业支持
│   │   ├── organization.ts    # 组织管理
│   │   └── __tests__/
│   ├── plugins/               # 插件模块
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── service.ts         # 插件服务
│   │   └── install.ts         # 安装功能
│   ├── monitoring/            # 性能监控模块
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── collectors.ts      # 指标收集器
│   │   ├── service.ts         # 监控服务
│   │   └── __tests__/
│   └── pdk/                   # 多语言PDK支持
│       ├── index.ts
│       ├── typescript/
│       ├── python/
│       ├── rust/
│       ├── go/
│       └── cpp/
├── api/                       # API层
│   ├── routes/                # API路由
│   │   ├── auth/
│   │   ├── plugins/
│   │   ├── admin/
│   │   └── stats/
│   └── middleware/            # API中间件
├── services/                  # 服务整合层
│   ├── index.ts
│   ├── registry-service.ts
│   ├── auth-service.ts
│   └── plugin-service.ts
├── utils/                     # 通用工具函数
│   ├── index.ts
│   ├── validation.ts
│   ├── security.ts
│   └── logging.ts
└── tests/                     # 集成测试
    ├── integration/
    ├── performance/
    └── e2e/
```

## 2. 前端应用结构 (extism-registry)

对于`extism-registry`应用，建议的结构如下:

```
extism-registry/
├── src/
│   ├── app/                   # Next.js App Router结构
│   │   ├── (auth)/            # 认证相关路由
│   │   ├── admin/             # 管理控制台
│   │   ├── marketplace/       # 插件市场
│   │   ├── docs/              # 文档页面
│   │   └── api/               # API路由
│   ├── components/            # UI组件
│   │   ├── ui/                # 基础UI组件
│   │   ├── admin/             # 管理组件
│   │   ├── marketplace/       # 市场组件
│   │   ├── plugins/           # 插件相关组件
│   │   ├── layout/            # 布局组件
│   │   └── forms/             # 表单组件
│   ├── hooks/                 # React Hooks
│   │   ├── use-auth.ts
│   │   ├── use-plugins.ts
│   │   └── use-theme.ts
│   ├── lib/                   # 工具库
│   │   ├── api-client.ts      # API客户端
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── store/                 # 状态管理
│   │   ├── auth-context.tsx
│   │   └── theme-context.tsx
│   ├── types/                 # 类型定义
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   └── plugins.ts
│   ├── services/              # 前端服务
│   │   ├── auth-service.ts
│   │   └── plugin-service.ts
│   └── styles/                # 样式文件
│       └── globals.css
```

## 3. 模块化实现步骤

### 阶段1: 核心模块重组

1. 创建模块目录结构:
```bash
mkdir -p src/modules/{core,registry,package-manager,auth,enterprise,plugins,monitoring,pdk}
mkdir -p src/api/{routes,middleware}
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/tests/{integration,performance,e2e}
```

2. 迁移现有代码:
   - 将`host.ts`、`extism-pdk.ts`移动到`modules/core/extism/`
   - 将`registry*.ts`文件移动到`modules/registry/`
   - 将企业支持相关文件移动到`modules/enterprise/`
   - 将PDK实现移动到`modules/pdk/`对应的语言子目录

3. 为每个模块创建索引文件:
```typescript
// src/modules/core/index.ts
export * from './extism';
export * from './common';

// src/modules/registry/index.ts
export * from './types';
export * from './service';
export * from './cli';
```

### 阶段2: API和服务层重构

1. 创建统一的服务层入口:
```typescript
// src/services/index.ts
export * from './registry-service';
export * from './auth-service';
export * from './plugin-service';
```

2. 将API实现分解到合适的路由文件中

### 阶段3: 前端应用重构

1. 组织组件按功能分类
2. 实现共享hooks和状态管理
3. 创建API客户端统一前后端通信

## 4. 模块间通信和依赖管理

为了降低模块间耦合，建议:

1. 使用接口定义模块边界:
```typescript
// src/modules/plugins/types.ts
export interface PluginService {
  search(query: string, options?: SearchOptions): Promise<Plugin[]>;
  install(name: string, version?: string): Promise<InstallResult>;
  // ...其他方法
}
```

2. 通过依赖注入或工厂模式创建服务实例:
```typescript
// src/services/plugin-service.ts
import { PluginService } from '../modules/plugins/types';
import { DefaultPluginService } from '../modules/plugins/service';

// 服务工厂
export const createPluginService = (config?: PluginServiceConfig): PluginService => {
  return new DefaultPluginService(config);
};
```

## 5. 模块化测试策略

针对模块化架构的测试策略:

1. 单元测试: 放置在每个模块的`__tests__`目录下
2. 集成测试: 放置在`src/tests/integration`目录下
3. 性能测试: 放置在`src/tests/performance`目录下
4. 端到端测试: 放置在`src/tests/e2e`目录下

通过这样的模块化结构，每个功能将有明确的边界和责任划分，使代码更易于维护和扩展。
