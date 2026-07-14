export type PantryCategory =
  | '蔬菜'
  | '水果'
  | '肉蛋'
  | '水产'
  | '豆奶'
  | '主食'
  | '调味'
  | '其他';

export type PantryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: PantryCategory;
  purchasedAt: string;
  shelfLifeDays: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ConsumptionLine = {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
};

export type ConsumptionRecord = {
  id: string;
  dishName: string | null;
  consumedAt: string;
  lines: ConsumptionLine[];
};

export type PantrySnapshot = {
  version: 1;
  items: PantryItem[];
  consumptionRecords: ConsumptionRecord[];
};

export type AddPantryItemInput = Pick<
  PantryItem,
  'name' | 'quantity' | 'unit' | 'category' | 'purchasedAt' | 'shelfLifeDays'
>;

export type ConsumeItemsInput = {
  dishName?: string | null;
  consumedAt: string;
  lines: Array<Pick<ConsumptionLine, 'itemId' | 'quantity'>>;
};

export type FreshnessStatus = 'fresh' | 'soon' | 'overdue' | 'unset';
