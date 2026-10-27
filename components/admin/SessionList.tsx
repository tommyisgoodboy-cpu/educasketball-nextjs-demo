import Link from "next/link";
import { Badge as BaseBadge } from "@/components/ui/Badge";
import type { DaySession } from "@/lib/data/admin";
import { formatTime } from "@/lib/utils";

// 狀態標籤唔好斷行
const Badge = (props: React.ComponentProps<typeof BaseBadge>) => <BaseBadge {...props} className="shrink-0 whitespace-nowrap" />;

/** 一日嘅堂：撳入去點名 */
export function SessionList({ sessions, empty }: { sessions: DaySession[]; empty: string }) {
  if (sessions.length === 0) {
    return <p className="rounded-card border border-dashed border-surface-border bg-white p-8 text-center text-sm text-ink-muted">{empty}</p>;
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {sessions.map((s) => {
        const done = s.rosterCount > 0 && s.markedCount >= s.rosterCount;
        return (
          <li key={s.id}>
            <Link
              href={`/admin/attendance/${s.id}`}
              className="flex items-center justify-between gap-4 rounded-card border border-surface-border bg-white p-4 shadow-card transition-shadow hover:shadow-lg"
            >
              <div className="min-w-0">
                <p className="font-semibold text-ink">
                  {formatTime(s.class.start_time)}–{formatTime(s.class.end_time)} · {s.class.course.title}
                </p>
                <p className="truncate text-sm text-ink-muted">
                  {s.class.venue?.name ?? "場地待定"} · {s.class.coach?.name ?? "未有教練"} · {s.rosterCount} 位學員
                </p>
              </div>
              {s.status === "cancelled" ? (
                <Badge>停課</Badge>
              ) : done ? (
                <Badge tone="success">已點名</Badge>
              ) : s.markedCount > 0 ? (
                <Badge tone="warning">
                  已點 {s.markedCount}/{s.rosterCount}
                </Badge>
              ) : (
                <Badge tone="brand">點名 →</Badge>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
