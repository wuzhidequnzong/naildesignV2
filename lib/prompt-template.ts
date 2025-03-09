/**
 * 美甲设计提示词处理模块
 * 将用户输入的提示词与预设模板结合，生成完整的提示词
 */

/**
 * 创建美甲设计提示词
 * @param userPrompt 用户输入的提示词
 * @returns 完整的美甲设计提示词
 */
export function createNailDesignPrompt(userPrompt: string): string {
  return `Generate a professional nail art display showing EXACTLY 10 nail tips arranged in TWO ROWS with EXACTLY 5 TIPS PER ROW.

CRITICAL LAYOUT REQUIREMENTS:
- TOP ROW: EXACTLY 5 nail tips representing one complete hand
- BOTTOM ROW: EXACTLY 5 nail tips representing the other hand
- TOTAL COUNT: EXACTLY 10 nail tips in the entire image
- Arrange in a clean grid pattern with clear separation between rows
- Each row must be visually distinct and aligned horizontally
- Maintain appropriate width proportions (wider thumb, narrower pinky)

TECHNICAL SPECIFICATIONS:
- Professional studio-quality lighting
- High-resolution detail of nail art
- Clear visibility of all design elements
- Realistic glossy finish

FINAL VERIFICATION: COUNT AGAIN to ensure exactly 5 tips in top row and 5 tips in bottom row.

USER DESIGN SPECIFICATIONS:
${userPrompt}`;
}

/**
 * 验证提示词长度是否符合要求
 * @param prompt 用户输入的提示词
 * @returns 是否有效
 */
export function validatePromptLength(prompt?: string): boolean {
  if (!prompt) return false;
  const length = prompt.trim().length;
  return length >= 5 && length <= 200;
} 