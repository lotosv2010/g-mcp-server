# MCP Server - Calculator & Weather

一个 MCP (Model Context Protocol) 服务器示例，支持 Stdio、Streamable HTTP、REST API 三种模式。

## 功能

- 🧮 计算器工具：加减乘除
- 🌤️ 天气查询工具：城市天气信息（模拟数据）

## 技术栈

TypeScript + MCP SDK + Hono + Zod

## 安装

```bash
npm install
```

## 使用

| 命令 | 模式 | 用途 |
|------|------|------|
| `npm run dev` | Stdio | Claude Desktop、@langchain/mcp-adapters 本地连接 |
| `npm run streamable` | Streamable HTTP | 远程 MCP 客户端、@langchain/mcp-adapters 远程连接 |
| `npm run http` | REST API | 手动 LangChain 工具集成 |

## MCP 客户端配置

### Stdio

```json
{
  "mcpServers": {
    "calculator-weather": {
      "command": "npx",
      "args": ["-y", "tsx", "path/to/src/index.ts"]
    }
  }
}
```

### Streamable HTTP

先启动：`npm run streamable`

```json
{
  "mcpServers": {
    "calculator-weather": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## LangChain 集成

```bash
npm install @langchain/mcp-adapters
```

### Stdio 方式（本地）

```typescript
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const client = new MultiServerMCPClient({
  "calculator-weather": {
    command: "npx",
    args: ["-y", "tsx", "path/to/src/index.ts"],
  },
});

await client.connect();
const tools = await client.getTools();
```

### Streamable HTTP 方式（远程）

```typescript
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// 先启动：npm run streamable
const client = new MultiServerMCPClient({
  "calculator-weather": {
    url: "http://localhost:3000/mcp",
  },
});

await client.connect();
const tools = await client.getTools();
```

### 手动 REST API 调用

```typescript
// 先启动：npm run http
const res = await fetch("http://localhost:3000/tools/calculator", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ operation: "add", a: 10, b: 5 }),
});
const data = await res.json();
// { success: true, data: { result: 15, expression: "10 + 5 = 15" } }
```
