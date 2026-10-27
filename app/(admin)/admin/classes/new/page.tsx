import { AdminPageHeader } from "@/components/admin/AdminPage";
import { ClassForm } from "@/components/admin/ClassForm";
import { requireAdmin } from "@/lib/admin";
import { hkToday } from "@/lib/data/account";
import { getClassFormOptions } from "@/lib/data/admin-options";

export const metadata = { title: "新增班次" };

export default async function NewClassPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  await requireAdmin();
  const [{ course }, options] = await Promise.all([searchParams, getClassFormOptions()]);
  const courseId = options.courses.some((c) => c.id === course) ? course! : "";

  return (
    <>
      <AdminPageHeader title="新增班次" back={{ href: "/admin/classes", label: "班次" }} />
      <ClassForm
        {...options}
        initial={{
          course_id: courseId,
          coach_id: null,
          venue_id: null,
          weekday: 6,
          start_time: "10:00",
          end_time: "11:30",
          start_date: hkToday(),
          end_date: "",
          capacity: 16,
        }}
      />
    </>
  );
}
