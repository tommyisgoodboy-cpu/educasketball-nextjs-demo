import Link from "next/link";
import { AdminPageHeader, EmptyRow, inRange, ListFilterForm, parseDateParam, TableWrap } from "@/components/admin/AdminPage";
import { Badge } from "@/components/ui/Badge";
import { requireAdmin } from "@/lib/admin";
import { getMembers } from "@/lib/data/admin";
import { formatTimestampDate } from "@/lib/utils";

export const metadata = { title: "會員及積分" };

const ROLE = { member: "會員", coach: "教練", admin: "管理員" } as const;

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; from?: string; to?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 50);
  const role = sp.role === "member" || sp.role === "coach" || sp.role === "admin" ? sp.role : undefined;
  const from = parseDateParam(sp.from);
  const to = parseDateParam(sp.to);
  const members = (await getMembers()).filter(
    (m) =>
      (!role || m.role === role) &&
      inRange(m.created_at, from, to) &&
      (!q ||
      (m.full_name ?? "").toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (q.replace(/\D/g, "").length >= 4 && (m.phone ?? "").replace(/\D/g, "").includes(q.replace(/\D/g, "")))),
  );

  return (
    <>
      <AdminPageHeader title="會員及積分" description="撳入會員睇學員、報名、積分紀錄，可以手動調整積分同設定權限。" />
      <ListFilterForm action="/admin/members" q={q} from={from} to={to} qPlaceholder="搜尋姓名、電郵或電話" dateLabel="註冊日期">
        <select name="role" defaultValue={role ?? ""} aria-label="角色" className="h-11 rounded-lg border border-surface-border bg-white px-3 text-sm text-ink">
          <option value="">所有身分</option>
          <option value="member">會員</option>
          <option value="coach">教練</option>
          <option value="admin">管理員</option>
        </select>
      </ListFilterForm>
      <TableWrap>
        <thead>
          <tr>
            <th>會員</th>
            <th>電話</th>
            <th>角色</th>
            <th>學員</th>
            <th>積分</th>
            <th>註冊日期</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 && <EmptyRow colSpan={6}>冇符合嘅會員</EmptyRow>}
          {members.map((m) => (
            <tr key={m.id}>
              <td>
                <Link href={`/admin/members/${m.id}`} className="font-semibold text-brand-700 hover:underline">
                  {m.full_name ?? "（未填姓名）"}
                </Link>
                <p className="text-xs text-ink-muted">{m.email}</p>
              </td>
              <td className="text-ink-muted">{m.phone ?? "—"}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  <Badge tone={m.role === "admin" ? "cta" : m.role === "coach" ? "aqua" : "neutral"}>{ROLE[m.role]}</Badge>
                  {m.can_manage_venues && m.role !== "admin" && <Badge tone="brand">場地</Badge>}
                </div>
              </td>
              <td>{m.students_count}</td>
              <td className="font-semibold">{m.points_balance}</td>
              <td className="whitespace-nowrap text-ink-muted">{formatTimestampDate(m.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
