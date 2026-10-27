import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPage";
import { AccessControls, AdjustPointsForm, StudentLevelSelect } from "@/components/admin/MemberControls";
import { BadgeManager } from "@/components/badges/BadgeManager";
import { getBadgesByStudent } from "@/lib/data/badges";
import { EnrollmentStatusBadge } from "@/components/account/StatusBadges";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/admin";
import { getMemberDetail } from "@/lib/data/admin";
import { isUuid } from "@/lib/data/courses";
import { cn, formatDateShort, formatTime, formatTimestampDate, weekdayLabel } from "@/lib/utils";

export const metadata = { title: "會員詳情" };

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const detail = isUuid(id) ? await getMemberDetail(id) : null;
  if (!detail) notFound();
  const { member, students, enrollments, ledger } = detail;
  const badges = await getBadgesByStudent(students.map((s) => s.id));

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/members", label: "會員及積分" }}
        title={member.full_name ?? "（未填姓名）"}
        description={`${member.email} · ${member.phone ?? "冇電話"} · 註冊於 ${formatTimestampDate(member.created_at)}`}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>學員（{students.length}）</CardTitle>
            </CardHeader>
            <CardBody>
              {students.length === 0 ? (
                <p className="text-sm text-ink-muted">未登記學員。</p>
              ) : (
                <ul className="divide-y divide-surface-border">
                  {students.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 space-y-2">
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-ink-muted">
                          {s.birth_year} 年出生 · 球齡 {s.years_playing} 年{s.notes && ` · 備註：${s.notes}`}
                        </p>
                        <BadgeManager studentId={s.id} studentName={s.name} badges={badges.get(s.id) ?? []} viewerId={admin.id} isAdmin />
                      </div>
                      <StudentLevelSelect studentId={s.id} profileId={member.id} level={s.level} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>報名紀錄（{enrollments.length}）</CardTitle>
            </CardHeader>
            <CardBody>
              {enrollments.length === 0 ? (
                <p className="text-sm text-ink-muted">冇報名紀錄。</p>
              ) : (
                <ul className="divide-y divide-surface-border text-sm">
                  {enrollments.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                      <span>
                        <span className="font-medium">{e.student.name}</span> · {e.class.course.title}
                        <span className="text-ink-muted">
                          {" "}
                          · {weekdayLabel(e.class.weekday)} {formatTime(e.class.start_time)} · {formatDateShort(e.class.start_date)}起
                        </span>
                      </span>
                      <EnrollmentStatusBadge status={e.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>積分（餘額 {member.points_balance}）</CardTitle>
            </CardHeader>
            <CardBody className="space-y-5">
              <AdjustPointsForm profileId={member.id} />
              <ul className="divide-y divide-surface-border text-sm">
                {ledger.map((l) => (
                  <li key={l.id} className="flex justify-between gap-3 py-2">
                    <span>
                      {l.reason}
                      <span className="ml-2 text-xs text-ink-subtle">{formatTimestampDate(l.created_at)}</span>
                    </span>
                    <span className={cn("font-bold", l.delta > 0 ? "text-emerald-700" : "text-red-600")}>{l.delta > 0 ? `+${l.delta}` : l.delta}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>權限</CardTitle>
          </CardHeader>
          <CardBody>
            <AccessControls profileId={member.id} role={member.role} canManageVenues={member.can_manage_venues} isSelf={member.id === admin.id} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
