import "server-only";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";

// 後台權限檢查：每個後台頁同 server action 都要叫，唔可以只靠 layout / middleware。
// RLS 係最後一道防線，呢度係令冇權限嘅人見唔到頁面。

export type StaffProfile = NonNullable<Awaited<ReturnType<typeof getProfile>>> & {
  isAdmin: boolean;
  isCoach: boolean;
  canManageVenues: boolean;
};

/** 可以入後台嘅人：管理員、教練、或者有場地權限嘅帳戶 */
export async function getStaff(): Promise<StaffProfile | null> {
  const profile = await getProfile();
  if (!profile) return null;
  const isAdmin = profile.role === "admin";
  const isCoach = profile.role === "coach";
  const canManageVenues = isAdmin || profile.can_manage_venues;
  if (!isAdmin && !isCoach && !canManageVenues) return null;
  return { ...profile, isAdmin, isCoach, canManageVenues };
}

async function requireStaffOrRedirect() {
  const staff = await getStaff();
  if (!staff) {
    const profile = await getProfile();
    if (!profile) redirect("/login?next=/admin");
    redirect("/no-access");
  }
  return staff;
}

/** 管理員或教練（點名、Dashboard） */
export async function requireStaff() {
  const staff = await requireStaffOrRedirect();
  if (!staff.isAdmin && !staff.isCoach) redirect("/no-access");
  return staff;
}

export async function requireAdmin() {
  const staff = await requireStaffOrRedirect();
  if (!staff.isAdmin) redirect("/no-access");
  return staff;
}

export async function requireVenueManager() {
  const staff = await requireStaffOrRedirect();
  if (!staff.canManageVenues) redirect("/no-access");
  return staff;
}

/** 後台首頁：冇 Dashboard 權限（淨係管場地）就去場地頁 */
export function staffHome(staff: StaffProfile) {
  return staff.isAdmin || staff.isCoach ? "/admin" : "/admin/venues";
}
