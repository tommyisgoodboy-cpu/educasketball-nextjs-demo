"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { CUSTOM_ITEM_TYPE_LABELS, CUSTOM_SIZES } from "@/lib/constants";
import { CUSTOM_FABRICS, estimateCustom, featuresFor } from "@/lib/customQuote";
import { HK_PHONE_ERROR, normalizeHKPhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import type { CustomItemType } from "@/lib/supabase/types";

export type CustomState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "submitted"; loggedIn: boolean };

/** 號碼名單：每行「號碼 名」，例如「23 CHAN」 */
function parseRoster(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 100)
    .map((line) => {
      const m = line.match(/^(\d{1,3})\s*[,，\s]\s*(.*)$/);
      return m ? { number: Number(m[1]), name: m[2].slice(0, 30) } : { number: null, name: line.slice(0, 30) };
    });
}

export async function submitCustomRequest(_prev: CustomState, formData: FormData): Promise<CustomState> {
  const user = await getUser();
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const sizeBreakdown: Record<string, number> = {};
  for (const size of CUSTOM_SIZES) {
    const n = Number(formData.get(`size_${size}`) || 0);
    if (Number.isInteger(n) && n > 0 && n <= 500) sizeBreakdown[size] = n;
  }
  const qty = Object.values(sizeBreakdown).reduce((a, b) => a + b, 0);
  const itemType = get("item_type") as CustomItemType;
  const logoPath = get("logo_path");
  const fabric = CUSTOM_FABRICS.some((f) => f.key === get("fabric")) ? get("fabric") : "standard";
  const allowed = new Set(featuresFor(itemType).map((f) => f.key as string));
  const features = [...new Set(formData.getAll("features").map(String))].filter((k) => allowed.has(k));
  const dueDate = get("due_date");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });

  const fieldErrors: Record<string, string> = {};
  if (!get("team_name")) fieldErrors.team_name = "請填寫隊名";
  if (!get("contact_name")) fieldErrors.contact_name = "請填寫聯絡人";
  if (!normalizeHKPhone(get("contact_phone"))) fieldErrors.contact_phone = HK_PHONE_ERROR;
  if (get("contact_email") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(get("contact_email"))) fieldErrors.contact_email = "電郵格式唔正確";
  if (!(itemType in CUSTOM_ITEM_TYPE_LABELS)) fieldErrors.item_type = "請揀訂製類別";
  if (qty < 1) fieldErrors.sizes = "請最少填一個尺碼嘅數量";
  if (dueDate && (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || dueDate < today)) fieldErrors.due_date = "期望交貨日要係今日之後";
  if (get("notes").length > 1000) fieldErrors.notes = "備註太長";
  // logo 只接受上載到自己 folder（會員）或者 guest/ 嘅路徑
  const logoPrefix = user ? `${user.id}/` : "guest/";
  if (logoPath && (!logoPath.startsWith(logoPrefix) || logoPath.includes(".."))) fieldErrors.logo = "logo 檔案唔正確，請重新上載";
  if (Object.keys(fieldErrors).length) return { status: "error", message: "請檢查以下資料", fieldErrors };

  const supabase = await createClient();
  // 訪客冇 select 權限，所以唔可以 .select() 讀返
  const { error } = await supabase.from("custom_requests").insert({
    profile_id: user?.id ?? null,
    team_name: get("team_name").slice(0, 100),
    contact_name: get("contact_name").slice(0, 100),
    contact_phone: normalizeHKPhone(get("contact_phone"))!,
    contact_email: get("contact_email") || null,
    item_type: itemType,
    qty,
    size_breakdown: sizeBreakdown,
    colors: get("colors").slice(0, 200) || null,
    logo_url: logoPath || null,
    roster: parseRoster(get("roster")),
    due_date: dueDate || null,
    notes: get("notes") || null,
    fabric,
    features,
    estimate_amount: estimateCustom({ itemType, qty, fabric, features }).total,
  });
  if (error) {
    console.error("custom request insert failed", error);
    return { status: "error", message: "暫時未能提交，請稍後再試或 WhatsApp 我哋" };
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/account/orders");
  return { status: "submitted", loggedIn: Boolean(user) };
}
