import type { CalEvent } from "@/components/admin/AdminCalendar";
import type { DaySession } from "@/lib/data/admin";

/** 一堂 → 日曆事件。href 決定撳入去去邊（點名頁 / 班次頁） */
export function sessionToEvent(s: DaySession, href: string): CalEvent {
  const done = s.rosterCount > 0 && s.markedCount >= s.rosterCount;
  const badge: CalEvent["badge"] =
    s.status === "cancelled"
      ? { text: "停課", tone: "muted" }
      : done
        ? { text: "已點名", tone: "success" }
        : s.markedCount > 0
          ? { text: `已點 ${s.markedCount}/${s.rosterCount}`, tone: "warning" }
          : { text: "未點名", tone: "brand" };
  return {
    id: s.id,
    date: s.session_date,
    start: s.class.start_time,
    end: s.class.end_time,
    title: s.class.course.title,
    sub: `${s.class.venue?.name ?? "場地待定"} · ${s.class.coach?.name ?? "未有教練"} · ${s.rosterCount} 位`,
    href,
    colorKey: s.class.course_id,
    cancelled: s.status === "cancelled",
    badge,
  };
}
