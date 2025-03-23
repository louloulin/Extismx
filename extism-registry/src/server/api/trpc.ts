/**
 * tRPC 配置文件
 */
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

/**
 * 创建 tRPC 上下文
 */
export const createTRPCContext = async () => {
  return {
    // 这里可以添加会话信息、数据库连接等
  };
};

/**
 * 初始化 tRPC
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 创建路由器
 */
export const createTRPCRouter = t.router;

/**
 * 公开程序
 */
export const publicProcedure = t.procedure; 