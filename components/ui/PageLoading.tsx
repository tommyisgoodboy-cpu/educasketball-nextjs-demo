/** 載入中骨架：避免轉頁時白畫面 */
export function PageLoading({ label = "載入中…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="skeleton-delay mx-auto w-full max-w-content animate-pulse space-y-4 px-4 py-10 sm:px-6">
      <span className="sr-only">{label}</span>
      <div className="h-8 w-48 rounded-lg bg-surface-border" />
      <div className="h-4 w-72 max-w-full rounded bg-surface-border" />
      <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 rounded-card bg-surface-border/70" />
        ))}
      </div>
    </div>
  );
}

/** 頁內載入（購物車 / 結帳）：唔再顯示一行「載入中…」文字，改用淡入骨架；快就唔會閃 */
export function InlineLoading({ label = "載入中…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="skeleton-delay animate-pulse space-y-3 py-6">
      <span className="sr-only">{label}</span>
      <div className="h-6 w-40 rounded-lg bg-surface-border" />
      <div className="h-24 rounded-card bg-surface-border/70" />
      <div className="h-24 rounded-card bg-surface-border/70" />
    </div>
  );
}
