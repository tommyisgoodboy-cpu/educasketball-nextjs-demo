"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartButton } from "@/components/shop/CartButton";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MAIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

/** loggedIn 由 server layout 傳入（header 係 client component，唔直接讀 session） */
export function SiteHeader({ loggedIn = false, accountHref = "/account", accountLabel = "我的帳戶" }: { loggedIn?: boolean; accountHref?: string; accountLabel?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 轉頁就收起手機選單
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="sticky top-[var(--demo-bar,0px)] z-40 border-b border-surface-border bg-white/95 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav aria-label="主選單" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={
                      isActive(pathname, item.href) ? "page" : undefined
                    }
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-700",
                      isActive(pathname, item.href) &&
                        "bg-brand-50 text-brand-700",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <CartButton />
            <ButtonLink
              href={loggedIn ? accountHref : "/login"}
              variant="ghost"
              size="sm"
            >
              {loggedIn ? accountLabel : "會員登入"}
            </ButtonLink>
            <ButtonLink href="/courses" variant="cta" size="sm">
              立即報名
            </ButtonLink>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <CartButton />
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-brand-700 hover:bg-brand-50"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "關閉選單" : "打開選單"}
              onClick={() => setOpen((v) => !v)}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </Container>
      </header>

      {/* 手機：左邊滑出嘅選單（放喺 header 外，避免 backdrop-blur 令 fixed 被困） */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-[45] bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <nav
        id="mobile-nav"
        aria-label="手機選單"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto bg-white px-4 py-4 shadow-xl transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "invisible -translate-x-full",
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-brand-700 hover:bg-brand-50"
            aria-label="關閉選單"
            onClick={() => setOpen(false)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {MAIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2.5 text-base font-medium text-ink-muted hover:bg-brand-50",
              isActive(pathname, item.href) && "bg-brand-50 text-brand-700",
            )}
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-3 grid gap-2">
          <ButtonLink
            href={loggedIn ? accountHref : "/login"}
            variant="secondary"
          >
            {loggedIn ? accountLabel : "會員登入"}
          </ButtonLink>
          <ButtonLink href="/courses" variant="cta">
            立即報名
          </ButtonLink>
        </div>
      </nav>
    </>
  );
}
