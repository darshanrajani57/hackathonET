import { Suspense } from "react";

import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-[var(--text-secondary)]">Loading chat…</div>}>
      <ChatInterface />
    </Suspense>
  );
}
