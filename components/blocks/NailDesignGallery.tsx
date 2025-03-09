'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, User, RefreshCw, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

// 美甲设计类型定义
interface NailDesign {
  id?: number;
  uuid: string;
  user_uuid: string;
  prompt: string;
  full_prompt?: string;
  image_url: string;
  width?: number;
  height?: number;
  created_at?: string;
  status?: string;
}

/**
 * 美甲设计展示组件
 * @param userOnly 是否只显示当前用户的设计
 */
export default function NailDesignGallery({ userOnly = false }: { userOnly?: boolean }) {
  const [designs, setDesigns] = useState<NailDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 获取美甲设计列表
  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`获取${userOnly ? '用户' : '所有'}美甲设计列表...`);
      const url = userOnly 
        ? "/api/nail-designs?user_only=true&limit=12" 
        : "/api/nail-designs?limit=12";
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok && data.designs) {
        console.log(`成功获取${data.designs.length}个美甲设计`);
        
        // 确保按创建时间降序排序
        const sortedDesigns = data.designs.sort((a: NailDesign, b: NailDesign) => {
          // 如果两个对象都有created_at属性
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return 0;
        });
        
        setDesigns(sortedDesigns);
      } else {
        console.error('获取美甲设计列表API错误:', data.error || '未知错误');
        setError(data.error || '获取设计列表失败');
      }
    } catch (error) {
      console.error("获取设计列表失败:", error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // 重新加载设计列表
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDesigns();
  };
  
  useEffect(() => {
    fetchDesigns();
  }, [userOnly]);
  
  // 下载图片
  const handleDownload = (imageUrl: string, prompt: string) => {
    try {
      console.log(`下载图片: ${imageUrl}`);
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `美甲设计_${prompt.substring(0, 10)}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载图片失败:', error);
      alert('下载失败，请稍后重试');
    }
  };
  
  // 打开原图
  const handleOpenOriginal = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };
  
  // 加载状态
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="w-full aspect-[1.75]" />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between items-center w-full">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  // 错误状态
  if (error) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          重新加载
        </Button>
      </div>
    );
  }
  
  // 空状态
  if (designs.length === 0) {
    return (
      <div className="w-full py-12 text-center bg-muted/20 rounded-lg border border-dashed">
        <p className="text-lg text-muted-foreground mb-2">
          {userOnly ? "你还没有创建过美甲设计" : "暂无美甲设计作品，快来创作第一个吧！"}
        </p>
        <p className="text-sm text-muted-foreground">
          {userOnly ? "点击上方的生成按钮创建你的第一个设计" : "登录后即可创建你的专属美甲设计"}
        </p>
      </div>
    );
  }
  
  // 设计展示
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.map((design) => (
          <Card key={design.uuid} className="overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0">
              <div className="relative aspect-[1.75] w-full overflow-hidden">
                <Image
                  src={design.image_url}
                  alt={design.prompt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-all group-hover:scale-105"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 p-4">
              <p className="text-sm line-clamp-2">{design.prompt}</p>
              <div className="flex justify-between items-center w-full pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {design.width}×{design.height}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {design.created_at && formatDistanceToNow(new Date(design.created_at), { 
                      addSuffix: true, 
                      locale: zhCN 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    title="查看原图"
                    onClick={() => handleOpenOriginal(design.image_url)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    title="下载图片"
                    onClick={() => handleDownload(design.image_url, design.prompt)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* 刷新按钮 */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? '加载中...' : '加载更多'}
        </Button>
      </div>
    </div>
  );
} 