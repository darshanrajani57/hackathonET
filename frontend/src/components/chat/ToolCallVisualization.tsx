"use client";

import { ChevronDown, Wrench } from "lucide-react";
import { useState } from "react";

import { ChatToolCall } from "@/lib/types";

export function ToolCallVisualization({ toolCall }: { toolCall: ChatToolCall }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 rounded-md border border-[var(--border-dim)] bg-[var(--bg-base)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs text-[var(--text-secondary)]"
      >
        <span className="inline-flex items-center gap-2">
          <Wrench className="size-3" />
          Tool Used: {toolCall.name}
        </span>
        <ChevronDown className={`size-3 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <pre className="overflow-auto border-t border-[var(--border-dim)] p-3 font-data text-[10px] text-[var(--text-data)]">
{JSON.stringify(toolCall, null, 2)}
        </pre>
      )}
    </div>
  );
}
