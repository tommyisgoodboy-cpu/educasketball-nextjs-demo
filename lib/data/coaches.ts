import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Coach } from "@/lib/supabase/types";

export type CoachWithCourses = Coach & { courseTitles: string[] };

/** 在職教練 + 佢哋而家教緊嘅課程名 */
export const getCoaches = cache(async (): Promise<CoachWithCourses[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coaches")
    .select("*, classes(course:courses(title))")
    .eq("is_active", true)
    .order("created_at");
  if (error) throw error;

  return data.map(({ classes, ...coach }) => ({
    ...coach,
    courseTitles: [...new Set(classes.map((c) => c.course?.title).filter((t): t is string => Boolean(t)))],
  }));
});
