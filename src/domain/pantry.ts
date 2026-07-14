import type { AddPantryItemInput, ConsumeItemsInput, PantryItem, PantrySnapshot } from './types';
import { getFreshnessStatus, getRemainingDays } from './shelfLife';

type DomainOptions = {
  now?: string;
  createId?: () => string;
};

const defaultId = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function createEmptySnapshot(): PantrySnapshot {
  return {
    version: 1,
    items: [],
    consumptionRecords: [],
  };
}

export function addPantryItem(
  snapshot: PantrySnapshot,
  input: AddPantryItemInput,
  options: DomainOptions = {},
): PantrySnapshot {
  const name = input.name.trim();
  const unit = input.unit.trim();
  validateItemInput({ ...input, name, unit });

  const now = options.now ?? new Date().toISOString();
  const existingIndex = snapshot.items.findIndex(
    (item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase() && item.unit === unit,
  );

  if (existingIndex >= 0) {
    const existing = snapshot.items[existingIndex];
    const merged: PantryItem = {
      ...existing,
      quantity: roundQuantity(existing.quantity + input.quantity),
      purchasedAt:
        existing.purchasedAt < input.purchasedAt ? existing.purchasedAt : input.purchasedAt,
      shelfLifeDays: existing.shelfLifeDays ?? input.shelfLifeDays,
      updatedAt: now,
    };

    return {
      ...snapshot,
      items: snapshot.items.map((item, index) => (index === existingIndex ? merged : item)),
    };
  }

  const item: PantryItem = {
    id: (options.createId ?? defaultId)(),
    name,
    quantity: input.quantity,
    unit,
    category: input.category,
    purchasedAt: input.purchasedAt,
    shelfLifeDays: input.shelfLifeDays,
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...snapshot,
    items: [item, ...snapshot.items],
  };
}

export function consumeItems(
  snapshot: PantrySnapshot,
  input: ConsumeItemsInput,
  options: DomainOptions = {},
): PantrySnapshot {
  if (input.lines.length === 0) {
    throw new Error('请至少选择一种食材');
  }

  const uniqueIds = new Set(input.lines.map((line) => line.itemId));
  if (uniqueIds.size !== input.lines.length) {
    throw new Error('同一种食材不能重复记录');
  }

  const itemById = new Map(snapshot.items.map((item) => [item.id, item]));
  const consumptionById = new Map<string, number>();
  const recordLines = input.lines.map((line) => {
    const item = itemById.get(line.itemId);
    if (!item) {
      throw new Error('所选食材已不在库存中');
    }
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
      throw new Error(`${item.name}的消耗数量必须大于 0`);
    }
    if (line.quantity > item.quantity) {
      throw new Error(`${item.name}最多可消耗 ${item.quantity} ${item.unit}`);
    }

    consumptionById.set(item.id, line.quantity);
    return {
      itemId: item.id,
      itemName: item.name,
      quantity: line.quantity,
      unit: item.unit,
    };
  });

  const now = options.now ?? new Date().toISOString();
  const items = snapshot.items.flatMap((item) => {
    const consumed = consumptionById.get(item.id);
    if (consumed === undefined) {
      return [item];
    }

    const quantity = roundQuantity(item.quantity - consumed);
    return quantity > 0 ? [{ ...item, quantity, updatedAt: now }] : [];
  });

  const dishName = input.dishName?.trim() || null;
  const record = {
    id: (options.createId ?? defaultId)(),
    dishName,
    consumedAt: input.consumedAt,
    lines: recordLines,
  };

  return {
    ...snapshot,
    items,
    consumptionRecords: [record, ...snapshot.consumptionRecords],
  };
}

export function sortItemsByPriority(items: PantryItem[], today: string): PantryItem[] {
  const statusRank = { overdue: 0, soon: 1, fresh: 2, unset: 3 } as const;

  return [...items].sort((left, right) => {
    const statusDifference =
      statusRank[getFreshnessStatus(left, today)] - statusRank[getFreshnessStatus(right, today)];
    if (statusDifference !== 0) {
      return statusDifference;
    }

    const remainingDifference =
      (getRemainingDays(left, today) ?? Number.POSITIVE_INFINITY) -
      (getRemainingDays(right, today) ?? Number.POSITIVE_INFINITY);
    if (remainingDifference !== 0) {
      return remainingDifference;
    }

    return left.name.localeCompare(right.name, 'zh-CN');
  });
}

function validateItemInput(input: AddPantryItemInput) {
  if (!input.name) {
    throw new Error('请输入食材名称');
  }
  if (!input.unit) {
    throw new Error('请输入数量单位');
  }
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error('数量必须大于 0');
  }
  if (input.shelfLifeDays !== null && (!Number.isInteger(input.shelfLifeDays) || input.shelfLifeDays <= 0)) {
    throw new Error('建议保存天数必须是正整数');
  }
}

function roundQuantity(value: number) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}
