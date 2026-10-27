"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentStatus } from "@/lib/supabase/types";

const ALLOWED: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  waitlist: ["confirmed", "pending", "cancelled"],
  confirmed: ["cancelled"],
  cancelled: ["pending"],
};

/** 改報名狀態：確認、取消、候補轉正。首次報名積分由 DB trigger 處理。 */
export async function setEnrollmentStatus(id: string, to: EnrollmentStatus) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: current, error: readError } = await supabase
    .from("enrollments")
    .select("status, class_id, student_id")
    .eq("id", id)
    .single();
  if (readError || !current) return { error: "搵唔到呢個報名" };
  if (!ALLOWED[current.status].includes(to)) return { error: "唔可以由目前狀態改做呢個狀態" };

  // 由已取消恢復：同一學員同一班唔可以有兩個有效報名
  if (current.status === "cancelled") {
    const { count } = await supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("class_id", current.class_id)
      .eq("student_id", current.student_id)
      .neq("status", "cancelled");
    if ((count ?? 0) > 0) return { error: "呢位學員喺呢班已經有另一個有效報名" };
  }

  const { error } = await supabase.from("enrollments").update({ status: to }).eq("id", id);
  if (error) {
    console.error("setEnrollmentStatus failed", error);
    return { error: "暫時未能更新，請再試一次" };
  }
  revalidatePath("/", "layout");
  return {};
}
