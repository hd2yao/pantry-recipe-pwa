import type { PantryItem } from '../../domain/types';
import { useMemo, useState } from 'react';
import type { FreshnessStatus, PantryCategory } from '../../domain/types';
import { sortItemsByPriority } from '../../domain/pantry';
import { getFreshnessStatus } from '../../domain/shelfLife';
import { ItemCard } from './ItemCard';

type InventoryViewProps = {
  items: PantryItem[];
  today: string;
  onAddItem: () => void;
  onConsume: () => void;
};

type StatusFilter = 'all' | FreshnessStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'overdue', label: '超过建议期' },
  { value: 'soon', label: '尽快吃' },
  { value: 'fresh', label: '还新鲜' },
  { value: 'unset', label: '未设置' },
];

export function InventoryView({ items, today, onAddItem, onConsume }: InventoryViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'全部' | PantryCategory>('全部');

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))].sort(),
    [items],
  );
  const visibleItems = useMemo(
    () =>
      sortItemsByPriority(items, today).filter((item) => {
        const matchesStatus =
          statusFilter === 'all' || getFreshnessStatus(item, today) === statusFilter;
        const matchesCategory = categoryFilter === '全部' || item.category === categoryFilter;
        return matchesStatus && matchesCategory;
      }),
    [categoryFilter, items, statusFilter, today],
  );

  return (
    <div className="page-stack">
      <section className="inventory-toolbar" aria-labelledby="inventory-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">全部库存</p>
            <h2 id="inventory-title">{items.length} 种食材</h2>
          </div>
          <button className="button button--small button--primary" type="button" onClick={onAddItem}>
            ＋ 新增
          </button>
        </div>

        <div className="filter-row" aria-label="按保鲜状态筛选">
          {STATUS_FILTERS.map((filter) => (
            <button
              aria-pressed={statusFilter === filter.value}
              className="filter-chip"
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="select-field select-field--inline">
          <span>按分类筛选</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as '全部' | PantryCategory)}
          >
            <option value="全部">全部分类</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </section>

      {visibleItems.length > 0 ? (
        <section className="item-list" aria-live="polite" aria-label="库存食材">
          {visibleItems.map((item) => (
            <ItemCard item={item} key={item.id} today={today} />
          ))}
        </section>
      ) : (
        <section className="empty-state empty-state--compact">
          <h2>{items.length === 0 ? '还没有食材' : '没有符合筛选的食材'}</h2>
          <p>{items.length === 0 ? '记录今天买的菜，从这里开始。' : '换一个状态或分类看看。'}</p>
        </section>
      )}

      {items.length > 0 && (
        <button className="button button--secondary button--wide" type="button" onClick={onConsume}>
          记录做饭消耗
        </button>
      )}
    </div>
  );
}
