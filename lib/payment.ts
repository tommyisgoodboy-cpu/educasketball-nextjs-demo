import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PaymentInfo = {
  enrollment_id: string;
  status: "pending" | "confirmed" | "waitlist" | "cancelled";
  payment_status: "unpaid" | "paid";
  paid_at: string | null;
  course_title: string;
  price: number | string;
  sessions_count: number;
  student_name: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

// 示範用 RPC（database.types 未收錄），用細型別包住
type Rpc = (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
async function rpc() {
  const supabase = await createClient();
  return supabase.rpc.bind(supabase) as unknown as Rpc;
}

export async function getPaymentInfo(enrollmentId: string): Promise<PaymentInfo | null> {
  if (!isUuid(enrollmentId)) return null;
  const { data, error } = await (await rpc())("enrollment_payment_info", { p_enrollment_id: enrollmentId });
  if (error || !Array.isArray(data) || !data[0]) return null;
  return data[0] as PaymentInfo;
}

/** 客由 Stripe 返嚟時：伺服器向 Stripe 核實 session 已付款，再確認報名（webhook 之外嘅後備；兩邊都係冪等） */
export async function confirmFromStripeSession(sessionId: string, enrollmentId: string) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId) || !isUuid(enrollmentId)) return false;
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) return false;
  const session = (await res.json()) as { payment_status?: string; metadata?: { enrollment_id?: string } };
  if (session.payment_status !== "paid" || session.metadata?.enrollment_id !== enrollmentId) return false;
  const result = await markPaid(enrollmentId, "stripe", sessionId);
  return result.ok;
}

/** 示範站：將報名標記為已付款（只限 demo_mode；正式版會改用 service role + webhook 驗簽） */
export async function markPaid(enrollmentId: string, method: "stripe" | "simulated", ref: string) {
  if (!isUuid(enrollmentId)) return { ok: false as const, error: "報名編號唔正確" };
  const { error } = await (await rpc())("mark_enrollment_paid", { p_enrollment_id: enrollmentId, p_method: method, p_ref: ref });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

// ---------- 商店訂單（Testing Payment Gate） ----------

/** 示範站：將商店訂單標記為已付款（待付款 → 已付款；庫存 / 積分由 trigger 處理） */
export async function markOrderPaid(orderId: string, method: "stripe" | "simulated", ref: string) {
  if (!isUuid(orderId)) return { ok: false as const, error: "訂單編號唔正確" };
  const { error } = await (await rpc())("mark_order_paid_demo", { p_order_id: orderId, p_method: method, p_ref: ref });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

/** 客由 Stripe 返嚟：伺服器向 Stripe 核實 session 已付款，再標記訂單已付款（webhook 之外嘅後備；冪等） */
export async function confirmOrderFromStripeSession(sessionId: string, orderId: string) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId) || !isUuid(orderId)) return false;
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!res.ok) return false;
  const session = (await res.json()) as { payment_status?: string; metadata?: { order_id?: string } };
  if (session.payment_status !== "paid" || session.metadata?.order_id !== orderId) return false;
  return (await markOrderPaid(orderId, "stripe", sessionId)).ok;
}


// ---------- 團體訂製（接受報價後付款；Testing Payment Gate） ----------

/** 示範站：將已接受報價嘅訂製標記為已付款（只限 accepted + unpaid；冪等） */
export async function markCustomPaid(id: string, method: "stripe" | "simulated", ref: string) {
  if (!isUuid(id)) return { ok: false as const, error: "編號唔正確" };
  const { error } = await (await rpc())("mark_custom_paid_demo", { p_id: id, p_method: method, p_ref: ref });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

/** 客由 Stripe 返嚟：伺服器向 Stripe 核實 session 已付款，再標記訂製已付款（webhook 之外嘅後備；冪等） */
export async function confirmCustomFromStripeSession(sessionId: string, id: string) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId) || !isUuid(id)) return false;
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!res.ok) return false;
  const session = (await res.json()) as { payment_status?: string; metadata?: { custom_id?: string } };
  if (session.payment_status !== "paid" || session.metadata?.custom_id !== id) return false;
  return (await markCustomPaid(id, "stripe", sessionId)).ok;
}
