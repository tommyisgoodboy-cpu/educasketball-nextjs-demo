import Link from "next/link";
import { AdminPageHeader, EmptyRow, TableWrap } from "@/components/admin/AdminPage";
import { Badge } from "@/components/ui/Badge";
import { BADGES, SKILL_LEVEL_LABELS, type BadgeKey } from "@/lib/constants";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDateShort, formatTimestampDate } from "@/lib/utils";

export const metadata = { title: "學員" };

type Update = { at: string; text: string; tone: "danger" | "aqua" | "neutral" | "success" | "warning" | "cta" | "brand" };
const NOTE_KIND = { health: "健康", schedule: "時間", general: "備注" } as const;
const ATT = { present: "出席", absent: "缺席", leave: "請假" } as const;

/** 後台：學員一覽，按「最近更新」排序（備注、徽章、點名、新報名） */
export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string; level?: string; sort?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 50);
  const level = sp.level && sp.level in SKILL_LEVEL_LABELS ? sp.level : "";
  const sort = sp.sort === "name" ? "name" : "recent";

  const supabase = await createClient();
  const [students, enrollments, attendance, notes, badges] = await Promise.all([
    supabase.from("students").select("id, name, birth_year, level, created_at, parent:profiles!students_parent_id_fkey(id, full_name, phone)").limit(1000),
    supabase.from("enrollments").select("student_id, status, created_at, class:classes(course:courses(title), coach:coaches(name))").in("status", ["confirmed", "pending", "waitlist"]).limit(3000),
    supabase.from("attendance").select("student_id, status, created_at, session:class_sessions(session_date)").order("created_at", { ascending: false }).limit(5000),
    supabase.from("student_notes").select("student_id, kind, body, created_at").order("created_at", { ascending: false }).limit(2000),
    supabase.from("student_badges").select("student_id, badge_key, created_at").order("created_at", { ascending: false }).limit(2000),
  ]);
  for (const r of [students, enrollments, attendance, notes, badges]) if (r.error) throw r.error;

  const by = <T extends { student_id: string }>(rows: T[]) => {
    const m = new Map<string, T[]>();
    for (const r of rows) m.set(r.student_id, [...(m.get(r.student_id) ?? []), r]);
    return m;
  };
  const enrollBy = by((enrollments.data ?? []) as unknown as { student_id: string; status: string; created_at: string; class: { course: { title: string } | null; coach: { name: string } | null } | null }[]);
  const attBy = by((attendance.data ?? []) as unknown as { student_id: string; status: keyof typeof ATT; created_at: string; session: { session_date: string } | null }[]);
  const noteBy = by((notes.data ?? []) as unknown as { student_id: string; kind: keyof typeof NOTE_KIND; body: string; created_at: string }[]);
  const badgeBy = by((badges.data ?? []) as unknown as { student_id: string; badge_key: string; created_at: string }[]);
  const year = new Date().getFullYear();

  const rows = (students.data ?? [])
    .map((s) => {
      const parent = s.parent as unknown as { id: string; full_name: string | null; phone: string | null } | null;
      const en = enrollBy.get(s.id) ?? [];
      const at = attBy.get(s.id) ?? [];
      const nt = noteBy.get(s.id) ?? [];
      const bg = badgeBy.get(s.id) ?? [];
      const ups: Update[] = [];
      if (nt[0]) ups.push({ at: nt[0].created_at, text: `${NOTE_KIND[nt[0].kind]}備注：${nt[0].body}`, tone: nt[0].kind === "health" ? "danger" : "neutral" });
      if (bg[0]) ups.push({ at: bg[0].created_at, text: `獲頒徽章：${BADGES[bg[0].badge_key as BadgeKey]?.label ?? bg[0].badge_key}`, tone: "warning" });
      if (at[0]) ups.push({ at: at[0].created_at, text: `${at[0].session?.session_date ? formatDateShort(at[0].session.session_date) : ""}${ATT[at[0].status]}`, tone: at[0].status === "present" ? "success" : at[0].status === "absent" ? "danger" : "aqua" });
      const newest = [...en].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      if (newest) ups.push({ at: newest.created_at, text: `報名${newest.status === "confirmed" ? "" : "（待確認 / 候補）"}`, tone: "brand" });
      ups.sort((a, b) => b.at.localeCompare(a.at));
      const marked = at.length;
      const present = at.filter((a) => a.status === "present").length;
      return {
        id: s.id,
        name: s.name,
        age: year - s.birth_year,
        level: s.level,
        parent,
        courses: [...new Set(en.filter((e) => e.status === "confirmed").map((e) => e.class?.course?.title).filter(Boolean) as string[])],
        coaches: [...new Set(en.filter((e) => e.status === "confirmed").map((e) => e.class?.coach?.name).filter(Boolean) as string[])],
        rate: marked ? Math.round((present / marked) * 100) : null,
        noteCount: nt.length,
        badgeCount: bg.length,
        updates: ups,
        lastAt: ups[0]?.at ?? s.created_at,
      };
    })
    .filter((r) => (!level || r.level === level) && (!q || r.name.toLowerCase().includes(q) || (r.parent?.full_name ?? "").toLowerCase().includes(q) || r.coaches.some((c) => c.toLowerCase().includes(q)) || (r.parent?.phone ?? "").replace(/\D/g, "").includes(q.replace(/\D/g, "")) && q.replace(/\D/g, "").length >= 4))
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name, "zh-HK") : b.lastAt.localeCompare(a.lastAt)));

  const sel = "h-11 rounded-lg border border-surface-border bg-white px-3 text-sm text-ink";
  return (
    <>
      <AdminPageHeader title="學員" description="全部學員一覽，預設按「最近更新」排（備注、徽章、點名、新報名）。撳家長名入會員詳情。" />
      <form action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/admin/students`} className="mb-4 flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={q} placeholder="搜尋學員、家長或教練" aria-label="搜尋" className="h-11 min-w-[12rem] flex-1 rounded-lg border border-surface-border bg-white px-3 text-sm text-ink sm:max-w-xs" />
        <select name="level" defaultValue={level} aria-label="等級" className={sel}>
          <option value="">所有等級</option>
          {Object.entries(SKILL_LEVEL_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l as string}</option>
          ))}
        </select>
        <select name="sort" defaultValue={sort} aria-label="排序" className={sel}>
          <option value="recent">最近更新</option>
          <option value="name">姓名</option>
        </select>
        <button type="submit" className="h-11 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white">篩選</button>
        {(q || level || sort === "name") && <Link href="/admin/students" className="text-sm text-ink-muted underline-offset-2 hover:underline">清除</Link>}
      </form>
      <p className="mb-2 text-xs text-ink-muted">共 {rows.length} 位學員</p>
      <TableWrap>
        <thead>
          <tr>
            <th>學員</th>
            <th>家長</th>
            <th>等級</th>
            <th>班別</th>
            <th>教練</th>
            <th>出席率</th>
            <th>最近更新</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={7}>冇符合嘅學員</EmptyRow>}
          {rows.slice(0, 200).map((r) => (
            <tr key={r.id}>
              <td>
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-ink-muted">{r.age} 歲{r.noteCount ? ` · 備注 ${r.noteCount}` : ""}{r.badgeCount ? ` · 徽章 ${r.badgeCount}` : ""}</p>
              </td>
              <td>
                {r.parent ? (
                  <Link href={`/admin/members/${r.parent.id}`} className="text-brand-700 hover:underline">
                    {r.parent.full_name ?? r.parent.phone ?? "（未填姓名）"}
                  </Link>
                ) : "—"}
              </td>
              <td><Badge tone="neutral">{SKILL_LEVEL_LABELS[r.level as keyof typeof SKILL_LEVEL_LABELS]}</Badge></td>
              <td className="text-ink-muted">{r.courses.length ? r.courses.join("、") : "—"}</td>
              <td className="text-ink-muted">{r.coaches.length ? r.coaches.join("、") : "—"}</td>
              <td className="text-ink-muted">{r.rate === null ? "—" : `${r.rate}%`}</td>
              <td className="!whitespace-normal min-w-64">
                {r.updates.length === 0 ? (
                  <span className="text-ink-subtle">暫無更新</span>
                ) : (
                  <div className="space-y-1">
                    {r.updates.slice(0, 2).map((u, i) => (
                      <p key={i} className="flex flex-wrap items-center gap-1.5 text-xs">
                        <Badge tone={u.tone}>{formatTimestampDate(u.at)}</Badge>
                        <span className="break-words">{u.text}</span>
                      </p>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      {rows.length > 200 && <p className="mt-2 text-xs text-ink-muted">只顯示頭 200 位，請用搜尋縮窄。</p>}
    </>
  );
}
