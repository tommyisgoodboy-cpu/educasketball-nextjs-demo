import Link from "next/link";
import { EnrollmentActions } from "@/components/admin/EnrollmentActions";
import { Badge } from "@/components/ui/Badge";
import type { AdminEnrollment } from "@/lib/data/admin";
import type { EnrollmentStatus } from "@/lib/supabase/types";
import { cn, formatTime, formatTimestampDate, weekdayLabel } from "@/lib/utils";

// Jira 式看板：每個狀態一欄，卡片上直接做「確認 / 候補轉正 / 取消」，唔使入去詳情
const MAX_PER_COLUMN = 20; // 每欄最多顯示咁多張卡，其餘去列表睇

const COLUMNS: { status: EnrollmentStatus; label: string; hint: string; bar: string }[] = [
  { status: "pending", label: "待確認", hint: "等你核實付款後確認", bar: "border-t-amber-400" },
  { status: "waitlist", label: "候補中", hint: "有位時轉正", bar: "border-t-cta" },
  { status: "confirmed", label: "已確認", hint: "已有名額", bar: "border-t-emerald-500" },
  { status: "cancelled", label: "已取消", hint: "可以恢復", bar: "border-t-slate-300" },
];

export function EnrollmentBoard({
  rows,
  fullClassIds,
}: {
  rows: AdminEnrollment[];
  fullClassIds: Set<string>;
}) {
  return (
    <div className="-mx-1 overflow-x-auto pb-2">
      <div className="grid min-w-[880px] grid-cols-4 gap-3 px-1">
        {COLUMNS.map((col) => {
          const all = rows.filter((r) => r.status === col.status);
          const cards = all.slice(0, MAX_PER_COLUMN);
          return (
            <section key={col.status} aria-label={col.label} className={cn("rounded-card border border-surface-border border-t-4 bg-surface-muted/60", col.bar)}>
              <header className="flex items-baseline justify-between px-3 pb-1 pt-3">
                <h2 className="text-sm font-bold text-ink">
                  {col.label} <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink-muted">{all.length}</span>
                </h2>
                <p className="text-[11px] text-ink-subtle">{col.hint}</p>
              </header>
              <ul className="space-y-2 p-2">
                {all.length === 0 && <li className="rounded-lg border border-dashed border-surface-border px-3 py-6 text-center text-xs text-ink-subtle">冇報名</li>}
                {cards.map((e) => (
                  <li key={e.id} className="rounded-lg border border-surface-border bg-white p-3 shadow-card">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-ink">{e.student.name}</p>
                      <span className="shrink-0 text-[11px] text-ink-subtle">{formatTimestampDate(e.created_at)}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {e.class.course.title} · {weekdayLabel(e.class.weekday)} {formatTime(e.class.start_time)}
                    </p>
                    <p className="text-xs text-ink-subtle">{e.class.venue?.name ?? "場地未定"}</p>
                    <p className="mt-2 text-xs text-ink-muted">
                      {e.parent_name ?? "—"} · {e.parent_phone}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge tone="neutral">{e.student.parent_id ? "會員" : "訪客"}</Badge>
                      {e.payment_status === "paid" ? <Badge tone="success">已付款</Badge> : <Badge tone="warning">未付款</Badge>}
                      {fullClassIds.has(e.class.id) && <Badge tone="danger">班已滿</Badge>}
                    </div>
                    {e.notes && <p className="mt-2 rounded bg-surface-muted px-2 py-1 text-xs text-ink-muted">備註：{e.notes}</p>}
                    <div className="mt-3 border-t border-surface-border pt-2">
                      <EnrollmentActions id={e.id} status={e.status} studentName={e.student.name} isFull={fullClassIds.has(e.class.id)} />
                    </div>
                  </li>
                ))}
                {all.length > cards.length && (
                  <li className="px-1 pb-1 pt-2 text-center text-xs">
                    <Link href={`/admin/enrollments?status=${col.status}`} className="font-semibold text-brand-700 hover:underline">
                      另外 {all.length - cards.length} 個，去列表睇 →
                    </Link>
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
