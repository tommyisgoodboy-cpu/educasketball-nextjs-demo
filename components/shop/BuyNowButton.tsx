"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart";
import type { ShopProduct } from "@/lib/data/shop";

/** 商品卡上嘅「立即購買」：只有一個有貨款式就直接加入購物車去結帳；有多個尺碼 / 顏色就去商品頁揀 */
export function BuyNowButton({ product }: { product: ShopProduct }) {
  const router = useRouter();
  const cart = useCart();
  const inStock = product.variants.filter((v) => v.stock > 0);
  const soldOut = inStock.length === 0;

  function buy() {
    if (inStock.length === 1) {
      cart.add(inStock[0].id, 1);
      router.push("/checkout");
    } else {
      router.push(`/shop/${product.id}#options`);
    }
  }

  return (
    <Button type="button" variant="cta" size="sm" fullWidth onClick={buy} disabled={soldOut}>
      {soldOut ? "售罄" : "立即購買"}
    </Button>
  );
}
