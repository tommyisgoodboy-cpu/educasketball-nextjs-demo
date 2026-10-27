import Link from "next/link";
import { AdminPageHeader, EmptyRow, FilterTabs, inRange, ListFilterForm, parseDateParam, TableWrap } from "@/components/admin/AdminPage";
import { Badge } from "@/components/ui/Badge";
import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getAdminOrders } from "@/lib/data/admin-shop";
import { shortId } from "@/lib/order-steps";
import type { OrderStatus } from "@/lib/supabase/types";
import { formatHKD, formatTimestampDate } from "@/lib/utils";

export const metadata = { title: "訂單" };

const TABS = ["pending_payment", "paid", "shipped", "cancelled", "all"] as const;
const TAB_LABELS: Record<(typeof TABS)[number], string> = { pending_payment: "未支付", paid: "已支付", shipped: "已出貨", cancelled: "已取消", all: "全部" };
const TONE = { pending_payment: "warning", paid: "brand", shipped: "success", cancelled: "neutral" } as const;

export default async function OrdersAdminPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string }> }) {
  await requireAdmin();
  const { status: raw, q: rawQ, from: rawFrom, to: rawTo } = await searchParams;
  const q = (rawQ ?? "").trim().toLowerCase().slice(0, 50);
  const from = parseDateParam(rawFrom);
  const to = parseDateParam(rawTo);
  const status = TABS.includes(raw as (typeof TABS)[number]) ? (raw as (typeof TABS)[number]) : "pending_payment";
  const orders = (await getAdminOrders(status === "all" ? undefined : (status as OrderStatus))).filter(
    (o) =>
      inRange(o.created_at, from, to) &&
      (!q || (o.contact_name ?? "").toLowerCase().includes(q) || (o.contact_phone ?? "").replace(/\D/g, "").includes(q.replace(/\D/g, "") || "\u0000") || shortId(o.id).toLowerCase().includes(q)),
  );
  const keep = new URLSearchParams(Object.entries({ q: q || undefined, from, to }).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <>
      <AdminPageHeader title="訂單" description="待付款：核對 FPS 付款截圖後標示「已付款」，庫存同積分會自動處理。" />
      <FilterTabs
        current={status}
        items={TABS.map((t) => ({ value: t, label: TAB_LABELS[t], href: `/admin/orders?status=${t}${keep ? `&${keep}` : ""}` }))}
      />
      <ListFilterForm action="/admin/orders" q={q} from={from} to={to} hidden={{ status }} qPlaceholder="搜尋訂單編號、姓名或電話" dateLabel="下單日期" />
      <TableWrap>
        <thead>
          <tr>
            <th>訂單</th>
            <th>日期</th>
            <th>聯絡人</th>
            <th>金額</th>
            <th>取貨</th>
            <th>付款截圖</th>
            <th>狀態</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && <EmptyRow colSpan={7}>冇訂單</EmptyRow>}
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-700 hover:underline">
                  {shortId(o.id)}
                </Link>
              </td>
              <td className="whitespace-nowrap text-ink-muted">{formatTimestampDate(o.created_at)}</td>
              <td>
                {o.contact_name}
                <p className="text-xs text-ink-muted">{o.contact_phone}</p>
              </td>
              <td className="whitespace-nowrap">
                {formatHKD(o.total)} <span className="text-xs text-ink-muted">· {o.itemCount} 件</span>
              </td>
              <td>{o.delivery_method === "delivery" ? "送貨" : "自取"}</td>
              <td>{o.payment_proof_url ? <Badge tone="success">已上載</Badge> : <span className="text-ink-subtle">—</span>}</td>
              <td>
                <Badge tone={TONE[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
