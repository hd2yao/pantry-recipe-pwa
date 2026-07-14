import type { PantrySnapshot } from '../../domain/types';
import { sortItemsByPriority } from '../../domain/pantry';
import { getFreshnessStatus } from '../../domain/shelfLife';
import { ItemCard } from '../inventory/ItemCard';

type DashboardProps = {
  snapshot: PantrySnapshot;
  today: string;
  onAddItem: () => void;
  onConsume: () => void;
};

export function Dashboard({ snapshot, today, onAddItem, onConsume }: DashboardProps) {
  const sortedItems = sortItemsByPriority(snapshot.items, today);
  const urgentItems = sortedItems.filter((item) => {
    const status = getFreshnessStatus(item, today);
    return status === 'overdue' || status === 'soon';
  });
  const consumedToday = snapshot.consumptionRecords.filter(
    (record) => record.consumedAt === today,
  ).length;

  if (snapshot.items.length === 0) {
    return (
      <section className="page-stack" aria-labelledby="empty-title">
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">
            ◒
          </span>
          <h2 id="empty-title">库存还是空的</h2>
          <p>先记下今天买的菜，明天打开就知道还剩什么。</p>
          <button className="button button--primary" type="button" onClick={onAddItem}>
            记录第一批食材
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="overview-panel" aria-labelledby="overview-title">
        <div>
          <p className="eyebrow">今天的冰箱</p>
          <h2 id="overview-title">先吃快放不住的</h2>
        </div>
        <div className="overview-grid">
          <div aria-label={`${snapshot.items.length} 种食材`}>
            <strong>{snapshot.items.length}</strong>
            <span>种食材</span>
          </div>
          <div aria-label={`${urgentItems.length} 种需留意`}>
            <strong>{urgentItems.length}</strong>
            <span>种需留意</span>
          </div>
          <div aria-label={`${consumedToday} 次今日消耗`}>
            <strong>{consumedToday}</strong>
            <span>次今日消耗</span>
          </div>
        </div>
      </section>

      <section className="quick-actions" aria-label="快捷操作">
        <button className="action-button action-button--primary" type="button" onClick={onAddItem}>
          <span aria-hidden="true">＋</span>
          <span>
            <strong>买了什么</strong>
            <small>新增到库存</small>
          </span>
        </button>
        <button className="action-button" type="button" onClick={onConsume}>
          <span aria-hidden="true">✓</span>
          <span>
            <strong>做饭消耗</strong>
            <small>扣减现有食材</small>
          </span>
        </button>
      </section>

      <section className="content-section" aria-labelledby="priority-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">优先顺序</p>
            <h2 id="priority-title">接下来先处理</h2>
          </div>
          <span>{urgentItems.length > 0 ? `${urgentItems.length} 种需留意` : '状态不错'}</span>
        </div>
        <div className="item-list">
          {sortedItems.slice(0, 4).map((item) => (
            <div data-testid="priority-item" key={item.id}>
              <ItemCard item={item} today={today} compact />
            </div>
          ))}
        </div>
        <p className="safety-note">
          保存天数只是提醒，请结合实际冷藏条件以及气味、颜色和质地判断。
        </p>
      </section>
    </div>
  );
}
