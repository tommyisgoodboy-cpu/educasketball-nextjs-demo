"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { simulatePayment } from "./payment-actions";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 報名成功後嘅付款面板：真 Stripe 付款流程（測試模式）+ 模擬付款成功掣 */
export function PayPanel({ enrollmentId, stripeReady }: { enrollmentId: string; stripeReady: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function payWithStripe() {
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch(`${BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
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
    <section className="space-y-4 rounded-lg border border-brand-200 bg-brand-50/60 p-5 text-left" aria-labelledby="pay-title">
      <h3 id="pay-title" className="text-lg font-bold text-ink">
        網上付款
      </h3>
      <p className="text-sm text-ink-muted">
        呢個係<b className="text-ink">真實嘅 Stripe 付款流程</b>，付款頁會顯示已開通嘅付款方式（信用卡、Alipay、WeChat Pay 等）：學員喺 Stripe 付款頁俾錢，成功後報名會<b className="text-ink">自動由「待確認」變「已確認」</b>，唔使人手對單。
        因為呢個係示範站，我哋用 Stripe <b className="text-ink">測試模式</b>：<b className="text-ink">唔會扣錢</b>，請用測試卡{" "}
        <code className="rounded bg-white px-1.5 py-0.5 text-ink">4242 4242 4242 4242</code>，到期日揀任何未來日子，CVC 填任何 3 個數字。
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

      <form action={simulatePayment.bind(null, enrollmentId)} className="space-y-2">
        <Button type="submit" variant="secondary" fullWidth>
          示範：模擬付款成功
        </Button>
        <p className="text-xs text-ink-muted">唔經 Stripe，直接跳去「付款成功之後」畫面，睇下確認後家長同管理員會見到乜。</p>
      </form>
    </section>
  );
}
