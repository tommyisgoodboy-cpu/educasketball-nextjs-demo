"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

// 頁面出錯時顯示，唔會成個網站白畫面
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-brand-800">暫時出咗啲問題</h1>
      <p className="text-ink-muted">請再試一次；如果問題持續，可以 WhatsApp 我哋。</p>
      <div className="flex gap-3">
        <Button onClick={reset}>再試一次</Button>
        <ButtonLink href="/" variant="secondary">
          返主頁
        </ButtonLink>
      </div>
    </div>
  );
}
