"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { InlineLoading } from "@/components/ui/PageLoading";
import { placeOrder, type CheckoutState } from "@/app/(public)/checkout/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { variantLabel } from "@/lib/variant";
import { cn, formatHKD } from "@/lib/utils";
import { useCartLines } from "./CartView";

export function CheckoutForm({
  defaults,
  balance,
  redeemPoints,
  redeemValue,
}: {
  defaults: { name: string; phone: string };
  balance: number;
  redeemPoints: number;
  redeemValue: number;
}) {
  const router = useRouter();
  const { cart, lines, subtotal, problems } = useCartLines();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, { status: "idle" });
  const [method, setMethod] = useState<"pickup" | "delivery">("pickup");
  const [points, setPoints] = useState(0);

  // 落單成功：清空購物車，去訂單頁睇付款指示
  useEffect(() => {
    if (state.status === "placed") {
      cart.clear();
      router.replace(`/account/orders/${state.orderId}?new=1`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (lines === null || state.status === "placed") return <InlineLoading />;
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-surface-border bg-white px-6 py-14 text-center">
        <p className="font-semibold">購物車係空嘅</p>
        <ButtonLink href="/shop" variant="cta">
          去商店睇吓
        </ButtonLink>
      </div>
    );
  }

  // 可用積分：redeemPoints 嘅倍數，唔超過餘額，折扣唔超過貨款
  const maxUnits = Math.min(Math.floor(balance / redeemPoints), Math.floor(subtotal / redeemValue));
  const pointOptions = Array.from({ length: maxUnits + 1 }, (_, i) => i * redeemPoints);
  const discount = (points / redeemPoints) * redeemValue;
  const err = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_22rem]" noValidate>
      <input type="hidden" name="items" value={JSON.stringify(cart.items)} />
      <input type="hidden" name="points" value={points} />

      <div className="space-y-6">
        {state.status === "error" && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle>取貨方式</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <input type="hidden" name="delivery_method" value={method} />
            <div role="radiogroup" aria-label="取貨方式" className="grid gap-2 sm:grid-cols-2">
              {[
                { v: "pickup" as const, label: "訓練場地自取", sub: "上堂時喺場地交收" },
                { v: "delivery" as const, label: "送貨", sub: "香港地址，免運費" },
              ].map((o) => (
                <label key={o.v} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-3", method === o.v ? "border-brand-500 bg-brand-50" : "border-surface-border")}>
                  <input type="radio" name="method_choice" checked={method === o.v} onChange={() => setMethod(o.v)} className="h-4 w-4 accent-brand-600" />
                  <span>
                    <span className="block font-semibold">{o.label}</span>
                    <span className="block text-xs text-ink-muted">{o.sub}</span>
                  </span>
                </label>
              ))}
            </div>
            {method === "delivery" && (
              <Field label="送貨地址" required error={err.address}>
                {(p) => <Textarea {...p} name="address" rows={2} maxLength={300} autoComplete="street-address" />}
              </Field>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>聯絡資料</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="聯絡人" required error={err.contact_name}>
              {(p) => <Input {...p} name="contact_name" defaultValue={defaults.name} autoComplete="name" />}
            </Field>
            <Field label="聯絡電話" required error={err.contact_phone}>
              {(p) => <PhoneInput {...p} name="contact_phone" defaultValue={defaults.phone} />}
            </Field>
            <Field label="備註" className="sm:col-span-2">
              {(p) => <Textarea {...p} name="notes" rows={2} maxLength={500} />}
            </Field>
          </CardBody>
        </Card>
      </div>

      <Card className="self-start">
        <CardHeader>
          <CardTitle>訂單摘要</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <ul className="space-y-2">
            {lines.map((l) => (
              <li key={l.variantId} className="flex justify-between gap-3">
                <span className="min-w-0">
                  {l.name} <span className="text-ink-muted">· {variantLabel(l)} × {l.qty}</span>
                </span>
                <span className="shrink-0">{formatHKD(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-surface-border pt-3">
            <div className="flex justify-between">
              <span>小計</span>
              <span>{formatHKD(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="points-select">積分抵扣</label>
              <select
                id="points-select"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                disabled={pointOptions.length <= 1}
                className="h-9 rounded-lg border border-surface-border bg-white px-2"
              >
                {pointOptions.map((p) => (
                  <option key={p} value={p}>
                    {p === 0 ? "唔使用" : `用 ${p} 分（-$${(p / redeemPoints) * redeemValue}）`}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-ink-subtle">
              餘額 {balance} 分 · 每 {redeemPoints} 分抵 ${redeemValue}
            </p>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>折扣</span>
                <span>-{formatHKD(discount)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between border-t border-surface-border pt-3 text-lg font-bold">
            <span>應付</span>
            <span>{formatHKD(subtotal - discount)}</span>
          </div>
          {problems.length > 0 && <p className="text-red-600">有商品庫存不足，請返回購物車修改。</p>}
          <Button type="submit" variant="cta" size="lg" fullWidth disabled={pending || problems.length > 0}>
            {pending ? "落單中…" : "確認落單"}
          </Button>
          <p className="text-xs text-ink-subtle">落單後可以揀網上付款（信用卡 / 電子錢包，測試模式），或者用 FPS 轉數快付款再上載截圖。</p>
        </CardBody>
      </Card>
    </form>
  );
}
