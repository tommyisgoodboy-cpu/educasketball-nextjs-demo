import { BADGES } from "@/lib/constants";
import type { StudentBadge } from "@/lib/data/badges";
import { cn, formatTimestampDate } from "@/lib/utils";

export function BadgeList({ badges, compact = false, className }: { badges: StudentBadge[]; compact?: boolean; className?: string }) {
  if (badges.length === 0) return compact ? null : <p className="text-sm text-ink-subtle">未有徽章，繼續加油！</p>;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="技術徽章">
      {badges.map((b) => {
        const def = BADGES[b.badge_key];
        return (
          <li
            key={b.id}
            title={`${def.description}${b.note ? `｜教練評語：${b.note}` : ""}｜${formatTimestampDate(b.created_at)}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200"
          >
            <span aria-hidden>{def.icon}</span>
            {def.label}
          </li>
        );
      })}
    </ul>
  );
}
