type DataMenuProps = {
  itemCount: number;
  recordCount: number;
  onClear: () => void;
  onClose: () => void;
  onExport: () => void;
  onImport: (serialized: string) => void;
};

type PendingAction = 'import' | 'clear' | null;

export function DataMenu({
  itemCount,
  recordCount,
  onClear,
  onClose,
  onExport,
  onImport,
}: DataMenuProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const serialized = await readFile(file);
      setPendingImport(serialized);
      setPendingAction('import');
      setError(null);
    } catch {
      setError('无法读取这个备份文件');
    } finally {
      event.target.value = '';
    }
  };

  const confirmImport = () => {
    if (pendingImport === null) return;
    try {
      onImport(pendingImport);
      setPendingAction(null);
      setPendingImport(null);
      setError(null);
    } catch (importError) {
      setPendingAction(null);
      setError(importError instanceof Error ? importError.message : '导入失败');
    }
  };

  const confirmClear = () => {
    try {
      onClear();
      setPendingAction(null);
      setError(null);
    } catch (clearError) {
      setPendingAction(null);
      setError(clearError instanceof Error ? clearError.message : '暂时无法清空数据');
    }
  };

  return (
    <div className="sheet-backdrop">
      <section aria-labelledby="data-menu-title" aria-modal="true" className="sheet" role="dialog">
        <header className="sheet__header">
          <div>
            <p className="eyebrow">只保存在这台设备</p>
            <h2 id="data-menu-title">数据与备份</h2>
          </div>
          <button
            aria-label="关闭数据设置"
            className="icon-button"
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="data-summary" aria-label={`${itemCount} 种食材，${recordCount} 条消耗记录`}>
          <div>
            <strong>{itemCount}</strong>
            <span>种食材</span>
          </div>
          <div>
            <strong>{recordCount}</strong>
            <span>条消耗记录</span>
          </div>
        </div>

        <div className="settings-list">
          <button
            aria-label="导出 JSON 备份"
            className="settings-action"
            type="button"
            onClick={() => {
              try {
                onExport();
                setError(null);
              } catch (exportError) {
                setError(exportError instanceof Error ? exportError.message : '导出失败');
              }
            }}
          >
            <span aria-hidden="true">⇩</span>
            <span>
              <strong>导出 JSON 备份</strong>
              <small>换手机或清浏览器前先保存一份</small>
            </span>
          </button>

          <label aria-label="导入 JSON 备份" className="settings-action settings-action--file">
            <span aria-hidden="true">⇧</span>
            <span>
              <strong>导入 JSON 备份</strong>
              <small>校验通过并确认后替换当前数据</small>
            </span>
            <input
              accept="application/json,.json"
              aria-label="选择备份文件"
              className="sr-only"
              type="file"
              onChange={handleFile}
            />
          </label>

          <button
            aria-label="清空本机数据"
            className="settings-action settings-action--danger"
            disabled={itemCount === 0 && recordCount === 0}
            type="button"
            onClick={() => setPendingAction('clear')}
          >
            <span aria-hidden="true">×</span>
            <span>
              <strong>清空本机数据</strong>
              <small>此操作不能撤销，建议先导出备份</small>
            </span>
          </button>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <p className="safety-note">
          当前没有账号和云同步。删除浏览器网站数据或更换设备时，记录不会自动迁移。
        </p>
      </section>

      {pendingAction === 'import' && (
        <ConfirmDialog
          confirmLabel="确认导入"
          description="导入会整体替换当前库存和消耗历史。建议先导出一份当前数据。"
          title="替换当前数据？"
          onCancel={() => setPendingAction(null)}
          onConfirm={confirmImport}
        />
      )}
      {pendingAction === 'clear' && (
        <ConfirmDialog
          danger
          confirmLabel="确认清空"
          description="所有食材和消耗记录都会从当前设备删除，而且无法撤销。"
          title="清空本机数据？"
          onCancel={() => setPendingAction(null)}
          onConfirm={confirmClear}
        />
      )}
    </div>
  );
}

async function readFile(file: File) {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsText(file);
  });
}
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
