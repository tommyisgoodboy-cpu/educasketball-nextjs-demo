import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getVenues() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("venues").select("id, name, district, address, map_url").order("district");
  if (error) throw error;
  return data;
}
