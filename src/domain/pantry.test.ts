import { describe, expect, it } from 'vitest';
import {
  addPantryItem,
  consumeItems,
  createEmptySnapshot,
  sortItemsByPriority,
} from './pantry';
import { getDaysStored, getFreshnessStatus, getRemainingDays } from './shelfLife';
import type { PantryItem, PantrySnapshot } from './types';

const now = '2026-07-14T10:00:00.000Z';
const ids = (...values: string[]) => {
  let index = 0;
  return () => values[index++] ?? `id-${index}`;
};

const tomato: PantryItem = {
  id: 'tomato',
  name: '番茄',
  quantity: 3,
  unit: '个',
  category: '蔬菜',
  purchasedAt: '2026-07-12',
  shelfLifeDays: 5,
  createdAt: now,
  updatedAt: now,
};

const snapshot: PantrySnapshot = {
  version: 1,
  items: [tomato],
  consumptionRecords: [],
};

describe('createEmptySnapshot', () => {
  it('创建版本化空快照', () => {
    expect(createEmptySnapshot()).toEqual({
      version: 1,
      items: [],
      consumptionRecords: [],
    });
  });
});

describe('addPantryItem', () => {
  it('新增食材并清理名称和单位空格', () => {
    const result = addPantryItem(
      createEmptySnapshot(),
      {
        name: '  菠菜  ',
        quantity: 1,
        unit: ' 把 ',
        category: '蔬菜',
        purchasedAt: '2026-07-14',
        shelfLifeDays: 3,
      },
      { now, createId: ids('spinach') },
    );

    expect(result.items[0]).toMatchObject({
      id: 'spinach',
      name: '菠菜',
      quantity: 1,
      unit: '把',
      createdAt: now,
      updatedAt: now,
    });
  });

  it('合并同名同单位食材并保留更早购买日期', () => {
    const result = addPantryItem(
      snapshot,
      {
        name: ' 番茄 ',
        quantity: 2,
        unit: '个',
        category: '蔬菜',
        purchasedAt: '2026-07-14',
        shelfLifeDays: 7,
      },
      { now: '2026-07-14T12:00:00.000Z', createId: ids('unused') },
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      quantity: 5,
      purchasedAt: '2026-07-12',
      shelfLifeDays: 5,
      updatedAt: '2026-07-14T12:00:00.000Z',
    });
  });

  it.each([
    { name: '', quantity: 1, message: '请输入食材名称' },
    { name: '番茄', quantity: 0, message: '数量必须大于 0' },
    { name: '番茄', quantity: Number.NaN, message: '数量必须大于 0' },
  ])('拒绝无效输入：$message', ({ name, quantity, message }) => {
    expect(() =>
      addPantryItem(createEmptySnapshot(), {
        name,
        quantity,
        unit: '个',
        category: '蔬菜',
        purchasedAt: '2026-07-14',
        shelfLifeDays: 5,
      }),
    ).toThrow(message);
  });
});

describe('consumeItems', () => {
  it('扣减库存并保留消耗时的名称和单位快照', () => {
    const result = consumeItems(
      snapshot,
      {
        dishName: ' 番茄炒蛋 ',
        consumedAt: '2026-07-14',
        lines: [{ itemId: 'tomato', quantity: 2 }],
      },
      { now, createId: ids('record-1') },
    );

    expect(result.items[0].quantity).toBe(1);
    expect(result.consumptionRecords[0]).toEqual({
      id: 'record-1',
      dishName: '番茄炒蛋',
      consumedAt: '2026-07-14',
      lines: [{ itemId: 'tomato', itemName: '番茄', quantity: 2, unit: '个' }],
    });
  });

  it('数量归零时从当前库存移除', () => {
    const result = consumeItems(
      snapshot,
      {
        consumedAt: '2026-07-14',
        lines: [{ itemId: 'tomato', quantity: 3 }],
      },
      { now, createId: ids('record-1') },
    );

    expect(result.items).toEqual([]);
    expect(result.consumptionRecords[0].dishName).toBeNull();
  });

  it('拒绝超过库存的消耗数量', () => {
    expect(() =>
      consumeItems(snapshot, {
        consumedAt: '2026-07-14',
        lines: [{ itemId: 'tomato', quantity: 4 }],
      }),
    ).toThrow('番茄最多可消耗 3 个');
  });

  it('拒绝重复食材和空消耗记录', () => {
    expect(() =>
      consumeItems(snapshot, {
        consumedAt: '2026-07-14',
        lines: [
          { itemId: 'tomato', quantity: 1 },
          { itemId: 'tomato', quantity: 1 },
        ],
      }),
    ).toThrow('同一种食材不能重复记录');

    expect(() => consumeItems(snapshot, { consumedAt: '2026-07-14', lines: [] })).toThrow(
      '请至少选择一种食材',
    );
  });
});

describe('保鲜状态', () => {
  it('按日历日计算已存放天数', () => {
    expect(getDaysStored('2026-07-12', '2026-07-14')).toBe(2);
  });

  it('区分新鲜、尽快吃、超过建议期和未设置', () => {
    expect(getFreshnessStatus({ ...tomato, shelfLifeDays: 5 }, '2026-07-14')).toBe('fresh');
    expect(getFreshnessStatus({ ...tomato, shelfLifeDays: 3 }, '2026-07-14')).toBe('soon');
    expect(getFreshnessStatus({ ...tomato, shelfLifeDays: 1 }, '2026-07-14')).toBe('overdue');
    expect(getFreshnessStatus({ ...tomato, shelfLifeDays: null }, '2026-07-14')).toBe('unset');
    expect(getRemainingDays({ ...tomato, shelfLifeDays: 5 }, '2026-07-14')).toBe(3);
  });

  it('把最需要处理的食材排在前面', () => {
    const items = [
      { ...tomato, id: 'unset', name: '盐', shelfLifeDays: null },
      { ...tomato, id: 'fresh', name: '土豆', shelfLifeDays: 7 },
      { ...tomato, id: 'overdue', name: '菠菜', shelfLifeDays: 1 },
      { ...tomato, id: 'soon', name: '蘑菇', shelfLifeDays: 3 },
    ];

    expect(sortItemsByPriority(items, '2026-07-14').map((item) => item.id)).toEqual([
      'overdue',
      'soon',
      'fresh',
      'unset',
    ]);
  });
});
