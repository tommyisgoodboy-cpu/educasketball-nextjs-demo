import type { EnrollmentStatus } from "@/lib/supabase/types";

export const ENROLLMENT_FILTERS: { value: EnrollmentStatus | "all"; label: string }[] = [
  { value: "pending", label: "待確認" },
  { value: "waitlist", label: "候補中" },
  { value: "confirmed", label: "已確認" },
  { value: "cancelled", label: "已取消" },
  { value: "all", label: "全部" },
];

export function parseEnrollmentFilters(sp: Record<string, string | undefined>) {
  const status = ENROLLMENT_FILTERS.some((f) => f.value === sp.status) ? (sp.status as EnrollmentStatus | "all") : "pending";
  const classId = /^[0-9a-f-]{36}$/i.test(sp.class ?? "") ? sp.class : undefined;
  const q = (sp.q ?? "").slice(0, 50);
  return { status, classId, q };
}
