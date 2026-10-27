"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// 填表頁面本身已經有 WhatsApp 查詢掣；浮動掣喺手機會遮住輸入框，所以收埋
const FORM_PAGES = ["/enroll", "/checkout", "/cart", "/custom", "/login", "/register"];

export function HideOnFormPages({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return FORM_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ? null : <>{children}</>;
}
