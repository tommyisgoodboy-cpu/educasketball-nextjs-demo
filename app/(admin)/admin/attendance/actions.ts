"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/lib/supabase/types";

const STATUSES: AttendanceStatus[] = ["present", "absent", "leave"];

/** 點名：upsert 一個學員喺一堂嘅出席。RLS 限制教練只可以點自己班。出席積分由 DB trigger 處理。 */
export async function markAttendance(sessionId: string, studentId: string, status: AttendanceStatus) {
  const staff = await requireStaff();
  if (!STATUSES.includes(status)) return { error: "狀態唔正確" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("attendance")
    .upsert(
      { session_id: sessionId, student_id: studentId, status, marked_by: staff.id },
      { onConflict: "session_id,student_id" },
    );
  if (error) {
    console.error("markAttendance failed", error);
    return { error: error.code === "42501" ? "你冇權為呢堂點名" : "暫時未能儲存，請再試一次" };
  }
  revalidatePath(`/admin/attendance/${sessionId}`);
  revalidatePath("/admin");
  revalidatePath("/account", "layout");
  return {};
}

/** 全部未點名嘅學員設為出席 */
export async function markAllPresent(sessionId: string, studentIds: string[]) {
  const staff = await requireStaff();
  if (studentIds.length === 0) return {};
  const supabase = await createClient();
  const { error } = await supabase.from("attendance").upsert(
    studentIds.map((id) => ({ session_id: sessionId, student_id: id, status: "present" as const, marked_by: staff.id })),
    { onConflict: "session_id,student_id" },
  );
  if (error) {
    console.error("markAllPresent failed", error);
    return { error: "暫時未能儲存，請再試一次" };
  }
  revalidatePath(`/admin/attendance/${sessionId}`);
  revalidatePath("/admin");
  revalidatePath("/account", "layout");
  return {};
}
