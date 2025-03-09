import { test, expect, Page } from '@playwright/test';

/**
 * 美甲设计生成流程端到端测试
 */
test.describe('美甲设计生成流程', () => {
  
  // 测试首页美甲设计展示区域
  test('首页应该展示美甲设计生成器', async ({ page }) => {
    // 访问首页
    await page.goto('/');
    
    // 验证美甲设计区域存在
    await expect(page.getByText('创建你的专属美甲设计')).toBeVisible();
    await expect(page.getByPlaceholderText('美甲设计描述')).toBeVisible();
    await expect(page.getByRole('button', { name: '生成' })).toBeVisible();
  });
  
  // 未登录用户交互测试
  test('未登录用户应看到登录提示', async ({ page }) => {
    // 访问首页
    await page.goto('/');
    
    // 验证提示信息存在
    await expect(page.getByText('请先登录账号后再生成美甲设计')).toBeVisible();
    
    // 验证生成按钮被禁用
    const generateButton = page.getByRole('button', { name: '生成' });
    await expect(generateButton).toBeDisabled();
  });
  
  // 输入过短提示词测试
  test('输入过短提示词应禁用按钮', async ({ page }) => {
    // 模拟已登录状态
    await mockAuthenticatedUser(page);
    
    // 访问首页
    await page.goto('/');
    
    // 输入过短提示词
    await page.getByPlaceholderText('美甲设计描述').fill('短');
    
    // 验证按钮被禁用
    const generateButton = page.getByRole('button', { name: '生成' });
    await expect(generateButton).toBeDisabled();
  });
  
  // 输入有效提示词测试
  test('登录用户输入有效提示词应启用按钮', async ({ page }) => {
    // 模拟已登录状态
    await mockAuthenticatedUser(page);
    
    // 访问首页
    await page.goto('/');
    
    // 输入有效提示词
    await page.getByPlaceholderText('美甲设计描述').fill('足够长的美甲设计提示词测试');
    
    // 验证按钮被启用
    const generateButton = page.getByRole('button', { name: '生成' });
    await expect(generateButton).toBeEnabled();
  });
  
  // 点击生成按钮测试
  test('点击生成按钮应发起请求', async ({ page }) => {
    // 模拟已登录状态
    await mockAuthenticatedUser(page);
    
    // 访问首页
    await page.goto('/');
    
    // 模拟API响应
    await page.route('**/api/generate/nail-design', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          image_url: 'https://example.com/test.png',
          design: {
            id: 1,
            uuid: 'test-uuid',
            prompt: '足够长的美甲设计提示词测试'
          }
        }),
      });
    });
    
    // 输入有效提示词
    await page.getByPlaceholderText('美甲设计描述').fill('足够长的美甲设计提示词测试');
    
    // 点击生成按钮
    const generateButton = page.getByRole('button', { name: '生成' });
    await generateButton.click();
    
    // 验证按钮状态变为"生成中..."
    await expect(page.getByText('生成中...')).toBeVisible();
    
    // 验证成功提示
    await expect(page.getByText('美甲设计已生成成功')).toBeVisible();
  });
  
  // 生成失败测试
  test('生成失败应显示错误消息', async ({ page }) => {
    // 模拟已登录状态
    await mockAuthenticatedUser(page);
    
    // 访问首页
    await page.goto('/');
    
    // 模拟API失败响应
    await page.route('**/api/generate/nail-design', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: '生成失败，请稍后重试'
        }),
      });
    });
    
    // 输入有效提示词
    await page.getByPlaceholderText('美甲设计描述').fill('足够长的美甲设计提示词测试');
    
    // 点击生成按钮
    const generateButton = page.getByRole('button', { name: '生成' });
    await generateButton.click();
    
    // 验证错误消息显示
    await expect(page.getByText('生成失败，请稍后重试')).toBeVisible();
  });
  
  // 测试生成图片的布局是否正常
  test('生成后的页面布局应保持正常', async ({ page }) => {
    // 模拟已登录状态
    await mockAuthenticatedUser(page);
    
    // 访问首页
    await page.goto('/');
    
    // 验证输入框初始宽度
    const inputBoxInitialWidth = await page.getByPlaceholderText('美甲设计描述').evaluate(el => {
      return window.getComputedStyle(el).width;
    });
    
    // 模拟API失败响应
    await page.route('**/api/generate/nail-design', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: '生成失败，请稍后重试'
        }),
      });
    });
    
    // 输入有效提示词并点击生成
    await page.getByPlaceholderText('美甲设计描述').fill('足够长的美甲设计提示词测试');
    await page.getByRole('button', { name: '生成' }).click();
    
    // 确认错误消息显示
    await expect(page.getByText('生成失败，请稍后重试')).toBeVisible();
    
    // 验证输入框宽度是否保持不变
    const inputBoxWidthAfterError = await page.getByPlaceholderText('美甲设计描述').evaluate(el => {
      return window.getComputedStyle(el).width;
    });
    
    // 比较宽度
    expect(inputBoxWidthAfterError).toBe(inputBoxInitialWidth);
  });
  
  // 测试图片列表展示
  test('应展示美甲设计图片列表', async ({ page }) => {
    // 访问首页
    await page.goto('/');
    
    // 模拟API响应
    await page.route('**/api/nail-designs**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          designs: [
            {
              uuid: 'design-1',
              prompt: '红色花纹美甲',
              image_url: 'https://example.com/nail1.png',
              width: 1792,
              height: 1024,
              created_at: new Date().toISOString()
            },
            {
              uuid: 'design-2',
              prompt: '蓝色星空美甲',
              image_url: 'https://example.com/nail2.png',
              width: 1792,
              height: 1024,
              created_at: new Date(Date.now() - 86400000).toISOString() // 1天前
            }
          ]
        }),
      });
    });
    
    // 验证最新美甲设计标题存在
    await expect(page.getByText('最新美甲设计作品')).toBeVisible();
    
    // 验证设计卡片存在
    await expect(page.getByText('红色花纹美甲')).toBeVisible();
    await expect(page.getByText('蓝色星空美甲')).toBeVisible();
  });
});

/**
 * 模拟已登录用户
 */
async function mockAuthenticatedUser(page: Page) {
  // 设置localStorage以模拟登录状态
  await page.addInitScript(() => {
    window.localStorage.setItem('mock-auth-state', JSON.stringify({
      user: { id: 'test-user-id', name: 'Test User' }
    }));
  });
  
  // 模拟session API响应
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'test-user-id', name: 'Test User' }
      }),
    });
  });
  
  // 模拟使用限制API响应
  await page.route('**/api/user/usage-limits', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        usageLimit: {
          daily_usage: 2,
          daily_limit: 5
        }
      }),
    });
  });
} 