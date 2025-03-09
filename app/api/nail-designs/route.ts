import { getNailDesigns, getUserNailDesigns } from "@/models/nailDesign";
import { auth } from "@/auth";

/**
 * 获取美甲设计列表API
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const userOnly = url.searchParams.get("user_only") === "true";
    
    // 获取用户信息（如果是用户自己的设计）
    let designs;
    if (userOnly) {
      const session = await auth();
      if (!session?.user?.id) {
        // 当用户未登录但请求个人设计时，返回空数组而不是错误
        console.log("用户未登录但请求个人设计，返回空数组");
        return Response.json({ 
          success: true,
          designs: [],
          pagination: {
            page,
            limit,
            total: 0
          }
        });
      }
      
      console.log(`获取用户(${session.user.id})的美甲设计列表，页码:${page}, 每页数量:${limit}`);
      designs = await getUserNailDesigns(session.user.id, page, limit);
    } else {
      console.log(`获取所有美甲设计列表，页码:${page}, 每页数量:${limit}`);
      designs = await getNailDesigns(page, limit);
    }
    
    console.log(`成功检索到${designs.length}个美甲设计`);
    
    return Response.json({ 
      success: true,
      designs,
      pagination: {
        page,
        limit,
        total: designs.length
      }
    });
  } catch (error) {
    console.error("获取美甲设计列表失败:", error);
    return Response.json({ error: "获取美甲设计列表失败" }, { status: 500 });
  }
} 