import { AdminPageHeader, EmptyRow, inRange, ListFilterForm, parseDateParam, TableWrap } from "@/components/admin/AdminPage";
import { Badge } from "@/components/ui/Badge";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { formatTimestampDate } from "@/lib/utils";

export const metadata = { title: "學員備注" };

const KIND = { health: "健康", schedule: "時間", general: "其他" } as const;
const TONE = { health: "danger", schedule: "aqua", general: "neutral" } as const;

type Row = {
  id: string;
  kind: keyof typeof KIND;
  body: string;
  created_at: string;
  student: { name: string } | null;
  author: { full_name: string | null } | null;
};

/** 後台：全部學員備注一覽（教練喺點名頁加嘅備注，管理員喺度集中睇） */
export default async function NotesPage({ searchParams }: { searchParams: Promise<{ q?: string; kind?: string; from?: string; to?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 50);
  const kind = sp.kind === "health" || sp.kind === "schedule" || sp.kind === "general" ? sp.kind : undefined;
  const from = parseDateParam(sp.from);
  const to = parseDateParam(sp.to);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_notes")
    .select("id, kind, body, created_at, student:students(name), author:profiles!student_notes_created_by_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw error;

  const rows = (data as unknown as Row[]).filter(
    (n) =>
      (!kind || n.kind === kind) &&
      inRange(n.created_at, from, to) &&
      (!q || (n.student?.name ?? "").toLowerCase().includes(q) || n.body.toLowerCase().includes(q)),
  );

  return (
    <>
      <AdminPageHeader title="學員備注" description="教練同管理員喺「日曆及點名」加嘅備注（例如受傷、補習時間），喺度集中睇。" />
      <ListFilterForm action="/admin/notes" q={q} from={from} to={to} qPlaceholder="搜尋學員或備注內容" dateLabel="記錄日期">
        <select name="kind" defaultValue={kind ?? ""} aria-label="備注類型" className="h-11 rounded-lg border border-surface-border bg-white px-3 text-sm text-ink">
          <option value="">所有類型</option>
          <option value="health">健康</option>
          <option value="schedule">時間</option>
          <option value="general">其他</option>
        </select>
      </ListFilterForm>
      <TableWrap>
        <thead>
          <tr>
            <th>學員</th>
            <th>類型</th>
            <th>備注</th>
            <th>記錄人</th>
            <th>日期</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={5}>未有備注</EmptyRow>}
          {rows.map((n) => (
            <tr key={n.id}>
              <td className="font-semibold">{n.student?.name ?? "—"}</td>
              <td>
                <Badge tone={TONE[n.kind]}>{KIND[n.kind]}</Badge>
              </td>
              <td className="!whitespace-normal min-w-56">{n.body}</td>
              <td className="text-ink-muted">{n.author?.full_name ?? "—"}</td>
              <td className="text-ink-muted">{formatTimestampDate(n.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
