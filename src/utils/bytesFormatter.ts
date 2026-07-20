function formatBytes(bytes: number | undefined, decimals = 2): string {
  if (bytes === undefined || isNaN(bytes) || bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatPercent(value: number | undefined): string {
  if (value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
}

export { formatBytes, formatPercent }