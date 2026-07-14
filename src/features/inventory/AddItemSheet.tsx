import type { AddPantryItemInput } from '../../domain/types';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { PantryCategory } from '../../domain/types';

type AddItemSheetProps = {
  today: string;
  onClose: () => void;
  onSubmit: (input: AddPantryItemInput) => void;
};

const CATEGORIES: PantryCategory[] = [
  '蔬菜',
  '水果',
  '肉蛋',
  '水产',
  '豆奶',
  '主食',
  '调味',
  '其他',
];

const UNITS = ['份', '个', '把', '颗', '根', '盒', '袋', '克', '千克', '毫升'];

const DEFAULT_SHELF_LIFE: Record<PantryCategory, number | null> = {
  蔬菜: 5,
  水果: 7,
  肉蛋: 3,
  水产: 2,
  豆奶: 5,
  主食: 5,
  调味: null,
  其他: null,
};

export function AddItemSheet({ today, onClose, onSubmit }: AddItemSheetProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('份');
  const [category, setCategory] = useState<PantryCategory>('蔬菜');
  const [purchasedAt, setPurchasedAt] = useState(today);
  const [shelfLifeDays, setShelfLifeDays] = useState('5');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nameInputRef.current?.focus();
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

  const handleCategoryChange = (nextCategory: PantryCategory) => {
    setCategory(nextCategory);
    const suggestedDays = DEFAULT_SHELF_LIFE[nextCategory];
    setShelfLifeDays(suggestedDays === null ? '' : String(suggestedDays));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    const parsedShelfLife = shelfLifeDays.trim() === '' ? null : Number(shelfLifeDays);

    if (!name.trim()) {
      setError('请输入食材名称');
      return;
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError('数量必须大于 0');
      return;
    }
    if (
      parsedShelfLife !== null &&
      (!Number.isInteger(parsedShelfLife) || parsedShelfLife <= 0)
    ) {
      setError('建议保存天数必须是正整数');
      return;
    }

    try {
      onSubmit({
        name: name.trim(),
        quantity: parsedQuantity,
        unit,
        category,
        purchasedAt,
        shelfLifeDays: parsedShelfLife,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '暂时无法保存');
    }
  };

  return (
    <div className="sheet-backdrop">
      <section aria-labelledby="add-item-title" aria-modal="true" className="sheet" role="dialog">
        <header className="sheet__header">
          <div>
            <p className="eyebrow">买入记录</p>
            <h2 id="add-item-title">今天买了什么</h2>
          </div>
          <button aria-label="关闭新增食材" className="icon-button" type="button" onClick={onClose}>
            ×
          </button>
        </header>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="text-field text-field--full">
            <span>食材名称</span>
            <input
              placeholder="例如：番茄"
              ref={nameInputRef}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
            />
          </label>

          <div className="form-grid form-grid--quantity">
            <label className="text-field">
              <span>数量</span>
              <input
                inputMode="decimal"
                min="0.001"
                step="any"
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
            <label className="select-field">
              <span>单位</span>
              <select value={unit} onChange={(event) => setUnit(event.target.value)}>
                {UNITS.map((itemUnit) => (
                  <option key={itemUnit} value={itemUnit}>
                    {itemUnit}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label className="select-field">
              <span>分类</span>
              <select
                value={category}
                onChange={(event) => handleCategoryChange(event.target.value as PantryCategory)}
              >
                {CATEGORIES.map((itemCategory) => (
                  <option key={itemCategory} value={itemCategory}>
                    {itemCategory}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-field">
              <span>购买日期</span>
              <input
                max={today}
                type="date"
                value={purchasedAt}
                onChange={(event) => setPurchasedAt(event.target.value)}
              />
            </label>
          </div>

          <label className="text-field text-field--full">
            <span>预计可保存天数（可不填）</span>
            <input
              inputMode="numeric"
              min="1"
              placeholder="不确定可以留空"
              type="number"
              value={shelfLifeDays}
              onChange={(event) => setShelfLifeDays(event.target.value)}
            />
            <small>默认值只是便于提醒，可按包装说明和储存方式修改。</small>
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="button button--primary button--wide" type="submit">
            保存食材
          </button>
        </form>
      </section>
    </div>
  );
}
