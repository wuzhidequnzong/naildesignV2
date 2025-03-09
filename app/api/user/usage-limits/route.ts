import { getUserUsageLimit } from "@/models/userUsageLimit";
import { auth } from "@/auth";

/**
 * 获取用户使用限制API
 */
export async function GET(req: Request) {
  try {
    // 获取用户信息
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "未授权访问" }, { status: 401 });
    }
    
    const user_uuid = session.user.id;
    const usageLimit = await getUserUsageLimit(user_uuid);
    
    return Response.json({ 
      success: true,
      usageLimit: {
        daily_usage: usageLimit.daily_usage,
        daily_limit: usageLimit.daily_limit,
        remaining: usageLimit.daily_limit - usageLimit.daily_usage,
        reset_at: usageLimit.reset_at
      }
    });
  } catch (error) {
    console.error("获取用户使用限制失败:", error);
    return Response.json({ error: "获取用户使用限制失败" }, { status: 500 });
  }
} 