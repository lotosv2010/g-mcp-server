import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { calculator, calculatorSchema, getWeather, weatherSchema } from './tools';

export class MCPServer {
  private server: McpServer;

  constructor() {
    this.server = new McpServer({
      name: 'calculator-weather-server',
      version: '1.0.0',
    });

    this.setupTools();
  }

  private setupTools() {
    this.server.registerTool(
      'calculator',
      {
        description: '执行基本的数学运算：加法、减法、乘法、除法',
        inputSchema: calculatorSchema.shape,
      },
      async (args) => ({
        content: [{ type: 'text', text: JSON.stringify(calculator(args), null, 2) }],
      })
    );

    this.server.registerTool(
      'get_weather',
      {
        description: '查询指定城市的天气信息（模拟数据）',
        inputSchema: weatherSchema.shape,
      },
      async (args) => ({
        content: [{ type: 'text', text: JSON.stringify(getWeather(args), null, 2) }],
      })
    );
  }

  // 启动 stdio 传输
  async runStdio() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Server running on stdio');
  }

  async connect(transport: Transport) {
    await this.server.connect(transport);
  }
}
