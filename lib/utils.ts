import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const hkdFormatter = new Intl.NumberFormat("zh-HK", {
  style: "currency",
  currency: "HKD",
  maximumFractionDigits: 0,
});

/** 1680 → "HK$1,680" */
export function formatHKD(amount: number | string) {
  return hkdFormatter.format(Number(amount));
}

/**
 * WhatsApp 查詢連結：https://wa.me/<號碼>?text=<訊息>
 * number 只保留數字，例如 "852 5555 0123" → "85255550123"
 */
export function whatsappLink(number: string, message?: string) {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

const WEEKDAYS = ["", "一", "二", "三", "四", "五", "六", "日"];

/** ISO weekday（1 = 星期一）→ "星期一" */
export function weekdayLabel(isoWeekday: number) {
  return `星期${WEEKDAYS[isoWeekday] ?? ""}`;
}

/** "11:30:00" → "11:30" */
export function formatTime(time: string) {
  return time.slice(0, 5);
}

/** WhatsApp / 頁面用嘅班名：「小學基礎班（星期六 11:30）」 */
export function classLabel(courseTitle: string, weekday: number, startTime: string) {
  return `${courseTitle}（${weekdayLabel(weekday)} ${formatTime(startTime)}）`;
}

/** "2026-09-05" → "9月5日" */
export function formatDateShort(date: string) {
  const [, m, d] = date.split("-").map(Number);
  return `${m}月${d}日`;
}

/** timestamptz（UTC）→ 香港日期「10月2日」 */
export function formatTimestampDate(ts: string) {
  const d = new Date(ts);
  const [m, day] = d
    .toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" })
    .slice(5)
    .split("-")
    .map(Number);
  return `${m}月${day}日`;
}
