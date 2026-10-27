"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type { CustomRequestStatus } from "@/lib/supabase/types";

export type QuoteState = { status: "idle" } | { status: "saved" } | { status: "error"; message: string };

export async function saveQuote(id: string, _prev: QuoteState, formData: FormData): Promise<QuoteState> {
  await requireAdmin();
  const amount = Number(formData.get("quote_amount"));
  const note = String(formData.get("quote_note") ?? "").trim();
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) return { status: "error", message: "請輸入報價金額" };
  if (note.length > 1000) return { status: "error", message: "備註太長" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("custom_requests")
    .update({ quote_amount: amount, quote_note: note || null, status: "quoted" })
    .eq("id", id)
    .in("status", ["submitted", "quoted"])
    .select("id");
  if (error || !data?.length) return { status: "error", message: "已接受報價或者已開始製作，唔可以再改報價" };
  revalidatePath("/admin", "layout");
  revalidatePath("/account/orders");
  return { status: "saved" };
}

const NEXT: Partial<Record<CustomRequestStatus, CustomRequestStatus[]>> = {
  submitted: ["cancelled"],
  quoted: ["accepted", "cancelled"],
  accepted: ["in_production", "cancelled"],
  in_production: ["completed", "cancelled"],
};

export async function setCustomStatus(id: string, from: CustomRequestStatus, to: CustomRequestStatus) {
  await requireAdmin();
  if (!NEXT[from]?.includes(to)) return { error: "唔可以咁改狀態" };
  const supabase = await createClient();
  const { data, error } = await supabase.from("custom_requests").update({ status: to }).eq("id", id).eq("status", from).select("id");
  if (error || !data?.length) return { error: "狀態已經改咗，請重新載入" };
  revalidatePath("/admin", "layout");
  revalidatePath("/account/orders");
  return {};
}

/** 管理員確認已收款（例如客人用 FPS 轉帳） */
export async function markCustomPaid(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("custom_requests")
    .update({ payment_status: "paid", payment_method: "manual", paid_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "accepted")
    .eq("payment_status", "unpaid")
    .select("id");
  if (error || !data?.length) return { error: "未能更新，請重新載入" };
  revalidatePath("/admin", "layout");
  revalidatePath("/account/orders");
  return {};
}
