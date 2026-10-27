import { AddStudent } from "@/components/account/AddStudent";
import { StudentCard } from "@/components/account/StudentCard";
import { getMyEnrollments, getMyStudents, hkToday } from "@/lib/data/account";
import { getBadgesByStudent } from "@/lib/data/badges";

export const metadata = { title: "我嘅學員" };

export default async function StudentsPage() {
  const [students, enrollments] = await Promise.all([getMyStudents(), getMyEnrollments()]);
  const today = hkToday();
  const badges = await getBadgesByStudent(students.map((s) => s.id));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-brand-800 sm:text-3xl">我嘅學員</h1>
        <p className="mt-1 text-sm text-ink-muted">
          一個帳戶可以登記幾位小朋友，報名時直接揀就得。技術等級由教練評核後更新。
        </p>
      </header>

      {students.length > 0 && (
        <ul className="grid gap-4 xl:grid-cols-2">
          {students.map((s) => (
            <li key={s.id}>
              <StudentCard
                student={s}
                badges={badges.get(s.id) ?? []}
                courses={[
                  ...new Set(
                    enrollments
                      .filter((e) => e.student.id === s.id && e.class.end_date >= today)
                      .map((e) => e.class.course.title),
                  ),
                ]}
              />
            </li>
          ))}
        </ul>
      )}

      <AddStudent startOpen={students.length === 0} />
    </div>
  );
}
