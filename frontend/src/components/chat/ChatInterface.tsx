"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { MessageBubble } from "@/components/chat/MessageBubble";
import { ThinkingStream } from "@/components/chat/ThinkingStream";
import { NeonButton } from "@/components/shared/NeonButton";
import { sendChat } from "@/lib/api";
import { mockChatThreads } from "@/lib/mock/chat-responses";
import { ChatMessage } from "@/lib/types";

const quickActions = [
  "Analyse my portfolio",
  "Today's top signals",
  "Explain India VIX",
  "Best sector today",
];

export function ChatInterface() {
  const [threadId, setThreadId] = useState(mockChatThreads[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatThreads[0].messages);
  const [input, setInput] = useState("");
  const [portfolioContext, setPortfolioContext] = useState(true);

  const currentThread = useMemo(() => mockChatThreads.find((thread) => thread.id === threadId) ?? mockChatThreads[0], [threadId]);

  const mutation = useMutation({
    mutationFn: sendChat,
    onSuccess: (response) => {
      setMessages((prev) => [...prev, response]);
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    mutation.mutate(text);
  };

  return (
    <div className="grid h-[calc(100vh-78px)] grid-cols-[280px_1fr] overflow-hidden">
      <aside className="border-r border-[var(--border-dim)] bg-[var(--bg-surface)] p-3">
        <NeonButton className="mb-3 w-full">New Chat</NeonButton>
        <div className="space-y-1">
          {mockChatThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => {
                setThreadId(thread.id);
                setMessages(thread.messages);
              }}
              className={`w-full rounded-md px-3 py-2 text-left text-xs ${thread.id === currentThread.id ? "bg-[var(--bg-card)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
            >
              {thread.title}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex h-full flex-col">
        <div className="scrollbar-terminal flex-1 space-y-3 overflow-auto p-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.24 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
          <ThinkingStream active={mutation.isPending} sourceText="Parsing your question, correlating sector breadth, implied volatility, and filing-backed event clusters before generating the final answer..." />
        </div>

        <form onSubmit={onSubmit} className="border-t border-[var(--border-dim)] bg-[var(--bg-surface)] p-4">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about any stock, sector, or market event..."
            className="h-24 w-full rounded-md border border-[var(--border-dim)] bg-[var(--bg-card)] p-3 text-sm outline-none placeholder:text-[var(--text-tertiary)]"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => setInput(action)}
                  className="rounded-full border border-[var(--border-dim)] px-2 py-1 text-[10px] text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--accent-green-dim)] hover:text-[var(--accent-green)]"
                >
                  {action}
                </button>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={portfolioContext}
                onChange={(event) => setPortfolioContext(event.target.checked)}
              />
              Portfolio context active
            </label>
          </div>
          <div className="mt-3 flex justify-end">
            <NeonButton
              type="submit"
              className="inline-flex items-center gap-2 shadow-[0_0_18px_var(--accent-green-dim)]"
              disabled={mutation.isPending}
            >
              Send <Send className="size-3" />
            </NeonButton>
          </div>
        </form>
      </section>
    </div>
  );
}
