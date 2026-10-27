"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "../courses/actions";

const UUID = /^[0-9a-f-]{36}$/i;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 新增 / 編輯班次。儲存後 DB trigger 會按日期同星期自動生成每一堂。 */
export async function saveClass(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const id = get("id");
  const values = {
    course_id: get("course_id"),
    coach_id: get("coach_id") || null,
    venue_id: get("venue_id") || null,
    weekday: Number(get("weekday")),
    start_time: get("start_time"),
    end_time: get("end_time"),
    start_date: get("start_date"),
    end_date: get("end_date"),
    capacity: Number(get("capacity")),
  };

  const errors: Record<string, string> = {};
  if (!UUID.test(values.course_id)) errors.course_id = "請揀課程";
  if (values.coach_id && !UUID.test(values.coach_id)) errors.coach_id = "教練唔正確";
  if (values.venue_id && !UUID.test(values.venue_id)) errors.venue_id = "場地唔正確";
  if (!Number.isInteger(values.weekday) || values.weekday < 1 || values.weekday > 7) errors.weekday = "請揀星期";
  if (!TIME.test(values.start_time)) errors.start_time = "時間格式唔正確";
  if (!TIME.test(values.end_time)) errors.end_time = "時間格式唔正確";
  else if (values.end_time <= values.start_time) errors.end_time = "完結時間要遲過開始時間";
  if (!DATE.test(values.start_date)) errors.start_date = "請揀開始日期";
  if (!DATE.test(values.end_date)) errors.end_date = "請揀完結日期";
  else if (values.end_date < values.start_date) errors.end_date = "完結日期要遲過開始日期";
  if (!Number.isInteger(values.capacity) || values.capacity < 1 || values.capacity > 200) errors.capacity = "名額要係 1–200";
  if (Object.keys(errors).length) return { status: "error", message: "請檢查以下資料", fieldErrors: errors };

  const supabase = await createClient();
  const result = id
    ? await supabase.from("classes").update(values).eq("id", id).select("id").single()
    : await supabase.from("classes").insert(values).select("id").single();
  if (result.error) {
    console.error("saveClass failed", result.error);
    return { status: "error", message: "暫時未能儲存，請再試一次" };
  }
  revalidatePath("/", "layout");
  return { status: "success", redirectTo: `/admin/classes/${result.data.id}` };
}

/** 只可以刪冇報名紀錄嘅班次（刪除會連帶刪走報名同出席） */
export async function deleteClass(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { count } = await supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("class_id", id);
  if ((count ?? 0) > 0) return { error: "呢班已經有報名紀錄，唔可以刪除。可以將課程下架，或者將未上嘅堂設為停課。" };
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) return { error: "暫時未能刪除" };
  revalidatePath("/", "layout");
  return { redirectTo: "/admin/classes" };
}

/** 停課 / 恢復某一堂 */
export async function setSessionCancelled(sessionId: string, cancelled: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { count } = await supabase.from("attendance").select("id", { count: "exact", head: true }).eq("session_id", sessionId);
  if (cancelled && (count ?? 0) > 0) return { error: "呢堂已經點咗名，唔可以停課" };
  const { error } = await supabase
    .from("class_sessions")
    .update({ status: cancelled ? "cancelled" : "scheduled" })
    .eq("id", sessionId);
  if (error) return { error: "暫時未能更新" };
  revalidatePath("/", "layout");
  return {};
}
