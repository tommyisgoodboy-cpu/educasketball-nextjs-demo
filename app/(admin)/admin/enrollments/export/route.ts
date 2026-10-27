import { NextResponse, type NextRequest } from "next/server";
import { getStaff } from "@/lib/admin";
import { inRange, parseDateParam } from "@/components/admin/AdminPage";
import { parseEnrollmentFilters } from "@/lib/admin-filters";
import { getEnrollments } from "@/lib/data/admin";
import { ENROLLMENT_STATUS_LABELS } from "@/lib/constants";
import { formatTime, weekdayLabel } from "@/lib/utils";

// CSV：加 BOM 等 Excel 正確顯示中文；欄位以雙引號包住，並防止公式注入
function cell(value: unknown) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const staff = await getStaff();
  if (!staff?.isAdmin) return new NextResponse("Forbidden", { status: 403 });

  const filters = parseEnrollmentFilters(Object.fromEntries(request.nextUrl.searchParams));
  const courseId = request.nextUrl.searchParams.get("course");
  const from = parseDateParam(request.nextUrl.searchParams.get("from") ?? undefined);
  const to = parseDateParam(request.nextUrl.searchParams.get("to") ?? undefined);
  const payParam = request.nextUrl.searchParams.get("pay");
  const pay = payParam === "paid" || payParam === "unpaid" ? payParam : undefined;
  const rows = (
    await getEnrollments({
      status: filters.status === "all" ? undefined : filters.status,
      classId: filters.classId,
      q: filters.q,
    })
  ).filter((e) => (!courseId || e.class.course.id === courseId) && inRange(e.created_at, from, to) && (!pay || (pay === "paid") === (e.payment_status === "paid")));

  const header = ["報名時間", "狀態", "學員", "出生年份", "家長姓名", "電話", "電郵", "課程", "班次", "場地", "教練", "來源", "備註"];
  const lines = rows.map((e) =>
    [
      new Date(e.created_at).toLocaleString("sv-SE", { timeZone: "Asia/Hong_Kong" }).slice(0, 16),
      ENROLLMENT_STATUS_LABELS[e.status],
      e.student.name,
      e.student.birth_year,
      e.parent_name,
      e.parent_phone,
      e.parent_email,
      e.class.course.title,
      `${weekdayLabel(e.class.weekday)} ${formatTime(e.class.start_time)}–${formatTime(e.class.end_time)}（${e.class.start_date} 至 ${e.class.end_date}）`,
      e.class.venue?.name,
      e.class.coach?.name,
      e.source === "guest" ? "訪客" : e.source === "member" ? "會員" : "後台",
      e.notes,
    ]
      .map(cell)
      .join(","),
  );

  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enrollments-${filters.status}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
