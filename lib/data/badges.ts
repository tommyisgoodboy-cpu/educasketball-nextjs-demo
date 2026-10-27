import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BadgeKey } from "@/lib/constants";

export type StudentBadge = { id: string; student_id: string; badge_key: BadgeKey; note: string | null; created_at: string; awarded_by: string | null };

/** 按學員分組；RLS 決定睇唔睇到 */
export async function getBadgesByStudent(studentIds: string[]) {
  const map = new Map<string, StudentBadge[]>();
  if (studentIds.length === 0) return map;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_badges")
    .select("id, student_id, badge_key, note, created_at, awarded_by")
    .in("student_id", studentIds)
    .order("created_at");
  if (error) throw error;
  for (const b of data as StudentBadge[]) map.set(b.student_id, [...(map.get(b.student_id) ?? []), b]);
  return map;
}
