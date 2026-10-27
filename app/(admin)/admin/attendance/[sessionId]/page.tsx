import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPage";
import { RosterTable } from "@/components/admin/RosterTable";
import { requireStaff } from "@/lib/admin";
import { getSessionRoster } from "@/lib/data/admin";
import { isUuid } from "@/lib/data/courses";
import { formatDateShort, formatTime, weekdayLabel } from "@/lib/utils";

export const metadata = { title: "點名" };

export default async function SessionAttendancePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const staff = await requireStaff();
  const { sessionId } = await params;
  if (!isUuid(sessionId)) notFound();
  const session = await getSessionRoster(sessionId);
  if (!session) notFound();

  // 教練只可以睇自己班（RLS 亦會擋寫入）
  const cls = session.class;
  if (!staff.isAdmin && cls.coach?.profile_id !== staff.id) redirect("/no-access");

  return (
    <>
      <AdminPageHeader
        back={{ href: `/admin/attendance?date=${session.session_date}`, label: "返回日曆" }}
        title={`${cls.course.title}`}
        description={
          <>
            {formatDateShort(session.session_date)}（{weekdayLabel(cls.weekday)}）{formatTime(cls.start_time)}–{formatTime(cls.end_time)} ·{" "}
            {cls.venue?.name ?? "場地待定"} · {cls.coach?.name ?? "未有教練"} 教練
          </>
        }
      />
      {session.status === "cancelled" && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">呢堂已設為停課，唔需要點名。</p>
      )}
      <RosterTable sessionId={session.id} roster={session.roster} disabled={session.status === "cancelled"} viewerId={staff.id} isAdmin={staff.isAdmin} />
      <p className="mt-4 text-xs text-ink-subtle">設為「出席」會自動為家長帳戶加積分；改返缺席或請假會扣返。技術評核達標可以即場頒發徽章，家長喺會員區即時睇到。</p>
    </>
  );
}
