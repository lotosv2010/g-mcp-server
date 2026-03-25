import { randomUUID } from 'crypto';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { MCPServer } from './mcp-server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

export class StreamableHTTPServer {
  private port: number;
  private sessions = new Map<string, WebStandardStreamableHTTPServerTransport>();

  constructor(port: number = 3000) {
    this.port = port;
  }

  async start() {
    const app = new Hono();

    app.use('*', cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'mcp-session-id', 'Last-Event-ID', 'mcp-protocol-version'],
      exposeHeaders: ['mcp-session-id', 'mcp-protocol-version'],
    }));

    app.get('/health', (c) => c.json({ status: 'ok', sessions: this.sessions.size }));

    app.all('/mcp', async (c) => {
      const sessionId = c.req.header('mcp-session-id');

      // 已有会话
      if (sessionId && this.sessions.has(sessionId)) {
        return this.sessions.get(sessionId)!.handleRequest(c.req.raw);
      }

      // 新会话（POST 初始化）
      if (c.req.method === 'POST') {
        return this.createSession(c.req.raw);
      }

      return c.json({ error: 'Bad Request: No valid session' }, 400);
    });

    serve({ fetch: app.fetch, port: this.port });

    console.error(`MCP Streamable HTTP Server running at http://localhost:${this.port}`);
    console.error(`MCP endpoint: http://localhost:${this.port}/mcp\n`);
  }

  private async createSession(req: Request): Promise<Response> {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        this.sessions.set(sessionId, transport);
        console.error(`New session: ${sessionId}`);
      },
      onsessionclosed: (sessionId) => {
        this.sessions.delete(sessionId);
        console.error(`Session closed: ${sessionId}`);
      },
    });

    const mcpServer = new MCPServer();
    await mcpServer.connect(transport);
    return transport.handleRequest(req);
  }
}
