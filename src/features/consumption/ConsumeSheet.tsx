import type { ConsumeItemsInput, PantryItem } from '../../domain/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';

type ConsumeSheetProps = {
  items: PantryItem[];
  today: string;
  onClose: () => void;
  onSubmit: (input: ConsumeItemsInput) => void;
};

export function ConsumeSheet({ items, today, onClose, onSubmit }: ConsumeSheetProps) {
  const dishInputRef = useRef<HTMLInputElement>(null);
  const [dishName, setDishName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dishInputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  const selectedItems = items.filter((item) => selectedIds.has(item.id));
  const validationErrors = useMemo(() => {
    const errors = new Map<string, string>();
    selectedItems.forEach((item) => {
      const quantity = Number(quantities[item.id] ?? '');
      if (!Number.isFinite(quantity) || quantity <= 0) {
        errors.set(item.id, '请输入大于 0 的数量');
      } else if (quantity > item.quantity) {
        errors.set(item.id, `最多 ${item.quantity} ${item.unit}`);
      }
    });
    return errors;
  }, [quantities, selectedItems]);

  const toggleItem = (item: PantryItem) => {
    setError(null);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
        setQuantities((currentQuantities) => ({ ...currentQuantities, [item.id]: '1' }));
      }
      return next;
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (selectedItems.length === 0 || validationErrors.size > 0) return;

    try {
      onSubmit({
        dishName: dishName.trim() || null,
        consumedAt: today,
        lines: selectedItems.map((item) => ({
          itemId: item.id,
          quantity: Number(quantities[item.id]),
        })),
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '暂时无法记录消耗');
    }
  };

  return (
    <div className="sheet-backdrop">
      <section aria-labelledby="consume-title" aria-modal="true" className="sheet" role="dialog">
        <header className="sheet__header">
          <div>
            <p className="eyebrow">消耗记录</p>
            <h2 id="consume-title">这顿用了什么</h2>
          </div>
          <button aria-label="关闭消耗记录" className="icon-button" type="button" onClick={onClose}>
            ×
          </button>
        </header>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="text-field text-field--full">
            <span>做了什么（可不填）</span>
            <input
              placeholder="例如：番茄炒蛋"
              ref={dishInputRef}
              value={dishName}
              onChange={(event) => setDishName(event.target.value)}
            />
          </label>

          <fieldset className="consume-list">
            <legend>选择食材和用量</legend>
            {items.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const itemError = validationErrors.get(item.id);
              return (
                <div className={`consume-row${isSelected ? ' consume-row--selected' : ''}`} key={item.id}>
                  <label className="consume-row__choice">
                    <input
                      aria-label={`选择${item.name}，库存 ${item.quantity} ${item.unit}`}
                      checked={isSelected}
                      type="checkbox"
                      onChange={() => toggleItem(item)}
                    />
                    <span>
                      <strong>{item.name}</strong>
                      <small>
                        现有 {item.quantity} {item.unit}
                      </small>
                    </span>
                  </label>
                  {isSelected && (
                    <div className="consume-row__quantity">
                      <label>
                        <span className="sr-only">{item.name}用量</span>
                        <input
                          aria-label={`${item.name}用量`}
                          inputMode="decimal"
                          min="0.001"
                          step="any"
                          type="number"
                          value={quantities[item.id] ?? ''}
                          onChange={(event) =>
                            setQuantities((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <span>{item.unit}</span>
                      {itemError && <small role="alert">{itemError}</small>}
                    </div>
                  )}
                </div>
              );
            })}
          </fieldset>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="button button--primary button--wide"
            disabled={selectedItems.length === 0 || validationErrors.size > 0}
            type="submit"
          >
            确认消耗
          </button>
        </form>
      </section>
    </div>
  );
}
