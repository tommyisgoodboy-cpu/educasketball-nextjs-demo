import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, StatCard, TableWrap } from "@/components/admin/AdminPage";
import { Badge, LevelBadge } from "@/components/ui/Badge";
import { requireAdmin } from "@/lib/admin";
import { AGE_GROUP_LABELS } from "@/lib/constants";
import { getCourseById, getCourseStatus, type ClassStatus } from "@/lib/data/admin";
import { cn, formatDateShort, formatTime, weekdayLabel } from "@/lib/utils";

export const metadata = { title: "班況" };

const PHASE: Record<ClassStatus["phase"], { label: string; tone: "success" | "brand" | "neutral" }> = {
  running: { label: "進行中", tone: "success" },
  upcoming: { label: "未開始", tone: "brand" },
  ended: { label: "已完結", tone: "neutral" },
};

const rate = (present: number, marked: number) => (marked ? `${Math.round((present / marked) * 100)}%` : "—");

export default async function CourseStatusPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const course = await getCourseById(id);
  if (!course) notFound();
  const { classes } = await getCourseStatus(id);

  const running = classes.filter((c) => c.phase === "running");
  const upcoming = classes.filter((c) => c.phase === "upcoming");
  const students = running.reduce((n, c) => n + c.taken, 0);
  const capacity = running.reduce((n, c) => n + c.cls.capacity, 0);
  const pending = classes.filter((c) => c.phase !== "ended").reduce((n, c) => n + c.pending, 0);
  const waitlist = classes.filter((c) => c.phase !== "ended").reduce((n, c) => n + c.waitlist, 0);
  const present = running.reduce((n, c) => n + c.present, 0);
  const marked = running.reduce((n, c) => n + c.marked, 0);
  const next = classes
    .map((c) => c.nextSession)
    .filter((d): d is string => !!d)
    .sort()[0];

  // 進行中 → 未開始 → 已完結（最近 3 期）
  const ended = classes.filter((c) => c.phase === "ended").sort((a, b) => b.cls.end_date.localeCompare(a.cls.end_date)).slice(0, 3);
  const rows = [...running, ...upcoming.sort((a, b) => a.cls.start_date.localeCompare(b.cls.start_date)).slice(0, 6), ...ended];

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/courses", label: "課程" }}
        title={`${course.title}・班況`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{AGE_GROUP_LABELS[course.age_group]}</Badge>
            <LevelBadge level={course.level} />
            <span>
              每期 {course.sessions_count} 堂 · HK${course.price}
            </span>
          </span>
        }
        actions={
          <Link href={`/admin/classes/new?course=${id}`} className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
            ＋ 開班
          </Link>
        }
      />

      <dl className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="進行中班次" value={running.length} />
        <StatCard label="現有學員" value={`${students} / ${capacity}`} />
        <StatCard label="待確認" value={pending} tone={pending ? "warning" : "brand"} href="/admin/enrollments?status=pending" />
        <StatCard label="候補中" value={waitlist} tone={waitlist ? "cta" : "brand"} href="/admin/enrollments?status=waitlist" />
        <StatCard label="平均出席率" value={rate(present, marked)} />
      </dl>
      <p className="-mt-4 mb-6 text-sm text-ink-muted">{next ? `下一堂：${formatDateShort(next)}` : "暫時冇未上嘅堂"}（出席率只計進行中班次已點名嘅人次）</p>

      <TableWrap>
        <thead>
          <tr>
            <th>班次</th>
            <th>狀態</th>
            <th>日期</th>
            <th>場地 / 教練</th>
            <th>名額</th>
            <th>進度</th>
            <th>出席率</th>
            <th className="text-right">動作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const full = c.taken >= c.cls.capacity;
            return (
              <tr key={c.cls.id} className={cn(c.phase === "ended" && "text-ink-muted")}>
                <td className="whitespace-nowrap font-medium">
                  {weekdayLabel(c.cls.weekday)} {formatTime(c.cls.start_time)}–{formatTime(c.cls.end_time)}
                </td>
                <td>
                  <Badge tone={PHASE[c.phase].tone}>{PHASE[c.phase].label}</Badge>
                </td>
                <td className="whitespace-nowrap text-ink-muted">
                  {formatDateShort(c.cls.start_date)} – {formatDateShort(c.cls.end_date)}
                </td>
                <td className="min-w-40 text-ink-muted">
                  {c.cls.venue?.name ?? "場地未定"}
                  <br />
                  <span className="text-xs">{c.cls.coach?.name ?? "教練未定"}</span>
                </td>
                <td className="whitespace-nowrap">
                  <span className={cn(full && "font-semibold text-red-700")}>
                    {c.taken}/{c.cls.capacity}
                  </span>
                  {full && <Badge tone="danger" className="ml-1">已滿</Badge>}
                  {c.waitlist > 0 && <span className="ml-1 text-xs text-cta-hover">候補 {c.waitlist}</span>}
                  {c.pending > 0 && <span className="ml-1 text-xs text-amber-700">待確認 {c.pending}</span>}
                </td>
                <td className="min-w-28">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
                    <div className="h-full bg-brand-600" style={{ width: `${c.sessionsTotal ? (c.sessionsDone / c.sessionsTotal) * 100 : 0}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {c.sessionsDone}/{c.sessionsTotal} 堂{c.nextSession ? ` · 下一堂 ${formatDateShort(c.nextSession)}` : ""}
                  </p>
                </td>
                <td className="whitespace-nowrap">{rate(c.present, c.marked)}</td>
                <td className="text-right">
                  <Link href={`/admin/classes/${c.cls.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
                    班次詳情
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
      <p className="mt-3 text-xs text-ink-subtle">顯示進行中、最近 6 個未開始同最近 3 期已完結嘅班次。</p>
    </>
  );
}
