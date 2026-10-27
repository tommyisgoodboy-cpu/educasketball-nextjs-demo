import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type WhatsAppSettings = { number: string; display: string; default_message: string };

const DEFAULT_WHATSAPP: WhatsAppSettings = {
  number: "85255550000",
  display: "5555 0000",
  default_message: "你好，我想查詢 Educasketball 課程",
};

/** site_settings 入面嘅 whatsapp 設定（後台可改）；讀唔到就用預設值 */
export const getWhatsAppSettings = cache(async (): Promise<WhatsAppSettings> => {
  if (!hasSupabaseEnv) return DEFAULT_WHATSAPP;
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "whatsapp").maybeSingle();
  return { ...DEFAULT_WHATSAPP, ...((data?.value as Partial<WhatsAppSettings> | null) ?? {}) };
});

export type SiteContact = { phone: string; email: string };

const DEFAULT_CONTACT: SiteContact = { phone: "+852 5555 0000", email: "hello@educasketball.test" };

/** 網站聯絡資料（site_settings.site）；讀唔到就用預設值 */
export const getSiteContact = cache(async (): Promise<SiteContact> => {
  if (!hasSupabaseEnv) return DEFAULT_CONTACT;
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "site").maybeSingle();
  return { ...DEFAULT_CONTACT, ...((data?.value as Partial<SiteContact> | null) ?? {}) };
});
