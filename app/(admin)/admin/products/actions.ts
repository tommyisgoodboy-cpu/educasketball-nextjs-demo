"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { isDemoShopImage } from "@/lib/demoShop";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/supabase/env";
import type { ProductCategory } from "@/lib/supabase/types";
import type { FormState } from "../courses/actions";

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const id = get("id");
  const values = {
    name: get("name"),
    description: get("description") || null,
    price: Number(get("price")),
    category: get("category") as ProductCategory,
    is_active: formData.get("is_active") === "on",
  };
  const errors: Record<string, string> = {};
  if (!values.name) errors.name = "請填寫商品名稱";
  if (!(values.category in PRODUCT_CATEGORY_LABELS)) errors.category = "請揀類別";
  if (!Number.isFinite(values.price) || values.price < 0 || values.price > 100000) errors.price = "價錢唔正確";
  if (Object.keys(errors).length) return { status: "error", message: "請檢查以下資料", fieldErrors: errors };

  const samples = formData.getAll("sample_images").map(String).filter(isDemoShopImage).slice(0, 8);
  const supabase = await createClient();
  const result = id
    ? await supabase.from("products").update(values).eq("id", id).select("id").single()
    : await supabase.from("products").insert({ ...values, ...(samples.length ? { images: samples } : {}) }).select("id").single();
  if (result.error) {
    console.error("saveProduct failed", result.error);
    return { status: "error", message: "暫時未能儲存" };
  }
  revalidatePath("/", "layout");
  return { status: "success", redirectTo: `/admin/products/${result.data.id}${id ? "?saved=1" : ""}` };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: "暫時未能更新" };
  revalidatePath("/", "layout");
  return {};
}

/** 圖片已經由瀏覽器上載到 product-images（public），呢度只接受本項目 Storage 嘅 URL */
export async function setProductImages(id: string, images: string[]) {
  await requireAdmin();
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/product-images/`;
  if (images.length > 8 || images.some((u) => !u.startsWith(prefix) && !isDemoShopImage(u))) return { error: "圖片唔正確" };
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ images }).eq("id", id);
  if (error) return { error: "暫時未能儲存圖片" };
  revalidatePath("/", "layout");
  return {};
}

export async function saveVariant(productId: string, variant: { id?: string; size: string; color: string; stock: number }) {
  await requireAdmin();
  const values = {
    size: variant.size.trim().slice(0, 30) || null,
    color: variant.color.trim().slice(0, 30) || null,
    stock: Math.trunc(variant.stock),
  };
  if (!Number.isFinite(values.stock) || values.stock < 0 || values.stock > 100000) return { error: "庫存要係 0 或以上嘅整數" };
  const supabase = await createClient();
  const { error } = variant.id
    ? await supabase.from("product_variants").update(values).eq("id", variant.id).eq("product_id", productId)
    : await supabase.from("product_variants").insert({ ...values, product_id: productId });
  if (error) return { error: error.code === "23505" ? "已經有同一個尺碼 + 顏色" : "暫時未能儲存" };
  revalidatePath("/", "layout");
  return {};
}

export async function deleteVariant(productId: string, variantId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").delete().eq("id", variantId).eq("product_id", productId);
  if (error) return { error: error.code === "23503" ? "呢個款式有訂單紀錄，唔可以刪除；可以將庫存設為 0。" : "暫時未能刪除" };
  revalidatePath("/", "layout");
  return {};
}
