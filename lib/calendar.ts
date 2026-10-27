// 後台日曆用嘅日期工具：全部用 "YYYY-MM-DD" 字串，以 UTC 計日子，避免時區跳日。

export type CalendarView = "day" | "week" | "month";

export const CALENDAR_VIEWS: { value: CalendarView; label: string }[] = [
  { value: "day", label: "日" },
  { value: "week", label: "週" },
  { value: "month", label: "月" },
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseView(raw: string | undefined, fallback: CalendarView): CalendarView {
  return raw === "day" || raw === "week" || raw === "month" ? raw : fallback;
}

export function parseDateOr(raw: string | undefined, fallback: string): string {
  return raw && DATE_RE.test(raw) && !Number.isNaN(Date.parse(raw)) ? raw : fallback;
}

const toDate = (s: string) => new Date(`${s}T00:00:00Z`);
const toStr = (d: Date) => d.toISOString().slice(0, 10);

export function addDays(date: string, n: number) {
  const d = toDate(date);
  d.setUTCDate(d.getUTCDate() + n);
  return toStr(d);
}

export function addMonths(date: string, n: number) {
  const d = toDate(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return toStr(d);
}

/** ISO 星期：一 = 1 … 日 = 7 */
export function isoWeekday(date: string) {
  return ((toDate(date).getUTCDay() + 6) % 7) + 1;
}

export function startOfWeek(date: string) {
  return addDays(date, 1 - isoWeekday(date));
}

/** 呢個檢視要讀嘅日期範圍（月檢視包埋頭尾補位嘅日子） */
export function viewRange(view: CalendarView, date: string): { from: string; to: string } {
  if (view === "day") return { from: date, to: date };
  if (view === "week") {
    const from = startOfWeek(date);
    return { from, to: addDays(from, 6) };
  }
  const first = `${date.slice(0, 7)}-01`;
  const lastDay = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0)).getUTCDate();
  const last = `${date.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`;
  const from = startOfWeek(first);
  return { from, to: addDays(startOfWeek(last), 6) };
}

/** 上一個 / 下一個（按檢視跳 1 日 / 1 週 / 1 個月） */
export function shiftView(view: CalendarView, date: string, dir: -1 | 1) {
  if (view === "day") return addDays(date, dir);
  if (view === "week") return addDays(date, 7 * dir);
  return addMonths(date, dir);
}

export function rangeDays(from: string, count: number) {
  return Array.from({ length: count }, (_, i) => addDays(from, i));
}

const WD = ["一", "二", "三", "四", "五", "六", "日"];
export const weekdayShort = (date: string) => WD[isoWeekday(date) - 1];

const md = (d: string) => `${Number(d.slice(5, 7))}月${Number(d.slice(8))}日`;

export function viewTitle(view: CalendarView, date: string) {
  if (view === "month") return `${date.slice(0, 4)}年${Number(date.slice(5, 7))}月`;
  if (view === "day") return `${date.slice(0, 4)}年${md(date)}（星期${weekdayShort(date)}）`;
  const { from, to } = viewRange("week", date);
  return `${from.slice(0, 4)}年${md(from)} – ${from.slice(5, 7) === to.slice(5, 7) ? Number(to.slice(8)) + "日" : md(to)}`;
}

/** "HH:MM" → 分鐘 */
export const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
