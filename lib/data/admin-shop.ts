import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CustomRequestStatus, OrderStatus } from "@/lib/supabase/types";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function getAdminProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(id, stock)")
    .order("created_at");
  if (error) throw error;
  return data.map(({ product_variants, ...p }) => ({
    ...p,
    variantCount: product_variants.length,
    totalStock: product_variants.reduce((n, v) => n + v.stock, 0),
    lowStock: product_variants.some((v) => v.stock <= 3),
  }));
}

export async function getAdminProduct(id: string) {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(id, size, color, stock)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAdminOrders(status?: OrderStatus) {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id, total, status, created_at, payment_proof_url, delivery_method, contact_name, contact_phone, order_items(qty)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(({ order_items, ...o }) => ({ ...o, itemCount: order_items.reduce((n, i) => n + i.qty, 0) }));
}

export async function getAdminOrder(id: string) {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, profile:profiles(id, full_name, phone), order_items(id, qty, unit_price, variant:product_variants(size, color, stock, product:products(id, name)))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  let proofUrl: string | null = null;
  if (data.payment_proof_url) {
    const { data: signed } = await supabase.storage.from("payment-proofs").createSignedUrl(data.payment_proof_url, 600);
    proofUrl = signed?.signedUrl ?? null;
  }
  return { ...data, proofUrl, proofIsPdf: (data.payment_proof_url ?? "").toLowerCase().endsWith(".pdf") };
}

export async function getAdminCustomRequests(status?: CustomRequestStatus) {
  const supabase = await createClient();
  let query = supabase.from("custom_requests").select("*").order("created_at", { ascending: false }).limit(300);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAdminCustomRequest(id: string) {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("custom_requests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  let logoUrl: string | null = null;
  if (data.logo_url) {
    const { data: signed } = await supabase.storage.from("team-logos").createSignedUrl(data.logo_url, 600, { download: true });
    logoUrl = signed?.signedUrl ?? null;
  }
  return { ...data, logoUrl };
}

export async function getAllSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("key, value, updated_at");
  if (error) throw error;
  const map = Object.fromEntries(data.map((r) => [r.key, (r.value ?? {}) as Record<string, unknown>]));
  return {
    whatsapp: map.whatsapp ?? {},
    site: map.site ?? {},
    fps: map.fps ?? {},
    points_rules: map.points_rules ?? {},
  };
}
