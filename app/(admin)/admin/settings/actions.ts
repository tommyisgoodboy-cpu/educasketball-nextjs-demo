"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { DEMO_LOCK, DEMO_LOCK_MESSAGE } from "@/lib/demo";
import { HK_PHONE_ERROR, normalizeHKPhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { status: "idle" } | { status: "saved" } | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  if (DEMO_LOCK) return { status: "error", message: DEMO_LOCK_MESSAGE };
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const int = (k: string) => Number(get(k));
  const errors: Record<string, string> = {};

  const sitePhone = normalizeHKPhone(get("site_phone"));
  const waPhone = normalizeHKPhone(get("whatsapp_number"));
  if (!sitePhone) errors.site_phone = HK_PHONE_ERROR;
  if (!waPhone) errors.whatsapp_number = HK_PHONE_ERROR;
  if (get("site_email") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(get("site_email"))) errors.site_email = "電郵格式唔正確";
  if (!get("fps_id")) errors.fps_id = "請填寫 FPS 識別碼或電話";
  if (!get("fps_account_name")) errors.fps_account_name = "請填寫收款人名稱";

  const rules = {
    attendance: int("rule_attendance"),
    spend_per_point: int("rule_spend_per_point"),
    first_enrollment: int("rule_first_enrollment"),
    referral: int("rule_referral"),
    redeem_points: int("rule_redeem_points"),
    redeem_value: int("rule_redeem_value"),
  };
  for (const [k, v] of Object.entries(rules)) {
    const min = k === "spend_per_point" || k === "redeem_points" || k === "redeem_value" ? 1 : 0;
    if (!Number.isInteger(v) || v < min || v > 100000) errors[`rule_${k}`] = min ? "要係 1 或以上嘅整數" : "要係 0 或以上嘅整數";
  }
  if (Object.keys(errors).length) return { status: "error", message: "請檢查以下資料", fieldErrors: errors };

  const supabase = await createClient();
  const { data: current } = await supabase.from("site_settings").select("key, value").in("key", ["site", "whatsapp"]);
  const prev = Object.fromEntries((current ?? []).map((r) => [r.key, (r.value ?? {}) as Record<string, unknown>]));
  const now = new Date().toISOString();
  const rows = [
    { key: "site", value: { ...prev.site, phone: `+852 ${sitePhone}`, email: get("site_email") }, updated_at: now },
    {
      key: "whatsapp",
      value: {
        ...prev.whatsapp,
        number: `852${waPhone!.replace(" ", "")}`,
        display: `+852 ${waPhone}`,
        default_message: get("whatsapp_message").slice(0, 200) || "你好，我想查詢課程",
      },
      updated_at: now,
    },
    { key: "fps", value: { fps_id: get("fps_id").slice(0, 50), account_name: get("fps_account_name").slice(0, 100), instructions: get("fps_instructions").slice(0, 500) }, updated_at: now },
    { key: "points_rules", value: rules, updated_at: now },
  ];
  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) {
    console.error("saveSettings failed", error);
    return { status: "error", message: "暫時未能儲存" };
  }
  revalidatePath("/", "layout");
  return { status: "saved" };
}
