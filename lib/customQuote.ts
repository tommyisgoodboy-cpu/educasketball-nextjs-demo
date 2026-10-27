import type { CustomItemType } from "@/lib/supabase/types";

// 團體訂製：面料 / 功能選項 + 大約報價（只供參考；正式報價由後台職員確認後發出）
export const CUSTOM_FABRICS = [
  { key: "standard", label: "標準速乾布", note: "輕身、耐洗，最多人揀", add: 0 },
  { key: "mesh", label: "透氣網眼布", note: "洞洞設計，夏天打波更爽", add: 15 },
  { key: "stretch", label: "四面彈力布", note: "貼身、活動自如", add: 25 },
  { key: "recycled", label: "環保再生纖維", note: "回收寶特瓶製成，手感柔軟", add: 30 },
] as const;

export const CUSTOM_FEATURES = [
  { key: "cooling", label: "涼感吸濕排汗", add: 10, types: ["jersey", "warmup", "other"] },
  { key: "uv", label: "UV 防曬 UPF50+", add: 8, types: ["jersey", "warmup", "other"] },
  { key: "name_number", label: "姓名 + 號碼熱轉印", add: 12, types: ["jersey", "warmup", "other"] },
  { key: "embroidery", label: "隊徽刺繡", add: 18, types: ["jersey", "warmup", "other"] },
  { key: "reversible", label: "雙面可穿", add: 35, types: ["jersey"] },
  { key: "pocket", label: "拉鏈口袋", add: 14, types: ["warmup", "other"] },
  { key: "water", label: "防潑水塗層", add: 16, types: ["warmup", "other"] },
] as const;

export const CUSTOM_FABRIC_LABELS: Record<string, string> = Object.fromEntries(CUSTOM_FABRICS.map((f) => [f.key, f.label]));
export const CUSTOM_FEATURE_LABELS: Record<string, string> = Object.fromEntries(CUSTOM_FEATURES.map((f) => [f.key, f.label]));

const BASE: Record<CustomItemType, number> = { jersey: 120, warmup: 220, other: 150 };
/** 數量越多單價越平 */
const TIERS = [
  { min: 50, off: 0.15 },
  { min: 24, off: 0.1 },
  { min: 12, off: 0.05 },
];

export function featuresFor(type: CustomItemType) {
  return CUSTOM_FEATURES.filter((f) => (f.types as readonly string[]).includes(type));
}

export function estimateCustom(input: { itemType: CustomItemType; qty: number; fabric: string; features: string[] }) {
  const fabric = CUSTOM_FABRICS.find((f) => f.key === input.fabric)?.add ?? 0;
  const allowed = new Set(featuresFor(input.itemType).map((f) => f.key));
  const features = CUSTOM_FEATURES.filter((f) => allowed.has(f.key) && input.features.includes(f.key)).reduce((n, f) => n + f.add, 0);
  const off = TIERS.find((t) => input.qty >= t.min)?.off ?? 0;
  const unit = (BASE[input.itemType] + fabric + features) * (1 - off);
  const total = Math.round((unit * input.qty) / 10) * 10;
  return { unit: Math.round(unit), total, low: Math.round((total * 0.92) / 10) * 10, high: Math.round((total * 1.08) / 10) * 10, off };
}
