import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm text-ink-muted hover:text-brand-700">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {description && <div className="mt-1 text-sm text-ink-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function StatCard({ label, value, href, tone = "brand" }: { label: string; value: number | string; href?: string; tone?: "brand" | "warning" | "cta" }) {
  const body = (
    <>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-3xl font-bold",
          tone === "brand" && "text-brand-800",
          tone === "warning" && "text-amber-700",
          tone === "cta" && "text-cta-hover",
        )}
      >
        {value}
      </dd>
    </>
  );
  const cls = "block rounded-card border border-surface-border bg-white p-5 shadow-card";
  return href ? (
    <Link href={href} className={cn(cls, "transition-shadow hover:shadow-lg")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** 簡單表格外框：手機橫向捲動，唔會撐爆版面；儲存格不斷行（否則兩隻字嘅標籤如「上架」會直排） */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-card border border-surface-border bg-white shadow-card">
      <table className="w-full min-w-[40rem] text-left text-sm [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold [&_th]:text-ink-muted [&_thead]:bg-surface-muted [&_tr]:border-b [&_tr]:border-surface-border last:[&_tbody_tr]:border-0">
        {children}
      </table>
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-ink-muted">
        {children}
      </td>
    </tr>
  );
}

/** 篩選 tab（用連結，條件存喺網址） */
export function FilterTabs({ items, current }: { items: { value: string; label: string; href: string; count?: number }[]; current: string }) {
  return (
    <nav aria-label="篩選" className="mb-4 flex flex-wrap gap-1">
      {items.map((t) => (
        <Link
          key={t.value}
          href={t.href}
          aria-current={current === t.value ? "page" : undefined}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            current === t.value ? "bg-brand-700 text-white" : "bg-white text-ink-muted hover:text-brand-700",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1 opacity-70">({t.count})</span>}
        </Link>
      ))}
    </nav>
  );
}

/** 日期範圍篩選（GET form 欄位 from / to，配合 inRange 使用） */
export function DateRangeFields({ from, to, label = "日期" }: { from?: string; to?: string; label?: string }) {
  const cls = "h-11 w-full rounded-lg border border-surface-border bg-white px-3 text-sm text-ink";
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={`${label}範圍`}>
      <span className="w-full text-xs font-medium text-ink-muted">{label}</span>
      <input type="date" name="from" defaultValue={from} aria-label={`${label}由`} className={cls} />
      <span className="text-xs text-ink-subtle">至</span>
      <input type="date" name="to" defaultValue={to} aria-label={`${label}到`} className={cls} />
    </div>
  );
}

export const parseDateParam = (v: string | undefined) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

/** iso 可以係 timestamp 或 date；按香港日期比較 */
export function inRange(iso: string, from?: string, to?: string) {
  const d = iso.length > 10 ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" }) : iso;
  return (!from || d >= from) && (!to || d <= to);
}

/** 通用列表篩選列：搜尋 + 日期範圍 + 額外控制項（GET form，條件存喺網址）。 */
export function ListFilterForm({
  action,
  q,
  from,
  to,
  hidden,
  qPlaceholder,
  dateLabel,
  noDate,
  noSearch,
  children,
}: {
  action: string;
  q?: string;
  from?: string;
  to?: string;
  hidden?: Record<string, string | undefined>;
  qPlaceholder?: string;
  dateLabel?: string;
  noDate?: boolean;
  noSearch?: boolean;
  children?: ReactNode;
}) {
  const active = !!(q || from || to);
  return (
    <form action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${action}`} className="mb-4 flex flex-wrap items-center gap-2">
      {Object.entries(hidden ?? {}).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
      {!noSearch && (
        <input
          name="q"
          defaultValue={q}
          placeholder={qPlaceholder ?? "搜尋"}
          aria-label="搜尋"
          className="h-11 min-w-[12rem] flex-1 rounded-lg border border-surface-border bg-white px-3 text-sm text-ink sm:max-w-xs"
        />
      )}
      {children}
      {!noDate && <DateRangeFields from={from} to={to} label={dateLabel} />}
      <button type="submit" className="h-11 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white">
        篩選
      </button>
      {active && (
        <Link href={action} className="text-sm text-ink-muted underline-offset-2 hover:underline">
          清除
        </Link>
      )}
    </form>
  );
}
