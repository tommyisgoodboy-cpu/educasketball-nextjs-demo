import "server-only";
import { cache } from "react";
import { hkToday } from "@/lib/data/account";
import { getBadgesByStudent, type StudentBadge } from "@/lib/data/badges";
import { getNotesByStudent, type StudentNote } from "@/lib/data/notes";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceStatus, ClassAvailability, EnrollmentStatus } from "@/lib/supabase/types";

// 後台讀資料。權限由 RLS 保證（管理員睇晒，教練只睇到自己班），
// 頁面另外用 lib/admin.ts 檢查角色。

const CLASS_SUMMARY =
  "id, course_id, weekday, start_time, end_time, start_date, end_date, capacity, " +
  "course:courses(id, title, level, age_group), coach:coaches(id, name, profile_id), venue:venues(id, name, district)";

export type AdminClass = {
  id: string;
  course_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  capacity: number;
  course: { id: string; title: string; level: string; age_group: string };
  coach: { id: string; name: string; profile_id: string | null } | null;
  venue: { id: string; name: string; district: string } | null;
};

export const getAvailabilityMap = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("class_availability");
  if (error) throw error;
  return new Map<string, ClassAvailability>(data.map((a) => [a.class_id, a]));
});

/** 教練帳戶對應嘅 coaches.id；唔係教練回傳 null */
export const getMyCoachId = cache(async (profileId: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("coaches").select("id").eq("profile_id", profileId).maybeSingle();
  return data?.id ?? null;
});

// ---------- Dashboard ----------

export type DaySession = {
  id: string;
  session_date: string;
  status: string;
  class: AdminClass;
  rosterCount: number;
  markedCount: number;
};

/** 某日嘅所有堂（coachId 有值就只計嗰位教練） */
export async function getSessionsOn(date: string, coachId?: string | null): Promise<DaySession[]> {
  return getSessionsBetween(date, date, coachId);
}

/** 一段日期（頭尾都計）嘅所有堂，按日期、開始時間排；日曆檢視用 */
export async function getSessionsBetween(from: string, to: string, coachId?: string | null): Promise<DaySession[]> {
  const supabase = await createClient();
  let query = supabase
    .from("class_sessions")
    .select(`id, session_date, status, class:classes!inner(${CLASS_SUMMARY})`)
    .gte("session_date", from)
    .lte("session_date", to);
  if (coachId) query = query.eq("class.coach_id", coachId);
  const { data, error } = await query;
  if (error) throw error;
  const sessions = data as unknown as Omit<DaySession, "rosterCount" | "markedCount">[];
  if (sessions.length === 0) return [];

  // 月檢視會有好多堂：session id 分批查，免得網址太長；class id 去重
  const classIds = [...new Set(sessions.map((s) => s.class.id))];
  const sessionIds = sessions.map((s) => s.id);
  const chunks: string[][] = [];
  for (let i = 0; i < sessionIds.length; i += 25) chunks.push(sessionIds.slice(i, i + 25));

  const [roster, ...markedParts] = await Promise.all([
    supabase.from("enrollments").select("class_id").in("class_id", classIds).eq("status", "confirmed"),
    ...chunks.map((ids) => supabase.from("attendance").select("session_id").in("session_id", ids)),
  ]);
  if (roster.error) throw roster.error;
  const marked = markedParts.flatMap((r) => {
    if (r.error) throw r.error;
    return r.data;
  });

  return sessions
    .map((s) => ({
      ...s,
      rosterCount: roster.data.filter((r) => r.class_id === s.class.id).length,
      markedCount: marked.filter((m) => m.session_id === s.id).length,
    }))
    .sort((a, b) => a.session_date.localeCompare(b.session_date) || a.class.start_time.localeCompare(b.class.start_time));
}

export async function getDashboardCounts() {
  const supabase = await createClient();
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const [pending, waitlist, orders, customs] = await Promise.all([
    count(supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "pending")),
    count(supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "waitlist")),
    count(supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending_payment", "paid"])),
    count(supabase.from("custom_requests").select("id", { count: "exact", head: true }).in("status", ["submitted", "accepted"])),
  ]);
  return { pending, waitlist, orders, customs };
}

// ---------- 報名 ----------

export type AdminEnrollment = {
  id: string;
  status: EnrollmentStatus;
  source: string;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  notes: string | null;
  created_at: string;
  payment_status?: "unpaid" | "paid";
  payment_method?: string | null;
  paid_at?: string | null;
  student: { id: string; name: string; birth_year: number; parent_id: string | null; level: string };
  class: AdminClass;
};

export async function getEnrollments(filters: { status?: EnrollmentStatus; classId?: string; q?: string } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("enrollments")
    .select(
      `id, status, source, parent_name, parent_phone, parent_email, notes, created_at, payment_status, payment_method, paid_at, ` +
        `student:students(id, name, birth_year, parent_id, level), class:classes(${CLASS_SUMMARY})`,
    )
    .order("created_at", { ascending: false })
    .limit(500);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.classId) query = query.eq("class_id", filters.classId);
  const { data, error } = await query;
  if (error) throw error;

  const rows = data as unknown as AdminEnrollment[];
  const q = filters.q?.trim().toLowerCase();
  if (!q) return rows;
  const digits = q.replace(/\D/g, "");
  return rows.filter(
    (r) =>
      r.student.name.toLowerCase().includes(q) ||
      (r.parent_name ?? "").toLowerCase().includes(q) ||
      (digits.length >= 4 && (r.parent_phone ?? "").replace(/\D/g, "").includes(digits)),
  );
}

// ---------- 課程同班次 ----------

export async function getAllCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, classes(id, end_date)")
    .order("created_at");
  if (error) throw error;
  const today = hkToday();
  return data.map(({ classes, ...course }) => ({
    ...course,
    activeClasses: classes.filter((c) => c.end_date >= today).length,
    totalClasses: classes.length,
  }));
}

export async function getCourseById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getAllClasses() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("classes").select(CLASS_SUMMARY).order("start_date");
  if (error) throw error;
  return data as unknown as AdminClass[];
}

export type ClassStatus = {
  cls: AdminClass;
  phase: "running" | "upcoming" | "ended";
  taken: number;
  waitlist: number;
  pending: number;
  sessionsTotal: number;
  sessionsDone: number;
  nextSession: string | null;
  present: number; // 已點名嘅出席人次
  marked: number; // 已點名人次（出席 + 缺席 + 請假）
};

/** 一個課程下面所有班次嘅「班況」：名額、候補、待確認、已上堂數、下一堂、出席率 */
export async function getCourseStatus(courseId: string) {
  const supabase = await createClient();
  const today = hkToday();
  const { data: classes, error } = await supabase
    .from("classes")
    .select(CLASS_SUMMARY)
    .eq("course_id", courseId)
    .order("start_date");
  if (error) throw error;
  const rows = classes as unknown as AdminClass[];
  if (rows.length === 0) return { classes: [] as ClassStatus[] };
  const classIds = rows.map((c) => c.id);

  const [availability, sessions, pending] = await Promise.all([
    getAvailabilityMap(),
    supabase.from("class_sessions").select("id, class_id, session_date, status").in("class_id", classIds),
    supabase.from("enrollments").select("class_id").in("class_id", classIds).eq("status", "pending"),
  ]);
  if (sessions.error) throw sessions.error;
  if (pending.error) throw pending.error;

  // 已上堂（日期過咗、冇取消）嘅 session，分批查出席
  const done = sessions.data.filter((x) => x.session_date < today && x.status !== "cancelled");
  const chunks: string[][] = [];
  for (let i = 0; i < done.length; i += 40) chunks.push(done.slice(i, i + 40).map((x) => x.id));
  const parts = await Promise.all(chunks.map((ids) => supabase.from("attendance").select("session_id, status").in("session_id", ids)));
  const att = parts.flatMap((r) => {
    if (r.error) throw r.error;
    return r.data;
  });
  const classOfSession = new Map(sessions.data.map((x) => [x.id, x.class_id]));

  const out: ClassStatus[] = rows.map((c) => {
    const mine = sessions.data.filter((x) => x.class_id === c.id);
    const a = availability.get(c.id);
    const marks = att.filter((m) => classOfSession.get(m.session_id) === c.id);
    return {
      cls: c,
      phase: c.end_date < today ? "ended" : c.start_date > today ? "upcoming" : "running",
      taken: a?.taken ?? 0,
      waitlist: a?.waitlist ?? 0,
      pending: pending.data.filter((p) => p.class_id === c.id).length,
      sessionsTotal: mine.filter((x) => x.status !== "cancelled").length,
      sessionsDone: mine.filter((x) => x.session_date < today && x.status !== "cancelled").length,
      nextSession: mine.filter((x) => x.session_date >= today && x.status !== "cancelled").map((x) => x.session_date).sort()[0] ?? null,
      present: marks.filter((m) => m.status === "present").length,
      marked: marks.length,
    };
  });
  return { classes: out };
}

export async function getClassDetail(id: string) {
  const supabase = await createClient();
  const [cls, sessions] = await Promise.all([
    supabase.from("classes").select(`${CLASS_SUMMARY}, coach_id, venue_id`).eq("id", id).maybeSingle(),
    supabase.from("class_sessions").select("id, session_date, status").eq("class_id", id).order("session_date"),
  ]);
  if (cls.error) throw cls.error;
  if (sessions.error) throw sessions.error;
  if (!cls.data) return null;
  return {
    ...(cls.data as unknown as AdminClass & { coach_id: string | null; venue_id: string | null }),
    sessions: sessions.data,
  };
}

export const getCoachOptions = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("coaches").select("id, name, is_active").order("name");
  if (error) throw error;
  return data;
});

export const getVenueOptions = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("venues").select("id, name, district").order("district");
  if (error) throw error;
  return data;
});

// ---------- 點名 ----------

export type RosterEntry = {
  studentId: string;
  name: string;
  birthYear: number;
  level: string;
  parentName: string | null;
  attendance: AttendanceStatus | null;
  badges: StudentBadge[];
  notes: StudentNote[];
};

export async function getSessionRoster(sessionId: string) {
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("class_sessions")
    .select(`id, session_date, status, class:classes(${CLASS_SUMMARY})`)
    .eq("id", sessionId)
    .maybeSingle();
  if (error) throw error;
  if (!session) return null;
  const cls = session.class as unknown as AdminClass;

  const [enrollments, attendance] = await Promise.all([
    supabase
      .from("enrollments")
      .select("parent_name, student:students(id, name, birth_year, level)")
      .eq("class_id", cls.id)
      .eq("status", "confirmed"),
    supabase.from("attendance").select("student_id, status").eq("session_id", sessionId),
  ]);
  if (enrollments.error) throw enrollments.error;
  if (attendance.error) throw attendance.error;

  const marks = new Map(attendance.data.map((a) => [a.student_id, a.status]));
  const studentIds = enrollments.data.map((e) => (e.student as unknown as { id: string }).id);
  const [badges, notes] = await Promise.all([getBadgesByStudent(studentIds), getNotesByStudent(studentIds)]);
  const roster: RosterEntry[] = enrollments.data
    .map((e) => {
      const s = e.student as unknown as { id: string; name: string; birth_year: number; level: string };
      return {
        studentId: s.id,
        name: s.name,
        birthYear: s.birth_year,
        level: s.level,
        parentName: e.parent_name,
        attendance: marks.get(s.id) ?? null,
        badges: badges.get(s.id) ?? [],
        notes: notes.get(s.id) ?? [],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "zh-HK"));

  return { id: session.id, session_date: session.session_date, status: session.status, class: cls, roster };
}

// ---------- 會員 ----------

export async function getMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_members");
  if (error) throw error;
  return data;
}

export async function getMemberDetail(id: string) {
  const supabase = await createClient();
  const [members, students, ledger] = await Promise.all([
    supabase.rpc("admin_list_members"),
    supabase.from("students").select("*").eq("parent_id", id).order("created_at"),
    supabase.from("points_ledger").select("*").eq("profile_id", id).order("created_at", { ascending: false }),
  ]);
  if (members.error) throw members.error;
  if (students.error) throw students.error;
  if (ledger.error) throw ledger.error;
  const member = members.data.find((m) => m.id === id);
  if (!member) return null;

  const enrollments = students.data.length
    ? await supabase
        .from("enrollments")
        .select(`id, status, created_at, student:students(id, name), class:classes(${CLASS_SUMMARY})`)
        .in("student_id", students.data.map((s) => s.id))
        .order("created_at", { ascending: false })
    : { data: [], error: null };
  if (enrollments.error) throw enrollments.error;

  return {
    member,
    students: students.data,
    ledger: ledger.data,
    enrollments: enrollments.data as unknown as {
      id: string;
      status: EnrollmentStatus;
      created_at: string;
      student: { id: string; name: string };
      class: AdminClass;
    }[],
  };
}

// ---------- 場地 ----------

export async function getVenuesWithUsage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("venues").select("*, classes(id, end_date)").order("district");
  if (error) throw error;
  const today = hkToday();
  return data.map(({ classes, ...v }) => ({
    ...v,
    classCount: classes.length,
    activeClassCount: classes.filter((c) => c.end_date >= today).length,
  }));
}
