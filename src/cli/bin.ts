#!/usr/bin/env node

import { createCLI } from './index';

/**
 * 解析命令行参数
 */
const args = process.argv.slice(2);

/**
 * 创建CLI实例
 */
const cli = createCLI();

/**
 * 执行CLI命令
 */
cli.run(args).catch(error => {
  console.error('致命错误:', error);
  process.exit(1);
}); 