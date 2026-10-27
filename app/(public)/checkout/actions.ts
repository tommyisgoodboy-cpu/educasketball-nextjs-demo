"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { HK_PHONE_ERROR, normalizeHKPhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";

export type CheckoutState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "placed"; orderId: string };

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  if (!(await getUser())) return { status: "error", message: "請重新登入" };

  const get = (k: string) => String(formData.get(k) ?? "").trim();
  let items: unknown;
  try {
    items = JSON.parse(get("items") || "[]");
  } catch {
    items = [];
  }
  const values = {
    contact_name: get("contact_name"),
    contact_phone: get("contact_phone"),
    delivery_method: get("delivery_method") === "delivery" ? "delivery" : "pickup",
    address: get("address"),
    notes: get("notes"),
    points: Number(get("points") || 0),
  };

  const fieldErrors: Record<string, string> = {};
  if (!values.contact_name) fieldErrors.contact_name = "請填寫聯絡人";
  if (!normalizeHKPhone(values.contact_phone)) fieldErrors.contact_phone = HK_PHONE_ERROR;
  if (values.delivery_method === "delivery" && !values.address) fieldErrors.address = "送貨請填寫地址";
  if (Object.keys(fieldErrors).length) return { status: "error", message: "請檢查以下資料", fieldErrors };
  if (!Array.isArray(items) || items.length === 0) return { status: "error", message: "購物車係空嘅" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_items: items.map((i: { variantId?: unknown; qty?: unknown }) => ({ variant_id: String(i.variantId), qty: Number(i.qty) })),
    p_points: Number.isInteger(values.points) ? values.points : 0,
    p_contact_name: values.contact_name,
    p_contact_phone: normalizeHKPhone(values.contact_phone)!,
    p_delivery_method: values.delivery_method,
    p_address: values.address,
    p_notes: values.notes,
  });

  if (error || !data) {
    if (error && !["EB003", "EB004"].includes(error.code ?? "")) console.error("place_order failed", error);
    return {
      status: "error",
      message: error?.code === "EB003" || error?.code === "EB004" ? error.message : "暫時未能落單，請稍後再試",
    };
  }
  revalidatePath("/account", "layout");
  revalidatePath("/admin", "layout");
  return { status: "placed", orderId: data };
}
