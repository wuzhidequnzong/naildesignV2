'use client';

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { AlertCircle, LogIn, Info } from "lucide-react";
import { useLocale } from 'next-intl';

/**
 * 美甲设计生成器组件
 * 接收translations作为props，与Hero等其他Landing Page组件保持一致的国际化方案
 */
export default function NailDesignGenerator({ translations = {} }: { translations?: Record<string, any> }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(5);
  const [errorMessage, setErrorMessage] = useState("");
  const { data: session, status } = useSession();
  
  const locale = useLocale();
  
  // 简化的翻译获取函数，直接从props获取
  const safeT = (key: string, defaultText: string, params?: any) => {
    if (!translations || !translations[key]) {
      return defaultText;
    }
    
    try {
      let result = translations[key];
      
      // 处理参数替换
      if (params) {
        if (typeof params === 'object') {
          Object.entries(params).forEach(([paramKey, paramValue]) => {
            result = result.replace(`{${paramKey}}`, paramValue);
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Error processing translation key "${key}", using default text`, error);
      return defaultText;
    }
  };
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    if (errorMessage && errorMessage.includes(safeT('errorLength', 'Prompt length must be between 5-200 characters').substring(0, 10))) {
      setErrorMessage("");
    }
  };
  
  const handleLogin = () => {
    signIn(undefined, { callbackUrl: window.location.href });
  };
  
  const handleGenerate = async () => {
    setErrorMessage("");
    
    if (status !== "authenticated") {
      setErrorMessage(safeT('errorLogin', 'Please login to generate nail designs'));
      console.error("Generation failed: User not logged in");
      return;
    }
    
    if (prompt.length < 5 || prompt.length > 200) {
      setErrorMessage(safeT('errorLength', 'Prompt length must be between 5-200 characters'));
      console.error(`Generation failed: Prompt length invalid (current: ${prompt.length})`);
      return;
    }
    
    if (usageCount >= usageLimit) {
      setErrorMessage(safeT('errorLimit', `Each user can generate up to ${usageLimit} times per day`, { limit: usageLimit }));
      console.error(`Generation failed: User exceeded usage limit (used: ${usageCount}, limit: ${usageLimit})`);
      return;
    }
    
    setIsGenerating(true);
    console.log(`Starting nail design generation, prompt: "${prompt}"`);
    
    try {
      console.log("Sending API request: /api/generate/nail-design");
      const response = await fetch("/api/generate/nail-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      
      console.log(`API response status: ${response.status}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }
      
      console.log("Generation successful, image URL:", data.image_url);
      
      setUsageCount(prev => prev + 1);
      
      alert(safeT('successAlert', 'Nail design generated successfully. The page will refresh.'));
      
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error("Generation failure details:", error);
      setErrorMessage(error.message || safeT('genericError', 'Generation failed, please try again later'));
    } finally {
      setIsGenerating(false);
    }
  };
  
  const fetchUsageLimit = async () => {
    if (status !== "authenticated") return;
    
    try {
      console.log("Fetching user usage limits");
      const response = await fetch("/api/user/usage-limits");
      const data = await response.json();
      
      if (response.ok && data.usageLimit) {
        console.log(`User usage: ${data.usageLimit.daily_usage || 0}/${data.usageLimit.daily_limit || 5}`);
        setUsageCount(data.usageLimit.daily_usage || 0);
        setUsageLimit(data.usageLimit.daily_limit || 5);
      }
    } catch (error) {
      console.error("Failed to fetch usage limits details:", error);
    }
  };
  
  useEffect(() => {
    if (status === "authenticated") {
      fetchUsageLimit();
    }
  }, [status]);
  
  const isValidLength = prompt.length >= 5 && prompt.length <= 200;
  const charCountClass = !prompt ? "text-muted-foreground" : 
                         isValidLength ? "text-green-600" : 
                         "text-destructive font-medium";
  const canGenerate = status === "authenticated" && isValidLength && usageCount < usageLimit && !isGenerating;
  
  return (
    <div className="w-full flex flex-col space-y-2">
      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="flex-1 w-full">
          <div className="relative">
            <input
              type="text"
              placeholder={safeT('placeholder', 'Nail design description')}
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
          <div className="mt-1 text-xs flex justify-between">
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span className={charCountClass}>
                {!prompt 
                  ? safeT('tipInput', 'Enter 5-200 characters to describe your desired nail design')
                  : prompt.length < 5 
                    ? safeT('tipNeedMore', `Need ${5 - prompt.length} more characters`, { 0: 5 - prompt.length })
                    : prompt.length > 200 
                      ? safeT('tipExceeded', `Exceeded by ${prompt.length - 200} characters`, { 0: prompt.length - 200 })
                      : safeT('tipValid', 'Character count is valid')}
              </span>
            </div>
            {status === "authenticated" && (
              <span className="text-muted-foreground">
                {safeT('remaining', `Today's remaining: ${usageLimit - usageCount}/${usageLimit} times`, { 
                  0: usageLimit - usageCount, 
                  1: usageLimit 
                })}
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
              !isValidLength ? safeT('errorLength', 'Prompt length must be between 5-200 characters') :
              usageCount >= usageLimit ? safeT('errorLimit', `Each user can generate up to ${usageLimit} times per day`, { limit: usageLimit }) :
              isGenerating ? safeT('generating', 'Generating...') : safeT('generate', 'Generate')
            }
          >
            {isGenerating ? safeT('generating', 'Generating...') : safeT('generate', 'Generate')}
          </button>
        ) : (
          <button 
            onClick={handleLogin}
            className="whitespace-nowrap px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-all flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{safeT('login', 'Login')}</span>
          </button>
        )}
      </div>
      
      {errorMessage && (
        <div className="flex items-start gap-2 text-sm text-destructive p-2 bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {status !== "authenticated" && !errorMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600" />
            <span>{safeT('loginTip', 'Login to create your custom nail designs, each user can generate multiple times daily for free')}</span>
          </div>
        </div>
      )}
    </div>
  );
} 