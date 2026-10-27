import { NextResponse } from "next/server";
import { getMyCustomRequest } from "@/lib/data/account";
import { CUSTOM_FABRIC_LABELS, CUSTOM_FEATURE_LABELS } from "@/lib/customQuote";
import { CUSTOM_ITEM_TYPE_LABELS } from "@/lib/constants";
import { isUuid } from "@/lib/payment";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

// 團體訂製：接受報價後建立 Stripe Checkout Session（測試模式）。查詢由登入用戶 cookie 讀取（只可以付自己嗰張）。
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Stripe 未設定" }, { status: 503 });

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!isUuid(id)) return NextResponse.json({ error: "編號唔正確" }, { status: 400 });
  const r = await getMyCustomRequest(id);
  if (!r) return NextResponse.json({ error: "搵唔到呢張訂製" }, { status: 404 });
  if (r.status !== "accepted" || r.payment_status === "paid" || r.quote_amount === null) return NextResponse.json({ error: "呢張訂製而家唔需要付款" }, { status: 409 });

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const base = host.startsWith("localhost") ? `http://${host}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}` : SITE_URL;
  const desc = [CUSTOM_ITEM_TYPE_LABELS[r.item_type] + ` ${r.qty} 件`, r.fabric ? CUSTOM_FABRIC_LABELS[r.fabric] : "", ...(r.features ?? []).map((k) => CUSTOM_FEATURE_LABELS[k] ?? k)].filter(Boolean).join("、");

  const form = new URLSearchParams({
    mode: "payment",
    "adaptive_pricing[enabled]": "false",
    "managed_payments[enabled]": "false",
    locale: "zh-HK",
    success_url: `${base}/account/orders/custom/${id}?paid=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/account/orders/custom/${id}?paid=cancel`,
    client_reference_id: id,
    "metadata[custom_id]": id,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "hkd",
    "line_items[0][price_data][unit_amount]": String(Math.round(Number(r.quote_amount) * 100)),
    "line_items[0][price_data][product_data][name]": `Educasketball 團體訂製・${r.team_name}`.slice(0, 120),
    "line_items[0][price_data][product_data][description]": desc.slice(0, 480),
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const session = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !session.url) {
    console.error("stripe custom checkout failed", session.error?.message);
    return NextResponse.json({ error: "未能開啟付款頁，請稍後再試" }, { status: 502 });
  }
  return NextResponse.json({ url: session.url });
}
