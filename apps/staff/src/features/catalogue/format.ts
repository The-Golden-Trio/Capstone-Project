export function foldVietnamese(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}
export function formatDate(value?: string | null): string {
  if (!value || Number.isNaN(Date.parse(value))) return 'Chưa có dữ liệu';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}
export function percent(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}
export function lineDiff(before: string, after: string) {
  const oldLines = before.split('\n');
  const newLines = after.split('\n');
  const changes: Array<{ type: 'removed' | 'added' | 'same'; text: string }> =
    [];
  let oldIndex = 0;
  let newIndex = 0;
  // Giữ đúng thứ tự và số lần lặp của dòng, kể cả khi một dòng bị di chuyển.
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (
      oldIndex < oldLines.length &&
      newIndex < newLines.length &&
      oldLines[oldIndex] === newLines[newIndex]
    ) {
      changes.push({ type: 'same', text: oldLines[oldIndex++] });
      newIndex++;
    } else if (
      oldIndex < oldLines.length &&
      (newIndex === newLines.length ||
        newLines.indexOf(oldLines[oldIndex], newIndex) === -1)
    ) {
      changes.push({ type: 'removed', text: oldLines[oldIndex++] });
    } else if (newIndex < newLines.length) {
      changes.push({ type: 'added', text: newLines[newIndex++] });
    }
  }
  return changes;
}
