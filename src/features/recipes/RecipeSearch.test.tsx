import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { PantryItem } from '../../domain/types';
import { RecipeSearch } from './RecipeSearch';

const items: PantryItem[] = [
  {
    id: 'tomato',
    name: '番茄',
    quantity: 3,
    unit: '个',
    category: '蔬菜',
    purchasedAt: '2026-07-14',
    shelfLifeDays: 5,
    createdAt: '2026-07-14T08:00:00.000Z',
    updatedAt: '2026-07-14T08:00:00.000Z',
  },
  {
    id: 'egg',
    name: '鸡蛋',
    quantity: 6,
    unit: '个',
    category: '肉蛋',
    purchasedAt: '2026-07-14',
    shelfLifeDays: 14,
    createdAt: '2026-07-14T08:00:00.000Z',
    updatedAt: '2026-07-14T08:00:00.000Z',
  },
];

describe('RecipeSearch', () => {
  it('从库存选择食材并生成两个平台链接', async () => {
    const user = userEvent.setup();
    render(<RecipeSearch items={items} />);

    expect(screen.getByRole('button', { name: '去小红书搜' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: /番茄/ }));
    await user.click(screen.getByRole('checkbox', { name: /鸡蛋/ }));

    expect(screen.getByText('番茄 鸡蛋 菜谱')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '去小红书搜' })).toHaveAttribute(
      'href',
      'https://www.xiaohongshu.com/search_result?keyword=%E7%95%AA%E8%8C%84%20%E9%B8%A1%E8%9B%8B%20%E8%8F%9C%E8%B0%B1',
    );
    expect(screen.getByRole('link', { name: '去 B 站搜' })).toHaveAttribute(
      'rel',
      expect.stringContaining('noreferrer'),
    );
  });

  it('没有库存时显示明确空状态', () => {
    render(<RecipeSearch items={[]} />);

    expect(screen.getByText('先记下食材，再来找菜谱')).toBeInTheDocument();
  });
});
