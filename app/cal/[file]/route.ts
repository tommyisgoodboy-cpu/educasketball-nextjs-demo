import { NextResponse } from "next/server";
import { buildIcs, icsResponse } from "@/lib/ics";
import { createClient } from "@/lib/supabase/server";

// 日曆訂閱：/cal/<token>.ics。日曆 app 唔帶登入 cookie，所以用私人 token 對應用戶（見 migration 21）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const token = file.replace(/\.ics$/i, "");
  if (!/^[0-9a-f-]{36}$/i.test(token))
    return new NextResponse("Not found", { status: 404 });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("calendar_feed", {
    p_token: token,
  });
  if (error) return new NextResponse("暫時未能載入", { status: 500 });
  if (!data?.length)
    return new NextResponse("連結無效或已重置", { status: 404 });
  const body = buildIcs(
    "Educasketball 上課時間表",
    data.map((r) => ({
      uid: r.uid,
      date: r.session_date,
      start: r.start_time,
      end: r.end_time,
      summary: r.summary,
      location: r.location,
      description: r.description || null,
      cancelled: r.cancelled,
    })),
  );
  const res = icsResponse(body, "educasketball.ics", true);
  res.headers.set("Cache-Control", "private, max-age=300");
  void request;
  return res;
}
