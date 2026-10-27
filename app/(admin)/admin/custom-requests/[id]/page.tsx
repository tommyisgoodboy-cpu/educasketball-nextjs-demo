import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPage";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { QuoteForm } from "@/components/admin/QuoteForm";
import { StatusSteps } from "@/components/account/OrderStatusSteps";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/admin";
import { CUSTOM_ITEM_TYPE_LABELS, CUSTOM_SIZES } from "@/lib/constants";
import { CUSTOM_FABRIC_LABELS, CUSTOM_FEATURE_LABELS } from "@/lib/customQuote";
import { Badge } from "@/components/ui/Badge";
import { getAdminCustomRequest } from "@/lib/data/admin-shop";
import { CUSTOM_STEPS } from "@/lib/order-steps";
import { formatDateShort, formatHKD, formatTimestampDate } from "@/lib/utils";
import { markCustomPaid, setCustomStatus } from "../actions";

export const metadata = { title: "訂製查詢詳情" };

export default async function CustomRequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const r = await getAdminCustomRequest((await params).id);
  if (!r) notFound();
  const sizes = (r.size_breakdown ?? {}) as Record<string, number>;
  const roster = (Array.isArray(r.roster) ? r.roster : []) as {
    number: number | null;
    name: string;
  }[];
  const orderedSizes = [
    ...CUSTOM_SIZES.filter((s) => s in sizes),
    ...Object.keys(sizes).filter((s) => !CUSTOM_SIZES.includes(s)),
  ];

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/custom-requests", label: "訂製查詢" }}
        title={r.team_name}
        description={`提交於 ${formatTimestampDate(r.created_at)} · ${r.profile_id ? "會員" : "訪客（會員區睇唔到，要電話聯絡）"}`}
        actions={
          <>
            {r.status === "quoted" && (
              <ConfirmButton
                variant="secondary"
                confirmText="代會員標示已接受報價？"
                action={setCustomStatus.bind(null, r.id, "quoted", "accepted")}
              >
                標示已接受
              </ConfirmButton>
            )}
            {r.status === "accepted" && r.payment_status !== "paid" && (
              <ConfirmButton
                variant="secondary"
                confirmText="確認已收到款項（例如 FPS 轉帳）？"
                action={markCustomPaid.bind(null, r.id)}
              >
                標示已收款
              </ConfirmButton>
            )}
            {r.status === "accepted" && (
              <ConfirmButton
                variant="primary"
                confirmText={
                  r.payment_status === "paid"
                    ? undefined
                    : "客人未付款，確定開始製作？"
                }
                action={setCustomStatus.bind(
                  null,
                  r.id,
                  "accepted",
                  "in_production",
                )}
              >
                開始製作
              </ConfirmButton>
            )}
            {r.status === "in_production" && (
              <ConfirmButton
                variant="primary"
                confirmText="確認已完成交貨？"
                action={setCustomStatus.bind(
                  null,
                  r.id,
                  "in_production",
                  "completed",
                )}
              >
                標示已完成
              </ConfirmButton>
            )}
            {!["completed", "cancelled"].includes(r.status) && (
              <ConfirmButton
                variant="ghost"
                confirmText="取消呢張訂製查詢？"
                action={setCustomStatus.bind(null, r.id, r.status, "cancelled")}
              >
                取消
              </ConfirmButton>
            )}
          </>
        }
      />
      <div className="mb-6">
        <StatusSteps
          steps={CUSTOM_STEPS}
          current={r.status}
          cancelled={r.status === "cancelled"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {CUSTOM_ITEM_TYPE_LABELS[r.item_type]} · {r.qty} 件
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                {orderedSizes.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg bg-surface-muted px-3 py-1.5"
                  >
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
              {r.logoUrl ? (
                <a
                  href={r.logoUrl}
                  className="inline-block font-semibold text-brand-700 hover:underline"
                >
                  下載 logo →
                </a>
              ) : (
                <p className="text-ink-subtle">冇上載 logo</p>
              )}
            </CardBody>
          </Card>

          {roster.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>號碼名單（{roster.length}）</CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="grid grid-cols-2 gap-1 text-sm sm:grid-cols-4">
                  {roster.map((p, i) => (
                    <li key={i}>
                      <strong className="inline-block w-8">
                        {p.number ?? "—"}
                      </strong>
                      {p.name}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>聯絡</CardTitle>
            </CardHeader>
            <CardBody className="space-y-1 text-sm">
              <p>{r.contact_name}</p>
              <p>{r.contact_phone}</p>
              {r.contact_email && <p>{r.contact_email}</p>}
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>報價</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {r.estimate_amount !== null && (
                <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                  <p className="font-semibold">
                    客人睇到嘅系統估價：約{" "}
                    {formatHKD(Number(r.estimate_amount))}
                  </p>
                  <p className="text-xs">
                    只係按面料 / 功能 / 數量計出嚟嘅參考價；
                    <b>你確認後發出嘅正式報價先算數</b>。
                  </p>
                </div>
              )}
              {["submitted", "quoted"].includes(r.status) ? (
                <QuoteForm
                  id={r.id}
                  amount={
                    r.quote_amount ??
                    (r.estimate_amount !== null
                      ? Number(r.estimate_amount)
                      : null)
                  }
                  note={r.quote_note}
                  isDraft={r.quote_amount === null}
                />
              ) : (
                <p className="text-sm">
                  已報價 HK${r.quote_amount}
                  {r.quote_note && (
                    <span className="block text-ink-muted">{r.quote_note}</span>
                  )}
                </p>
              )}
              {r.status !== "submitted" &&
                r.status !== "quoted" &&
                r.status !== "cancelled" && (
                  <p className="flex items-center gap-2 text-sm">
                    付款：
                    {r.payment_status === "paid" ? (
                      <Badge tone="success">
                        已付款
                        {r.payment_method === "stripe"
                          ? "（Stripe）"
                          : r.payment_method === "simulated"
                            ? "（模擬）"
                            : ""}
                      </Badge>
                    ) : (
                      <Badge tone="warning">待客人付款</Badge>
                    )}
                  </p>
                )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
