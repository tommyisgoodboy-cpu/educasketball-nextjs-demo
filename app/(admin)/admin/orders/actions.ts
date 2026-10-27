"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";

/** 改訂單狀態；庫存、積分由 DB trigger 處理，狀態流程亦由 DB 把關 */
export async function setOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) {
    if (!["EB003", "P0001"].includes(error.code ?? "")) console.error("setOrderStatus failed", error);
    return { error: error.message.includes("庫存不足") ? error.message : error.code === "EB003" ? error.message : "暫時未能更新" };
  }
  revalidatePath("/", "layout");
  return {};
}
