import type { ComponentProps } from "react";
import { SKILL_LEVEL_LABELS } from "@/lib/constants";
import type { SkillLevel } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "aqua" | "success" | "warning" | "danger" | "cta";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-muted ring-surface-border",
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  aqua: "bg-aqua-50 text-aqua-600 ring-aqua-100",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  warning: "bg-amber-50 text-amber-800 ring-amber-100",
  danger: "bg-red-50 text-red-700 ring-red-100",
  cta: "bg-cta-soft text-cta-hover ring-orange-100",
};

export function Badge({ tone = "neutral", className, ...props }: { tone?: Tone } & ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const levelColors: Record<SkillLevel, string> = {
  starter: "bg-level-starter",
  foundation: "bg-level-foundation",
  intermediate: "bg-level-intermediate",
  elite: "bg-level-elite",
};

/** 技術等級標籤，例如「● 基礎」 */
export function LevelBadge({ level, className }: { level: SkillLevel; className?: string }) {
  return (
    <Badge tone="neutral" className={cn("bg-white", className)}>
      <span aria-hidden className={cn("h-2 w-2 rounded-full", levelColors[level])} />
      {SKILL_LEVEL_LABELS[level]}
    </Badge>
  );
}
