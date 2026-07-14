import { describe, expect, it } from 'vitest';
import { validateSnapshot } from './validation';

describe('validateSnapshot', () => {
  it('拒绝缺少字段或类型错误的数据', () => {
    expect(() => validateSnapshot(null)).toThrow('备份文件格式不正确');
    expect(() => validateSnapshot({ version: 1, items: 'wrong', consumptionRecords: [] })).toThrow(
      '备份文件格式不正确',
    );
  });

  it('拒绝非法食材字段', () => {
    expect(() =>
      validateSnapshot({
        version: 1,
        items: [
          {
            id: 'x',
            name: '',
            quantity: -1,
            unit: '个',
            category: '未知分类',
            purchasedAt: 'not-a-date',
            shelfLifeDays: 0,
            createdAt: 'today',
            updatedAt: 'today',
          },
        ],
        consumptionRecords: [],
      }),
    ).toThrow('备份文件中的食材数据不正确');
  });

  it('拒绝非法消耗记录', () => {
    expect(() =>
      validateSnapshot({
        version: 1,
        items: [],
        consumptionRecords: [{ id: 'record', dishName: null, consumedAt: '', lines: [] }],
      }),
    ).toThrow('备份文件中的消耗记录不正确');
  });
});
