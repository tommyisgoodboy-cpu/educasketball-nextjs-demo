"use client";

import { useState } from "react";
import { simulateOrderPayment } from "@/app/(account)/account/orders/actions";
import { Button } from "@/components/ui/Button";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Testing Payment Gate：商店訂單網上付款（Stripe 測試模式）+ 模擬付款成功掣 */
export function OrderPayPanel({ orderId, stripeReady }: { orderId: string; stripeReady: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function payWithStripe() {
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch(`${BASE}/api/stripe/order-checkout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "未能開啟付款頁");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "未能開啟付款頁");
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-brand-200 bg-brand-50/60 p-5" aria-labelledby="order-pay-title">
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="order-pay-title" className="text-lg font-bold text-ink">
          網上付款
        </h3>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Testing Payment Gate · 測試模式</span>
      </div>
      <p className="text-sm text-ink-muted">
        真實嘅 Stripe 付款流程，但用<b className="text-ink">測試模式：唔會扣錢</b>。請用測試卡 <code className="rounded bg-white px-1.5 py-0.5 text-ink">4242 4242 4242 4242</code>，到期日揀任何未來日子，CVC 填任何 3 個數字。付款成功後訂單會<b className="text-ink">自動由「待付款」變「已付款」</b>，庫存同積分自動處理，唔使人手對單。
      </p>
      <div className="space-y-2">
        <Button variant="cta" size="lg" fullWidth onClick={payWithStripe} disabled={busy || !stripeReady}>
          {busy ? "開啟付款頁…" : "網上付款（信用卡 / 電子錢包）"}
        </Button>
        {!stripeReady && <p className="text-xs text-ink-muted">Stripe 測試帳戶未連接到呢個示範站，暫時用下面嘅模擬付款睇流程。</p>}
        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-ink-muted" aria-hidden>
        <span className="h-px flex-1 bg-surface-border" />
        或者
        <span className="h-px flex-1 bg-surface-border" />
      </div>
      <form action={simulateOrderPayment.bind(null, orderId)} className="space-y-2">
        <Button type="submit" variant="secondary" fullWidth>
          示範：模擬付款成功
        </Button>
        <p className="text-xs text-ink-muted">唔經 Stripe，訂單即時變「已付款」，睇下管理員同家長之後會見到乜。</p>
      </form>
      <p className="text-xs text-ink-subtle">想用 FPS 轉數快？可以照下面資料轉數，再上載付款截圖。</p>
    </section>
  );
}
