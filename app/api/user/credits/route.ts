import { getUserCredits } from "@/services/credit";
import { auth } from "@/auth";

/**
 * 获取用户积分API
 */
export async function GET(req: Request) {
  try {
    // 获取用户信息
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "未授权访问" }, { status: 401 });
    }
    
    const user_uuid = session.user.id;
    const userCredits = await getUserCredits(user_uuid);
    
    // 返回结构与用户使用限制API一致，保持前端兼容性
    return Response.json({ 
      success: true,
      used: 0, // 积分系统中不存在"已使用"的概念
      limit: userCredits.left_credits || 0, // 可用积分
      is_pro: userCredits.is_pro || false,
      is_recharged: userCredits.is_recharged || false
    });
  } catch (error) {
    console.error("获取用户积分失败:", error);
    return Response.json({ error: "获取用户积分失败" }, { status: 500 });
  }
} 