import Link from "next/link";
import { ScheduleCalendar } from "@/components/account/ScheduleCalendar";
import { ScheduleList } from "@/components/account/ScheduleList";
import { EnrollmentStatusBadge } from "@/components/account/StatusBadges";
import { ButtonLink } from "@/components/ui/Button";
import { AddToCalendarButton } from "@/components/ui/AddToCalendarButton";
import {
  getMyCalendarToken,
  getMyEnrollments,
  getMySchedule,
  hkToday,
} from "@/lib/data/account";
import { cn, formatTime, weekdayLabel } from "@/lib/utils";

export const metadata = { title: "上課時間表" };

type SP = Promise<{ view?: string; month?: string }>;

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const today = hkToday();
  const view = sp.view === "calendar" ? "calendar" : "list";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.month ?? "")
    ? sp.month!
    : today.slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const [entries, enrollments, calToken] = await Promise.all([
    getMySchedule(`${month}-01`, `${month}-${lastDay}`),
    getMyEnrollments(),
    getMyCalendarToken(),
  ]);
  const current = enrollments.filter(
    (e) => e.class.end_date >= today && e.status !== "waitlist",
  );
  const studentOrder = [...new Set(enrollments.map((e) => e.student.id))];
  const href = (params: { view?: string; month?: string }) =>
    `/account/schedule?${new URLSearchParams({ view, month, ...params }).toString()}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-brand-800 sm:text-3xl">
          上課時間表
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          已報班次嘅每一堂、出席紀錄同剩餘堂數。
        </p>
        <div className="mt-3">
          <AddToCalendarButton
            token={calToken}
            icsHref={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/account/schedule/ics`}
          />
        </div>
        <p className="mt-1 text-xs text-ink-subtle">
          撳一下揀 Apple / Google / Outlook
          日曆，會直接彈出「訂閱」；今日起約半年嘅課堂自動同步，有改堂或停課都會更新。
        </p>
      </header>

      {current.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {current.map((e) => (
            <li
              key={e.id}
              className="rounded-card border border-surface-border bg-white p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">
                    {e.student.name} · {e.class.course.title}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {weekdayLabel(e.class.weekday)}{" "}
                    {formatTime(e.class.start_time)} ·{" "}
                    {e.class.venue?.name ?? "場地待定"}
                  </p>
                </div>
                <EnrollmentStatusBadge status={e.status} />
              </div>
              {e.status === "confirmed" && (
                <dl className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-emerald-50 py-2">
                    <dt className="text-xs text-emerald-700">已出席</dt>
                    <dd className="text-lg font-bold text-emerald-800">
                      {e.attended} 堂
                    </dd>
                  </div>
                  <div className="rounded-lg bg-brand-50 py-2">
                    <dt className="text-xs text-brand-600">剩餘</dt>
                    <dd className="text-lg font-bold text-brand-800">
                      {e.sessionsLeft} 堂
                    </dd>
                  </div>
                </dl>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-card border border-dashed border-surface-border bg-white p-6 text-sm text-ink-muted">
          仲未有報讀中嘅班次。
          <ButtonLink href="/courses" variant="cta" size="sm">
            睇課程同報名
          </ButtonLink>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link
            href={href({ month: shiftMonth(month, -1) })}
            className="rounded-lg px-3 py-2 text-brand-700 hover:bg-white"
            aria-label="上個月"
          >
            ‹
          </Link>
          <h2 className="min-w-28 text-center text-lg font-bold text-ink">
            {y} 年 {m} 月
          </h2>
          <Link
            href={href({ month: shiftMonth(month, 1) })}
            className="rounded-lg px-3 py-2 text-brand-700 hover:bg-white"
            aria-label="下個月"
          >
            ›
          </Link>
          {month !== today.slice(0, 7) && (
            <Link
              href={href({ month: today.slice(0, 7) })}
              className="ml-1 text-sm font-semibold text-brand-700 hover:underline"
            >
              今個月
            </Link>
          )}
        </div>
        <div
          role="tablist"
          aria-label="檢視方式"
          className="flex rounded-lg border border-surface-border bg-white p-1"
        >
          {[
            { v: "list", label: "列表" },
            { v: "calendar", label: "月曆" },
          ].map((t) => (
            <Link
              key={t.v}
              role="tab"
              aria-selected={view === t.v}
              href={href({ view: t.v })}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-semibold",
                view === t.v
                  ? "bg-brand-700 text-white"
                  : "text-ink-muted hover:text-brand-700",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {view === "calendar" ? (
        <ScheduleCalendar
          month={month}
          entries={entries}
          today={today}
          studentOrder={studentOrder}
        />
      ) : (
        <ScheduleList entries={entries} today={today} />
      )}
    </div>
  );
}
