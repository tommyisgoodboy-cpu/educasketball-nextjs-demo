import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPage";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImages } from "@/components/admin/ProductImages";
import { VariantTable } from "@/components/admin/VariantTable";
import { requireAdmin } from "@/lib/admin";
import { getAdminProduct } from "@/lib/data/admin-shop";

export const metadata = { title: "編輯商品" };

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const product = await getAdminProduct(id);
  if (!product) notFound();
  const { product_variants, ...rest } = product;

  return (
    <>
      <AdminPageHeader title={product.name} back={{ href: "/admin/products", label: "商品" }} />
      {saved && (
        <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          已儲存。
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <ProductForm product={rest} />
          <ProductImages productId={product.id} images={product.images} />
        </div>
        <VariantTable productId={product.id} variants={product_variants} />
      </div>
    </>
  );
}
