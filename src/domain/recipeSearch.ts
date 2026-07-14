export type RecipePlatform = 'xiaohongshu' | 'bilibili';

const SEARCH_BASE_URLS: Record<RecipePlatform, string> = {
  xiaohongshu: 'https://www.xiaohongshu.com/search_result?keyword=',
  bilibili: 'https://search.bilibili.com/all?keyword=',
};

export function buildRecipeKeyword(ingredients: string[]): string {
  const normalized = ingredients.map((ingredient) => ingredient.trim()).filter(Boolean);
  const unique = [...new Set(normalized)];
  if (unique.length === 0) {
    throw new Error('请至少选择一种食材');
  }

  return `${unique.join(' ')} 菜谱`;
}

export function buildRecipeSearchUrl(
  platform: RecipePlatform,
  ingredients: string[],
): string {
  return `${SEARCH_BASE_URLS[platform]}${encodeURIComponent(buildRecipeKeyword(ingredients))}`;
}
