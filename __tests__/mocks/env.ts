/**
 * 模拟环境变量
 * 用于测试环境中提供必要的环境配置
 */
export function mockEnv() {
  return {
    ...process.env,
    // 认证相关
    NEXTAUTH_URL: 'http://localhost:3000',
    NEXTAUTH_SECRET: 'test-auth-secret',
    
    // OAuth提供商
    GITHUB_ID: 'mock-github-id',
    GITHUB_SECRET: 'mock-github-secret',
    
    // 数据库配置
    DATABASE_URL: 'postgres://user:password@localhost:5432/testdb',
    
    // 应用配置
    NEXT_PUBLIC_WEB_URL: 'http://localhost:3000',
    
    // 存储服务配置
    STORAGE_DOMAIN: 'https://example.com/storage',
    
    // 其他API密钥
    REPLICATE_API_TOKEN: 'mock-replicate-token',
  };
} 