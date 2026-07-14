import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PantryItem } from '../../domain/types';
import { AddItemSheet } from './AddItemSheet';
import { InventoryView } from './InventoryView';

const items: PantryItem[] = [
  {
    id: 'spinach',
    name: '菠菜',
    quantity: 1,
    unit: '把',
    category: '蔬菜',
    purchasedAt: '2026-07-10',
    shelfLifeDays: 2,
    createdAt: '2026-07-10T08:00:00.000Z',
    updatedAt: '2026-07-10T08:00:00.000Z',
  },
  {
    id: 'apple',
    name: '苹果',
    quantity: 4,
    unit: '个',
    category: '水果',
    purchasedAt: '2026-07-14',
    shelfLifeDays: 7,
    createdAt: '2026-07-14T08:00:00.000Z',
    updatedAt: '2026-07-14T08:00:00.000Z',
  },
];

describe('InventoryView', () => {
  it('按保鲜状态和分类筛选库存', async () => {
    const user = userEvent.setup();
    render(
      <InventoryView
        items={items}
        today="2026-07-14"
        onAddItem={vi.fn()}
        onConsume={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: '超过建议期' }));
    expect(screen.getByText('菠菜')).toBeInTheDocument();
    expect(screen.queryByText('苹果')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '全部' }));
    await user.selectOptions(screen.getByLabelText('按分类筛选'), '水果');
    expect(screen.getByText('苹果')).toBeInTheDocument();
    expect(screen.queryByText('菠菜')).not.toBeInTheDocument();
  });
});

describe('AddItemSheet', () => {
  it('校验输入并提交结构化食材', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddItemSheet today="2026-07-14" onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText('食材名称'));
    await user.click(screen.getByRole('button', { name: '保存食材' }));
    expect(screen.getByText('请输入食材名称')).toBeInTheDocument();

    await user.type(screen.getByLabelText('食材名称'), '番茄');
    await user.clear(screen.getByLabelText('数量'));
    await user.type(screen.getByLabelText('数量'), '3');
    await user.selectOptions(screen.getByLabelText('单位'), '个');
    await user.click(screen.getByRole('button', { name: '保存食材' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '番茄',
        quantity: 3,
        unit: '个',
        purchasedAt: '2026-07-14',
      }),
    );
  });
});
