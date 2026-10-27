import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { confirmFromStripeSession, getPaymentInfo } from "@/lib/payment";
import { AutoRefresh } from "./AutoRefresh";

export const metadata: Metadata = { title: "付款結果", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const hkd = (n: number | string) => `HK$${Number(n).toLocaleString("en-HK")}`;

export default async function PaidPage({ searchParams }: { searchParams: Promise<{ e?: string; via?: string; error?: string; session_id?: string }> }) {
  const { e = "", via = "", error, session_id: sessionId = "" } = await searchParams;
  let info = await getPaymentInfo(e);
  // Stripe 返嚟：未收到 webhook 都先向 Stripe 核實，核實到就確認
  if (info && info.payment_status === "unpaid" && via === "stripe" && sessionId) {
    if (await confirmFromStripeSession(sessionId, e)) info = await getPaymentInfo(e);
  }

  if (!info) {
    return (
      <Container className="py-16">
        <Card>
          <CardBody className="space-y-4 text-center">
            <h1 className="text-2xl font-bold text-ink">搵唔到呢個報名</h1>
            <p className="text-ink-muted">連結可能已過期（示範資料每晚還原）。請返去課程頁重新報名。</p>
            <ButtonLink href="/courses" variant="cta">
              睇課程
            </ButtonLink>
          </CardBody>
        </Card>
      </Container>
    );
  }

  const paid = info.payment_status === "paid";
  const waitingStripe = !paid && via === "stripe";
  const cancelled = !paid && via === "cancel";

  return (
    <Container className="max-w-3xl space-y-6 py-12">
      {waitingStripe && <AutoRefresh />}

      <Card>
        <CardBody className="space-y-4 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m5 12 5 5L20 7" />
            </svg>
          </div>
          <div role="status" className="space-y-2">
            <h1 className="text-2xl font-bold text-ink">
              {paid ? "付款已收到，報名已確認" : waitingStripe ? "付款處理中…" : cancelled ? "你取消咗付款" : error ? "未能完成付款" : "未付款"}
            </h1>
            <p className="text-ink-muted">
              {paid
                ? `${info.student_name} 報讀「${info.course_title}」（${info.sessions_count} 堂）：${hkd(info.price)}。`
                : waitingStripe
                  ? "Stripe 通知緊系統，幾秒內會自動更新，毋須重新整理。"
                  : cancelled
                    ? "報名仍然係「待確認」，你隨時可以返去再付款。"
                    : "報名狀態仍然係「待確認」。"}
            </p>
          </div>
          {paid && (
            <div className="flex flex-wrap justify-center gap-2">
              <Badge tone="success">已確認</Badge>
              <Badge tone="brand">{via === "simulated" || info.status === "confirmed" ? (via === "simulated" ? "模擬付款（示範）" : "Stripe 付款（測試模式）") : "已付款"}</Badge>
            </div>
          )}
        </CardBody>
      </Card>

      {paid && (
        <Card>
          <CardBody className="space-y-5 sm:p-8">
            <h2 className="text-xl font-bold text-ink">付款成功之後，會自動發生乜事？</h2>
            <ol className="space-y-4 text-sm text-ink-muted">
              <li>
                <b className="text-ink">1. 報名自動「已確認」</b>：職員唔使再對轉數截圖、逐個改狀態。
              </li>
              <li>
                <b className="text-ink">2. 家長收到確認訊息</b>（示範預覽）：
                <span className="mt-2 block rounded-lg bg-surface-muted p-3 text-ink">
                  「你好！{info.student_name} 報讀嘅「{info.course_title}」已確認，付款 {hkd(info.price)} 已收到。上堂時間同地點請睇會員區，期待見到你！」
                </span>
                <span className="mt-1 block text-xs">（真實版可以經 email 或 WhatsApp Business 自動發出；WhatsApp 自動訊息要另外申請 Meta 驗證。）</span>
              </li>
              <li>
                <b className="text-ink">3. 管理員後台即時見到</b>：報名名單入面呢位學員已經係「已確認」，仲有付款方式同付款紀錄。
              </li>
              <li>
                <b className="text-ink">4. 會員區睇到上課時間表</b>、出席同積分。
              </li>
            </ol>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/admin/enrollments" variant="primary">
                睇管理員後台嘅報名名單
              </ButtonLink>
              <ButtonLink href="/register" variant="secondary">
                睇會員區
              </ButtonLink>
              <ButtonLink href="/courses" variant="ghost">
                睇其他課程
              </ButtonLink>
            </div>
            <p className="text-xs text-ink-muted">管理員示範帳戶喺網頁頂部橫幅，打開就見到。</p>
          </CardBody>
        </Card>
      )}

      {!paid && (
        <div className="text-center">
          <ButtonLink href="/courses" variant="secondary">
            返去課程
          </ButtonLink>
        </div>
      )}
    </Container>
  );
}
