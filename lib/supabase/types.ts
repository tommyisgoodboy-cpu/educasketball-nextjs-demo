// 資料庫型別：database.types.ts 由 Supabase CLI 自動生成，唔好手改。
// 改完 migration 之後重新生成：
//   npx supabase gen types typescript --local > lib/supabase/database.types.ts
// 呢個檔只係將常用嘅 row / enum 型別改個短名方便 import。

import type { Database } from "./database.types";

export type { Database, Json } from "./database.types";

type Tables = Database["public"]["Tables"];
type Enums = Database["public"]["Enums"];
type Functions = Database["public"]["Functions"];

export type UserRole = Enums["user_role"];
export type AgeGroup = Enums["age_group"];
export type SkillLevel = Enums["skill_level"];
export type SessionStatus = Enums["session_status"];
export type EnrollmentStatus = Enums["enrollment_status"];
export type EnrollmentSource = Enums["enrollment_source"];
export type AttendanceStatus = Enums["attendance_status"];
export type ProductCategory = Enums["product_category"];
export type OrderStatus = Enums["order_status"];
export type CustomItemType = Enums["custom_item_type"];
export type CustomRequestStatus = Enums["custom_request_status"];

export type Profile = Tables["profiles"]["Row"];
export type Student = Tables["students"]["Row"];
export type Coach = Tables["coaches"]["Row"];
export type Venue = Tables["venues"]["Row"];
export type Course = Tables["courses"]["Row"];
export type Class = Tables["classes"]["Row"];
export type ClassSession = Tables["class_sessions"]["Row"];
export type Enrollment = Tables["enrollments"]["Row"];
export type Attendance = Tables["attendance"]["Row"];
export type Product = Tables["products"]["Row"];
export type ProductVariant = Tables["product_variants"]["Row"];
export type Order = Tables["orders"]["Row"];
export type OrderItem = Tables["order_items"]["Row"];
export type CustomRequest = Tables["custom_requests"]["Row"];
export type PointsLedgerEntry = Tables["points_ledger"]["Row"];
export type SiteSetting = Tables["site_settings"]["Row"];
export type MemberPointsBalance = Database["public"]["Views"]["member_points_balance"]["Row"];
export type ClassAvailability = Functions["class_availability"]["Returns"][number];
