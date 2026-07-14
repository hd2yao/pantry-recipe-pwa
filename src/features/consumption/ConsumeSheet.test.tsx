import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PantryItem } from '../../domain/types';
import { ConsumeSheet } from './ConsumeSheet';

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

describe('ConsumeSheet', () => {
  it('禁用超过库存的消耗提交', async () => {
    const user = userEvent.setup();
    render(<ConsumeSheet items={items} today="2026-07-14" onClose={vi.fn()} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('checkbox', { name: /选择番茄/ }));
    await user.clear(screen.getByLabelText('番茄用量'));
    await user.type(screen.getByLabelText('番茄用量'), '99');

    expect(screen.getByText('最多 3 个')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认消耗' })).toBeDisabled();
  });

  it('提交多食材消耗和可选菜名', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ConsumeSheet items={items} today="2026-07-14" onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('做了什么（可不填）'), '番茄炒蛋');
    await user.click(screen.getByRole('checkbox', { name: /选择番茄/ }));
    await user.click(screen.getByRole('checkbox', { name: /选择鸡蛋/ }));
    await user.click(screen.getByRole('button', { name: '确认消耗' }));

    expect(onSubmit).toHaveBeenCalledWith({
      dishName: '番茄炒蛋',
      consumedAt: '2026-07-14',
      lines: [
        { itemId: 'tomato', quantity: 1 },
        { itemId: 'egg', quantity: 1 },
      ],
    });
  });
});
