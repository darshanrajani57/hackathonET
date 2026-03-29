import { Pattern } from "@/lib/types";

export function PatternOverlay({ patterns }: { patterns: Pattern[] }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {patterns.slice(0, 3).map((pattern, index) => (
        <div
          key={pattern.id}
          className="absolute rounded border border-[var(--accent-green-dim)] bg-[var(--accent-green-dim)] px-2 py-1 text-[10px] text-[var(--accent-green)]"
          style={{ top: `${20 + index * 18}%`, left: `${10 + index * 20}%` }}
        >
          {pattern.name}
        </div>
      ))}
    </div>
  );
}
