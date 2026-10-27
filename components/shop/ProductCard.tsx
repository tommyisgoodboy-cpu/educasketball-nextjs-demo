import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import type { ShopProduct } from "@/lib/data/shop";
import { formatHKD } from "@/lib/utils";
import { BuyNowButton } from "./BuyNowButton";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: ShopProduct }) {
  const soldOut = product.totalStock === 0;
  const low = !soldOut && product.totalStock <= 5;
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-card border border-surface-border bg-white shadow-card transition-shadow hover:shadow-lg">
      <Link href={`/shop/${product.id}`} className="block flex-1">
        <ProductImage src={product.images[0] ?? null} alt={product.name} category={product.category} className="transition-transform group-hover:scale-[1.02]" />
        <div className="space-y-2 p-4 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="aqua">{PRODUCT_CATEGORY_LABELS[product.category]}</Badge>
            {soldOut && <Badge tone="danger">售罄</Badge>}
            {low && <Badge tone="warning">只剩 {product.totalStock} 件</Badge>}
          </div>
          <h3 className="font-bold text-ink">{product.name}</h3>
          <p className="font-bold text-brand-800">{formatHKD(product.price)}</p>
        </div>
      </Link>
      <div className="p-4 pt-1">
        <BuyNowButton product={product} />
      </div>
    </div>
  );
}
