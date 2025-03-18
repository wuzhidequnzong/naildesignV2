'use client';

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { AlertCircle, LogIn, Info } from "lucide-react";
import { useLocale, useTranslations } from 'next-intl';

/**
 * 美甲设计生成器组件
 * 使用next-intl的标准翻译方式
 */
export default function NailDesignGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(5);
  const [errorMessage, setErrorMessage] = useState("");
  const { data: session, status } = useSession();
  
  const locale = useLocale();
  const t = useTranslations('NailDesign');
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    if (errorMessage && errorMessage.includes(t('errorLength', { defaultValue: 'Prompt length must be between 5-200 characters' }).substring(0, 10))) {
      setErrorMessage("");
    }
  };
  
  const handleLogin = () => {
    signIn(undefined, { callbackUrl: window.location.href });
  };
  
  const handleGenerate = async () => {
    setErrorMessage("");
    
    if (status !== "authenticated") {
      setErrorMessage(t('errorLogin', { defaultValue: 'Please login to generate nail designs' }));
      console.error("Generation failed: User not logged in");
      return;
    }
    
    if (prompt.length < 5 || prompt.length > 200) {
      setErrorMessage(t('errorLength', { defaultValue: 'Prompt length must be between 5-200 characters' }));
      console.error(`Generation failed: Prompt length invalid (current: ${prompt.length})`);
      return;
    }
    
    if (usageLimit <= 0) {
      setErrorMessage(t('errorLimit', { defaultValue: 'Insufficient credits. Please recharge.' }));
      console.error(`Generation failed: User has no credits (available: ${usageLimit})`);
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
      
      // 生成成功，减少显示的可用积分
      setUsageLimit(prev => prev - 1);
      
      alert(t('successAlert', { defaultValue: 'Nail design generated successfully. The page will refresh.' }));
      
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error("Generation failure details:", error);
      setErrorMessage(error.message || t('genericError', { defaultValue: 'Generation failed, please try again later' }));
    } finally {
      setIsGenerating(false);
    }
  };
  
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (status === "authenticated") {
        try {
          // 使用新的积分API替代原有的使用次数限制API
          const response = await fetch("/api/user/credits");
          if (response.ok) {
            const data = await response.json();
            setUsageCount(0); // 不再使用已用次数的概念
            setUsageLimit(data.limit || 0); // 设置可用积分
          }
        } catch (error) {
          console.error("Failed to fetch user credits:", error);
        }
      }
    };
    
    fetchUserCredits();
  }, [status]);
  
  const isValidLength = prompt.length >= 5 && prompt.length <= 200;
  const canGenerate = status === "authenticated" && isValidLength && !isGenerating && usageLimit > 0;
  
  const charCountClass = `text-xs ${
    !prompt ? "text-muted-foreground" : 
    prompt.length < 5 ? "text-yellow-600" : 
    prompt.length > 200 ? "text-red-500" : 
    "text-green-600"
  }`;
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder={t('placeholder', { defaultValue: 'Nail design description' })}
              value={prompt}
              onChange={handlePromptChange}
              className={`w-full px-4 py-2 border rounded-md ${
                errorMessage ? "border-red-500" : "border-input"
              }`}
              disabled={isGenerating}
            />
            <div className="absolute right-2 bottom-2">
              <span className={charCountClass}>
                {!prompt 
                  ? t('tipInput', { defaultValue: 'Enter 5-200 characters to describe your desired nail design' })
                  : prompt.length < 5 
                    ? t('tipNeedMore', { defaultValue: `Need ${5 - prompt.length} more characters`, 0: 5 - prompt.length })
                    : prompt.length > 200 
                      ? t('tipExceeded', { defaultValue: `Exceeded by ${prompt.length - 200} characters`, 0: prompt.length - 200 })
                      : t('tipValid', { defaultValue: 'Character count is valid' })}
              </span>
            </div>
          </div>
          {status === "authenticated" && (
            <span className="text-muted-foreground">
              {t('remaining', { defaultValue: `Credits: ${usageLimit}`, 0: usageLimit, 1: usageLimit })}
              <span className="text-xs ml-1 text-muted-foreground">
                {t('tipCredit', { defaultValue: "1 credit = 1 generation" })}
              </span>
            </span>
          )}
        </div>
        
        {errorMessage && (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}
        
        {errorMessage && errorMessage.includes(t('errorLimit', { defaultValue: 'Insufficient credits' }).substring(0, 10)) && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-center">
            <p className="text-sm text-amber-800 mb-2">
              {t('rechargeMessage', { defaultValue: "Please recharge to continue generating nail designs." })}
            </p>
            <Link 
              href="/#pricing" 
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-block"
            >
              {t('rechargeButton', { defaultValue: "Recharge Now" })}
            </Link>
          </div>
        )}
        
        <div className="flex justify-center">
          {status === "authenticated" ? (
            <button
              className={`px-4 py-2 rounded-md ${
                canGenerate
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              onClick={handleGenerate}
              disabled={!canGenerate}
              title={
                !isValidLength ? t('errorLength', { defaultValue: 'Prompt length must be between 5-200 characters' }) :
                usageLimit <= 0 ? t('errorLimit', { defaultValue: 'Insufficient credits. Please recharge.' }) :
                isGenerating ? t('generating', { defaultValue: 'Generating...' }) : t('generate', { defaultValue: 'Generate' })
              }
            >
              {isGenerating ? t('generating', { defaultValue: 'Generating...' }) : t('generate', { defaultValue: 'Generate' })}
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={handleLogin}
            >
              <LogIn className="w-4 h-4" />
              <span>{t('login', { defaultValue: 'Login' })}</span>
            </button>
          )}
        </div>
      </div>
      
      {status !== "authenticated" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600" />
            <span>{t('loginTip', { defaultValue: 'Login to create your custom nail designs, each user can generate multiple times daily for free' })}</span>
          </div>
        </div>
      )}
    </div>
  );
} 