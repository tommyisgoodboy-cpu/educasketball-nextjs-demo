import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { markCustomPaid, markOrderPaid, markPaid } from "@/lib/payment";

export const runtime = "nodejs";

// Stripe webhook：驗簽（HMAC-SHA256，5 分鐘容差）→ checkout.session.completed → 報名自動「已確認」
function verify(raw: string, header: string | null, secret: string) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
  const sigs = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  return sigs.some((s) => s.length === expected.length && timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "未設定 webhook secret" }, { status: 503 });

  const raw = await req.text();
  if (!verify(raw, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "簽名唔正確" }, { status: 400 });
  }

  const event = JSON.parse(raw) as {
    type: string;
    data: { object: { id: string; payment_status?: string; metadata?: { enrollment_id?: string; order_id?: string; custom_id?: string } } };
  };
  if (event.type === "checkout.session.completed" && event.data.object.payment_status === "paid") {
    const id = event.data.object.metadata?.enrollment_id;
    if (id) {
      const result = await markPaid(id, "stripe", event.data.object.id);
      if (!result.ok) console.error("markPaid failed", result.error);
    }
    const orderId = event.data.object.metadata?.order_id;
    if (orderId) {
      const result = await markOrderPaid(orderId, "stripe", event.data.object.id);
      if (!result.ok) console.error("markOrderPaid failed", result.error);
    }
    const customId = event.data.object.metadata?.custom_id;
    if (customId) {
      const result = await markCustomPaid(customId, "stripe", event.data.object.id);
      if (!result.ok) console.error("markCustomPaid failed", result.error);
    }
  }
  return NextResponse.json({ received: true });
}
