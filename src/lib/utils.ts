import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatNumber(value: number | string, decimals = 2): string {
  const num = Number(value);
  if (isNaN(num)) return "-";
  return num.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
