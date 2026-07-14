import { describe, expect, it } from 'vitest';
import { buildBackupFileName } from './download';

describe('buildBackupFileName', () => {
  it('使用本地日期生成稳定文件名', () => {
    expect(buildBackupFileName('2026-07-14')).toBe('食材管家备份-2026-07-14.json');
  });
});
