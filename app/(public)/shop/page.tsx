import type { Metadata } from "next";
import { FilterTabs } from "@/components/admin/AdminPage";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductCard } from "@/components/shop/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { getProducts } from "@/lib/data/shop";
import type { ProductCategory } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "商店", description: "訓練球衣、籃球同訓練用品，會員消費可以賺積分。" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: raw } = await searchParams;
  const category = raw && raw in PRODUCT_CATEGORY_LABELS ? (raw as ProductCategory) : undefined;
  const products = await getProducts(category);

  return (
    <>
      <PageHeader
        eyebrow="商店"
        title="訓練裝備"
        description="會員每消費 $10 賺 1 積分，積分可以抵扣下次消費。付款可以用網上付款（信用卡 / 電子錢包，測試模式）或 FPS 轉數快。"
      >
        <div className="mt-5">
          <ButtonLink href="/custom" variant="secondary" size="sm">
            球隊想訂製球衣？團體訂製 →
          </ButtonLink>
        </div>
      </PageHeader>
      <Container className="py-10">
        <FilterTabs
          current={category ?? "all"}
          items={[
            { value: "all", label: "全部", href: "/shop" },
            ...Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({ value, label, href: `/shop?category=${value}` })),
          ]}
        />
        {products.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-card border border-dashed border-surface-border bg-white p-10 text-center text-ink-muted">暫時冇商品。</p>
        )}
      </Container>
    </>
  );
}
