import Link from "next/link";
import { AdminPageHeader, EmptyRow, ListFilterForm, TableWrap } from "@/components/admin/AdminPage";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { getAdminProducts } from "@/lib/data/admin-shop";
import { formatHKD } from "@/lib/utils";
import { toggleProductActive } from "./actions";

export const metadata = { title: "商品" };

const STATES = [
  ["", "全部狀態"],
  ["active", "上架中"],
  ["inactive", "已下架"],
  ["low", "低庫存"],
  ["soldout", "售罄"],
] as const;

export default async function ProductsAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; state?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 50);
  const cat = sp.cat && sp.cat in PRODUCT_CATEGORY_LABELS ? sp.cat : "";
  const state = STATES.some(([v]) => v === sp.state) ? (sp.state ?? "") : "";
  const products = (await getAdminProducts()).filter(
    (p) =>
      (!q || p.name.toLowerCase().includes(q)) &&
      (!cat || p.category === cat) &&
      (state === "" ||
        (state === "active" && p.is_active) ||
        (state === "inactive" && !p.is_active) ||
        (state === "low" && p.lowStock) ||
        (state === "soldout" && p.totalStock === 0)),
  );
  return (
    <>
      <AdminPageHeader title="商品" description="商品資料、相片、尺碼同庫存。" actions={<ButtonLink href="/admin/products/new">＋ 新增商品</ButtonLink>} />
      <ListFilterForm action="/admin/products" q={q} qPlaceholder="搜尋商品名稱" noDate>
        <select name="cat" defaultValue={cat} aria-label="類別" className="h-11 rounded-lg border border-surface-border bg-white px-3 text-sm text-ink">
          <option value="">全部類別</option>
          {Object.entries(PRODUCT_CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select name="state" defaultValue={state} aria-label="狀態" className="h-11 rounded-lg border border-surface-border bg-white px-3 text-sm text-ink">
          {STATES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </ListFilterForm>
      <TableWrap>
        <thead>
          <tr>
            <th>商品</th>
            <th>類別</th>
            <th>價錢</th>
            <th>庫存</th>
            <th>狀態</th>
            <th className="text-right">動作</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && <EmptyRow colSpan={6}>冇符合條件嘅商品</EmptyRow>}
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/admin/products/${p.id}`} className="font-semibold text-brand-700 hover:underline">
                  {p.name}
                </Link>
                <p className="text-xs text-ink-muted">{p.images.length ? `${p.images.length} 張相` : "未有相"}</p>
              </td>
              <td>{PRODUCT_CATEGORY_LABELS[p.category]}</td>
              <td>{formatHKD(p.price)}</td>
              <td>
                {p.totalStock} 件 · {p.variantCount} 款 {p.totalStock === 0 ? <Badge tone="danger">售罄</Badge> : p.lowStock && <Badge tone="warning">有款式低庫存</Badge>}
              </td>
              <td>{p.is_active ? <Badge tone="success">上架</Badge> : <Badge>下架</Badge>}</td>
              <td className="text-right">
                <ConfirmButton variant="ghost" confirmText={p.is_active ? `下架「${p.name}」？` : undefined} action={toggleProductActive.bind(null, p.id, !p.is_active)}>
                  {p.is_active ? "下架" : "上架"}
                </ConfirmButton>
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
