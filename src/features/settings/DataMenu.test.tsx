import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataMenu } from './DataMenu';

const backup = '{"version":1,"items":[],"consumptionRecords":[]}';

describe('DataMenu', () => {
  it('导出当前数据', async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(
      <DataMenu
        itemCount={2}
        recordCount={1}
        onClear={vi.fn()}
        onClose={vi.fn()}
        onExport={onExport}
        onImport={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: '导出 JSON 备份' }));
    expect(onExport).toHaveBeenCalledOnce();
  });

  it('读取文件并在确认后导入', async () => {
    const user = userEvent.setup();
    const onImport = vi.fn();
    render(
      <DataMenu
        itemCount={0}
        recordCount={0}
        onClear={vi.fn()}
        onClose={vi.fn()}
        onExport={vi.fn()}
        onImport={onImport}
      />,
    );

    const file = new File([backup], 'pantry-backup.json', { type: 'application/json' });
    await user.upload(screen.getByLabelText('选择备份文件'), file);
    await screen.findByText('替换当前数据？');
    await user.click(screen.getByRole('button', { name: '确认导入' }));

    expect(onImport).toHaveBeenCalledWith(backup);
  });

  it('显示导入校验错误并保留设置页', async () => {
    const user = userEvent.setup();
    const onImport = vi.fn(() => {
      throw new Error('不支持的数据版本');
    });
    render(
      <DataMenu
        itemCount={1}
        recordCount={0}
        onClear={vi.fn()}
        onClose={vi.fn()}
        onExport={vi.fn()}
        onImport={onImport}
      />,
    );

    await user.upload(
      screen.getByLabelText('选择备份文件'),
      new File(['{"version":99}'], 'bad.json', { type: 'application/json' }),
    );
    await user.click(await screen.findByRole('button', { name: '确认导入' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('不支持的数据版本'));
    expect(screen.getByRole('dialog', { name: '数据与备份' })).toBeInTheDocument();
  });

  it('清空数据前二次确认', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <DataMenu
        itemCount={1}
        recordCount={1}
        onClear={onClear}
        onClose={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: '清空本机数据' }));
    expect(onClear).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '确认清空' }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
