'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from 'next-intl';

interface NailDesignIntroProps {
  title: string;
  description: string;
}

/**
 * 美甲设计介绍组件
 * 在首页展示美甲设计生成器的介绍和链接
 */
export default function NailDesignIntro({ title, description }: NailDesignIntroProps) {
  const t = useTranslations('NailDesign');
  
  return (
    <div className="container">
      <div className="max-w-5xl mx-auto text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
        <p className="text-xl text-muted-foreground">{description}</p>
        
        <div className="mt-8 relative overflow-hidden rounded-lg border bg-background p-2">
          <div className="flex flex-wrap gap-4 p-4 md:p-8">
            <div className="flex-1 space-y-4">
              <div className="grid gap-2">
                <h3 className="text-xl font-semibold">AI{t('hero.title').split('AI')[1]}</h3>
                <p className="text-sm text-muted-foreground">{t('meta.description')}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted p-4 relative overflow-hidden">
                  <div className="h-20 w-full rounded-md bg-gradient-to-br from-pink-300 to-purple-400 absolute inset-0 opacity-60"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                    {t.rich('howto.step1.title', {
                      type: () => <span>渐变系列</span>
                    })}
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4 relative overflow-hidden">
                  <div className="h-20 w-full rounded-md bg-gradient-to-br from-blue-300 to-indigo-400 absolute inset-0 opacity-60"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                    {t.rich('howto.step2.title', {
                      type: () => <span>花纹系列</span>
                    })}
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4 relative overflow-hidden">
                  <div className="h-20 w-full rounded-md bg-gradient-to-br from-amber-300 to-orange-400 absolute inset-0 opacity-60"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                    {t.rich('howto.step3.title', {
                      type: () => <span>主题系列</span>
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="grid gap-2">
                <h4 className="text-sm font-medium">每日免费生成</h4>
                <p className="text-xs text-muted-foreground">每位用户每天免费生成5次</p>
              </div>
              <Button asChild>
                <Link href="/nail-design" className="flex items-center">
                  立即体验 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 