"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 一鍵訂閱日曆：每個用戶有一條私人訂閱連結（token），撳掣直接開 Apple 日曆 / Google 日曆 / Outlook，
 * 之後課堂有改動會自動更新。（.ics 檔案只係後備。）
 */
export function AddToCalendarButton({
  token,
  icsHref,
  label = "加入日曆",
  calName = "Educasketball 上課時間表",
}: {
  token: string | null;
  icsHref: string;
  label?: string;
  calName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  useEffect(() => setOrigin(window.location.host), []);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) =>
      !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const path = token ? `${base}/cal/${token}.ics` : null;
  const webcal = path && origin ? `webcal://${origin}${path}` : null;
  const https = path && origin ? `https://${origin}${path}` : null;
  const items: {
    label: string;
    hint: string;
    href: string;
    external?: boolean;
  }[] = [];
  if (webcal && https) {
    items.push(
      {
        label: "Apple 日曆（iPhone / Mac）",
        hint: "直接彈出「訂閱日曆」",
        href: webcal,
      },
      {
        label: "Google 日曆",
        hint: "Android / 網頁版",
        href: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`,
        external: true,
      },
      {
        label: "Outlook",
        hint: "Outlook.com / 365",
        href: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${encodeURIComponent(calName)}`,
        external: true,
      },
    );
  }

  async function copy() {
    if (!https) return;
    try {
      await navigator.clipboard.writeText(https);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("複製訂閱連結", https);
    }
  }

  return (
    <div ref={box} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
      >
        📅 {label} <span aria-hidden>▾</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 z-30 mt-2 w-72 rounded-card border border-surface-border bg-white p-1.5 shadow-lg sm:left-auto sm:right-0"
        >
          {items.map((it) => (
            <a
              key={it.label}
              role="menuitem"
              href={it.href}
              {...(it.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 hover:bg-brand-50"
            >
              <span className="block text-sm font-semibold text-ink">
                {it.label}
              </span>
              <span className="block text-xs text-ink-subtle">{it.hint}</span>
            </a>
          ))}
          <div className="my-1 border-t border-surface-border" />
          {https && (
            <button
              type="button"
              role="menuitem"
              onClick={copy}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-muted hover:bg-brand-50"
            >
              {copied ? "✓ 已複製訂閱連結" : "複製訂閱連結"}
            </button>
          )}
          <a
            role="menuitem"
            href={icsHref}
            className="block rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-brand-50"
          >
            下載 .ics 檔案（一次性）
          </a>
          <p className="px-3 pb-1.5 pt-1 text-[11px] leading-relaxed text-ink-subtle">
            訂閱後課堂有改動會自動更新；連結係你私人用，請唔好轉發。
          </p>
        </div>
      )}
    </div>
  );
}
