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
  return `Generate a professional nail art display showing EXACTLY 5 detached nail tips in ONE SINGLE ROW - NO MORE, NO LESS.

CRITICAL COUNT REQUIREMENT:
- EXACTLY 5 nail tips total - COUNT CAREFULLY
- ABSOLUTELY NO ADDITIONAL NAILS beyond these 5

SPECIFIC NAIL IDENTIFICATION:
- From left to right: thumb, index finger, middle finger, ring finger, and pinky finger
- Each nail must be clearly distinguishable by its appropriate width and shape:
  * Thumb nail: widest
  * Index nail: second widest
  * Middle nail: medium width
  * Ring nail: slightly narrower
  * Pinky nail: narrowest

CRITICAL LAYOUT REQUIREMENTS:
- Arrange in ONE SINGLE HORIZONTAL ROW only
- NO FINGERS OR HANDS should be visible - only the detached nail tips
- Perfect alignment with even spacing between each nail
- Each nail tip should be the same distance from its neighbors
- Clean, uncluttered composition with ONLY 5 nails visible

TECHNICAL SPECIFICATIONS:
- Professional studio-quality lighting
- High-resolution detail of nail art
- Clear visibility of all design elements
- Realistic glossy finish
- Clean, minimalist presentation on a plain background

FINAL VERIFICATION: 
- COUNT ONE MORE TIME to confirm EXACTLY 5 detached nail tips are shown
- Verify the nails represent thumb, index, middle, ring, and pinky in correct order
- Ensure NO ADDITIONAL NAILS appear anywhere in the image

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