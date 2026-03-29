"use client";

import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { useMemo, useState } from "react";

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export function DataTable<T extends object>({
  data,
  columns,
}: {
  data: T[];
  columns: Column<T>[];
}) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortDir, sortKey]);

  return (
    <div className="overflow-hidden rounded-md border border-[var(--border-dim)]">
      <table className="w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
          <tr>
            {columns.map((column) => {
              const active = sortKey === column.key;
              return (
                <th key={String(column.key)} className="border-b border-[var(--border-dim)] px-3 py-2 font-medium">
                  <button
                    className="inline-flex items-center gap-1"
                    onClick={() => {
                      if (sortKey === column.key) {
                        setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
                      } else {
                        setSortKey(column.key);
                        setSortDir("desc");
                      }
                    }}
                  >
                    {column.label}
                    {active &&
                      (sortDir === "asc" ? (
                        <ArrowUpNarrowWide className="size-3" />
                      ) : (
                        <ArrowDownWideNarrow className="size-3" />
                      ))}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 ? "bg-[var(--bg-card)]" : "bg-[var(--bg-surface)]"}>
              {columns.map((column) => (
                <td key={String(column.key)} className="px-3 py-2 text-[var(--text-data)]">
                  {column.render ? column.render(row[column.key], row) : (row[column.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
