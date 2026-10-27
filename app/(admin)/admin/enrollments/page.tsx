import Link from "next/link";
import { AdminPageHeader, DateRangeFields, EmptyRow, FilterTabs, inRange, parseDateParam, TableWrap } from "@/components/admin/AdminPage";
import { ClassCascadeSelect } from "@/components/admin/ClassCascadeSelect";
import { EnrollmentBoard } from "@/components/admin/EnrollmentBoard";
import { EnrollmentActions } from "@/components/admin/EnrollmentActions";
import { EnrollmentStatusBadge } from "@/components/account/StatusBadges";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Form";
import { requireAdmin } from "@/lib/admin";
import { ENROLLMENT_FILTERS, parseEnrollmentFilters } from "@/lib/admin-filters";
import { hkToday } from "@/lib/data/account";
import { getAllClasses, getAvailabilityMap, getEnrollments } from "@/lib/data/admin";
import { cn, formatDateShort, formatTime, formatTimestampDate, weekdayLabel } from "@/lib/utils";

export const metadata = { title: "報名管理" };

export default async function EnrollmentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filters = parseEnrollmentFilters(sp);
  const view = sp.v === "board" ? "board" : "list"; // 列表 / 看板
  const pay = sp.pay === "paid" || sp.pay === "unpaid" ? sp.pay : undefined; // 快速篩選：付款
  const recent = sp.recent === "7"; // 快速篩選：近 7 日
  const from = parseDateParam(sp.from); // 報名日期範圍
  const to = parseDateParam(sp.to);
  const courseId = /^[0-9a-f-]{36}$/i.test(sp.course ?? "") ? sp.course : undefined; // 主選單：課程
  const [allRows, classes, availability] = await Promise.all([
    // 看板一次過顯示所有狀態，所以唔按狀態篩
    getEnrollments({ status: view === "board" || filters.status === "all" ? undefined : filters.status, classId: filters.classId, q: filters.q }),
    getAllClasses(),
    getAvailabilityMap(),
  ]);
  const today = hkToday();
  const openClasses = classes.filter((c) => c.end_date >= today);
  // 兩層選單資料：課程 → 班次（子選單只寫星期、時間、場地同開始日期，課程名已經喺主選單）
  const courseOpts = [...new Map(openClasses.map((c) => [c.course.id, c.course.title])).entries()].map(([id, title]) => ({ id, title })).sort((a, b) => a.title.localeCompare(b.title, "zh-HK"));
  const classOpts = [...openClasses]
    .sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time) || a.start_date.localeCompare(b.start_date))
    .map((c) => ({ id: c.id, courseId: c.course.id, label: `${weekdayLabel(c.weekday)} ${formatTime(c.start_time)}・${c.venue?.name ?? "場地未定"}（${formatDateShort(c.start_date)} 開始）` }));
  const cutoff = new Date(`${today}T00:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - 7);
  const cutoffDate = cutoff.toISOString().slice(0, 10);
  const rows = allRows.filter(
    (e) => (!courseId || e.class.course.id === courseId) && (!pay || (pay === "paid") === (e.payment_status === "paid")) && (!recent || e.created_at.slice(0, 10) >= cutoffDate) && inRange(e.created_at, from, to),
  );
  const fullClassIds = new Set([...availability.values()].filter((a) => a.remaining <= 0).map((a) => a.class_id));

  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status: filters.status, course: courseId, class: filters.classId, q: filters.q || undefined, v: view === "board" ? "board" : undefined, pay, recent: recent ? "7" : undefined, from, to, ...over };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    return p.toString();
  };

  return (
    <>
      <AdminPageHeader
        title="報名管理"
        description="確認報名、處理候補、取消報名。付款係線下處理，確認前請先核實。"
        actions={
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/admin/enrollments/export?${qs(view === "board" ? { status: "all" } : {})}`} className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            匯出 CSV
          </a>
        }
      />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="顯示方式" className="inline-flex overflow-hidden rounded-lg border border-surface-border bg-white text-sm font-semibold">
          {(
            [
              ["list", "列表"],
              ["board", "看板"],
            ] as const
          ).map(([v, label]) => (
            <Link key={v} href={`/admin/enrollments?${qs({ v: v === "board" ? "board" : undefined })}`} aria-current={view === v ? "true" : undefined} className={cn("px-4 py-1.5", view === v ? "bg-brand-700 text-white" : "text-brand-700 hover:bg-brand-50")}>
              {label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm" aria-label="快速篩選">
          <span className="text-xs font-semibold text-ink-muted">快速篩選</span>
          {(
            [
              ["未付款", pay === "unpaid", { pay: pay === "unpaid" ? undefined : "unpaid" }],
              ["已付款", pay === "paid", { pay: pay === "paid" ? undefined : "paid" }],
              ["近 7 日新報名", recent, { recent: recent ? undefined : "7" }],
            ] as const
          ).map(([label, on, over]) => (
            <Link key={label} href={`/admin/enrollments?${qs(over)}`} aria-pressed={on} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", on ? "border-brand-700 bg-brand-700 text-white" : "border-surface-border bg-white text-ink-muted hover:text-brand-700")}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {view === "list" && <FilterTabs current={filters.status} items={ENROLLMENT_FILTERS.map((f) => ({ value: f.value, label: f.label, href: `/admin/enrollments?${qs({ status: f.value })}` }))} />}

      <form className="mb-4 grid gap-2 lg:grid-cols-[1fr_1.4fr_1.2fr_auto_auto]" action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/admin/enrollments`}>
        <input type="hidden" name="status" value={filters.status} />
        {view === "board" && <input type="hidden" name="v" value="board" />}
        {pay && <input type="hidden" name="pay" value={pay} />}
        {recent && <input type="hidden" name="recent" value="7" />}
        <ClassCascadeSelect
          courses={courseOpts}
          classes={classOpts}
          defaultCourse={courseId}
          defaultClass={filters.classId}
        />
        <Input name="q" defaultValue={filters.q} placeholder="搜尋學員、家長姓名或電話" aria-label="搜尋" />
        <DateRangeFields from={from} to={to} label="報名日期" />
        <button type="submit" className="h-11 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white">
          篩選
        </button>
      </form>

      <p className="mb-2 text-sm text-ink-muted">共 {rows.length} 個報名</p>
      {view === "board" ? (
        <EnrollmentBoard rows={rows} fullClassIds={fullClassIds} />
      ) : (
      <TableWrap>
        <thead>
          <tr>
            <th>報名日期</th>
            <th>學員</th>
            <th>家長聯絡</th>
            <th>班次</th>
            <th>狀態</th>
            <th className="text-right">動作</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={6}>冇符合條件嘅報名</EmptyRow>}
          {rows.map((e) => {
            const a = availability.get(e.class.id);
            const isFull = (a?.remaining ?? 1) <= 0;
            return (
              <tr key={e.id} className="align-top">
                <td className="whitespace-nowrap text-ink-muted">{formatTimestampDate(e.created_at)}</td>
                <td>
                  <p className="font-medium">{e.student.name}</p>
                  <p className="text-xs text-ink-muted">
                    {e.student.birth_year} 年出生 · {e.student.parent_id ? "會員" : "訪客"}
                  </p>
                </td>
                <td className="text-ink-muted">
                  <p>{e.parent_name ?? "—"}</p>
                  <p className="text-xs">{e.parent_phone}</p>
                </td>
                <td>
                  <p>{e.class.course.title}</p>
                  <p className="text-xs text-ink-muted">
                    {weekdayLabel(e.class.weekday)} {formatTime(e.class.start_time)} · {e.class.venue?.name}
                  </p>
                  <p className="mt-1 text-xs">
                    {isFull ? <Badge tone="danger">已滿 {a?.capacity}</Badge> : <span className="text-ink-subtle">餘 {a?.remaining} / {a?.capacity}</span>}
                  </p>
                </td>
                <td>
                  <EnrollmentStatusBadge status={e.status} />
                  <p className="mt-1 text-xs">
                    {e.payment_status === "paid" ? (
                      <Badge tone="success">
                        已付款 · {e.payment_method === "stripe" ? "Stripe" : "模擬付款"}
                        {e.paid_at ? ` · ${formatTimestampDate(e.paid_at)}` : ""}
                      </Badge>
                    ) : (
                      <span className="text-ink-subtle">未付款</span>
                    )}
                  </p>
                  {e.notes && <p className="mt-1 max-w-48 text-xs text-ink-muted">備註：{e.notes}</p>}
                </td>
                <td>
                  <EnrollmentActions id={e.id} status={e.status} studentName={e.student.name} isFull={isFull} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
      )}
    </>
  );
}
