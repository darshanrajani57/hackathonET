export function FilingAlert({ title, source }: { title: string; source: string }) {
  return (
    <div className="rounded-md border border-[var(--border-dim)] bg-[var(--bg-surface)] p-2">
      <p className="text-xs text-[var(--text-data)]">{title}</p>
      <p className="mt-1 text-[10px] text-[var(--accent-blue)]">{source}</p>
    </div>
  );
}
