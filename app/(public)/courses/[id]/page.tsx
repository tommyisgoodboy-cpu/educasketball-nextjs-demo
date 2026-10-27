import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClassList } from "@/components/courses/ClassList";
import { Badge, LevelBadge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { AGE_GROUP_LABELS, SKILL_LEVELS } from "@/lib/constants";
import { getCourse } from "@/lib/data/courses";
import { formatHKD } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const course = await getCourse((await params).id);
  return course ? { title: course.title, description: course.description ?? undefined } : {};
}

export default async function CourseDetailPage({ params }: { params: Params }) {
  const course = await getCourse((await params).id);
  if (!course) notFound();

  const level = SKILL_LEVELS.find((l) => l.value === course.level);
  const perSession = Math.round(course.price / course.sessions_count);

  return (
    <>
      <section className="border-b border-surface-border bg-white">
        <Container className="py-8 sm:py-12">
          <nav aria-label="麵包屑" className="mb-4 text-sm text-ink-subtle">
            <Link href="/courses" className="hover:text-brand-700">
              課程
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-ink-muted">{course.title}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge tone="brand">{AGE_GROUP_LABELS[course.age_group]}</Badge>
                <LevelBadge level={course.level} />
              </div>
              <h1 className="text-3xl font-bold text-brand-800 sm:text-4xl">{course.title}</h1>
              <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">{course.description}</p>
            </div>

            <Card className="self-start">
              <CardBody className="space-y-4">
                <div>
                  <p className="text-sm text-ink-subtle">每期收費</p>
                  <p className="text-3xl font-bold text-brand-800">{formatHKD(course.price)}</p>
                  <p className="text-sm text-ink-muted">
                    共 {course.sessions_count} 堂 · 平均每堂 {formatHKD(perSession)}
                  </p>
                </div>
                {level && (
                  <div className="rounded-lg bg-surface-muted p-3 text-sm">
                    <p className="font-semibold text-ink">
                      {level.stage} {level.label}級學習重點
                    </p>
                    <p className="text-ink-muted">{level.summary}</p>
                  </div>
                )}
                <p className="text-xs text-ink-subtle">報名後可以網上付款（測試模式）或用 FPS 轉數快，職員確認後安排上堂。</p>
                <WhatsAppButton subject={course.title} className="w-full" />
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <h2 className="mb-1 text-xl font-bold text-ink">班次及報名</h2>
        <p className="mb-5 text-sm text-ink-muted">額滿嘅班次可以加入候補，有位會按次序通知。</p>
        <ClassList courseTitle={course.title} classes={course.classes} />
      </Container>
    </>
  );
}
