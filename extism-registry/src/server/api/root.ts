import { packageRouter } from './routers/package';
import { createTRPCRouter } from './trpc';

/**
 * This is the primary router for your server.
 */
export const appRouter = createTRPCRouter({
  package: packageRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter; 