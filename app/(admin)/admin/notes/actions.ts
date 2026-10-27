"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const KINDS = ["health", "schedule", "general"] as const;

/** 加學員備注：RLS 限制教練只可以寫自己班嘅學員 */
export async function addStudentNote(studentId: string, kind: string, body: string) {
  const staff = await requireStaff();
  if (!(KINDS as readonly string[]).includes(kind)) return { error: "備注類型唔正確" };
  const text = body.trim().slice(0, 200);
  if (!text) return { error: "請輸入備注內容" };
  const supabase = await createClient();
  const { error } = await supabase.from("student_notes").insert({ student_id: studentId, kind, body: text, created_by: staff.id });
  if (error) return { error: error.code === "42501" ? "你冇權為呢位學員寫備注" : "暫時未能儲存" };
  revalidatePath("/admin", "layout");
  return {};
}

export async function deleteStudentNote(id: string) {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase.from("student_notes").delete().eq("id", id).select("id");
  if (error || !data?.length) return { error: "只可以刪除自己寫嘅備注" };
  revalidatePath("/admin", "layout");
  return {};
}
