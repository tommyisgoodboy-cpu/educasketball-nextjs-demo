import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

// Vercel Cron 每日叫一次：讀一下資料庫，避免 Supabase 免費方案因 7 日冇活動而暫停。
// Vercel 會帶 Authorization: Bearer <CRON_SECRET>；冇設定 CRON_SECRET 就拒絕。
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { count, error } = await supabase.from("courses").select("id", { count: "exact", head: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, courses: count, at: new Date().toISOString() });
}
