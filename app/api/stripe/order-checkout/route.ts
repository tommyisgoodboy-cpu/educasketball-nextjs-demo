import { NextResponse } from "next/server";
import { getMyOrder } from "@/lib/data/account";
import { isUuid } from "@/lib/payment";
import { variantLabel } from "@/lib/variant";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

// 商店訂單：建立 Stripe Checkout Session（測試模式）。訂單由登入用戶 cookie 讀取（RLS 保證只可以付自己張單）。
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Stripe 未設定" }, { status: 503 });

  const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string };
  if (!isUuid(orderId)) return NextResponse.json({ error: "訂單編號唔正確" }, { status: 400 });
  const order = await getMyOrder(orderId);
  if (!order) return NextResponse.json({ error: "搵唔到呢張訂單" }, { status: 404 });
  if (order.status !== "pending_payment") return NextResponse.json({ error: "呢張訂單唔需要付款" }, { status: 409 });

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const base = host.startsWith("localhost") ? `http://${host}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}` : SITE_URL;
  const names = order.order_items.map((i) => `${i.variant?.product?.name ?? "商品"}${i.variant ? `（${variantLabel(i.variant)}）` : ""} × ${i.qty}`).join("、");

  const form = new URLSearchParams({
    mode: "payment",
    "adaptive_pricing[enabled]": "false",
    "managed_payments[enabled]": "false",
    locale: "zh-HK",
    success_url: `${base}/account/orders/${orderId}?paid=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/account/orders/${orderId}?paid=cancel`,
    client_reference_id: orderId,
    "metadata[order_id]": orderId,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "hkd",
    "line_items[0][price_data][unit_amount]": String(Math.round(Number(order.total) * 100)),
    "line_items[0][price_data][product_data][name]": `Educasketball 商店訂單 ${orderId.slice(0, 8).toUpperCase()}`,
    "line_items[0][price_data][product_data][description]": names.slice(0, 480),
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const session = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !session.url) {
    console.error("stripe order checkout failed", session.error?.message);
    return NextResponse.json({ error: "未能開啟付款頁，請稍後再試" }, { status: 502 });
  }
  return NextResponse.json({ url: session.url });
}
