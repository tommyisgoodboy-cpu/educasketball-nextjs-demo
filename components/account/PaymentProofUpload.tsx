"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { attachPaymentProof } from "@/app/(account)/account/orders/actions";
import { DEMO_LOCK, DEMO_LOCK_MESSAGE } from "@/lib/demo";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/** 直接由瀏覽器上載到 Storage（RLS 只准上載到自己 folder），再叫 server 記低路徑 */
export function PaymentProofUpload({ orderId, userId, hasProof }: { orderId: string; userId: string; hasProof: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<{ tone: "info" | "error" | "ok"; text: string }>();
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (DEMO_LOCK) return setStatus({ tone: "info", text: DEMO_LOCK_MESSAGE });
    if (!TYPES.includes(file.type)) return setStatus({ tone: "error", text: "只接受 JPG、PNG、WebP 或 PDF" });
    if (file.size > MAX_BYTES) return setStatus({ tone: "error", text: "檔案唔可以大過 5MB" });

    setBusy(true);
    setStatus({ tone: "info", text: "上載中…" });
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${userId}/${orderId}-${Date.now()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("payment-proofs").upload(path, file, { contentType: file.type });
    if (error) {
      setBusy(false);
      return setStatus({ tone: "error", text: "上載失敗，請再試一次" });
    }
    const result = await attachPaymentProof(orderId, path);
    setBusy(false);
    if (result.error) return setStatus({ tone: "error", text: result.error });
    setStatus({ tone: "ok", text: "已收到付款截圖，我哋核對後會更新訂單狀態。" });
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-cta px-5 py-3 text-sm font-semibold text-white hover:bg-cta-hover has-[:disabled]:opacity-50">
        {hasProof ? "重新上載付款截圖" : "上載付款截圖"}
        <input type="file" accept={TYPES.join(",")} className="sr-only" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {status && (
        <p role={status.tone === "error" ? "alert" : "status"} className={status.tone === "error" ? "text-sm text-red-600" : status.tone === "ok" ? "text-sm text-emerald-700" : "text-sm text-ink-muted"}>
          {status.text}
        </p>
      )}
    </div>
  );
}
