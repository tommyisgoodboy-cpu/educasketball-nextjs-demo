"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

/**
 * 撳之前問一次確認，再執行 server action；出錯就顯示喺確認框入面。
 * 用頁內確認框（唔用瀏覽器 confirm / alert：手機瀏覽器有時會擋咗，撳落去就變咗「冇反應」）。
 */
export function ConfirmButton({
  action,
  confirmText,
  children,
  variant = "secondary",
  size = "sm",
}: {
  action: () => Promise<{ error?: string; redirectTo?: string } | void>;
  confirmText?: string;
  children: ReactNode;
  variant?: "primary" | "cta" | "secondary" | "ghost";
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!asking) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !pending && setAsking(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [asking, pending]);

  const run = () => {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (result && "error" in result && result.error) {
        if (confirmText) setError(result.error);
        else alert(result.error);
      } else {
        setAsking(false);
        if (result && "redirectTo" in result && result.redirectTo) router.push(result.redirectTo);
      }
    });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        disabled={pending && !asking}
        onClick={() => {
          if (confirmText) {
            setError("");
            setAsking(true);
          } else run();
        }}
      >
        {pending && !asking ? "處理中…" : children}
      </Button>
      {asking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="確認"
          className="fixed inset-0 z-[60] grid place-items-center bg-black/50 px-4"
          onClick={() => !pending && setAsking(false)}
        >
          <div
            className="w-full max-w-sm whitespace-normal rounded-card bg-white p-5 text-left shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm leading-relaxed text-ink">{confirmText}</p>
            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" size="md" disabled={pending} onClick={() => setAsking(false)}>
                取消
              </Button>
              <Button variant={variant === "secondary" ? "primary" : variant} size="md" disabled={pending} onClick={run}>
                {pending ? "處理中…" : "確定"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
