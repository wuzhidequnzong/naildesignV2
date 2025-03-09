import { getSupabaseClient } from "./db";

/**
 * 美甲设计数据模型
 */
export interface NailDesign {
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
 * 插入新的美甲设计记录
 * @param design 美甲设计数据
 * @returns 插入后的数据
 */
export async function insertNailDesign(design: NailDesign) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("nail_designs").insert(design).select().single();
  
  if (error) {
    console.error("保存美甲设计失败:", error);
    throw error;
  }
  
  return data;
}

/**
 * 获取美甲设计列表（分页）
 * @param page 页码
 * @param limit 每页数量
 * @returns 美甲设计列表
 */
export async function getNailDesigns(page = 1, limit = 12) {
  const supabase = getSupabaseClient();
  const offset = (page - 1) * limit;
  
  const { data, error } = await supabase
    .from("nail_designs")
    .select("*")
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error("获取美甲设计列表失败:", error);
    throw error;
  }
  
  return data;
}

/**
 * 获取用户的美甲设计列表
 * @param user_uuid 用户ID
 * @param page 页码
 * @param limit 每页数量
 * @returns 用户美甲设计列表
 */
export async function getUserNailDesigns(user_uuid: string, page = 1, limit = 12) {
  const supabase = getSupabaseClient();
  const offset = (page - 1) * limit;
  
  const { data, error } = await supabase
    .from("nail_designs")
    .select("*")
    .eq("user_uuid", user_uuid)
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error("获取用户美甲设计列表失败:", error);
    throw error;
  }
  
  return data;
} 