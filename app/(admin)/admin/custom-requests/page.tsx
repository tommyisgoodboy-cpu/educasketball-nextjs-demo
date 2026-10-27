import Link from "next/link";
import { AdminPageHeader, EmptyRow, FilterTabs, inRange, ListFilterForm, parseDateParam, TableWrap } from "@/components/admin/AdminPage";
import { Badge } from "@/components/ui/Badge";
import { requireAdmin } from "@/lib/admin";
import { CUSTOM_ITEM_TYPE_LABELS, CUSTOM_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { getAdminCustomRequests } from "@/lib/data/admin-shop";
import type { CustomRequestStatus } from "@/lib/supabase/types";
import { formatDateShort, formatHKD, formatTimestampDate } from "@/lib/utils";

export const metadata = { title: "訂製查詢" };

const TABS = ["submitted", "quoted", "accepted", "in_production", "completed", "cancelled", "all"] as const;

export default async function CustomRequestsAdminPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string }> }) {
  await requireAdmin();
  const { status: raw, q: rawQ, from: rawFrom, to: rawTo } = await searchParams;
  const q = (rawQ ?? "").trim().toLowerCase().slice(0, 50);
  const from = parseDateParam(rawFrom);
  const to = parseDateParam(rawTo);
  const status = TABS.includes(raw as (typeof TABS)[number]) ? (raw as (typeof TABS)[number]) : "submitted";
  const rows = (await getAdminCustomRequests(status === "all" ? undefined : (status as CustomRequestStatus))).filter(
    (r) => inRange(r.created_at, from, to) && (!q || r.team_name.toLowerCase().includes(q) || r.contact_name.toLowerCase().includes(q) || r.contact_phone.replace(/\D/g, "").includes(q.replace(/\D/g, "") || "\u0000")),
  );
  const keep = new URLSearchParams(Object.entries({ q: q || undefined, from, to }).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <>
      <AdminPageHeader title="團體訂製查詢" description="新查詢 → 發報價 → 會員接受 → 製作中 → 完成。" />
      <FilterTabs
        current={status}
        items={TABS.map((t) => ({ value: t, label: t === "all" ? "全部" : CUSTOM_REQUEST_STATUS_LABELS[t], href: `/admin/custom-requests?status=${t}${keep ? `&${keep}` : ""}` }))}
      />
      <ListFilterForm action="/admin/custom-requests" q={q} from={from} to={to} hidden={{ status }} qPlaceholder="搜尋球隊、聯絡人或電話" dateLabel="查詢日期" />
      <TableWrap>
        <thead>
          <tr>
            <th>球隊</th>
            <th>內容</th>
            <th>聯絡</th>
            <th>期望交貨</th>
            <th>報價</th>
            <th>狀態</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={6}>冇查詢</EmptyRow>}
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <Link href={`/admin/custom-requests/${r.id}`} className="font-semibold text-brand-700 hover:underline">
                  {r.team_name}
                </Link>
                <p className="text-xs text-ink-muted">{formatTimestampDate(r.created_at)} · {r.profile_id ? "會員" : "訪客"}</p>
              </td>
              <td>
                {CUSTOM_ITEM_TYPE_LABELS[r.item_type]} {r.qty} 件
              </td>
              <td>
                {r.contact_name}
                <p className="text-xs text-ink-muted">{r.contact_phone}</p>
              </td>
              <td className="whitespace-nowrap">{r.due_date ? formatDateShort(r.due_date) : "—"}</td>
              <td>{r.quote_amount !== null ? formatHKD(r.quote_amount) : "—"}</td>
              <td>
                <Badge tone={r.status === "submitted" ? "warning" : r.status === "cancelled" ? "neutral" : "brand"}>{CUSTOM_REQUEST_STATUS_LABELS[r.status]}</Badge>
                {r.status === "accepted" && (r.payment_status === "paid" ? <Badge tone="success" className="ml-1">已付款</Badge> : <Badge tone="warning" className="ml-1">待付款</Badge>)}
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
