import { cache } from "react";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceStatus, EnrollmentStatus, SessionStatus } from "@/lib/supabase/types";
import { CUSTOM_ITEM_TYPE_LABELS, CUSTOM_REQUEST_STATUS_LABELS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatTime, weekdayLabel } from "@/lib/utils";

// 會員區資料。RLS 已經限制只讀到自己嘅資料，呢度再明確用 parent_id 過濾，
// 避免教練帳戶（RLS 亦睇到自己班學員）喺會員區見到唔屬於自己嘅小朋友。

export const hkToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });

export const getMyStudents = cache(async () => {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at");
  if (error) throw error;
  return data;
});

export type MyEnrollment = {
  id: string;
  status: EnrollmentStatus;
  created_at: string;
  student: { id: string; name: string };
  class: {
    id: string;
    weekday: number;
    start_time: string;
    end_time: string;
    start_date: string;
    end_date: string;
    course: { id: string; title: string; sessions_count: number };
    venue: { name: string; district: string } | null;
    coach: { name: string } | null;
  };
  /** 今日之後仲有幾多堂（未取消） */
  sessionsLeft: number;
  /** 已出席堂數 */
  attended: number;
};

/** 我名下所有學員嘅報名（唔包已取消），新嘅排先 */
export const getMyEnrollments = cache(async (): Promise<MyEnrollment[]> => {
  const students = await getMyStudents();
  if (students.length === 0) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      "id, status, created_at, student:students(id, name), " +
        "class:classes(id, weekday, start_time, end_time, start_date, end_date, " +
        "course:courses(id, title, sessions_count), venue:venues(name, district), coach:coaches(name))",
    )
    .in("student_id", students.map((s) => s.id))
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const enrollments = data as unknown as Omit<MyEnrollment, "sessionsLeft" | "attended">[];
  if (enrollments.length === 0) return [];

  const classIds = [...new Set(enrollments.map((e) => e.class.id))];
  const [sessions, attendance] = await Promise.all([
    supabase.from("class_sessions").select("id, class_id, session_date, status").in("class_id", classIds),
    supabase.from("attendance").select("session_id, student_id, status").in("student_id", students.map((s) => s.id)),
  ]);
  if (sessions.error) throw sessions.error;
  if (attendance.error) throw attendance.error;

  const today = hkToday();
  const sessionClass = new Map(sessions.data.map((s) => [s.id, s.class_id]));

  return enrollments.map((e) => ({
    ...e,
    sessionsLeft: sessions.data.filter(
      (s) => s.class_id === e.class.id && s.status !== "cancelled" && s.session_date >= today,
    ).length,
    attended: attendance.data.filter(
      (a) => a.student_id === e.student.id && a.status === "present" && sessionClass.get(a.session_id) === e.class.id,
    ).length,
  }));
});

export type ScheduleEntry = {
  sessionId: string;
  date: string;
  sessionStatus: SessionStatus;
  enrollmentStatus: EnrollmentStatus;
  studentId: string;
  studentName: string;
  courseTitle: string;
  startTime: string;
  endTime: string;
  venue: string | null;
  coach: string | null;
  attendance: AttendanceStatus | null;
};

/** 指定日期範圍內，我學員已報（待確認 / 已確認）班次嘅每一堂 */
export async function getMySchedule(from: string, to: string): Promise<ScheduleEntry[]> {
  const enrollments = (await getMyEnrollments()).filter((e) => e.status === "confirmed" || e.status === "pending");
  if (enrollments.length === 0) return [];
  const supabase = await createClient();

  const classIds = [...new Set(enrollments.map((e) => e.class.id))];
  const studentIds = [...new Set(enrollments.map((e) => e.student.id))];
  const [sessions, attendance] = await Promise.all([
    supabase
      .from("class_sessions")
      .select("id, class_id, session_date, status")
      .in("class_id", classIds)
      .gte("session_date", from)
      .lte("session_date", to)
      .order("session_date"),
    supabase.from("attendance").select("session_id, student_id, status").in("student_id", studentIds),
  ]);
  if (sessions.error) throw sessions.error;
  if (attendance.error) throw attendance.error;

  const attendanceKey = new Map(attendance.data.map((a) => [`${a.session_id}:${a.student_id}`, a.status]));

  return sessions.data.flatMap((s) =>
    enrollments
      .filter((e) => e.class.id === s.class_id)
      .map((e) => ({
        sessionId: s.id,
        date: s.session_date,
        sessionStatus: s.status,
        enrollmentStatus: e.status,
        studentId: e.student.id,
        studentName: e.student.name,
        courseTitle: e.class.course.title,
        startTime: e.class.start_time,
        endTime: e.class.end_time,
        venue: e.class.venue ? `${e.class.venue.name}（${e.class.venue.district}）` : null,
        coach: e.class.coach?.name ?? null,
        attendance: attendanceKey.get(`${s.id}:${e.student.id}`) ?? null,
      })),
  ).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}

/** 下一堂（已確認班次、未取消、今日或之後） */
export async function getNextSessions(limit = 3) {
  const today = hkToday();
  const inTwoMonths = new Date(Date.now() + 62 * 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });
  const entries = await getMySchedule(today, inTwoMonths);
  return entries.filter((e) => e.enrollmentStatus === "confirmed" && e.sessionStatus === "scheduled").slice(0, limit);
}

export const getMyPoints = cache(async () => {
  const user = await getUser();
  if (!user) return { balance: 0, ledger: [] };
  const supabase = await createClient();
  const [balance, ledger] = await Promise.all([
    supabase.from("member_points_balance").select("balance").eq("profile_id", user.id).maybeSingle(),
    supabase
      .from("points_ledger")
      .select("id, delta, reason, ref_type, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  if (balance.error) throw balance.error;
  if (ledger.error) throw ledger.error;
  return { balance: balance.data?.balance ?? 0, ledger: ledger.data };
});

export async function getPointsRules() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "points_rules").maybeSingle();
  const v = (data?.value ?? {}) as Partial<Record<string, number>>;
  return {
    attendance: v.attendance ?? 10,
    spendPerPoint: v.spend_per_point ?? 10,
    firstEnrollment: v.first_enrollment ?? 50,
    referral: v.referral ?? 100,
    redeemPoints: v.redeem_points ?? 100,
    redeemValue: v.redeem_value ?? 10,
  };
}

export async function getRecentOrders(limit = 3) {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, total, status, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getMyOrders() {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, total, status, created_at, order_items(qty)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(({ order_items, ...o }) => ({ ...o, itemCount: order_items.reduce((n, i) => n + i.qty, 0) }));
}

export async function getMyOrder(id: string) {
  const user = await getUser();
  if (!user || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(id, qty, unit_price, variant:product_variants(size, color, product:products(id, name, images, category)))",
    )
    .eq("id", id)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  let proofUrl: string | null = null;
  if (data.payment_proof_url) {
    const { data: signed } = await supabase.storage.from("payment-proofs").createSignedUrl(data.payment_proof_url, 600);
    proofUrl = signed?.signedUrl ?? null;
  }
  return { ...data, proofUrl };
}

/** 單張訂製查詢（只可以睇自己嘅；RLS 保證） */
export async function getMyCustomRequest(id: string) {
  const user = await getUser();
  if (!user || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("custom_requests").select("*").eq("id", id).eq("profile_id", user.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMyCustomRequests() {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ---------- 訂單總覽（課程報名 + 商店訂單 + 團體訂製，一個 list） ----------

export type UnifiedOrder = {
  key: string;
  kind: "course" | "shop" | "custom";
  href: string;
  date: string; // ISO timestamp
  title: string;
  lines: string[]; // 項目名（一行一項）
  amount: number | null;
  status: string;
  tone: "warning" | "brand" | "success" | "neutral";
  action?: { label: string; href: string };
  pay?: "paid" | "unpaid"; // 付款狀態（候補、取消、訂製冇）
  customId?: string;
};

const CUSTOM_TONE = { submitted: "neutral", quoted: "warning", accepted: "brand", in_production: "brand", completed: "success", cancelled: "neutral" } as const;
const ORDER_TONE = { pending_payment: "warning", paid: "brand", shipped: "success", cancelled: "neutral" } as const;

export async function getMyUnifiedOrders(): Promise<UnifiedOrder[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const students = await getMyStudents();
  const [orders, enrollments, customs] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total, status, created_at, order_items(qty, variant:product_variants(size, color, product:products(name)))")
      .eq("profile_id", user.id),
    students.length
      ? supabase
          .from("enrollments")
          .select("id, status, created_at, payment_status, student:students(name), class:classes(weekday, start_time, course:courses(title, price, sessions_count))")
          .in("student_id", students.map((s) => s.id))
          .neq("status", "cancelled")
      : Promise.resolve({ data: [], error: null }),
    supabase.from("custom_requests").select("id, team_name, item_type, qty, status, quote_amount, created_at, payment_status").eq("profile_id", user.id),
  ]);
  if (orders.error) throw orders.error;
  if (enrollments.error) throw enrollments.error;
  if (customs.error) throw customs.error;

  const out: UnifiedOrder[] = [];

  for (const o of orders.data as unknown as { id: string; total: number; status: keyof typeof ORDER_TONE; created_at: string; order_items: { qty: number; variant: { size: string | null; color: string | null; product: { name: string } | null } | null }[] }[]) {
    out.push({
      key: `shop-${o.id}`,
      kind: "shop",
      href: `/account/orders/${o.id}`,
      date: o.created_at,
      title: `商店訂單 ${shortOrderId(o.id)}`,
      lines: o.order_items.map((i) => `${i.variant?.product?.name ?? "商品"}${i.variant ? `（${[i.variant.size, i.variant.color].filter(Boolean).join(" / ")}）` : ""} × ${i.qty}`),
      amount: Number(o.total),
      status: ORDER_STATUS_LABELS[o.status],
      tone: ORDER_TONE[o.status],
      action: o.status === "pending_payment" ? { label: "去付款", href: `/account/orders/${o.id}` } : undefined,
      pay: o.status === "pending_payment" ? "unpaid" : o.status === "cancelled" ? undefined : "paid",
    });
  }

  type Enr = { id: string; status: "pending" | "confirmed" | "waitlist" | "cancelled"; created_at: string; payment_status?: "unpaid" | "paid"; student: { name: string }; class: { weekday: number; start_time: string; course: { title: string; price: number | string; sessions_count: number } } };
  for (const e of enrollments.data as unknown as Enr[]) {
    const paid = e.payment_status === "paid";
    const waitlist = e.status === "waitlist";
    out.push({
      key: `course-${e.id}`,
      kind: "course",
      href: `/account/schedule`,
      date: e.created_at,
      title: `課程報名・${e.student.name}`,
      lines: [`${e.class.course.title}（${e.class.course.sessions_count} 堂 · ${weekdayLabel(e.class.weekday)} ${formatTime(e.class.start_time)}）`],
      amount: Number(e.class.course.price),
      status: waitlist ? "候補中" : paid ? "已付款" : "待付款",
      tone: waitlist ? "neutral" : paid ? "success" : "warning",
      action: !waitlist && !paid ? { label: "去付款", href: `/enroll/paid?e=${e.id}` } : undefined,
      pay: waitlist ? undefined : paid ? "paid" : "unpaid",
    });
  }

  for (const c of customs.data as unknown as { id: string; team_name: string; item_type: keyof typeof CUSTOM_ITEM_TYPE_LABELS; qty: number; status: keyof typeof CUSTOM_TONE; quote_amount: number | null; created_at: string; payment_status: "unpaid" | "paid" }[]) {
    const payable = c.status === "accepted" && c.payment_status !== "paid"; // 接受報價後就要付款
    const paidWaiting = c.status === "accepted" && c.payment_status === "paid";
    out.push({
      key: `custom-${c.id}`,
      kind: "custom",
      href: `/account/orders/custom/${c.id}`,
      date: c.created_at,
      title: `團體訂製・${c.team_name}`,
      lines: [`${CUSTOM_ITEM_TYPE_LABELS[c.item_type]} ${c.qty} 件`],
      amount: c.quote_amount === null ? null : Number(c.quote_amount),
      status: payable ? "已接受・待付款" : paidWaiting ? "已付款・待製作" : CUSTOM_REQUEST_STATUS_LABELS[c.status],
      tone: payable ? "warning" : paidWaiting ? "success" : CUSTOM_TONE[c.status],
      action: payable ? { label: "去付款", href: `/account/orders/custom/${c.id}` } : undefined,
      pay: payable ? "unpaid" : ["accepted", "in_production", "completed"].includes(c.status) ? "paid" : undefined,
      customId: c.id,
    });
  }

  return out.sort((a, b) => b.date.localeCompare(a.date));
}

const shortOrderId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;


/** 日曆訂閱連結用嘅私人 token（用戶自己睇到自己嗰行） */
export async function getMyCalendarToken(): Promise<string | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("calendar_token").eq("id", user.id).maybeSingle();
  return (data as { calendar_token?: string } | null)?.calendar_token ?? null;
}
