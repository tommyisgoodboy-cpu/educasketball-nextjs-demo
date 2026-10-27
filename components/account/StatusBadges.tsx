import { Badge } from "@/components/ui/Badge";
import { ENROLLMENT_STATUS_LABELS } from "@/lib/constants";
import type { AttendanceStatus, EnrollmentStatus } from "@/lib/supabase/types";

const enrollmentTone = { pending: "warning", confirmed: "success", waitlist: "cta", cancelled: "neutral" } as const;

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return <Badge tone={enrollmentTone[status]}>{ENROLLMENT_STATUS_LABELS[status]}</Badge>;
}

const ATTENDANCE = {
  present: { label: "出席", tone: "success" },
  absent: { label: "缺席", tone: "danger" },
  leave: { label: "請假", tone: "warning" },
} as const;

/** 出席狀態；未點名嘅過去堂數顯示「未點名」，未嚟嘅堂顯示「未上」 */
export function AttendanceBadge({ status, isPast }: { status: AttendanceStatus | null; isPast: boolean }) {
  if (status) return <Badge tone={ATTENDANCE[status].tone}>{ATTENDANCE[status].label}</Badge>;
  return <Badge tone="neutral">{isPast ? "未點名" : "未上"}</Badge>;
}
