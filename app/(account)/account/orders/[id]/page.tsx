import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusSteps } from "@/components/account/OrderStatusSteps";
import { OrderPayPanel } from "@/components/account/OrderPayPanel";
import { PaymentProofUpload } from "@/components/account/PaymentProofUpload";
import { ProductImage } from "@/components/shop/ProductImage";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { getUser } from "@/lib/auth";
import { getMyOrder } from "@/lib/data/account";
import { getFpsSettings } from "@/lib/data/shop";
import { confirmOrderFromStripeSession } from "@/lib/payment";
import { variantLabel } from "@/lib/variant";
import { ORDER_STEPS, shortId } from "@/lib/order-steps";
import type { ProductCategory } from "@/lib/supabase/types";
import { formatHKD, formatTimestampDate } from "@/lib/utils";

export const metadata = { title: "訂單詳情" };

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string; paid?: string; session_id?: string }> }) {
  const [{ id }, { new: isNew, paid, session_id: sessionId }] = await Promise.all([params, searchParams]);
  let [order, fps, user] = await Promise.all([getMyOrder(id), getFpsSettings(), getUser()]);
  // 由 Stripe 返嚟：未收到 webhook 都先向 Stripe 核實，核實到就標記已付款
  if (order && order.status === "pending_payment" && paid === "stripe" && sessionId) {
    if (await confirmOrderFromStripeSession(sessionId, id)) order = await getMyOrder(id);
  }
  if (!order || !user) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/account/orders" className="text-sm text-ink-muted hover:text-brand-700">
          ← 全部訂單
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-800">訂單 {shortId(order.id)}</h1>
        <p className="text-sm text-ink-muted">落單日期：{formatTimestampDate(order.created_at)}</p>
      </header>

      {(paid === "stripe" || paid === "sim") && order.status !== "pending_payment" && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          付款成功（{paid === "stripe" ? "Stripe 測試模式" : "模擬付款"}）！訂單已經變「已付款」，我哋會盡快安排出貨。
        </p>
      )}
      {paid === "cancel" && order.status === "pending_payment" && (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          你取消咗付款，訂單仍然係「待付款」。可以再試，或者用 FPS 轉數。
        </p>
      )}
      {paid === "stripe" && order.status === "pending_payment" && (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          付款處理中，請稍後重新整理本頁。
        </p>
      )}
      {paid === "error" && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          暫時未能完成模擬付款，請再試。
        </p>
      )}

      {isNew && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          落單成功！請按以下資料用 FPS 轉數快付款，然後上載付款截圖。
        </p>
      )}

      <StatusSteps steps={ORDER_STEPS} current={order.status} cancelled={order.status === "cancelled"} />

      {order.status === "pending_payment" && <OrderPayPanel orderId={order.id} stripeReady={Boolean(process.env.STRIPE_SECRET_KEY)} />}

      {order.status === "pending_payment" && (
        <Card className="border-cta/40">
          <CardHeader>
            <CardTitle>FPS 轉數快付款</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <dl className="grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-ink-subtle">應付金額</dt>
                <dd className="text-2xl font-bold text-ink">{formatHKD(order.total)}</dd>
              </div>
              <div>
                <dt className="text-ink-subtle">FPS 識別碼</dt>
                <dd className="text-lg font-semibold">{fps.fps_id || "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-subtle">收款人</dt>
                <dd className="text-lg font-semibold">{fps.account_name || "—"}</dd>
              </div>
            </dl>
            {fps.instructions && <p className="text-sm text-ink-muted">{fps.instructions}</p>}
            <p className="text-sm text-ink-muted">轉賬備註請寫訂單編號 {shortId(order.id)}。</p>
            <PaymentProofUpload orderId={order.id} userId={user.id} hasProof={Boolean(order.payment_proof_url)} />
          </CardBody>
        </Card>
      )}

      {order.proofUrl && (
        <Card>
          <CardHeader>
            <CardTitle>已上載嘅付款截圖</CardTitle>
          </CardHeader>
          <CardBody>
            <a href={order.proofUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-700 hover:underline">
              睇截圖 →
            </a>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>商品</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <ul className="divide-y divide-surface-border">
            {order.order_items.map((item) => {
              const product = item.variant?.product;
              return (
                <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0">
                  <ProductImage src={product?.images[0] ?? null} alt={product?.name ?? ""} category={(product?.category ?? "training") as ProductCategory} className="w-14 shrink-0 rounded-lg" sizes="56px" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{product?.name}</p>
                    <p className="text-sm text-ink-muted">
                      {item.variant ? variantLabel(item.variant) : ""} × {item.qty}
                    </p>
                  </div>
                  <span className="font-semibold">{formatHKD(item.unit_price * item.qty)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="space-y-1 border-t border-surface-border pt-3 text-sm">
            <Row label="小計" value={formatHKD(order.subtotal)} />
            {order.discount > 0 && <Row label={`積分抵扣（${order.points_used} 分）`} value={`-${formatHKD(order.discount)}`} />}
            <Row label="應付" value={formatHKD(order.total)} bold />
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>取貨資料</CardTitle>
        </CardHeader>
        <CardBody className="text-sm">
          <dl className="space-y-1">
            <Row label="方式" value={order.delivery_method === "delivery" ? "送貨" : "訓練場地自取"} />
            {order.address && <Row label="地址" value={order.address} />}
            <Row label="聯絡人" value={`${order.contact_name ?? ""} · ${order.contact_phone ?? ""}`} />
            {order.notes && <Row label="備註" value={order.notes} />}
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${bold ? "text-base font-bold" : ""}`}>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
