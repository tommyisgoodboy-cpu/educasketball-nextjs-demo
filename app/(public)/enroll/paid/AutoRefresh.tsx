"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Stripe 付款後 webhook 可能慢幾秒：每 2 秒重新整理，最多 10 次 */
export function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      router.refresh();
      if (n >= 10) clearInterval(id);
    }, 2000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
