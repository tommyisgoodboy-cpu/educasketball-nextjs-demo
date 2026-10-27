import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPage";
import { CourseForm } from "@/components/admin/CourseForm";
import { requireAdmin } from "@/lib/admin";
import { getCoachOptions, getCourseById } from "@/lib/data/admin";
import { isUuid } from "@/lib/data/courses";

export const metadata = { title: "編輯課程" };

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const course = isUuid(id) ? await getCourseById(id) : null;
  if (!course) notFound();
  const coaches = (await getCoachOptions()).map((c) => ({ id: c.id, label: c.is_active ? c.name : `${c.name}（已離職）` }));
  return (
    <>
      <AdminPageHeader title={`編輯：${course.title}`} back={{ href: "/admin/courses", label: "課程" }} />
      <CourseForm course={course} coaches={coaches} />
    </>
  );
}
