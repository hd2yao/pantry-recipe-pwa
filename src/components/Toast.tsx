import { useEffect } from 'react';

type ToastProps = {
  message: string;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 3500);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div className="toast" role="status">
      <span>{message}</span>
      <button aria-label="关闭提示" type="button" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}
