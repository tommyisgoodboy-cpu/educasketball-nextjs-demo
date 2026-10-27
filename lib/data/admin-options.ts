import "server-only";
import { getAllCourses, getCoachOptions, getVenueOptions } from "@/lib/data/admin";

/** 班次表格嘅下拉選項 */
export async function getClassFormOptions() {
  const [courses, coaches, venues] = await Promise.all([getAllCourses(), getCoachOptions(), getVenueOptions()]);
  return {
    courses: courses.map((c) => ({ id: c.id, label: c.is_active ? c.title : `${c.title}（已下架）`, sessionsCount: c.sessions_count, defaultCoachId: c.default_coach_id ?? null })),
    coaches: coaches.map((c) => ({ id: c.id, label: c.is_active ? c.name : `${c.name}（已離職）` })),
    venues: venues.map((v) => ({ id: v.id, label: `${v.name}（${v.district}）` })),
  };
}
