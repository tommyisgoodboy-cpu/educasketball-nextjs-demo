import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { AdminPageHeader } from "@/components/admin/AdminPage";
import { AddToCalendarButton } from "@/components/ui/AddToCalendarButton";
import { sessionToEvent } from "@/components/admin/sessionEvents";
import { requireStaff } from "@/lib/admin";
import { parseDateOr, parseView, viewRange } from "@/lib/calendar";
import { getMyCalendarToken, hkToday } from "@/lib/data/account";
import { getMyCoachId, getSessionsBetween } from "@/lib/data/admin";

export const metadata = { title: "日曆及點名" };

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>;
}) {
  const staff = await requireStaff();
  const { date: rawDate, view: rawView } = await searchParams;
  const today = hkToday();
  const date = parseDateOr(rawDate, today);
  // 教練多數用手機點名，預設睇「日」；管理員預設睇「週」
  const view = parseView(rawView, staff.isAdmin ? "week" : "day");
  const coachId = staff.isAdmin
    ? undefined
    : ((await getMyCoachId(staff.id)) ?? "none");
  const { from, to } = viewRange(view, date);
  const [sessions, calToken] = await Promise.all([
    getSessionsBetween(from, to, coachId),
    getMyCalendarToken(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="日曆及點名"
        description={
          staff.isAdmin
            ? "撳日 / 週 / 月切換檢視；撳一堂就可以點名。"
            : "只會顯示你負責嘅堂；撳一堂就可以點名。"
        }
        actions={
          <AddToCalendarButton
            token={calToken}
            calName="Educasketball 課堂日曆"
            icsHref={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/admin/attendance/ics?view=${view}&date=${date}`}
            label="加入我嘅日曆"
          />
        }
      />
      <AdminCalendar
        view={view}
        date={date}
        today={today}
        events={sessions.map((s) =>
          sessionToEvent(s, `/admin/attendance/${s.id}`),
        )}
        buildHref={(v, d) => `/admin/attendance?view=${v}&date=${d}`}
      />
    </>
  );
}
