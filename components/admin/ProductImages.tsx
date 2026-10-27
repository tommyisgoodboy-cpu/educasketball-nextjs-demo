"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { setProductImages } from "@/app/(admin)/admin/products/actions";
import { SampleImagePicker } from "@/components/admin/SampleImagePicker";
import { imgSrc } from "@/lib/demoShop";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { DEMO_LOCK, DEMO_LOCK_MESSAGE } from "@/lib/demo";
import { createClient } from "@/lib/supabase/client";

/** 管理員直接由瀏覽器上載到 product-images（public bucket），再儲存 URL 列表 */
export function ProductImages({
  productId,
  images,
}: {
  productId: string;
  images: string[];
}) {
  const [list, setList] = useState(images);
  const [msg, setMsg] = useState<string>();
  const [pending, startTransition] = useTransition();

  function persist(next: string[]) {
    setList(next);
    startTransition(async () => {
      const r = await setProductImages(productId, next);
      setMsg(r.error ?? "已儲存");
    });
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    if (DEMO_LOCK) return setMsg(DEMO_LOCK_MESSAGE);
    const supabase = createClient();
    const added: string[] = [];
    setMsg("上載中…");
    for (const file of Array.from(files).slice(0, 8 - list.length)) {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      ) {
        setMsg("只接受 5MB 以內嘅 JPG、PNG、WebP");
        continue;
      }
      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type });
      if (error) {
        setMsg("上載失敗");
        continue;
      }
      added.push(
        supabase.storage.from("product-images").getPublicUrl(path).data
          .publicUrl,
      );
    }
    if (added.length) persist([...list, ...added]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>商品相（{list.length}/8）</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        {list.length > 0 && (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {list.map((src, i) => (
              <li key={src} className="space-y-1">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted">
                  <Image
                    src={imgSrc(src)}
                    alt={`商品相 ${i + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-brand-700 px-1.5 text-[10px] text-white">
                      封面
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-xs">
                  {i > 0 ? (
                    <button
                      type="button"
                      className="text-brand-700"
                      onClick={() =>
                        persist([src, ...list.filter((s) => s !== src)])
                      }
                    >
                      設為封面
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => persist(list.filter((s) => s !== src))}
                  >
                    移除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {list.length < 8 && (
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            上載相片
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={pending}
              onChange={(e) => upload(e.target.files)}
            />
          </label>
        )}
        {DEMO_LOCK && (
          <div className="space-y-2">
            <p className="text-sm font-medium">示範相庫（撳選／取消）</p>
            <SampleImagePicker
              selected={list}
              onToggle={(src) =>
                persist(
                  list.includes(src)
                    ? list.filter((s) => s !== src)
                    : [...list, src],
                )
              }
            />
          </div>
        )}
        {msg && <p className="text-sm text-ink-muted">{msg}</p>}
      </CardBody>
    </Card>
  );
}
