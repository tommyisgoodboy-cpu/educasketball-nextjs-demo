import { AdminPageHeader } from "@/components/admin/AdminPage";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "新增商品" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader title="新增商品" back={{ href: "/admin/products", label: "商品" }} description="建立後可以上載相片同設定尺碼庫存。" />
      <div className="max-w-2xl">
        <ProductForm />
      </div>
    </>
  );
}
