import type { ScheduleEntry } from "@/lib/data/account";
import { formatDateShort, formatTime, weekdayLabel } from "@/lib/utils";
import { AttendanceBadge, EnrollmentStatusBadge } from "./StatusBadges";

const isoWeekday = (date: string) => {
  const d = new Date(`${date}T00:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
};

/** 列表檢視：按日期排，每堂一行 */
export function ScheduleList({ entries, today }: { entries: ScheduleEntry[]; today: string }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-surface-border bg-white p-8 text-center text-sm text-ink-muted">
        呢個月冇堂。
      </p>
    );
  }

  return (
    <ul className="divide-y divide-surface-border overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
      {entries.map((e) => (
        <li
          key={`${e.sessionId}:${e.studentId}`}
          className={`flex flex-col gap-2 p-4 sm:flex-row sm:items-center ${e.date === today ? "bg-brand-50/60" : ""}`}
        >
          <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
            <span className="font-bold text-ink">{formatDateShort(e.date)}</span>
            <span className="text-sm text-ink-muted">
              {weekdayLabel(isoWeekday(e.date))} {formatTime(e.startTime)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-semibold text-ink ${e.sessionStatus === "cancelled" ? "line-through" : ""}`}>
              {e.studentName} · {e.courseTitle}
            </p>
            <p className="truncate text-sm text-ink-muted">
              {e.venue ?? "場地待定"}
              {e.coach && ` · ${e.coach} 教練`}
            </p>
          </div>
          <div className="flex gap-2">
            {e.sessionStatus === "cancelled" ? (
              <span className="text-sm text-ink-subtle">已取消</span>
            ) : e.enrollmentStatus === "pending" ? (
              <EnrollmentStatusBadge status="pending" />
            ) : (
              <AttendanceBadge status={e.attendance} isPast={e.date < today} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
