"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { markCustomPaid, markOrderPaid } from "@/lib/payment";
import { createClient } from "@/lib/supabase/server";

/** 檔案已經由瀏覽器直接上載到 payment-proofs/<uid>/…，呢度只記低路徑 */
export async function attachPaymentProof(orderId: string, path: string) {
  const user = await getUser();
  if (!user) return { error: "請重新登入" };
  if (!path.startsWith(`${user.id}/`) || path.includes("..") || path.length > 200) return { error: "檔案路徑唔正確" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_proof_url: path })
    .eq("id", orderId)
    .eq("profile_id", user.id)
    .eq("status", "pending_payment")
    .select("id");
  if (error || !data?.length) {
    if (error) console.error("attachPaymentProof failed", error);
    return { error: "訂單已經唔係待付款狀態，或者暫時未能儲存" };
  }
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/admin", "layout");
  return {};
}

export async function acceptQuote(id: string) {
  if (!(await getUser())) return { error: "請重新登入" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_custom_quote", { p_id: id });
  if (error) return { error: error.code === "EB003" ? error.message : "暫時未能更新" };
  revalidatePath("/account/orders");
  revalidatePath("/admin", "layout");
  // 接受報價之後直接去付款頁
  redirect(`/account/orders/custom/${id}?accepted=1`);
}

/** 示範：模擬付款成功（唔經 Stripe）。訂單會即時由「待付款」變「已付款」，庫存同積分自動處理 */
export async function simulateOrderPayment(orderId: string) {
  if (!(await getUser())) return;
  const r = await markOrderPaid(orderId, "simulated", `DEMO-SIM-${Date.now()}`);
  revalidatePath("/account", "layout");
  revalidatePath("/admin", "layout");
  redirect(`/account/orders/${orderId}?paid=${r.ok ? "sim" : "error"}`);
}

/** 示範：訂製模擬付款成功（唔經 Stripe） */
export async function simulateCustomPayment(id: string) {
  if (!(await getUser())) return;
  const r = await markCustomPaid(id, "simulated", `DEMO-SIM-${Date.now()}`);
  revalidatePath("/account", "layout");
  revalidatePath("/admin", "layout");
  redirect(`/account/orders/custom/${id}?paid=${r.ok ? "sim" : "error"}`);
}
