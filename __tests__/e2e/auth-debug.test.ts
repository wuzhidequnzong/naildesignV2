import { test, expect, Page } from '@playwright/test';

/**
 * 身份验证和API问题诊断测试
 * 这个测试脚本旨在捕获和分析认证流程和API调用中的问题
 * 特别关注：
 * 1. 会话对象结构和用户ID
 * 2. 页面间的会话传递
 * 3. 登录流程的水合错误
 */
test.describe('身份验证和API诊断', () => {
  // 存储所有收集到的数据
  const diagnosticData = {
    sessionResponses: [],
    generateResponses: [],
    cookies: [],
    storageState: null,
    errorMessages: []
  };

  // 捕获所有会话请求和响应
  test.beforeEach(async ({ context }) => {
    // 监听会话API请求
    await context.route('**/api/auth/session', async route => {
      const response = await route.fetch();
      const json = await response.json();
      
      diagnosticData.sessionResponses.push({
        url: route.request().url(),
        timestamp: new Date().toISOString(),
        status: response.status(),
        body: json
      });
      
      await route.fulfill({ response });
    });
    
    // 监听生成API请求
    await context.route('**/api/generate/nail-design', async route => {
      const request = route.request();
      let requestBody;
      try {
        requestBody = JSON.parse(request.postData() || '{}');
      } catch (e) {
        requestBody = { error: 'Unable to parse request body' };
      }
      
      const response = await route.fetch();
      let responseBody;
      try {
        responseBody = await response.json();
      } catch (e) {
        responseBody = { error: 'Unable to parse response body' };
      }
      
      diagnosticData.generateResponses.push({
        url: request.url(),
        timestamp: new Date().toISOString(),
        requestHeaders: request.headers(),
        requestBody,
        status: response.status(),
        responseBody
      });
      
      await route.fulfill({ response });
    });
  });

  // 测试完整登录流程并捕获所有数据
  test('登录过程诊断', async ({ page, context }) => {
    // 启用控制台日志捕获
    page.on('console', msg => {
      console.log(`浏览器控制台 [${msg.type()}]: ${msg.text()}`);
    });
    
    // 捕获JS错误
    page.on('pageerror', error => {
      console.error('页面错误:', error.message);
      diagnosticData.errorMessages.push({
        type: 'pageerror',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });
    
    // 访问首页
    console.log('步骤: 访问首页');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 截图首页状态
    await page.screenshot({ path: 'homepage-initial.png' });
    
    // 检查会话状态
    console.log('步骤: 获取初始会话状态');
    const initialSession = await page.evaluate(async () => {
      const response = await fetch('/api/auth/session');
      return await response.json();
    });
    console.log('初始会话状态:', initialSession);
    
    // 检查登录按钮
    const loginButton = page.getByRole('button', { name: '登录' });
    console.log('步骤: 检查登录按钮');
    if (await loginButton.isVisible()) {
      console.log('登录按钮可见, 准备点击');
      await loginButton.click();
      
      // 等待登录页面加载
      await page.waitForURL('**/auth/signin**', { timeout: 10000 });
      console.log('已导航到登录页面');
      
      // 截图登录页面
      await page.screenshot({ path: 'login-page.png' });
      
      // 查找错误信息
      const errorText = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('[role="alert"], .text-red-500, .text-destructive');
        return Array.from(errorElements).map(el => el.textContent).filter(Boolean);
      });
      
      if (errorText.length > 0) {
        console.log('登录页面显示错误:', errorText);
        diagnosticData.errorMessages.push({
          type: 'login-page-error',
          messages: errorText,
          timestamp: new Date().toISOString()
        });
      }
      
      // 查找GitHub登录按钮
      const githubButton = await page.getByRole('button', { name: /GitHub/i });
      if (await githubButton.isVisible()) {
        console.log('找到GitHub登录按钮, 但不会自动点击');
        // 这里不自动点击，因为可能需要输入GitHub凭据
      } else {
        console.log('未找到GitHub登录按钮');
      }
    } else {
      console.log('登录按钮不可见，可能已登录');
    }
    
    // 收集浏览器存储数据
    const storageState = await context.storageState();
    diagnosticData.storageState = storageState;
    console.log('收集到存储状态: cookies数量 =', storageState.cookies.length);
    
    // 输出所有诊断数据
    console.log('==== 诊断数据摘要 ====');
    console.log('会话响应数量:', diagnosticData.sessionResponses.length);
    console.log('生成响应数量:', diagnosticData.generateResponses.length);
    console.log('错误消息数量:', diagnosticData.errorMessages.length);
    console.log('Cookie数量:', storageState.cookies.length);
    
    // 保存完整诊断数据到文件
    await page.evaluate(data => {
      // 创建一个下载链接
      const a = document.createElement('a');
      const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      a.href = URL.createObjectURL(file);
      a.download = 'auth-diagnostic-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, diagnosticData);
  });
  
  // 测试生成美甲图片流程
  test('生成美甲设计诊断', async ({ page, context }) => {
    // 访问首页
    console.log('步骤: 访问首页');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 检查当前会话状态
    console.log('步骤: 获取当前会话状态');
    const currentSession = await page.evaluate(async () => {
      const response = await fetch('/api/auth/session');
      return await response.json();
    });
    console.log('当前会话状态:', currentSession);
    
    // 检查是否已登录
    const isLoggedIn = await page.evaluate(() => {
      return document.querySelector('button[disabled]') !== null && 
             document.querySelector('button')?.textContent?.includes('生成');
    });
    
    if (isLoggedIn) {
      console.log('用户似乎已登录，尝试生成美甲设计');
      
      // 输入提示词
      const promptInput = page.getByPlaceholderText('美甲设计描述');
      await promptInput.fill('测试美甲设计提示词');
      console.log('已输入提示词');
      
      // 截图生成前状态
      await page.screenshot({ path: 'before-generate.png' });
      
      // 尝试点击生成按钮
      const generateButton = page.getByRole('button', { name: '生成' });
      if (await generateButton.isEnabled()) {
        console.log('生成按钮已启用，点击生成');
        await generateButton.click();
        
        // 等待响应
        await page.waitForTimeout(3000);
        
        // 截图生成后状态
        await page.screenshot({ path: 'after-generate.png' });
        
        // 检查是否有错误消息
        const errorElement = await page.locator('.text-destructive');
        if (await errorElement.isVisible()) {
          const errorText = await errorElement.textContent();
          console.log('生成过程出现错误:', errorText);
          diagnosticData.errorMessages.push({
            type: 'generate-error',
            message: errorText || '未知错误',
            timestamp: new Date().toISOString()
          });
        }
      } else {
        console.log('生成按钮被禁用，无法点击');
      }
    } else {
      console.log('用户未登录，无法生成美甲设计');
    }
    
    // 输出最终诊断数据
    console.log('==== 最终诊断数据 ====');
    console.log(JSON.stringify(diagnosticData, null, 2));
  });
}); 