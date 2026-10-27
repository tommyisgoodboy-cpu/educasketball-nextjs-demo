import type { Metadata } from "next";
import { AdminNav, type AdminNavItem } from "@/components/admin/AdminNav";
import { getStaff } from "@/lib/admin";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "管理後台", template: "%s｜管理後台" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await getStaff();
  if (!staff) {
    if (!(await getProfile())) redirect("/login?next=/admin");
    redirect("/no-access");
  }

  // 按權限顯示選單
  const items: AdminNavItem[] = [
    ...(staff.isAdmin || staff.isCoach ? [{ href: "/admin", label: "Dashboard" }, { href: "/admin/attendance", label: "日曆及點名" }] : []),
    ...(staff.isAdmin
      ? [
          { href: "/admin/enrollments", label: "報名管理" },
          { href: "/admin/classes", label: "班次" },
          { href: "/admin/courses", label: "課程" },
          { href: "/admin/members", label: "會員及積分" },
          { href: "/admin/students", label: "學員" },
          { href: "/admin/notes", label: "學員備注" },
          { href: "/admin/orders", label: "訂單" },
          { href: "/admin/custom-requests", label: "訂製查詢" },
          { href: "/admin/products", label: "商品" },
        ]
      : []),
    ...(staff.canManageVenues ? [{ href: "/admin/venues", label: "場地" }] : []),
    ...(staff.isAdmin ? [{ href: "/admin/settings", label: "網站設定" }] : []),
  ];
  const roleLabel = staff.isAdmin ? "管理員" : staff.isCoach ? "教練" : "場地管理";

  return (
    <div className="min-h-dvh bg-surface-muted lg:flex">
      <AdminNav items={items} userLabel={staff.full_name ?? staff.email} roleLabel={roleLabel} />
      <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        {children}
      </main>
    </div>
  );
}
