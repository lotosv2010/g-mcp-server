import { z } from 'zod';

// 计算器工具的参数校验
export const calculatorSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  a: z.number(),
  b: z.number(),
});

// 天气查询工具的参数校验
export const weatherSchema = z.object({
  city: z.string().min(1, '城市名称不能为空'),
});

// 计算器工具实现
export function calculator(params: z.infer<typeof calculatorSchema>) {
  const { operation, a, b } = params;

  switch (operation) {
    case 'add':
      return { result: a + b, expression: `${a} + ${b} = ${a + b}` };
    case 'subtract':
      return { result: a - b, expression: `${a} - ${b} = ${a - b}` };
    case 'multiply':
      return { result: a * b, expression: `${a} × ${b} = ${a * b}` };
    case 'divide':
      if (b === 0) {
        throw new Error('除数不能为0');
      }
      return { result: a / b, expression: `${a} ÷ ${b} = ${a / b}` };
  }
}

// 天气查询工具实现（模拟数据）
export function getWeather(params: z.infer<typeof weatherSchema>) {
  const { city } = params;

  const mockWeatherData: Record<string, { temperature: number; condition: string; humidity: number; wind: string }> = {
    '北京': { temperature: 15, condition: '☀️ 晴天', humidity: 45, wind: '东北风3级' },
    '上海': { temperature: 20, condition: '⛅ 多云', humidity: 65, wind: '东南风2级' },
    '广州': { temperature: 28, condition: '☁️ 阴天', humidity: 75, wind: '南风4级' },
    '深圳': { temperature: 27, condition: '🌧️ 小雨', humidity: 80, wind: '东风3级' },
  };

  // 如果城市不在模拟数据中，返回随机数据
  const weather = mockWeatherData[city] || {
    temperature: Math.floor(Math.random() * 30) + 5,
    condition: ['☀️ 晴天', '⛅ 多云', '☁️ 阴天', '🌧️ 小雨'][Math.floor(Math.random() * 4)],
    humidity: Math.floor(Math.random() * 40) + 40,
    wind: '微风',
  };

  return {
    city,
    ...weather,
    updateTime: new Date().toLocaleString('zh-CN'),
  };
}
