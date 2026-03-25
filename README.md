# g-mcp-server

基于 TypeScript 的 MCP (Model Context Protocol) 服务器，内置计算器和天气查询工具，支持 Stdio 和 Streamable HTTP 两种传输模式。

## 技术栈

TypeScript + MCP SDK + Hono + Zod

## 项目结构

```
src/
├── index.ts              # 入口，解析命令行参数，启动对应模式
├── mcp-server.ts         # MCP 服务器，注册工具，管理 transport 连接
├── streamable-server.ts  # Streamable HTTP 服务器，基于 Hono + WebStandard Transport
└── tools.ts              # 工具定义（计算器、天气查询）
```

## 快速开始

```bash
pnpm install
pnpm dev
```

## 启动模式

| 命令 | 参数 | 说明 |
|---|---|---|
| `pnpm dev` | 无 | Stdio 模式（默认），用于本地 MCP 客户端 |
| `pnpm streamable` | `--streamable` | Streamable HTTP 模式，用于远程 MCP 客户端 |
| `pnpm both` | `--stdio --streamable` | 两种模式同时启动 |
| `pnpm start` | `--streamable` | 生产环境，编译后运行 |

### 端口配置

```bash
# 命令行参数
pnpm streamable -- --port=8080

# 环境变量
MCP_PORT=8080 pnpm streamable
```

优先级：`--port=` > `MCP_PORT` 环境变量 > 默认 3000

## 内置工具

### calculator

执行基本数学运算：加法、减法、乘法、除法。

```json
{ "operation": "add", "a": 1, "b": 2 }
```

### get_weather

查询指定城市的天气信息（模拟数据）。

```json
{ "city": "北京" }
```

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

先启动：`pnpm streamable`

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
pnpm add @langchain/mcp-adapters
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

const client = new MultiServerMCPClient({
  "calculator-weather": {
    url: "http://localhost:3000/mcp",
  },
});

await client.connect();
const tools = await client.getTools();
```

## HTTP 端点（Streamable HTTP 模式）

| 端点 | 方法 | 说明 |
|---|---|---|
| `/mcp` | POST/GET/DELETE | MCP 协议端点 |
| `/health` | GET | 健康检查，返回当前会话数 |

## 生产构建

```bash
pnpm build    # TypeScript 编译到 dist/
pnpm start    # Streamable HTTP 模式运行编译产物
```

## 调试

```bash
pnpm inspect  # 使用 MCP Inspector 调试
```
