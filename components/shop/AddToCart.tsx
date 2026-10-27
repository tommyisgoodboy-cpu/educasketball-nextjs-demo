"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart";
import type { ShopVariant } from "@/lib/data/shop";
import { cn } from "@/lib/utils";

/** 揀尺碼 / 顏色 → 數量 → 加入購物車 */
export function AddToCart({ variants }: { variants: ShopVariant[] }) {
  const cart = useCart();
  const router = useRouter();
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[], [variants]);
  const colors = useMemo(() => [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[], [variants]);
  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0];
  const [size, setSize] = useState(firstInStock?.size ?? null);
  const [color, setColor] = useState(firstInStock?.color ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => v.size === size && v.color === color);
  const inCart = cart.items.find((i) => i.variantId === variant?.id)?.qty ?? 0;
  const maxQty = Math.max(0, Math.min(20, (variant?.stock ?? 0) - inCart));
  const stockOf = (s: string | null, c: string | null) => variants.find((v) => v.size === s && v.color === c)?.stock ?? 0;

  // 轉尺碼時，如果而家揀咗嘅顏色冇呢個尺碼，就自動揀一個有貨嘅顏色
  function colorFor(nextSize: string) {
    if (variants.some((v) => v.size === nextSize && v.color === color)) return color;
    return (variants.find((v) => v.size === nextSize && v.stock > 0) ?? variants.find((v) => v.size === nextSize))?.color ?? null;
  }

  function pick(nextSize: string | null, nextColor: string | null) {
    setSize(nextSize);
    setColor(nextColor);
    setQty(1);
    setAdded(false);
  }

  return (
    <div className="space-y-5">
      {sizes.length > 0 && (
        <OptionGroup label="尺碼" options={sizes} value={size} onChange={(s) => pick(s, colorFor(s))} disabledFor={(s) => !variants.some((v) => v.size === s && v.stock > 0)} />
      )}
      {colors.length > 0 && (
        <OptionGroup label="顏色" options={colors} value={color} onChange={(c) => pick(size, c)} disabledFor={(c) => stockOf(size, c) === 0} />
      )}

      <p className="text-sm text-ink-muted" aria-live="polite">
        {!variant ? "呢個組合冇貨" : variant.stock === 0 ? "已售罄" : variant.stock <= 5 ? `只剩 ${variant.stock} 件` : "有現貨"}
        {inCart > 0 && ` · 購物車已有 ${inCart} 件`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-lg border border-surface-border bg-white">
          <button type="button" aria-label="減少數量" className="h-full px-4 text-lg disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>
            −
          </button>
          <span className="w-8 text-center font-semibold" aria-label="數量">
            {qty}
          </span>
          <button type="button" aria-label="增加數量" className="h-full px-4 text-lg disabled:opacity-30" disabled={qty >= maxQty} onClick={() => setQty((q) => q + 1)}>
            ＋
          </button>
        </div>
        <Button
          variant="cta"
          size="lg"
          disabled={!variant || maxQty === 0}
          onClick={() => {
            if (!variant) return;
            cart.add(variant.id, qty);
            setAdded(true);
            setQty(1);
          }}
        >
          加入購物車
        </Button>
        <Button
          variant="primary"
          size="lg"
          disabled={!variant || maxQty === 0}
          onClick={() => {
            if (!variant) return;
            cart.add(variant.id, qty);
            router.push("/checkout");
          }}
        >
          立即購買
        </Button>
      </div>

      {added && (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          已加入購物車。
          <Link href="/cart" className="ml-2 font-semibold underline">
            去結帳 →
          </Link>
        </p>
      )}
    </div>
  );
}

function OptionGroup({ label, options, value, onChange, disabledFor }: { label: string; options: string[]; value: string | null; onChange: (v: string) => void; disabledFor: (v: string) => boolean }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "min-w-12 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              value === o ? "border-brand-600 bg-brand-50 text-brand-800" : "border-surface-border bg-white hover:border-brand-300",
              disabledFor(o) && "text-ink-subtle line-through",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
