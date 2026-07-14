import type {
  ConsumptionLine,
  ConsumptionRecord,
  PantryCategory,
  PantryItem,
  PantrySnapshot,
} from '../domain/types';

const CATEGORIES: PantryCategory[] = [
  '蔬菜',
  '水果',
  '肉蛋',
  '水产',
  '豆奶',
  '主食',
  '调味',
  '其他',
];

export function validateSnapshot(value: unknown): PantrySnapshot {
  if (!isRecord(value)) {
    throw new Error('备份文件格式不正确');
  }
  if ('version' in value && value.version !== 1) {
    throw new Error('不支持的数据版本');
  }
  if (value.version !== 1 || !Array.isArray(value.items) || !Array.isArray(value.consumptionRecords)) {
    throw new Error('备份文件格式不正确');
  }
  if (!value.items.every(isPantryItem)) {
    throw new Error('备份文件中的食材数据不正确');
  }
  if (!value.consumptionRecords.every(isConsumptionRecord)) {
    throw new Error('备份文件中的消耗记录不正确');
  }

  return value as PantrySnapshot;
}

function isPantryItem(value: unknown): value is PantryItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isPositiveNumber(value.quantity) &&
    isNonEmptyString(value.unit) &&
    CATEGORIES.includes(value.category as PantryCategory) &&
    isDateOnly(value.purchasedAt) &&
    (value.shelfLifeDays === null || isPositiveInteger(value.shelfLifeDays)) &&
    isIsoDateTime(value.createdAt) &&
    isIsoDateTime(value.updatedAt)
  );
}

function isConsumptionRecord(value: unknown): value is ConsumptionRecord {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    (value.dishName === null || typeof value.dishName === 'string') &&
    isDateOnly(value.consumedAt) &&
    Array.isArray(value.lines) &&
    value.lines.length > 0 &&
    value.lines.every(isConsumptionLine)
  );
}

function isConsumptionLine(value: unknown): value is ConsumptionLine {
  return (
    isRecord(value) &&
    isNonEmptyString(value.itemId) &&
    isNonEmptyString(value.itemName) &&
    isPositiveNumber(value.quantity) &&
    isNonEmptyString(value.unit)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return isPositiveNumber(value) && Number.isInteger(value);
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}
