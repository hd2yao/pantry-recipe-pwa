import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import type { AppTab } from './BottomNav';

type AppShellProps = {
  activeTab: AppTab;
  children: ReactNode;
  error?: string | null;
  onChangeTab: (tab: AppTab) => void;
  onOpenSettings?: () => void;
};

const PAGE_LABELS: Record<AppTab, string> = {
  today: '今天吃什么，从现有食材开始',
  inventory: '记得住买入，也看得见剩余',
  recipes: '选择手头食材，去找合适做法',
};

export function AppShell({
  activeTab,
  children,
  error,
  onChangeTab,
  onOpenSettings,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>食材管家</h1>
          <p>{PAGE_LABELS[activeTab]}</p>
        </div>
        {onOpenSettings && (
          <button aria-label="数据设置" className="icon-button" type="button" onClick={onOpenSettings}>
            ⋯
          </button>
        )}
      </header>
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}
      <main className="app-content">{children}</main>
      <BottomNav activeTab={activeTab} onChange={onChangeTab} />
    </div>
  );
}
