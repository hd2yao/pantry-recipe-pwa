export function buildBackupFileName(today: string): string {
  return `食材管家备份-${today}.json`;
}

export function downloadBackup(serialized: string, today: string) {
  const blob = new Blob([serialized], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildBackupFileName(today);
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
