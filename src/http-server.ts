import { Hono } from 'hono';
import { calculator, calculatorSchema, getWeather, weatherSchema } from './tools.js';

export class HTTPServer {
  private app: Hono;

  constructor() {
    this.app = new Hono();
    this.setupRoutes();
  }

  private setupRoutes() {
    // 健康检查
    this.app.get('/health', (c) => {
      return c.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 列出可用工具
    this.app.get('/tools', (c) => {
      return c.json({
        tools: [
          {
            name: 'calculator',
            description: '执行基本的数学运算：加法、减法、乘法、除法',
            parameters: {
              operation: 'add | subtract | multiply | divide',
              a: 'number',
              b: 'number',
            },
          },
          {
            name: 'get_weather',
            description: '查询指定城市的天气信息（模拟数据）',
            parameters: {
              city: 'string',
            },
          },
        ],
      });
    });

    // 执行计算器工具
    this.app.post('/tools/calculator', async (c) => {
      try {
        const body = await c.req.json();
        const params = calculatorSchema.parse(body);
        const result = calculator(params);
        return c.json({ success: true, data: result });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return c.json({ success: false, error: message }, 400);
      }
    });

    // 执行天气查询工具
    this.app.post('/tools/get_weather', async (c) => {
      try {
        const body = await c.req.json();
        const params = weatherSchema.parse(body);
        const result = getWeather(params);
        return c.json({ success: true, data: result });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return c.json({ success: false, error: message }, 400);
      }
    });
  }

  start(port: number = 3000) {
    console.log(`🚀 HTTP Server running at http://localhost:${port}`);

    return {
      port,
      fetch: this.app.fetch.bind(this.app),
    };
  }
}
