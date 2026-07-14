import type { FreshnessStatus, PantryItem } from './types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getDaysStored(purchasedAt: string, today: string): number {
  const purchasedTime = parseDateOnly(purchasedAt);
  const todayTime = parseDateOnly(today);
  return Math.max(0, Math.floor((todayTime - purchasedTime) / DAY_IN_MS));
}

export function getRemainingDays(item: PantryItem, today: string): number | null {
  if (item.shelfLifeDays === null) {
    return null;
  }

  return item.shelfLifeDays - getDaysStored(item.purchasedAt, today);
}

export function getFreshnessStatus(item: PantryItem, today: string): FreshnessStatus {
  const remainingDays = getRemainingDays(item, today);
  if (remainingDays === null) {
    return 'unset';
  }
  if (remainingDays < 0) {
    return 'overdue';
  }

  const soonThreshold = Math.max(1, Math.ceil((item.shelfLifeDays ?? 0) * 0.25));
  return remainingDays <= soonThreshold ? 'soon' : 'fresh';
}

function parseDateOnly(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`无效日期：${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const time = Date.UTC(year, month - 1, day);
  const parsed = new Date(time);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`无效日期：${value}`);
  }

  return time;
}
