import Link from "next/link";
import { EnrollmentStatusBadge } from "@/components/account/StatusBadges";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { getProfile } from "@/lib/auth";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getMyEnrollments, getMyPoints, getMyStudents, getNextSessions, getRecentOrders, hkToday } from "@/lib/data/account";
import { formatDateShort, formatHKD, formatTime, formatTimestampDate, weekdayLabel } from "@/lib/utils";

export const metadata = { title: "會員主頁" };

const WEEKDAY_OF = (date: string) => {
  const d = new Date(`${date}T00:00:00`).getDay();
  return d === 0 ? 7 : d;
};

export default async function AccountHomePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const [{ welcome }, profile, students, enrollments, points, nextSessions, orders] = await Promise.all([
    searchParams,
    getProfile(),
    getMyStudents(),
    getMyEnrollments(),
    getMyPoints(),
    getNextSessions(3),
    getRecentOrders(3),
  ]);
  const today = hkToday();
  const active = enrollments.filter((e) => e.status !== "cancelled" && e.class.end_date >= today);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-brand-800 sm:text-3xl">你好，{profile?.full_name ?? "會員"}</h1>
        <p className="mt-1 text-sm text-ink-muted">喺度睇小朋友嘅上堂時間、出席同積分。</p>
      </header>

      {welcome && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          註冊成功！{students.length > 0 ? "你之前報名嘅學員已經自動連結到呢個帳戶。" : "先去「我嘅學員」登記小朋友，之後報名就唔使再填資料。"}
        </div>
      )}

      <dl className="grid grid-cols-3 gap-3">
        <Stat label="積分" value={points.balance.toLocaleString("en-HK")} href="/account/points" />
        <Stat label="學員" value={students.length} href="/account/students" />
        <Stat label="報讀中" value={active.length} href="/account/schedule" />
      </dl>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>下一堂</CardTitle>
          <Link href="/account/schedule" className="text-sm font-semibold text-brand-700 hover:underline">
            完整時間表 →
          </Link>
        </CardHeader>
        <CardBody>
          {nextSessions.length > 0 ? (
            <ul className="divide-y divide-surface-border">
              {nextSessions.map((s) => (
                <li key={`${s.sessionId}:${s.studentId}`} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="w-14 shrink-0 rounded-lg bg-brand-50 py-1.5 text-center">
                    <p className="text-xs text-brand-600">{weekdayLabel(WEEKDAY_OF(s.date))}</p>
                    <p className="font-bold text-brand-800">{formatDateShort(s.date)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {s.studentName} · {s.courseTitle}
                    </p>
                    <p className="truncate text-sm text-ink-muted">
                      {formatTime(s.startTime)}–{formatTime(s.endTime)} · {s.venue ?? "場地待定"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHint hasEnrollments={enrollments.length > 0} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>我嘅報名</CardTitle>
        </CardHeader>
        <CardBody>
          {enrollments.length > 0 ? (
            <ul className="divide-y divide-surface-border">
              {enrollments.map((e) => {
                const ended = e.class.end_date < today;
                return (
                  <li key={e.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">
                        {e.student.name} · {e.class.course.title}
                      </p>
                      <p className="text-sm text-ink-muted">
                        {weekdayLabel(e.class.weekday)} {formatTime(e.class.start_time)} · {formatDateShort(e.class.start_date)}–
                        {formatDateShort(e.class.end_date)}
                        {e.status === "confirmed" && !ended && ` · 已出席 ${e.attended} 堂，仲有 ${e.sessionsLeft} 堂`}
                      </p>
                    </div>
                    {ended ? <Badge>已完結</Badge> : <EnrollmentStatusBadge status={e.status} />}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyHint hasEnrollments={false} />
          )}
        </CardBody>
      </Card>

      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>最近訂單</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="divide-y divide-surface-border">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0">
                  <span className="text-ink-muted">
                    {formatTimestampDate(o.created_at)} · 訂單 #{o.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold">{formatHKD(o.total)}</span>
                    <Badge tone={o.status === "pending_payment" ? "warning" : o.status === "cancelled" ? "neutral" : "success"}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} className="rounded-card border border-surface-border bg-white p-4 shadow-card transition-shadow hover:shadow-lg">
      <dt className="text-xs text-ink-subtle sm:text-sm">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-brand-800 sm:text-3xl">{value}</dd>
    </Link>
  );
}

function EmptyHint({ hasEnrollments }: { hasEnrollments: boolean }) {
  return (
    <div className="flex flex-col items-start gap-3 text-sm text-ink-muted">
      <p>{hasEnrollments ? "暫時未有已確認嘅堂。報名確認後會喺度顯示。" : "仲未有報名紀錄。"}</p>
      {!hasEnrollments && (
        <ButtonLink href="/courses" variant="cta" size="sm">
          睇課程同報名
        </ButtonLink>
      )}
    </div>
  );
}
