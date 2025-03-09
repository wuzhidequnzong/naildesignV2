import { auth } from '@/auth';
import { mockCrypto } from '../mocks/crypto';
import { mockEnv } from '../mocks/env';

// 模拟crypto
jest.mock('crypto', () => mockCrypto());

// 模拟环境变量
jest.mock('process', () => ({
  ...process,
  env: mockEnv()
}));

// 模拟next-auth
jest.mock('next-auth', () => ({
  default: jest.fn(),
  getServerSession: jest.fn().mockResolvedValue({
    user: { 
      id: 'test-user-id',
      name: 'Test User'
    }
  })
}));

/**
 * 这个测试文件用于检查身份验证API和会话结构
 * 不修改任何项目代码，纯粹用于诊断
 */
describe('认证API诊断', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 诊断auth函数返回结构
  test('检查auth函数返回结构', async () => {
    // 模拟请求上下文
    const req = new Request('http://localhost:3000/api/generate/nail-design', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=mock-session-token'
      },
      body: JSON.stringify({ prompt: '测试提示词' })
    });

    // 调用auth函数并捕获结果
    let session;
    try {
      session = await auth();
      console.log('auth函数返回的会话:', session);
    } catch (error) {
      console.error('auth函数调用失败:', error);
      throw error;
    }

    // 检查会话结构
    console.log('会话是否存在:', !!session);
    if (session) {
      console.log('会话类型:', typeof session);
      console.log('会话对象键:', Object.keys(session));
      
      console.log('用户对象是否存在:', !!session.user);
      if (session.user) {
        console.log('用户ID是否存在:', !!session.user.id);
        console.log('用户ID类型:', typeof session.user.id);
        console.log('用户ID值:', session.user.id);
      }
    }

    // 非破坏性测试，不做断言
    expect(true).toBeTruthy();
  });

  // 检查API调用时会发生什么
  test('检查API调用时的会话访问', async () => {
    // 模拟请求处理函数
    const mockApiHandler = async () => {
      console.log('API处理开始');
      try {
        const session = await auth();
        console.log('API中获取的会话:', session);
        
        // 检查用户ID
        const user_uuid = session?.user?.id;
        console.log('提取的用户ID:', user_uuid);
        console.log('ID是undefined?', user_uuid === undefined);
        console.log('ID类型:', typeof user_uuid);
        
        // 模拟数据库调用
        if (!user_uuid) {
          console.log('错误: 用户ID为undefined，可能导致数据库约束错误');
        } else {
          console.log('用户ID有效，可以用于数据库操作');
        }
        
        return { success: true, user_id: user_uuid };
      } catch (error) {
        console.error('API处理错误:', error);
        return { error: String(error) };
      }
    };
    
    // 执行模拟API调用
    const result = await mockApiHandler();
    console.log('API调用结果:', result);
    
    // 非破坏性测试，不做断言
    expect(true).toBeTruthy();
  });
  
  // 检查session对象结构
  test('检查模拟会话对象结构', async () => {
    const { getServerSession } = require('next-auth');
    const mockSession = await getServerSession();
    
    console.log('模拟会话对象:', mockSession);
    console.log('模拟会话对象结构:', JSON.stringify(mockSession, null, 2));
    
    // 检查会话对象上的关键属性
    const keysExist = {
      user: 'user' in mockSession,
      userId: mockSession.user && 'id' in mockSession.user,
    };
    
    console.log('关键属性存在检查:', keysExist);
    
    // 非破坏性测试，不做断言
    expect(true).toBeTruthy();
  });
});

// 创建简单的模拟对象
export function createMocks() {
  return {
    mockSession: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      }
    }
  };
} 