import { useState } from 'react';
import { AppShell } from './components/AppShell';
import type { AppTab } from './components/BottomNav';
import { Toast } from './components/Toast';
import { Dashboard } from './features/dashboard/Dashboard';
import { ConsumeSheet } from './features/consumption/ConsumeSheet';
import { AddItemSheet } from './features/inventory/AddItemSheet';
import { InventoryView } from './features/inventory/InventoryView';
import { RecipeSearch } from './features/recipes/RecipeSearch';
import { DataMenu } from './features/settings/DataMenu';
import { downloadBackup } from './features/settings/download';
import { usePantry } from './hooks/usePantry';
import './styles/components.css';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('today');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isConsumeOpen, setIsConsumeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const pantry = usePantry();
  const today = getLocalDateString();

  const content =
    activeTab === 'recipes' ? (
      <RecipeSearch items={pantry.snapshot.items} />
    ) : activeTab === 'inventory' ? (
      <InventoryView
        items={pantry.snapshot.items}
        today={today}
        onAddItem={() => setIsAddOpen(true)}
        onConsume={() => setIsConsumeOpen(true)}
      />
    ) : (
      <Dashboard
        snapshot={pantry.snapshot}
        today={today}
        onAddItem={() => setIsAddOpen(true)}
        onConsume={() => setIsConsumeOpen(true)}
      />
    );

  return (
    <>
      <AppShell
        activeTab={activeTab}
        error={pantry.error}
        onChangeTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      >
        {content}
      </AppShell>
      {isAddOpen && (
        <AddItemSheet
          today={today}
          onClose={() => setIsAddOpen(false)}
          onSubmit={(input) => {
            pantry.addItem(input);
            setIsAddOpen(false);
            setToast('食材已加入库存');
          }}
        />
      )}
      {isConsumeOpen && (
        <ConsumeSheet
          items={pantry.snapshot.items}
          today={today}
          onClose={() => setIsConsumeOpen(false)}
          onSubmit={(input) => {
            pantry.consume(input);
            setIsConsumeOpen(false);
            setToast('消耗已记录，库存已更新');
          }}
        />
      )}
      {isSettingsOpen && (
        <DataMenu
          itemCount={pantry.snapshot.items.length}
          recordCount={pantry.snapshot.consumptionRecords.length}
          onClear={() => {
            pantry.clearData();
            setIsSettingsOpen(false);
            setToast('本机数据已清空');
          }}
          onClose={() => setIsSettingsOpen(false)}
          onExport={() => {
            downloadBackup(pantry.exportData(), today);
            setToast('备份已导出');
          }}
          onImport={(serialized) => {
            pantry.importData(serialized);
            setIsSettingsOpen(false);
            setToast('备份已导入');
          }}
        />
      )}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
