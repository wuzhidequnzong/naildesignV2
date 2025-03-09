import { experimental_generateImage as generateImage } from "ai";
import { replicate } from "@ai-sdk/replicate";
import { auth } from "@/auth";
import { newStorage } from "@/lib/storage";
import { checkUserUsageLimit, updateUserUsage } from "@/models/userUsageLimit";
import { insertNailDesign } from "@/models/nailDesign";
import { createNailDesignPrompt, validatePromptLength } from "@/lib/prompt-template";
import { randomUUID } from "crypto";

/**
 * 美甲设计生成API
 */
export async function POST(req: Request) {
  console.log('------- 开始美甲设计生成请求 -------');
  
  try {
    // 获取当前用户会话
    console.log('正在验证用户会话...');
    const session = await auth();
    if (!session?.user) {
      console.error('API调用失败: 用户未登录');
      return Response.json({ error: "请先登录" }, { status: 401 });
    }
    console.log(`用户已验证，用户ID: ${session.user.id}`);
    
    // 解析请求
    const { prompt } = await req.json();
    // 添加字段备用处理，确保能同时处理id和uuid字段
    const user_uuid = session.user.id || session.user.uuid;
    console.log(`收到生成请求，提示词: "${prompt}", 用户ID: ${user_uuid}`);
    
    if (!user_uuid) {
      console.error('API调用失败: 用户ID无效');
      return Response.json({ error: "用户身份验证失败，请重新登录" }, { status: 401 });
    }
    
    // 验证提示词
    if (!validatePromptLength(prompt)) {
      console.error(`API调用失败: 提示词长度不符合要求 (长度: ${prompt.length})`);
      return Response.json({ error: "提示词长度必须在5-200字符之间" }, { status: 400 });
    }
    console.log('提示词验证通过');
    
    // 检查用户使用限制
    console.log(`检查用户(${user_uuid})使用限制...`);
    const canGenerate = await checkUserUsageLimit(user_uuid);
    if (!canGenerate) {
      console.error(`API调用失败: 用户(${user_uuid})已达到今日生成次数限制`);
      return Response.json({ error: "今日生成次数已用完" }, { status: 403 });
    }
    console.log('用户使用限制检查通过');
    
    // 组合完整提示词
    const fullPrompt = createNailDesignPrompt(prompt);
    console.log(`完整提示词已创建 (长度: ${fullPrompt.length})`);
    
    // 调用Replicate API生成图片
    console.log('准备调用Replicate API生成图片...');
    const model = "black-forest-labs/flux-dev";
    const imageModel = replicate.image(model);
    const providerOptions = {
      replicate: {
        guidance: 7.5,
      },
    };
    
    console.log(`开始生成图片，模型: ${model}, 提示词长度: ${fullPrompt.length}`);
    const { images, warnings } = await generateImage({
      model: imageModel,
      prompt: fullPrompt,
      n: 1,
      providerOptions,
    });
    console.log('图片生成成功');
    
    if (warnings.length > 0) {
      console.warn("生成警告:", warnings);
    }
    
    // 保存图片到R2存储
    console.log('准备保存图片到存储...');
    const storage = newStorage();
    const filename = `nail_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.png`;
    const key = `nails/${filename}`;
    const body = Buffer.from(images[0].base64, "base64");
    
    console.log(`开始上传图片，文件名: ${filename}, 路径: ${key}`);
    await storage.uploadFile({
      body,
      key,
      contentType: "image/png",
      disposition: "inline",
    });
    console.log('图片上传成功');
    
    const imageUrl = `${process.env.STORAGE_DOMAIN}/${key}`;
    console.log(`图片URL生成: ${imageUrl}`);
    
    // 记录到数据库
    console.log('准备保存设计到数据库...');
    const design = await insertNailDesign({
      uuid: randomUUID(),
      user_uuid,
      prompt,
      full_prompt: fullPrompt,
      image_url: imageUrl,
      width: 1792,
      height: 1024,
      status: "success"
    });
    console.log(`设计已保存到数据库，ID: ${design.id}`);
    
    // 更新用户使用次数
    console.log(`更新用户(${user_uuid})使用次数...`);
    await updateUserUsage(user_uuid);
    console.log('用户使用次数已更新');
    
    // 返回结果
    console.log('------- 美甲设计生成请求完成 -------');
    return Response.json({ 
      success: true, 
      image_url: imageUrl,
      design
    });
  } catch (error: any) {
    console.error("生成失败详细信息:", error);
    console.error("错误堆栈:", error.stack);
    console.error('------- 美甲设计生成请求失败 -------');
    return Response.json({ error: "生成失败，请稍后重试" }, { status: 500 });
  }
} 