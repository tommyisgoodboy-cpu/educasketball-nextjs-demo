"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type StudentFormState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

function read(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    birth_year: Number(formData.get("birth_year")),
    years_playing: Number(formData.get("years_playing") ?? 0),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

function validate(v: ReturnType<typeof read>) {
  const year = new Date().getFullYear();
  const errors: Record<string, string> = {};
  if (!v.name) errors.name = "請填寫學員姓名";
  if (v.name.length > 100) errors.name = "姓名太長";
  if (!Number.isInteger(v.birth_year) || v.birth_year < year - 80 || v.birth_year > year - 3) {
    errors.birth_year = `請填寫 ${year - 80}–${year - 3} 之間嘅出生年份`;
  }
  if (!Number.isInteger(v.years_playing) || v.years_playing < 0 || v.years_playing > 60) errors.years_playing = "球齡唔正確";
  if ((v.notes ?? "").length > 1000) errors.notes = "備註唔可以多過 1000 字";
  return errors;
}

/** 新增或修改學員：有 id 就係修改。RLS 保證只可以改自己嘅學員。 */
export async function saveStudent(_prev: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "請重新登入" };

  const values = read(formData);
  const fieldErrors = validate(values);
  if (Object.keys(fieldErrors).length > 0) return { status: "error", message: "請檢查以下資料", fieldErrors };

  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const { error } = id
    ? await supabase.from("students").update(values).eq("id", id).eq("parent_id", user.id)
    : await supabase.from("students").insert({ ...values, parent_id: user.id });

  if (error) {
    console.error("saveStudent failed", error);
    return { status: "error", message: "暫時未能儲存，請稍後再試" };
  }
  revalidatePath("/account", "layout");
  return { status: "saved" };
}

export async function deleteStudent(id: string): Promise<{ error?: string }> {
  const user = await getUser();
  if (!user) return { error: "請重新登入" };
  const supabase = await createClient();

  // 有報名紀錄就唔畀刪（會連報名、出席一齊刪走）
  const { count } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("student_id", id)
    .neq("status", "cancelled");
  if ((count ?? 0) > 0) return { error: "呢位學員有報名紀錄，唔可以刪除。如需更改請 WhatsApp 我哋。" };

  const { error } = await supabase.from("students").delete().eq("id", id).eq("parent_id", user.id);
  if (error) {
    console.error("deleteStudent failed", error);
    return { error: "暫時未能刪除，請稍後再試" };
  }
  revalidatePath("/account", "layout");
  return {};
}
