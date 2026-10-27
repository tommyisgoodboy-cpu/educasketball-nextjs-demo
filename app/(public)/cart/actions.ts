"use server";

import { getCartLines, type CartLine } from "@/lib/data/shop";

/** 購物車喺瀏覽器，價錢同庫存由 server 讀返最新資料 */
export async function loadCart(items: { variantId: string; qty: number }[]): Promise<CartLine[]> {
  if (!Array.isArray(items)) return [];
  return getCartLines(items.slice(0, 30).map((i) => ({ variantId: String(i.variantId), qty: Math.max(1, Math.min(20, Number(i.qty) || 1)) })));
}
