export function InsiderTradeRow({
  name,
  value,
  date,
}: {
  name: string;
  value: string;
  date: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[var(--border-dim)] bg-[var(--bg-surface)] px-2 py-1.5 text-xs">
      <span className="text-[var(--text-data)]">{name}</span>
      <span className="font-data text-[var(--accent-green)]">{value}</span>
      <span className="text-[var(--text-secondary)]">{date}</span>
    </div>
  );
}
