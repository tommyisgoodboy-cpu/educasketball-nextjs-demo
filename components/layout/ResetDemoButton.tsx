"use client";

import { useState, useTransition } from "react";
import { resetDemo } from "@/app/(public)/auth/actions";

/** 示範站：還原示範資料。成功會自動用返同一個試玩帳戶重新登入；冷卻 / 出錯就喺掣下面講。 */
export function ResetDemoButton({
  className,
  hint,
}: {
  className?: string;
  hint?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        className={className}
        onClick={() => {
          if (
            !confirm(
              "還原示範資料？你做過嘅改動同新註冊嘅帳戶會清走，返到初始狀態。",
            )
          )
            return;
          setError(undefined);
          start(async () => {
            const r = await resetDemo();
            if (r && "error" in r) setError(r.error);
          });
        }}
      >
        {pending ? "還原中…" : "↺ 還原示範資料"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-amber-300">
          {error}
        </p>
      )}
      {hint && !error && <p className="mt-1 text-[11px] opacity-80">{hint}</p>}
    </div>
  );
}
