import { NextResponse } from "next/server";
import { getPaymentInfo, isUuid } from "@/lib/payment";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

// 建立 Stripe Checkout Session（用 REST，唔加 stripe 套件依賴）。示範站用測試模式 key。
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Stripe 未設定" }, { status: 503 });

  const { enrollmentId } = (await req.json().catch(() => ({}))) as { enrollmentId?: string };
  if (!isUuid(enrollmentId)) return NextResponse.json({ error: "報名編號唔正確" }, { status: 400 });

  const info = await getPaymentInfo(enrollmentId);
  if (!info) return NextResponse.json({ error: "搵唔到呢個報名" }, { status: 404 });
  if (info.payment_status === "paid") return NextResponse.json({ error: "已經付款" }, { status: 409 });
  if (info.status !== "pending" && info.status !== "confirmed") return NextResponse.json({ error: "呢個報名唔可以付款" }, { status: 409 });

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const base = host.startsWith("localhost") ? `http://${host}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}` : SITE_URL;
  const amount = Math.round(Number(info.price) * 100);

  const form = new URLSearchParams({
    mode: "payment",
    "adaptive_pricing[enabled]": "false", // 只收 HKD，唔俾客轉做 NT$ 等貨幣
    "managed_payments[enabled]": "false", // 我哋自己管稅務 / 客服，唔用 Managed Payments（+3.5%，仲要求商品稅碼）
    locale: "zh-HK",
    success_url: `${base}/enroll/paid?e=${enrollmentId}&via=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/enroll/paid?e=${enrollmentId}&via=cancel`,
    client_reference_id: enrollmentId,
    "metadata[enrollment_id]": enrollmentId,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "hkd",
    "line_items[0][price_data][unit_amount]": String(amount),
    "line_items[0][price_data][product_data][name]": `${info.course_title}（${info.sessions_count} 堂）— ${info.student_name}`,
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const session = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !session.url) {
    console.error("stripe checkout failed", session.error?.message);
    return NextResponse.json({ error: "未能開啟付款頁，請稍後再試" }, { status: 502 });
  }
  return NextResponse.json({ url: session.url });
}
