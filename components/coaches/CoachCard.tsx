import Image from "next/image";
import { AvailabilityBadge } from "@/components/courses/ClassList";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import type { CoachWithCourses } from "@/lib/data/coaches";
import type { ClassDetail } from "@/lib/data/courses";
import { cn, formatDateShort, formatTime, weekdayLabel } from "@/lib/utils";

const avatarColors = ["bg-brand-600", "bg-aqua-500", "bg-level-intermediate", "bg-level-starter"];

/** 冇相就用姓名頭一個字做頭像 */
export function CoachAvatar({ name, photoUrl, index = 0, size = "lg" }: { name: string; photoUrl: string | null; index?: number; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-20 w-20 text-2xl" : "h-14 w-14 text-lg";
  if (photoUrl) {
    return <Image src={photoUrl} alt={name} width={80} height={80} className={cn("rounded-full object-cover", dim)} />;
  }
  return (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-full font-bold text-white", dim, avatarColors[index % avatarColors.length])}
    >
      {name.slice(0, 1)}
    </span>
  );
}

export function CoachCard({ coach, index, classes = [] }: { coach: CoachWithCourses; index: number; classes?: { courseTitle: string; cls: ClassDetail }[] }) {
  return (
    <Card className="h-full">
      <CardBody className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-4">
          <CoachAvatar name={coach.name} photoUrl={coach.photo_url} index={index} />
          <div>
            <h3 className="text-lg font-bold text-ink">{coach.name} 教練</h3>
            {coach.courseTitles.length > 0 && (
              <p className="text-sm text-ink-muted">負責：{coach.courseTitles.join("、")}</p>
            )}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">{coach.bio}</p>
        {classes.length > 0 && (
          <div className="space-y-2" aria-label={`${coach.name} 教練嘅班次`}>
            <h4 className="text-sm font-bold text-ink">{coach.name} 教練嘅班次 · 直接報名</h4>
            <ul className="divide-y divide-surface-border rounded-lg border border-surface-border">
              {classes.slice(0, 6).map(({ courseTitle, cls }) => (
                <li key={cls.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-ink">{courseTitle}</p>
                    <p className="text-xs text-ink-muted">
                      {weekdayLabel(cls.weekday)} {formatTime(cls.start_time)}–{formatTime(cls.end_time)} · {cls.venue?.name ?? "場地待定"} · {formatDateShort(cls.start_date)} 開始
                    </p>
                    <div className="mt-1">
                      <AvailabilityBadge cls={cls} />
                    </div>
                  </div>
                  <ButtonLink href={`/enroll/${cls.id}`} size="sm" variant={cls.isFull ? "secondary" : "cta"}>
                    {cls.isFull ? "加入候補" : "立即報名"}
                  </ButtonLink>
                </li>
              ))}
            </ul>
            {classes.length > 6 && <p className="text-xs text-ink-subtle">另外 {classes.length - 6} 個班，去課程頁睇全部。</p>}
          </div>
        )}
        {coach.certifications.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2" aria-label="資歷">
            {coach.certifications.map((c) => (
              <li key={c}>
                <Badge tone="aqua">{c}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
