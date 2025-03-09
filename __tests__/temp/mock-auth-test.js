// 创建一个模拟的会话对象，类似实际的会话结构
const mockSession = {
  user: {
    // 注意这里：设置了uuid但没有id字段
    uuid: 'test-user-uuid-123',
    email: 'test@example.com',
    nickname: 'Test User',
    avatar_url: '',
    created_at: new Date().toISOString()
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

// 现在假设我们在API中使用这个会话
function simulateApiCall(session) {
  console.log('模拟API调用开始');
  
  try {
    // 这里复制美甲设计生成API的逻辑
    if (!session?.user) {
      console.error('API调用失败: 用户未登录');
      return { error: "请先登录", status: 401 };
    }
    
    // 这里是关键：API尝试使用session.user.id
    const user_uuid = session.user.id;
    console.log(`用户已验证，用户ID: ${user_uuid}`);
    
    // 如果user_uuid是undefined，下面的代码会失败
    if (!user_uuid) {
      console.error('错误: 用户ID为undefined，可能导致数据库约束错误');
      throw new Error('用户ID为空，违反数据库非空约束');
    }
    
    // 模拟检查用户使用限制
    console.log(`检查用户(${user_uuid})使用限制...`);
    // 实际调用：await checkUserUsageLimit(user_uuid);
    
    return { success: true, user_id: user_uuid };
  } catch (error) {
    console.error('API调用过程中出错:', error.message);
    return { error: "生成失败，请稍后重试", status: 500 };
  }
}

console.log('\n=== 测试1: 使用原始会话结构（没有id字段） ===');
const result1 = simulateApiCall(mockSession);
console.log('API返回结果:', result1);

console.log('\n=== 测试2: 尝试修复方法1 - 添加id字段 ===');
const fixedSession1 = {
  ...mockSession,
  user: {
    ...mockSession.user,
    id: mockSession.user.uuid // 关键修复：将uuid复制到id字段
  }
};
const result2 = simulateApiCall(fixedSession1);
console.log('API返回结果:', result2);

console.log('\n=== 测试3: 尝试修复方法2 - 修改API使用uuid字段 ===');
function simulateFixedApiCall(session) {
  try {
    if (!session?.user) {
      return { error: "请先登录", status: 401 };
    }
    
    // 关键修复：API使用session.user.uuid而不是id
    const user_uuid = session.user.uuid;
    console.log(`修复版API - 用户已验证，用户UUID: ${user_uuid}`);
    
    if (!user_uuid) {
      throw new Error('用户UUID为空，违反数据库非空约束');
    }
    
    return { success: true, user_id: user_uuid };
  } catch (error) {
    return { error: "生成失败，请稍后重试", status: 500 };
  }
}

const result3 = simulateFixedApiCall(mockSession);
console.log('修复版API返回结果:', result3); 