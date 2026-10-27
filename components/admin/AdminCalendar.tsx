import Link from "next/link";
import {
  CALENDAR_VIEWS,
  rangeDays,
  shiftView,
  startOfWeek,
  toMinutes,
  viewRange,
  viewTitle,
  weekdayShort,
  type CalendarView,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

/** 後台日曆（Google Calendar 式）：日 / 週 / 月檢視，上一頁 / 下一頁 / 今日；事件用網址參數切換，唔使 JS */

export type CalEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM[:SS]
  end: string;
  title: string;
  sub?: string;
  href: string;
  /** 同一組顏色（例如同一個課程）用同一個 key */
  colorKey: string;
  cancelled?: boolean;
  badge?: { text: string; tone: "success" | "warning" | "brand" | "muted" };
};

const HOUR_H = 56; // 每小時 56px
const GUTTER = 48; // 左邊時間欄
const PALETTE = [
  "border-l-brand-500 bg-brand-50",
  "border-l-cta bg-cta-soft",
  "border-l-level-starter bg-emerald-50",
  "border-l-level-intermediate bg-violet-50",
];
const BADGE: Record<NonNullable<CalEvent["badge"]>["tone"], string> = {
  success: "text-emerald-700",
  warning: "text-amber-700",
  brand: "text-brand-700",
  muted: "text-ink-muted",
};

function colorOf(key: string) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const hhmm = (t: string) => t.slice(0, 5);

/** 同一日內重疊嘅事件分欄，各佔一部分闊度 */
function layoutDay(events: CalEvent[]) {
  const sorted = [...events].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || toMinutes(b.end) - toMinutes(a.end));
  const placed: { e: CalEvent; lane: number; lanes: number }[] = [];
  let group: typeof placed = [];
  let groupEnd = -1;
  const flush = () => {
    const lanes = Math.max(1, ...group.map((g) => g.lane + 1));
    group.forEach((g) => (g.lanes = lanes));
    placed.push(...group);
    group = [];
  };
  for (const e of sorted) {
    const s = toMinutes(e.start);
    if (group.length && s >= groupEnd) {
      flush();
      groupEnd = -1;
    }
    const taken = new Set(group.filter((g) => toMinutes(g.e.end) > s).map((g) => g.lane));
    let lane = 0;
    while (taken.has(lane)) lane++;
    group.push({ e, lane, lanes: 1 });
    groupEnd = Math.max(groupEnd, toMinutes(e.end));
  }
  if (group.length) flush();
  return placed;
}

function nowHK() {
  const s = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Hong_Kong", hour12: false });
  return toMinutes(s);
}

export function AdminCalendar({
  view,
  date,
  today,
  events,
  buildHref,
}: {
  view: CalendarView;
  date: string;
  today: string;
  events: CalEvent[];
  /** 切換檢視 / 日期時要去邊個網址（保留頁面自己嘅其他參數） */
  buildHref: (view: CalendarView, date: string) => string;
}) {
  const byDate = new Map<string, CalEvent[]>();
  events.forEach((e) => byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]));

  return (
    <div className="rounded-card border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={buildHref(view, today)}
            className={cn(
              "rounded-lg border border-surface-border px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50",
              date === today && "pointer-events-none opacity-50",
            )}
          >
            今日
          </Link>
          <Link href={buildHref(view, shiftView(view, date, -1))} aria-label="上一段" className="rounded-lg px-2.5 py-1.5 text-lg leading-none text-brand-700 hover:bg-brand-50">
            ‹
          </Link>
          <Link href={buildHref(view, shiftView(view, date, 1))} aria-label="下一段" className="rounded-lg px-2.5 py-1.5 text-lg leading-none text-brand-700 hover:bg-brand-50">
            ›
          </Link>
          <h2 className="ml-1 text-base font-bold text-ink sm:text-lg">{viewTitle(view, date)}</h2>
        </div>
        <div role="group" aria-label="檢視" className="inline-flex overflow-hidden rounded-lg border border-surface-border text-sm font-semibold">
          {CALENDAR_VIEWS.map((v) => (
            <Link
              key={v.value}
              href={buildHref(v.value, date)}
              aria-current={v.value === view ? "true" : undefined}
              className={cn("px-3.5 py-1.5", v.value === view ? "bg-brand-700 text-white" : "text-brand-700 hover:bg-brand-50")}
            >
              {v.label}
            </Link>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <MonthGrid date={date} today={today} byDate={byDate} buildHref={buildHref} />
      ) : (
        <TimeGrid
          days={view === "day" ? [date] : rangeDays(startOfWeek(date), 7)}
          today={today}
          byDate={byDate}
          buildHref={buildHref}
          single={view === "day"}
        />
      )}
    </div>
  );
}

function Chip({ e, compact }: { e: CalEvent; compact?: boolean }) {
  return (
    <Link
      href={e.href}
      title={`${hhmm(e.start)}–${hhmm(e.end)} ${e.title}${e.sub ? ` · ${e.sub}` : ""}`}
      className={cn(
        "block truncate rounded border-l-4 px-1.5 py-0.5 text-[11px] leading-tight hover:brightness-95 sm:text-xs",
        colorOf(e.colorKey),
        e.cancelled && "line-through opacity-60",
        compact && "py-0",
      )}
    >
      <span className="font-semibold text-ink">{hhmm(e.start)}</span> <span className="text-ink-muted">{e.title}</span>
    </Link>
  );
}

function MonthGrid({
  date,
  today,
  byDate,
  buildHref,
}: {
  date: string;
  today: string;
  byDate: Map<string, CalEvent[]>;
  buildHref: (view: CalendarView, date: string) => string;
}) {
  const { from, to } = viewRange("month", date);
  const weeks = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000 / 7 + 1 / 7;
  const days = rangeDays(from, Math.round(weeks) * 7);
  const MAX = 3;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-7 border-b border-surface-border bg-surface-muted text-center text-xs font-semibold text-ink-muted">
          {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const items = byDate.get(d) ?? [];
            const inMonth = d.slice(0, 7) === date.slice(0, 7);
            return (
              <div key={d} className={cn("min-h-28 border-b border-r border-surface-border p-1 [&:nth-child(7n)]:border-r-0", !inMonth && "bg-surface-muted/50")}>
                <Link
                  href={buildHref("day", d)}
                  aria-label={`睇 ${d}`}
                  className={cn(
                    "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-brand-50",
                    d === today ? "bg-brand-700 font-bold text-white hover:bg-brand-700" : inMonth ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {Number(d.slice(8))}
                </Link>
                <ul className="space-y-0.5">
                  {items.slice(0, MAX).map((e) => (
                    <li key={e.id}>
                      <Chip e={e} />
                    </li>
                  ))}
                  {items.length > MAX && (
                    <li>
                      <Link href={buildHref("day", d)} className="block px-1.5 text-[11px] font-semibold text-brand-700 hover:underline sm:text-xs">
                        另外 {items.length - MAX} 堂
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimeGrid({
  days,
  today,
  byDate,
  buildHref,
  single,
}: {
  days: string[];
  today: string;
  byDate: Map<string, CalEvent[]>;
  buildHref: (view: CalendarView, date: string) => string;
  single: boolean;
}) {
  const all = days.flatMap((d) => byDate.get(d) ?? []);
  const startHour = Math.max(0, Math.min(8, ...all.map((e) => Math.floor(toMinutes(e.start) / 60))));
  const endHour = Math.min(24, Math.max(21, ...all.map((e) => Math.ceil(toMinutes(e.end) / 60))));
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const height = hours.length * HOUR_H;
  const now = nowHK();
  const showNow = days.includes(today) && now >= startHour * 60 && now <= endHour * 60;
  const cols = days.length;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: single ? 0 : 720 }}>
        {/* 星期 / 日期標題 */}
        <div className="grid border-b border-surface-border bg-surface-muted" style={{ gridTemplateColumns: `${GUTTER}px repeat(${cols}, minmax(0, 1fr))` }}>
          <div />
          {days.map((d) => (
            <Link key={d} href={buildHref("day", d)} className="py-2 text-center hover:bg-brand-50">
              <span className="block text-xs font-semibold text-ink-muted">星期{weekdayShort(d)}</span>
              <span
                className={cn(
                  "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm",
                  d === today ? "bg-brand-700 font-bold text-white" : "font-semibold text-ink",
                )}
              >
                {Number(d.slice(8))}
              </span>
            </Link>
          ))}
        </div>

        <div className="relative grid" style={{ gridTemplateColumns: `${GUTTER}px repeat(${cols}, minmax(0, 1fr))`, height }}>
          {/* 時間標籤 */}
          <div className="relative">
            {hours.map((h, i) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 text-[11px] text-ink-muted" style={{ top: i * HOUR_H, display: i === 0 ? "none" : undefined }}>
                {String(h).padStart(2, "0")}:00
              </span>
            ))}
          </div>

          {days.map((d) => {
            const placed = layoutDay(byDate.get(d) ?? []);
            return (
              <div key={d} className={cn("relative border-l border-surface-border", d === today && "bg-brand-50/40")}>
                {hours.map((h, i) => (
                  <div key={h} className="absolute inset-x-0 border-t border-surface-border/70" style={{ top: i * HOUR_H }} />
                ))}
                {placed.map(({ e, lane, lanes }) => {
                  const top = ((toMinutes(e.start) - startHour * 60) / 60) * HOUR_H;
                  const h = Math.max(((toMinutes(e.end) - toMinutes(e.start)) / 60) * HOUR_H, 24);
                  return (
                    <Link
                      key={e.id}
                      href={e.href}
                      title={`${hhmm(e.start)}–${hhmm(e.end)} ${e.title}${e.sub ? ` · ${e.sub}` : ""}`}
                      className={cn(
                        "absolute overflow-hidden rounded border-l-4 px-1.5 py-1 text-[11px] leading-tight shadow-sm ring-1 ring-white hover:brightness-95 sm:text-xs",
                        colorOf(e.colorKey),
                        e.cancelled && "line-through opacity-60",
                      )}
                      style={{ top: top + 1, height: h - 2, left: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}
                    >
                      <span className="block font-semibold text-ink">
                        {hhmm(e.start)}–{hhmm(e.end)}
                      </span>
                      <span className="block truncate font-medium text-ink">{e.title}</span>
                      {h >= 62 && e.sub && <span className="block truncate text-ink-muted">{e.sub}</span>}
                      {h >= 80 && e.badge && <span className={cn("mt-0.5 block font-semibold", BADGE[e.badge.tone])}>{e.badge.text}</span>}
                    </Link>
                  );
                })}
                {showNow && d === today && (
                  <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: ((now - startHour * 60) / 60) * HOUR_H }}>
                    <span className="-ml-1 h-2 w-2 rounded-full bg-red-500" />
                    <span className="h-px flex-1 bg-red-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
