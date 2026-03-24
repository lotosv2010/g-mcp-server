import { randomUUID } from 'crypto';
import { createServer } from 'http';
import { MCPServer } from './mcp-server.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

export class StreamableHTTPServer {
  private port: number;
  private sessions = new Map<string, StreamableHTTPServerTransport>();

  constructor(port: number = 3000) {
    this.port = port;
  }

  async start() {
    const server = createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Mcp-Session-Id');
      res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', sessions: this.sessions.size }));
        return;
      }

      if (req.url === '/mcp') {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;

        // 已有会话
        if (sessionId && this.sessions.has(sessionId)) {
          await this.sessions.get(sessionId)!.handleRequest(req, res);
          return;
        }

        // 新会话（只接受 POST 初始化请求）
        if (req.method === 'POST') {
          await this.createSession(req, res);
          return;
        }

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Request: No valid session' }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    server.listen(this.port, () => {
      console.error(`MCP Streamable HTTP Server running at http://localhost:${this.port}`);
      console.error(`MCP endpoint: http://localhost:${this.port}/mcp\n`);
    });

    return server;
  }

  private async createSession(req: import('http').IncomingMessage, res: import('http').ServerResponse) {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        this.sessions.delete(transport.sessionId);
        console.error(`Session closed: ${transport.sessionId}`);
      }
    };

    const mcpServer = new MCPServer();
    await mcpServer.getServer().connect(transport);
    await transport.handleRequest(req, res);

    if (transport.sessionId) {
      this.sessions.set(transport.sessionId, transport);
      console.error(`New session: ${transport.sessionId}`);
    }
  }
}
