import { NextResponse, type NextRequest } from "next/server";
import { getStaff } from "@/lib/admin";
import { buildIcs, icsResponse } from "@/lib/ics";
import { parseDateOr, parseView, viewRange } from "@/lib/calendar";
import { hkToday } from "@/lib/data/account";
import { getMyCoachId, getSessionsBetween } from "@/lib/data/admin";

// 教練 / 管理員：將而家睇緊嗰段日曆（日 / 週 / 月）匯出做 .ics；教練只匯自己負責嘅堂
export async function GET(request: NextRequest) {
  const staff = await getStaff();
  if (!staff || (!staff.isAdmin && !staff.isCoach)) return new NextResponse("Forbidden", { status: 403 });
  const sp = request.nextUrl.searchParams;
  const date = parseDateOr(sp.get("date") ?? undefined, hkToday());
  const view = parseView(sp.get("view") ?? undefined, "week");
  const { from, to } = viewRange(view, date);
  const coachId = staff.isAdmin ? undefined : ((await getMyCoachId(staff.id)) ?? "none");
  const sessions = await getSessionsBetween(from, to, coachId);
  const body = buildIcs(
    staff.isAdmin ? "Educasketball 全部課堂" : "Educasketball 我嘅課堂",
    sessions.map((s) => ({
      uid: `${s.id}@educasketball.demo`,
      date: s.session_date,
      start: s.class.start_time,
      end: s.class.end_time,
      summary: s.class.course.title,
      location: s.class.venue?.name ?? null,
      description: [s.class.coach?.name ? `教練：${s.class.coach.name}` : null, `${s.rosterCount} 位學員`].filter(Boolean).join("\n"),
      cancelled: s.status === "cancelled",
    })),
  );
  return icsResponse(body, `educasketball-${from}_${to}.ics`, sp.get("inline") === "1");
}
