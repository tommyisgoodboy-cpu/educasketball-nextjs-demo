"use client";

import { useActionState } from "react";
import { useActionRedirect } from "@/components/admin/useActionRedirect";
import { saveProduct } from "@/app/(admin)/admin/products/actions";
import type { FormState } from "@/app/(admin)/admin/courses/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import { SampleImagePicker } from "@/components/admin/SampleImagePicker";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { DEMO_LOCK } from "@/lib/demo";
import type { Product } from "@/lib/supabase/types";

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, { status: "idle" });
  useActionRedirect(state);
  const err = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  return (
    <form action={action} noValidate>
      <Card>
        <CardBody className="grid gap-5">
          {state.status === "error" && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </p>
          )}
          {product && <input type="hidden" name="id" value={product.id} />}
          <Field label="商品名稱" required error={err.name}>
            {(p) => <Input {...p} name="name" defaultValue={product?.name} maxLength={100} />}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="類別" required error={err.category}>
              {(p) => (
                <Select {...p} name="category" defaultValue={product?.category ?? "training"}>
                  {Object.entries(PRODUCT_CATEGORY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="價錢（HK$）" required error={err.price}>
              {(p) => <Input {...p} name="price" type="number" min={0} step={1} inputMode="numeric" defaultValue={product?.price} />}
            </Field>
          </div>
          <Field label="簡介">
            {(p) => <Textarea {...p} name="description" rows={3} defaultValue={product?.description ?? ""} />}
          </Field>
          {!product && (
            <div className="space-y-2">
              <p className="text-sm font-medium">商品相{DEMO_LOCK ? "（示範相庫，可揀最多 8 張，第一張做封面）" : "（可選，建立後亦可以上載）"}</p>
              {DEMO_LOCK ? (
                <SampleImagePicker name="sample_images" />
              ) : (
                <p className="text-xs text-ink-subtle">建立商品後，喺商品頁上載你自己嘅相片。</p>
              )}
            </div>
          )}
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className="h-4 w-4 accent-brand-600" />
            上架（前台顯示同可以購買）
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "儲存中…" : product ? "儲存" : "建立商品"}
            </Button>
            <ButtonLink href="/admin/products" variant="ghost">
              返回
            </ButtonLink>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
