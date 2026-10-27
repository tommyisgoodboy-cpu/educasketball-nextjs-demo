"use client";

import { useOptimistic, useTransition } from "react";
import { markAllPresent, markAttendance } from "@/app/(admin)/admin/attendance/actions";
import { StudentNotes } from "@/components/admin/StudentNotes";
import { BadgeManager } from "@/components/badges/BadgeManager";
import { LevelBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { RosterEntry } from "@/lib/data/admin";
import type { AttendanceStatus, SkillLevel } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const OPTIONS: { value: AttendanceStatus; label: string; on: string }[] = [
  { value: "present", label: "出席", on: "bg-emerald-600 text-white border-emerald-600" },
  { value: "absent", label: "缺席", on: "bg-red-600 text-white border-red-600" },
  { value: "leave", label: "請假", on: "bg-amber-500 text-white border-amber-500" },
];

/** 點名表：撳即時儲存（optimistic），出錯就還原同提示 */
export function RosterTable({ sessionId, roster, disabled, viewerId, isAdmin }: { sessionId: string; roster: RosterEntry[]; disabled?: boolean; viewerId: string; isAdmin: boolean }) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    roster,
    (state, update: { studentIds: string[]; status: AttendanceStatus }) =>
      state.map((r) => (update.studentIds.includes(r.studentId) ? { ...r, attendance: update.status } : r)),
  );

  const unmarked = optimistic.filter((r) => !r.attendance).map((r) => r.studentId);
  const present = optimistic.filter((r) => r.attendance === "present").length;

  function mark(studentId: string, status: AttendanceStatus) {
    startTransition(async () => {
      setOptimistic({ studentIds: [studentId], status });
      const result = await markAttendance(sessionId, studentId, status);
      if (result.error) alert(result.error);
    });
  }

  function markAll() {
    startTransition(async () => {
      setOptimistic({ studentIds: unmarked, status: "present" });
      const result = await markAllPresent(sessionId, unmarked);
      if (result.error) alert(result.error);
    });
  }

  if (roster.length === 0) {
    return <p className="rounded-card border border-dashed border-surface-border bg-white p-8 text-center text-sm text-ink-muted">呢班未有已確認嘅學員。</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted" aria-live="polite">
          出席 {present} / {optimistic.length} · 未點 {unmarked.length}
          {pending && " · 儲存中…"}
        </p>
        <Button size="sm" onClick={markAll} disabled={disabled || unmarked.length === 0}>
          未點名嘅全部設為出席
        </Button>
      </div>
      <ul className="divide-y divide-surface-border overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
        {optimistic.map((r) => (
          <li key={r.studentId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-ink">{r.name}</span>
                <span className="text-sm text-ink-muted">{new Date().getFullYear() - r.birthYear} 歲</span>
                <LevelBadge level={r.level as SkillLevel} />
              </div>
              <BadgeManager studentId={r.studentId} studentName={r.name} badges={r.badges} viewerId={viewerId} isAdmin={isAdmin} />
              <StudentNotes studentId={r.studentId} studentName={r.name} notes={r.notes} viewerId={viewerId} isAdmin={isAdmin} />
            </div>
            <div role="radiogroup" aria-label={`${r.name} 出席狀態`} className="flex gap-2">
              {OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={r.attendance === o.value}
                  disabled={disabled}
                  onClick={() => mark(r.studentId, o.value)}
                  className={cn(
                    "h-10 min-w-16 rounded-lg border px-3 text-sm font-semibold transition-colors disabled:opacity-50",
                    r.attendance === o.value ? o.on : "border-surface-border bg-white text-ink-muted hover:bg-surface-muted",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
