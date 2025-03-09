# 美甲设计生成器诊断测试

本目录包含专门用于诊断美甲设计生成器问题的测试脚本，不会影响主分支代码。

## 主要问题

1. 登录页面存在水合错误（Hydration Error）
2. 生成图片API报错，用户ID为undefined，导致数据库约束错误

## 诊断测试文件

### E2E测试

- `e2e/auth-debug.test.ts`: 端到端测试，用于捕获和分析认证流程中的问题，包括：
  - 会话状态跟踪
  - 登录页面错误捕获
  - 生成按钮功能测试

### API测试

- `api/auth-api-inspector.test.ts`: 专注于测试身份验证API问题，包括：
  - 检查auth函数返回的会话结构
  - 模拟API调用时的会话访问
  - 验证用户ID的可用性

## 如何运行诊断测试

### 端到端测试（Playwright）

```bash
# 只运行诊断测试
npx playwright test __tests__/e2e/auth-debug.test.ts --headed

# 以UI模式运行，便于调试
npx playwright test __tests__/e2e/auth-debug.test.ts --ui
```

### API诊断测试（Jest）

```bash
# 运行API诊断测试
npx jest __tests__/api/auth-api-inspector.test.ts --verbose
```

## 诊断数据

运行测试后，以下诊断数据将被收集：

1. 控制台日志输出 - 包含API请求和响应的详细信息
2. 截图 - 首页、登录页和生成过程的截图
3. 诊断数据JSON文件 - 包含所有收集到的会话数据、请求信息和错误消息

## 不修改代码的验证方法

这些测试专门设计为不修改主代码的诊断工具，可以安全地运行而不影响应用程序的功能。测试将：

1. 捕获API请求和响应
2. 检查会话对象结构
3. 监控认证流程
4. 测试生成功能
5. 收集详细的错误信息 