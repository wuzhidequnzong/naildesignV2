import { POST } from '@/app/api/generate/nail-design/route';
import { auth } from '@/auth';
import { checkUserUsageLimit, updateUserUsage } from '@/models/userUsageLimit';
import { insertNailDesign } from '@/models/nailDesign';
import { validatePromptLength, createNailDesignPrompt } from '@/lib/prompt-template';
import { newStorage } from '@/lib/storage';
import { experimental_generateImage } from 'ai';

// 模拟依赖
jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

jest.mock('@/models/userUsageLimit', () => ({
  checkUserUsageLimit: jest.fn(),
  updateUserUsage: jest.fn()
}));

jest.mock('@/models/nailDesign', () => ({
  insertNailDesign: jest.fn()
}));

jest.mock('@/lib/prompt-template', () => ({
  validatePromptLength: jest.fn(),
  createNailDesignPrompt: jest.fn()
}));

jest.mock('@/lib/storage', () => ({
  newStorage: jest.fn()
}));

jest.mock('ai', () => ({
  experimental_generateImage: jest.fn()
}));

describe('Nail Design Generation API', () => {
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 默认模拟身份验证成功
    (auth as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id' }
    });
    
    // 默认模拟用户未超出限制
    (checkUserUsageLimit as jest.Mock).mockResolvedValue(true);
    
    // 默认模拟提示词验证通过
    (validatePromptLength as jest.Mock).mockReturnValue(true);
    
    // 默认模拟提示词转换
    (createNailDesignPrompt as jest.Mock).mockReturnValue('完整的提示词');
    
    // 默认模拟图片生成成功
    (experimental_generateImage as jest.Mock).mockResolvedValue({
      images: [{ base64: 'test-image-data' }],
      warnings: []
    });
    
    // 默认模拟存储服务
    const mockUploadFile = jest.fn().mockResolvedValue(true);
    (newStorage as jest.Mock).mockReturnValue({
      uploadFile: mockUploadFile
    });
    
    // 默认模拟数据库插入成功
    (insertNailDesign as jest.Mock).mockResolvedValue({
      id: 1,
      uuid: 'test-uuid',
      user_uuid: 'test-user-id',
      prompt: '测试提示词',
      image_url: 'https://example.com/image.png'
    });
    
    // 默认模拟更新用户使用次数成功
    (updateUserUsage as jest.Mock).mockResolvedValue(true);
    
    // 环境变量模拟
    process.env.STORAGE_DOMAIN = 'https://example.com';
  });

  // 测试未认证用户
  test('未登录用户应该返回401错误', async () => {
    // 模拟未登录
    (auth as jest.Mock).mockResolvedValue(null);
    
    // 创建请求
    const req = new Request('https://example.com/api/generate/nail-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '测试提示词' })
    });
    
    // 调用API
    const response = await POST(req);
    const data = await response.json();
    
    // 验证响应
    expect(response.status).toBe(401);
    expect(data.error).toBe('请先登录');
  });

  // 测试提示词验证
  test('提示词太短应该返回400错误', async () => {
    // 模拟提示词验证失败
    (validatePromptLength as jest.Mock).mockReturnValue(false);
    
    // 创建请求
    const req = new Request('https://example.com/api/generate/nail-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '短' })
    });
    
    // 调用API
    const response = await POST(req);
    const data = await response.json();
    
    // 验证响应
    expect(response.status).toBe(400);
    expect(data.error).toBe('提示词长度必须在5-200字符之间');
  });

  // 测试使用限制
  test('超出使用限制应该返回403错误', async () => {
    // 模拟用户已达使用限制
    (checkUserUsageLimit as jest.Mock).mockResolvedValue(false);
    
    // 创建请求
    const req = new Request('https://example.com/api/generate/nail-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '足够长的提示词测试' })
    });
    
    // 调用API
    const response = await POST(req);
    const data = await response.json();
    
    // 验证响应
    expect(response.status).toBe(403);
    expect(data.error).toBe('今日生成次数已用完');
  });

  // 测试图片生成失败
  test('AI模型生成失败应该返回500错误', async () => {
    // 模拟AI模型生成失败
    (experimental_generateImage as jest.Mock).mockRejectedValue(new Error('AI生成失败'));
    
    // 创建请求
    const req = new Request('https://example.com/api/generate/nail-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '足够长的提示词测试' })
    });
    
    // 调用API
    const response = await POST(req);
    const data = await response.json();
    
    // 验证响应
    expect(response.status).toBe(500);
    expect(data.error).toBe('生成失败，请稍后重试');
  });

  // 测试存储服务失败
  test('存储服务故障应该返回500错误', async () => {
    // 模拟存储服务失败
    const mockUploadFile = jest.fn().mockRejectedValue(new Error('存储服务故障'));
    (newStorage as jest.Mock).mockReturnValue({
      uploadFile: mockUploadFile
    });
    
    // 创建请求
    const req = new Request('https://example.com/api/generate/nail-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '足够长的提示词测试' })
    });
    
    // 调用API
    const response = await POST(req);
    const data = await response.json();
    
    // 验证响应
    expect(response.status).toBe(500);
    expect(data.error).toBe('生成失败，请稍后重试');
  });

  // 测试数据库故障
  test('数据库故障应该返回500错误', async () => {
    // 模拟数据库故障
    (insertNailDesign as jest.Mock).mockRejectedValue(new Error('数据库故障'));
    
    // 创建请求
    const req = new Request('https://example.com/api/generate/nail-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '足够长的提示词测试' })
    });
    
    // 调用API
    const response = await POST(req);
    const data = await response.json();
    
    // 验证响应
    expect(response.status).toBe(500);
    expect(data.error).toBe('生成失败，请稍后重试');
  });

  // 测试成功案例
  test('所有验证通过应该成功生成图片', async () => {
    // 创建请求
    const req = new Request('https://example.com/api/generate/nail-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '足够长的提示词测试' })
    });
    
    // 调用API
    const response = await POST(req);
    const data = await response.json();
    
    // 验证响应
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.image_url).toBeDefined();
    
    // 验证所有步骤都被调用
    expect(validatePromptLength).toHaveBeenCalled();
    expect(createNailDesignPrompt).toHaveBeenCalled();
    expect(experimental_generateImage).toHaveBeenCalled();
    expect(newStorage().uploadFile).toHaveBeenCalled();
    expect(insertNailDesign).toHaveBeenCalled();
    expect(updateUserUsage).toHaveBeenCalledWith('test-user-id');
  });
}); 