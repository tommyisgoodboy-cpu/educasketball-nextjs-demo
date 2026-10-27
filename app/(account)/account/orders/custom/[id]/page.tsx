import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusSteps } from "@/components/account/OrderStatusSteps";
import { CustomPayPanel } from "@/components/account/CustomPayPanel";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { CUSTOM_ITEM_TYPE_LABELS, CUSTOM_SIZES } from "@/lib/constants";
import { CUSTOM_FABRIC_LABELS, CUSTOM_FEATURE_LABELS } from "@/lib/customQuote";
import { getMyCustomRequest } from "@/lib/data/account";
import { CUSTOM_STEPS } from "@/lib/order-steps";
import { confirmCustomFromStripeSession } from "@/lib/payment";
import { formatDateShort, formatHKD, formatTimestampDate } from "@/lib/utils";
import { acceptQuote } from "../../actions";

export const metadata = { title: "訂製詳情" };

export default async function CustomOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    paid?: string;
    session_id?: string;
    accepted?: string;
  }>;
}) {
  const [{ id }, { paid, session_id: sessionId, accepted }] = await Promise.all(
    [params, searchParams],
  );
  let r = await getMyCustomRequest(id);
  // 由 Stripe 返嚟：未收到 webhook 都先向 Stripe 核實
  if (
    r &&
    r.status === "accepted" &&
    r.payment_status !== "paid" &&
    paid === "stripe" &&
    sessionId
  ) {
    if (await confirmCustomFromStripeSession(sessionId, id))
      r = await getMyCustomRequest(id);
  }
  if (!r) notFound();

  const sizes = (r.size_breakdown ?? {}) as Record<string, number>;
  const orderedSizes = [
    ...CUSTOM_SIZES.filter((s) => s in sizes),
    ...Object.keys(sizes).filter((s) => !CUSTOM_SIZES.includes(s)),
  ];
  const isPaid = r.payment_status === "paid";
  const mustPay = r.status === "accepted" && !isPaid && r.quote_amount !== null;

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/account/orders?type=custom"
          className="text-sm text-ink-muted hover:text-brand-700"
        >
          ← 全部訂單
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-800">
          團體訂製・{r.team_name}
        </h1>
        <p className="text-sm text-ink-muted">
          提交日期：{formatTimestampDate(r.created_at)}
        </p>
      </header>

      {accepted && mustPay && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          已接受報價！請喺下面付款，我哋收到款項就開始安排製作。
        </p>
      )}
      {(paid === "stripe" || paid === "sim") && isPaid && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          付款成功（{paid === "stripe" ? "Stripe 測試模式" : "模擬付款"}
          ）！我哋會開始安排製作，有進度會更新喺呢度。
        </p>
      )}
      {paid === "cancel" && mustPay && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          你取消咗付款，仍然係「待付款」。可以再試。
        </p>
      )}
      {paid === "stripe" && mustPay && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          付款處理中，請稍後重新整理本頁。
        </p>
      )}
      {paid === "error" && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          暫時未能完成模擬付款，請再試。
        </p>
      )}

      <StatusSteps
        steps={CUSTOM_STEPS}
        current={r.status}
        cancelled={r.status === "cancelled"}
      />

      {r.status === "submitted" && (
        <Card>
          <CardBody className="text-sm text-ink-muted">
            我哋已收到你嘅查詢，職員會按你揀嘅面料同功能確認設計，並喺 2
            個工作天內喺度發出<b className="text-ink">正式報價</b>。
            {r.estimate_amount !== null && (
              <>
                {" "}
                你提交時睇到嘅大約報價（約{" "}
                {formatHKD(Number(r.estimate_amount))}）只供參考。
              </>
            )}
          </CardBody>
        </Card>
      )}

      {r.status === "quoted" && r.quote_amount !== null && (
        <Card className="border-cta/40">
          <CardHeader>
            <CardTitle>正式報價</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-3xl font-bold text-brand-800">
              {formatHKD(Number(r.quote_amount))}
            </p>
            {r.quote_note && (
              <p className="text-sm text-ink-muted">{r.quote_note}</p>
            )}
            <ConfirmButton
              variant="cta"
              size="md"
              confirmText={`接受報價 ${formatHKD(Number(r.quote_amount))}？接受後會去付款頁。`}
              action={acceptQuote.bind(null, r.id)}
            >
              接受報價並付款
            </ConfirmButton>
          </CardBody>
        </Card>
      )}

      {mustPay && r.quote_amount !== null && (
        <CustomPayPanel
          id={r.id}
          amount={Number(r.quote_amount)}
          accepted
          stripeReady={Boolean(process.env.STRIPE_SECRET_KEY)}
        />
      )}

      {isPaid && (
        <Card>
          <CardBody className="flex flex-wrap items-center gap-3 text-sm">
            <Badge tone="success">已付款</Badge>
            <span>
              {r.quote_amount !== null && formatHKD(Number(r.quote_amount))}
              {r.paid_at && ` · ${formatTimestampDate(r.paid_at)}`}
              {r.payment_method === "stripe"
                ? " · Stripe"
                : r.payment_method === "simulated"
                  ? " · 模擬付款"
                  : r.payment_method === "manual"
                    ? " · 職員確認收款"
                    : ""}
            </span>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {CUSTOM_ITEM_TYPE_LABELS[r.item_type]} · {r.qty} 件
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {orderedSizes.map((s) => (
              <span key={s} className="rounded-lg bg-surface-muted px-3 py-1.5">
                {s} × <strong>{sizes[s]}</strong>
              </span>
            ))}
          </div>
          {r.colors && <p>顏色：{r.colors}</p>}
          {r.fabric && (
            <p>面料：{CUSTOM_FABRIC_LABELS[r.fabric] ?? r.fabric}</p>
          )}
          {r.features?.length > 0 && (
            <p className="flex flex-wrap items-center gap-1.5">
              功能：
              {r.features.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700"
                >
                  {CUSTOM_FEATURE_LABELS[k] ?? k}
                </span>
              ))}
            </p>
          )}
          {r.due_date && <p>期望交貨：{formatDateShort(r.due_date)}</p>}
          {r.notes && <p className="text-ink-muted">備註：{r.notes}</p>}
        </CardBody>
      </Card>
    </div>
  );
}
