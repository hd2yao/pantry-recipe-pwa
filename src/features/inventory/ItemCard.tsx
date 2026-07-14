import type { PantryItem } from '../../domain/types';
import { getDaysStored, getFreshnessStatus, getRemainingDays } from '../../domain/shelfLife';

type ItemCardProps = {
  item: PantryItem;
  today: string;
  compact?: boolean;
};

const STATUS_LABELS = {
  fresh: '还新鲜',
  soon: '尽快吃',
  overdue: '超过建议期',
  unset: '未设置',
};

export function ItemCard({ item, today, compact = false }: ItemCardProps) {
  const status = getFreshnessStatus(item, today);
  const remainingDays = getRemainingDays(item, today);
  const daysStored = getDaysStored(item.purchasedAt, today);

  const timing =
    remainingDays === null
      ? `已放 ${daysStored} 天`
      : remainingDays < 0
        ? `建议期已过 ${Math.abs(remainingDays)} 天`
        : remainingDays === 0
          ? '今天到建议保存期'
          : `建议 ${remainingDays} 天内处理`;

  return (
    <article className={`item-card${compact ? ' item-card--compact' : ''}`}>
      <div className={`item-card__marker item-card__marker--${status}`} aria-hidden="true" />
      <div className="item-card__body">
        <div className="item-card__heading">
          <h3>{item.name}</h3>
          <span className={`status-pill status-pill--${status}`}>{STATUS_LABELS[status]}</span>
        </div>
        <p>
          <strong>
            {item.quantity} {item.unit}
          </strong>
          <span> · {item.category}</span>
        </p>
        <small>
          {timing} · {item.purchasedAt.slice(5).replace('-', '/')} 买入
        </small>
      </div>
    </article>
  );
}
