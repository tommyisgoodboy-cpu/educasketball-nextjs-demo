"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadCart } from "@/app/(public)/cart/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { InlineLoading } from "@/components/ui/PageLoading";
import { useCart } from "@/lib/cart";
import type { CartLine } from "@/lib/data/shop";
import { variantLabel } from "@/lib/variant";
import { formatHKD } from "@/lib/utils";
import { ProductImage } from "./ProductImage";

/** 讀 localStorage 購物車 → server 計最新價錢同庫存 */
export function useCartLines() {
  const cart = useCart();
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const key = JSON.stringify(cart.items);

  useEffect(() => {
    let alive = true;
    loadCart(cart.items).then((l) => alive && setLines(l));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const subtotal = (lines ?? []).reduce((n, l) => n + l.price * l.qty, 0);
  const problems = (lines ?? []).filter((l) => l.qty > l.stock);
  const missing = lines ? cart.items.length - lines.length : 0;
  return { cart, lines, subtotal, problems, missing };
}

export function CartView({ loggedIn }: { loggedIn: boolean }) {
  const { cart, lines, subtotal, problems, missing } = useCartLines();

  if (lines === null) return <InlineLoading />;
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-surface-border bg-white px-6 py-14 text-center">
        <p className="font-semibold text-ink">購物車係空嘅</p>
        <ButtonLink href="/shop" variant="cta">
          去商店睇吓
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <ul className="divide-y divide-surface-border overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
        {lines.map((l) => (
          <li key={l.variantId} className="flex gap-4 p-4">
            <Link href={`/shop/${l.productId}`} className="w-20 shrink-0">
              <ProductImage src={l.image} alt={l.name} category={l.category} className="rounded-lg" sizes="80px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link href={`/shop/${l.productId}`} className="font-semibold text-ink hover:text-brand-700">
                  {l.name}
                </Link>
                <p className="text-sm text-ink-muted">
                  {variantLabel(l)} · {formatHKD(l.price)}
                </p>
                {l.qty > l.stock && (
                  <p className="text-sm text-red-600">{l.stock === 0 ? "已售罄，請移除" : `庫存只剩 ${l.stock} 件`}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <select
                  aria-label={`${l.name} 數量`}
                  value={l.qty}
                  onChange={(e) => cart.setQty(l.variantId, Number(e.target.value))}
                  className="h-10 rounded-lg border border-surface-border bg-white px-2"
                >
                  {Array.from({ length: Math.max(1, Math.min(20, Math.max(l.stock, l.qty))) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="w-20 text-right font-semibold">{formatHKD(l.price * l.qty)}</span>
                <button type="button" onClick={() => cart.remove(l.variantId)} className="text-sm text-ink-subtle hover:text-red-600">
                  移除
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Card className="self-start">
        <CardBody className="space-y-4">
          <div className="flex justify-between text-lg font-bold">
            <span>小計</span>
            <span>{formatHKD(subtotal)}</span>
          </div>
          <p className="text-sm text-ink-muted">可以喺結帳時用積分抵扣。自取或送貨都免運費。</p>
          {missing > 0 && <p className="text-sm text-amber-700">有 {missing} 款商品已經下架，已自動略過。</p>}
          {loggedIn ? (
            <ButtonLink href="/checkout" variant="cta" size="lg" fullWidth aria-disabled={problems.length > 0} className={problems.length ? "pointer-events-none opacity-50" : ""}>
              去結帳
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login?next=/checkout" variant="cta" size="lg" fullWidth>
                登入後結帳
              </ButtonLink>
              <p className="text-center text-xs text-ink-subtle">
                未有帳戶？<Link href="/register" className="font-semibold text-brand-700">免費註冊</Link>，購物車會保留。
              </p>
            </>
          )}
          <Button variant="ghost" size="sm" fullWidth onClick={() => confirm("清空購物車？") && cart.clear()}>
            清空購物車
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
