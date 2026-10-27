import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPage";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { StatusSteps } from "@/components/account/OrderStatusSteps";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/admin";
import { getAdminOrder } from "@/lib/data/admin-shop";
import { variantLabel } from "@/lib/variant";
import { ORDER_STEPS, shortId } from "@/lib/order-steps";
import { formatHKD, formatTimestampDate } from "@/lib/utils";
import { setOrderStatus } from "../actions";

export const metadata = { title: "訂單詳情" };

export default async function OrderAdminDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const order = await getAdminOrder((await params).id);
  if (!order) notFound();
  const id = shortId(order.id);

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/orders", label: "訂單" }}
        title={`訂單 ${id}`}
        description={`${formatTimestampDate(order.created_at)} · 會員：${order.profile?.full_name ?? "—"}`}
        actions={
          <>
            {order.status === "pending_payment" && (
              <ConfirmButton
                variant="primary"
                confirmText={`${order.payment_proof_url ? "" : "會員未上載付款截圖。\n"}確認已收到 ${formatHKD(order.total)}？會即時扣庫存同加消費積分。`}
                action={setOrderStatus.bind(null, order.id, "paid")}
              >
                標示已付款
              </ConfirmButton>
            )}
            {order.status === "paid" && (
              <ConfirmButton variant="primary" confirmText="確認已出貨 / 已交收？" action={setOrderStatus.bind(null, order.id, "shipped")}>
                標示已出貨
              </ConfirmButton>
            )}
            {order.status !== "cancelled" && (
              <ConfirmButton
                variant="ghost"
                confirmText={`取消訂單 ${id}？${order.status !== "pending_payment" ? "庫存會加返、消費積分會扣返。" : ""}${order.points_used ? `會退返 ${order.points_used} 積分。` : ""}`}
                action={setOrderStatus.bind(null, order.id, "cancelled")}
              >
                取消訂單
              </ConfirmButton>
            )}
          </>
        }
      />
      <div className="mb-6">
        <StatusSteps steps={ORDER_STEPS} current={order.status} cancelled={order.status === "cancelled"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>商品</CardTitle>
            </CardHeader>
            <CardBody>
              <ul className="divide-y divide-surface-border text-sm">
                {order.order_items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3 py-2">
                    <span>
                      {i.variant?.product?.name} · {i.variant ? variantLabel(i.variant) : ""} × {i.qty}
                      <span className="ml-2 text-xs text-ink-subtle">（現有庫存 {i.variant?.stock}）</span>
                    </span>
                    <span>{formatHKD(i.unit_price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-1 border-t border-surface-border pt-3 text-sm">
                <div className="flex justify-between">
                  <dt>小計</dt>
                  <dd>{formatHKD(order.subtotal)}</dd>
                </div>
                {order.points_used > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>積分抵扣（{order.points_used} 分）</dt>
                    <dd>-{formatHKD(order.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold">
                  <dt>應付</dt>
                  <dd>{formatHKD(order.total)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>付款截圖</CardTitle>
            </CardHeader>
            <CardBody>
              {order.proofUrl ? (
                order.proofIsPdf ? (
                  <a href={order.proofUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                    開啟 PDF →
                  </a>
                ) : (
                  <a href={order.proofUrl} target="_blank" rel="noopener noreferrer">
                    {/* signed URL 會過期，唔經 next/image 優化 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={order.proofUrl} alt="付款截圖" className="max-h-96 rounded-lg border border-surface-border" />
                  </a>
                )
              ) : (
                <p className="text-sm text-ink-muted">會員未上載。</p>
              )}
            </CardBody>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>聯絡同取貨</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <p>
              {order.contact_name} · {order.contact_phone}
            </p>
            <p>{order.delivery_method === "delivery" ? `送貨：${order.address}` : "訓練場地自取"}</p>
            {order.notes && <p className="text-ink-muted">備註：{order.notes}</p>}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
