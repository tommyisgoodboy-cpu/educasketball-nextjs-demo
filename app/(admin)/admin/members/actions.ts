"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { DEMO_LOCK, DEMO_LOCK_MESSAGE } from "@/lib/demo";
import { SKILL_LEVEL_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { SkillLevel, UserRole } from "@/lib/supabase/types";

export type PointsFormState = { status: "idle" } | { status: "saved" } | { status: "error"; message: string };

/** 手動調整積分：一定要填原因，記低邊個管理員做 */
export async function adjustPoints(profileId: string, _prev: PointsFormState, formData: FormData): Promise<PointsFormState> {
  const admin = await requireAdmin();
  const delta = Number(formData.get("delta"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 100000) return { status: "error", message: "請輸入非零嘅整數（減分用負數）" };
  if (reason.length < 2) return { status: "error", message: "請填寫調整原因" };
  if (reason.length > 200) return { status: "error", message: "原因太長" };

  const supabase = await createClient();
  const { error } = await supabase.from("points_ledger").insert({
    profile_id: profileId,
    delta,
    reason: `手動調整：${reason}`,
    ref_type: "manual",
    created_by: admin.id,
  });
  if (error) {
    console.error("adjustPoints failed", error);
    return { status: "error", message: "暫時未能儲存" };
  }
  revalidatePath(`/admin/members/${profileId}`);
  revalidatePath("/account", "layout");
  return { status: "saved" };
}

export async function setStudentLevel(studentId: string, profileId: string, level: SkillLevel) {
  await requireAdmin();
  if (!(level in SKILL_LEVEL_LABELS)) return { error: "等級唔正確" };
  const supabase = await createClient();
  const { error } = await supabase.from("students").update({ level }).eq("id", studentId);
  if (error) return { error: "暫時未能更新" };
  revalidatePath(`/admin/members/${profileId}`);
  revalidatePath("/account", "layout");
  return {};
}

/** 改角色 / 場地權限。轉做教練時，如果未有教練資料就自動建立一個。 */
export async function setMemberAccess(profileId: string, access: { role: UserRole; canManageVenues: boolean }) {
  const admin = await requireAdmin();
  if (DEMO_LOCK) return { error: DEMO_LOCK_MESSAGE };
  if (!["member", "coach", "admin"].includes(access.role)) return { error: "角色唔正確" };
  if (profileId === admin.id && access.role !== "admin") return { error: "唔可以移除自己嘅管理員身份" };

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ role: access.role, can_manage_venues: access.canManageVenues })
    .eq("id", profileId)
    .select("full_name")
    .single();
  if (error) {
    console.error("setMemberAccess failed", error);
    return { error: "暫時未能更新" };
  }

  if (access.role === "coach") {
    const { data: existing } = await supabase.from("coaches").select("id").eq("profile_id", profileId).maybeSingle();
    if (!existing) {
      await supabase.from("coaches").insert({ profile_id: profileId, name: profile.full_name ?? "新教練", is_active: true });
    }
  }
  revalidatePath("/admin", "layout");
  return {};
}
