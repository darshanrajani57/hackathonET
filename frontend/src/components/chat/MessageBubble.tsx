import { InlineSparkline } from "@/components/chat/InlineSparkline";
import { ToolCallVisualization } from "@/components/chat/ToolCallVisualization";
import { ChatMessage } from "@/lib/types";

const symbolMap = ["RELIANCE", "TCS", "HDFC", "NIFTY50"] as const;

export function MessageBubble({ message }: { message: ChatMessage }) {
  const user = message.role === "user";
  const matchedSymbol = symbolMap.find((symbol) => message.content.toUpperCase().includes(symbol));

  return (
    <div className={`flex ${user ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-2xl rounded-lg border p-3 text-sm ${
          user
            ? "border-[var(--accent-blue-dim)] bg-[var(--accent-blue-dim)] text-[var(--text-primary)]"
            : "border-[var(--border-dim)] bg-[var(--bg-card)] text-[var(--text-data)]"
        }`}
      >
        {!user && message.model && (
          <span className="mb-2 inline-flex rounded border border-[var(--border-bright)] px-2 py-0.5 font-data text-[10px] text-[var(--accent-green)]">
            {message.model}
          </span>
        )}

        {!user && message.thinking && (
          <p className="mb-2 rounded border border-[var(--border-dim)] bg-[var(--bg-surface)] p-2 text-xs italic text-[var(--text-secondary)]">
            {message.thinking}
          </p>
        )}

        <p>{message.content}</p>

        {!user && matchedSymbol && <InlineSparkline symbol={matchedSymbol} />}

        {!user && message.toolCall && <ToolCallVisualization toolCall={message.toolCall} />}

        {!user && message.citations && message.citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--accent-blue)]">
            {message.citations.map((citation, index) => (
              <a key={citation.href} href={citation.href} target="_blank" rel="noreferrer">
                [{index + 1}] {citation.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
