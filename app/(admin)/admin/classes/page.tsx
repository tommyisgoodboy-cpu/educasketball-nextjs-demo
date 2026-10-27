import Link from "next/link";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { AdminPageHeader, EmptyRow, FilterTabs, TableWrap } from "@/components/admin/AdminPage";
import { sessionToEvent } from "@/components/admin/sessionEvents";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Select } from "@/components/ui/Form";
import { requireAdmin } from "@/lib/admin";
import { parseDateOr, parseView, viewRange } from "@/lib/calendar";
import { hkToday } from "@/lib/data/account";
import { getAllClasses, getAvailabilityMap, getSessionsBetween } from "@/lib/data/admin";
import { cn, formatDateShort, formatTime, weekdayLabel } from "@/lib/utils";

export const metadata = { title: "班次" };

const TABS = [
  { value: "running", label: "進行中" },
  { value: "upcoming", label: "未開始" },
  { value: "ended", label: "已完結" },
  { value: "all", label: "全部" },
];

type SP = { tab?: string; mode?: string; view?: string; date?: string; course?: string; coach?: string; venue?: string };

export default async function ClassesAdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;
  const today = hkToday();
  const mode = sp.mode === "list" ? "list" : "calendar"; // 預設日曆

  const header = (
    <AdminPageHeader title="班次" description="每個班次係一個課程喺固定星期、時間同場地上堂。" actions={<ButtonLink href="/admin/classes/new">＋ 新增班次</ButtonLink>} />
  );
  const modeSwitch = (
    <div role="group" aria-label="顯示方式" className="mb-4 inline-flex overflow-hidden rounded-lg border border-surface-border bg-white text-sm font-semibold">
      {[
        { value: "calendar", label: "日曆", href: "/admin/classes" },
        { value: "list", label: "列表", href: "/admin/classes?mode=list" },
      ].map((m) => (
        <Link key={m.value} href={m.href} aria-current={m.value === mode ? "true" : undefined} className={cn("px-4 py-1.5", m.value === mode ? "bg-brand-700 text-white" : "text-brand-700 hover:bg-brand-50")}>
          {m.label}
        </Link>
      ))}
    </div>
  );

  if (mode === "calendar") {
    const date = parseDateOr(sp.date, today);
    const view = parseView(sp.view, "week");
    const { from, to } = viewRange(view, date);
    const [sessions, allClasses] = await Promise.all([getSessionsBetween(from, to), getAllClasses()]);

    // 篩選選項：由班次資料攞（課程 / 教練 / 場地），去重後按名排
    const uniq = (pairs: ([string, string] | null)[]) =>
      [...new Map(pairs.filter((p): p is [string, string] => !!p)).entries()].sort((a, b) => a[1].localeCompare(b[1], "zh-HK"));
    const courses = uniq(allClasses.map((c) => [c.course.id, c.course.title]));
    const coaches = uniq(allClasses.map((c) => (c.coach ? [c.coach.id, c.coach.name] : null)));
    const venues = uniq(allClasses.map((c) => (c.venue ? [c.venue.id, c.venue.name] : null)));
    // 只接受真係存在嘅選項，亂填就當冇篩選
    const pick = (raw: string | undefined, opts: [string, string][]) => (raw && opts.some(([id]) => id === raw) ? raw : "");
    const f = { course: pick(sp.course, courses), coach: pick(sp.coach, coaches), venue: pick(sp.venue, venues) };
    const shown = sessions.filter(
      (s) => (!f.course || s.class.course_id === f.course) && (!f.coach || s.class.coach?.id === f.coach) && (!f.venue || s.class.venue?.id === f.venue),
    );
    const active = [f.course, f.coach, f.venue].filter(Boolean).length;
    const qs = (v: string, d: string) =>
      `/admin/classes?view=${v}&date=${d}${f.course ? `&course=${f.course}` : ""}${f.coach ? `&coach=${f.coach}` : ""}${f.venue ? `&venue=${f.venue}` : ""}`;

    return (
      <>
        {header}
        {modeSwitch}
        <form action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/admin/classes`} className="mb-4 flex flex-wrap items-end gap-3 rounded-card border border-surface-border bg-white p-3 shadow-card">
          <input type="hidden" name="view" value={view} />
          <input type="hidden" name="date" value={date} />
          {(
            [
              ["course", "課程", courses],
              ["coach", "教練", coaches],
              ["venue", "場地", venues],
            ] as const
          ).map(([name, label, opts]) => (
            <label key={name} className="min-w-36 flex-1 text-xs font-semibold text-ink-muted">
              {label}
              <Select name={name} defaultValue={f[name]} className="mt-1">
                <option value="">全部{label}</option>
                {opts.map(([id, text]) => (
                  <option key={id} value={id}>
                    {text}
                  </option>
                ))}
              </Select>
            </label>
          ))}
          <button type="submit" className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
            篩選
          </button>
          {active > 0 && (
            <Link href={`/admin/classes?view=${view}&date=${date}`} className="py-2.5 text-sm font-semibold text-brand-700 hover:underline">
              清除篩選（{active}）
            </Link>
          )}
        </form>
        <AdminCalendar
          view={view}
          date={date}
          today={today}
          events={shown.map((s) => sessionToEvent(s, `/admin/classes/${s.class.id}`))}
          buildHref={qs}
        />
      </>
    );
  }

  const tab = TABS.some((t) => t.value === sp.tab) ? sp.tab! : "running";
  const [classes, availability] = await Promise.all([getAllClasses(), getAvailabilityMap()]);

  const phase = (c: { start_date: string; end_date: string }) =>
    c.end_date < today ? "ended" : c.start_date > today ? "upcoming" : "running";
  const rows = classes
    .filter((c) => tab === "all" || phase(c) === tab)
    .sort((a, b) => a.course.title.localeCompare(b.course.title, "zh-HK") || a.weekday - b.weekday || a.start_date.localeCompare(b.start_date));

  return (
    <>
      {header}
      {modeSwitch}
      <FilterTabs
        current={tab}
        items={TABS.map((t) => ({
          ...t,
          href: `/admin/classes?mode=list&tab=${t.value}`,
          count: t.value === "all" ? classes.length : classes.filter((c) => phase(c) === t.value).length,
        }))}
      />
      <TableWrap>
        <thead>
          <tr>
            <th>課程</th>
            <th>時間</th>
            <th>日期</th>
            <th>場地 / 教練</th>
            <th>名額</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={5}>冇班次</EmptyRow>}
          {rows.map((c) => {
            const a = availability.get(c.id);
            return (
              <tr key={c.id}>
                <td>
                  <Link href={`/admin/classes/${c.id}`} className="font-semibold text-brand-700 hover:underline">
                    {c.course.title}
                  </Link>
                </td>
                <td className="whitespace-nowrap">
                  {weekdayLabel(c.weekday)} {formatTime(c.start_time)}–{formatTime(c.end_time)}
                </td>
                <td className="whitespace-nowrap text-ink-muted">
                  {formatDateShort(c.start_date)} – {formatDateShort(c.end_date)}
                </td>
                <td className="text-ink-muted">
                  {c.venue?.name ?? "場地未定"}
                  <br />
                  <span className="text-xs">{c.coach?.name ?? "教練未定"}</span>
                </td>
                <td className="whitespace-nowrap">
                  {a && a.remaining <= 0 ? <Badge tone="danger">已滿</Badge> : null} {a?.taken ?? 0}/{c.capacity}
                  {a?.waitlist ? <span className="text-xs text-cta-hover"> · 候補 {a.waitlist}</span> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </>
  );
}
