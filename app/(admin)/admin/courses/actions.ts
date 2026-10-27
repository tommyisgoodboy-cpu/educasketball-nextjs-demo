"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { AGE_GROUP_LABELS, SKILL_LEVEL_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { AgeGroup, SkillLevel } from "@/lib/supabase/types";

export type FormState = { status: "idle" } | { status: "success"; redirectTo: string } | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export async function saveCourse(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const values = {
    title: String(formData.get("title") ?? "").trim(),
    age_group: String(formData.get("age_group") ?? "") as AgeGroup,
    level: String(formData.get("level") ?? "") as SkillLevel,
    description: String(formData.get("description") ?? "").trim() || null,
    price: Number(formData.get("price")),
    sessions_count: Number(formData.get("sessions_count")),
    is_active: formData.get("is_active") === "on",
    default_coach_id: String(formData.get("default_coach_id") ?? "") || null,
  };

  const errors: Record<string, string> = {};
  if (!values.title) errors.title = "請填寫課程名稱";
  if (!(values.age_group in AGE_GROUP_LABELS)) errors.age_group = "請揀年齡組別";
  if (!(values.level in SKILL_LEVEL_LABELS)) errors.level = "請揀技術等級";
  if (!Number.isFinite(values.price) || values.price < 0) errors.price = "收費唔正確";
  if (!Number.isInteger(values.sessions_count) || values.sessions_count < 1 || values.sessions_count > 100) errors.sessions_count = "堂數要係 1–100";
  if (values.default_coach_id && !/^[0-9a-f-]{36}$/i.test(values.default_coach_id)) errors.default_coach_id = "教練唔正確";
  if (Object.keys(errors).length) return { status: "error", message: "請檢查以下資料", fieldErrors: errors };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("courses").update(values).eq("id", id)
    : await supabase.from("courses").insert(values);
  if (error) {
    console.error("saveCourse failed", error);
    return { status: "error", message: "暫時未能儲存，請再試一次" };
  }
  revalidatePath("/", "layout");
  return { status: "success", redirectTo: "/admin/courses" };
}

export async function toggleCourseActive(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("courses").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: "暫時未能更新" };
  revalidatePath("/", "layout");
  return {};
}
