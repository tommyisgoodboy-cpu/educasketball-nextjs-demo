import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPage";
import { ClassForm } from "@/components/admin/ClassForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/admin";
import { hkToday } from "@/lib/data/account";
import { getAvailabilityMap, getClassDetail } from "@/lib/data/admin";
import { getClassFormOptions } from "@/lib/data/admin-options";
import { isUuid } from "@/lib/data/courses";
import { formatDateShort, formatTime, weekdayLabel } from "@/lib/utils";
import { deleteClass, setSessionCancelled } from "../actions";

export const metadata = { title: "編輯班次" };

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [cls, options, availability] = await Promise.all([getClassDetail(id), getClassFormOptions(), getAvailabilityMap()]);
  if (!cls) notFound();
  const a = availability.get(id);
  const today = hkToday();

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/classes", label: "班次" }}
        title={`${cls.course.title} · ${weekdayLabel(cls.weekday)} ${formatTime(cls.start_time)}`}
        description={
          <>
            已佔 {a?.taken ?? 0}/{cls.capacity} · 候補 {a?.waitlist ?? 0} ·{" "}
            <Link href={`/admin/enrollments?status=all&class=${cls.id}`} className="font-semibold text-brand-700 hover:underline">
              睇報名名單
            </Link>
          </>
        }
        actions={
          <ConfirmButton variant="ghost" confirmText="確定刪除呢個班次？" action={deleteClass.bind(null, cls.id)}>
            刪除班次
          </ConfirmButton>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <ClassForm
          {...options}
          takenSeats={a?.taken ?? 0}
          initial={{
            id: cls.id,
            course_id: cls.course_id,
            coach_id: cls.coach_id,
            venue_id: cls.venue_id,
            weekday: cls.weekday,
            start_time: formatTime(cls.start_time),
            end_time: formatTime(cls.end_time),
            start_date: cls.start_date,
            end_date: cls.end_date,
            capacity: cls.capacity,
          }}
        />

        <Card className="self-start">
          <CardHeader>
            <CardTitle>每一堂（{cls.sessions.length}）</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="divide-y divide-surface-border text-sm">
              {cls.sessions.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                  <span className={s.status === "cancelled" ? "text-ink-subtle line-through" : ""}>
                    第 {i + 1} 堂 · {formatDateShort(s.session_date)}
                  </span>
                  <span className="flex items-center gap-2">
                    {s.status === "completed" && (
                      <Link href={`/admin/attendance/${s.id}`}>
                        <Badge tone="success">已點名</Badge>
                      </Link>
                    )}
                    {s.status === "scheduled" && s.session_date <= today && (
                      <Link href={`/admin/attendance/${s.id}`}>
                        <Badge tone="warning">未點名</Badge>
                      </Link>
                    )}
                    {s.status !== "completed" && (
                      <ConfirmButton
                        variant="ghost"
                        confirmText={s.status === "cancelled" ? undefined : `將 ${formatDateShort(s.session_date)} 設為停課？`}
                        action={setSessionCancelled.bind(null, s.id, s.status !== "cancelled")}
                      >
                        {s.status === "cancelled" ? "恢復" : "停課"}
                      </ConfirmButton>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
