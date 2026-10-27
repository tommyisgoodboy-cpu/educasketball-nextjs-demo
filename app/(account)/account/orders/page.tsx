import Link from "next/link";
import { StatusSteps } from "@/components/account/OrderStatusSteps";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import {
  getMyCustomRequests,
  getMyUnifiedOrders,
  type UnifiedOrder,
} from "@/lib/data/account";
import { CUSTOM_STEPS } from "@/lib/order-steps";
import {
  cn,
  formatDateShort,
  formatHKD,
  formatTimestampDate,
} from "@/lib/utils";
import { acceptQuote } from "./actions";

export const metadata = { title: "訂單" };

const KINDS: { value: UnifiedOrder["kind"] | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "course", label: "課程報名" },
  { value: "shop", label: "商店" },
  { value: "custom", label: "團體訂製" },
];
const KIND_TAG: Record<
  UnifiedOrder["kind"],
  { label: string; icon: string; cls: string }
> = {
  course: {
    label: "課程",
    icon: "🏀",
    cls: "bg-brand-50 text-brand-700 ring-brand-200",
  },
  shop: {
    label: "商店",
    icon: "🛍️",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  custom: {
    label: "訂製",
    icon: "👕",
    cls: "bg-violet-50 text-violet-700 ring-violet-200",
  },
};

/** 訂單：課程報名、商店訂單、團體訂製，全部一個 list，每項都標明類型同項目名 */
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    pay?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const { type, pay: rawPay, from: rawFrom, to: rawTo } = await searchParams;
  const pay = rawPay === "paid" || rawPay === "unpaid" ? rawPay : undefined;
  const from = /^\d{4}-\d{2}-\d{2}$/.test(rawFrom ?? "") ? rawFrom : undefined;
  const to = /^\d{4}-\d{2}-\d{2}$/.test(rawTo ?? "") ? rawTo : undefined;
  const kind = KINDS.some((k) => k.value === type)
    ? (type as UnifiedOrder["kind"] | "all")
    : "all";
  const [all, customs] = await Promise.all([
    getMyUnifiedOrders(),
    getMyCustomRequests(),
  ]);
  const customById = new Map(customs.map((c) => [c.id, c]));
  const hkDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });
  const rows = all.filter(
    (o) =>
      (kind === "all" || o.kind === kind) &&
      (!pay || o.pay === pay) &&
      (!from || hkDate(o.date) >= from) &&
      (!to || hkDate(o.date) <= to),
  );
  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    Object.entries({
      type: kind === "all" ? undefined : kind,
      pay,
      from,
      to,
      ...over,
    }).forEach(([k, v]) => v && p.set(k, v));
    const str = p.toString();
    return `/account/orders${str ? `?${str}` : ""}`;
  };
  const count = (k: string) =>
    k === "all" ? all.length : all.filter((o) => o.kind === k).length;
  const unpaid = all.filter((o) => o.action).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-800 sm:text-3xl">
            我的訂單
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            課程報名、商店訂單同團體訂製，全部喺度，按日期排。
            {unpaid > 0 && (
              <b className="ml-1 text-amber-700">{unpaid} 項待付款</b>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/courses" size="sm" variant="secondary">
            報課程
          </ButtonLink>
          <ButtonLink href="/shop" size="sm" variant="secondary">
            去商店
          </ButtonLink>
          <ButtonLink href="/custom" size="sm" variant="secondary">
            團體訂製
          </ButtonLink>
        </div>
      </header>

      <nav aria-label="訂單類型" className="flex flex-wrap gap-1">
        {KINDS.map((k) => (
          <Link
            key={k.value}
            href={qs({ type: k.value === "all" ? undefined : k.value })}
            aria-current={kind === k.value ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium",
              kind === k.value
                ? "bg-brand-700 text-white"
                : "bg-white text-ink-muted hover:text-brand-700",
            )}
          >
            {k.label}
            <span className="ml-1 opacity-70">({count(k.value)})</span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="付款狀態"
          className="inline-flex overflow-hidden rounded-lg border border-surface-border bg-white text-sm font-semibold"
        >
          {(
            [
              [undefined, "全部付款"],
              ["unpaid", "未支付"],
              ["paid", "已支付"],
            ] as const
          ).map(([v, label]) => (
            <Link
              key={label}
              href={qs({ pay: v })}
              aria-current={pay === v ? "true" : undefined}
              className={cn(
                "px-3 py-1.5",
                pay === v
                  ? "bg-brand-700 text-white"
                  : "text-brand-700 hover:bg-brand-50",
              )}
            >
              {label}
            </Link>
          ))}
        </div>
        <form
          action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/account/orders`}
          className="flex flex-wrap items-center gap-1.5 text-sm"
        >
          {kind !== "all" && <input type="hidden" name="type" value={kind} />}
          {pay && <input type="hidden" name="pay" value={pay} />}
          <input
            type="date"
            name="from"
            defaultValue={from}
            aria-label="日期由"
            className="h-10 rounded-lg border border-surface-border bg-white px-2"
          />
          <span className="text-xs text-ink-subtle">至</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            aria-label="日期到"
            className="h-10 rounded-lg border border-surface-border bg-white px-2"
          />
          <button
            type="submit"
            className="h-10 rounded-lg bg-brand-700 px-3 text-sm font-semibold text-white"
          >
            篩選
          </button>
          {(from || to) && (
            <Link
              href={qs({ from: undefined, to: undefined })}
              className="text-xs text-ink-muted hover:underline"
            >
              清除日期
            </Link>
          )}
        </form>
      </div>

      <Card>
        <CardBody className="p-0">
          {rows.length === 0 ? (
            <p className="p-6 text-sm text-ink-muted">暫時未有訂單。</p>
          ) : (
            <ul className="divide-y divide-surface-border">
              {rows.map((o) => {
                const tag = KIND_TAG[o.kind];
                const custom = o.customId
                  ? customById.get(o.customId)
                  : undefined;
                return (
                  <li
                    key={o.key}
                    id={o.customId ? `c-${o.customId}` : undefined}
                    className="space-y-3 p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
                              tag.cls,
                            )}
                          >
                            <span aria-hidden>{tag.icon}</span>
                            {tag.label}
                          </span>
                          <Link
                            href={o.href}
                            className="font-semibold text-ink hover:text-brand-700 hover:underline"
                          >
                            {o.title}
                          </Link>
                        </div>
                        <ul className="text-sm text-ink-muted">
                          {o.lines.map((l, i) => (
                            <li key={i}>{l}</li>
                          ))}
                        </ul>
                        <p className="text-xs text-ink-subtle">
                          {formatTimestampDate(o.date)}
                        </p>
                      </div>
                      <div className="shrink-0 space-y-1 text-right">
                        <p className="font-semibold">
                          {o.amount === null ? (
                            <span className="text-sm font-normal text-ink-subtle">
                              待報價
                            </span>
                          ) : (
                            formatHKD(o.amount)
                          )}
                        </p>
                        <Badge tone={o.tone}>{o.status}</Badge>
                        {o.action && (
                          <div className="pt-1">
                            <ButtonLink href={o.action.href} variant="cta" size="sm">
                              {o.action.label} →
                            </ButtonLink>
                          </div>
                        )}
                      </div>
                    </div>

                    {custom && (
                      <div className="space-y-3 rounded-lg border border-surface-border bg-surface-muted/40 p-3">
                        <p className="text-xs text-ink-muted">
                          {custom.due_date &&
                            `期望 ${formatDateShort(custom.due_date)} 前交貨`}
                        </p>
                        <StatusSteps
                          steps={CUSTOM_STEPS}
                          current={custom.status}
                          cancelled={custom.status === "cancelled"}
                        />
                        {custom.quote_amount !== null && (
                          <div className="rounded-lg bg-brand-50 p-3 text-sm">
                            <p className="font-semibold text-brand-800">
                              報價：{formatHKD(custom.quote_amount)}
                            </p>
                            {custom.quote_note && (
                              <p className="mt-1 text-brand-700">
                                {custom.quote_note}
                              </p>
                            )}
                          </div>
                        )}
                        {custom.status === "quoted" && (
                          <ConfirmButton
                            variant="cta"
                            size="md"
                            confirmText={`接受報價 ${formatHKD(custom.quote_amount ?? 0)}？接受後會去付款頁。`}
                            action={acceptQuote.bind(null, custom.id)}
                          >
                            接受報價並付款
                          </ConfirmButton>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
