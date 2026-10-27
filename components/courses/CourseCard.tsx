import Link from "next/link";
import { Badge, LevelBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AGE_GROUP_LABELS, SKILL_LEVELS } from "@/lib/constants";
import type { CourseWithClasses } from "@/lib/data/courses";
import { cn, formatHKD } from "@/lib/utils";

const levelBand: Record<string, string> = {
  starter: "from-level-starter/90 to-level-starter",
  foundation: "from-brand-500 to-brand-700",
  intermediate: "from-level-intermediate/90 to-level-intermediate",
  elite: "from-level-elite/90 to-level-elite",
};

export function CourseCard({ course }: { course: CourseWithClasses }) {
  const openClasses = course.classes.filter((c) => !c.isFull);
  const remaining = openClasses.reduce((sum, c) => sum + c.remaining, 0);
  const districts = [...new Set(course.classes.map((c) => c.venue?.district).filter(Boolean))];
  const stage = SKILL_LEVELS.find((l) => l.value === course.level)?.stage;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className={cn("relative flex h-24 items-end bg-gradient-to-br p-4 text-white", levelBand[course.level])}>
        <svg viewBox="0 0 100 100" className="absolute -right-4 -top-6 h-32 w-32 opacity-15" aria-hidden>
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
          <path d="M50 4v92M4 50h92M18 18c14 12 14 52 0 64M82 18c-14 12-14 52 0 64" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
        <span className="text-xs font-bold tracking-wider opacity-90">{stage}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">{AGE_GROUP_LABELS[course.age_group]}</Badge>
          <LevelBadge level={course.level} />
        </div>

        <h3 className="text-lg font-bold text-ink">
          <Link href={`/courses/${course.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {course.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-ink-muted">{course.description}</p>

        <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-surface-border pt-3 text-sm">
          <div>
            <dt className="text-xs text-ink-subtle">收費</dt>
            <dd className="font-bold text-brand-800">
              {formatHKD(course.price)}
              <span className="ml-1 text-xs font-normal text-ink-muted">/ {course.sessions_count} 堂</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-subtle">地區</dt>
            <dd className="font-medium">{districts.length ? districts.join("、") : "—"}</dd>
          </div>
        </dl>

        <p className="text-sm">
          {course.classes.length === 0 ? (
            <span className="text-ink-subtle">暫時未有開班</span>
          ) : openClasses.length > 0 ? (
            <span className="text-emerald-700">
              {course.classes.length} 個班次 · 尚餘 {remaining} 個名額
            </span>
          ) : (
            <span className="text-cta-hover">全部班次額滿，可加入候補</span>
          )}
        </p>
      </div>
    </Card>
  );
}
