#!/usr/bin/env node
import { MCPServer } from './mcp-server';
import { HTTPServer } from './http-server';
import { StreamableHTTPServer } from './streamable-server';
import { serve } from '@hono/node-server';

// 解析命令行参数
const args = process.argv.slice(2);
const useStdio = args.includes('--stdio');
const useHTTP = args.includes('--http');
const useStreamable = args.includes('--streamable');
const portArg = args.find((arg) => arg.startsWith('--port='));
const port = portArg ? parseInt(portArg.split('=')[1]) : parseInt(process.env.MCP_PORT || '3000');

async function main() {
  // 没有指定任何参数时，默认启动 Stdio 模式
  const defaultStdio = !useStdio && !useHTTP && !useStreamable;

  if (useStdio && useStreamable) {
    // 同时启动 Stdio + Streamable HTTP 模式
    const mcpServer = new MCPServer();
    const streamableServer = new StreamableHTTPServer(port);
    await Promise.all([mcpServer.runStdio(), streamableServer.start()]);
  } else if (useStreamable) {
    // 仅 Streamable HTTP 模式
    const streamableServer = new StreamableHTTPServer(port);
    await streamableServer.start();
  } else if (useHTTP) {
    // HTTP 模式 - REST API (用于 LangChain 手动调用)
    const httpServer = new HTTPServer();
    const serverConfig = httpServer.start(port);

    serve({
      fetch: serverConfig.fetch,
      port: serverConfig.port,
    });

    console.log(`\n✅ HTTP Server started`);
    console.log(`   URL: http://localhost:${port}`);
    console.log(`   Use this for LangChain manual integration\n`);
  } else if (defaultStdio || useStdio) {
    // Stdio 模式 - 标准输入输出 (用于 MCP 客户端)
    const mcpServer = new MCPServer();
    await mcpServer.runStdio();
  }
}

main().catch((error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});
