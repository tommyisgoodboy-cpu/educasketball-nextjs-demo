import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AgeGroup, ClassAvailability, Course, SkillLevel } from "@/lib/supabase/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID_RE.test(v);

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });

const CLASS_FIELDS =
  "id, course_id, weekday, start_time, end_time, start_date, end_date, capacity, " +
  "coach:coaches(id, name), venue:venues(id, name, district, address, map_url)";

type RawClass = {
  id: string;
  course_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  capacity: number;
  coach: { id: string; name: string } | null;
  venue: { id: string; name: string; district: string; address: string; map_url: string | null } | null;
};

export type ClassDetail = RawClass & {
  remaining: number;
  waitlist: number;
  isFull: boolean;
};

export type CourseWithClasses = Course & { classes: ClassDetail[] };

/** 每班剩餘名額（anon 讀唔到 enrollments，所以用 RPC） */
const getAvailability = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("class_availability");
  if (error) throw error;
  return new Map<string, ClassAvailability>((data ?? []).map((a) => [a.class_id, a]));
});

function withAvailability(cls: RawClass, availability: Map<string, ClassAvailability>): ClassDetail {
  const a = availability.get(cls.id);
  const remaining = a?.remaining ?? cls.capacity;
  return { ...cls, remaining, waitlist: a?.waitlist ?? 0, isFull: remaining <= 0 };
}

const byWeekdayThenTime = (a: RawClass, b: RawClass) =>
  a.weekday - b.weekday || a.start_time.localeCompare(b.start_time);

const AGE_ORDER: AgeGroup[] = ["kids", "primary", "secondary", "adult"];
const LEVEL_ORDER: SkillLevel[] = ["starter", "foundation", "intermediate", "elite"];

export type CourseFilters = { age?: AgeGroup; level?: SkillLevel; district?: string };

/** 上架課程 + 仲未完結嘅班次；按年齡組別 → 等級排序 */
export const getCourses = cache(async (filters: CourseFilters = {}): Promise<CourseWithClasses[]> => {
  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select(`*, classes(${CLASS_FIELDS})`)
    .eq("is_active", true)
    .gte("classes.end_date", today());

  if (filters.age) query = query.eq("age_group", filters.age);
  if (filters.level) query = query.eq("level", filters.level);

  const [{ data, error }, availability] = await Promise.all([query, getAvailability()]);
  if (error) throw error;

  const courses = (data as unknown as (Course & { classes: RawClass[] })[]).map((course) => ({
    ...course,
    classes: course.classes.sort(byWeekdayThenTime).map((c) => withAvailability(c, availability)),
  }));

  return courses
    .filter((c) => !filters.district || c.classes.some((cls) => cls.venue?.district === filters.district))
    .sort(
      (a, b) =>
        AGE_ORDER.indexOf(a.age_group) - AGE_ORDER.indexOf(b.age_group) ||
        LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level),
    );
});

export const getCourse = cache(async (id: string): Promise<CourseWithClasses | null> => {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const [{ data, error }, availability] = await Promise.all([
    supabase
      .from("courses")
      .select(`*, classes(${CLASS_FIELDS})`)
      .eq("id", id)
      .eq("is_active", true)
      .gte("classes.end_date", today())
      .maybeSingle(),
    getAvailability(),
  ]);
  if (error) throw error;
  if (!data) return null;

  const course = data as unknown as Course & { classes: RawClass[] };
  return {
    ...course,
    classes: course.classes.sort(byWeekdayThenTime).map((c) => withAvailability(c, availability)),
  };
});

export type EnrollableClass = ClassDetail & { course: Course; sessionsLeft: number };

/** 報名頁用：班次 + 課程；已完結或課程下架就回傳 null */
export const getEnrollableClass = cache(async (classId: string): Promise<EnrollableClass | null> => {
  if (!isUuid(classId)) return null;
  const supabase = await createClient();
  const [{ data, error }, availability, sessions] = await Promise.all([
    supabase
      .from("classes")
      .select(`${CLASS_FIELDS}, course:courses!inner(*)`)
      .eq("id", classId)
      .eq("course.is_active", true)
      .gte("end_date", today())
      .maybeSingle(),
    getAvailability(),
    supabase
      .from("class_sessions")
      .select("id", { count: "exact", head: true })
      .eq("class_id", classId)
      .eq("status", "scheduled")
      .gte("session_date", today()),
  ]);
  if (error) throw error;
  if (!data) return null;

  const cls = data as unknown as RawClass & { course: Course };
  return { ...withAvailability(cls, availability), course: cls.course, sessionsLeft: sessions.count ?? 0 };
});

/** 有開班嘅地區（篩選器用） */
export const getDistricts = cache(async (): Promise<string[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("venues").select("district").order("district");
  if (error) throw error;
  return [...new Set(data.map((v) => v.district))];
});
