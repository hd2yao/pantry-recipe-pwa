import { beforeEach, describe, expect, it } from 'vitest';
import { createEmptySnapshot } from '../domain/pantry';
import type { PantrySnapshot } from '../domain/types';
import {
  STORAGE_KEY,
  exportSnapshot,
  importSnapshot,
  loadSnapshot,
  saveSnapshot,
} from './pantryStorage';

const snapshot: PantrySnapshot = {
  version: 1,
  items: [
    {
      id: 'tomato',
      name: '番茄',
      quantity: 3,
      unit: '个',
      category: '蔬菜',
      purchasedAt: '2026-07-14',
      shelfLifeDays: 5,
      createdAt: '2026-07-14T10:00:00.000Z',
      updatedAt: '2026-07-14T10:00:00.000Z',
    },
  ],
  consumptionRecords: [],
};

describe('pantryStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('没有本地数据时返回版本化空快照', () => {
    expect(loadSnapshot()).toEqual(createEmptySnapshot());
  });

  it('保存并重新读取完整快照', () => {
    saveSnapshot(snapshot);

    expect(loadSnapshot()).toEqual(snapshot);
  });

  it('损坏的本地 JSON 会报错但不会被空数据覆盖', () => {
    localStorage.setItem(STORAGE_KEY, '{broken');

    expect(() => loadSnapshot()).toThrow('本地数据无法读取');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken');
  });

  it('导出格式包含版本号且可以重新导入', () => {
    const exported = exportSnapshot(snapshot);
    const imported = importSnapshot(exported);

    expect(JSON.parse(exported).version).toBe(1);
    expect(imported).toEqual(snapshot);
    expect(loadSnapshot()).toEqual(snapshot);
  });

  it('拒绝未知版本且不覆盖当前数据', () => {
    saveSnapshot(snapshot);

    expect(() => importSnapshot('{"version":99,"items":[],"consumptionRecords":[]}')).toThrow(
      '不支持的数据版本',
    );
    expect(loadSnapshot()).toEqual(snapshot);
  });

  it('存储写入失败时给出可理解的错误', () => {
    const failingStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    };

    expect(() => saveSnapshot(snapshot, failingStorage)).toThrow('无法保存到当前设备');
  });
});
