import { NextResponse } from "next/server";
import { buildIcs, icsResponse } from "@/lib/ics";
import { getProfile } from "@/lib/auth";
import { getMySchedule, hkToday } from "@/lib/data/account";

// 家長：一鍵將已報班次（今日起約半年）加入手機 / 電腦日曆
export async function GET(request: Request) {
  const profile = await getProfile();
  if (!profile) return new NextResponse("請先登入", { status: 401 });
  const today = hkToday();
  const to = new Date(new Date(`${today}T00:00:00Z`).getTime() + 190 * 86400000).toISOString().slice(0, 10);
  const entries = await getMySchedule(today, to);
  const body = buildIcs(
    "Educasketball 上課時間表",
    entries.map((e) => ({
      uid: `${e.sessionId}-${e.studentId}@educasketball.demo`,
      date: e.date,
      start: e.startTime,
      end: e.endTime,
      summary: `${e.courseTitle}・${e.studentName}`,
      location: e.venue,
      description: [e.coach ? `教練：${e.coach}` : null, e.enrollmentStatus === "pending" ? "報名待確認" : null].filter(Boolean).join("\n") || null,
      cancelled: e.sessionStatus === "cancelled",
    })),
  );
  return icsResponse(body, "educasketball-schedule.ics", new URL(request.url).searchParams.get("inline") === "1");
}
