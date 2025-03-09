const { chromium } = require('playwright');

(async () => {
  // 启动浏览器
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('开始测试登录和图片生成功能...');
  
  try {
    // 访问首页
    console.log('步骤: 访问首页');
    await page.goto('http://localhost:3000');
    console.log('成功加载首页');
    await page.screenshot({ path: 'temp/homepage.png' });
    
    // 检查会话状态
    console.log('步骤: 获取初始会话状态');
    const initialSession = await page.evaluate(async () => {
      const response = await fetch('/api/auth/session');
      return await response.json();
    });
    console.log('初始会话状态:', JSON.stringify(initialSession, null, 2));
    
    // 检查登录按钮
    const loginButtonExists = await page.getByRole('button', { name: '登录' }).isVisible();
    console.log('登录按钮是否可见:', loginButtonExists);
    
    if (loginButtonExists) {
      console.log('点击登录按钮');
      await page.getByRole('button', { name: '登录' }).click();
      
      // 等待导航到登录页面
      try {
        await page.waitForURL('**/auth/signin**', { timeout: 5000 });
        console.log('成功导航到登录页面');
        await page.screenshot({ path: 'temp/login-page.png' });
        
        // 捕获任何水合错误
        const errors = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('div[role="alert"]')).map(el => el.textContent);
        });
        
        if (errors.length > 0) {
          console.log('登录页面错误:', errors);
        }
      } catch (e) {
        console.log('未能导航到登录页面:', e.message);
      }
    } else {
      console.log('用户可能已登录');
      
      // 检查生成功能
      console.log('测试美甲设计生成功能');
      
      // 输入提示词
      const promptInput = page.getByPlaceholderText('美甲设计描述');
      if (await promptInput.isVisible()) {
        await promptInput.fill('漂亮的红色花纹美甲设计');
        console.log('成功输入提示词');
        
        // 检查生成按钮
        const generateButton = page.getByRole('button', { name: '生成' });
        const isButtonEnabled = await generateButton.isEnabled();
        console.log('生成按钮是否可用:', isButtonEnabled);
        
        if (isButtonEnabled) {
          console.log('点击生成按钮');
          
          // 监听网络请求
          page.on('request', request => {
            if (request.url().includes('/api/generate/nail-design')) {
              console.log('生成请求URL:', request.url());
              console.log('生成请求方法:', request.method());
              console.log('生成请求头:', JSON.stringify(request.headers(), null, 2));
            }
          });
          
          page.on('response', async response => {
            if (response.url().includes('/api/generate/nail-design')) {
              const status = response.status();
              console.log('生成响应状态:', status);
              
              try {
                const responseBody = await response.json();
                console.log('生成响应体:', JSON.stringify(responseBody, null, 2));
              } catch (e) {
                console.log('无法解析响应体:', e.message);
              }
            }
          });
          
          // 点击按钮
          await generateButton.click();
          console.log('已点击生成按钮');
          
          // 等待几秒钟以观察结果
          await page.waitForTimeout(5000);
          await page.screenshot({ path: 'temp/after-generate.png' });
          
          // 检查错误消息
          const errorElement = await page.locator('.text-destructive');
          if (await errorElement.isVisible()) {
            const errorText = await errorElement.textContent();
            console.log('生成过程出现错误:', errorText);
          }
        }
      } else {
        console.log('未找到提示词输入框');
      }
    }
    
    // 收集cookies和localStorage数据
    const cookies = await context.cookies();
    console.log('Cookies:', JSON.stringify(cookies, null, 2));
    
    const storage = await page.evaluate(() => {
      return {
        localStorage: Object.fromEntries(
          Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])
        )
      };
    });
    console.log('本地存储:', JSON.stringify(storage, null, 2));
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  } finally {
    console.log('测试完成，正在关闭浏览器...');
    await browser.close();
  }
})(); 