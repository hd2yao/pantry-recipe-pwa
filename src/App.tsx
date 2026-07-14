import { useState } from 'react';
import { AppShell } from './components/AppShell';
import type { AppTab } from './components/BottomNav';
import { Dashboard } from './features/dashboard/Dashboard';
import { AddItemSheet } from './features/inventory/AddItemSheet';
import { InventoryView } from './features/inventory/InventoryView';
import { usePantry } from './hooks/usePantry';
import './styles/components.css';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('today');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const pantry = usePantry();
  const today = getLocalDateString();

  const content =
    activeTab === 'inventory' ? (
      <InventoryView
        items={pantry.snapshot.items}
        today={today}
        onAddItem={() => setIsAddOpen(true)}
        onConsume={() => setActiveTab('inventory')}
      />
    ) : (
      <Dashboard
        snapshot={pantry.snapshot}
        today={today}
        onAddItem={() => setIsAddOpen(true)}
        onConsume={() => setActiveTab('inventory')}
      />
    );

  return (
    <>
      <AppShell activeTab={activeTab} error={pantry.error} onChangeTab={setActiveTab}>
        {content}
      </AppShell>
      {isAddOpen && (
        <AddItemSheet
          today={today}
          onClose={() => setIsAddOpen(false)}
          onSubmit={(input) => {
            pantry.addItem(input);
            setIsAddOpen(false);
          }}
        />
      )}
    </>
  );
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
