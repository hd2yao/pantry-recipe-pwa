import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PantrySnapshot } from '../../domain/types';
import { Dashboard } from './Dashboard';

const emptySnapshot: PantrySnapshot = { version: 1, items: [], consumptionRecords: [] };

const snapshot: PantrySnapshot = {
  version: 1,
  consumptionRecords: [],
  items: [
    {
      id: 'potato',
      name: '土豆',
      quantity: 2,
      unit: '个',
      category: '蔬菜',
      purchasedAt: '2026-07-12',
      shelfLifeDays: 7,
      createdAt: '2026-07-12T08:00:00.000Z',
      updatedAt: '2026-07-12T08:00:00.000Z',
    },
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
      id: 'mushroom',
      name: '蘑菇',
      quantity: 300,
      unit: '克',
      category: '蔬菜',
      purchasedAt: '2026-07-12',
      shelfLifeDays: 3,
      createdAt: '2026-07-12T08:00:00.000Z',
      updatedAt: '2026-07-12T08:00:00.000Z',
    },
  ],
};

describe('Dashboard', () => {
  it('空库存时说明下一步并提供买入按钮', () => {
    const onAddItem = vi.fn();
    render(
      <Dashboard
        snapshot={emptySnapshot}
        today="2026-07-14"
        onAddItem={onAddItem}
        onConsume={vi.fn()}
      />,
    );

    expect(screen.getByText('库存还是空的')).toBeInTheDocument();
    screen.getByRole('button', { name: '记录第一批食材' }).click();
    expect(onAddItem).toHaveBeenCalledOnce();
  });

  it('把最需要处理的食材排在最前并显示概览', () => {
    render(
      <Dashboard
        snapshot={snapshot}
        today="2026-07-14"
        onAddItem={vi.fn()}
        onConsume={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('3 种食材')).toBeInTheDocument();
    const names = screen.getAllByTestId('priority-item').map((node) => node.textContent);
    expect(names[0]).toContain('菠菜');
    expect(names[1]).toContain('蘑菇');
  });
});
