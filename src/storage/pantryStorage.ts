import type { PantrySnapshot } from '../domain/types';
import { createEmptySnapshot } from '../domain/pantry';
import { validateSnapshot } from './validation';

export const STORAGE_KEY = 'pantry-recipe-pwa.snapshot.v1';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function loadSnapshot(storage: StorageLike = localStorage): PantrySnapshot {
  const serialized = storage.getItem(STORAGE_KEY);
  if (serialized === null) {
    return createEmptySnapshot();
  }

  try {
    return validateSnapshot(JSON.parse(serialized));
  } catch (error) {
    const detail = error instanceof Error ? `：${error.message}` : '';
    throw new Error(`本地数据无法读取${detail}`);
  }
}

export function saveSnapshot(
  snapshot: PantrySnapshot,
  storage: StorageLike = localStorage,
): void {
  const validated = validateSnapshot(snapshot);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(validated));
  } catch {
    throw new Error('无法保存到当前设备，请先导出备份或释放浏览器空间');
  }
}

export function exportSnapshot(snapshot: PantrySnapshot): string {
  return JSON.stringify(validateSnapshot(snapshot), null, 2);
}

export function importSnapshot(
  serialized: string,
  storage: StorageLike = localStorage,
): PantrySnapshot {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new Error('备份文件不是有效的 JSON');
  }

  const snapshot = validateSnapshot(parsed);
  saveSnapshot(snapshot, storage);
  return snapshot;
}
