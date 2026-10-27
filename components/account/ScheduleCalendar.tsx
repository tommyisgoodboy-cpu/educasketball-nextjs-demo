import type { ScheduleEntry } from "@/lib/data/account";
import { cn, formatTime } from "@/lib/utils";
import { AttendanceBadge } from "./StatusBadges";

const HEAD = ["一", "二", "三", "四", "五", "六", "日"];
const STUDENT_COLORS = ["border-l-brand-500 bg-brand-50", "border-l-cta bg-cta-soft", "border-l-level-starter bg-emerald-50", "border-l-level-intermediate bg-violet-50"];

/** 月曆檢視：一個月一格一日，星期一開頭 */
export function ScheduleCalendar({
  month,
  entries,
  today,
  studentOrder,
}: {
  month: string; // YYYY-MM
  entries: ScheduleEntry[];
  today: string;
  studentOrder: string[];
}) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // 星期一 = 0
  const cells = Array.from({ length: Math.ceil((lead + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - lead + 1;
    return day >= 1 && day <= daysInMonth ? `${month}-${String(day).padStart(2, "0")}` : null;
  });

  const byDate = new Map<string, ScheduleEntry[]>();
  entries.forEach((e) => byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]));

  return (
    <div className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
      <div className="grid grid-cols-7 border-b border-surface-border bg-surface-muted text-center text-xs font-semibold text-ink-muted">
        {HEAD.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          const items = date ? (byDate.get(date) ?? []) : [];
          return (
            <div
              key={i}
              className={cn(
                "min-h-20 border-b border-r border-surface-border p-1 sm:min-h-28 sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                !date && "bg-surface-muted/50",
              )}
            >
              {date && (
                <>
                  <p
                    className={cn(
                      "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      date === today ? "bg-brand-700 font-bold text-white" : "text-ink-muted",
                    )}
                  >
                    {Number(date.slice(8))}
                  </p>
                  <ul className="space-y-1">
                    {items.map((e) => (
                      <li
                        key={`${e.sessionId}:${e.studentId}`}
                        title={`${e.studentName} · ${e.courseTitle} ${formatTime(e.startTime)}`}
                        className={cn(
                          "rounded border-l-4 px-1 py-0.5 text-[11px] leading-tight sm:px-1.5 sm:text-xs",
                          STUDENT_COLORS[studentOrder.indexOf(e.studentId) % STUDENT_COLORS.length],
                          e.sessionStatus === "cancelled" && "line-through opacity-60",
                        )}
                      >
                        <span className="block font-semibold text-ink">{formatTime(e.startTime)}</span>
                        <span className="hidden truncate text-ink-muted sm:block">
                          {e.studentName} · {e.courseTitle}
                        </span>
                        <span className="mt-0.5 hidden sm:block">
                          <AttendanceBadge status={e.attendance} isPast={e.date < today} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
