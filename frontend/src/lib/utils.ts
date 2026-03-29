import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function relativeTime(minutesAgo: number) {
  if (minutesAgo < 60) {
    return `${minutesAgo} min ago`;
  }
  const hours = Math.floor(minutesAgo / 60);
  return `${hours}h ago`;
}
