"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin";
import { BADGES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

/** 頒發徽章：RLS 限制教練只可以頒畀自己班學員 */
export async function awardBadge(studentId: string, badgeKey: string, note: string) {
  const staff = await requireStaff();
  if (!(badgeKey in BADGES)) return { error: "徽章種類唔正確" };
  const supabase = await createClient();
  const { error } = await supabase.from("student_badges").insert({
    student_id: studentId,
    badge_key: badgeKey,
    note: note.trim().slice(0, 200) || null,
    awarded_by: staff.id,
  });
  if (error) {
    return { error: error.code === "23505" ? "呢位學員已經有呢個徽章" : error.code === "42501" ? "你冇權為呢位學員頒徽章" : "暫時未能頒發" };
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/account", "layout");
  return {};
}

export async function revokeBadge(id: string) {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase.from("student_badges").delete().eq("id", id).select("id");
  if (error || !data?.length) return { error: "只可以收回自己頒發嘅徽章" };
  revalidatePath("/admin", "layout");
  revalidatePath("/account", "layout");
  return {};
}
