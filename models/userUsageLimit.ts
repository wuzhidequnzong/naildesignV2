import { getSupabaseClient } from "./db";

/**
 * 用户使用限制数据模型
 */
export interface UserUsageLimit {
  id?: number;
  user_uuid: string;
  daily_usage: number;
  daily_limit: number;
  last_used_at: string;
  reset_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 获取用户使用限制（检查是否需要重置）
 * @param user_uuid 用户ID
 * @returns 用户使用限制
 */
export async function getUserUsageLimit(user_uuid: string) {
  const supabase = getSupabaseClient();
  
  // 尝试获取用户使用记录
  let { data, error } = await supabase
    .from("user_usage_limits")
    .select("*")
    .eq("user_uuid", user_uuid)
    .single();
  
  // 如果记录不存在则创建新记录
  if (error && error.code === "PGRST116") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const newUsageLimit = {
      user_uuid,
      daily_usage: 0,
      daily_limit: 5,
      last_used_at: new Date().toISOString(),
      reset_at: tomorrow.toISOString()
    };
    
    const { data: newData, error: insertError } = await supabase
      .from("user_usage_limits")
      .insert(newUsageLimit)
      .select()
      .single();
    
    if (insertError) {
      console.error("创建用户使用限制失败:", insertError);
      throw insertError;
    }
    
    return newData;
  } else if (error) {
    console.error("获取用户使用限制失败:", error);
    throw error;
  }
  
  // 检查是否需要重置（过了凌晨）
  const now = new Date();
  const resetAt = data.reset_at ? new Date(data.reset_at) : null;
  
  if (resetAt && now >= resetAt) {
    // 重置使用次数
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const { data: updatedData, error: updateError } = await supabase
      .from("user_usage_limits")
      .update({
        daily_usage: 0,
        last_used_at: now.toISOString(),
        reset_at: tomorrow.toISOString(),
        updated_at: now.toISOString()
      })
      .eq("user_uuid", user_uuid)
      .select()
      .single();
    
    if (updateError) {
      console.error("重置用户使用限制失败:", updateError);
      throw updateError;
    }
    
    return updatedData;
  }
  
  return data;
}

/**
 * 检查用户是否可以继续生成
 * @param user_uuid 用户ID
 * @returns 是否可以生成
 */
export async function checkUserUsageLimit(user_uuid: string) {
  const usageLimit = await getUserUsageLimit(user_uuid);
  return usageLimit.daily_usage < usageLimit.daily_limit;
}

/**
 * 更新用户使用次数
 * @param user_uuid 用户ID
 * @returns 更新后的数据
 */
export async function updateUserUsage(user_uuid: string) {
  const supabase = getSupabaseClient();
  const usageLimit = await getUserUsageLimit(user_uuid);
  
  const { data, error } = await supabase
    .from("user_usage_limits")
    .update({
      daily_usage: usageLimit.daily_usage + 1,
      last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("user_uuid", user_uuid)
    .select()
    .single();
  
  if (error) {
    console.error("更新用户使用次数失败:", error);
    throw error;
  }
  
  return data;
} 