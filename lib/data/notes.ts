import "server-only";
import { createClient } from "@/lib/supabase/server";

export type NoteKind = "health" | "schedule" | "general";
export type StudentNote = { id: string; student_id: string; kind: NoteKind; body: string; created_by: string | null; created_at: string };

/** 按學員分組，新到舊；RLS 決定睇唔睇到（只有職員） */
export async function getNotesByStudent(studentIds: string[]) {
  const map = new Map<string, StudentNote[]>();
  if (studentIds.length === 0) return map;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_notes")
    .select("id, student_id, kind, body, created_by, created_at")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  for (const n of data as StudentNote[]) map.set(n.student_id, [...(map.get(n.student_id) ?? []), n]);
  return map;
}
