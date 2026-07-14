export type AppTab = 'today' | 'inventory' | 'recipes';

type BottomNavProps = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

const NAV_ITEMS: Array<{ tab: AppTab; label: string; icon: string }> = [
  { tab: 'today', label: '今天', icon: '⌂' },
  { tab: 'inventory', label: '库存', icon: '▤' },
  { tab: 'recipes', label: '菜谱', icon: '◎' },
];

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav aria-label="主导航" className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          aria-current={activeTab === item.tab ? 'page' : undefined}
          className="bottom-nav__item"
          key={item.tab}
          type="button"
          onClick={() => onChange(item.tab)}
        >
          <span aria-hidden="true">{item.icon}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}
