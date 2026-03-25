#!/usr/bin/env node
import { MCPServer } from './mcp-server';
import { StreamableHTTPServer } from './streamable-server';

// 解析命令行参数
const args = process.argv.slice(2);
const useStdio = args.includes('--stdio');
const useStreamable = args.includes('--streamable');
const portArg = args.find((arg) => arg.startsWith('--port='));
const port = portArg ? parseInt(portArg.split('=')[1]) : parseInt(process.env.MCP_PORT || '3000');

async function main() {
  if (useStdio && useStreamable) {
    // 同时启动 Stdio + Streamable HTTP 模式
    const mcpServer = new MCPServer();
    const streamableServer = new StreamableHTTPServer(port);
    await Promise.all([mcpServer.runStdio(), streamableServer.start()]);
  } else if (useStreamable) {
    // 仅 Streamable HTTP 模式
    const streamableServer = new StreamableHTTPServer(port);
    await streamableServer.start();
  } else {
    // Stdio 模式（默认）
    const mcpServer = new MCPServer();
    await mcpServer.runStdio();
  }
}

main().catch((error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});
