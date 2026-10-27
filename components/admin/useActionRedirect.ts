"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 儲存成功後去下一頁：server action 返回 { status: "success", redirectTo }，由瀏覽器端 router.push 跳轉。
 * 唔用 server action 入面嘅 redirect()：示範站喺 /demo/edu 底下（basePath），action redirect 會跳去冇 basePath 嘅網址（404）。
 */
export function useActionRedirect(state: { status: string; redirectTo?: string }) {
  const router = useRouter();
  useEffect(() => {
    if (state.status === "success" && state.redirectTo) router.push(state.redirectTo);
  }, [state, router]);
}
