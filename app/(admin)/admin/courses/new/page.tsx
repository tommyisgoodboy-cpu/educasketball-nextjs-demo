import { AdminPageHeader } from "@/components/admin/AdminPage";
import { CourseForm } from "@/components/admin/CourseForm";
import { requireAdmin } from "@/lib/admin";
import { getCoachOptions } from "@/lib/data/admin";

export const metadata = { title: "新增課程" };

export default async function NewCoursePage() {
  await requireAdmin();
  const coaches = (await getCoachOptions()).map((c) => ({ id: c.id, label: c.is_active ? c.name : `${c.name}（已離職）` }));
  return (
    <>
      <AdminPageHeader title="新增課程" back={{ href: "/admin/courses", label: "課程" }} />
      <CourseForm coaches={coaches} />
    </>
  );
}
