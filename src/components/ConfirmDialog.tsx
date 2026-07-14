type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  danger = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onCancel]);

  return (
    <div className="confirm-backdrop">
      <section aria-labelledby="confirm-title" aria-modal="true" className="confirm-dialog" role="alertdialog">
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        <div className="confirm-dialog__actions">
          <button className="button button--secondary" type="button" onClick={onCancel}>
            取消
          </button>
          <button
            className={`button ${danger ? 'button--danger' : 'button--primary'}`}
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
import { useEffect, useRef } from 'react';
