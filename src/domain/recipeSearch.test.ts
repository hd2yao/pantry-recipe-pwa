import { describe, expect, it } from 'vitest';
import { buildRecipeKeyword, buildRecipeSearchUrl } from './recipeSearch';

describe('菜谱搜索', () => {
  it('去重并生成菜谱关键词', () => {
    expect(buildRecipeKeyword([' 番茄 ', '鸡蛋', '番茄'])).toBe('番茄 鸡蛋 菜谱');
  });

  it('生成编码后的小红书和 B 站搜索链接', () => {
    expect(buildRecipeSearchUrl('xiaohongshu', ['番茄', '鸡蛋'])).toBe(
      'https://www.xiaohongshu.com/search_result?keyword=%E7%95%AA%E8%8C%84%20%E9%B8%A1%E8%9B%8B%20%E8%8F%9C%E8%B0%B1',
    );
    expect(buildRecipeSearchUrl('bilibili', ['番茄', '鸡蛋'])).toBe(
      'https://search.bilibili.com/all?keyword=%E7%95%AA%E8%8C%84%20%E9%B8%A1%E8%9B%8B%20%E8%8F%9C%E8%B0%B1',
    );
  });

  it('没有有效食材时拒绝搜索', () => {
    expect(() => buildRecipeSearchUrl('bilibili', [' ', ''])).toThrow('请至少选择一种食材');
  });
});
