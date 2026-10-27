import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import type { ClassDetail } from "@/lib/data/courses";
import { classLabel, formatDateShort, formatTime, weekdayLabel } from "@/lib/utils";

export function AvailabilityBadge({ cls }: { cls: Pick<ClassDetail, "isFull" | "remaining" | "waitlist"> }) {
  if (cls.isFull) {
    return <Badge tone="danger">已額滿{cls.waitlist > 0 && ` · ${cls.waitlist} 人候補中`}</Badge>;
  }
  return <Badge tone={cls.remaining <= 3 ? "warning" : "success"}>尚餘 {cls.remaining} 個名額</Badge>;
}

/** 課程詳情頁嘅班次列表：每行一個班，額滿就變「加入候補」 */
export function ClassList({ courseTitle, classes }: { courseTitle: string; classes: ClassDetail[] }) {
  if (classes.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-surface-border bg-white p-6 text-center text-sm text-ink-muted">
        呢個課程暫時未有開班，歡迎 WhatsApp 查詢下一期時間。
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {classes.map((cls) => (
        <li
          key={cls.id}
          className="grid gap-4 rounded-card border border-surface-border bg-white p-5 shadow-card md:grid-cols-[1fr_auto] md:items-center"
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-ink">
                {weekdayLabel(cls.weekday)} {formatTime(cls.start_time)}–{formatTime(cls.end_time)}
              </h3>
              <AvailabilityBadge cls={cls} />
            </div>
            <dl className="grid gap-x-6 gap-y-1 text-sm text-ink-muted sm:grid-cols-3">
              <div>
                <dt className="sr-only">日期</dt>
                <dd>
                  {formatDateShort(cls.start_date)} – {formatDateShort(cls.end_date)}
                </dd>
              </div>
              <div>
                <dt className="sr-only">場地</dt>
                <dd>
                  {cls.venue ? (
                    <>
                      {cls.venue.name}
                      <span className="text-ink-subtle">（{cls.venue.district}）</span>
                    </>
                  ) : (
                    "場地待定"
                  )}
                </dd>
              </div>
              <div>
                <dt className="sr-only">教練</dt>
                <dd>教練：{cls.coach?.name ?? "待定"}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <WhatsAppButton
              variant="link"
              label="查詢呢班"
              subject={classLabel(courseTitle, cls.weekday, cls.start_time)}
            />
            <ButtonLink href={`/enroll/${cls.id}`} variant={cls.isFull ? "secondary" : "cta"}>
              {cls.isFull ? "加入候補" : "立即報名"}
            </ButtonLink>
          </div>
        </li>
      ))}
    </ul>
  );
}
