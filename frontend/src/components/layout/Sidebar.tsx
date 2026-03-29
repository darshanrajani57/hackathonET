"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BriefcaseBusiness,
  CandlestickChart,
  Grid2x2,
  MessageSquare,
  Radar,
  Video,
} from "lucide-react";

import { useMarketStore } from "@/lib/store/market-store";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", href: "/", icon: Grid2x2 },
  { label: "Opportunity Radar", href: "/radar", icon: Radar },
  { label: "Chart Intelligence", href: "/charts", icon: CandlestickChart },
  { label: "Market Chat", href: "/chat", icon: MessageSquare },
  { label: "Portfolio", href: "/portfolio", icon: BriefcaseBusiness },
  { label: "Video Engine", href: "/video", icon: Video },
];

export function Sidebar() {
  const pathname = usePathname();
  const status = useMarketStore((state) => state.connectionStatus);

  return (
    <aside className="group/sidebar flex h-screen w-16 shrink-0 flex-col border-r border-[var(--border-dim)] bg-[var(--bg-surface)] transition-all duration-200 hover:w-[220px]">
      <div className="flex h-14 items-center gap-2 border-b border-[var(--border-dim)] px-4">
        <Activity className="size-4 text-[var(--accent-green)]" />
        <span className="font-display text-xs opacity-0 transition-opacity group-hover/sidebar:opacity-100">
          FintelOS
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md border border-transparent px-3 text-sm text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--border-bright)] hover:text-[var(--text-primary)]",
                active &&
                  "border-[var(--accent-green-dim)] bg-[var(--accent-green-dim)] text-[var(--accent-green)]",
              )}
            >
              <Icon className="size-4" />
              <span className="whitespace-nowrap opacity-0 transition-opacity group-hover/sidebar:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--border-dim)] p-3">
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
          <span
            className={cn(
              "inline-block size-2 rounded-full",
              status === "connected" && "bg-[var(--accent-green)] shadow-[0_0_10px_var(--accent-green)]",
              status === "disconnected" && "bg-[var(--accent-red)]",
              status === "reconnecting" && "animate-pulse bg-[var(--accent-amber)]",
            )}
          />
          <span className="uppercase opacity-0 group-hover/sidebar:opacity-100">Live data {status}</span>
        </div>
      </div>
    </aside>
  );
}
