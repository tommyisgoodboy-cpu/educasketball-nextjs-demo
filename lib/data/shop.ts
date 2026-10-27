import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/supabase/types";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export type ShopVariant = { id: string; size: string | null; color: string | null; stock: number };
export type ShopProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  category: ProductCategory;
  variants: ShopVariant[];
  totalStock: number;
};

const SIZE_ORDER = ["童裝 S", "童裝 M", "童裝 L", "S", "M", "L", "XL", "XXL"];
const sortVariants = (a: ShopVariant, b: ShopVariant) =>
  (SIZE_ORDER.indexOf(a.size ?? "") - SIZE_ORDER.indexOf(b.size ?? "")) || (a.color ?? "").localeCompare(b.color ?? "", "zh-HK");

function shape(p: Omit<ShopProduct, "totalStock" | "variants"> & { product_variants: ShopVariant[] }): ShopProduct {
  const { product_variants, ...rest } = p;
  const variants = [...product_variants].sort(sortVariants);
  return { ...rest, variants, totalStock: variants.reduce((n, v) => n + v.stock, 0) };
}

export const getProducts = cache(async (category?: ProductCategory) => {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, description, price, images, category, product_variants(id, size, color, stock)")
    .eq("is_active", true)
    .order("created_at");
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(shape);
});

export const getProduct = cache(async (id: string) => {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, images, category, product_variants(id, size, color, stock)")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? shape(data) : null;
});

export type CartLine = {
  variantId: string;
  qty: number;
  productId: string;
  name: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
  image: string | null;
  category: ProductCategory;
};

/** 按 variant id 讀返商品資料（購物車 / 結帳用）；已下架或者唔存在嘅會被略過 */
export async function getCartLines(items: { variantId: string; qty: number }[]): Promise<CartLine[]> {
  const ids = [...new Set(items.map((i) => i.variantId).filter((id) => UUID_RE.test(id)))].slice(0, 30);
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, size, color, stock, product:products!inner(id, name, price, images, category, is_active)")
    .in("id", ids)
    .eq("product.is_active", true);
  if (error) throw error;
  const byId = new Map(data.map((v) => [v.id, v]));
  return items.flatMap((i) => {
    const v = byId.get(i.variantId);
    if (!v) return [];
    return [
      {
        variantId: v.id,
        qty: i.qty,
        productId: v.product.id,
        name: v.product.name,
        size: v.size,
        color: v.color,
        price: v.product.price,
        stock: v.stock,
        image: v.product.images[0] ?? null,
        category: v.product.category,
      },
    ];
  });
}

export type FpsSettings = { fps_id: string; account_name: string; instructions: string };

export const getFpsSettings = cache(async (): Promise<FpsSettings> => {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "fps").maybeSingle();
  return {
    fps_id: "",
    account_name: "",
    instructions: "",
    ...((data?.value as Partial<FpsSettings> | null) ?? {}),
  };
});
