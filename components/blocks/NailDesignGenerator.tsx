'use client';

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { AlertCircle, LogIn, Info } from "lucide-react";

/**
 * 美甲设计生成器组件
 */
export default function NailDesignGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(5);
  const [errorMessage, setErrorMessage] = useState("");
  const { data: session, status } = useSession();
  
  // 处理提示词输入
  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    // 清除错误消息（如果是字数相关的错误）
    if (errorMessage && errorMessage.includes("字符之间")) {
      setErrorMessage("");
    }
  };
  
  // 处理登录请求
  const handleLogin = () => {
    signIn(undefined, { callbackUrl: window.location.href });
  };
  
  // 生成美甲设计
  const handleGenerate = async () => {
    // 重置错误消息
    setErrorMessage("");
    
    if (status !== "authenticated") {
      setErrorMessage("请先登录账号才能生成美甲设计");
      console.error("生成失败: 用户未登录");
      return;
    }
    
    if (prompt.length < 5 || prompt.length > 200) {
      setErrorMessage("提示词长度必须在5-200字符之间");
      console.error(`生成失败: 提示词长度不符合要求 (当前长度: ${prompt.length})`);
      return;
    }
    
    if (usageCount >= usageLimit) {
      setErrorMessage(`每位用户每天最多生成${usageLimit}次，请明天再来`);
      console.error(`生成失败: 用户超出使用限制 (已使用: ${usageCount}, 限制: ${usageLimit})`);
      return;
    }
    
    setIsGenerating(true);
    console.log(`开始生成美甲设计，提示词: "${prompt}"`);
    
    try {
      console.log("发送API请求: /api/generate/nail-design");
      const response = await fetch("/api/generate/nail-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      
      console.log(`API响应状态: ${response.status}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "生成失败");
      }
      
      console.log("生成成功，图片URL:", data.image_url);
      
      // 更新使用次数
      setUsageCount(prev => prev + 1);
      
      alert("美甲设计已生成成功，页面将自动刷新");
      
      // 延迟刷新页面
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error("生成失败详细信息:", error);
      setErrorMessage(error.message || "生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 获取用户使用限制
  const fetchUsageLimit = async () => {
    if (status !== "authenticated") return;
    
    try {
      console.log("获取用户使用限制");
      const response = await fetch("/api/user/usage-limits");
      const data = await response.json();
      
      if (response.ok && data.usageLimit) {
        console.log(`用户使用情况: ${data.usageLimit.daily_usage || 0}/${data.usageLimit.daily_limit || 5}`);
        setUsageCount(data.usageLimit.daily_usage || 0);
        setUsageLimit(data.usageLimit.daily_limit || 5);
      }
    } catch (error) {
      console.error("获取使用限制失败详细信息:", error);
    }
  };
  
  // 监听用户会话状态变化
  useEffect(() => {
    if (status === "authenticated") {
      fetchUsageLimit();
    }
  }, [status]);
  
  // 字数是否在有效范围内
  const isValidLength = prompt.length >= 5 && prompt.length <= 200;
  // 字数状态类名
  const charCountClass = !prompt ? "text-muted-foreground" : 
                         isValidLength ? "text-green-600" : 
                         "text-destructive font-medium";
  // 是否可以生成
  const canGenerate = status === "authenticated" && isValidLength && usageCount < usageLimit && !isGenerating;
  
  return (
    <div className="w-full flex flex-col space-y-2">
      {/* 输入框和按钮区域 */}
      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="flex-1 w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="美甲设计描述"
              value={prompt}
              onChange={handlePromptChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {prompt.length > 0 && (
              <div className="absolute right-3 top-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isValidLength ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {prompt.length}/200
                </span>
              </div>
            )}
          </div>
          {/* 字数统计和提示 */}
          <div className="mt-1 text-xs flex justify-between">
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span className={charCountClass}>
                {!prompt 
                  ? "输入5-200个字符描述你想要的美甲设计" 
                  : prompt.length < 5 
                    ? `还需要输入${5 - prompt.length}个字符` 
                    : prompt.length > 200 
                      ? `超出${prompt.length - 200}个字符` 
                      : "字数符合要求"}
              </span>
            </div>
            {status === "authenticated" && (
              <span className="text-muted-foreground">
                今日剩余: {usageLimit - usageCount}/{usageLimit} 次
              </span>
            )}
          </div>
        </div>
        
        {status === "authenticated" ? (
          <button 
            onClick={handleGenerate} 
            className={`whitespace-nowrap px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-all ${
              isGenerating ? "opacity-80" : "hover:opacity-95"
            } ${!canGenerate ? "cursor-not-allowed opacity-50" : ""}`}
            disabled={!canGenerate}
            title={
              !isValidLength ? "提示词长度必须在5-200字符之间" :
              usageCount >= usageLimit ? `每位用户每天最多生成${usageLimit}次` :
              isGenerating ? "正在生成中..." : "生成美甲设计"
            }
          >
            {isGenerating ? "生成中..." : "生成"}
          </button>
        ) : (
          <button 
            onClick={handleLogin}
            className="whitespace-nowrap px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-all flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>登录</span>
          </button>
        )}
      </div>
      
      {/* 错误信息显示区域 */}
      {errorMessage && (
        <div className="flex items-start gap-2 text-sm text-destructive p-2 bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {/* 未登录用户提示 */}
      {status !== "authenticated" && !errorMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600" />
            <span>登录后即可创建专属美甲设计，每位用户每天可免费生成多次</span>
          </div>
        </div>
      )}
    </div>
  );
} 