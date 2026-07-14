import { useState } from 'react';
import { AppShell } from './components/AppShell';
import type { AppTab } from './components/BottomNav';
import { Dashboard } from './features/dashboard/Dashboard';
import { ConsumeSheet } from './features/consumption/ConsumeSheet';
import { AddItemSheet } from './features/inventory/AddItemSheet';
import { InventoryView } from './features/inventory/InventoryView';
import { RecipeSearch } from './features/recipes/RecipeSearch';
import { usePantry } from './hooks/usePantry';
import './styles/components.css';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('today');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isConsumeOpen, setIsConsumeOpen] = useState(false);
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
      {isConsumeOpen && (
        <ConsumeSheet
          items={pantry.snapshot.items}
          today={today}
          onClose={() => setIsConsumeOpen(false)}
          onSubmit={(input) => {
            pantry.consume(input);
            setIsConsumeOpen(false);
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
