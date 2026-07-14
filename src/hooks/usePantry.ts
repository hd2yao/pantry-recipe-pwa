import { useState } from 'react';
import type { AddPantryItemInput, ConsumeItemsInput, PantrySnapshot } from '../domain/types';
import { addPantryItem, consumeItems, createEmptySnapshot } from '../domain/pantry';
import { exportSnapshot, importSnapshot, loadSnapshot, saveSnapshot } from '../storage/pantryStorage';

function readInitialSnapshot() {
  try {
    return { snapshot: loadSnapshot(), error: null as string | null };
  } catch (error) {
    return {
      snapshot: createEmptySnapshot(),
      error: error instanceof Error ? error.message : '本地数据无法读取',
    };
  }
}

export function usePantry() {
  const [initial] = useState(readInitialSnapshot);
  const [snapshot, setSnapshot] = useState<PantrySnapshot>(initial.snapshot);
  const [error, setError] = useState<string | null>(initial.error);

  const commit = (nextSnapshot: PantrySnapshot) => {
    try {
      saveSnapshot(nextSnapshot);
      setSnapshot(nextSnapshot);
      setError(null);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : '暂时无法保存';
      setError(message);
      throw saveError;
    }
  };

  return {
    snapshot,
    error,
    addItem: (input: AddPantryItemInput) => commit(addPantryItem(snapshot, input)),
    consume: (input: ConsumeItemsInput) => commit(consumeItems(snapshot, input)),
    replaceSnapshot: commit,
    exportData: () => exportSnapshot(snapshot),
    importData: (serialized: string) => {
      try {
        const imported = importSnapshot(serialized);
        setSnapshot(imported);
        setError(null);
      } catch (importError) {
        const message = importError instanceof Error ? importError.message : '导入失败';
        setError(message);
        throw importError;
      }
    },
    clearData: () => commit(createEmptySnapshot()),
    clearError: () => setError(null),
  };
}
