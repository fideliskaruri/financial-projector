export function formatKES(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toLocaleString('en-KE');
  return amount < 0 ? `-KES ${formatted}` : `KES ${formatted}`;
}

export function formatCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`;
  }
  return Math.round(amount).toString();
}
