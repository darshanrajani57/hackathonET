"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

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
  const [liveThreadId] = useState(() => `live-${crypto.randomUUID()}`);
  const [threads, setThreads] = useState(() => [{ id: liveThreadId, title: "Live Chat", messages: [] as ChatMessage[] }, ...mockChatThreads]);
  const [threadId, setThreadId] = useState(liveThreadId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [portfolioContext, setPortfolioContext] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  const currentThread = useMemo(() => threads.find((thread) => thread.id === threadId) ?? threads[0], [threadId, threads]);

  useEffect(() => {
    const symbol = new URLSearchParams(window.location.search).get("symbol");
    if (!symbol) return;
    setInput(`Analyse ${symbol} with latest momentum and filing context`);
  }, []);

  const mutation = useMutation({
    mutationFn: sendChat,
    onSuccess: (response) => {
      setMessages((prev) => {
        const next = [...prev, response];
        setThreads((previous) => previous.map((thread) => (thread.id === threadId ? { ...thread, messages: next } : thread)));
        return next;
      });
    },
  });

  useEffect(() => {
    const el = messageListRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, threadId, mutation.isPending]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setThreads((previous) => previous.map((thread) => (thread.id === threadId ? { ...thread, messages: nextMessages } : thread)));
    setInput("");
    mutation.mutate({
      message: text,
      threadId,
      portfolioContext,
      history: nextMessages.slice(-10).map((item) => ({ role: item.role, content: item.content })),
    });
  };

  const onNewChat = () => {
    const newId = `live-${crypto.randomUUID()}`;
    const newThread = {
      id: newId,
      title: "New Chat",
      messages: [] as ChatMessage[],
    };
    setThreads((previous) => [newThread, ...previous]);
    setThreadId(newId);
    setMessages([]);
    setInput("");
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-[280px_1fr] overflow-hidden">
      <aside className="min-h-0 overflow-auto border-r border-[var(--border-dim)] bg-[var(--bg-surface)] p-3">
        <NeonButton className="mb-3 w-full" type="button" onClick={onNewChat}>
          New Chat
        </NeonButton>
        <div className="space-y-1">
          {threads.map((thread) => (
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

      <section className="flex min-h-0 h-full flex-col">
        <div ref={messageListRef} className="scrollbar-terminal flex-1 space-y-3 overflow-auto p-4">
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

        <form onSubmit={onSubmit} className="shrink-0 border-t border-[var(--border-dim)] bg-[var(--bg-surface)] p-4">
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
