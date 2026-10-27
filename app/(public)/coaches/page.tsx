import type { Metadata } from "next";
import { CoachCard } from "@/components/coaches/CoachCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { getCoaches } from "@/lib/data/coaches";
import { getCourses } from "@/lib/data/courses";

export const metadata: Metadata = {
  title: "教練團隊",
  description: "認識 Educasketball 嘅教練：持有教練資格，專注分級教學同學員進度追蹤。",
};

export default async function CoachesPage() {
  const [coaches, courses] = await Promise.all([getCoaches(), getCourses()]);
  // 每位教練而家可以報名嘅班（getCourses 已經只列未完結班次，並帶埋名額）
  const classesByCoach = new Map<string, { courseTitle: string; cls: (typeof courses)[number]["classes"][number] }[]>();
  for (const c of courses) {
    for (const cls of c.classes) {
      if (!cls.coach) continue;
      classesByCoach.set(cls.coach.id, [...(classesByCoach.get(cls.coach.id) ?? []), { courseTitle: c.title, cls }]);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="教練團隊"
        title="用教學方法帶出進步"
        description="每位教練都持有籃球教練資格同急救證書，按統一嘅等級大綱教學，確保唔同班次都有一致質素。"
      />
      <Container className="py-10">
        <ul className="grid gap-5 md:grid-cols-2">
          {coaches.map((coach, i) => (
            <li key={coach.id}>
              <CoachCard coach={coach} index={i} classes={classesByCoach.get(coach.id) ?? []} />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
