"use client";

import { useSyncExternalStore } from "react";

// 購物車存喺瀏覽器 localStorage（未登入都可以加），結帳時先交俾 server 計價。
export type CartItem = { variantId: string; qty: number };

const KEY = "eb_cart";
const EVENT = "eb-cart-change";
const MAX_QTY = 20;
const EMPTY: CartItem[] = [];

let cache: { raw: string | null; items: CartItem[] } = { raw: null, items: EMPTY };

function read(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.items;
  let items: CartItem[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      items = parsed
        .filter((i): i is CartItem => typeof i?.variantId === "string" && Number.isInteger(i?.qty) && i.qty > 0)
        .map((i) => ({ variantId: i.variantId, qty: Math.min(i.qty, MAX_QTY) }));
    }
  } catch {
    items = EMPTY;
  }
  cache = { raw, items };
  return items;
}

function write(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // 私隱模式等情況寫唔到，購物車只係今頁有效
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    add(variantId: string, qty = 1) {
      const current = read();
      const existing = current.find((i) => i.variantId === variantId);
      write(
        existing
          ? current.map((i) => (i.variantId === variantId ? { ...i, qty: Math.min(i.qty + qty, MAX_QTY) } : i))
          : [...current, { variantId, qty: Math.min(qty, MAX_QTY) }],
      );
    },
    setQty(variantId: string, qty: number) {
      const current = read();
      write(qty <= 0 ? current.filter((i) => i.variantId !== variantId) : current.map((i) => (i.variantId === variantId ? { ...i, qty: Math.min(qty, MAX_QTY) } : i)));
    },
    remove(variantId: string) {
      write(read().filter((i) => i.variantId !== variantId));
    },
    clear() {
      write([]);
    },
  };
}
