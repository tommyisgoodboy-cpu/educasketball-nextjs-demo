import { cn } from "@/lib/utils";

/** 狀態進度條：已取消就只顯示取消 */
export function StatusSteps({ steps, current, cancelled }: { steps: { value: string; label: string }[]; current: string; cancelled?: boolean }) {
  if (cancelled) return <p className="rounded-lg bg-surface-muted px-4 py-2 text-sm text-ink-muted">已取消</p>;
  const index = steps.findIndex((s) => s.value === current);
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {steps.map((s, i) => (
        <li key={s.value} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
              i < index && "bg-emerald-600 text-white",
              i === index && "bg-brand-700 text-white",
              i > index && "bg-surface-muted text-ink-subtle",
            )}
            aria-hidden
          >
            {i < index ? "✓" : i + 1}
          </span>
          <span className={cn(i === index ? "font-semibold text-ink" : "text-ink-muted")} aria-current={i === index ? "step" : undefined}>
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="mx-1 h-px w-4 bg-surface-border sm:w-8" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
