"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { demoLogin, logout } from "@/app/(public)/auth/actions";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { ResetDemoButton } from "@/components/layout/ResetDemoButton";
import { DEMO_LOCK } from "@/lib/demo";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

export type AdminNavItem = { href: string; label: string };

const SHORT = { 管理員: "管理員", 教練: "教練", 會員家長: "家長" } as const;

/** 示範站：一鍵切換身分（後台唔使登出再登入）；而家用緊嘅身分會反白 */
function RoleSwitch({
  current,
  compact = false,
}: {
  current: string;
  compact?: boolean;
}) {
  return (
    <form
      action={demoLogin}
      aria-label="切換試玩身分"
      className={cn(
        "flex items-center",
        compact ? "gap-1" : "flex-wrap gap-1.5",
      )}
    >
      {DEMO_ACCOUNTS.map((a) => {
        const on = SHORT[a.role] === current;
        return (
          <button
            key={a.role}
            type="submit"
            name="role"
            value={a.role}
            aria-pressed={on}
            className={cn(
              "inline-flex items-center whitespace-nowrap rounded-full text-xs font-semibold",
              compact ? "h-10" : "h-8",
            )}
          >
            <span
              className={cn(
                "inline-flex h-7 items-center rounded-full px-3",
                on
                  ? "bg-brand-700 text-white"
                  : compact
                    ? "bg-cta text-white"
                    : "bg-brand-900 text-brand-100 hover:bg-brand-800",
              )}
            >
              {SHORT[a.role]}
            </span>
          </button>
        );
      })}
    </form>
  );
}

export function AdminNav({
  items,
  userLabel,
  roleLabel,
}: {
  items: AdminNavItem[];
  userLabel: string;
  roleLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const active = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* 手機頂部列：左 = 漢堡選單（左邊滑出）+ 小圖示；右 = 試玩身分切換 */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-surface-border bg-white px-3 lg:hidden">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="admin-nav"
            aria-label={open ? "關閉選單" : "開啟選單"}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-brand-700 hover:bg-brand-50"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
          <Logo iconOnlyMobile />
        </div>
        {DEMO_LOCK && <RoleSwitch current={roleLabel} compact />}
      </div>
      {/* 手機：左邊滑出嘅選單，撳背景收起 */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <nav
        id="admin-nav"
        aria-label="後台選單"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-surface-border bg-brand-950 text-brand-100 shadow-xl transition-transform duration-200",
          "lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-60 lg:max-w-none lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "invisible -translate-x-full lg:visible",
        )}
      >
        <div className="px-5 py-5 [@media(max-height:760px)]:py-3">
          <Logo inverted />
          <p className="mt-1 text-xs text-brand-300">管理後台</p>
          {DEMO_LOCK && (
            <div className="mt-3 hidden lg:block">
              <RoleSwitch current={roleLabel} />
            </div>
          )}
        </div>
        <ul className="flex-1 space-y-1 px-3 py-3 lg:py-0 [@media(max-height:760px)]:space-y-0.5">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active(item.href) ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-brand-900 hover:text-white [@media(max-height:760px)]:py-1.5",
                  active(item.href) && "bg-brand-800 text-white",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-brand-900 px-5 py-4 text-xs">
          <p className="truncate text-white">{userLabel}</p>
          <p className="text-brand-200">{roleLabel}</p>
          {DEMO_LOCK && (
            <div className="space-y-1.5 pt-1 lg:hidden">
              <p className="text-[11px] text-brand-300">切換試玩身分</p>
              <RoleSwitch current={roleLabel} />
            </div>
          )}
          {DEMO_LOCK && (
            <div className="pt-1">
              <ResetDemoButton
                className="rounded-full border border-brand-300 px-3 py-1.5 font-semibold text-brand-100 hover:bg-brand-900 disabled:opacity-60"
                hint="清走你嘅改動，返到初始示範資料"
              />
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Link
              href="/admin/guide"
              className="text-brand-100 underline-offset-2 hover:text-white hover:underline"
            >
              使用說明
            </Link>
            <Link
              href="/"
              className="text-brand-100 underline-offset-2 hover:text-white hover:underline"
            >
              返前台
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-brand-100 underline-offset-2 hover:text-white hover:underline"
              >
                登出
              </button>
            </form>
          </div>
        </div>
      </nav>
    </>
  );
}
