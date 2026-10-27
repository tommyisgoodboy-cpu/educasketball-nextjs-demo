"use client";

import { useState, useTransition } from "react";
import { deleteVariant, saveVariant } from "@/app/(admin)/admin/products/actions";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Form";

type Variant = { id: string; size: string | null; color: string | null; stock: number };

/** 尺碼 / 顏色 / 庫存：每行獨立儲存 */
export function VariantTable({ productId, variants }: { productId: string; variants: Variant[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>尺碼、顏色同庫存</CardTitle>
      </CardHeader>
      <CardBody className="space-y-2">
        <div className="hidden grid-cols-[1fr_1fr_6rem_auto] gap-2 px-1 text-xs font-semibold text-ink-muted sm:grid">
          <span>尺碼</span>
          <span>顏色</span>
          <span>庫存</span>
          <span />
        </div>
        {variants.map((v) => (
          <VariantRow key={v.id} productId={productId} variant={v} />
        ))}
        <VariantRow productId={productId} />
        <p className="pt-2 text-xs text-ink-subtle">庫存喺訂單「已付款」時自動扣減，取消時加返。有訂單紀錄嘅款式唔可以刪除。</p>
      </CardBody>
    </Card>
  );
}

function VariantRow({ productId, variant }: { productId: string; variant?: Variant }) {
  const [v, setV] = useState({ size: variant?.size ?? "", color: variant?.color ?? "", stock: String(variant?.stock ?? "") });
  const [msg, setMsg] = useState<string>();
  const [pending, startTransition] = useTransition();
  const dirty = !variant || v.size !== (variant.size ?? "") || v.color !== (variant.color ?? "") || v.stock !== String(variant.stock);

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-surface-border p-2 sm:grid-cols-[1fr_1fr_6rem_auto] sm:border-0 sm:p-0">
      <Input aria-label="尺碼" placeholder={variant ? "" : "新尺碼，例如 M"} value={v.size} onChange={(e) => setV({ ...v, size: e.target.value })} className="h-10" />
      <Input aria-label="顏色" placeholder={variant ? "" : "顏色"} value={v.color} onChange={(e) => setV({ ...v, color: e.target.value })} className="h-10" />
      <Input aria-label="庫存" type="number" min={0} inputMode="numeric" placeholder="0" value={v.stock} onChange={(e) => setV({ ...v, stock: e.target.value })} className="h-10" />
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={variant ? "secondary" : "primary"}
          disabled={!dirty || pending || v.stock === ""}
          onClick={() =>
            startTransition(async () => {
              const r = await saveVariant(productId, { id: variant?.id, size: v.size, color: v.color, stock: Number(v.stock) });
              setMsg(r.error ?? (variant ? "已儲存" : undefined));
              if (!r.error && !variant) setV({ size: "", color: "", stock: "" });
            })
          }
        >
          {variant ? "儲存" : "新增"}
        </Button>
        {variant && (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (!confirm("刪除呢個款式？")) return;
              startTransition(async () => setMsg((await deleteVariant(productId, variant.id)).error));
            }}
          >
            刪除
          </Button>
        )}
      </div>
      {msg && <p className="col-span-full text-xs text-ink-muted">{msg}</p>}
    </div>
  );
}
