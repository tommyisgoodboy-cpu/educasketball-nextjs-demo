import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityBadge } from "@/components/courses/ClassList";
import { LevelBadge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { getProfile } from "@/lib/auth";
import { getMyStudents } from "@/lib/data/account";
import { getEnrollableClass } from "@/lib/data/courses";
import { classLabel, formatDateShort, formatHKD, formatTime, weekdayLabel } from "@/lib/utils";
import { EnrollForm, type EnrollMember } from "./EnrollForm";

export const metadata: Metadata = { title: "報名", robots: { index: false } };

export default async function EnrollPage({ params }: { params: Promise<{ classId: string }> }) {
  const cls = await getEnrollableClass((await params).classId);
  if (!cls) notFound();

  const label = classLabel(cls.course.title, cls.weekday, cls.start_time);

  const profile = await getProfile();
  const member: EnrollMember | null = profile
    ? {
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        email: profile.email,
        students: (await getMyStudents()).map((s) => ({ id: s.id, name: s.name, birth_year: s.birth_year })),
      }
    : null;

  return (
    <Container className="py-8 sm:py-12">
      <nav aria-label="麵包屑" className="mb-4 text-sm text-ink-subtle">
        <Link href="/courses" className="hover:text-brand-700">
          課程
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <Link href={`/courses/${cls.course.id}`} className="hover:text-brand-700">
          {cls.course.title}
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-ink-muted">{cls.isFull ? "加入候補" : "報名"}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold text-brand-800 sm:text-3xl">{cls.isFull ? "加入候補名單" : "報名表"}</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="order-2 lg:order-1">
          {cls.isFull && (
            <div className="mb-6 rounded-lg border border-orange-200 bg-cta-soft px-4 py-3 text-sm text-cta-hover">
              呢班已經額滿。提交後會排入候補名單，有位會按次序通知，暫時唔需要付款。
            </div>
          )}
          {!member && (
            <p className="mb-4 text-sm text-ink-muted">
              已經係會員？
              <Link href={`/login?next=/enroll/${cls.id}`} className="font-semibold text-brand-700 hover:underline">
                登入
              </Link>
              後可以直接揀返已登記嘅學員。
            </p>
          )}
          <EnrollForm classId={cls.id} isFull={cls.isFull} courseTitle={label} member={member} />
        </div>

        <aside className="order-1 lg:order-2" aria-label="班次資料">
          <Card className="lg:sticky lg:top-24">
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <LevelBadge level={cls.course.level} />
                <AvailabilityBadge cls={cls} />
              </div>
              <h2 className="text-lg font-bold text-ink">{cls.course.title}</h2>
              <dl className="space-y-2 text-sm">
                <Row term="時間">
                  {weekdayLabel(cls.weekday)} {formatTime(cls.start_time)}–{formatTime(cls.end_time)}
                </Row>
                <Row term="日期">
                  {formatDateShort(cls.start_date)} – {formatDateShort(cls.end_date)}
                </Row>
                <Row term="場地">{cls.venue ? `${cls.venue.name}（${cls.venue.district}）` : "待定"}</Row>
                <Row term="教練">{cls.coach?.name ?? "待定"}</Row>
                <Row term="收費">
                  {formatHKD(cls.course.price)} / {cls.course.sessions_count} 堂
                </Row>
                {cls.sessionsLeft < cls.course.sessions_count && (
                  <Row term="剩餘堂數">{cls.sessionsLeft} 堂</Row>
                )}
              </dl>
              <WhatsAppButton subject={label} label="有問題？WhatsApp 問" className="w-full" />
            </CardBody>
          </Card>
        </aside>
      </div>
    </Container>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-16 shrink-0 text-ink-subtle">{term}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}
