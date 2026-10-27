import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeader, StatCard, TableWrap } from "@/components/admin/AdminPage";
import { SessionList } from "@/components/admin/SessionList";
import { EnrollmentStatusBadge } from "@/components/account/StatusBadges";
import { getStaff, requireStaff, staffHome } from "@/lib/admin";
import { hkToday } from "@/lib/data/account";
import { getDashboardCounts, getEnrollments, getMyCoachId, getSessionsOn } from "@/lib/data/admin";
import { formatTime, formatTimestampDate, weekdayLabel } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const staff = await getStaff();
  if (staff && !staff.isAdmin && !staff.isCoach) redirect(staffHome(staff));
  const me = await requireStaff();

  const today = hkToday();
  const coachId = me.isAdmin ? null : await getMyCoachId(me.id);
  const sessions = await getSessionsOn(today, me.isAdmin ? undefined : (coachId ?? "none"));

  if (!me.isAdmin) {
    return (
      <>
        <AdminPageHeader title={`你好，${me.full_name ?? "教練"}`} description="今日你負責嘅堂，撳入去點名。" />
        <SessionList sessions={sessions} empty="今日冇你負責嘅堂。" />
        <p className="mt-6 text-sm">
          <Link href="/admin/attendance" className="font-semibold text-brand-700 hover:underline">
            睇日曆 / 揀其他日子點名 →
          </Link>
        </p>
      </>
    );
  }

  const [counts, recent] = await Promise.all([getDashboardCounts(), getEnrollments()]);

  return (
    <>
      <AdminPageHeader title="Dashboard" description={`今日 ${today}`} />

      <dl className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="待確認報名" value={counts.pending} href="/admin/enrollments?status=pending" tone={counts.pending ? "warning" : "brand"} />
        <StatCard label="候補中" value={counts.waitlist} href="/admin/enrollments?status=waitlist" tone={counts.waitlist ? "cta" : "brand"} />
        <StatCard label="待處理訂單" value={counts.orders} href="/admin/orders" tone={counts.orders ? "warning" : "brand"} />
        <StatCard label="待處理訂製查詢" value={counts.customs} href="/admin/custom-requests" tone={counts.customs ? "warning" : "brand"} />
      </dl>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">今日課程（{sessions.length}）</h2>
          <Link href="/admin/attendance?view=week" className="text-sm font-semibold text-brand-700 hover:underline">
            睇日曆 →
          </Link>
        </div>
        <SessionList sessions={sessions} empty="今日冇堂。" />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">最近報名</h2>
          <Link href="/admin/enrollments" className="text-sm font-semibold text-brand-700 hover:underline">
            全部報名 →
          </Link>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <th>日期</th>
              <th>學員</th>
              <th>班次</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            {recent.slice(0, 8).map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap text-ink-muted">{formatTimestampDate(e.created_at)}</td>
                <td className="font-medium">{e.student.name}</td>
                <td>
                  {e.class.course.title}
                  <span className="text-ink-muted">
                    {" "}
                    · {weekdayLabel(e.class.weekday)} {formatTime(e.class.start_time)}
                  </span>
                </td>
                <td>
                  <EnrollmentStatusBadge status={e.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </section>
    </>
  );
}
