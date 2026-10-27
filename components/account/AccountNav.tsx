"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(public)/auth/actions";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/account", label: "會員主頁" },
  { href: "/account/students", label: "我嘅學員" },
  { href: "/account/schedule", label: "上課時間表" },
  { href: "/account/points", label: "積分" },
  { href: "/account/orders", label: "訂單" },
];

/** adminHref：有後台權限（管理員、教練、場地管理）先會傳入，顯示「管理後台」連結 */
export function AccountNav({ adminHref }: { adminHref?: string }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/account" ? pathname === href : pathname.startsWith(href));

  return (
    <nav aria-label="會員區選單" className="lg:sticky lg:top-24">
      {/* 手機：自動換行，所有項目一次過見到；桌面：側欄 */}
      <ul className="flex flex-wrap gap-1 lg:flex-col">
        {ITEMS.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-white hover:text-brand-700 lg:px-4 lg:py-2.5",
                active(item.href) && "bg-white text-brand-700 shadow-card",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
        {adminHref && (
          <li className="shrink-0">
            <Link href={adminHref} className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-white">
              管理後台 →
            </Link>
          </li>
        )}
        <li className="shrink-0 lg:mt-4 lg:border-t lg:border-surface-border lg:pt-4">
          <form action={logout}>
            <button type="submit" className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-ink-subtle hover:bg-white hover:text-red-600">
              登出
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
