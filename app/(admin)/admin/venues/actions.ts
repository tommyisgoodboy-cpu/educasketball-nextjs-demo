"use server";

import { revalidatePath } from "next/cache";
import { requireVenueManager } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export type VenueFormState = { status: "idle" } | { status: "saved" } | { status: "error"; message: string; fieldErrors?: Record<string, string> };

/** 新增 / 修改場地；有場地權限先可以（RLS 亦會檢查） */
export async function saveVenue(_prev: VenueFormState, formData: FormData): Promise<VenueFormState> {
  await requireVenueManager();
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const id = get("id");
  const values = { name: get("name"), district: get("district"), address: get("address"), map_url: get("map_url") || null };

  const errors: Record<string, string> = {};
  if (!values.name) errors.name = "請填寫場地名稱";
  if (!values.district) errors.district = "請填寫地區";
  if (!values.address) errors.address = "請填寫地址";
  if (values.map_url && !/^https:\/\/[^\s]+$/.test(values.map_url)) errors.map_url = "地圖連結要以 https:// 開頭";
  if (Object.values(values).some((v) => (v ?? "").length > 300)) errors.address = "內容太長";
  if (Object.keys(errors).length) return { status: "error", message: "請檢查以下資料", fieldErrors: errors };

  const supabase = await createClient();
  const { error } = id ? await supabase.from("venues").update(values).eq("id", id) : await supabase.from("venues").insert(values);
  if (error) {
    console.error("saveVenue failed", error);
    return { status: "error", message: error.code === "42501" ? "你冇權限修改場地" : "暫時未能儲存" };
  }
  revalidatePath("/", "layout");
  return { status: "saved" };
}

export async function deleteVenue(id: string) {
  await requireVenueManager();
  const supabase = await createClient();
  const { count } = await supabase.from("classes").select("id", { count: "exact", head: true }).eq("venue_id", id);
  if ((count ?? 0) > 0) return { error: "有班次用緊呢個場地，唔可以刪除。" };
  const { error } = await supabase.from("venues").delete().eq("id", id);
  if (error) return { error: "暫時未能刪除" };
  revalidatePath("/", "layout");
  return {};
}
