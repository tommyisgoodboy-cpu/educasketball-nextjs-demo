"use client";

import { useState } from "react";
import { simulateCustomPayment } from "@/app/(account)/account/orders/actions";
import { Button } from "@/components/ui/Button";
import { formatHKD } from "@/lib/utils";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 團體訂製：接受報價後直接付款（Stripe 測試模式 + 模擬付款成功） */
export function CustomPayPanel({
  id,
  amount,
  stripeReady,
  accepted,
}: {
  id: string;
  amount: number;
  stripeReady: boolean;
  accepted: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function payWithStripe() {
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch(`${BASE}/api/stripe/custom-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "未能開啟付款頁");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "未能開啟付款頁");
      setBusy(false);
    }
  }

  return (
    <section
      className="space-y-4 rounded-lg border border-brand-200 bg-brand-50/60 p-5"
      aria-labelledby="custom-pay-title"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="custom-pay-title" className="text-lg font-bold text-ink">
          {accepted ? "已接受報價，請付款" : "付款"}
        </h3>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          Testing Payment Gate · 測試模式
        </span>
      </div>
      <p className="text-3xl font-bold text-brand-800">{formatHKD(amount)}</p>
      <p className="text-sm text-ink-muted">
        付款後我哋會安排製作，並通知你製作進度。示範站用
        <b className="text-ink">測試模式：唔會扣錢</b>，測試卡{" "}
        <code className="rounded bg-white px-1.5 py-0.5 text-ink">
          4242 4242 4242 4242
        </code>
        ，到期日揀未來日子，CVC 填任何 3 個數字。付款成功後狀態會
        <b className="text-ink">自動變「已付款・待製作」</b>。
      </p>
      <div className="space-y-2">
        <Button
          variant="cta"
          size="lg"
          fullWidth
          onClick={payWithStripe}
          disabled={busy || !stripeReady}
        >
          {busy
            ? "開啟付款頁…"
            : `網上付款 ${formatHKD(amount)}（信用卡 / 電子錢包）`}
        </Button>
        {!stripeReady && (
          <p className="text-xs text-ink-muted">
            Stripe 測試帳戶未連接到呢個示範站，暫時用下面嘅模擬付款睇流程。
          </p>
        )}
        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
      <div
        className="flex items-center gap-3 text-xs text-ink-muted"
        aria-hidden
      >
        <span className="h-px flex-1 bg-surface-border" />
        或者
        <span className="h-px flex-1 bg-surface-border" />
      </div>
      <form action={simulateCustomPayment.bind(null, id)} className="space-y-2">
        <Button type="submit" variant="secondary" fullWidth>
          示範：模擬付款成功
        </Button>
        <p className="text-xs text-ink-muted">
          唔經 Stripe，即時變「已付款」，睇下管理員之後會見到乜。
        </p>
      </form>
      <p className="text-xs text-ink-subtle">
        想用 FPS 轉數快？轉帳後 WhatsApp 通知我哋，職員喺後台確認收款。
      </p>
    </section>
  );
}
