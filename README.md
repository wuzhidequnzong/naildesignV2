# ShipAny Template One - 美甲设计生成器 v1.1.0

基于ShipAny模板开发的AI美甲设计生成器，使用AI技术生成专业美甲设计图片。

![preview](preview.png)

## 版本更新历史

### v1.1.0 (2025-03-09)
- 🛠️ 修复用户登录时的水合错误问题
- 🔑 修复用户身份验证过程中ID字段不一致问题
- 🚀 优化美甲设计生成器的错误处理和用户体验
- 📝 增加字符计数器，提供更直观的输入反馈
- 🔧 修复Cloudflare R2存储凭证格式问题

### v1.0.0 (2024-05-01)
- 🎉 初始版本发布

## 当前需求进度

- ✅ **用户认证**：完成GitHub登录功能，修复会话与身份验证相关问题
- ✅ **美甲设计生成**：完成基本生成功能，修复API调用过程中的错误
- ✅ **存储服务**：成功集成Cloudflare R2存储服务，修复凭证格式问题
- ✅ **用户体验优化**：添加字符计数器和错误提示，提升用户输入体验
- ⏳ **美甲设计展示**：待完成首页美甲设计展示和排序功能
- ⏳ **主题适配**：待完成按钮和UI元素的主题色适配
- ⏳ **权限管理**：待完成设计查看权限的优化，允许非登录用户查看设计列表

## 功能亮点

- 🎨 **AI美甲设计生成**：利用最先进的AI模型生成专业的美甲设计图片
- 🖼️ **标准化展示**：所有生成的美甲设计都按照10个指甲（两行各5个）的标准格式展示
- 🔄 **每日生成限制**：每位用户每天可免费生成5次
- 📱 **响应式界面**：完美适配各种设备屏幕
- 🌐 **多语言支持**：支持中文和英文界面
- 👤 **用户管理**：包含用户登录和个人设计管理功能

## 项目结构

- **数据库模型**
  - `nail_designs`：存储生成的美甲设计图片信息
  - `user_usage_limits`：管理用户的每日使用限制

- **核心模块**
  - 提示词处理：`lib/prompt-template.ts`
  - 数据操作：`models/nailDesign.ts` 和 `models/userUsageLimit.ts`
  - API端点：`app/api/generate/nail-design`、`app/api/nail-designs`、`app/api/user/usage-limits`

- **UI组件**
  - 生成器：`components/blocks/NailDesignGenerator.tsx`
  - 展示画廊：`components/blocks/NailDesignGallery.tsx`
  - 首页介绍：`components/blocks/NailDesignIntro.tsx`

- **页面**
  - 主页：`app/[locale]/(default)/page.tsx`
  - 美甲设计页：`app/[locale]/(default)/nail-design/page.tsx`
  - 我的设计：`app/[locale]/(default)/(console)/my-designs/page.tsx`

## 快速开始

1. 克隆仓库

```bash
git clone https://github.com/shipanyai/shipany-template-one.git
```

2. 安装依赖

```bash
pnpm install
```

3. 配置环境变量

```bash
cp .env.example .env.local
```

4. 在Supabase中创建数据表

执行`data/nail_design_tables.sql`中的SQL语句

5. 运行开发服务器

```bash
pnpm dev
```

## 使用说明

1. 访问首页，点击"美甲设计"导航项
2. 在设计页面中输入您想要的美甲设计描述（5-200字符）
3. 点击"生成设计"按钮
4. 等待几秒钟，AI将生成您的美甲设计
5. 生成的设计会显示在页面底部，您可以下载或查看详情

## 部署

- 部署到Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshipanyai%2Fshipany-template-one&project-name=my-shipany-project&repository-name=my-shipany-project&redirect-url=https%3A%2F%2Fshipany.ai&demo-title=ShipAny&demo-description=Ship%20Any%20AI%20Startup%20in%20hours%2C%20not%20days&demo-url=https%3A%2F%2Fshipany.ai&demo-image=https%3A%2F%2Fpbs.twimg.com%2Fmedia%2FGgGSW3La8AAGJgU%3Fformat%3Djpg%26name%3Dlarge)

- 部署到Cloudflare

1. 自定义您的环境变量

```bash
cp .env.example .env.production
cp wrangler.toml.example wrangler.toml
```

编辑`.env.production`中的环境变量，并将所有环境变量放入`wrangler.toml`的`[vars]`部分

2. 部署

```bash
npm run cf:deploy
```

## 技术栈

- **前端**：Next.js、React、Tailwind CSS、Shadcn UI
- **后端**：Next.js API Routes、Supabase
- **AI**：Replicate API、black-forest-labs/flux-dev模型
- **存储**：Cloudflare R2
- **认证**：NextAuth.js

## 社区

- [ShipAny](https://shipany.ai)
- [文档](https://docs.shipany.ai)
- [Discord](https://discord.gg/HQNnrzjZQS)

## 协议

- [ShipAny AI SaaS Boilerplate License Agreement](LICENSE)


