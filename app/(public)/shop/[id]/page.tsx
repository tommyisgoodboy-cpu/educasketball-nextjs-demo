import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";
import { ProductImage } from "@/components/shop/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { getProduct } from "@/lib/data/shop";
import { formatHKD } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return product ? { title: product.name, description: product.description ?? undefined } : {};
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProduct((await params).id);
  if (!product) notFound();

  return (
    <Container className="py-8 sm:py-12">
      <nav aria-label="麵包屑" className="mb-6 text-sm text-ink-subtle">
        <Link href="/shop" className="hover:text-brand-700">
          商店
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-ink-muted">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <div className="space-y-3">
          <ProductImage src={product.images[0] ?? null} alt={product.name} category={product.category} className="rounded-card" sizes="(min-width: 768px) 50vw, 100vw" />
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((src) => (
                <ProductImage key={src} src={src} alt="" category={product.category} className="rounded-lg" sizes="15vw" />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-5">
          <Badge tone="aqua">{PRODUCT_CATEGORY_LABELS[product.category]}</Badge>
          <h1 className="text-3xl font-bold text-brand-800">{product.name}</h1>
          <p className="text-2xl font-bold text-ink">{formatHKD(product.price)}</p>
          {product.description && <p className="leading-relaxed text-ink-muted">{product.description}</p>}
          <div id="options" className="scroll-mt-24">
            <AddToCart variants={product.variants} />
          </div>
          <ul className="space-y-1 border-t border-surface-border pt-5 text-sm text-ink-muted">
            <li>· 會員每消費 $10 賺 1 積分</li>
            <li>· 可以喺訓練場地自取，或者送貨（免運費）</li>
            <li>· 付款可用網上付款（測試模式）或 FPS 轉數快，確認收款後安排出貨</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
