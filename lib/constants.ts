import type { AgeGroup, CustomItemType, CustomRequestStatus, EnrollmentStatus, OrderStatus, ProductCategory, SkillLevel } from "@/lib/supabase/types";

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  kids: "幼兒（4–6 歲）",
  primary: "小學（7–12 歲）",
  secondary: "中學（13–17 歲）",
  adult: "成人",
};

export const SKILL_LEVELS: { value: SkillLevel; label: string; stage: string; summary: string }[] = [
  { value: "starter", label: "啟蒙", stage: "L1", summary: "球感、協調、基本運球" },
  { value: "foundation", label: "基礎", stage: "L2", summary: "傳接、上籃、正確投籃姿勢" },
  { value: "intermediate", label: "進階", stage: "L3", summary: "攻防概念、二打一、比賽應用" },
  { value: "elite", label: "精英", stage: "L4", summary: "戰術、體能、校際比賽備戰" },
];

export const SKILL_LEVEL_LABELS = Object.fromEntries(
  SKILL_LEVELS.map((l) => [l.value, l.label]),
) as Record<SkillLevel, string>;

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending: "待確認",
  confirmed: "已確認",
  waitlist: "候補中",
  cancelled: "已取消",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "待付款",
  paid: "已付款",
  shipped: "已出貨",
  cancelled: "已取消",
};

export const CUSTOM_REQUEST_STATUS_LABELS: Record<CustomRequestStatus, string> = {
  submitted: "已提交",
  quoted: "已報價",
  accepted: "已接受",
  in_production: "製作中",
  completed: "已完成",
  cancelled: "已取消",
};

export const MAIN_NAV = [
  { href: "/", label: "主頁" },
  { href: "/courses", label: "課程" },
  { href: "/coaches", label: "教練團隊" },
  { href: "/shop", label: "商店" },
  { href: "/custom", label: "團體訂製" },
  { href: "/about", label: "關於我們" },
  { href: "/contact", label: "聯絡我們" },
] as const;

/**
 * Demo 模式測試帳戶（全部虛構，同 supabase/seed.sql 一致）
 * 只喺 demo 網站顯示，畀客戶自己登入試玩。
 */
export const DEMO_PASSWORD = "Demo1234!";
export const DEMO_ACCOUNTS = [
  { role: "管理員", email: "admin@educasketball.test", phone: "5555 0001" },
  { role: "教練", email: "coach@educasketball.test", phone: "5555 0002" },
  { role: "會員家長", email: "member@educasketball.test", phone: "5555 0003" },
] as const;

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  jersey: "球衣",
  shorts: "球褲",
  ball: "籃球",
  training: "訓練用品",
};

export const CUSTOM_ITEM_TYPE_LABELS: Record<CustomItemType, string> = {
  jersey: "球衣",
  warmup: "熱身衣",
  other: "其他",
};

/** 團體訂製尺碼分佈 */
export const CUSTOM_SIZES = ["童裝 S", "童裝 M", "童裝 L", "S", "M", "L", "XL", "XXL"];

/** 技術徽章（同 DB student_badges.badge_key check 一致） */
export const BADGES = {
  dribble: { label: "運球達人", icon: "🏀", description: "雙手運球穩定，可以抬頭運球" },
  layup: { label: "上籃達人", icon: "🙌", description: "左右手三步上籃" },
  shooting: { label: "投籃新星", icon: "🎯", description: "正確投籃姿勢，罰球線命中" },
  passing: { label: "傳球大師", icon: "🤝", description: "胸前、擊地、頭上傳球準確" },
  defense: { label: "防守尖兵", icon: "🛡️", description: "防守腳步同站位正確" },
  teamwork: { label: "團隊精神", icon: "⭐", description: "比賽中積極溝通同支援隊友" },
  attendance: { label: "全勤之星", icon: "📅", description: "一期內全勤" },
  level_up: { label: "升級達成", icon: "🏆", description: "通過技術評核升上一級" },
} as const;

export type BadgeKey = keyof typeof BADGES;
